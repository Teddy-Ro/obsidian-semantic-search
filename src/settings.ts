import { App, PluginSettingTab, Setting, ButtonComponent } from 'obsidian';
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
    private warningEl: HTMLElement;

    constructor(app: App, private plugin: SemanticSearchPlugin) { 
        super(app, plugin); 
    }

    private checkConfigMismatch(): boolean {
        const currentSig = this.plugin.db.generateSignature();
        const savedSig = this.plugin.db.savedConfigSignature;
        if (!savedSig) return false; // Treat empty/new db as valid
        return currentSig !== savedSig;
    }

    private parseSignature(sig: string): string {
        if (!sig) return 'None (New DB)';
        const parts = sig.split('|');
        if (parts.length < 4) return sig;
        return `Provider: ${parts[0]}, Model: ${parts[1]}, Chunk: ${parts[2]}, Overlap: ${parts[3]}`;
    }

    private updateWarning() {
        if (!this.warningEl) return;
        
        const isMismatch = this.checkConfigMismatch();
        
        if (isMismatch) {
            this.warningEl.empty();
            this.warningEl.style.display = 'block';

            const header = this.warningEl.createDiv({ cls: 'setting-item-name', text: '⚠️ Configuration Mismatch!', attr: { style: 'font-weight: bold; font-size: 1.1em; color: var(--text-on-accent); margin-bottom: 8px;' } });
            
            const desc = this.warningEl.createDiv({ attr: { style: 'color: var(--text-on-accent); margin-bottom: 10px; font-size: 0.9em;' } });
            
            const saved = this.parseSignature(this.plugin.db.savedConfigSignature);
            const current = this.parseSignature(this.plugin.db.generateSignature());

            desc.createDiv({ text: `The database was built with different settings than currently selected. Search is disabled until resolved.` });
            desc.createEl('br');
            desc.createDiv({ text: `💾 Database (Saved):`, attr: { style: 'font-weight: bold; opacity: 0.8;' } });
            desc.createDiv({ text: saved, attr: { style: 'font-family: monospace; margin-bottom: 5px;' } });
            desc.createDiv({ text: `⚙️ Current Settings:`, attr: { style: 'font-weight: bold; opacity: 0.8;' } });
            desc.createDiv({ text: current, attr: { style: 'font-family: monospace;' } });

            const btnContainer = this.warningEl.createDiv({ attr: { style: 'margin-top: 15px; display: flex; gap: 10px;' } });
            
            new ButtonComponent(btnContainer)
                .setButtonText('🔄 Re-index Database')
                .setCta()
                .onClick(async () => {
                    this.plugin.db.clearCache();
                    this.plugin.db.startIndexing(this.plugin.statusBarItem);
                    this.updateWarning();
                    new ButtonComponent(btnContainer).setButtonText('Indexing started...').setDisabled(true);
                });

        } else {
            this.warningEl.style.display = 'none';
        }
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: '⚙️ Semantic Search Settings' });

        // --- Warning Block ---
        this.warningEl = containerEl.createDiv({ 
            cls: 'semantic-search-warning',
            attr: { 
                style: 'background-color: var(--background-modifier-error); padding: 15px; border-radius: 8px; margin-bottom: 20px; display: none;' 
            }
        });
        
        this.updateWarning();
        // ---------------------

        new Setting(containerEl)
            .setName('Embeddings Provider')
            .setDesc('Choose who generates vectors for your notes.')
            .addDropdown(drop => drop
                .addOption('ollama', 'Local (Ollama)')
                .addOption('api', 'API (OpenRouter, OpenAI, etc.)')
                .setValue(this.plugin.settings.provider)
                .onChange(async (v: 'ollama' | 'api') => {
                    this.plugin.settings.provider = v;
                    await this.plugin.saveSettings();
                    this.updateWarning();
                    this.display();
                })
            );

        if (this.plugin.settings.provider === 'ollama') {
            new Setting(containerEl).setName('Ollama URL')
                .addText(t => t.setValue(this.plugin.settings.ollamaUrl).onChange(async v => { 
                    this.plugin.settings.ollamaUrl = v; 
                    await this.plugin.saveSettings(); 
                }));
            
            new Setting(containerEl).setName('Ollama Model')
                .setDesc('Vector model (e.g., nomic-embed-text)')
                .addText(t => t.setValue(this.plugin.settings.ollamaModel).onChange(async v => { 
                    this.plugin.settings.ollamaModel = v; 
                    await this.plugin.saveSettings();
                    this.updateWarning();
                }));
        } else {
            new Setting(containerEl).setName('API URL')
                .addText(t => t.setValue(this.plugin.settings.apiUrl).onChange(async v => { 
                    this.plugin.settings.apiUrl = v; 
                    await this.plugin.saveSettings(); 
                }));
            new Setting(containerEl).setName('API Key')
                .addText(t => t.setPlaceholder('sk-...').setValue(this.plugin.settings.apiKey).onChange(async v => { 
                    this.plugin.settings.apiKey = v; 
                    await this.plugin.saveSettings(); 
                }));
            new Setting(containerEl).setName('API Model')
                .addText(t => t.setValue(this.plugin.settings.apiModel).onChange(async v => { 
                    this.plugin.settings.apiModel = v; 
                    await this.plugin.saveSettings();
                    this.updateWarning();
                }));
        }

        containerEl.createEl('h3', { text: 'Chunking Settings', attr: { style: 'margin-top: 20px;' } });
        
        new Setting(containerEl)
            .setName('Chunk Size')
            .setDesc('Characters per vector segment.')
            .addText(t => t.setValue(this.plugin.settings.chunkSize.toString()).onChange(async v => {
                const val = parseInt(v);
                if (!isNaN(val)) {
                    this.plugin.settings.chunkSize = val;
                    await this.plugin.saveSettings();
                    this.updateWarning();
                }
            }));

        new Setting(containerEl)
            .setName('Overlap')
            .setDesc('Characters overlap between chunks.')
            .addText(t => t.setValue(this.plugin.settings.chunkOverlap.toString()).onChange(async v => {
                const val = parseInt(v);
                if (!isNaN(val)) {
                    this.plugin.settings.chunkOverlap = val;
                    await this.plugin.saveSettings();
                    this.updateWarning();
                }
            }));

        containerEl.createEl('h3', { text: 'Database Management', attr: { style: 'margin-top: 20px;' } });

        new Setting(containerEl)
            .setName('Clear Vector Cache')
            .setDesc('Deletes all vectors. Full re-indexing required.')
            .addButton(btn => btn
                .setButtonText('🗑️ Clear Cache')
                .setWarning()
                .onClick(() => { 
                    this.plugin.db.clearCache(); 
                    this.updateWarning();
                })
            );
            
        new Setting(containerEl)
            .setName('Start Full Indexing')
            .addButton(btn => btn
                .setButtonText('🚀 Index Now')
                .setCta()
                .onClick(() => { 
                    this.plugin.db.startIndexing(this.plugin.statusBarItem);
                    setTimeout(() => this.updateWarning(), 500);
                })
            );
    }
}