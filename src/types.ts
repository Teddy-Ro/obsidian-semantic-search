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

export interface SemanticSearchSettings {
    provider: 'ollama' | 'api';
    ollamaUrl: string;
    ollamaModel: string;
    apiUrl: string;
    apiKey: string;
    apiModel: string;
    chunkSize: number;
    chunkOverlap: number;
}

export interface ChunkData {
    text: string;
    vector: number[];
}

export interface FileCache {
    mtime: number;
    chunks: ChunkData[];
}