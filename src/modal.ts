import { App, Modal, Notice, setIcon, TFile, WorkspaceLeaf, MarkdownView } from 'obsidian';
import type SemanticSearchPlugin from './main';
import { SemanticSearchResult } from './types';

export class SemanticSearchModal extends Modal {
    private queryInput: HTMLInputElement;
    private limitInput: HTMLInputElement;
    private resultsContainer: HTMLElement;
    
    private historyIndex: number = 0; 
    private currentDraft: string = ''; 

    constructor(app: App, private plugin: SemanticSearchPlugin) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('semantic-search-modal');

        contentEl.createEl('h2', { text: '🧠 Semantic Search' });

        const controls = contentEl.createDiv({ cls: 'semantic-search-controls', attr: { style: 'display: flex; gap: 10px; margin-bottom: 20px;' } });
        
        this.queryInput = controls.createEl('input', { 
            type: 'text', 
            placeholder: 'Enter idea... (Use ↑/↓ for history)',
            attr: { style: 'flex-grow: 1; padding: 10px; font-size: 16px;' }
        });
        
        const history = this.plugin.settings.searchHistory;
        
        this.queryInput.value = '';
        
        this.historyIndex = history.length; 

        setTimeout(() => this.queryInput.focus(), 50);

        this.limitInput = controls.createEl('input', {
            type: 'number',
            value: '5',
            attr: { min: '1', max: '20', style: 'width: 60px; text-align: center;' }
        });

        const searchBtn = controls.createEl('button', { text: 'Search', cls: 'mod-cta' });
        this.resultsContainer = contentEl.createDiv({ cls: 'semantic-search-results', attr: { style: 'max-height: 400px; overflow-y: auto;' } });

        const performSearch = async () => {
            const query = this.queryInput.value.trim();
            if (!query) return;

            await this.saveToHistory(query);

            searchBtn.textContent = 'Searching...';
            searchBtn.disabled = true;
            this.resultsContainer.empty();
            
            try {
                const limit = parseInt(this.limitInput.value) || 5;
                const results = await this.plugin.api.search(query, limit, 0.3);
                
                if (results.length === 0) {
                    this.resultsContainer.createDiv({ text: 'No relevant notes found.', attr: { style: 'color: var(--text-muted); text-align: center; margin-top: 20px;' } });
                } else {
                    results.forEach(res => this.renderResult(res));
                }
            } catch (e: any) {
                new Notice('Search error: ' + e.message);
            } finally {
                searchBtn.textContent = 'Search';
                searchBtn.disabled = false;
                this.queryInput.focus();
            }
        };

        searchBtn.addEventListener('click', performSearch);

        this.queryInput.addEventListener('keydown', (e) => {
            const hist = this.plugin.settings.searchHistory;
            
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            } 
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                
                if (this.historyIndex === hist.length) {
                    this.currentDraft = this.queryInput.value;
                }

                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.queryInput.value = hist[this.historyIndex];
                    setTimeout(() => { this.queryInput.selectionStart = this.queryInput.selectionEnd = this.queryInput.value.length; }, 0);
                }
            } 
            else if (e.key === 'ArrowDown') {
                e.preventDefault();
                
                if (this.historyIndex < hist.length) {
                    this.historyIndex++;
                    
                    if (this.historyIndex === hist.length) {
                        this.queryInput.value = this.currentDraft;
                    } else {
                        this.queryInput.value = hist[this.historyIndex];
                    }
                    setTimeout(() => { this.queryInput.selectionStart = this.queryInput.selectionEnd = this.queryInput.value.length; }, 0);
                }
            }
        });

        this.queryInput.addEventListener('input', () => {
             this.historyIndex = this.plugin.settings.searchHistory.length;
             this.currentDraft = this.queryInput.value;
        });
    }

    private async saveToHistory(query: string) {
        const limit = this.plugin.settings.historyLimit;
        
        if (limit === 0) return;

        const history = this.plugin.settings.searchHistory;
        
        if (history.length > 0 && history[history.length - 1] === query) {
            this.historyIndex = history.length;
            this.currentDraft = '';
            return;
        }

        history.push(query);
        
        while (history.length > limit) {
            history.shift();
        }
        
        await this.plugin.saveSettings();
        
        this.historyIndex = history.length;
        this.currentDraft = '';
    }

    private renderResult(result: SemanticSearchResult) {
        const card = this.resultsContainer.createDiv({ 
            cls: 'semantic-search-card', 
            attr: { style: 'border: 1px solid var(--background-modifier-border); border-radius: 8px; padding: 12px; margin-bottom: 12px; cursor: pointer; transition: background 0.2s;' }
        });
        
        card.addEventListener('mouseenter', () => card.style.background = 'var(--background-secondary)');
        card.addEventListener('mouseleave', () => card.style.background = 'transparent');

        const header = card.createDiv({ attr: { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;' } });
        
        const fileIconTitle = header.createDiv({ attr: { style: 'display: flex; align-items: center; gap: 6px; font-weight: bold; color: var(--text-accent);' } });
        setIcon(fileIconTitle.createSpan(), 'file-text');
        fileIconTitle.createSpan({ text: result.path.replace(/\.md$/, '') });

        header.createSpan({ text: `Score: ${(result.score * 100).toFixed(1)}%`, attr: { style: 'font-size: 12px; color: var(--text-muted); background: var(--background-secondary); padding: 2px 6px; border-radius: 10px;' } });

        card.createDiv({ text: result.content, attr: { style: 'font-size: 13px; color: var(--text-normal); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; opacity: 0.9;' } });

        card.addEventListener('click', async () => {
            const file = this.app.vault.getAbstractFileByPath(result.path);
            if (file instanceof TFile) {
                const leaf = this.app.workspace.getLeaf(false);
                await leaf.openFile(file);
                this.scrollToText(leaf, result.content);
                this.close();
            }
        });
    }

    private scrollToText(leaf: WorkspaceLeaf, textToFind: string) {
        setTimeout(() => {
            const view = leaf.view;
            if (view instanceof MarkdownView) {
                const editor = view.editor;
                const fileContent = editor.getValue();
                const firstLine = textToFind.split('\n')[0].trim();
                if (!firstLine) return;
                
                const lines = fileContent.split('\n');
                let foundLine = -1;
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].includes(firstLine)) { foundLine = i; break; }
                }

                if (foundLine !== -1) {
                    editor.setCursor({ line: foundLine, ch: 0 });
                    editor.scrollIntoView({ from: { line: foundLine, ch: 0 }, to: { line: foundLine, ch: 0 } }, true);
                }
            }
        }, 100);
    }

    onClose() { this.contentEl.empty(); }
}