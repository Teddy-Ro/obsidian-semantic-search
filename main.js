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
  chunkOverlap: 100
};
var SemanticSearchSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "\u2699\uFE0F \u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 Semantic Search" });
    new import_obsidian.Setting(containerEl).setName("\u041F\u0440\u043E\u0432\u0430\u0439\u0434\u0435\u0440 Embeddings").setDesc("\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435, \u043A\u0442\u043E \u0431\u0443\u0434\u0435\u0442 \u0441\u043E\u0437\u0434\u0430\u0432\u0430\u0442\u044C \u0432\u0435\u043A\u0442\u043E\u0440\u0430 \u0434\u043B\u044F \u0432\u0430\u0448\u0438\u0445 \u0437\u0430\u043C\u0435\u0442\u043E\u043A.").addDropdown(
      (drop) => drop.addOption("ollama", "\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u043E (Ollama)").addOption("api", "API (OpenRouter, OpenAI, \u0412\u043C\u0435\u0441\u0442\u0435 \u0438 \u0434\u0440.)").setValue(this.plugin.settings.provider).onChange(async (v) => {
        this.plugin.settings.provider = v;
        await this.plugin.saveSettings();
        this.display();
      })
    );
    if (this.plugin.settings.provider === "ollama") {
      new import_obsidian.Setting(containerEl).setName("Ollama URL").addText((t) => t.setValue(this.plugin.settings.ollamaUrl).onChange(async (v) => {
        this.plugin.settings.ollamaUrl = v;
        await this.plugin.saveSettings();
      }));
      new import_obsidian.Setting(containerEl).setName("Ollama Model").setDesc("\u041C\u043E\u0434\u0435\u043B\u044C \u0434\u043B\u044F \u0432\u0435\u043A\u0442\u043E\u0440\u043E\u0432 (\u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F nomic-embed-text)").addText((t) => t.setValue(this.plugin.settings.ollamaModel).onChange(async (v) => {
        this.plugin.settings.ollamaModel = v;
        await this.plugin.saveSettings();
      }));
    } else {
      new import_obsidian.Setting(containerEl).setName("API URL").setDesc("\u041F\u043E\u043B\u043D\u044B\u0439 \u043F\u0443\u0442\u044C \u0434\u043E \u044D\u043D\u0434\u043F\u043E\u0438\u043D\u0442\u0430 (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: https://api.openai.com/v1/embeddings)").addText((t) => t.setValue(this.plugin.settings.apiUrl).onChange(async (v) => {
        this.plugin.settings.apiUrl = v;
        await this.plugin.saveSettings();
      }));
      new import_obsidian.Setting(containerEl).setName("API Key").addText((t) => t.setPlaceholder("sk-...").setValue(this.plugin.settings.apiKey).onChange(async (v) => {
        this.plugin.settings.apiKey = v;
        await this.plugin.saveSettings();
      }));
      new import_obsidian.Setting(containerEl).setName("API Model").setDesc("\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043C\u043E\u0434\u0435\u043B\u0438 (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 text-embedding-3-small)").addText((t) => t.setValue(this.plugin.settings.apiModel).onChange(async (v) => {
        this.plugin.settings.apiModel = v;
        await this.plugin.saveSettings();
      }));
    }
    containerEl.createEl("h3", { text: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0440\u0430\u0437\u0431\u0438\u0432\u043A\u0438 (Chunking)", attr: { style: "margin-top: 20px;" } });
    new import_obsidian.Setting(containerEl).setName("\u0420\u0430\u0437\u043C\u0435\u0440 \u043A\u0443\u0441\u043A\u0430 (Chunk Size)").setDesc("\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432 \u0432 \u043E\u0434\u043D\u043E\u043C \u0430\u0431\u0437\u0430\u0446\u0435 \u0434\u043B\u044F \u043F\u043E\u0438\u0441\u043A\u0430 (500 - 1500)").addText((t) => t.setValue(this.plugin.settings.chunkSize.toString()).onChange(async (v) => {
      this.plugin.settings.chunkSize = parseInt(v) || 800;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("\u041F\u0435\u0440\u0435\u043A\u0440\u044B\u0442\u0438\u0435 (Overlap)").setDesc("\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432, \u043F\u0435\u0440\u0435\u0445\u043E\u0434\u044F\u0449\u0438\u0445 \u0438\u0437 \u043F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0435\u0433\u043E \u043A\u0443\u0441\u043A\u0430 \u0432 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0434\u043B\u044F \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F \u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u0430.").addText((t) => t.setValue(this.plugin.settings.chunkOverlap.toString()).onChange(async (v) => {
      this.plugin.settings.chunkOverlap = parseInt(v) || 100;
      await this.plugin.saveSettings();
    }));
    containerEl.createEl("h3", { text: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0431\u0430\u0437\u043E\u0439 \u0434\u0430\u043D\u043D\u044B\u0445", attr: { style: "margin-top: 20px;" } });
    new import_obsidian.Setting(containerEl).setName("\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u043A\u044D\u0448 \u0432\u0435\u043A\u0442\u043E\u0440\u043E\u0432").setDesc("\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0432\u0441\u0435 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043D\u044B\u0435 \u0432\u0435\u043A\u0442\u043E\u0440\u0430. \u041F\u043E\u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F \u043F\u043E\u043B\u043D\u0430\u044F \u043F\u0435\u0440\u0435\u0438\u043D\u0434\u0435\u043A\u0441\u0430\u0446\u0438\u044F.").addButton(
      (btn) => btn.setButtonText("\u{1F5D1}\uFE0F \u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u043A\u044D\u0448").setWarning().onClick(() => {
        this.plugin.db.clearCache();
      })
    );
    new import_obsidian.Setting(containerEl).setName("\u0417\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u043F\u043E\u043B\u043D\u0443\u044E \u0438\u043D\u0434\u0435\u043A\u0441\u0430\u0446\u0438\u044E").setDesc("\u0421\u043A\u0430\u043D\u0438\u0440\u0443\u0435\u0442 \u0432\u0441\u0435 \u0444\u0430\u0439\u043B\u044B \u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u044F\u0435\u0442 \u0432\u0435\u043A\u0442\u043E\u0440\u0430 \u0434\u043B\u044F \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u043D\u044B\u0445/\u043D\u043E\u0432\u044B\u0445 \u0437\u0430\u043C\u0435\u0442\u043E\u043A.").addButton(
      (btn) => btn.setButtonText("\u{1F680} \u0418\u043D\u0434\u0435\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441").setCta().onClick(() => {
        this.plugin.db.startIndexing(this.plugin.statusBarItem);
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
    this.isIndexingStatus = false;
    this.progress = 0;
    this.cachePath = `${this.plugin.manifest.dir}/vector_cache.json`;
  }
  async loadCache() {
    try {
      if (await this.plugin.app.vault.adapter.exists(this.cachePath)) {
        const data = await this.plugin.app.vault.adapter.read(this.cachePath);
        this.cache = JSON.parse(data);
      } else {
        await this.plugin.app.vault.adapter.mkdir(this.plugin.manifest.dir).catch(() => {
        });
      }
    } catch (e) {
      console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u043A\u044D\u0448\u0430", e);
    }
  }
  async saveCache() {
    try {
      await this.plugin.app.vault.adapter.write(this.cachePath, JSON.stringify(this.cache));
    } catch (e) {
      console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F \u043A\u044D\u0448\u0430", e);
    }
  }
  clearCache() {
    this.cache = {};
    this.saveCache();
    new import_obsidian3.Notice("\u041A\u044D\u0448 \u0432\u0435\u043A\u0442\u043E\u0440\u043E\u0432 \u043E\u0447\u0438\u0449\u0435\u043D!");
  }
  async startIndexing(statusBarItem) {
    if (this.isIndexingStatus)
      return;
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
      statusBarItem.setText("\u{1F50D} \u0412\u0441\u0435 \u0437\u0430\u043C\u0435\u0442\u043A\u0438 \u043F\u0440\u043E\u0438\u043D\u0434\u0435\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u044B");
      setTimeout(() => statusBarItem.setText(""), 3e3);
      return;
    }
    statusBarItem.setText(`\u{1F50D} \u0418\u043D\u0434\u0435\u043A\u0441\u0430\u0446\u0438\u044F: 0/${toUpdate.length}...`);
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
        statusBarItem.setText(`\u{1F50D} \u0418\u043D\u0434\u0435\u043A\u0441\u0430\u0446\u0438\u044F: ${processed}/${toUpdate.length} (${this.progress}%)`);
        if (processed % 10 === 0)
          await this.saveCache();
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (e) {
        console.error(`\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0438\u043D\u0434\u0435\u043A\u0441\u0430\u0446\u0438\u0438 ${file.path}:`, e);
      }
    }
    await this.saveCache();
    this.isIndexingStatus = false;
    statusBarItem.setText("\u2705 \u0418\u043D\u0434\u0435\u043A\u0441\u0430\u0446\u0438\u044F \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430");
    setTimeout(() => statusBarItem.setText(""), 3e3);
  }
  async search(query, limit = 5, threshold = 0.5) {
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
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("semantic-search-modal");
    contentEl.createEl("h2", { text: "\u{1F9E0} \u0421\u0435\u043C\u0430\u043D\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u041F\u043E\u0438\u0441\u043A" });
    const controls = contentEl.createDiv({ cls: "semantic-search-controls", attr: { style: "display: flex; gap: 10px; margin-bottom: 20px;" } });
    this.queryInput = controls.createEl("input", {
      type: "text",
      placeholder: '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u043C\u044B\u0441\u043B \u0438\u043B\u0438 \u0438\u0434\u0435\u044E (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: "\u043A\u0430\u043A \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u043C\u043E\u0437\u0433")...',
      attr: { style: "flex-grow: 1; padding: 10px; font-size: 16px;" }
    });
    this.limitInput = controls.createEl("input", {
      type: "number",
      value: "5",
      attr: { min: "1", max: "20", style: "width: 60px; text-align: center;" }
    });
    const searchBtn = controls.createEl("button", { text: "\u041D\u0430\u0439\u0442\u0438", cls: "mod-cta" });
    this.resultsContainer = contentEl.createDiv({ cls: "semantic-search-results", attr: { style: "max-height: 400px; overflow-y: auto;" } });
    const performSearch = async () => {
      const query = this.queryInput.value.trim();
      if (!query)
        return;
      searchBtn.textContent = "\u0418\u0449\u0443...";
      searchBtn.disabled = true;
      this.resultsContainer.empty();
      try {
        const limit = parseInt(this.limitInput.value) || 5;
        const results = await this.plugin.api.search(query, limit, 0.3);
        if (results.length === 0) {
          this.resultsContainer.createDiv({ text: "\u041D\u0438\u0447\u0435\u0433\u043E \u0440\u0435\u043B\u0435\u0432\u0430\u043D\u0442\u043D\u043E\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E.", attr: { style: "color: var(--text-muted); text-align: center; margin-top: 20px;" } });
        } else {
          results.forEach((res) => this.renderResult(res));
        }
      } catch (e) {
        new import_obsidian4.Notice("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u0438\u0441\u043A\u0430: " + e.message);
      } finally {
        searchBtn.textContent = "\u041D\u0430\u0439\u0442\u0438";
        searchBtn.disabled = false;
      }
    };
    searchBtn.addEventListener("click", performSearch);
    this.queryInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter")
        performSearch();
    });
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
    // ТОТ САМЫЙ ПУБЛИЧНЫЙ API ДЛЯ ВАШЕГО ЧАТА!
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
          new import_obsidian5.Notice("\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D API \u043A\u043B\u044E\u0447 \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445!");
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
