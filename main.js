/* eslint-disable */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => SemanticSearchPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian5 = require("obsidian");

// src/settings.ts
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  provider: "ollama",
  ollamaUrl: "http://localhost:11434",
  ollamaModel: "nomic-embed-text",
  apiUrl: "https://api.openai.com/v1/embeddings",
  apiKey: "",
  apiModel: "text-embedding-3-small",
  chunkSize: 800,
  chunkOverlap: 100,
  searchHistory: [],
  historyLimit: 50
};
var SemanticSearchSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  checkConfigMismatch() {
    const currentSig = this.plugin.db.generateSignature();
    const savedSig = this.plugin.db.savedConfigSignature;
    if (!savedSig)
      return false;
    return currentSig !== savedSig;
  }
  parseSignature(sig) {
    if (!sig)
      return "None (New DB)";
    const parts = sig.split("|");
    if (parts.length < 4)
      return sig;
    return `Provider: ${parts[0]}, Model: ${parts[1]}, Chunk: ${parts[2]}, Overlap: ${parts[3]}`;
  }
  updateWarning() {
    if (!this.warningEl)
      return;
    const isMismatch = this.checkConfigMismatch();
    if (isMismatch) {
      this.warningEl.empty();
      this.warningEl.style.display = "block";
      const header = this.warningEl.createDiv({ cls: "setting-item-name", text: "\u26A0\uFE0F Configuration Mismatch!", attr: { style: "font-weight: bold; font-size: 1.1em; color: var(--text-on-accent); margin-bottom: 8px;" } });
      const desc = this.warningEl.createDiv({ attr: { style: "color: var(--text-on-accent); margin-bottom: 10px; font-size: 0.9em;" } });
      const saved = this.parseSignature(this.plugin.db.savedConfigSignature);
      const current = this.parseSignature(this.plugin.db.generateSignature());
      desc.createDiv({ text: `The database was built with different settings than currently selected. Search is disabled until resolved.` });
      desc.createEl("br");
      desc.createDiv({ text: `\u{1F4BE} Database (Saved):`, attr: { style: "font-weight: bold; opacity: 0.8;" } });
      desc.createDiv({ text: saved, attr: { style: "font-family: monospace; margin-bottom: 5px;" } });
      desc.createDiv({ text: `\u2699\uFE0F Current Settings:`, attr: { style: "font-weight: bold; opacity: 0.8;" } });
      desc.createDiv({ text: current, attr: { style: "font-family: monospace;" } });
      const btnContainer = this.warningEl.createDiv({ attr: { style: "margin-top: 15px; display: flex; gap: 10px;" } });
      new import_obsidian.ButtonComponent(btnContainer).setButtonText("\u{1F504} Re-index Database").setCta().onClick(async () => {
        this.plugin.db.clearCache();
        this.plugin.db.startIndexing(this.plugin.statusBarItem);
        this.updateWarning();
        new import_obsidian.ButtonComponent(btnContainer).setButtonText("Indexing started...").setDisabled(true);
      });
    } else {
      this.warningEl.style.display = "none";
    }
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "\u2699\uFE0F Semantic Search Settings" });
    this.warningEl = containerEl.createDiv({
      cls: "semantic-search-warning",
      attr: {
        style: "background-color: var(--background-modifier-error); padding: 15px; border-radius: 8px; margin-bottom: 20px; display: none;"
      }
    });
    this.updateWarning();
    new import_obsidian.Setting(containerEl).setName("Embeddings Provider").setDesc("Choose who generates vectors for your notes.").addDropdown(
      (drop) => drop.addOption("ollama", "Local (Ollama)").addOption("api", "API (OpenRouter, OpenAI, etc.)").setValue(this.plugin.settings.provider).onChange(async (v) => {
        this.plugin.settings.provider = v;
        await this.plugin.saveSettings();
        this.updateWarning();
        this.display();
      })
    );
    if (this.plugin.settings.provider === "ollama") {
      new import_obsidian.Setting(containerEl).setName("Ollama URL").addText((t) => t.setValue(this.plugin.settings.ollamaUrl).onChange(async (v) => {
        this.plugin.settings.ollamaUrl = v;
        await this.plugin.saveSettings();
      }));
      new import_obsidian.Setting(containerEl).setName("Ollama Model").setDesc("Vector model (e.g., nomic-embed-text)").addText((t) => t.setValue(this.plugin.settings.ollamaModel).onChange(async (v) => {
        this.plugin.settings.ollamaModel = v;
        await this.plugin.saveSettings();
        this.updateWarning();
      }));
    } else {
      new import_obsidian.Setting(containerEl).setName("API URL").addText((t) => t.setValue(this.plugin.settings.apiUrl).onChange(async (v) => {
        this.plugin.settings.apiUrl = v;
        await this.plugin.saveSettings();
      }));
      new import_obsidian.Setting(containerEl).setName("API Key").addText((t) => t.setPlaceholder("sk-...").setValue(this.plugin.settings.apiKey).onChange(async (v) => {
        this.plugin.settings.apiKey = v;
        await this.plugin.saveSettings();
      }));
      new import_obsidian.Setting(containerEl).setName("API Model").addText((t) => t.setValue(this.plugin.settings.apiModel).onChange(async (v) => {
        this.plugin.settings.apiModel = v;
        await this.plugin.saveSettings();
        this.updateWarning();
      }));
    }
    containerEl.createEl("h3", { text: "Interface", attr: { style: "margin-top: 20px;" } });
    new import_obsidian.Setting(containerEl).setName("Search History Limit").setDesc("How many past queries to remember (set 0 to disable).").addText((text) => text.setValue(this.plugin.settings.historyLimit.toString()).onChange(async (value) => {
      const limit = parseInt(value);
      if (!isNaN(limit) && limit >= 0) {
        this.plugin.settings.historyLimit = limit;
        if (this.plugin.settings.searchHistory.length > limit) {
          this.plugin.settings.searchHistory = this.plugin.settings.searchHistory.slice(-limit);
        }
        await this.plugin.saveSettings();
      }
    }));
    containerEl.createEl("h3", { text: "Chunking Settings", attr: { style: "margin-top: 20px;" } });
    new import_obsidian.Setting(containerEl).setName("Chunk Size").setDesc("Characters per vector segment.").addText((t) => t.setValue(this.plugin.settings.chunkSize.toString()).onChange(async (v) => {
      const val = parseInt(v);
      if (!isNaN(val)) {
        this.plugin.settings.chunkSize = val;
        await this.plugin.saveSettings();
        this.updateWarning();
      }
    }));
    new import_obsidian.Setting(containerEl).setName("Overlap").setDesc("Characters overlap between chunks.").addText((t) => t.setValue(this.plugin.settings.chunkOverlap.toString()).onChange(async (v) => {
      const val = parseInt(v);
      if (!isNaN(val)) {
        this.plugin.settings.chunkOverlap = val;
        await this.plugin.saveSettings();
        this.updateWarning();
      }
    }));
    containerEl.createEl("h3", { text: "Database Management", attr: { style: "margin-top: 20px;" } });
    new import_obsidian.Setting(containerEl).setName("Clear Vector Cache").setDesc("Deletes all vectors. Full re-indexing required.").addButton(
      (btn) => btn.setButtonText("\u{1F5D1}\uFE0F Clear Cache").setWarning().onClick(() => {
        this.plugin.db.clearCache();
        this.updateWarning();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Start Full Indexing").addButton(
      (btn) => btn.setButtonText("\u{1F680} Index Now").setCta().onClick(() => {
        this.plugin.db.startIndexing(this.plugin.statusBarItem);
        setTimeout(() => this.updateWarning(), 500);
      })
    );
  }
};

