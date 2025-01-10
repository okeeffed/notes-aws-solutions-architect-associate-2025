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
      hotkeys: [],
      callback: () => this.syncCurrentFile(),
    });

    // Watch for file changes
    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (file instanceof TFile && file.extension === "md") {
          this.handleFileModification(file);
        }
      }),
    );

    // Add settings tab
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

      // Check for deck property - now handles nested decks correctly
      if (line.startsWith("cards-deck:")) {
        currentDeck = line.split(":")[1].trim();
        // Remove any quotes if present
        currentDeck = currentDeck.replace(/^["'](.+)["']$/, "$1");
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
      if (isCollectingBack && line.startsWith("#")) {
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

  async formatCardContent(card: AnkiCard): Promise<AnkiCard> {
    // Create a temporary div for rendering
    const tempDiv = createDiv();
    tempDiv.style.display = "none";
    document.body.appendChild(tempDiv);

    try {
      // Format the back content
      await MarkdownRenderer.renderMarkdown(card.back, tempDiv, "", this);

      // Process the rendered HTML
      let html = tempDiv.innerHTML;

      // Handle image formatting
      html = html.replace(
        /<img([^>]*)>/g,
        '<div style="text-align: center;"><img$1 style="max-width: 400px; height: auto;"></div>',
      );

      // Replace relative image paths with just the filename for Anki
      html = html.replace(
        /src="([^"]+)"/g,
        (match, src) => `src="${src.split("/").pop()}"`,
      );

      // Add some basic CSS for better formatting
      html = `
                <style>
                    .card-content {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        line-height: 1.5;
                        padding: 20px;
                    }
                    code {
                        background-color: #f0f0f0;
                        padding: 2px 4px;
                        border-radius: 3px;
                        font-family: monospace;
                    }
                    pre {
                        background-color: #f0f0f0;
                        padding: 10px;
                        border-radius: 5px;
                        overflow-x: auto;
                    }
                    ul, ol {
                        padding-left: 20px;
                    }
                    blockquote {
                        border-left: 3px solid #ddd;
                        margin: 0;
                        padding-left: 1em;
                        color: #666;
                    }
                    table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 10px 0;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f5f5f5;
                    }
                </style>
                <div class="card-content">
                    ${html}
                </div>`;

      // Update the card with formatted content
      return {
        ...card,
        back: html,
      };
    } finally {
      // Clean up
      tempDiv.remove();
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

  async syncMediaFiles(mediaFiles: string[]) {
    for (const fileName of mediaFiles) {
      try {
        const file = this.app.vault.getAbstractFileByPath(fileName);
        if (file instanceof TFile) {
          const arrayBuffer = await this.app.vault.readBinary(file);
          const base64 = this.arrayBufferToBase64(arrayBuffer);

          await this.invokeAnkiConnect("storeMediaFile", {
            filename: fileName,
            data: base64,
          });
        }
      } catch (error) {
        console.error(`Failed to sync media file ${fileName}:`, error);
      }
    }
  }

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
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

  async addNoteToAnki(card: AnkiCard) {
    await this.invokeAnkiConnect("addNote", {
      note: {
        deckName: card.deck, // This will now work with nested decks like "AWS Exams::Solutions Architect::Associate"
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
