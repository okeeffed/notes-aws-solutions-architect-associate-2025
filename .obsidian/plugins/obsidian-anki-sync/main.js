'use strict';

var obsidian = require('obsidian');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const DEFAULT_SETTINGS = {
    ankiConnectUrl: "http://localhost:8765",
    defaultDeck: "Default",
    lastSync: {},
};
class AnkiSyncPlugin extends obsidian.Plugin {
    onload() {
        return __awaiter(this, undefined, undefined, function* () {
            yield this.loadSettings();
            // Add custom Anki icon
            obsidian.addIcon("anki", `<svg viewBox="0 0 24 24" width="100" height="100">
            <path fill="currentColor" d="M4 2h14a2 2 0 0 1 2 2v2h-2V4H4v16h14v-2h2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m11.83 7.12l3.54 3.54-3.54 3.54-1.41-1.41 2.12-2.13-2.12-2.12 1.41-1.42M8.71 9.12L7.29 10.54l2.13 2.12-2.13 2.13 1.42 1.41 3.54-3.54-3.54-3.54Z"/>
        </svg>`);
            // Add ribbon icon
            this.addRibbonIcon("anki", "Sync to Anki", () => __awaiter(this, undefined, undefined, function* () {
                yield this.syncCurrentFile();
            }));
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
        });
    }
    onunload() {
        return __awaiter(this, undefined, undefined, function* () {
            // Cleanup
        });
    }
    loadSettings() {
        return __awaiter(this, undefined, undefined, function* () {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
        });
    }
    saveSettings() {
        return __awaiter(this, undefined, undefined, function* () {
            yield this.saveData(this.settings);
        });
    }
    handleFileModification(file) {
        return __awaiter(this, undefined, undefined, function* () {
            const lastModified = file.stat.mtime;
            const lastSync = this.settings.lastSync[file.path] || 0;
            if (lastModified > lastSync) {
                // Debounce sync for 2 seconds
                setTimeout(() => this.syncFile(file), 2000);
            }
        });
    }
    syncCurrentFile() {
        return __awaiter(this, undefined, undefined, function* () {
            const activeView = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
            if (!activeView) {
                new obsidian.Notice("No active markdown file");
                return;
            }
            yield this.syncFile(activeView.file);
        });
    }
    syncFile(file) {
        return __awaiter(this, undefined, undefined, function* () {
            const content = yield this.app.vault.read(file);
            const cards = yield this.parseMarkdownForCards(content, file);
            if (cards.length === 0) {
                return;
            }
            try {
                yield this.syncCardsToAnki(cards);
                this.settings.lastSync[file.path] = Date.now();
                yield this.saveSettings();
                new obsidian.Notice(`Successfully synced ${cards.length} cards to Anki`);
            }
            catch (error) {
                new obsidian.Notice("Failed to sync cards to Anki. Check if AnkiConnect is running.");
                console.error(error);
            }
        });
    }
    syncCardsToAnki(cards) {
        return __awaiter(this, undefined, undefined, function* () {
            // First, sync all media files
            for (const card of cards) {
                yield this.syncMediaFiles(card.mediaFiles);
            }
            // Then sync the cards
            for (const card of cards) {
                if (card.noteId) {
                    yield this.updateNoteInAnki(card);
                }
                else {
                    yield this.addNoteToAnki(card);
                }
            }
        });
    }
    findExistingNoteId(card) {
        return __awaiter(this, undefined, undefined, function* () {
            const response = yield this.invokeAnkiConnect("findNotes", {
                query: `deck:"${card.deck}" "front:${card.front}"`,
            });
            if (response.length > 0) {
                return response[0];
            }
            return null;
        });
    }
    updateNoteInAnki(card) {
        return __awaiter(this, undefined, undefined, function* () {
            yield this.invokeAnkiConnect("updateNoteFields", {
                note: {
                    id: card.noteId,
                    fields: {
                        Front: card.front,
                        Back: card.back,
                    },
                },
            });
        });
    }
    invokeAnkiConnect(action_1) {
        return __awaiter(this, arguments, undefined, function* (action, params = {}) {
            const response = yield fetch(this.settings.ankiConnectUrl, {
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
            const responseData = yield response.json();
            if (responseData.error) {
                throw new Error(responseData.error);
            }
            return responseData.result;
        });
    }
    parseMarkdownForCards(content, file) {
        return __awaiter(this, undefined, undefined, function* () {
            const cards = [];
            const lines = content.split("\n");
            let frontContent = "";
            let backContent = "";
            let currentDeck = this.settings.defaultDeck;
            let isCollectingBack = false;
            let mediaFiles = [];
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
                        const formattedCard = yield this.formatCardContent({
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
                    const formattedCard = yield this.formatCardContent({
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
                const formattedCard = yield this.formatCardContent({
                    front: frontContent.trim(),
                    back: backContent.trim(),
                    deck: currentDeck,
                    mediaFiles: [...mediaFiles],
                });
                cards.push(formattedCard);
            }
            // Find existing note IDs for updates
            for (const card of cards) {
                const noteId = yield this.findExistingNoteId(card);
                if (noteId) {
                    card.noteId = noteId;
                }
            }
            return cards;
        });
    }
    sanitizeDeckName(deckName) {
        // Remove extra whitespace around :: separators
        return deckName
            .split("::")
            .map((part) => part.trim())
            .join("::");
    }
    formatCardContent(card) {
        return __awaiter(this, undefined, undefined, function* () {
            // Create a temporary div for rendering
            const tempDiv = createDiv();
            tempDiv.style.display = "none";
            document.body.appendChild(tempDiv);
            try {
                // First, sync media files and get their proper Anki names
                const mediaMap = yield this.syncMediaFiles(card.mediaFiles);
                // Process media files before rendering markdown
                let processedContent = card.back;
                for (const [origName, ankiName] of Object.entries(mediaMap)) {
                    // Replace the Obsidian media syntax with HTML
                    const mediaPattern = new RegExp(`!\\[\\[${origName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\|[^\\]]*)?\\]\\]`, "g");
                    processedContent = processedContent.replace(mediaPattern, `<img src="${ankiName}" style="max-width: 800px; display: block; margin: 10px auto;">`);
                }
                // Render the processed markdown
                yield obsidian.MarkdownRenderer.renderMarkdown(processedContent, tempDiv, "", this);
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
                return Object.assign(Object.assign({}, card), { back: html });
            }
            finally {
                // Clean up
                tempDiv.remove();
            }
        });
    }
    syncMediaFiles(mediaFiles) {
        return __awaiter(this, undefined, undefined, function* () {
            const mediaMap = {};
            for (const fileName of mediaFiles) {
                try {
                    const file = this.app.vault.getAbstractFileByPath(fileName);
                    if (file instanceof obsidian.TFile) {
                        const arrayBuffer = yield this.app.vault.readBinary(file);
                        const base64 = this.arrayBufferToBase64(arrayBuffer);
                        // Ensure unique filename for Anki
                        const ankiFileName = this.getUniqueAnkiFileName(fileName);
                        // Store the file in Anki
                        yield this.invokeAnkiConnect("storeMediaFile", {
                            filename: ankiFileName,
                            data: base64,
                        });
                        // Map original filename to Anki filename
                        mediaMap[fileName] = ankiFileName;
                    }
                }
                catch (error) {
                    console.error(`Failed to sync media file ${fileName}:`, error);
                    new obsidian.Notice(`Failed to sync media file ${fileName}`);
                }
            }
            return mediaMap;
        });
    }
    getUniqueAnkiFileName(originalName) {
        // Get the base name without path
        const baseName = originalName.split("/").pop() || originalName;
        // Remove any special characters and spaces from filename
        const sanitizedName = baseName.replace(/[^a-zA-Z0-9.]/g, "_").toLowerCase();
        // Add timestamp to ensure uniqueness if needed
        // const timestamp = Date.now();
        // return `${timestamp}_${sanitizedName}`;
        return sanitizedName;
    }
    arrayBufferToBase64(buffer) {
        let binary = "";
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
    addNoteToAnki(card) {
        return __awaiter(this, undefined, undefined, function* () {
            // First ensure the deck exists
            try {
                yield this.createDeckIfNeeded(card.deck);
                // Add note with proper HTML formatting
                yield this.invokeAnkiConnect("addNote", {
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
            }
            catch (error) {
                console.error("Failed to add note:", error);
                throw error;
            }
        });
    }
    createDeckIfNeeded(deckName) {
        return __awaiter(this, undefined, undefined, function* () {
            try {
                // Get all decks
                const decks = yield this.invokeAnkiConnect("deckNames", {});
                // If deck doesn't exist, create it
                if (!decks.includes(deckName)) {
                    yield this.invokeAnkiConnect("createDeck", {
                        deck: deckName,
                    });
                    console.log(`Created deck: ${deckName}`);
                }
            }
            catch (error) {
                console.error("Failed to create deck:", error);
                throw error;
            }
        });
    }
}
class AnkiSyncSettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        new obsidian.Setting(containerEl)
            .setName("AnkiConnect URL")
            .setDesc("URL where AnkiConnect is running")
            .addText((text) => text
            .setValue(this.plugin.settings.ankiConnectUrl)
            .onChange((value) => __awaiter(this, undefined, undefined, function* () {
            this.plugin.settings.ankiConnectUrl = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName("Default Deck")
            .setDesc("Default deck name for cards without a specified deck")
            .addText((text) => text
            .setValue(this.plugin.settings.defaultDeck)
            .onChange((value) => __awaiter(this, undefined, undefined, function* () {
            this.plugin.settings.defaultDeck = value;
            yield this.plugin.saveSettings();
        })));
    }
}

module.exports = AnkiSyncPlugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIm1haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlLCBTdXBwcmVzc2VkRXJyb3IsIFN5bWJvbCwgSXRlcmF0b3IgKi9cclxuXHJcbnZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24oZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwgcCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gZnVuY3Rpb24oKSB7XHJcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH1cclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcclxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcGFyYW0ocGFyYW1JbmRleCwgZGVjb3JhdG9yKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7IGRlY29yYXRvcih0YXJnZXQsIGtleSwgcGFyYW1JbmRleCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXNEZWNvcmF0ZShjdG9yLCBkZXNjcmlwdG9ySW4sIGRlY29yYXRvcnMsIGNvbnRleHRJbiwgaW5pdGlhbGl6ZXJzLCBleHRyYUluaXRpYWxpemVycykge1xyXG4gICAgZnVuY3Rpb24gYWNjZXB0KGYpIHsgaWYgKGYgIT09IHZvaWQgMCAmJiB0eXBlb2YgZiAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRnVuY3Rpb24gZXhwZWN0ZWRcIik7IHJldHVybiBmOyB9XHJcbiAgICB2YXIga2luZCA9IGNvbnRleHRJbi5raW5kLCBrZXkgPSBraW5kID09PSBcImdldHRlclwiID8gXCJnZXRcIiA6IGtpbmQgPT09IFwic2V0dGVyXCIgPyBcInNldFwiIDogXCJ2YWx1ZVwiO1xyXG4gICAgdmFyIHRhcmdldCA9ICFkZXNjcmlwdG9ySW4gJiYgY3RvciA/IGNvbnRleHRJbltcInN0YXRpY1wiXSA/IGN0b3IgOiBjdG9yLnByb3RvdHlwZSA6IG51bGw7XHJcbiAgICB2YXIgZGVzY3JpcHRvciA9IGRlc2NyaXB0b3JJbiB8fCAodGFyZ2V0ID8gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGNvbnRleHRJbi5uYW1lKSA6IHt9KTtcclxuICAgIHZhciBfLCBkb25lID0gZmFsc2U7XHJcbiAgICBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIHZhciBjb250ZXh0ID0ge307XHJcbiAgICAgICAgZm9yICh2YXIgcCBpbiBjb250ZXh0SW4pIGNvbnRleHRbcF0gPSBwID09PSBcImFjY2Vzc1wiID8ge30gOiBjb250ZXh0SW5bcF07XHJcbiAgICAgICAgZm9yICh2YXIgcCBpbiBjb250ZXh0SW4uYWNjZXNzKSBjb250ZXh0LmFjY2Vzc1twXSA9IGNvbnRleHRJbi5hY2Nlc3NbcF07XHJcbiAgICAgICAgY29udGV4dC5hZGRJbml0aWFsaXplciA9IGZ1bmN0aW9uIChmKSB7IGlmIChkb25lKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGFkZCBpbml0aWFsaXplcnMgYWZ0ZXIgZGVjb3JhdGlvbiBoYXMgY29tcGxldGVkXCIpOyBleHRyYUluaXRpYWxpemVycy5wdXNoKGFjY2VwdChmIHx8IG51bGwpKTsgfTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gKDAsIGRlY29yYXRvcnNbaV0pKGtpbmQgPT09IFwiYWNjZXNzb3JcIiA/IHsgZ2V0OiBkZXNjcmlwdG9yLmdldCwgc2V0OiBkZXNjcmlwdG9yLnNldCB9IDogZGVzY3JpcHRvcltrZXldLCBjb250ZXh0KTtcclxuICAgICAgICBpZiAoa2luZCA9PT0gXCJhY2Nlc3NvclwiKSB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IHZvaWQgMCkgY29udGludWU7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IG51bGwgfHwgdHlwZW9mIHJlc3VsdCAhPT0gXCJvYmplY3RcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdCBleHBlY3RlZFwiKTtcclxuICAgICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LmdldCkpIGRlc2NyaXB0b3IuZ2V0ID0gXztcclxuICAgICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LnNldCkpIGRlc2NyaXB0b3Iuc2V0ID0gXztcclxuICAgICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LmluaXQpKSBpbml0aWFsaXplcnMudW5zaGlmdChfKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoXyA9IGFjY2VwdChyZXN1bHQpKSB7XHJcbiAgICAgICAgICAgIGlmIChraW5kID09PSBcImZpZWxkXCIpIGluaXRpYWxpemVycy51bnNoaWZ0KF8pO1xyXG4gICAgICAgICAgICBlbHNlIGRlc2NyaXB0b3Jba2V5XSA9IF87XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHRhcmdldCkgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgY29udGV4dEluLm5hbWUsIGRlc2NyaXB0b3IpO1xyXG4gICAgZG9uZSA9IHRydWU7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19ydW5Jbml0aWFsaXplcnModGhpc0FyZywgaW5pdGlhbGl6ZXJzLCB2YWx1ZSkge1xyXG4gICAgdmFyIHVzZVZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA+IDI7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluaXRpYWxpemVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhbHVlID0gdXNlVmFsdWUgPyBpbml0aWFsaXplcnNbaV0uY2FsbCh0aGlzQXJnLCB2YWx1ZSkgOiBpbml0aWFsaXplcnNbaV0uY2FsbCh0aGlzQXJnKTtcclxuICAgIH1cclxuICAgIHJldHVybiB1c2VWYWx1ZSA/IHZhbHVlIDogdm9pZCAwO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcHJvcEtleSh4KSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIHggPT09IFwic3ltYm9sXCIgPyB4IDogXCJcIi5jb25jYXQoeCk7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zZXRGdW5jdGlvbk5hbWUoZiwgbmFtZSwgcHJlZml4KSB7XHJcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09IFwic3ltYm9sXCIpIG5hbWUgPSBuYW1lLmRlc2NyaXB0aW9uID8gXCJbXCIuY29uY2F0KG5hbWUuZGVzY3JpcHRpb24sIFwiXVwiKSA6IFwiXCI7XHJcbiAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KGYsIFwibmFtZVwiLCB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSwgdmFsdWU6IHByZWZpeCA/IFwiXCIuY29uY2F0KHByZWZpeCwgXCIgXCIsIG5hbWUpIDogbmFtZSB9KTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGcgPSBPYmplY3QuY3JlYXRlKCh0eXBlb2YgSXRlcmF0b3IgPT09IFwiZnVuY3Rpb25cIiA/IEl0ZXJhdG9yIDogT2JqZWN0KS5wcm90b3R5cGUpO1xyXG4gICAgcmV0dXJuIGcubmV4dCA9IHZlcmIoMCksIGdbXCJ0aHJvd1wiXSA9IHZlcmIoMSksIGdbXCJyZXR1cm5cIl0gPSB2ZXJiKDIpLCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcclxuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XHJcbiAgICAgICAgd2hpbGUgKGcgJiYgKGcgPSAwLCBvcFswXSAmJiAoXyA9IDApKSwgXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fY3JlYXRlQmluZGluZyA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XHJcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xyXG4gICAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xyXG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIG9bazJdID0gbVtrXTtcclxufSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHBvcnRTdGFyKG0sIG8pIHtcclxuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKHAgIT09IFwiZGVmYXVsdFwiICYmICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobywgcCkpIF9fY3JlYXRlQmluZGluZyhvLCBtLCBwKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fdmFsdWVzKG8pIHtcclxuICAgIHZhciBzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciwgbSA9IHMgJiYgb1tzXSwgaSA9IDA7XHJcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcclxuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcclxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZWFkKG8sIG4pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXTtcclxuICAgIGlmICghbSkgcmV0dXJuIG87XHJcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyb3IpIHsgZSA9IHsgZXJyb3I6IGVycm9yIH07IH1cclxuICAgIGZpbmFsbHkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChyICYmICFyLmRvbmUgJiYgKG0gPSBpW1wicmV0dXJuXCJdKSkgbS5jYWxsKGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuLyoqIEBkZXByZWNhdGVkICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZCgpIHtcclxuICAgIGZvciAodmFyIGFyID0gW10sIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIGFyID0gYXIuY29uY2F0KF9fcmVhZChhcmd1bWVudHNbaV0pKTtcclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuLyoqIEBkZXByZWNhdGVkICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5cygpIHtcclxuICAgIGZvciAodmFyIHMgPSAwLCBpID0gMCwgaWwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgaWw7IGkrKykgcyArPSBhcmd1bWVudHNbaV0ubGVuZ3RoO1xyXG4gICAgZm9yICh2YXIgciA9IEFycmF5KHMpLCBrID0gMCwgaSA9IDA7IGkgPCBpbDsgaSsrKVxyXG4gICAgICAgIGZvciAodmFyIGEgPSBhcmd1bWVudHNbaV0sIGogPSAwLCBqbCA9IGEubGVuZ3RoOyBqIDwgamw7IGorKywgaysrKVxyXG4gICAgICAgICAgICByW2tdID0gYVtqXTtcclxuICAgIHJldHVybiByO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheSh0bywgZnJvbSwgcGFjaykge1xyXG4gICAgaWYgKHBhY2sgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gMikgZm9yICh2YXIgaSA9IDAsIGwgPSBmcm9tLmxlbmd0aCwgYXI7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICBpZiAoYXIgfHwgIShpIGluIGZyb20pKSB7XHJcbiAgICAgICAgICAgIGlmICghYXIpIGFyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSwgMCwgaSk7XHJcbiAgICAgICAgICAgIGFyW2ldID0gZnJvbVtpXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdG8uY29uY2F0KGFyIHx8IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20pKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXQodikge1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBfX2F3YWl0ID8gKHRoaXMudiA9IHYsIHRoaXMpIDogbmV3IF9fYXdhaXQodik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jR2VuZXJhdG9yKHRoaXNBcmcsIF9hcmd1bWVudHMsIGdlbmVyYXRvcikge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBnID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pLCBpLCBxID0gW107XHJcbiAgICByZXR1cm4gaSA9IE9iamVjdC5jcmVhdGUoKHR5cGVvZiBBc3luY0l0ZXJhdG9yID09PSBcImZ1bmN0aW9uXCIgPyBBc3luY0l0ZXJhdG9yIDogT2JqZWN0KS5wcm90b3R5cGUpLCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIsIGF3YWl0UmV0dXJuKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gYXdhaXRSZXR1cm4oZikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGYsIHJlamVjdCk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpZiAoZ1tuXSkgeyBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7IHEucHVzaChbbiwgdiwgYSwgYl0pID4gMSB8fCByZXN1bWUobiwgdik7IH0pOyB9OyBpZiAoZikgaVtuXSA9IGYoaVtuXSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyB9XHJcbiAgICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpIHsgcmVzdW1lKFwidGhyb3dcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcclxuICAgIHZhciBpLCBwO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiLCBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9KSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpW25dID0gb1tuXSA/IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IGZhbHNlIH0gOiBmID8gZih2KSA6IHY7IH0gOiBmOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jVmFsdWVzKG8pIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgbSA9IG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdLCBpO1xyXG4gICAgcmV0dXJuIG0gPyBtLmNhbGwobykgOiAobyA9IHR5cGVvZiBfX3ZhbHVlcyA9PT0gXCJmdW5jdGlvblwiID8gX192YWx1ZXMobykgOiBvW1N5bWJvbC5pdGVyYXRvcl0oKSwgaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGkpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlbbl0gPSBvW25dICYmIGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IHYgPSBvW25dKHYpLCBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCB2LmRvbmUsIHYudmFsdWUpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgZCwgdikgeyBQcm9taXNlLnJlc29sdmUodikudGhlbihmdW5jdGlvbih2KSB7IHJlc29sdmUoeyB2YWx1ZTogdiwgZG9uZTogZCB9KTsgfSwgcmVqZWN0KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tYWtlVGVtcGxhdGVPYmplY3QoY29va2VkLCByYXcpIHtcclxuICAgIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvb2tlZCwgXCJyYXdcIiwgeyB2YWx1ZTogcmF3IH0pOyB9IGVsc2UgeyBjb29rZWQucmF3ID0gcmF3OyB9XHJcbiAgICByZXR1cm4gY29va2VkO1xyXG59O1xyXG5cclxudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xyXG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcclxufTtcclxuXHJcbnZhciBvd25LZXlzID0gZnVuY3Rpb24obykge1xyXG4gICAgb3duS2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIChvKSB7XHJcbiAgICAgICAgdmFyIGFyID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgayBpbiBvKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIGspKSBhclthci5sZW5ndGhdID0gaztcclxuICAgICAgICByZXR1cm4gYXI7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIG93bktleXMobyk7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnRTdGFyKG1vZCkge1xyXG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayA9IG93bktleXMobW9kKSwgaSA9IDA7IGkgPCBrLmxlbmd0aDsgaSsrKSBpZiAoa1tpXSAhPT0gXCJkZWZhdWx0XCIpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwga1tpXSk7XHJcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0RGVmYXVsdChtb2QpIHtcclxuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgZGVmYXVsdDogbW9kIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHJlY2VpdmVyLCBzdGF0ZSwga2luZCwgZikge1xyXG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgZ2V0dGVyXCIpO1xyXG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgIT09IHN0YXRlIHx8ICFmIDogIXN0YXRlLmhhcyhyZWNlaXZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgcmVhZCBwcml2YXRlIG1lbWJlciBmcm9tIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XHJcbiAgICByZXR1cm4ga2luZCA9PT0gXCJtXCIgPyBmIDoga2luZCA9PT0gXCJhXCIgPyBmLmNhbGwocmVjZWl2ZXIpIDogZiA/IGYudmFsdWUgOiBzdGF0ZS5nZXQocmVjZWl2ZXIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZFNldChyZWNlaXZlciwgc3RhdGUsIHZhbHVlLCBraW5kLCBmKSB7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJtXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIG1ldGhvZCBpcyBub3Qgd3JpdGFibGVcIik7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBzZXR0ZXJcIik7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB3cml0ZSBwcml2YXRlIG1lbWJlciB0byBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xyXG4gICAgcmV0dXJuIChraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlciwgdmFsdWUpIDogZiA/IGYudmFsdWUgPSB2YWx1ZSA6IHN0YXRlLnNldChyZWNlaXZlciwgdmFsdWUpKSwgdmFsdWU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkSW4oc3RhdGUsIHJlY2VpdmVyKSB7XHJcbiAgICBpZiAocmVjZWl2ZXIgPT09IG51bGwgfHwgKHR5cGVvZiByZWNlaXZlciAhPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcmVjZWl2ZXIgIT09IFwiZnVuY3Rpb25cIikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgdXNlICdpbicgb3BlcmF0b3Igb24gbm9uLW9iamVjdFwiKTtcclxuICAgIHJldHVybiB0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyID09PSBzdGF0ZSA6IHN0YXRlLmhhcyhyZWNlaXZlcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FkZERpc3Bvc2FibGVSZXNvdXJjZShlbnYsIHZhbHVlLCBhc3luYykge1xyXG4gICAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB2b2lkIDApIHtcclxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0IGV4cGVjdGVkLlwiKTtcclxuICAgICAgICB2YXIgZGlzcG9zZSwgaW5uZXI7XHJcbiAgICAgICAgaWYgKGFzeW5jKSB7XHJcbiAgICAgICAgICAgIGlmICghU3ltYm9sLmFzeW5jRGlzcG9zZSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0Rpc3Bvc2UgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgICAgICAgICBkaXNwb3NlID0gdmFsdWVbU3ltYm9sLmFzeW5jRGlzcG9zZV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkaXNwb3NlID09PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgaWYgKCFTeW1ib2wuZGlzcG9zZSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5kaXNwb3NlIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgICAgICAgICAgZGlzcG9zZSA9IHZhbHVlW1N5bWJvbC5kaXNwb3NlXTtcclxuICAgICAgICAgICAgaWYgKGFzeW5jKSBpbm5lciA9IGRpc3Bvc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgZGlzcG9zZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0IG5vdCBkaXNwb3NhYmxlLlwiKTtcclxuICAgICAgICBpZiAoaW5uZXIpIGRpc3Bvc2UgPSBmdW5jdGlvbigpIHsgdHJ5IHsgaW5uZXIuY2FsbCh0aGlzKTsgfSBjYXRjaCAoZSkgeyByZXR1cm4gUHJvbWlzZS5yZWplY3QoZSk7IH0gfTtcclxuICAgICAgICBlbnYuc3RhY2sucHVzaCh7IHZhbHVlOiB2YWx1ZSwgZGlzcG9zZTogZGlzcG9zZSwgYXN5bmM6IGFzeW5jIH0pO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoYXN5bmMpIHtcclxuICAgICAgICBlbnYuc3RhY2sucHVzaCh7IGFzeW5jOiB0cnVlIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG5cclxufVxyXG5cclxudmFyIF9TdXBwcmVzc2VkRXJyb3IgPSB0eXBlb2YgU3VwcHJlc3NlZEVycm9yID09PSBcImZ1bmN0aW9uXCIgPyBTdXBwcmVzc2VkRXJyb3IgOiBmdW5jdGlvbiAoZXJyb3IsIHN1cHByZXNzZWQsIG1lc3NhZ2UpIHtcclxuICAgIHZhciBlID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgcmV0dXJuIGUubmFtZSA9IFwiU3VwcHJlc3NlZEVycm9yXCIsIGUuZXJyb3IgPSBlcnJvciwgZS5zdXBwcmVzc2VkID0gc3VwcHJlc3NlZCwgZTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2Rpc3Bvc2VSZXNvdXJjZXMoZW52KSB7XHJcbiAgICBmdW5jdGlvbiBmYWlsKGUpIHtcclxuICAgICAgICBlbnYuZXJyb3IgPSBlbnYuaGFzRXJyb3IgPyBuZXcgX1N1cHByZXNzZWRFcnJvcihlLCBlbnYuZXJyb3IsIFwiQW4gZXJyb3Igd2FzIHN1cHByZXNzZWQgZHVyaW5nIGRpc3Bvc2FsLlwiKSA6IGU7XHJcbiAgICAgICAgZW52Lmhhc0Vycm9yID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIHZhciByLCBzID0gMDtcclxuICAgIGZ1bmN0aW9uIG5leHQoKSB7XHJcbiAgICAgICAgd2hpbGUgKHIgPSBlbnYuc3RhY2sucG9wKCkpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGlmICghci5hc3luYyAmJiBzID09PSAxKSByZXR1cm4gcyA9IDAsIGVudi5zdGFjay5wdXNoKHIpLCBQcm9taXNlLnJlc29sdmUoKS50aGVuKG5leHQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHIuZGlzcG9zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSByLmRpc3Bvc2UuY2FsbChyLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoci5hc3luYykgcmV0dXJuIHMgfD0gMiwgUHJvbWlzZS5yZXNvbHZlKHJlc3VsdCkudGhlbihuZXh0LCBmdW5jdGlvbihlKSB7IGZhaWwoZSk7IHJldHVybiBuZXh0KCk7IH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBzIHw9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGZhaWwoZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHMgPT09IDEpIHJldHVybiBlbnYuaGFzRXJyb3IgPyBQcm9taXNlLnJlamVjdChlbnYuZXJyb3IpIDogUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgaWYgKGVudi5oYXNFcnJvcikgdGhyb3cgZW52LmVycm9yO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5leHQoKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmV3cml0ZVJlbGF0aXZlSW1wb3J0RXh0ZW5zaW9uKHBhdGgsIHByZXNlcnZlSnN4KSB7XHJcbiAgICBpZiAodHlwZW9mIHBhdGggPT09IFwic3RyaW5nXCIgJiYgL15cXC5cXC4/XFwvLy50ZXN0KHBhdGgpKSB7XHJcbiAgICAgICAgcmV0dXJuIHBhdGgucmVwbGFjZSgvXFwuKHRzeCkkfCgoPzpcXC5kKT8pKCg/OlxcLlteLi9dKz8pPylcXC4oW2NtXT8pdHMkL2ksIGZ1bmN0aW9uIChtLCB0c3gsIGQsIGV4dCwgY20pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRzeCA/IHByZXNlcnZlSnN4ID8gXCIuanN4XCIgOiBcIi5qc1wiIDogZCAmJiAoIWV4dCB8fCAhY20pID8gbSA6IChkICsgZXh0ICsgXCIuXCIgKyBjbS50b0xvd2VyQ2FzZSgpICsgXCJqc1wiKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiBwYXRoO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgICBfX2V4dGVuZHM6IF9fZXh0ZW5kcyxcclxuICAgIF9fYXNzaWduOiBfX2Fzc2lnbixcclxuICAgIF9fcmVzdDogX19yZXN0LFxyXG4gICAgX19kZWNvcmF0ZTogX19kZWNvcmF0ZSxcclxuICAgIF9fcGFyYW06IF9fcGFyYW0sXHJcbiAgICBfX2VzRGVjb3JhdGU6IF9fZXNEZWNvcmF0ZSxcclxuICAgIF9fcnVuSW5pdGlhbGl6ZXJzOiBfX3J1bkluaXRpYWxpemVycyxcclxuICAgIF9fcHJvcEtleTogX19wcm9wS2V5LFxyXG4gICAgX19zZXRGdW5jdGlvbk5hbWU6IF9fc2V0RnVuY3Rpb25OYW1lLFxyXG4gICAgX19tZXRhZGF0YTogX19tZXRhZGF0YSxcclxuICAgIF9fYXdhaXRlcjogX19hd2FpdGVyLFxyXG4gICAgX19nZW5lcmF0b3I6IF9fZ2VuZXJhdG9yLFxyXG4gICAgX19jcmVhdGVCaW5kaW5nOiBfX2NyZWF0ZUJpbmRpbmcsXHJcbiAgICBfX2V4cG9ydFN0YXI6IF9fZXhwb3J0U3RhcixcclxuICAgIF9fdmFsdWVzOiBfX3ZhbHVlcyxcclxuICAgIF9fcmVhZDogX19yZWFkLFxyXG4gICAgX19zcHJlYWQ6IF9fc3ByZWFkLFxyXG4gICAgX19zcHJlYWRBcnJheXM6IF9fc3ByZWFkQXJyYXlzLFxyXG4gICAgX19zcHJlYWRBcnJheTogX19zcHJlYWRBcnJheSxcclxuICAgIF9fYXdhaXQ6IF9fYXdhaXQsXHJcbiAgICBfX2FzeW5jR2VuZXJhdG9yOiBfX2FzeW5jR2VuZXJhdG9yLFxyXG4gICAgX19hc3luY0RlbGVnYXRvcjogX19hc3luY0RlbGVnYXRvcixcclxuICAgIF9fYXN5bmNWYWx1ZXM6IF9fYXN5bmNWYWx1ZXMsXHJcbiAgICBfX21ha2VUZW1wbGF0ZU9iamVjdDogX19tYWtlVGVtcGxhdGVPYmplY3QsXHJcbiAgICBfX2ltcG9ydFN0YXI6IF9faW1wb3J0U3RhcixcclxuICAgIF9faW1wb3J0RGVmYXVsdDogX19pbXBvcnREZWZhdWx0LFxyXG4gICAgX19jbGFzc1ByaXZhdGVGaWVsZEdldDogX19jbGFzc1ByaXZhdGVGaWVsZEdldCxcclxuICAgIF9fY2xhc3NQcml2YXRlRmllbGRTZXQ6IF9fY2xhc3NQcml2YXRlRmllbGRTZXQsXHJcbiAgICBfX2NsYXNzUHJpdmF0ZUZpZWxkSW46IF9fY2xhc3NQcml2YXRlRmllbGRJbixcclxuICAgIF9fYWRkRGlzcG9zYWJsZVJlc291cmNlOiBfX2FkZERpc3Bvc2FibGVSZXNvdXJjZSxcclxuICAgIF9fZGlzcG9zZVJlc291cmNlczogX19kaXNwb3NlUmVzb3VyY2VzLFxyXG4gICAgX19yZXdyaXRlUmVsYXRpdmVJbXBvcnRFeHRlbnNpb246IF9fcmV3cml0ZVJlbGF0aXZlSW1wb3J0RXh0ZW5zaW9uLFxyXG59O1xyXG4iLCJpbXBvcnQge1xuICBBcHAsXG4gIFBsdWdpbixcbiAgUGx1Z2luU2V0dGluZ1RhYixcbiAgU2V0dGluZyxcbiAgVEZpbGUsXG4gIE5vdGljZSxcbiAgTWFya2Rvd25WaWV3LFxuICBNYXJrZG93blJlbmRlcmVyLFxuICBhZGRJY29uLFxufSBmcm9tIFwib2JzaWRpYW5cIjtcblxuLy8gSW50ZXJmYWNlc1xuaW50ZXJmYWNlIEFua2lDYXJkIHtcbiAgZnJvbnQ6IHN0cmluZztcbiAgYmFjazogc3RyaW5nO1xuICBkZWNrOiBzdHJpbmc7XG4gIG5vdGVJZD86IG51bWJlcjtcbiAgbWVkaWFGaWxlczogc3RyaW5nW107XG59XG5cbmludGVyZmFjZSBBbmtpU3luY1BsdWdpblNldHRpbmdzIHtcbiAgYW5raUNvbm5lY3RVcmw6IHN0cmluZztcbiAgZGVmYXVsdERlY2s6IHN0cmluZztcbiAgbGFzdFN5bmM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj47IC8vIGZpbGVwYXRoIC0+IHRpbWVzdGFtcFxufVxuXG5jb25zdCBERUZBVUxUX1NFVFRJTkdTOiBBbmtpU3luY1BsdWdpblNldHRpbmdzID0ge1xuICBhbmtpQ29ubmVjdFVybDogXCJodHRwOi8vbG9jYWxob3N0Ojg3NjVcIixcbiAgZGVmYXVsdERlY2s6IFwiRGVmYXVsdFwiLFxuICBsYXN0U3luYzoge30sXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBbmtpU3luY1BsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG4gIHNldHRpbmdzOiBBbmtpU3luY1BsdWdpblNldHRpbmdzO1xuXG4gIGFzeW5jIG9ubG9hZCgpIHtcbiAgICBhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xuXG4gICAgLy8gQWRkIGN1c3RvbSBBbmtpIGljb25cbiAgICBhZGRJY29uKFxuICAgICAgXCJhbmtpXCIsXG4gICAgICBgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIxMDBcIiBoZWlnaHQ9XCIxMDBcIj5cbiAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTQgMmgxNGEyIDIgMCAwIDEgMiAydjJoLTJWNEg0djE2aDE0di0yaDJ2MmEyIDIgMCAwIDEtMiAySDRhMiAyIDAgMCAxLTItMlY0YTIgMiAwIDAgMSAyLTJtMTEuODMgNy4xMmwzLjU0IDMuNTQtMy41NCAzLjU0LTEuNDEtMS40MSAyLjEyLTIuMTMtMi4xMi0yLjEyIDEuNDEtMS40Mk04LjcxIDkuMTJMNy4yOSAxMC41NGwyLjEzIDIuMTItMi4xMyAyLjEzIDEuNDIgMS40MSAzLjU0LTMuNTQtMy41NC0zLjU0WlwiLz5cbiAgICAgICAgPC9zdmc+YCxcbiAgICApO1xuXG4gICAgLy8gQWRkIHJpYmJvbiBpY29uXG4gICAgdGhpcy5hZGRSaWJib25JY29uKFwiYW5raVwiLCBcIlN5bmMgdG8gQW5raVwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCB0aGlzLnN5bmNDdXJyZW50RmlsZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gQWRkIGNvbW1hbmQgdG8gc3luYyBjdXJyZW50IGZpbGVcbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6IFwic3luYy1jdXJyZW50LWZpbGUtdG8tYW5raVwiLFxuICAgICAgbmFtZTogXCJTeW5jIGN1cnJlbnQgZmlsZSB0byBBbmtpXCIsXG4gICAgICBob3RrZXlzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBtb2RpZmllcnM6IFtcIk1vZFwiXSxcbiAgICAgICAgICBrZXk6IFwiYVwiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnN5bmNDdXJyZW50RmlsZSgpLFxuICAgIH0pO1xuXG4gICAgLy8gV2F0Y2ggZm9yIGZpbGUgY2hhbmdlc1xuICAgIC8vIE5PVEU6IFRoaXMgZG9lc24ndCBoYXZlIGEgc2F2ZSBldmVudCBzbyBvbWl0dGluZyB1bnRpbCBJIGZpZ3VyZSBpdCBvdXRcbiAgICAvLyB0aGlzLnJlZ2lzdGVyRXZlbnQoXG4gICAgLy8gICB0aGlzLmFwcC52YXVsdC5vbihcIm1vZGlmeVwiLCAoZmlsZSkgPT4ge1xuICAgIC8vICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlICYmIGZpbGUuZXh0ZW5zaW9uID09PSBcIm1kXCIpIHtcbiAgICAvLyAgICAgICB0aGlzLmhhbmRsZUZpbGVNb2RpZmljYXRpb24oZmlsZSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgIH0pLFxuICAgIC8vICk7XG5cbiAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IEFua2lTeW5jU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xuICB9XG5cbiAgYXN5bmMgb251bmxvYWQoKSB7XG4gICAgLy8gQ2xlYW51cFxuICB9XG5cbiAgYXN5bmMgbG9hZFNldHRpbmdzKCkge1xuICAgIHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xuICB9XG5cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCkge1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gIH1cblxuICBhc3luYyBoYW5kbGVGaWxlTW9kaWZpY2F0aW9uKGZpbGU6IFRGaWxlKSB7XG4gICAgY29uc3QgbGFzdE1vZGlmaWVkID0gZmlsZS5zdGF0Lm10aW1lO1xuICAgIGNvbnN0IGxhc3RTeW5jID0gdGhpcy5zZXR0aW5ncy5sYXN0U3luY1tmaWxlLnBhdGhdIHx8IDA7XG5cbiAgICBpZiAobGFzdE1vZGlmaWVkID4gbGFzdFN5bmMpIHtcbiAgICAgIC8vIERlYm91bmNlIHN5bmMgZm9yIDIgc2Vjb25kc1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnN5bmNGaWxlKGZpbGUpLCAyMDAwKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzeW5jQ3VycmVudEZpbGUoKSB7XG4gICAgY29uc3QgYWN0aXZlVmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG4gICAgaWYgKCFhY3RpdmVWaWV3KSB7XG4gICAgICBuZXcgTm90aWNlKFwiTm8gYWN0aXZlIG1hcmtkb3duIGZpbGVcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5zeW5jRmlsZShhY3RpdmVWaWV3LmZpbGUhKTtcbiAgfVxuXG4gIGFzeW5jIHN5bmNGaWxlKGZpbGU6IFRGaWxlKSB7XG4gICAgY29uc3QgY29udGVudCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LnJlYWQoZmlsZSk7XG4gICAgY29uc3QgY2FyZHMgPSBhd2FpdCB0aGlzLnBhcnNlTWFya2Rvd25Gb3JDYXJkcyhjb250ZW50LCBmaWxlKTtcblxuICAgIGlmIChjYXJkcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5zeW5jQ2FyZHNUb0Fua2koY2FyZHMpO1xuICAgICAgdGhpcy5zZXR0aW5ncy5sYXN0U3luY1tmaWxlLnBhdGhdID0gRGF0ZS5ub3coKTtcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKCk7XG4gICAgICBuZXcgTm90aWNlKGBTdWNjZXNzZnVsbHkgc3luY2VkICR7Y2FyZHMubGVuZ3RofSBjYXJkcyB0byBBbmtpYCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG5ldyBOb3RpY2UoXG4gICAgICAgIFwiRmFpbGVkIHRvIHN5bmMgY2FyZHMgdG8gQW5raS4gQ2hlY2sgaWYgQW5raUNvbm5lY3QgaXMgcnVubmluZy5cIixcbiAgICAgICk7XG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzeW5jQ2FyZHNUb0Fua2koY2FyZHM6IEFua2lDYXJkW10pIHtcbiAgICAvLyBGaXJzdCwgc3luYyBhbGwgbWVkaWEgZmlsZXNcbiAgICBmb3IgKGNvbnN0IGNhcmQgb2YgY2FyZHMpIHtcbiAgICAgIGF3YWl0IHRoaXMuc3luY01lZGlhRmlsZXMoY2FyZC5tZWRpYUZpbGVzKTtcbiAgICB9XG5cbiAgICAvLyBUaGVuIHN5bmMgdGhlIGNhcmRzXG4gICAgZm9yIChjb25zdCBjYXJkIG9mIGNhcmRzKSB7XG4gICAgICBpZiAoY2FyZC5ub3RlSWQpIHtcbiAgICAgICAgYXdhaXQgdGhpcy51cGRhdGVOb3RlSW5BbmtpKGNhcmQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgdGhpcy5hZGROb3RlVG9BbmtpKGNhcmQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGZpbmRFeGlzdGluZ05vdGVJZChjYXJkOiBBbmtpQ2FyZCk6IFByb21pc2U8bnVtYmVyIHwgbnVsbD4ge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5pbnZva2VBbmtpQ29ubmVjdChcImZpbmROb3Rlc1wiLCB7XG4gICAgICBxdWVyeTogYGRlY2s6XCIke2NhcmQuZGVja31cIiBcImZyb250OiR7Y2FyZC5mcm9udH1cImAsXG4gICAgfSk7XG5cbiAgICBpZiAocmVzcG9uc2UubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHJlc3BvbnNlWzBdO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGFzeW5jIHVwZGF0ZU5vdGVJbkFua2koY2FyZDogQW5raUNhcmQpIHtcbiAgICBhd2FpdCB0aGlzLmludm9rZUFua2lDb25uZWN0KFwidXBkYXRlTm90ZUZpZWxkc1wiLCB7XG4gICAgICBub3RlOiB7XG4gICAgICAgIGlkOiBjYXJkLm5vdGVJZCxcbiAgICAgICAgZmllbGRzOiB7XG4gICAgICAgICAgRnJvbnQ6IGNhcmQuZnJvbnQsXG4gICAgICAgICAgQmFjazogY2FyZC5iYWNrLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGludm9rZUFua2lDb25uZWN0KGFjdGlvbjogc3RyaW5nLCBwYXJhbXM6IGFueSA9IHt9KSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh0aGlzLnNldHRpbmdzLmFua2lDb25uZWN0VXJsLCB7XG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBhY3Rpb24sXG4gICAgICAgIHZlcnNpb246IDYsXG4gICAgICAgIHBhcmFtcyxcbiAgICAgIH0pLFxuICAgIH0pO1xuXG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBbmtpQ29ubmVjdCAke2FjdGlvbn0gZmFpbGVkYCk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2VEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgIGlmIChyZXNwb25zZURhdGEuZXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihyZXNwb25zZURhdGEuZXJyb3IpO1xuICAgIH1cblxuICAgIHJldHVybiByZXNwb25zZURhdGEucmVzdWx0O1xuICB9XG5cbiAgYXN5bmMgcGFyc2VNYXJrZG93bkZvckNhcmRzKFxuICAgIGNvbnRlbnQ6IHN0cmluZyxcbiAgICBmaWxlOiBURmlsZSxcbiAgKTogUHJvbWlzZTxBbmtpQ2FyZFtdPiB7XG4gICAgY29uc3QgY2FyZHM6IEFua2lDYXJkW10gPSBbXTtcbiAgICBjb25zdCBsaW5lcyA9IGNvbnRlbnQuc3BsaXQoXCJcXG5cIik7XG4gICAgbGV0IGZyb250Q29udGVudCA9IFwiXCI7XG4gICAgbGV0IGJhY2tDb250ZW50ID0gXCJcIjtcbiAgICBsZXQgY3VycmVudERlY2sgPSB0aGlzLnNldHRpbmdzLmRlZmF1bHREZWNrO1xuICAgIGxldCBpc0NvbGxlY3RpbmdCYWNrID0gZmFsc2U7XG4gICAgbGV0IG1lZGlhRmlsZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBsaW5lID0gbGluZXNbaV07XG5cbiAgICAgIC8vIENoZWNrIGZvciBkZWNrIHByb3BlcnR5IHdpdGggcHJvcGVyIG5lc3RlZCBkZWNrIGhhbmRsaW5nXG4gICAgICBpZiAobGluZS5zdGFydHNXaXRoKFwiY2FyZHMtZGVjazpcIikpIHtcbiAgICAgICAgY3VycmVudERlY2sgPSBsaW5lLnN1YnN0cmluZyhcImNhcmRzLWRlY2s6XCIubGVuZ3RoKS50cmltKCk7XG4gICAgICAgIC8vIFJlbW92ZSBhbnkgcXVvdGVzIGlmIHByZXNlbnRcbiAgICAgICAgY3VycmVudERlY2sgPSBjdXJyZW50RGVjay5yZXBsYWNlKC9eW1wiJ10oLispW1wiJ10kLywgXCIkMVwiKTtcbiAgICAgICAgLy8gRW5zdXJlIHByb3BlciBkZWNrIG5hbWUgZm9ybWF0XG4gICAgICAgIGN1cnJlbnREZWNrID0gdGhpcy5zYW5pdGl6ZURlY2tOYW1lKGN1cnJlbnREZWNrKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIGZvciBtZWRpYSBmaWxlcyBpbiB0aGUgbGluZSBiZWZvcmUgY2hlY2tpbmcgZm9yIGNhcmQgaGVhZGluZ1xuICAgICAgY29uc3QgbWVkaWFNYXRjaGVzID0gbGluZS5tYXRjaCgvIVxcW1xcWyguKj8pXFxdXFxdL2cpO1xuICAgICAgaWYgKG1lZGlhTWF0Y2hlcyAmJiBpc0NvbGxlY3RpbmdCYWNrKSB7XG4gICAgICAgIGZvciAoY29uc3QgbWF0Y2ggb2YgbWVkaWFNYXRjaGVzKSB7XG4gICAgICAgICAgY29uc3QgZmlsZU5hbWUgPSBtYXRjaC5zbGljZSgzLCAtMikuc3BsaXQoXCJ8XCIpWzBdLnRyaW0oKTsgLy8gSGFuZGxlIGFsaWFzZXNcbiAgICAgICAgICBtZWRpYUZpbGVzLnB1c2goZmlsZU5hbWUpO1xuICAgICAgICAgIC8vIERvbid0IHJlcGxhY2UgdGhlIG1hcmtkb3duIHlldCAtIHdlJ2xsIGRvIGl0IGR1cmluZyBmb3JtYXR0aW5nXG4gICAgICAgICAgYmFja0NvbnRlbnQgKz0gbGluZSArIFwiXFxuXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIGZvciBjYXJkIGhlYWRpbmdcbiAgICAgIGlmIChsaW5lLmluY2x1ZGVzKFwiI2NhcmRcIikgJiYgbGluZS5zdGFydHNXaXRoKFwiI1wiKSkge1xuICAgICAgICAvLyBJZiB3ZSB3ZXJlIGNvbGxlY3RpbmcgYSBwcmV2aW91cyBjYXJkLCBzYXZlIGl0XG4gICAgICAgIGlmIChmcm9udENvbnRlbnQgJiYgYmFja0NvbnRlbnQpIHtcbiAgICAgICAgICBjb25zdCBmb3JtYXR0ZWRDYXJkID0gYXdhaXQgdGhpcy5mb3JtYXRDYXJkQ29udGVudCh7XG4gICAgICAgICAgICBmcm9udDogZnJvbnRDb250ZW50LnRyaW0oKSxcbiAgICAgICAgICAgIGJhY2s6IGJhY2tDb250ZW50LnRyaW0oKSxcbiAgICAgICAgICAgIGRlY2s6IGN1cnJlbnREZWNrLFxuICAgICAgICAgICAgbWVkaWFGaWxlczogWy4uLm1lZGlhRmlsZXNdLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNhcmRzLnB1c2goZm9ybWF0dGVkQ2FyZCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdGFydCBuZXcgY2FyZFxuICAgICAgICBmcm9udENvbnRlbnQgPSBsaW5lLnJlcGxhY2UoLyNjYXJkL2csIFwiXCIpLnJlcGxhY2UoLyMvZywgXCJcIikudHJpbSgpO1xuICAgICAgICBiYWNrQ29udGVudCA9IFwiXCI7XG4gICAgICAgIG1lZGlhRmlsZXMgPSBbXTtcbiAgICAgICAgaXNDb2xsZWN0aW5nQmFjayA9IHRydWU7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB3ZSdyZSBjb2xsZWN0aW5nIGJhY2sgY29udGVudCBhbmQgaGl0IGEgbmV3IGhlYWRpbmcsIHN0b3AgY29sbGVjdGluZ1xuICAgICAgaWYgKGlzQ29sbGVjdGluZ0JhY2sgJiYgbGluZS5zdGFydHNXaXRoKFwiI1wiKSAmJiAhbGluZS5pbmNsdWRlcyhcIiNjYXJkXCIpKSB7XG4gICAgICAgIGlzQ29sbGVjdGluZ0JhY2sgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgZm9ybWF0dGVkQ2FyZCA9IGF3YWl0IHRoaXMuZm9ybWF0Q2FyZENvbnRlbnQoe1xuICAgICAgICAgIGZyb250OiBmcm9udENvbnRlbnQudHJpbSgpLFxuICAgICAgICAgIGJhY2s6IGJhY2tDb250ZW50LnRyaW0oKSxcbiAgICAgICAgICBkZWNrOiBjdXJyZW50RGVjayxcbiAgICAgICAgICBtZWRpYUZpbGVzOiBbLi4ubWVkaWFGaWxlc10sXG4gICAgICAgIH0pO1xuICAgICAgICBjYXJkcy5wdXNoKGZvcm1hdHRlZENhcmQpO1xuICAgICAgICBmcm9udENvbnRlbnQgPSBcIlwiO1xuICAgICAgICBiYWNrQ29udGVudCA9IFwiXCI7XG4gICAgICAgIG1lZGlhRmlsZXMgPSBbXTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIGNvbnRlbnQgdG8gYmFjayBvZiBjYXJkXG4gICAgICBpZiAoaXNDb2xsZWN0aW5nQmFjayAmJiAhbGluZS5zdGFydHNXaXRoKFwiY2FyZHMtZGVjazpcIikpIHtcbiAgICAgICAgYmFja0NvbnRlbnQgKz0gbGluZSArIFwiXFxuXCI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGZpbmFsIGNhcmQgaWYgZXhpc3RzXG4gICAgaWYgKGZyb250Q29udGVudCAmJiBiYWNrQ29udGVudCkge1xuICAgICAgY29uc3QgZm9ybWF0dGVkQ2FyZCA9IGF3YWl0IHRoaXMuZm9ybWF0Q2FyZENvbnRlbnQoe1xuICAgICAgICBmcm9udDogZnJvbnRDb250ZW50LnRyaW0oKSxcbiAgICAgICAgYmFjazogYmFja0NvbnRlbnQudHJpbSgpLFxuICAgICAgICBkZWNrOiBjdXJyZW50RGVjayxcbiAgICAgICAgbWVkaWFGaWxlczogWy4uLm1lZGlhRmlsZXNdLFxuICAgICAgfSk7XG4gICAgICBjYXJkcy5wdXNoKGZvcm1hdHRlZENhcmQpO1xuICAgIH1cblxuICAgIC8vIEZpbmQgZXhpc3Rpbmcgbm90ZSBJRHMgZm9yIHVwZGF0ZXNcbiAgICBmb3IgKGNvbnN0IGNhcmQgb2YgY2FyZHMpIHtcbiAgICAgIGNvbnN0IG5vdGVJZCA9IGF3YWl0IHRoaXMuZmluZEV4aXN0aW5nTm90ZUlkKGNhcmQpO1xuICAgICAgaWYgKG5vdGVJZCkge1xuICAgICAgICBjYXJkLm5vdGVJZCA9IG5vdGVJZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY2FyZHM7XG4gIH1cblxuICBzYW5pdGl6ZURlY2tOYW1lKGRlY2tOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIFJlbW92ZSBleHRyYSB3aGl0ZXNwYWNlIGFyb3VuZCA6OiBzZXBhcmF0b3JzXG4gICAgcmV0dXJuIGRlY2tOYW1lXG4gICAgICAuc3BsaXQoXCI6OlwiKVxuICAgICAgLm1hcCgocGFydCkgPT4gcGFydC50cmltKCkpXG4gICAgICAuam9pbihcIjo6XCIpO1xuICB9XG5cbiAgYXN5bmMgZm9ybWF0Q2FyZENvbnRlbnQoY2FyZDogQW5raUNhcmQpOiBQcm9taXNlPEFua2lDYXJkPiB7XG4gICAgLy8gQ3JlYXRlIGEgdGVtcG9yYXJ5IGRpdiBmb3IgcmVuZGVyaW5nXG4gICAgY29uc3QgdGVtcERpdiA9IGNyZWF0ZURpdigpO1xuICAgIHRlbXBEaXYuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGVtcERpdik7XG5cbiAgICB0cnkge1xuICAgICAgLy8gRmlyc3QsIHN5bmMgbWVkaWEgZmlsZXMgYW5kIGdldCB0aGVpciBwcm9wZXIgQW5raSBuYW1lc1xuICAgICAgY29uc3QgbWVkaWFNYXAgPSBhd2FpdCB0aGlzLnN5bmNNZWRpYUZpbGVzKGNhcmQubWVkaWFGaWxlcyk7XG5cbiAgICAgIC8vIFByb2Nlc3MgbWVkaWEgZmlsZXMgYmVmb3JlIHJlbmRlcmluZyBtYXJrZG93blxuICAgICAgbGV0IHByb2Nlc3NlZENvbnRlbnQgPSBjYXJkLmJhY2s7XG4gICAgICBmb3IgKGNvbnN0IFtvcmlnTmFtZSwgYW5raU5hbWVdIG9mIE9iamVjdC5lbnRyaWVzKG1lZGlhTWFwKSkge1xuICAgICAgICAvLyBSZXBsYWNlIHRoZSBPYnNpZGlhbiBtZWRpYSBzeW50YXggd2l0aCBIVE1MXG4gICAgICAgIGNvbnN0IG1lZGlhUGF0dGVybiA9IG5ldyBSZWdFeHAoXG4gICAgICAgICAgYCFcXFxcW1xcXFxbJHtvcmlnTmFtZS5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgXCJcXFxcJCZcIil9KFxcXFx8W15cXFxcXV0qKT9cXFxcXVxcXFxdYCxcbiAgICAgICAgICBcImdcIixcbiAgICAgICAgKTtcbiAgICAgICAgcHJvY2Vzc2VkQ29udGVudCA9IHByb2Nlc3NlZENvbnRlbnQucmVwbGFjZShcbiAgICAgICAgICBtZWRpYVBhdHRlcm4sXG4gICAgICAgICAgYDxpbWcgc3JjPVwiJHthbmtpTmFtZX1cIiBzdHlsZT1cIm1heC13aWR0aDogODAwcHg7IGRpc3BsYXk6IGJsb2NrOyBtYXJnaW46IDEwcHggYXV0bztcIj5gLFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvLyBSZW5kZXIgdGhlIHByb2Nlc3NlZCBtYXJrZG93blxuICAgICAgYXdhaXQgTWFya2Rvd25SZW5kZXJlci5yZW5kZXJNYXJrZG93bihcbiAgICAgICAgcHJvY2Vzc2VkQ29udGVudCxcbiAgICAgICAgdGVtcERpdixcbiAgICAgICAgXCJcIixcbiAgICAgICAgdGhpcyxcbiAgICAgICk7XG5cbiAgICAgIC8vIEFkZCBzdHlsaW5nXG4gICAgICBsZXQgaHRtbCA9IGBcbiAgICAgICAgICAgICAgICA8c3R5bGU+XG4gICAgICAgICAgICAgICAgICAgIC5jYXJkLWNvbnRlbnQge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgXCJTZWdvZSBVSVwiLCBSb2JvdG8sIEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWY7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLWhlaWdodDogMS42O1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogMjBweDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heC13aWR0aDogODAwcHg7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW46IDAgYXV0bztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAuY2FyZC1jb250ZW50IGltZyB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXgtd2lkdGg6IDQwMHB4O1xuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBhdXRvO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAxMHB4IGF1dG87XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAuY2FyZC1jb250ZW50IHAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAxZW0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAuY2FyZC1jb250ZW50IGNvZGUge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2YwZjBmMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IDJweCA0cHg7XG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXItcmFkaXVzOiAzcHg7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb250LWZhbWlseTogbW9ub3NwYWNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC5jYXJkLWNvbnRlbnQgcHJlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmMGYwZjA7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAxMHB4O1xuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogNXB4O1xuICAgICAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3cteDogYXV0bztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAuY2FyZC1jb250ZW50IHVsLCAuY2FyZC1jb250ZW50IG9sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmctbGVmdDogMjBweDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbjogMWVtIDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLmNhcmQtY29udGVudCBsaSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW46IDAuNWVtIDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLmNhcmQtY29udGVudCBibG9ja3F1b3RlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlci1sZWZ0OiAzcHggc29saWQgI2RkZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbjogMWVtIDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nLWxlZnQ6IDFlbTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAjNjY2O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FyZC1jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgICR7dGVtcERpdi5pbm5lckhUTUx9XG4gICAgICAgICAgICAgICAgPC9kaXY+YDtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uY2FyZCxcbiAgICAgICAgYmFjazogaHRtbCxcbiAgICAgIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIC8vIENsZWFuIHVwXG4gICAgICB0ZW1wRGl2LnJlbW92ZSgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHN5bmNNZWRpYUZpbGVzKG1lZGlhRmlsZXM6IHN0cmluZ1tdKTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+PiB7XG4gICAgY29uc3QgbWVkaWFNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcblxuICAgIGZvciAoY29uc3QgZmlsZU5hbWUgb2YgbWVkaWFGaWxlcykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChmaWxlTmFtZSk7XG4gICAgICAgIGlmIChmaWxlIGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgICAgICBjb25zdCBhcnJheUJ1ZmZlciA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LnJlYWRCaW5hcnkoZmlsZSk7XG4gICAgICAgICAgY29uc3QgYmFzZTY0ID0gdGhpcy5hcnJheUJ1ZmZlclRvQmFzZTY0KGFycmF5QnVmZmVyKTtcblxuICAgICAgICAgIC8vIEVuc3VyZSB1bmlxdWUgZmlsZW5hbWUgZm9yIEFua2lcbiAgICAgICAgICBjb25zdCBhbmtpRmlsZU5hbWUgPSB0aGlzLmdldFVuaXF1ZUFua2lGaWxlTmFtZShmaWxlTmFtZSk7XG5cbiAgICAgICAgICAvLyBTdG9yZSB0aGUgZmlsZSBpbiBBbmtpXG4gICAgICAgICAgYXdhaXQgdGhpcy5pbnZva2VBbmtpQ29ubmVjdChcInN0b3JlTWVkaWFGaWxlXCIsIHtcbiAgICAgICAgICAgIGZpbGVuYW1lOiBhbmtpRmlsZU5hbWUsXG4gICAgICAgICAgICBkYXRhOiBiYXNlNjQsXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBNYXAgb3JpZ2luYWwgZmlsZW5hbWUgdG8gQW5raSBmaWxlbmFtZVxuICAgICAgICAgIG1lZGlhTWFwW2ZpbGVOYW1lXSA9IGFua2lGaWxlTmFtZTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgRmFpbGVkIHRvIHN5bmMgbWVkaWEgZmlsZSAke2ZpbGVOYW1lfTpgLCBlcnJvcik7XG4gICAgICAgIG5ldyBOb3RpY2UoYEZhaWxlZCB0byBzeW5jIG1lZGlhIGZpbGUgJHtmaWxlTmFtZX1gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWVkaWFNYXA7XG4gIH1cblxuICBnZXRVbmlxdWVBbmtpRmlsZU5hbWUob3JpZ2luYWxOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIEdldCB0aGUgYmFzZSBuYW1lIHdpdGhvdXQgcGF0aFxuICAgIGNvbnN0IGJhc2VOYW1lID0gb3JpZ2luYWxOYW1lLnNwbGl0KFwiL1wiKS5wb3AoKSB8fCBvcmlnaW5hbE5hbWU7XG5cbiAgICAvLyBSZW1vdmUgYW55IHNwZWNpYWwgY2hhcmFjdGVycyBhbmQgc3BhY2VzIGZyb20gZmlsZW5hbWVcbiAgICBjb25zdCBzYW5pdGl6ZWROYW1lID0gYmFzZU5hbWUucmVwbGFjZSgvW15hLXpBLVowLTkuXS9nLCBcIl9cIikudG9Mb3dlckNhc2UoKTtcblxuICAgIC8vIEFkZCB0aW1lc3RhbXAgdG8gZW5zdXJlIHVuaXF1ZW5lc3MgaWYgbmVlZGVkXG4gICAgLy8gY29uc3QgdGltZXN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICAvLyByZXR1cm4gYCR7dGltZXN0YW1wfV8ke3Nhbml0aXplZE5hbWV9YDtcblxuICAgIHJldHVybiBzYW5pdGl6ZWROYW1lO1xuICB9XG5cbiAgYXJyYXlCdWZmZXJUb0Jhc2U2NChidWZmZXI6IEFycmF5QnVmZmVyKTogc3RyaW5nIHtcbiAgICBsZXQgYmluYXJ5ID0gXCJcIjtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlcy5ieXRlTGVuZ3RoOyBpKyspIHtcbiAgICAgIGJpbmFyeSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHdpbmRvdy5idG9hKGJpbmFyeSk7XG4gIH1cblxuICBhc3luYyBhZGROb3RlVG9BbmtpKGNhcmQ6IEFua2lDYXJkKSB7XG4gICAgLy8gRmlyc3QgZW5zdXJlIHRoZSBkZWNrIGV4aXN0c1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmNyZWF0ZURlY2tJZk5lZWRlZChjYXJkLmRlY2spO1xuXG4gICAgICAvLyBBZGQgbm90ZSB3aXRoIHByb3BlciBIVE1MIGZvcm1hdHRpbmdcbiAgICAgIGF3YWl0IHRoaXMuaW52b2tlQW5raUNvbm5lY3QoXCJhZGROb3RlXCIsIHtcbiAgICAgICAgbm90ZToge1xuICAgICAgICAgIGRlY2tOYW1lOiBjYXJkLmRlY2ssXG4gICAgICAgICAgbW9kZWxOYW1lOiBcIkJhc2ljXCIsXG4gICAgICAgICAgZmllbGRzOiB7XG4gICAgICAgICAgICBGcm9udDogY2FyZC5mcm9udCxcbiAgICAgICAgICAgIEJhY2s6IGNhcmQuYmFjayxcbiAgICAgICAgICB9LFxuICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGFsbG93RHVwbGljYXRlOiBmYWxzZSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHRhZ3M6IFtcIm9ic2lkaWFuXCJdLFxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gYWRkIG5vdGU6XCIsIGVycm9yKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZURlY2tJZk5lZWRlZChkZWNrTmFtZTogc3RyaW5nKSB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIEdldCBhbGwgZGVja3NcbiAgICAgIGNvbnN0IGRlY2tzID0gYXdhaXQgdGhpcy5pbnZva2VBbmtpQ29ubmVjdChcImRlY2tOYW1lc1wiLCB7fSk7XG5cbiAgICAgIC8vIElmIGRlY2sgZG9lc24ndCBleGlzdCwgY3JlYXRlIGl0XG4gICAgICBpZiAoIWRlY2tzLmluY2x1ZGVzKGRlY2tOYW1lKSkge1xuICAgICAgICBhd2FpdCB0aGlzLmludm9rZUFua2lDb25uZWN0KFwiY3JlYXRlRGVja1wiLCB7XG4gICAgICAgICAgZGVjazogZGVja05hbWUsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhgQ3JlYXRlZCBkZWNrOiAke2RlY2tOYW1lfWApO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGNyZWF0ZSBkZWNrOlwiLCBlcnJvcik7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgQW5raVN5bmNTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG4gIHBsdWdpbjogQW5raVN5bmNQbHVnaW47XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogQW5raVN5bmNQbHVnaW4pIHtcbiAgICBzdXBlcihhcHAsIHBsdWdpbik7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gIH1cblxuICBkaXNwbGF5KCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XG4gICAgY29udGFpbmVyRWwuZW1wdHkoKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJBbmtpQ29ubmVjdCBVUkxcIilcbiAgICAgIC5zZXREZXNjKFwiVVJMIHdoZXJlIEFua2lDb25uZWN0IGlzIHJ1bm5pbmdcIilcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmFua2lDb25uZWN0VXJsKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmFua2lDb25uZWN0VXJsID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KSxcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKFwiRGVmYXVsdCBEZWNrXCIpXG4gICAgICAuc2V0RGVzYyhcIkRlZmF1bHQgZGVjayBuYW1lIGZvciBjYXJkcyB3aXRob3V0IGEgc3BlY2lmaWVkIGRlY2tcIilcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRlZmF1bHREZWNrKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlZmF1bHREZWNrID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KSxcbiAgICAgICk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJQbHVnaW4iLCJhZGRJY29uIiwiTWFya2Rvd25WaWV3IiwiTm90aWNlIiwiTWFya2Rvd25SZW5kZXJlciIsIlRGaWxlIiwiUGx1Z2luU2V0dGluZ1RhYiIsIlNldHRpbmciXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWtHQTtBQUNPLFNBQVMsU0FBUyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRTtBQUM3RCxJQUFJLFNBQVMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLE9BQU8sS0FBSyxZQUFZLENBQUMsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsVUFBVSxPQUFPLEVBQUUsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtBQUNoSCxJQUFJLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLFVBQVUsT0FBTyxFQUFFLE1BQU0sRUFBRTtBQUMvRCxRQUFRLFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7QUFDbkcsUUFBUSxTQUFTLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FB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