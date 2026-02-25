import { Plugin, Notice } from 'obsidian';
import { SemanticSearchAPI, SemanticSearchSettings } from './types';
import { DEFAULT_SETTINGS, SemanticSearchSettingTab } from './settings';
import { VectorDatabase } from './database';
import { SemanticSearchModal } from './modal';

export default class SemanticSearchPlugin extends Plugin {
    settings: SemanticSearchSettings;
    db: VectorDatabase;
    statusBarItem: HTMLElement;

    public lastQuery: string = ''; 

    public api: SemanticSearchAPI = {
        search: async (query, limit, threshold) => await this.db.search(query, limit, threshold),
        isIndexing: () => this.db.isIndexingStatus,
        getIndexProgress: () => this.db.progress
    };

    async onload() {
        await this.loadSettings();
        
        this.statusBarItem = this.addStatusBarItem();
        this.db = new VectorDatabase(this);
        await this.db.loadCache();

        this.addSettingTab(new SemanticSearchSettingTab(this.app, this));

        this.addRibbonIcon('search-code', 'Semantic Search', () => {
            new SemanticSearchModal(this.app, this).open();
        });

        this.addCommand({
            id: 'open-semantic-search',
            name: 'Open Search Window',
            callback: () => { new SemanticSearchModal(this.app, this).open(); }
        });

        this.addCommand({
            id: 'start-indexing',
            name: 'Start / Update Indexing',
            callback: () => {
                if (!this.settings.apiKey && this.settings.provider === 'api') {
                    new Notice('API Key missing in settings!'); return;
                }
                this.db.startIndexing(this.statusBarItem);
            }
        });

        setTimeout(() => {
            if (this.settings.provider === 'ollama' || this.settings.apiKey) {
                this.db.startIndexing(this.statusBarItem);
            }
        }, 5000);
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}