 

A powerful, privacy-first semantic search plugin for Obsidian. It indexes your notes using vector embeddings and allows you to search for concepts, ideas, and meanings—not just exact keywords.

  

Beyond being a great search tool, **it acts as an API Provider** for other plugins, allowing developers to easily add **RAG (Retrieval-Augmented Generation)** to their own AI plugins via Loose Coupling.


<img width="1272" height="1260" alt="plugin" src="https://github.com/user-attachments/assets/057f5a41-c549-4676-a660-8bc053452b5f" />

## Features

  

- **Local & Private:** Native support for [Ollama](https://ollama.com/) (e.g., `nomic-embed-text`). Keep your data 100% offline.

- **Cloud APIs Support:** Supports OpenAI, OpenRouter, Together AI, or any OpenAI-compatible embeddings endpoint.

- **Smart UI:** A beautiful search modal that finds relevant paragraphs. Clicking a result opens the note and scrolls exactly to the matched text.

- **Background Indexing:** Incremental indexing runs in the background. It only updates vectors for newly created or modified files, keeping Obsidian blazing fast.

- **Developer API:** Exposes a public API so other Obsidian plugins can query your local knowledge base.

  

## Installation

  

1. Download the latest `main.js` and `manifest.json` from the Releases page.

2. Place them in `VaultFolder/.obsidian/plugins/obsidian-semantic-search/`.

3. Reload Obsidian and enable the plugin.

  

## Configuration

  

1. Go to Obsidian Settings > **Semantic Search**.

2. Choose your provider:

   - **Ollama (Local):** Make sure Ollama is running. Pull the recommended model via terminal: `ollama run nomic-embed-text`.

   - **API:** Enter your API URL (e.g., `https://api.openai.com/v1/embeddings`), API Key, and Model name.

3. Click **🚀 Index Now** to build your initial knowledge base.

  

## 💻 For Developers (RAG API)

  

Building an AI Chat plugin? You don't need to write your own vector database! You can consume this plugin's API to fetch relevant context for your LLM prompts (RAG).

  

### 1. Define the Interface in your plugin:

```Typescript

export interface SemanticSearchResult {

    path: string;

    content: string;

    score: number;

}

  

export interface SemanticSearchAPI {

    search(query: string, limit?: number, threshold?: number): Promise<SemanticSearchResult[]>;

    isIndexing(): boolean;

    getIndexProgress(): number;

}

```

### 2. Fetch the API via Obsidian's Plugin Manager:


```TypeScript

  

function getSemanticSearchApi(app: App): SemanticSearchAPI | null {

    // @ts-ignore: Accessing internal Obsidian API

    const plugin = app.plugins.getPlugin('obsidian-semantic-search');

    if (plugin && plugin.api && typeof plugin.api.search === 'function') {

        return plugin.api as SemanticSearchAPI;

    }

    return null;

}
```

### 3. Use it in your generation logic:


```TypeScript

  

const searchApi = getSemanticSearchApi(this.app);

  

if (searchApi) {

    // Search the user's vault for top 3 relevant chunks with a minimum score of 0.6

    const results = await searchApi.search("How does the brain work?", 3, 0.6);

    let ragContext = results.map(r => `[From: ${r.path}]\n${r.content}`).join('\n\n');

    console.log("RAG Context gathered:", ragContext);

    // Append this context to your LLM prompt!

}
```
###  Building from Source

```Bash
npm install
npm run build
```
