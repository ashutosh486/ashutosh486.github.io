// Main Portfolio Controller: loads, remembers and switches themes, and owns the theme chooser
class PortfolioController {
    constructor() {
        this.themes = {
            chatgpt: ChatGPTTheme,
            modelcard: ModelCardTheme,
            vscode: VSCodeTheme,
            terminal: TerminalTheme,
            // neural: NeuralTheme,
            notebook: NotebookTheme,
            paper: PaperTheme,
            // api: APIDocsTheme,
            book: BookTheme,
            // prompt: PromptTheme,
            apple: AppleTheme,
            scifi: SciFiTheme,
            // gitdiff: GitDiffTheme,
            // json: JsonTheme,
            // training: TrainingTheme
        };

        // Chooser details per theme: short label, one-line pitch, and the theme's own colours for its preview tile
        this.meta = {
            chatgpt: { label: 'ChatGPT', blurb: 'Ask anything, chat-style', icon: 'fas fa-comments', bg: '#212121', fg: '#ececec' },
            modelcard: { label: 'Model Card', blurb: 'My career as an ML model card', icon: 'fas fa-id-card', bg: '#ffffff', fg: '#111827' },
            vscode: { label: 'VS Code', blurb: 'Browse my résumé as source files', icon: 'fas fa-code', bg: '#1e1e1e', fg: '#4fc1ff' },
            terminal: { label: 'Terminal', blurb: 'Type commands, get answers', icon: 'fas fa-terminal', bg: '#000000', fg: '#4ade80' },
            notebook: { label: 'Notebook', blurb: 'A Jupyter notebook you can run', icon: 'fas fa-book', bg: '#ffffff', fg: '#f97316' },
            paper: { label: 'Paper', blurb: 'Typeset like a research paper', icon: 'fas fa-file-lines', bg: '#ffffff', fg: '#111111' },
            book: { label: 'Book', blurb: 'Read it chapter by chapter', icon: 'fas fa-book-open', bg: '#ffffff', fg: '#2563eb' },
            apple: { label: 'Persona Card', blurb: 'One clean profile card', icon: 'fas fa-address-card', bg: '#ffffff', fg: '#1d1d1f' },
            scifi: { label: 'Sci-Fi', blurb: 'A starship personnel console', icon: 'fas fa-satellite-dish', bg: '#000000', fg: '#22d3ee' }
        };

        this.currentTheme = null;
        this.dock = document.getElementById('themeDock');
        this.chooser = document.getElementById('themeChooser');
        this.list = document.getElementById('themeChooserList');
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        this.buildChooser();
        this.bindChooser();

        // URL first (shareable links), then this browser's last pick, then the first theme
        const initial = [location.hash.slice(1), this.readSaved()].find(key => this.themes[key]) || Object.keys(this.themes)[0];
        this.loadTheme(initial, { animate: false });

        // Ask on every visit, with the current theme preselected
        this.openChooser();

        // Back/Forward and hand-edited URLs switch themes too
        window.addEventListener('hashchange', () => {
            const key = location.hash.slice(1);
            if (this.themes[key] && key !== this.currentTheme) this.loadTheme(key, { updateUrl: false });
        });
    }

    metaFor(key) {
        return this.meta[key] || { label: this.themes[key].name, blurb: '', icon: 'fas fa-palette', bg: '#111111', fg: '#ededed' };
    }

    // ---------- theme loading ----------

    loadTheme(themeName, { animate = true, updateUrl = true, pushHistory = false } = {}) {
        const theme = this.themes[themeName];
        if (!theme) {
            console.error(`Theme "${themeName}" not found`);
            return;
        }

        const swap = () => {
            if (this.currentTheme) this.themes[this.currentTheme].cleanup?.();
            try {
                theme.render();
            } catch (error) {
                console.error(`Error rendering theme ${themeName}:`, error);
            }
            this.currentTheme = themeName;
            this.dock.setAttribute('aria-label', `Change theme, current theme ${theme.name}`);
            this.syncPage();
        };

        if (animate && document.startViewTransition && !this.reducedMotion.matches) {
            document.startViewTransition(swap);
        } else {
            swap();
        }

        if (updateUrl && location.hash.slice(1) !== themeName) {
            history[pushHistory ? 'pushState' : 'replaceState'](null, '', `#${themeName}`);
        }
        this.save(themeName);
    }

    // Title, browser UI colour and scrollbar/form colour scheme follow the active theme
    syncPage() {
        const meta = this.metaFor(this.currentTheme);
        document.title = `${portfolioContent.name} · ${this.themes[this.currentTheme].name}`;
        document.querySelector('meta[name="theme-color"]').content = meta.bg;
        document.body.style.backgroundColor = meta.bg;
        const [r, g, b] = [1, 3, 5].map(i => parseInt(meta.bg.slice(i, i + 2), 16));
        document.documentElement.style.colorScheme = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5 ? 'dark' : 'light';
    }

