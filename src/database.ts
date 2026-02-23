import { Notice, TFile } from 'obsidian';
import type SemanticSearchPlugin from './main';
import { FileCache, SemanticSearchResult, ChunkData } from './types';
import { EmbeddingClient } from './client';
import { chunkText, cosineSimilarity } from './utils';

export class VectorDatabase {
    private cachePath: string;
    private pluginDir: string;
    private cache: Record<string, FileCache> = {};
    public isIndexingStatus = false;
    public progress = 0;

    constructor(private plugin: SemanticSearchPlugin) {
        // Устраняем ошибку TypeScript (string | undefined)
        this.pluginDir = this.plugin.manifest.dir || '.obsidian/plugins/obsidian-semantic-search';
        this.cachePath = `${this.pluginDir}/vector_cache.json`;
    }

    async loadCache() {
        try {
            if (await this.plugin.app.vault.adapter.exists(this.cachePath)) {
                const data = await this.plugin.app.vault.adapter.read(this.cachePath);
                this.cache = JSON.parse(data);
            } else {
                await this.plugin.app.vault.adapter.mkdir(this.pluginDir).catch(() => {});
            }
        } catch (e) { console.error("Error loading cache", e); }
    }

    async saveCache() {
        try {
            await this.plugin.app.vault.adapter.write(this.cachePath, JSON.stringify(this.cache));
        } catch (e) { console.error("Error saving cache", e); }
    }

    clearCache() {
        this.cache = {};
        this.saveCache();
        new Notice('Vector cache cleared!');
    }

    async startIndexing(statusBarItem: HTMLElement) {
        if (this.isIndexingStatus) return;
        this.isIndexingStatus = true;
        this.progress = 0;
        
        const files = this.plugin.app.vault.getMarkdownFiles();
        const client = new EmbeddingClient(this.plugin.settings);
        let processed = 0;
        let toUpdate: TFile[] = [];

        const existingPaths = new Set(files.map(f => f.path));
        for (const path in this.cache) {
            if (!existingPaths.has(path)) delete this.cache[path];
        }

        for (const file of files) {
            const cached = this.cache[file.path];
            if (!cached || cached.mtime < file.stat.mtime) {
                toUpdate.push(file);
            }
        }

        if (toUpdate.length === 0) {
            this.isIndexingStatus = false;
            statusBarItem.setText('🔍 All notes indexed');
            setTimeout(() => statusBarItem.setText(''), 3000);
            return;
        }

        statusBarItem.setText(`🔍 Indexing: 0/${toUpdate.length}...`);

        for (const file of toUpdate) {
            if (!this.isIndexingStatus) break;
            try {
                const content = await this.plugin.app.vault.read(file);
                const chunks = chunkText(content, this.plugin.settings.chunkSize, this.plugin.settings.chunkOverlap);
                
                if (chunks.length > 0) {
                    const vectors = await client.getEmbeddings(chunks);
                    const chunkData: ChunkData[] = chunks.map((text, i) => ({ text, vector: vectors[i] }));
                    this.cache[file.path] = { mtime: file.stat.mtime, chunks: chunkData };
                } else {
                    this.cache[file.path] = { mtime: file.stat.mtime, chunks: [] };
                }

                processed++;
                this.progress = Math.round((processed / toUpdate.length) * 100);
                statusBarItem.setText(`🔍 Indexing: ${processed}/${toUpdate.length} (${this.progress}%)`);
                
                if (processed % 10 === 0) await this.saveCache();
                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (e) {
                console.error(`Error indexing ${file.path}:`, e);
            }
        }

        await this.saveCache();
        this.isIndexingStatus = false;
        statusBarItem.setText('✅ Indexing complete');
        setTimeout(() => statusBarItem.setText(''), 3000);
    }

    async search(query: string, limit: number = 5, threshold: number = 0.5): Promise<SemanticSearchResult[]> {
        const client = new EmbeddingClient(this.plugin.settings);
        const queryVector = (await client.getEmbeddings([query]))[0];

        const results: SemanticSearchResult[] = [];

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
}