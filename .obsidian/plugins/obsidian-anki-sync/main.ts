import {
  App,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  Notice,
  MarkdownView,
  MarkdownRenderer,
  addIcon,
} from "obsidian";

// Interfaces
interface AnkiCard {
  front: string;
  back: string;
  deck: string;
  noteId?: number;
  mediaFiles: string[];
}

interface AnkiSyncPluginSettings {
  ankiConnectUrl: string;
  defaultDeck: string;
  lastSync: Record<string, number>; // filepath -> timestamp
}

const DEFAULT_SETTINGS: AnkiSyncPluginSettings = {
  ankiConnectUrl: "http://localhost:8765",
  defaultDeck: "Default",
  lastSync: {},
};

export default class AnkiSyncPlugin extends Plugin {
  settings: AnkiSyncPluginSettings;

  async onload() {
    await this.loadSettings();

    // Add custom Anki icon
    addIcon(
      "anki",
      `<svg viewBox="0 0 24 24" width="100" height="100">
            <path fill="currentColor" d="M4 2h14a2 2 0 0 1 2 2v2h-2V4H4v16h14v-2h2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m11.83 7.12l3.54 3.54-3.54 3.54-1.41-1.41 2.12-2.13-2.12-2.12 1.41-1.42M8.71 9.12L7.29 10.54l2.13 2.12-2.13 2.13 1.42 1.41 3.54-3.54-3.54-3.54Z"/>
        </svg>`,
    );

    // Add ribbon icon
    this.addRibbonIcon("anki", "Sync to Anki", async () => {
      await this.syncCurrentFile();
    });

    // Add command to sync current file
    this.addCommand({
      id: "sync-current-file-to-anki",
      name: "Sync current file to Anki",
      hotkeys: [
        {
          modifiers: ["Mod"],
          key: "a",
        },
      ],
      callback: () => this.syncCurrentFile(),
    });

    // Watch for file changes
    // NOTE: This doesn't have a save event so omitting until I figure it out
    // this.registerEvent(
    //   this.app.vault.on("modify", (file) => {
    //     if (file instanceof TFile && file.extension === "md") {
    //       this.handleFileModification(file);
    //     }
    //   }),
    // );

    this.addSettingTab(new AnkiSyncSettingTab(this.app, this));
  }

  async onunload() {
    // Cleanup
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async handleFileModification(file: TFile) {
    const lastModified = file.stat.mtime;
    const lastSync = this.settings.lastSync[file.path] || 0;

    if (lastModified > lastSync) {
      // Debounce sync for 2 seconds
      setTimeout(() => this.syncFile(file), 2000);
    }
  }

  async syncCurrentFile() {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView) {
      new Notice("No active markdown file");
      return;
    }

    await this.syncFile(activeView.file!);
  }

  async syncFile(file: TFile) {
    const content = await this.app.vault.read(file);
    const cards = await this.parseMarkdownForCards(content, file);

    if (cards.length === 0) {
      return;
    }

    try {
      await this.syncCardsToAnki(cards);
      this.settings.lastSync[file.path] = Date.now();
      await this.saveSettings();
      new Notice(`Successfully synced ${cards.length} cards to Anki`);
    } catch (error) {
      new Notice(
        "Failed to sync cards to Anki. Check if AnkiConnect is running.",
      );
      console.error(error);
    }
  }

  async syncCardsToAnki(cards: AnkiCard[]) {
    // First, sync all media files
    for (const card of cards) {
      await this.syncMediaFiles(card.mediaFiles);
    }

    // Then sync the cards
    for (const card of cards) {
      if (card.noteId) {
        await this.updateNoteInAnki(card);
      } else {
        await this.addNoteToAnki(card);
      }
    }
  }

  async findExistingNoteId(card: AnkiCard): Promise<number | null> {
    const response = await this.invokeAnkiConnect("findNotes", {
      query: `deck:"${card.deck}" "front:${card.front}"`,
    });

    if (response.length > 0) {
      return response[0];
    }
    return null;
  }

  async updateNoteInAnki(card: AnkiCard) {
    await this.invokeAnkiConnect("updateNoteFields", {
      note: {
        id: card.noteId,
        fields: {
          Front: card.front,
          Back: card.back,
        },
      },
    });
  }

  async invokeAnkiConnect(action: string, params: any = {}) {
    const response = await fetch(this.settings.ankiConnectUrl, {
      method: "POST",
      body: JSON.stringify({
        action,
        version: 6,
        params,
      }),
    });

    if (!response.ok) {
      throw new Error(`AnkiConnect ${action} failed`);
    }

    const responseData = await response.json();
    if (responseData.error) {
      throw new Error(responseData.error);
    }

    return responseData.result;
  }