    // ---------- chooser ----------

    buildChooser() {
        const count = Object.keys(this.themes).length;
        document.getElementById('themeChooserHint').textContent = `One résumé, ${count} interfaces. Switch anytime from the theme button.`;
        const resume = portfolioContent.resume;
        if (resume) {
            const link = document.getElementById('themeChooserResume');
            link.href = resume;
            link.download = resume.split('/').pop();
            link.hidden = false;
        }
        this.list.innerHTML = Object.entries(this.themes).map(([key, theme]) => {
            const meta = this.metaFor(key);
            return `
                <button type="button" class="chooser-item" data-theme="${key}">
                    <span class="theme-tile" style="background:${meta.bg};color:${meta.fg}" aria-hidden="true"><i class="${meta.icon}"></i></span>
                    <span class="chooser-item-text">
                        <span class="chooser-item-name">${theme.name}</span>
                        <span class="chooser-item-blurb">${meta.blurb}</span>
                    </span>
                    <i class="fas fa-check chooser-item-check" aria-hidden="true"></i>
                </button>`;
        }).join('');
    }

    bindChooser() {
        this.dock.addEventListener('click', () => this.openChooser());

        this.list.addEventListener('click', (e) => {
            const item = e.target.closest('[data-theme]');
            if (!item) return;
            const key = item.dataset.theme;
            // Collapse first, then cross-fade to the new theme
            this.closeChooser(() => {
                if (key !== this.currentTheme) this.loadTheme(key, { pushHistory: true });
            });
        });

        this.chooser.querySelectorAll('[data-collapse]').forEach(button => button.addEventListener('click', () => this.closeChooser()));

        // Escape: animate the collapse instead of the native instant close
        this.chooser.addEventListener('cancel', (e) => {
            e.preventDefault();
            this.closeChooser();
        });

        // A click on the backdrop lands on the <dialog> itself
        this.chooser.addEventListener('click', (e) => {
            if (e.target === this.chooser) this.closeChooser();
        });
    }

    openChooser() {
        const current = this.themes[this.currentTheme];
        this.list.querySelectorAll('[data-theme]').forEach(item => {
            item.setAttribute('aria-current', item.dataset.theme === this.currentTheme ? 'true' : 'false');
        });
        document.getElementById('themeChooserContinue').textContent = `Continue with ${this.metaFor(this.currentTheme).label}`;
        document.getElementById('themeChooserContinue').setAttribute('aria-label', `Continue with ${current.name}`);

        this.chooser.classList.remove('is-closing');
        this.chooser.style.transformOrigin = '';
        if (!this.chooser.open) this.chooser.showModal();
        // Focus the window itself: the current card is already marked, and a focus ring on it would draw a second box
        this.chooser.querySelector('.chooser-panel').focus();
    }

    closeChooser(then) {
        if (!this.chooser.open || this.chooser.classList.contains('is-closing')) return;
        const finish = () => {
            this.chooser.classList.remove('is-closing');
            this.chooser.close();
            then?.();
            this.dock.focus({ preventScroll: true });
        };
        if (this.reducedMotion.matches) return finish();

        // Shrink toward the dock so the window visibly collapses into the switcher
        const dock = this.dock.getBoundingClientRect();
        const box = this.chooser.getBoundingClientRect();
        this.chooser.style.transformOrigin = `${dock.left + dock.width / 2 - box.left}px ${dock.top + dock.height / 2 - box.top}px`;
        this.chooser.classList.add('is-closing');
        setTimeout(finish, 160);
    }

    // ---------- persistence (per browser; storage can be unavailable in private mode) ----------

    readSaved() {
        try {
            return localStorage.getItem('portfolio-theme');
        } catch {
            return null;
        }
    }

    save(key) {
        try {
            localStorage.setItem('portfolio-theme', key);
        } catch {
            // Storage blocked: the URL hash still keeps the theme on refresh
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}

// Initialize portfolio when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.portfolioController = new PortfolioController();
    } catch (error) {
        console.error('Error creating Portfolio Controller:', error);
        document.body.innerHTML = `
            <div style="background: #1f2937; color: white; padding: 40px; font-family: monospace;">
                <h1 style="color: #ef4444; font-size: 24px; margin-bottom: 20px;">Portfolio Error</h1>
                <p style="margin-bottom: 10px;"><strong>Error:</strong> ${error.message}</p>
                <pre style="background: black; padding: 20px; overflow: auto; border-radius: 8px;">${error.stack}</pre>
            </div>
        `;
    }
});
