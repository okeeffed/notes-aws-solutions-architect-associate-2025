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
                hotkeys: [],
                callback: () => this.syncCurrentFile(),
            });
            // Watch for file changes
            this.registerEvent(this.app.vault.on("modify", (file) => {
                if (file instanceof obsidian.TFile && file.extension === "md") {
                    this.handleFileModification(file);
                }
            }));
            // Add settings tab
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
                if (isCollectingBack && line.startsWith("#")) {
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
    formatCardContent(card) {
        return __awaiter(this, undefined, undefined, function* () {
            // Create a temporary div for rendering
            const tempDiv = createDiv();
            tempDiv.style.display = "none";
            document.body.appendChild(tempDiv);
            try {
                // Format the back content
                yield obsidian.MarkdownRenderer.renderMarkdown(card.back, tempDiv, "", this);
                // Process the rendered HTML
                let html = tempDiv.innerHTML;
                // Handle image formatting
                html = html.replace(/<img([^>]*)>/g, '<div style="text-align: center;"><img$1 style="max-width: 400px; height: auto;"></div>');
                // Replace relative image paths with just the filename for Anki
                html = html.replace(/src="([^"]+)"/g, (match, src) => `src="${src.split("/").pop()}"`);
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
                return Object.assign(Object.assign({}, card), { back: html });
            }
            finally {
                // Clean up
                tempDiv.remove();
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
    syncMediaFiles(mediaFiles) {
        return __awaiter(this, undefined, undefined, function* () {
            for (const fileName of mediaFiles) {
                try {
                    const file = this.app.vault.getAbstractFileByPath(fileName);
                    if (file instanceof obsidian.TFile) {
                        const arrayBuffer = yield this.app.vault.readBinary(file);
                        const base64 = this.arrayBufferToBase64(arrayBuffer);
                        yield this.invokeAnkiConnect("storeMediaFile", {
                            filename: fileName,
                            data: base64,
                        });
                    }
                }
                catch (error) {
                    console.error(`Failed to sync media file ${fileName}:`, error);
                }
            }
        });
    }
    arrayBufferToBase64(buffer) {
        let binary = "";
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
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
    addNoteToAnki(card) {
        return __awaiter(this, undefined, undefined, function* () {
            yield this.invokeAnkiConnect("addNote", {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIm1haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlLCBTdXBwcmVzc2VkRXJyb3IsIFN5bWJvbCwgSXRlcmF0b3IgKi9cclxuXHJcbnZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24oZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwgcCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gZnVuY3Rpb24oKSB7XHJcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH1cclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcclxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcGFyYW0ocGFyYW1JbmRleCwgZGVjb3JhdG9yKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7IGRlY29yYXRvcih0YXJnZXQsIGtleSwgcGFyYW1JbmRleCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXNEZWNvcmF0ZShjdG9yLCBkZXNjcmlwdG9ySW4sIGRlY29yYXRvcnMsIGNvbnRleHRJbiwgaW5pdGlhbGl6ZXJzLCBleHRyYUluaXRpYWxpemVycykge1xyXG4gICAgZnVuY3Rpb24gYWNjZXB0KGYpIHsgaWYgKGYgIT09IHZvaWQgMCAmJiB0eXBlb2YgZiAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRnVuY3Rpb24gZXhwZWN0ZWRcIik7IHJldHVybiBmOyB9XHJcbiAgICB2YXIga2luZCA9IGNvbnRleHRJbi5raW5kLCBrZXkgPSBraW5kID09PSBcImdldHRlclwiID8gXCJnZXRcIiA6IGtpbmQgPT09IFwic2V0dGVyXCIgPyBcInNldFwiIDogXCJ2YWx1ZVwiO1xyXG4gICAgdmFyIHRhcmdldCA9ICFkZXNjcmlwdG9ySW4gJiYgY3RvciA/IGNvbnRleHRJbltcInN0YXRpY1wiXSA/IGN0b3IgOiBjdG9yLnByb3RvdHlwZSA6IG51bGw7XHJcbiAgICB2YXIgZGVzY3JpcHRvciA9IGRlc2NyaXB0b3JJbiB8fCAodGFyZ2V0ID8gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGNvbnRleHRJbi5uYW1lKSA6IHt9KTtcclxuICAgIHZhciBfLCBkb25lID0gZmFsc2U7XHJcbiAgICBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIHZhciBjb250ZXh0ID0ge307XHJcbiAgICAgICAgZm9yICh2YXIgcCBpbiBjb250ZXh0SW4pIGNvbnRleHRbcF0gPSBwID09PSBcImFjY2Vzc1wiID8ge30gOiBjb250ZXh0SW5bcF07XHJcbiAgICAgICAgZm9yICh2YXIgcCBpbiBjb250ZXh0SW4uYWNjZXNzKSBjb250ZXh0LmFjY2Vzc1twXSA9IGNvbnRleHRJbi5hY2Nlc3NbcF07XHJcbiAgICAgICAgY29udGV4dC5hZGRJbml0aWFsaXplciA9IGZ1bmN0aW9uIChmKSB7IGlmIChkb25lKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGFkZCBpbml0aWFsaXplcnMgYWZ0ZXIgZGVjb3JhdGlvbiBoYXMgY29tcGxldGVkXCIpOyBleHRyYUluaXRpYWxpemVycy5wdXNoKGFjY2VwdChmIHx8IG51bGwpKTsgfTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gKDAsIGRlY29yYXRvcnNbaV0pKGtpbmQgPT09IFwiYWNjZXNzb3JcIiA/IHsgZ2V0OiBkZXNjcmlwdG9yLmdldCwgc2V0OiBkZXNjcmlwdG9yLnNldCB9IDogZGVzY3JpcHRvcltrZXldLCBjb250ZXh0KTtcclxuICAgICAgICBpZiAoa2luZCA9PT0gXCJhY2Nlc3NvclwiKSB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IHZvaWQgMCkgY29udGludWU7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IG51bGwgfHwgdHlwZW9mIHJlc3VsdCAhPT0gXCJvYmplY3RcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdCBleHBlY3RlZFwiKTtcclxuICAgICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LmdldCkpIGRlc2NyaXB0b3IuZ2V0ID0gXztcclxuICAgICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LnNldCkpIGRlc2NyaXB0b3Iuc2V0ID0gXztcclxuICAgICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LmluaXQpKSBpbml0aWFsaXplcnMudW5zaGlmdChfKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoXyA9IGFjY2VwdChyZXN1bHQpKSB7XHJcbiAgICAgICAgICAgIGlmIChraW5kID09PSBcImZpZWxkXCIpIGluaXRpYWxpemVycy51bnNoaWZ0KF8pO1xyXG4gICAgICAgICAgICBlbHNlIGRlc2NyaXB0b3Jba2V5XSA9IF87XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHRhcmdldCkgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgY29udGV4dEluLm5hbWUsIGRlc2NyaXB0b3IpO1xyXG4gICAgZG9uZSA9IHRydWU7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19ydW5Jbml0aWFsaXplcnModGhpc0FyZywgaW5pdGlhbGl6ZXJzLCB2YWx1ZSkge1xyXG4gICAgdmFyIHVzZVZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA+IDI7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluaXRpYWxpemVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhbHVlID0gdXNlVmFsdWUgPyBpbml0aWFsaXplcnNbaV0uY2FsbCh0aGlzQXJnLCB2YWx1ZSkgOiBpbml0aWFsaXplcnNbaV0uY2FsbCh0aGlzQXJnKTtcclxuICAgIH1cclxuICAgIHJldHVybiB1c2VWYWx1ZSA/IHZhbHVlIDogdm9pZCAwO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcHJvcEtleSh4KSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIHggPT09IFwic3ltYm9sXCIgPyB4IDogXCJcIi5jb25jYXQoeCk7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zZXRGdW5jdGlvbk5hbWUoZiwgbmFtZSwgcHJlZml4KSB7XHJcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09IFwic3ltYm9sXCIpIG5hbWUgPSBuYW1lLmRlc2NyaXB0aW9uID8gXCJbXCIuY29uY2F0KG5hbWUuZGVzY3JpcHRpb24sIFwiXVwiKSA6IFwiXCI7XHJcbiAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KGYsIFwibmFtZVwiLCB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSwgdmFsdWU6IHByZWZpeCA/IFwiXCIuY29uY2F0KHByZWZpeCwgXCIgXCIsIG5hbWUpIDogbmFtZSB9KTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGcgPSBPYmplY3QuY3JlYXRlKCh0eXBlb2YgSXRlcmF0b3IgPT09IFwiZnVuY3Rpb25cIiA/IEl0ZXJhdG9yIDogT2JqZWN0KS5wcm90b3R5cGUpO1xyXG4gICAgcmV0dXJuIGcubmV4dCA9IHZlcmIoMCksIGdbXCJ0aHJvd1wiXSA9IHZlcmIoMSksIGdbXCJyZXR1cm5cIl0gPSB2ZXJiKDIpLCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcclxuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XHJcbiAgICAgICAgd2hpbGUgKGcgJiYgKGcgPSAwLCBvcFswXSAmJiAoXyA9IDApKSwgXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fY3JlYXRlQmluZGluZyA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XHJcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xyXG4gICAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xyXG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIG9bazJdID0gbVtrXTtcclxufSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHBvcnRTdGFyKG0sIG8pIHtcclxuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKHAgIT09IFwiZGVmYXVsdFwiICYmICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobywgcCkpIF9fY3JlYXRlQmluZGluZyhvLCBtLCBwKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fdmFsdWVzKG8pIHtcclxuICAgIHZhciBzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciwgbSA9IHMgJiYgb1tzXSwgaSA9IDA7XHJcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcclxuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcclxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZWFkKG8sIG4pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXTtcclxuICAgIGlmICghbSkgcmV0dXJuIG87XHJcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyb3IpIHsgZSA9IHsgZXJyb3I6IGVycm9yIH07IH1cclxuICAgIGZpbmFsbHkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChyICYmICFyLmRvbmUgJiYgKG0gPSBpW1wicmV0dXJuXCJdKSkgbS5jYWxsKGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuLyoqIEBkZXByZWNhdGVkICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZCgpIHtcclxuICAgIGZvciAodmFyIGFyID0gW10sIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIGFyID0gYXIuY29uY2F0KF9fcmVhZChhcmd1bWVudHNbaV0pKTtcclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuLyoqIEBkZXByZWNhdGVkICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5cygpIHtcclxuICAgIGZvciAodmFyIHMgPSAwLCBpID0gMCwgaWwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgaWw7IGkrKykgcyArPSBhcmd1bWVudHNbaV0ubGVuZ3RoO1xyXG4gICAgZm9yICh2YXIgciA9IEFycmF5KHMpLCBrID0gMCwgaSA9IDA7IGkgPCBpbDsgaSsrKVxyXG4gICAgICAgIGZvciAodmFyIGEgPSBhcmd1bWVudHNbaV0sIGogPSAwLCBqbCA9IGEubGVuZ3RoOyBqIDwgamw7IGorKywgaysrKVxyXG4gICAgICAgICAgICByW2tdID0gYVtqXTtcclxuICAgIHJldHVybiByO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheSh0bywgZnJvbSwgcGFjaykge1xyXG4gICAgaWYgKHBhY2sgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gMikgZm9yICh2YXIgaSA9IDAsIGwgPSBmcm9tLmxlbmd0aCwgYXI7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICBpZiAoYXIgfHwgIShpIGluIGZyb20pKSB7XHJcbiAgICAgICAgICAgIGlmICghYXIpIGFyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSwgMCwgaSk7XHJcbiAgICAgICAgICAgIGFyW2ldID0gZnJvbVtpXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdG8uY29uY2F0KGFyIHx8IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20pKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXQodikge1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBfX2F3YWl0ID8gKHRoaXMudiA9IHYsIHRoaXMpIDogbmV3IF9fYXdhaXQodik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jR2VuZXJhdG9yKHRoaXNBcmcsIF9hcmd1bWVudHMsIGdlbmVyYXRvcikge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBnID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pLCBpLCBxID0gW107XHJcbiAgICByZXR1cm4gaSA9IE9iamVjdC5jcmVhdGUoKHR5cGVvZiBBc3luY0l0ZXJhdG9yID09PSBcImZ1bmN0aW9uXCIgPyBBc3luY0l0ZXJhdG9yIDogT2JqZWN0KS5wcm90b3R5cGUpLCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIsIGF3YWl0UmV0dXJuKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gYXdhaXRSZXR1cm4oZikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGYsIHJlamVjdCk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpZiAoZ1tuXSkgeyBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7IHEucHVzaChbbiwgdiwgYSwgYl0pID4gMSB8fCByZXN1bWUobiwgdik7IH0pOyB9OyBpZiAoZikgaVtuXSA9IGYoaVtuXSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyB9XHJcbiAgICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpIHsgcmVzdW1lKFwidGhyb3dcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcclxuICAgIHZhciBpLCBwO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiLCBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9KSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpW25dID0gb1tuXSA/IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IGZhbHNlIH0gOiBmID8gZih2KSA6IHY7IH0gOiBmOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jVmFsdWVzKG8pIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgbSA9IG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdLCBpO1xyXG4gICAgcmV0dXJuIG0gPyBtLmNhbGwobykgOiAobyA9IHR5cGVvZiBfX3ZhbHVlcyA9PT0gXCJmdW5jdGlvblwiID8gX192YWx1ZXMobykgOiBvW1N5bWJvbC5pdGVyYXRvcl0oKSwgaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGkpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlbbl0gPSBvW25dICYmIGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IHYgPSBvW25dKHYpLCBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCB2LmRvbmUsIHYudmFsdWUpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgZCwgdikgeyBQcm9taXNlLnJlc29sdmUodikudGhlbihmdW5jdGlvbih2KSB7IHJlc29sdmUoeyB2YWx1ZTogdiwgZG9uZTogZCB9KTsgfSwgcmVqZWN0KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tYWtlVGVtcGxhdGVPYmplY3QoY29va2VkLCByYXcpIHtcclxuICAgIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvb2tlZCwgXCJyYXdcIiwgeyB2YWx1ZTogcmF3IH0pOyB9IGVsc2UgeyBjb29rZWQucmF3ID0gcmF3OyB9XHJcbiAgICByZXR1cm4gY29va2VkO1xyXG59O1xyXG5cclxudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xyXG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcclxufTtcclxuXHJcbnZhciBvd25LZXlzID0gZnVuY3Rpb24obykge1xyXG4gICAgb3duS2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIChvKSB7XHJcbiAgICAgICAgdmFyIGFyID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgayBpbiBvKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIGspKSBhclthci5sZW5ndGhdID0gaztcclxuICAgICAgICByZXR1cm4gYXI7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIG93bktleXMobyk7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnRTdGFyKG1vZCkge1xyXG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayA9IG93bktleXMobW9kKSwgaSA9IDA7IGkgPCBrLmxlbmd0aDsgaSsrKSBpZiAoa1tpXSAhPT0gXCJkZWZhdWx0XCIpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwga1tpXSk7XHJcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0RGVmYXVsdChtb2QpIHtcclxuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgZGVmYXVsdDogbW9kIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHJlY2VpdmVyLCBzdGF0ZSwga2luZCwgZikge1xyXG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgZ2V0dGVyXCIpO1xyXG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgIT09IHN0YXRlIHx8ICFmIDogIXN0YXRlLmhhcyhyZWNlaXZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgcmVhZCBwcml2YXRlIG1lbWJlciBmcm9tIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XHJcbiAgICByZXR1cm4ga2luZCA9PT0gXCJtXCIgPyBmIDoga2luZCA9PT0gXCJhXCIgPyBmLmNhbGwocmVjZWl2ZXIpIDogZiA/IGYudmFsdWUgOiBzdGF0ZS5nZXQocmVjZWl2ZXIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZFNldChyZWNlaXZlciwgc3RhdGUsIHZhbHVlLCBraW5kLCBmKSB7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJtXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIG1ldGhvZCBpcyBub3Qgd3JpdGFibGVcIik7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBzZXR0ZXJcIik7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB3cml0ZSBwcml2YXRlIG1lbWJlciB0byBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xyXG4gICAgcmV0dXJuIChraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlciwgdmFsdWUpIDogZiA/IGYudmFsdWUgPSB2YWx1ZSA6IHN0YXRlLnNldChyZWNlaXZlciwgdmFsdWUpKSwgdmFsdWU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkSW4oc3RhdGUsIHJlY2VpdmVyKSB7XHJcbiAgICBpZiAocmVjZWl2ZXIgPT09IG51bGwgfHwgKHR5cGVvZiByZWNlaXZlciAhPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcmVjZWl2ZXIgIT09IFwiZnVuY3Rpb25cIikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgdXNlICdpbicgb3BlcmF0b3Igb24gbm9uLW9iamVjdFwiKTtcclxuICAgIHJldHVybiB0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyID09PSBzdGF0ZSA6IHN0YXRlLmhhcyhyZWNlaXZlcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FkZERpc3Bvc2FibGVSZXNvdXJjZShlbnYsIHZhbHVlLCBhc3luYykge1xyXG4gICAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB2b2lkIDApIHtcclxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0IGV4cGVjdGVkLlwiKTtcclxuICAgICAgICB2YXIgZGlzcG9zZSwgaW5uZXI7XHJcbiAgICAgICAgaWYgKGFzeW5jKSB7XHJcbiAgICAgICAgICAgIGlmICghU3ltYm9sLmFzeW5jRGlzcG9zZSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0Rpc3Bvc2UgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgICAgICAgICBkaXNwb3NlID0gdmFsdWVbU3ltYm9sLmFzeW5jRGlzcG9zZV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkaXNwb3NlID09PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgaWYgKCFTeW1ib2wuZGlzcG9zZSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5kaXNwb3NlIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgICAgICAgICAgZGlzcG9zZSA9IHZhbHVlW1N5bWJvbC5kaXNwb3NlXTtcclxuICAgICAgICAgICAgaWYgKGFzeW5jKSBpbm5lciA9IGRpc3Bvc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgZGlzcG9zZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0IG5vdCBkaXNwb3NhYmxlLlwiKTtcclxuICAgICAgICBpZiAoaW5uZXIpIGRpc3Bvc2UgPSBmdW5jdGlvbigpIHsgdHJ5IHsgaW5uZXIuY2FsbCh0aGlzKTsgfSBjYXRjaCAoZSkgeyByZXR1cm4gUHJvbWlzZS5yZWplY3QoZSk7IH0gfTtcclxuICAgICAgICBlbnYuc3RhY2sucHVzaCh7IHZhbHVlOiB2YWx1ZSwgZGlzcG9zZTogZGlzcG9zZSwgYXN5bmM6IGFzeW5jIH0pO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoYXN5bmMpIHtcclxuICAgICAgICBlbnYuc3RhY2sucHVzaCh7IGFzeW5jOiB0cnVlIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG5cclxufVxyXG5cclxudmFyIF9TdXBwcmVzc2VkRXJyb3IgPSB0eXBlb2YgU3VwcHJlc3NlZEVycm9yID09PSBcImZ1bmN0aW9uXCIgPyBTdXBwcmVzc2VkRXJyb3IgOiBmdW5jdGlvbiAoZXJyb3IsIHN1cHByZXNzZWQsIG1lc3NhZ2UpIHtcclxuICAgIHZhciBlID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgcmV0dXJuIGUubmFtZSA9IFwiU3VwcHJlc3NlZEVycm9yXCIsIGUuZXJyb3IgPSBlcnJvciwgZS5zdXBwcmVzc2VkID0gc3VwcHJlc3NlZCwgZTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2Rpc3Bvc2VSZXNvdXJjZXMoZW52KSB7XHJcbiAgICBmdW5jdGlvbiBmYWlsKGUpIHtcclxuICAgICAgICBlbnYuZXJyb3IgPSBlbnYuaGFzRXJyb3IgPyBuZXcgX1N1cHByZXNzZWRFcnJvcihlLCBlbnYuZXJyb3IsIFwiQW4gZXJyb3Igd2FzIHN1cHByZXNzZWQgZHVyaW5nIGRpc3Bvc2FsLlwiKSA6IGU7XHJcbiAgICAgICAgZW52Lmhhc0Vycm9yID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIHZhciByLCBzID0gMDtcclxuICAgIGZ1bmN0aW9uIG5leHQoKSB7XHJcbiAgICAgICAgd2hpbGUgKHIgPSBlbnYuc3RhY2sucG9wKCkpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGlmICghci5hc3luYyAmJiBzID09PSAxKSByZXR1cm4gcyA9IDAsIGVudi5zdGFjay5wdXNoKHIpLCBQcm9taXNlLnJlc29sdmUoKS50aGVuKG5leHQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHIuZGlzcG9zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSByLmRpc3Bvc2UuY2FsbChyLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoci5hc3luYykgcmV0dXJuIHMgfD0gMiwgUHJvbWlzZS5yZXNvbHZlKHJlc3VsdCkudGhlbihuZXh0LCBmdW5jdGlvbihlKSB7IGZhaWwoZSk7IHJldHVybiBuZXh0KCk7IH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBzIHw9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGZhaWwoZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHMgPT09IDEpIHJldHVybiBlbnYuaGFzRXJyb3IgPyBQcm9taXNlLnJlamVjdChlbnYuZXJyb3IpIDogUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgaWYgKGVudi5oYXNFcnJvcikgdGhyb3cgZW52LmVycm9yO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5leHQoKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmV3cml0ZVJlbGF0aXZlSW1wb3J0RXh0ZW5zaW9uKHBhdGgsIHByZXNlcnZlSnN4KSB7XHJcbiAgICBpZiAodHlwZW9mIHBhdGggPT09IFwic3RyaW5nXCIgJiYgL15cXC5cXC4/XFwvLy50ZXN0KHBhdGgpKSB7XHJcbiAgICAgICAgcmV0dXJuIHBhdGgucmVwbGFjZSgvXFwuKHRzeCkkfCgoPzpcXC5kKT8pKCg/OlxcLlteLi9dKz8pPylcXC4oW2NtXT8pdHMkL2ksIGZ1bmN0aW9uIChtLCB0c3gsIGQsIGV4dCwgY20pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRzeCA/IHByZXNlcnZlSnN4ID8gXCIuanN4XCIgOiBcIi5qc1wiIDogZCAmJiAoIWV4dCB8fCAhY20pID8gbSA6IChkICsgZXh0ICsgXCIuXCIgKyBjbS50b0xvd2VyQ2FzZSgpICsgXCJqc1wiKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiBwYXRoO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgICBfX2V4dGVuZHM6IF9fZXh0ZW5kcyxcclxuICAgIF9fYXNzaWduOiBfX2Fzc2lnbixcclxuICAgIF9fcmVzdDogX19yZXN0LFxyXG4gICAgX19kZWNvcmF0ZTogX19kZWNvcmF0ZSxcclxuICAgIF9fcGFyYW06IF9fcGFyYW0sXHJcbiAgICBfX2VzRGVjb3JhdGU6IF9fZXNEZWNvcmF0ZSxcclxuICAgIF9fcnVuSW5pdGlhbGl6ZXJzOiBfX3J1bkluaXRpYWxpemVycyxcclxuICAgIF9fcHJvcEtleTogX19wcm9wS2V5LFxyXG4gICAgX19zZXRGdW5jdGlvbk5hbWU6IF9fc2V0RnVuY3Rpb25OYW1lLFxyXG4gICAgX19tZXRhZGF0YTogX19tZXRhZGF0YSxcclxuICAgIF9fYXdhaXRlcjogX19hd2FpdGVyLFxyXG4gICAgX19nZW5lcmF0b3I6IF9fZ2VuZXJhdG9yLFxyXG4gICAgX19jcmVhdGVCaW5kaW5nOiBfX2NyZWF0ZUJpbmRpbmcsXHJcbiAgICBfX2V4cG9ydFN0YXI6IF9fZXhwb3J0U3RhcixcclxuICAgIF9fdmFsdWVzOiBfX3ZhbHVlcyxcclxuICAgIF9fcmVhZDogX19yZWFkLFxyXG4gICAgX19zcHJlYWQ6IF9fc3ByZWFkLFxyXG4gICAgX19zcHJlYWRBcnJheXM6IF9fc3ByZWFkQXJyYXlzLFxyXG4gICAgX19zcHJlYWRBcnJheTogX19zcHJlYWRBcnJheSxcclxuICAgIF9fYXdhaXQ6IF9fYXdhaXQsXHJcbiAgICBfX2FzeW5jR2VuZXJhdG9yOiBfX2FzeW5jR2VuZXJhdG9yLFxyXG4gICAgX19hc3luY0RlbGVnYXRvcjogX19hc3luY0RlbGVnYXRvcixcclxuICAgIF9fYXN5bmNWYWx1ZXM6IF9fYXN5bmNWYWx1ZXMsXHJcbiAgICBfX21ha2VUZW1wbGF0ZU9iamVjdDogX19tYWtlVGVtcGxhdGVPYmplY3QsXHJcbiAgICBfX2ltcG9ydFN0YXI6IF9faW1wb3J0U3RhcixcclxuICAgIF9faW1wb3J0RGVmYXVsdDogX19pbXBvcnREZWZhdWx0LFxyXG4gICAgX19jbGFzc1ByaXZhdGVGaWVsZEdldDogX19jbGFzc1ByaXZhdGVGaWVsZEdldCxcclxuICAgIF9fY2xhc3NQcml2YXRlRmllbGRTZXQ6IF9fY2xhc3NQcml2YXRlRmllbGRTZXQsXHJcbiAgICBfX2NsYXNzUHJpdmF0ZUZpZWxkSW46IF9fY2xhc3NQcml2YXRlRmllbGRJbixcclxuICAgIF9fYWRkRGlzcG9zYWJsZVJlc291cmNlOiBfX2FkZERpc3Bvc2FibGVSZXNvdXJjZSxcclxuICAgIF9fZGlzcG9zZVJlc291cmNlczogX19kaXNwb3NlUmVzb3VyY2VzLFxyXG4gICAgX19yZXdyaXRlUmVsYXRpdmVJbXBvcnRFeHRlbnNpb246IF9fcmV3cml0ZVJlbGF0aXZlSW1wb3J0RXh0ZW5zaW9uLFxyXG59O1xyXG4iLCJpbXBvcnQge1xuICBBcHAsXG4gIFBsdWdpbixcbiAgUGx1Z2luU2V0dGluZ1RhYixcbiAgU2V0dGluZyxcbiAgVEZpbGUsXG4gIE5vdGljZSxcbiAgTWFya2Rvd25WaWV3LFxuICBNYXJrZG93blJlbmRlcmVyLFxuICBhZGRJY29uLFxufSBmcm9tIFwib2JzaWRpYW5cIjtcblxuLy8gSW50ZXJmYWNlc1xuaW50ZXJmYWNlIEFua2lDYXJkIHtcbiAgZnJvbnQ6IHN0cmluZztcbiAgYmFjazogc3RyaW5nO1xuICBkZWNrOiBzdHJpbmc7XG4gIG5vdGVJZD86IG51bWJlcjtcbiAgbWVkaWFGaWxlczogc3RyaW5nW107XG59XG5cbmludGVyZmFjZSBBbmtpU3luY1BsdWdpblNldHRpbmdzIHtcbiAgYW5raUNvbm5lY3RVcmw6IHN0cmluZztcbiAgZGVmYXVsdERlY2s6IHN0cmluZztcbiAgbGFzdFN5bmM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj47IC8vIGZpbGVwYXRoIC0+IHRpbWVzdGFtcFxufVxuXG5jb25zdCBERUZBVUxUX1NFVFRJTkdTOiBBbmtpU3luY1BsdWdpblNldHRpbmdzID0ge1xuICBhbmtpQ29ubmVjdFVybDogXCJodHRwOi8vbG9jYWxob3N0Ojg3NjVcIixcbiAgZGVmYXVsdERlY2s6IFwiRGVmYXVsdFwiLFxuICBsYXN0U3luYzoge30sXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBbmtpU3luY1BsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG4gIHNldHRpbmdzOiBBbmtpU3luY1BsdWdpblNldHRpbmdzO1xuXG4gIGFzeW5jIG9ubG9hZCgpIHtcbiAgICBhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xuXG4gICAgLy8gQWRkIGN1c3RvbSBBbmtpIGljb25cbiAgICBhZGRJY29uKFxuICAgICAgXCJhbmtpXCIsXG4gICAgICBgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIxMDBcIiBoZWlnaHQ9XCIxMDBcIj5cbiAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTQgMmgxNGEyIDIgMCAwIDEgMiAydjJoLTJWNEg0djE2aDE0di0yaDJ2MmEyIDIgMCAwIDEtMiAySDRhMiAyIDAgMCAxLTItMlY0YTIgMiAwIDAgMSAyLTJtMTEuODMgNy4xMmwzLjU0IDMuNTQtMy41NCAzLjU0LTEuNDEtMS40MSAyLjEyLTIuMTMtMi4xMi0yLjEyIDEuNDEtMS40Mk04LjcxIDkuMTJMNy4yOSAxMC41NGwyLjEzIDIuMTItMi4xMyAyLjEzIDEuNDIgMS40MSAzLjU0LTMuNTQtMy41NC0zLjU0WlwiLz5cbiAgICAgICAgPC9zdmc+YCxcbiAgICApO1xuXG4gICAgLy8gQWRkIHJpYmJvbiBpY29uXG4gICAgdGhpcy5hZGRSaWJib25JY29uKFwiYW5raVwiLCBcIlN5bmMgdG8gQW5raVwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCB0aGlzLnN5bmNDdXJyZW50RmlsZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gQWRkIGNvbW1hbmQgdG8gc3luYyBjdXJyZW50IGZpbGVcbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6IFwic3luYy1jdXJyZW50LWZpbGUtdG8tYW5raVwiLFxuICAgICAgbmFtZTogXCJTeW5jIGN1cnJlbnQgZmlsZSB0byBBbmtpXCIsXG4gICAgICBob3RrZXlzOiBbXSxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnN5bmNDdXJyZW50RmlsZSgpLFxuICAgIH0pO1xuXG4gICAgLy8gV2F0Y2ggZm9yIGZpbGUgY2hhbmdlc1xuICAgIHRoaXMucmVnaXN0ZXJFdmVudChcbiAgICAgIHRoaXMuYXBwLnZhdWx0Lm9uKFwibW9kaWZ5XCIsIChmaWxlKSA9PiB7XG4gICAgICAgIGlmIChmaWxlIGluc3RhbmNlb2YgVEZpbGUgJiYgZmlsZS5leHRlbnNpb24gPT09IFwibWRcIikge1xuICAgICAgICAgIHRoaXMuaGFuZGxlRmlsZU1vZGlmaWNhdGlvbihmaWxlKTtcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgKTtcblxuICAgIC8vIEFkZCBzZXR0aW5ncyB0YWJcbiAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IEFua2lTeW5jU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xuICB9XG5cbiAgYXN5bmMgb251bmxvYWQoKSB7XG4gICAgLy8gQ2xlYW51cFxuICB9XG5cbiAgYXN5bmMgbG9hZFNldHRpbmdzKCkge1xuICAgIHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xuICB9XG5cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCkge1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gIH1cblxuICBhc3luYyBoYW5kbGVGaWxlTW9kaWZpY2F0aW9uKGZpbGU6IFRGaWxlKSB7XG4gICAgY29uc3QgbGFzdE1vZGlmaWVkID0gZmlsZS5zdGF0Lm10aW1lO1xuICAgIGNvbnN0IGxhc3RTeW5jID0gdGhpcy5zZXR0aW5ncy5sYXN0U3luY1tmaWxlLnBhdGhdIHx8IDA7XG5cbiAgICBpZiAobGFzdE1vZGlmaWVkID4gbGFzdFN5bmMpIHtcbiAgICAgIC8vIERlYm91bmNlIHN5bmMgZm9yIDIgc2Vjb25kc1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnN5bmNGaWxlKGZpbGUpLCAyMDAwKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzeW5jQ3VycmVudEZpbGUoKSB7XG4gICAgY29uc3QgYWN0aXZlVmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG4gICAgaWYgKCFhY3RpdmVWaWV3KSB7XG4gICAgICBuZXcgTm90aWNlKFwiTm8gYWN0aXZlIG1hcmtkb3duIGZpbGVcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5zeW5jRmlsZShhY3RpdmVWaWV3LmZpbGUhKTtcbiAgfVxuXG4gIGFzeW5jIHN5bmNGaWxlKGZpbGU6IFRGaWxlKSB7XG4gICAgY29uc3QgY29udGVudCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LnJlYWQoZmlsZSk7XG4gICAgY29uc3QgY2FyZHMgPSBhd2FpdCB0aGlzLnBhcnNlTWFya2Rvd25Gb3JDYXJkcyhjb250ZW50LCBmaWxlKTtcblxuICAgIGlmIChjYXJkcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5zeW5jQ2FyZHNUb0Fua2koY2FyZHMpO1xuICAgICAgdGhpcy5zZXR0aW5ncy5sYXN0U3luY1tmaWxlLnBhdGhdID0gRGF0ZS5ub3coKTtcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKCk7XG4gICAgICBuZXcgTm90aWNlKGBTdWNjZXNzZnVsbHkgc3luY2VkICR7Y2FyZHMubGVuZ3RofSBjYXJkcyB0byBBbmtpYCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG5ldyBOb3RpY2UoXG4gICAgICAgIFwiRmFpbGVkIHRvIHN5bmMgY2FyZHMgdG8gQW5raS4gQ2hlY2sgaWYgQW5raUNvbm5lY3QgaXMgcnVubmluZy5cIixcbiAgICAgICk7XG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBwYXJzZU1hcmtkb3duRm9yQ2FyZHMoXG4gICAgY29udGVudDogc3RyaW5nLFxuICAgIGZpbGU6IFRGaWxlLFxuICApOiBQcm9taXNlPEFua2lDYXJkW10+IHtcbiAgICBjb25zdCBjYXJkczogQW5raUNhcmRbXSA9IFtdO1xuICAgIGNvbnN0IGxpbmVzID0gY29udGVudC5zcGxpdChcIlxcblwiKTtcbiAgICBsZXQgZnJvbnRDb250ZW50ID0gXCJcIjtcbiAgICBsZXQgYmFja0NvbnRlbnQgPSBcIlwiO1xuICAgIGxldCBjdXJyZW50RGVjayA9IHRoaXMuc2V0dGluZ3MuZGVmYXVsdERlY2s7XG4gICAgbGV0IGlzQ29sbGVjdGluZ0JhY2sgPSBmYWxzZTtcbiAgICBsZXQgbWVkaWFGaWxlczogc3RyaW5nW10gPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGxpbmUgPSBsaW5lc1tpXTtcblxuICAgICAgLy8gQ2hlY2sgZm9yIGRlY2sgcHJvcGVydHkgLSBub3cgaGFuZGxlcyBuZXN0ZWQgZGVja3MgY29ycmVjdGx5XG4gICAgICBpZiAobGluZS5zdGFydHNXaXRoKFwiY2FyZHMtZGVjazpcIikpIHtcbiAgICAgICAgY3VycmVudERlY2sgPSBsaW5lLnNwbGl0KFwiOlwiKVsxXS50cmltKCk7XG4gICAgICAgIC8vIFJlbW92ZSBhbnkgcXVvdGVzIGlmIHByZXNlbnRcbiAgICAgICAgY3VycmVudERlY2sgPSBjdXJyZW50RGVjay5yZXBsYWNlKC9eW1wiJ10oLispW1wiJ10kLywgXCIkMVwiKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIGZvciBjYXJkIGhlYWRpbmdcbiAgICAgIGlmIChsaW5lLmluY2x1ZGVzKFwiI2NhcmRcIikgJiYgbGluZS5zdGFydHNXaXRoKFwiI1wiKSkge1xuICAgICAgICAvLyBJZiB3ZSB3ZXJlIGNvbGxlY3RpbmcgYSBwcmV2aW91cyBjYXJkLCBzYXZlIGl0XG4gICAgICAgIGlmIChmcm9udENvbnRlbnQgJiYgYmFja0NvbnRlbnQpIHtcbiAgICAgICAgICBjb25zdCBmb3JtYXR0ZWRDYXJkID0gYXdhaXQgdGhpcy5mb3JtYXRDYXJkQ29udGVudCh7XG4gICAgICAgICAgICBmcm9udDogZnJvbnRDb250ZW50LnRyaW0oKSxcbiAgICAgICAgICAgIGJhY2s6IGJhY2tDb250ZW50LnRyaW0oKSxcbiAgICAgICAgICAgIGRlY2s6IGN1cnJlbnREZWNrLFxuICAgICAgICAgICAgbWVkaWFGaWxlczogWy4uLm1lZGlhRmlsZXNdLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNhcmRzLnB1c2goZm9ybWF0dGVkQ2FyZCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdGFydCBuZXcgY2FyZFxuICAgICAgICBmcm9udENvbnRlbnQgPSBsaW5lLnJlcGxhY2UoLyNjYXJkL2csIFwiXCIpLnJlcGxhY2UoLyMvZywgXCJcIikudHJpbSgpO1xuICAgICAgICBiYWNrQ29udGVudCA9IFwiXCI7XG4gICAgICAgIG1lZGlhRmlsZXMgPSBbXTtcbiAgICAgICAgaXNDb2xsZWN0aW5nQmFjayA9IHRydWU7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB3ZSdyZSBjb2xsZWN0aW5nIGJhY2sgY29udGVudCBhbmQgaGl0IGEgbmV3IGhlYWRpbmcsIHN0b3AgY29sbGVjdGluZ1xuICAgICAgaWYgKGlzQ29sbGVjdGluZ0JhY2sgJiYgbGluZS5zdGFydHNXaXRoKFwiI1wiKSkge1xuICAgICAgICBpc0NvbGxlY3RpbmdCYWNrID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IGZvcm1hdHRlZENhcmQgPSBhd2FpdCB0aGlzLmZvcm1hdENhcmRDb250ZW50KHtcbiAgICAgICAgICBmcm9udDogZnJvbnRDb250ZW50LnRyaW0oKSxcbiAgICAgICAgICBiYWNrOiBiYWNrQ29udGVudC50cmltKCksXG4gICAgICAgICAgZGVjazogY3VycmVudERlY2ssXG4gICAgICAgICAgbWVkaWFGaWxlczogWy4uLm1lZGlhRmlsZXNdLFxuICAgICAgICB9KTtcbiAgICAgICAgY2FyZHMucHVzaChmb3JtYXR0ZWRDYXJkKTtcbiAgICAgICAgZnJvbnRDb250ZW50ID0gXCJcIjtcbiAgICAgICAgYmFja0NvbnRlbnQgPSBcIlwiO1xuICAgICAgICBtZWRpYUZpbGVzID0gW107XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCBjb250ZW50IHRvIGJhY2sgb2YgY2FyZFxuICAgICAgaWYgKGlzQ29sbGVjdGluZ0JhY2sgJiYgIWxpbmUuc3RhcnRzV2l0aChcImNhcmRzLWRlY2s6XCIpKSB7XG4gICAgICAgIGJhY2tDb250ZW50ICs9IGxpbmUgKyBcIlxcblwiO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBmaW5hbCBjYXJkIGlmIGV4aXN0c1xuICAgIGlmIChmcm9udENvbnRlbnQgJiYgYmFja0NvbnRlbnQpIHtcbiAgICAgIGNvbnN0IGZvcm1hdHRlZENhcmQgPSBhd2FpdCB0aGlzLmZvcm1hdENhcmRDb250ZW50KHtcbiAgICAgICAgZnJvbnQ6IGZyb250Q29udGVudC50cmltKCksXG4gICAgICAgIGJhY2s6IGJhY2tDb250ZW50LnRyaW0oKSxcbiAgICAgICAgZGVjazogY3VycmVudERlY2ssXG4gICAgICAgIG1lZGlhRmlsZXM6IFsuLi5tZWRpYUZpbGVzXSxcbiAgICAgIH0pO1xuICAgICAgY2FyZHMucHVzaChmb3JtYXR0ZWRDYXJkKTtcbiAgICB9XG5cbiAgICAvLyBGaW5kIGV4aXN0aW5nIG5vdGUgSURzIGZvciB1cGRhdGVzXG4gICAgZm9yIChjb25zdCBjYXJkIG9mIGNhcmRzKSB7XG4gICAgICBjb25zdCBub3RlSWQgPSBhd2FpdCB0aGlzLmZpbmRFeGlzdGluZ05vdGVJZChjYXJkKTtcbiAgICAgIGlmIChub3RlSWQpIHtcbiAgICAgICAgY2FyZC5ub3RlSWQgPSBub3RlSWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNhcmRzO1xuICB9XG5cbiAgYXN5bmMgZm9ybWF0Q2FyZENvbnRlbnQoY2FyZDogQW5raUNhcmQpOiBQcm9taXNlPEFua2lDYXJkPiB7XG4gICAgLy8gQ3JlYXRlIGEgdGVtcG9yYXJ5IGRpdiBmb3IgcmVuZGVyaW5nXG4gICAgY29uc3QgdGVtcERpdiA9IGNyZWF0ZURpdigpO1xuICAgIHRlbXBEaXYuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGVtcERpdik7XG5cbiAgICB0cnkge1xuICAgICAgLy8gRm9ybWF0IHRoZSBiYWNrIGNvbnRlbnRcbiAgICAgIGF3YWl0IE1hcmtkb3duUmVuZGVyZXIucmVuZGVyTWFya2Rvd24oY2FyZC5iYWNrLCB0ZW1wRGl2LCBcIlwiLCB0aGlzKTtcblxuICAgICAgLy8gUHJvY2VzcyB0aGUgcmVuZGVyZWQgSFRNTFxuICAgICAgbGV0IGh0bWwgPSB0ZW1wRGl2LmlubmVySFRNTDtcblxuICAgICAgLy8gSGFuZGxlIGltYWdlIGZvcm1hdHRpbmdcbiAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoXG4gICAgICAgIC88aW1nKFtePl0qKT4vZyxcbiAgICAgICAgJzxkaXYgc3R5bGU9XCJ0ZXh0LWFsaWduOiBjZW50ZXI7XCI+PGltZyQxIHN0eWxlPVwibWF4LXdpZHRoOiA0MDBweDsgaGVpZ2h0OiBhdXRvO1wiPjwvZGl2PicsXG4gICAgICApO1xuXG4gICAgICAvLyBSZXBsYWNlIHJlbGF0aXZlIGltYWdlIHBhdGhzIHdpdGgganVzdCB0aGUgZmlsZW5hbWUgZm9yIEFua2lcbiAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoXG4gICAgICAgIC9zcmM9XCIoW15cIl0rKVwiL2csXG4gICAgICAgIChtYXRjaCwgc3JjKSA9PiBgc3JjPVwiJHtzcmMuc3BsaXQoXCIvXCIpLnBvcCgpfVwiYCxcbiAgICAgICk7XG5cbiAgICAgIC8vIEFkZCBzb21lIGJhc2ljIENTUyBmb3IgYmV0dGVyIGZvcm1hdHRpbmdcbiAgICAgIGh0bWwgPSBgXG4gICAgICAgICAgICAgICAgPHN0eWxlPlxuICAgICAgICAgICAgICAgICAgICAuY2FyZC1jb250ZW50IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnQtZmFtaWx5OiAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIFwiU2Vnb2UgVUlcIiwgUm9ib3RvLCBIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS1oZWlnaHQ6IDEuNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IDIwcHg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29kZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjBmMGYwO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogMnB4IDRweDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDNweDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnQtZmFtaWx5OiBtb25vc3BhY2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcHJlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmMGYwZjA7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAxMHB4O1xuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogNXB4O1xuICAgICAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3cteDogYXV0bztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB1bCwgb2wge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZy1sZWZ0OiAyMHB4O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJsb2NrcXVvdGUge1xuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyLWxlZnQ6IDNweCBzb2xpZCAjZGRkO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZy1sZWZ0OiAxZW07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogIzY2NjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0YWJsZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW46IDEwcHggMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aCwgdGQge1xuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgI2RkZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IDhweDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQtYWxpZ246IGxlZnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGgge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2Y1ZjVmNTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIDwvc3R5bGU+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICAke2h0bWx9XG4gICAgICAgICAgICAgICAgPC9kaXY+YDtcblxuICAgICAgLy8gVXBkYXRlIHRoZSBjYXJkIHdpdGggZm9ybWF0dGVkIGNvbnRlbnRcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmNhcmQsXG4gICAgICAgIGJhY2s6IGh0bWwsXG4gICAgICB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICAvLyBDbGVhbiB1cFxuICAgICAgdGVtcERpdi5yZW1vdmUoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzeW5jQ2FyZHNUb0Fua2koY2FyZHM6IEFua2lDYXJkW10pIHtcbiAgICAvLyBGaXJzdCwgc3luYyBhbGwgbWVkaWEgZmlsZXNcbiAgICBmb3IgKGNvbnN0IGNhcmQgb2YgY2FyZHMpIHtcbiAgICAgIGF3YWl0IHRoaXMuc3luY01lZGlhRmlsZXMoY2FyZC5tZWRpYUZpbGVzKTtcbiAgICB9XG5cbiAgICAvLyBUaGVuIHN5bmMgdGhlIGNhcmRzXG4gICAgZm9yIChjb25zdCBjYXJkIG9mIGNhcmRzKSB7XG4gICAgICBpZiAoY2FyZC5ub3RlSWQpIHtcbiAgICAgICAgYXdhaXQgdGhpcy51cGRhdGVOb3RlSW5BbmtpKGNhcmQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgdGhpcy5hZGROb3RlVG9BbmtpKGNhcmQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHN5bmNNZWRpYUZpbGVzKG1lZGlhRmlsZXM6IHN0cmluZ1tdKSB7XG4gICAgZm9yIChjb25zdCBmaWxlTmFtZSBvZiBtZWRpYUZpbGVzKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGZpbGVOYW1lKTtcbiAgICAgICAgaWYgKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgIGNvbnN0IGFycmF5QnVmZmVyID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZEJpbmFyeShmaWxlKTtcbiAgICAgICAgICBjb25zdCBiYXNlNjQgPSB0aGlzLmFycmF5QnVmZmVyVG9CYXNlNjQoYXJyYXlCdWZmZXIpO1xuXG4gICAgICAgICAgYXdhaXQgdGhpcy5pbnZva2VBbmtpQ29ubmVjdChcInN0b3JlTWVkaWFGaWxlXCIsIHtcbiAgICAgICAgICAgIGZpbGVuYW1lOiBmaWxlTmFtZSxcbiAgICAgICAgICAgIGRhdGE6IGJhc2U2NCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgRmFpbGVkIHRvIHN5bmMgbWVkaWEgZmlsZSAke2ZpbGVOYW1lfTpgLCBlcnJvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXJyYXlCdWZmZXJUb0Jhc2U2NChidWZmZXI6IEFycmF5QnVmZmVyKTogc3RyaW5nIHtcbiAgICBsZXQgYmluYXJ5ID0gXCJcIjtcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlcy5ieXRlTGVuZ3RoOyBpKyspIHtcbiAgICAgIGJpbmFyeSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHdpbmRvdy5idG9hKGJpbmFyeSk7XG4gIH1cblxuICBhc3luYyBmaW5kRXhpc3RpbmdOb3RlSWQoY2FyZDogQW5raUNhcmQpOiBQcm9taXNlPG51bWJlciB8IG51bGw+IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuaW52b2tlQW5raUNvbm5lY3QoXCJmaW5kTm90ZXNcIiwge1xuICAgICAgcXVlcnk6IGBkZWNrOlwiJHtjYXJkLmRlY2t9XCIgXCJmcm9udDoke2NhcmQuZnJvbnR9XCJgLFxuICAgIH0pO1xuXG4gICAgaWYgKHJlc3BvbnNlLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiByZXNwb25zZVswXTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBhc3luYyBhZGROb3RlVG9BbmtpKGNhcmQ6IEFua2lDYXJkKSB7XG4gICAgYXdhaXQgdGhpcy5pbnZva2VBbmtpQ29ubmVjdChcImFkZE5vdGVcIiwge1xuICAgICAgbm90ZToge1xuICAgICAgICBkZWNrTmFtZTogY2FyZC5kZWNrLCAvLyBUaGlzIHdpbGwgbm93IHdvcmsgd2l0aCBuZXN0ZWQgZGVja3MgbGlrZSBcIkFXUyBFeGFtczo6U29sdXRpb25zIEFyY2hpdGVjdDo6QXNzb2NpYXRlXCJcbiAgICAgICAgbW9kZWxOYW1lOiBcIkJhc2ljXCIsXG4gICAgICAgIGZpZWxkczoge1xuICAgICAgICAgIEZyb250OiBjYXJkLmZyb250LFxuICAgICAgICAgIEJhY2s6IGNhcmQuYmFjayxcbiAgICAgICAgfSxcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgIGFsbG93RHVwbGljYXRlOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgICAgdGFnczogW1wib2JzaWRpYW5cIl0sXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgdXBkYXRlTm90ZUluQW5raShjYXJkOiBBbmtpQ2FyZCkge1xuICAgIGF3YWl0IHRoaXMuaW52b2tlQW5raUNvbm5lY3QoXCJ1cGRhdGVOb3RlRmllbGRzXCIsIHtcbiAgICAgIG5vdGU6IHtcbiAgICAgICAgaWQ6IGNhcmQubm90ZUlkLFxuICAgICAgICBmaWVsZHM6IHtcbiAgICAgICAgICBGcm9udDogY2FyZC5mcm9udCxcbiAgICAgICAgICBCYWNrOiBjYXJkLmJhY2ssXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgaW52b2tlQW5raUNvbm5lY3QoYWN0aW9uOiBzdHJpbmcsIHBhcmFtczogYW55ID0ge30pIHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHRoaXMuc2V0dGluZ3MuYW5raUNvbm5lY3RVcmwsIHtcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGFjdGlvbixcbiAgICAgICAgdmVyc2lvbjogNixcbiAgICAgICAgcGFyYW1zLFxuICAgICAgfSksXG4gICAgfSk7XG5cbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEFua2lDb25uZWN0ICR7YWN0aW9ufSBmYWlsZWRgKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXNwb25zZURhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgaWYgKHJlc3BvbnNlRGF0YS5lcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3BvbnNlRGF0YS5lcnJvcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3BvbnNlRGF0YS5yZXN1bHQ7XG4gIH1cbn1cblxuY2xhc3MgQW5raVN5bmNTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG4gIHBsdWdpbjogQW5raVN5bmNQbHVnaW47XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogQW5raVN5bmNQbHVnaW4pIHtcbiAgICBzdXBlcihhcHAsIHBsdWdpbik7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gIH1cblxuICBkaXNwbGF5KCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XG4gICAgY29udGFpbmVyRWwuZW1wdHkoKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJBbmtpQ29ubmVjdCBVUkxcIilcbiAgICAgIC5zZXREZXNjKFwiVVJMIHdoZXJlIEFua2lDb25uZWN0IGlzIHJ1bm5pbmdcIilcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmFua2lDb25uZWN0VXJsKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmFua2lDb25uZWN0VXJsID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KSxcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKFwiRGVmYXVsdCBEZWNrXCIpXG4gICAgICAuc2V0RGVzYyhcIkRlZmF1bHQgZGVjayBuYW1lIGZvciBjYXJkcyB3aXRob3V0IGEgc3BlY2lmaWVkIGRlY2tcIilcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRlZmF1bHREZWNrKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRlZmF1bHREZWNrID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KSxcbiAgICAgICk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJQbHVnaW4iLCJhZGRJY29uIiwiVEZpbGUiLCJNYXJrZG93blZpZXciLCJOb3RpY2UiLCJNYXJrZG93blJlbmRlcmVyIiwiUGx1Z2luU2V0dGluZ1RhYiIsIlNldHRpbmciXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWtHQTtBQUNPLFNBQVMsU0FBUyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRTtBQUM3RCxJQUFJLFNBQVMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLE9BQU8sS0FBSyxZQUFZLENBQUMsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsVUFBVSxPQUFPLEVBQUUsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtBQUNoSCxJQUFJLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLFVBQVUsT0FBTyxFQUFFLE1BQU0sRUFBRTtBQUMvRCxRQUFRLFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7QUFDbkcsUUFBUSxTQUFTLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7QUFDdEcsUUFBUSxTQUFTLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxNQUFNLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUU7QUFDdEgsUUFBUSxJQUFJLENBQUMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsVUFBVSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFDOUUsS0FBSyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBNk1EO0FBQ3VCLE9BQU8sZUFBZSxLQUFLLFVBQVUsR0FBRyxlQUFlLEdBQUcsVUFBVSxLQUFLLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRTtBQUN2SCxJQUFJLElBQUksQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQy9CLElBQUksT0FBTyxDQUFDLENBQUMsSUFBSSxHQUFHLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxFQUFFLENBQUMsQ0FBQyxVQUFVLEdBQUcsVUFBVSxFQUFFLENBQUMsQ0FBQztBQUNyRjs7QUNoVEEsTUFBTSxnQkFBZ0IsR0FBMkI7QUFDL0MsSUFBQSxjQUFjLEVBQUUsdUJBQXVCO0FBQ3ZDLElBQUEsV0FBVyxFQUFFLFNBQVM7QUFDdEIsSUFBQSxRQUFRLEVBQUUsRUFBRTtDQUNiO0FBRW9CLE1BQUEsY0FBZSxTQUFRQSxlQUFNLENBQUE7SUFHMUMsTUFBTSxHQUFBOztBQUNWLFlBQUEsTUFBTSxJQUFJLENBQUMsWUFBWSxFQUFFOztZQUd6QkMsZ0JBQU8sQ0FDTCxNQUFNLEVBQ04sQ0FBQTs7QUFFUyxjQUFBLENBQUEsQ0FDVjs7WUFHRCxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsTUFBVyxTQUFBLENBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsYUFBQTtBQUNwRCxnQkFBQSxNQUFNLElBQUksQ0FBQyxlQUFlLEVBQUU7YUFDN0IsQ0FBQSxDQUFDOztZQUdGLElBQUksQ0FBQyxVQUFVLENBQUM7QUFDZCxnQkFBQSxFQUFFLEVBQUUsMkJBQTJCO0FBQy9CLGdCQUFBLElBQUksRUFBRSwyQkFBMkI7QUFDakMsZ0JBQUEsT0FBTyxFQUFFLEVBQUU7QUFDWCxnQkFBQSxRQUFRLEVBQUUsTUFBTSxJQUFJLENBQUMsZUFBZSxFQUFFO0FBQ3ZDLGFBQUEsQ0FBQzs7QUFHRixZQUFBLElBQUksQ0FBQyxhQUFhLENBQ2hCLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEtBQUk7Z0JBQ25DLElBQUksSUFBSSxZQUFZQyxjQUFLLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLEVBQUU7QUFDcEQsb0JBQUEsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQzs7YUFFcEMsQ0FBQyxDQUNIOztBQUdELFlBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDM0QsQ0FBQTtBQUFBO0lBRUssUUFBUSxHQUFBOzs7U0FFYixDQUFBO0FBQUE7SUFFSyxZQUFZLEdBQUE7O0FBQ2hCLFlBQUEsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUMzRSxDQUFBO0FBQUE7SUFFSyxZQUFZLEdBQUE7O1lBQ2hCLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1NBQ25DLENBQUE7QUFBQTtBQUVLLElBQUEsc0JBQXNCLENBQUMsSUFBVyxFQUFBOztBQUN0QyxZQUFBLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSztBQUNwQyxZQUFBLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBRXZELFlBQUEsSUFBSSxZQUFZLEdBQUcsUUFBUSxFQUFFOztBQUUzQixnQkFBQSxVQUFVLENBQUMsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQzs7U0FFOUMsQ0FBQTtBQUFBO0lBRUssZUFBZSxHQUFBOztBQUNuQixZQUFBLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDQyxxQkFBWSxDQUFDO1lBQ3ZFLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDZixnQkFBQSxJQUFJQyxlQUFNLENBQUMseUJBQXlCLENBQUM7Z0JBQ3JDOztZQUdGLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSyxDQUFDO1NBQ3RDLENBQUE7QUFBQTtBQUVLLElBQUEsUUFBUSxDQUFDLElBQVcsRUFBQTs7QUFDeEIsWUFBQSxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDL0MsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQztBQUU3RCxZQUFBLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3RCOztBQUdGLFlBQUEsSUFBSTtBQUNGLGdCQUFBLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUM7QUFDakMsZ0JBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUU7QUFDOUMsZ0JBQUEsTUFBTSxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUN6QixJQUFJQSxlQUFNLENBQUMsQ0FBdUIsb0JBQUEsRUFBQSxLQUFLLENBQUMsTUFBTSxDQUFBLGNBQUEsQ0FBZ0IsQ0FBQzs7WUFDL0QsT0FBTyxLQUFLLEVBQUU7QUFDZCxnQkFBQSxJQUFJQSxlQUFNLENBQ1IsZ0VBQWdFLENBQ2pFO0FBQ0QsZ0JBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7O1NBRXZCLENBQUE7QUFBQTtJQUVLLHFCQUFxQixDQUN6QixPQUFlLEVBQ2YsSUFBVyxFQUFBOztZQUVYLE1BQU0sS0FBSyxHQUFlLEVBQUU7WUFDNUIsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDakMsSUFBSSxZQUFZLEdBQUcsRUFBRTtZQUNyQixJQUFJLFdBQVcsR0FBRyxFQUFFO0FBQ3BCLFlBQUEsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXO1lBQzNDLElBQUksZ0JBQWdCLEdBQUcsS0FBSztZQUM1QixJQUFJLFVBQVUsR0FBYSxFQUFFO0FBRTdCLFlBQUEsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDckMsZ0JBQUEsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQzs7QUFHckIsZ0JBQUEsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxFQUFFO0FBQ2xDLG9CQUFBLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRTs7b0JBRXZDLFdBQVcsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQztvQkFDekQ7OztBQUlGLGdCQUFBLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFOztBQUVsRCxvQkFBQSxJQUFJLFlBQVksSUFBSSxXQUFXLEVBQUU7QUFDL0Isd0JBQUEsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUM7QUFDakQsNEJBQUEsS0FBSyxFQUFFLFlBQVksQ0FBQyxJQUFJLEVBQUU7QUFDMUIsNEJBQUEsSUFBSSxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUU7QUFDeEIsNEJBQUEsSUFBSSxFQUFFLFdBQVc7QUFDakIsNEJBQUEsVUFBVSxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUM7QUFDNUIseUJBQUEsQ0FBQztBQUNGLHdCQUFBLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDOzs7QUFJM0Isb0JBQUEsWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFO29CQUNsRSxXQUFXLEdBQUcsRUFBRTtvQkFDaEIsVUFBVSxHQUFHLEVBQUU7b0JBQ2YsZ0JBQWdCLEdBQUcsSUFBSTtvQkFDdkI7OztnQkFJRixJQUFJLGdCQUFnQixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQzVDLGdCQUFnQixHQUFHLEtBQUs7QUFDeEIsb0JBQUEsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUM7QUFDakQsd0JBQUEsS0FBSyxFQUFFLFlBQVksQ0FBQyxJQUFJLEVBQUU7QUFDMUIsd0JBQUEsSUFBSSxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUU7QUFDeEIsd0JBQUEsSUFBSSxFQUFFLFdBQVc7QUFDakIsd0JBQUEsVUFBVSxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUM7QUFDNUIscUJBQUEsQ0FBQztBQUNGLG9CQUFBLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO29CQUN6QixZQUFZLEdBQUcsRUFBRTtvQkFDakIsV0FBVyxHQUFHLEVBQUU7b0JBQ2hCLFVBQVUsR0FBRyxFQUFFOzs7Z0JBSWpCLElBQUksZ0JBQWdCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxFQUFFO0FBQ3ZELG9CQUFBLFdBQVcsSUFBSSxJQUFJLEdBQUcsSUFBSTs7OztBQUs5QixZQUFBLElBQUksWUFBWSxJQUFJLFdBQVcsRUFBRTtBQUMvQixnQkFBQSxNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztBQUNqRCxvQkFBQSxLQUFLLEVBQUUsWUFBWSxDQUFDLElBQUksRUFBRTtBQUMxQixvQkFBQSxJQUFJLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRTtBQUN4QixvQkFBQSxJQUFJLEVBQUUsV0FBVztBQUNqQixvQkFBQSxVQUFVLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQztBQUM1QixpQkFBQSxDQUFDO0FBQ0YsZ0JBQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7OztBQUkzQixZQUFBLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO2dCQUN4QixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7Z0JBQ2xELElBQUksTUFBTSxFQUFFO0FBQ1Ysb0JBQUEsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNOzs7QUFJeEIsWUFBQSxPQUFPLEtBQUs7U0FDYixDQUFBO0FBQUE7QUFFSyxJQUFBLGlCQUFpQixDQUFDLElBQWMsRUFBQTs7O0FBRXBDLFlBQUEsTUFBTSxPQUFPLEdBQUcsU0FBUyxFQUFFO0FBQzNCLFlBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTTtBQUM5QixZQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztBQUVsQyxZQUFBLElBQUk7O0FBRUYsZ0JBQUEsTUFBTUMseUJBQWdCLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUM7O0FBR25FLGdCQUFBLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTOztnQkFHNUIsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQ2pCLGVBQWUsRUFDZix3RkFBd0YsQ0FDekY7O2dCQUdELElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUNqQixnQkFBZ0IsRUFDaEIsQ0FBQyxLQUFLLEVBQUUsR0FBRyxLQUFLLENBQVEsS0FBQSxFQUFBLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUcsQ0FBQSxDQUFBLENBQ2hEOztBQUdELGdCQUFBLElBQUksR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkEyQ1MsSUFBSTt1QkFDSDs7QUFHakIsZ0JBQUEsT0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxFQUNLLElBQUksQ0FBQSxFQUFBLEVBQ1AsSUFBSSxFQUFFLElBQUksRUFDVixDQUFBOztvQkFDTTs7Z0JBRVIsT0FBTyxDQUFDLE1BQU0sRUFBRTs7U0FFbkIsQ0FBQTtBQUFBO0FBRUssSUFBQSxlQUFlLENBQUMsS0FBaUIsRUFBQTs7O0FBRXJDLFlBQUEsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7Z0JBQ3hCLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDOzs7QUFJNUMsWUFBQSxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtBQUN4QixnQkFBQSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDZixvQkFBQSxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUM7O3FCQUM1QjtBQUNMLG9CQUFBLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7OztTQUduQyxDQUFBO0FBQUE7QUFFSyxJQUFBLGNBQWMsQ0FBQyxVQUFvQixFQUFBOztBQUN2QyxZQUFBLEtBQUssTUFBTSxRQUFRLElBQUksVUFBVSxFQUFFO0FBQ2pDLGdCQUFBLElBQUk7QUFDRixvQkFBQSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUM7QUFDM0Qsb0JBQUEsSUFBSSxJQUFJLFlBQVlILGNBQUssRUFBRTtBQUN6Qix3QkFBQSxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7d0JBQ3pELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLENBQUM7QUFFcEQsd0JBQUEsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLEVBQUU7QUFDN0MsNEJBQUEsUUFBUSxFQUFFLFFBQVE7QUFDbEIsNEJBQUEsSUFBSSxFQUFFLE1BQU07QUFDYix5QkFBQSxDQUFDOzs7Z0JBRUosT0FBTyxLQUFLLEVBQUU7b0JBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBLDBCQUFBLEVBQTZCLFFBQVEsQ0FBRyxDQUFBLENBQUEsRUFBRSxLQUFLLENBQUM7OztTQUduRSxDQUFBO0FBQUE7QUFFRCxJQUFBLG1CQUFtQixDQUFDLE1BQW1CLEVBQUE7UUFDckMsSUFBSSxNQUFNLEdBQUcsRUFBRTtBQUNmLFFBQUEsTUFBTSxLQUFLLEdBQUcsSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDO0FBQ3BDLFFBQUEsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDekMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUV6QyxRQUFBLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7O0FBR3RCLElBQUEsa0JBQWtCLENBQUMsSUFBYyxFQUFBOztZQUNyQyxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUU7Z0JBQ3pELEtBQUssRUFBRSxTQUFTLElBQUksQ0FBQyxJQUFJLENBQVksU0FBQSxFQUFBLElBQUksQ0FBQyxLQUFLLENBQUcsQ0FBQSxDQUFBO0FBQ25ELGFBQUEsQ0FBQztBQUVGLFlBQUEsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUN2QixnQkFBQSxPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUM7O0FBRXBCLFlBQUEsT0FBTyxJQUFJO1NBQ1osQ0FBQTtBQUFBO0FBRUssSUFBQSxhQUFhLENBQUMsSUFBYyxFQUFBOztBQUNoQyxZQUFBLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRTtBQUN0QyxnQkFBQSxJQUFJLEVBQUU7QUFDSixvQkFBQSxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUk7QUFDbkIsb0JBQUEsU0FBUyxFQUFFLE9BQU87QUFDbEIsb0JBQUEsTUFBTSxFQUFFO3dCQUNOLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSzt3QkFDakIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO0FBQ2hCLHFCQUFBO0FBQ0Qsb0JBQUEsT0FBTyxFQUFFO0FBQ1Asd0JBQUEsY0FBYyxFQUFFLEtBQUs7QUFDdEIscUJBQUE7b0JBQ0QsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDO0FBQ25CLGlCQUFBO0FBQ0YsYUFBQSxDQUFDO1NBQ0gsQ0FBQTtBQUFBO0FBRUssSUFBQSxnQkFBZ0IsQ0FBQyxJQUFjLEVBQUE7O0FBQ25DLFlBQUEsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLEVBQUU7QUFDL0MsZ0JBQUEsSUFBSSxFQUFFO29CQUNKLEVBQUUsRUFBRSxJQUFJLENBQUMsTUFBTTtBQUNmLG9CQUFBLE1BQU0sRUFBRTt3QkFDTixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7d0JBQ2pCLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtBQUNoQixxQkFBQTtBQUNGLGlCQUFBO0FBQ0YsYUFBQSxDQUFDO1NBQ0gsQ0FBQTtBQUFBO0lBRUssaUJBQWlCLENBQUEsUUFBQSxFQUFBO2dFQUFDLE1BQWMsRUFBRSxTQUFjLEVBQUUsRUFBQTtZQUN0RCxNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRTtBQUN6RCxnQkFBQSxNQUFNLEVBQUUsTUFBTTtBQUNkLGdCQUFBLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO29CQUNuQixNQUFNO0FBQ04sb0JBQUEsT0FBTyxFQUFFLENBQUM7b0JBQ1YsTUFBTTtpQkFDUCxDQUFDO0FBQ0gsYUFBQSxDQUFDO0FBRUYsWUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRTtBQUNoQixnQkFBQSxNQUFNLElBQUksS0FBSyxDQUFDLGVBQWUsTUFBTSxDQUFBLE9BQUEsQ0FBUyxDQUFDOztBQUdqRCxZQUFBLE1BQU0sWUFBWSxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRTtBQUMxQyxZQUFBLElBQUksWUFBWSxDQUFDLEtBQUssRUFBRTtBQUN0QixnQkFBQSxNQUFNLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7O1lBR3JDLE9BQU8sWUFBWSxDQUFDLE1BQU07U0FDM0IsQ0FBQTtBQUFBO0FBQ0Y7QUFFRCxNQUFNLGtCQUFtQixTQUFRSSx5QkFBZ0IsQ0FBQTtJQUcvQyxXQUFZLENBQUEsR0FBUSxFQUFFLE1BQXNCLEVBQUE7QUFDMUMsUUFBQSxLQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQztBQUNsQixRQUFBLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTTs7SUFHdEIsT0FBTyxHQUFBO0FBQ0wsUUFBQSxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsSUFBSTtRQUM1QixXQUFXLENBQUMsS0FBSyxFQUFFO1FBRW5CLElBQUlDLGdCQUFPLENBQUMsV0FBVzthQUNwQixPQUFPLENBQUMsaUJBQWlCO2FBQ3pCLE9BQU8sQ0FBQyxrQ0FBa0M7QUFDMUMsYUFBQSxPQUFPLENBQUMsQ0FBQyxJQUFJLEtBQ1o7YUFDRyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYztBQUM1QyxhQUFBLFFBQVEsQ0FBQyxDQUFPLEtBQUssS0FBSSxTQUFBLENBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsYUFBQTtZQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEdBQUcsS0FBSztBQUMzQyxZQUFBLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUU7U0FDakMsQ0FBQSxDQUFDLENBQ0w7UUFFSCxJQUFJQSxnQkFBTyxDQUFDLFdBQVc7YUFDcEIsT0FBTyxDQUFDLGNBQWM7YUFDdEIsT0FBTyxDQUFDLHNEQUFzRDtBQUM5RCxhQUFBLE9BQU8sQ0FBQyxDQUFDLElBQUksS0FDWjthQUNHLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXO0FBQ3pDLGFBQUEsUUFBUSxDQUFDLENBQU8sS0FBSyxLQUFJLFNBQUEsQ0FBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxhQUFBO1lBQ3hCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxLQUFLO0FBQ3hDLFlBQUEsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRTtTQUNqQyxDQUFBLENBQUMsQ0FDTDs7QUFFTjs7OzsiLCJ4X2dvb2dsZV9pZ25vcmVMaXN0IjpbMF19