  async parseMarkdownForCards(
    content: string,
    file: TFile,
  ): Promise<AnkiCard[]> {
    const cards: AnkiCard[] = [];
    const lines = content.split("\n");
    let frontContent = "";
    let backContent = "";
    let currentDeck = this.settings.defaultDeck;
    let isCollectingBack = false;
    let mediaFiles: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for deck property with proper nested deck handling
      if (line.startsWith("cards-deck:")) {
        currentDeck = line.substring("cards-deck:".length).trim();
        // Remove any quotes if present
        currentDeck = currentDeck.replace(/^["'](.+)["']$/, "$1");
        // Ensure proper deck name format
        currentDeck = this.sanitizeDeckName(currentDeck);
        continue;
      }

      // Check for media files in the line before checking for card heading
      const mediaMatches = line.match(/!\[\[(.*?)\]\]/g);
      if (mediaMatches && isCollectingBack) {
        for (const match of mediaMatches) {
          const fileName = match.slice(3, -2).split("|")[0].trim(); // Handle aliases
          mediaFiles.push(fileName);
          // Don't replace the markdown yet - we'll do it during formatting
          backContent += line + "\n";
        }
        continue;
      }

      // Check for card heading
      if (line.includes("#card") && line.startsWith("#")) {
        // If we were collecting a previous card, save it
        if (frontContent && backContent) {
          const formattedCard = await this.formatCardContent({
            front: frontContent.trim(),
            back: backContent.trim(),
            deck: currentDeck,
            mediaFiles: [...mediaFiles],
          });
          cards.push(formattedCard);
        }

        // Start new card
        frontContent = line.replace(/#card/g, "").replace(/#/g, "").trim();
        backContent = "";
        mediaFiles = [];
        isCollectingBack = true;
        continue;
      }

      // If we're collecting back content and hit a new heading, stop collecting
      if (isCollectingBack && line.startsWith("#") && !line.includes("#card")) {
        isCollectingBack = false;
        const formattedCard = await this.formatCardContent({
          front: frontContent.trim(),
          back: backContent.trim(),
          deck: currentDeck,
          mediaFiles: [...mediaFiles],
        });
        cards.push(formattedCard);
        frontContent = "";
        backContent = "";
        mediaFiles = [];
      }

      // Add content to back of card
      if (isCollectingBack && !line.startsWith("cards-deck:")) {
        backContent += line + "\n";
      }
    }

    // Add final card if exists
    if (frontContent && backContent) {
      const formattedCard = await this.formatCardContent({
        front: frontContent.trim(),
        back: backContent.trim(),
        deck: currentDeck,
        mediaFiles: [...mediaFiles],
      });
      cards.push(formattedCard);
    }

    // Find existing note IDs for updates
    for (const card of cards) {
      const noteId = await this.findExistingNoteId(card);
      if (noteId) {
        card.noteId = noteId;
      }
    }

    return cards;
  }

  sanitizeDeckName(deckName: string): string {
    // Remove extra whitespace around :: separators
    return deckName
      .split("::")
      .map((part) => part.trim())
      .join("::");
  }

  async formatCardContent(card: AnkiCard): Promise<AnkiCard> {
    // Create a temporary div for rendering
    const tempDiv = createDiv();
    tempDiv.style.display = "none";
    document.body.appendChild(tempDiv);

    try {
      // First, sync media files and get their proper Anki names
      const mediaMap = await this.syncMediaFiles(card.mediaFiles);

      // Process media files before rendering markdown
      let processedContent = card.back;
      for (const [origName, ankiName] of Object.entries(mediaMap)) {
        // Replace the Obsidian media syntax with HTML
        const mediaPattern = new RegExp(
          `!\\[\\[${origName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\|[^\\]]*)?\\]\\]`,
          "g",
        );
        processedContent = processedContent.replace(
          mediaPattern,
          `<img src="${ankiName}" style="max-width: 800px; display: block; margin: 10px auto;">`,
        );
      }

      // Render the processed markdown
      await MarkdownRenderer.renderMarkdown(
        processedContent,
        tempDiv,
        "",
        this,
      );

      // Add styling
      let html = `
                <style>
                    .card-content {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        line-height: 1.6;
                        padding: 20px;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    .card-content img {
                        max-width: 400px;
                        height: auto;
                        margin: 10px auto;
                        display: block;
                    }
                    .card-content p {
                        margin: 1em 0;
                    }
                    .card-content code {
                        background-color: #f0f0f0;
                        padding: 2px 4px;
                        border-radius: 3px;
                        font-family: monospace;
                    }
                    .card-content pre {
                        background-color: #f0f0f0;
                        padding: 10px;
                        border-radius: 5px;
                        overflow-x: auto;
                    }
                    .card-content ul, .card-content ol {
                        padding-left: 20px;
                        margin: 1em 0;
                    }
                    .card-content li {
                        margin: 0.5em 0;
                    }
                    .card-content blockquote {
                        border-left: 3px solid #ddd;
                        margin: 1em 0;
                        padding-left: 1em;
                        color: #666;
                    }
                </style>
                <div class="card-content">
                    ${tempDiv.innerHTML}
                </div>`;

      return {
        ...card,
        back: html,
      };
    } finally {
      // Clean up
      tempDiv.remove();
    }
  }

  async syncMediaFiles(mediaFiles: string[]): Promise<Record<string, string>> {
    const mediaMap: Record<string, string> = {};

    for (const fileName of mediaFiles) {
      try {
        // Resolve the file path
        const resolvedFile = this.resolveFileByName(fileName);

        if (resolvedFile instanceof TFile) {
          const arrayBuffer = await this.app.vault.readBinary(resolvedFile);
          const base64 = this.arrayBufferToBase64(arrayBuffer);

          // Ensure unique filename for Anki
          const ankiFileName = this.getUniqueAnkiFileName(resolvedFile.name);

          // Store the file in Anki
          await this.invokeAnkiConnect("storeMediaFile", {
            filename: ankiFileName,
            data: base64,
          });

          // Map original filename to Anki filename
          mediaMap[fileName] = ankiFileName;
        } else {
          throw new Error(`File not found for ${fileName}`);
        }
      } catch (error) {
        console.error(`Failed to sync media file ${fileName}:`, error);
        new Notice(`Failed to sync media file ${fileName}`);
      }
    }

    return mediaMap;
  }

  /**
   * Resolves a file by name within the Obsidian vault.
   * If multiple matches are found, throws an error.
   * @param fileName The name of the file to resolve.
   */
  private resolveFileByName(fileName: string): TFile | null {
    const allFiles = this.app.vault.getFiles();
    const matchingFiles = allFiles.filter((file) => file.name === fileName);

    if (matchingFiles.length === 0) {
      throw new Error(`No file found with the name ${fileName}`);
    }

    if (matchingFiles.length > 1) {
      throw new Error(
        `Multiple files found with the name ${fileName}: ${matchingFiles
          .map((file) => file.path)
          .join(", ")}`,
      );
    }

    return matchingFiles[0];
  }

  getUniqueAnkiFileName(originalName: string): string {
    // Get the base name without path
    const baseName = originalName.split("/").pop() || originalName;

    // Remove any special characters and spaces from filename
    const sanitizedName = baseName.replace(/[^a-zA-Z0-9.]/g, "_").toLowerCase();

    // Add timestamp to ensure uniqueness if needed
    // const timestamp = Date.now();
    // return `${timestamp}_${sanitizedName}`;

    return sanitizedName;
  }

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  async addNoteToAnki(card: AnkiCard) {
    // First ensure the deck exists
    try {
      await this.createDeckIfNeeded(card.deck);

      // Add note with proper HTML formatting
      await this.invokeAnkiConnect("addNote", {
        note: {
          deckName: card.deck,
          modelName: "Basic",
          fields: {
            Front: card.front,
            Back: card.back,
          },
          options: {
            allowDuplicate: false,
          },
          tags: ["obsidian"],
        },
      });
    } catch (error) {
      console.error("Failed to add note:", error);
      throw error;
    }
  }

  async createDeckIfNeeded(deckName: string) {
    try {
      // Get all decks
      const decks = await this.invokeAnkiConnect("deckNames", {});

      // If deck doesn't exist, create it
      if (!decks.includes(deckName)) {
        await this.invokeAnkiConnect("createDeck", {
          deck: deckName,
        });
        console.log(`Created deck: ${deckName}`);
      }
    } catch (error) {
      console.error("Failed to create deck:", error);
      throw error;
    }
  }
}

class AnkiSyncSettingTab extends PluginSettingTab {
  plugin: AnkiSyncPlugin;

  constructor(app: App, plugin: AnkiSyncPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("AnkiConnect URL")
      .setDesc("URL where AnkiConnect is running")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.ankiConnectUrl)
          .onChange(async (value) => {
            this.plugin.settings.ankiConnectUrl = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Default Deck")
      .setDesc("Default deck name for cards without a specified deck")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.defaultDeck)
          .onChange(async (value) => {
            this.plugin.settings.defaultDeck = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}
