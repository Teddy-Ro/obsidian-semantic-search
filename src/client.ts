import { requestUrl } from 'obsidian';
import { SemanticSearchSettings } from './types';

export class EmbeddingClient {
    constructor(private settings: SemanticSearchSettings) {}

    async getEmbeddings(texts: string[]): Promise<number[][]> {
        if (this.settings.provider === 'ollama') return this.getOllamaEmbeddings(texts);
        return this.getApiEmbeddings(texts);
    }

    private async getOllamaEmbeddings(texts: string[]): Promise<number[][]> {
        const vectors: number[][] = [];
        for (const text of texts) {
            const res = await requestUrl({
                url: `${this.settings.ollamaUrl.replace(/\/$/, '')}/api/embeddings`,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: this.settings.ollamaModel, prompt: text })
            });
            vectors.push(res.json.embedding);
        }
        return vectors;
    }

    private async getApiEmbeddings(texts: string[]): Promise<number[][]> {
        const res = await requestUrl({
            url: this.settings.apiUrl,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.settings.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ model: this.settings.apiModel, input: texts })
        });
        const data = res.json.data.sort((a: any, b: any) => a.index - b.index);
        return data.map((d: any) => d.embedding);
    }
}