// src/database.ts
var import_obsidian3 = require("obsidian");

// src/client.ts
var import_obsidian2 = require("obsidian");
var EmbeddingClient = class {
  constructor(settings) {
    this.settings = settings;
  }
  async getEmbeddings(texts) {
    if (this.settings.provider === "ollama")
      return this.getOllamaEmbeddings(texts);
    return this.getApiEmbeddings(texts);
  }
  async getOllamaEmbeddings(texts) {
    const vectors = [];
    for (const text of texts) {
      const res = await (0, import_obsidian2.requestUrl)({
        url: `${this.settings.ollamaUrl.replace(/\/$/, "")}/api/embeddings`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: this.settings.ollamaModel, prompt: text })
      });
      vectors.push(res.json.embedding);
    }
    return vectors;
  }
  async getApiEmbeddings(texts) {
    const res = await (0, import_obsidian2.requestUrl)({
      url: this.settings.apiUrl,
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.settings.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model: this.settings.apiModel, input: texts })
    });
    const data = res.json.data.sort((a, b) => a.index - b.index);
    return data.map((d) => d.embedding);
  }
};

// src/utils.ts
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0)
    return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
function stripFrontmatter(text) {
  return text.replace(/^---\n[\s\S]*?\n---\n/, "");
}
function chunkText(text, size, overlap) {
  const cleanText = stripFrontmatter(text);
  const paragraphs = cleanText.split(/\n\s*\n/);
  const chunks = [];
  let currentChunk = "";
  for (const p of paragraphs) {
    if (!p.trim())
      continue;
    if (currentChunk.length + p.length > size && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = currentChunk.substring(currentChunk.length - overlap) + "\n\n" + p;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + p;
    }
  }
  if (currentChunk.trim())
    chunks.push(currentChunk.trim());
  return chunks;
}

