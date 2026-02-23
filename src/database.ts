import { Notice, TFile } from 'obsidian';
import type SemanticSearchPlugin from './main';
import { FileCache, SemanticSearchResult, ChunkData, VectorDatabaseFile } from './types';
import { EmbeddingClient } from './client';
import { chunkText, cosineSimilarity } from './utils';

export class VectorDatabase {
    private cachePath: string;
    private cache: Record<string, FileCache> = {};
    public savedConfigSignature: string = ''; 
    public isIndexingStatus = false;
    public progress = 0;

    constructor(private plugin: SemanticSearchPlugin) {
        // Safe check for manifest directory
        const dir = this.plugin.manifest.dir || '.';
        this.cachePath = `${dir}/vector_cache.json`;
    }

    public generateSignature(): string {
        const s = this.plugin.settings;
        if (s.provider === 'ollama') {
            return `ollama|${s.ollamaModel}|${s.chunkSize}|${s.chunkOverlap}`;
        } else {
            return `api|${s.apiModel}|${s.chunkSize}|${s.chunkOverlap}`;
        }
    }

    async loadCache() {
        try {
            if (await this.plugin.app.vault.adapter.exists(this.cachePath)) {
                const dataStr = await this.plugin.app.vault.adapter.read(this.cachePath);
                const data = JSON.parse(dataStr);

                // Handle legacy cache format (no wrapper object)
                if (!data.configSignature && !data.files && !data.files) {
                    this.cache = data; 
                    this.savedConfigSignature = ''; 
                } else {
                    // Proper casting
                    const dbData = data as VectorDatabaseFile;
                    this.cache = dbData.files || {};
                    // FIX IS HERE: Use ?? to safely handle undefined
                    this.savedConfigSignature = dbData.configSignature ?? '';
                }
            } else {
                // Create folder if it doesn't exist
                const dir = this.plugin.manifest.dir;
                if (dir) await this.plugin.app.vault.adapter.mkdir(dir).catch(() => {});
                
                this.savedConfigSignature = this.generateSignature();
            }
        } catch (e) { 
            console.error("Error loading vector cache:", e); 
            // Reset on error
            this.cache = {};
            this.savedConfigSignature = '';
        }
    }

    async saveCache() {
        try {
            const dbData: VectorDatabaseFile = {
                configSignature: this.generateSignature(),
                files: this.cache
            };
            await this.plugin.app.vault.adapter.write(this.cachePath, JSON.stringify(dbData));
            this.savedConfigSignature = dbData.configSignature || '';
        } catch (e) { console.error("Error saving vector cache:", e); }
    }

    clearCache() {
        this.cache = {};
        this.savedConfigSignature = this.generateSignature(); 
        this.saveCache();
        new Notice('Vector cache cleared!');
    }

    async startIndexing(statusBarItem: HTMLElement) {
        if (this.isIndexingStatus) return;
        
        // Update signature in memory when indexing starts (user accepted new settings)
        this.savedConfigSignature = this.generateSignature();

        this.isIndexingStatus = true;
        this.progress = 0;
        
        const files = this.plugin.app.vault.getMarkdownFiles();
        const client = new EmbeddingClient(this.plugin.settings);
        let processed = 0;
        let toUpdate: TFile[] = [];

        const existingPaths = new Set(files.map(f => f.path));
        
        // Cleanup deleted files
        for (const path in this.cache) {
            if (!existingPaths.has(path)) delete this.cache[path];
        }

        // Find modified files
        for (const file of files) {
            const cached = this.cache[file.path];
            if (!cached || cached.mtime < file.stat.mtime) {
                toUpdate.push(file);
            }
        }

        if (toUpdate.length === 0) {
            this.isIndexingStatus = false;
            await this.saveCache(); 
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
                // Small delay to keep UI responsive
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
        // Protection against using wrong embeddings
        if (this.savedConfigSignature && this.savedConfigSignature !== this.generateSignature()) {
            console.warn("Semantic Search: Database signature mismatch. Search results may be inaccurate.");
            return [];
        }

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