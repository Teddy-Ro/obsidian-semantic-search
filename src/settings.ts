import { App, PluginSettingTab, Setting } from 'obsidian';
import type SemanticSearchPlugin from './main';
import { SemanticSearchSettings } from './types';

export const DEFAULT_SETTINGS: SemanticSearchSettings = {
    provider: 'ollama',
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'nomic-embed-text',
    apiUrl: 'https://api.openai.com/v1/embeddings',
    apiKey: '',
    apiModel: 'text-embedding-3-small',
    chunkSize: 800,
    chunkOverlap: 100
};

export class SemanticSearchSettingTab extends PluginSettingTab {
    constructor(app: App, private plugin: SemanticSearchPlugin) { super(app, plugin); }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: '⚙️ Semantic Search Settings' });

        new Setting(containerEl)
            .setName('Embeddings Provider')
            .setDesc('Choose the provider to generate vectors for your notes.')
            .addDropdown(drop => drop
                .addOption('ollama', 'Local (Ollama)')
                .addOption('api', 'API (OpenRouter, OpenAI, Together, etc.)')
                .setValue(this.plugin.settings.provider)
                .onChange(async (v: 'ollama' | 'api') => {
                    this.plugin.settings.provider = v;
                    await this.plugin.saveSettings();
                    this.display();
                })
            );

        if (this.plugin.settings.provider === 'ollama') {
            new Setting(containerEl).setName('Ollama URL')
                .addText(t => t.setValue(this.plugin.settings.ollamaUrl).onChange(async v => { this.plugin.settings.ollamaUrl = v; await this.plugin.saveSettings(); }));
            new Setting(containerEl).setName('Ollama Model')
                .setDesc('Model for vectors (nomic-embed-text is recommended)')
                .addText(t => t.setValue(this.plugin.settings.ollamaModel).onChange(async v => { this.plugin.settings.ollamaModel = v; await this.plugin.saveSettings(); }));
        } else {
            new Setting(containerEl).setName('API URL')
                .setDesc('Full endpoint URL (e.g., https://api.openai.com/v1/embeddings)')
                .addText(t => t.setValue(this.plugin.settings.apiUrl).onChange(async v => { this.plugin.settings.apiUrl = v; await this.plugin.saveSettings(); }));
            new Setting(containerEl).setName('API Key')
                .addText(t => t.setPlaceholder('sk-...').setValue(this.plugin.settings.apiKey).onChange(async v => { this.plugin.settings.apiKey = v; await this.plugin.saveSettings(); }));
            new Setting(containerEl).setName('API Model')
                .setDesc('Model name (e.g., text-embedding-3-small)')
                .addText(t => t.setValue(this.plugin.settings.apiModel).onChange(async v => { this.plugin.settings.apiModel = v; await this.plugin.saveSettings(); }));
        }

        containerEl.createEl('h3', { text: 'Chunking Settings', attr: { style: 'margin-top: 20px;' } });
        
        new Setting(containerEl)
            .setName('Chunk Size')
            .setDesc('Number of characters per chunk for search (500 - 1500)')
            .addText(t => t.setValue(this.plugin.settings.chunkSize.toString()).onChange(async v => {
                this.plugin.settings.chunkSize = parseInt(v) || 800;
                await this.plugin.saveSettings();
            }));

        new Setting(containerEl)
            .setName('Chunk Overlap')
            .setDesc('Number of overlapping characters between consecutive chunks to preserve context.')
            .addText(t => t.setValue(this.plugin.settings.chunkOverlap.toString()).onChange(async v => {
                this.plugin.settings.chunkOverlap = parseInt(v) || 100;
                await this.plugin.saveSettings();
            }));

        containerEl.createEl('h3', { text: 'Database Management', attr: { style: 'margin-top: 20px;' } });

        new Setting(containerEl)
            .setName('Clear Vector Cache')
            .setDesc('Delete all saved vectors. A full re-indexing will be required.')
            .addButton(btn => btn
                .setButtonText('🗑️ Clear Cache')
                .setWarning()
                .onClick(() => { this.plugin.db.clearCache(); })
            );
            
        new Setting(containerEl)
            .setName('Run Full Indexing')
            .setDesc('Scans all files and updates vectors for modified/new notes.')
            .addButton(btn => btn
                .setButtonText('🚀 Index Now')
                .setCta()
                .onClick(() => { this.plugin.db.startIndexing(this.plugin.statusBarItem); })
            );
    }
}