// src/database.ts
var VectorDatabase = class {
  constructor(plugin) {
    this.plugin = plugin;
    this.cache = {};
    this.savedConfigSignature = "";
    this.isIndexingStatus = false;
    this.progress = 0;
    const dir = this.plugin.manifest.dir || ".";
    this.cachePath = `${dir}/vector_cache.json`;
  }
  generateSignature() {
    const s = this.plugin.settings;
    if (s.provider === "ollama") {
      return `ollama|${s.ollamaModel}|${s.chunkSize}|${s.chunkOverlap}`;
    } else {
      return `api|${s.apiModel}|${s.chunkSize}|${s.chunkOverlap}`;
    }
  }
  async loadCache() {
    var _a;
    try {
      if (await this.plugin.app.vault.adapter.exists(this.cachePath)) {
        const dataStr = await this.plugin.app.vault.adapter.read(this.cachePath);
        const data = JSON.parse(dataStr);
        if (!data.configSignature && !data.files && !data.files) {
          this.cache = data;
          this.savedConfigSignature = "";
        } else {
          const dbData = data;
          this.cache = dbData.files || {};
          this.savedConfigSignature = (_a = dbData.configSignature) != null ? _a : "";
        }
      } else {
        const dir = this.plugin.manifest.dir;
        if (dir)
          await this.plugin.app.vault.adapter.mkdir(dir).catch(() => {
          });
        this.savedConfigSignature = this.generateSignature();
      }
    } catch (e) {
      console.error("Error loading vector cache:", e);
      this.cache = {};
      this.savedConfigSignature = "";
    }
  }
  async saveCache() {
    try {
      const dbData = {
        configSignature: this.generateSignature(),
        files: this.cache
      };
      await this.plugin.app.vault.adapter.write(this.cachePath, JSON.stringify(dbData));
      this.savedConfigSignature = dbData.configSignature || "";
    } catch (e) {
      console.error("Error saving vector cache:", e);
    }
  }
  clearCache() {
    this.cache = {};
    this.savedConfigSignature = this.generateSignature();
    this.saveCache();
    new import_obsidian3.Notice("Vector cache cleared!");
  }
  async startIndexing(statusBarItem) {
    if (this.isIndexingStatus)
      return;
    this.savedConfigSignature = this.generateSignature();
    this.isIndexingStatus = true;
    this.progress = 0;
    const files = this.plugin.app.vault.getMarkdownFiles();
    const client = new EmbeddingClient(this.plugin.settings);
    let processed = 0;
    let toUpdate = [];
    const existingPaths = new Set(files.map((f) => f.path));
    for (const path in this.cache) {
      if (!existingPaths.has(path))
        delete this.cache[path];
    }
    for (const file of files) {
      const cached = this.cache[file.path];
      if (!cached || cached.mtime < file.stat.mtime) {
        toUpdate.push(file);
      }
    }
    if (toUpdate.length === 0) {
      this.isIndexingStatus = false;
      await this.saveCache();
      statusBarItem.setText("\u{1F50D} All notes indexed");
      setTimeout(() => statusBarItem.setText(""), 3e3);
      return;
    }
    statusBarItem.setText(`\u{1F50D} Indexing: 0/${toUpdate.length}...`);
    for (const file of toUpdate) {
      if (!this.isIndexingStatus)
        break;
      try {
        const content = await this.plugin.app.vault.read(file);
        const chunks = chunkText(content, this.plugin.settings.chunkSize, this.plugin.settings.chunkOverlap);
        if (chunks.length > 0) {
          const vectors = await client.getEmbeddings(chunks);
          const chunkData = chunks.map((text, i) => ({ text, vector: vectors[i] }));
          this.cache[file.path] = { mtime: file.stat.mtime, chunks: chunkData };
        } else {
          this.cache[file.path] = { mtime: file.stat.mtime, chunks: [] };
        }
        processed++;
        this.progress = Math.round(processed / toUpdate.length * 100);
        statusBarItem.setText(`\u{1F50D} Indexing: ${processed}/${toUpdate.length} (${this.progress}%)`);
        if (processed % 10 === 0)
          await this.saveCache();
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (e) {
        console.error(`Error indexing ${file.path}:`, e);
      }
    }
    await this.saveCache();
    this.isIndexingStatus = false;
    statusBarItem.setText("\u2705 Indexing complete");
    setTimeout(() => statusBarItem.setText(""), 3e3);
  }
  async search(query, limit = 5, threshold = 0.5) {
    if (this.savedConfigSignature && this.savedConfigSignature !== this.generateSignature()) {
      console.warn("Semantic Search: Database signature mismatch. Search results may be inaccurate.");
      return [];
    }
    const client = new EmbeddingClient(this.plugin.settings);
    const queryVector = (await client.getEmbeddings([query]))[0];
    const results = [];
    for (const [path, fileCache] of Object.entries(this.cache)) {
      for (const chunk of fileCache.chunks) {
        const score = cosineSimilarity(queryVector, chunk.vector);
        if (score >= threshold) {
          results.push({ path, content: chunk.text, score });
        }
      }
    }
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }
};

// src/modal.ts
var import_obsidian4 = require("obsidian");
var SemanticSearchModal = class extends import_obsidian4.Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
    this.historyIndex = 0;
    this.currentDraft = "";
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("semantic-search-modal");
    contentEl.createEl("h2", { text: "\u{1F9E0} Semantic Search" });
    const controls = contentEl.createDiv({ cls: "semantic-search-controls", attr: { style: "display: flex; gap: 10px; margin-bottom: 20px;" } });
    this.queryInput = controls.createEl("input", {
      type: "text",
      placeholder: "Enter idea... (Use \u2191/\u2193 for history)",
      attr: { style: "flex-grow: 1; padding: 10px; font-size: 16px;" }
    });
    const history = this.plugin.settings.searchHistory;
    this.queryInput.value = "";
    this.historyIndex = history.length;
    setTimeout(() => this.queryInput.focus(), 50);
    this.limitInput = controls.createEl("input", {
      type: "number",
      value: "5",
      attr: { min: "1", max: "20", style: "width: 60px; text-align: center;" }
    });
    const searchBtn = controls.createEl("button", { text: "Search", cls: "mod-cta" });
    this.resultsContainer = contentEl.createDiv({ cls: "semantic-search-results", attr: { style: "max-height: 400px; overflow-y: auto;" } });
    const performSearch = async () => {
      const query = this.queryInput.value.trim();
      if (!query)
        return;
      await this.saveToHistory(query);
      searchBtn.textContent = "Searching...";
      searchBtn.disabled = true;
      this.resultsContainer.empty();
      try {
        const limit = parseInt(this.limitInput.value) || 5;
        const results = await this.plugin.api.search(query, limit, 0.3);
        if (results.length === 0) {
          this.resultsContainer.createDiv({ text: "No relevant notes found.", attr: { style: "color: var(--text-muted); text-align: center; margin-top: 20px;" } });
        } else {
          results.forEach((res) => this.renderResult(res));
        }
      } catch (e) {
        new import_obsidian4.Notice("Search error: " + e.message);
      } finally {
        searchBtn.textContent = "Search";
        searchBtn.disabled = false;
        this.queryInput.focus();
      }
    };
    searchBtn.addEventListener("click", performSearch);
    this.queryInput.addEventListener("keydown", (e) => {
      const hist = this.plugin.settings.searchHistory;
      if (e.key === "Enter") {
        e.preventDefault();
        performSearch();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (this.historyIndex === hist.length) {
          this.currentDraft = this.queryInput.value;
        }
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.queryInput.value = hist[this.historyIndex];
          setTimeout(() => {
            this.queryInput.selectionStart = this.queryInput.selectionEnd = this.queryInput.value.length;
          }, 0);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (this.historyIndex < hist.length) {
          this.historyIndex++;
          if (this.historyIndex === hist.length) {
            this.queryInput.value = this.currentDraft;
          } else {
            this.queryInput.value = hist[this.historyIndex];
          }
          setTimeout(() => {
            this.queryInput.selectionStart = this.queryInput.selectionEnd = this.queryInput.value.length;
          }, 0);
        }
      }
    });
    this.queryInput.addEventListener("input", () => {
      this.historyIndex = this.plugin.settings.searchHistory.length;
      this.currentDraft = this.queryInput.value;
    });
  }
  async saveToHistory(query) {
    const limit = this.plugin.settings.historyLimit;
    if (limit === 0)
      return;
    const history = this.plugin.settings.searchHistory;
    if (history.length > 0 && history[history.length - 1] === query) {
      this.historyIndex = history.length;
      this.currentDraft = "";
      return;
    }
    history.push(query);
    while (history.length > limit) {
      history.shift();
    }
    await this.plugin.saveSettings();
    this.historyIndex = history.length;
    this.currentDraft = "";
  }
  renderResult(result) {
    const card = this.resultsContainer.createDiv({
      cls: "semantic-search-card",
      attr: { style: "border: 1px solid var(--background-modifier-border); border-radius: 8px; padding: 12px; margin-bottom: 12px; cursor: pointer; transition: background 0.2s;" }
    });
    card.addEventListener("mouseenter", () => card.style.background = "var(--background-secondary)");
    card.addEventListener("mouseleave", () => card.style.background = "transparent");
    const header = card.createDiv({ attr: { style: "display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;" } });
    const fileIconTitle = header.createDiv({ attr: { style: "display: flex; align-items: center; gap: 6px; font-weight: bold; color: var(--text-accent);" } });
    (0, import_obsidian4.setIcon)(fileIconTitle.createSpan(), "file-text");
    fileIconTitle.createSpan({ text: result.path.replace(/\.md$/, "") });
    header.createSpan({ text: `Score: ${(result.score * 100).toFixed(1)}%`, attr: { style: "font-size: 12px; color: var(--text-muted); background: var(--background-secondary); padding: 2px 6px; border-radius: 10px;" } });
    card.createDiv({ text: result.content, attr: { style: "font-size: 13px; color: var(--text-normal); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; opacity: 0.9;" } });
    card.addEventListener("click", async () => {
      const file = this.app.vault.getAbstractFileByPath(result.path);
      if (file instanceof import_obsidian4.TFile) {
        const leaf = this.app.workspace.getLeaf(false);
        await leaf.openFile(file);
        this.scrollToText(leaf, result.content);
        this.close();
      }
    });
  }
  scrollToText(leaf, textToFind) {
    setTimeout(() => {
      const view = leaf.view;
      if (view instanceof import_obsidian4.MarkdownView) {
        const editor = view.editor;
        const fileContent = editor.getValue();
        const firstLine = textToFind.split("\n")[0].trim();
        if (!firstLine)
          return;
        const lines = fileContent.split("\n");
        let foundLine = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(firstLine)) {
            foundLine = i;
            break;
          }
        }
        if (foundLine !== -1) {
          editor.setCursor({ line: foundLine, ch: 0 });
          editor.scrollIntoView({ from: { line: foundLine, ch: 0 }, to: { line: foundLine, ch: 0 } }, true);
        }
      }
    }, 100);
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/main.ts
var SemanticSearchPlugin = class extends import_obsidian5.Plugin {
  constructor() {
    super(...arguments);
    this.lastQuery = "";
    this.api = {
      search: async (query, limit, threshold) => await this.db.search(query, limit, threshold),
      isIndexing: () => this.db.isIndexingStatus,
      getIndexProgress: () => this.db.progress
    };
  }
  async onload() {
    await this.loadSettings();
    this.statusBarItem = this.addStatusBarItem();
    this.db = new VectorDatabase(this);
    await this.db.loadCache();
    this.addSettingTab(new SemanticSearchSettingTab(this.app, this));
    this.addRibbonIcon("search-code", "Semantic Search", () => {
      new SemanticSearchModal(this.app, this).open();
    });
    this.addCommand({
      id: "open-semantic-search",
      name: "Open Search Window",
      callback: () => {
        new SemanticSearchModal(this.app, this).open();
      }
    });
    this.addCommand({
      id: "start-indexing",
      name: "Start / Update Indexing",
      callback: () => {
        if (!this.settings.apiKey && this.settings.provider === "api") {
          new import_obsidian5.Notice("API Key missing in settings!");
          return;
        }
        this.db.startIndexing(this.statusBarItem);
      }
    });
    setTimeout(() => {
      if (this.settings.provider === "ollama" || this.settings.apiKey) {
        this.db.startIndexing(this.statusBarItem);
      }
    }, 5e3);
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
