export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function stripFrontmatter(text: string): string {
    return text.replace(/^---\n[\s\S]*?\n---\n/, '');
}

export function chunkText(text: string, size: number, overlap: number): string[] {
    const cleanText = stripFrontmatter(text);
    const paragraphs = cleanText.split(/\n\s*\n/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const p of paragraphs) {
        if (!p.trim()) continue;
        if (currentChunk.length + p.length > size && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = currentChunk.substring(currentChunk.length - overlap) + '\n\n' + p;
        } else {
            currentChunk += (currentChunk ? '\n\n' : '') + p;
        }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());
    return chunks;
}