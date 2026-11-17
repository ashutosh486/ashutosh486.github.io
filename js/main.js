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
            vscode: { label: 'VS Code', blurb: 'Browse my résumé as source files', icon: 'fas fa-code', bg: '#181818', fg: '#4fc1ff' },
            terminal: { label: 'Terminal', blurb: 'Type commands, get answers', icon: 'fas fa-terminal', bg: '#0c0c0c', fg: '#4ade80' },
            notebook: { label: 'Notebook', blurb: 'A Jupyter notebook you can run', icon: 'fas fa-book', bg: '#ffffff', fg: '#f37726' },
            paper: { label: 'Paper', blurb: 'An arXiv preprint in a PDF viewer', icon: 'fas fa-file-pdf', bg: '#525659', fg: '#ffffff' },
            book: { label: 'Book', blurb: 'An mdBook, read chapter by chapter', icon: 'fas fa-book-open', bg: '#ffffff', fg: '#20609f' },
            apple: { label: 'Contact Card', blurb: 'An iPhone contact card', icon: 'fas fa-address-card', bg: '#2f6f62', fg: '#ffffff' },
            scifi: { label: 'Sci-Fi', blurb: 'A starship crew records terminal', icon: 'fas fa-satellite-dish', bg: '#0b0700', fg: '#ffb000' }
        };

        // Pointer per theme: arrow and hand in the theme's colours, or the device's own pointer (iPad circle, CRT reticle)
        this.cursors = {
            chatgpt: { fill: '#ececec', stroke: '#0d0d0d', accent: '#ffffff' },
            modelcard: { fill: '#111827', stroke: '#ffffff', accent: '#ff9d00' },
            vscode: { fill: '#ffffff', stroke: '#1f1f1f', accent: '#0078d4' },
            terminal: { fill: '#4ade80', stroke: '#0c0c0c', accent: '#4ade80', text: 'beam' },
            notebook: { fill: '#1f1f1f', stroke: '#ffffff', accent: '#f37726' },
            paper: { fill: '#1f1f1f', stroke: '#ffffff', accent: '#b31b1b' },
            book: { fill: '#1f1f1f', stroke: '#ffffff', accent: '#20609f' },
            apple: { shape: 'ipad', accent: '#0a84ff' },
            scifi: { shape: 'reticle', accent: '#ffb000' }
        };

        // Every theme opens at the top: no restored scroll position on refresh
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

        this.currentTheme = null;
        this.dock = document.getElementById('themeDock');
        this.chooser = document.getElementById('themeChooser');
        this.list = document.getElementById('themeChooserList');
        this.skip = document.getElementById('themeChooserSkip');
        this.random = document.getElementById('themeChooserRandom');
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        this.buildChooser();
        this.bindChooser();

        // Themes read --theme-dock-w to keep their bottom-right corner clear of the switcher
        new ResizeObserver(() => document.documentElement.style.setProperty('--theme-dock-w', `${this.dock.offsetWidth}px`)).observe(this.dock);

        // URL first (shareable links), then this browser's last pick, then the first theme
        const initial = [location.hash.slice(1), this.readSaved()].find(key => this.themes[key]) || Object.keys(this.themes)[0];
        this.loadTheme(initial, { animate: false });

        // Ask on every visit, with the current theme preselected, unless this browser ticked "Don't show again"
        if (!this.readSaved('portfolio-chooser-hide')) {
            this.openChooser();
            this.startAutoContinue();
        }

        this.registerAgentTools();

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
            window.scrollTo(0, 0);
            caricatureLift.reset();
            this.paintDock();
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

    // Switcher shows the current theme's tile and short name
    paintDock() {
        const meta = this.metaFor(this.currentTheme);
        const tile = document.getElementById('themeDockTile');
        tile.style.background = meta.bg;
        tile.style.color = meta.fg;
        tile.innerHTML = `<i class="${meta.icon}"></i>`;
        document.getElementById('themeDockLabel').textContent = meta.label;
        this.dock.setAttribute('aria-label', `Change theme, current theme ${this.themes[this.currentTheme].name}`);
    }

    // Title, browser UI colour and scrollbar/form colour scheme follow the active theme
    syncPage() {
        const meta = this.metaFor(this.currentTheme);
        document.title = `${portfolioContent.name} · ${this.themes[this.currentTheme].name}`;
        document.querySelector('meta[name="theme-color"]').content = meta.bg;
        document.body.style.backgroundColor = meta.bg;
        const [r, g, b] = [1, 3, 5].map(i => parseInt(meta.bg.slice(i, i + 2), 16));
        document.documentElement.style.colorScheme = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5 ? 'dark' : 'light';
        document.documentElement.dataset.theme = this.currentTheme;
        this.paintCursor();
    }

    // Sets --cursor-default / --cursor-pointer / --cursor-text (read in styles.css); themes without a set keep the system ones
    paintCursor() {
        const c = this.cursors[this.currentTheme];
        const root = document.documentElement.style;
        const url = (size, x, y, body, fallback) => `url("data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
        )}") ${x} ${y}, ${fallback}`;
        // Dark underlay then the colour, so thin strokes stay visible on any background
        const lines = (d, colour, under = 'rgba(0,0,0,0.75)') => `<path d="${d}" stroke="${under}" stroke-width="3.6"/><path d="${d}" stroke="${colour}" stroke-width="1.6"/>`;
        const ARROW = 'M7 4v17.6l4.3-4.2 2.9 6.6 3.2-1.4-2.9-6.5h6.1Z';
        const HAND = 'M11.5 3.2a1.7 1.7 0 0 1 1.7 1.7v7.2c.4-.9 2.7-1 3.2.3.6-.8 2.7-.6 3 .7.6-.5 2.5-.1 2.5 1.5V19c0 3.4-2.3 5.8-5.6 5.8h-1.9c-1.9 0-3.4-.8-4.5-2.3l-3.7-5.2c-.7-.9-.5-2 .3-2.5.8-.5 1.8-.3 2.4.5l.9 1.2V4.9a1.7 1.7 0 0 1 1.7-1.7Z';
        const BEAM = 'M10 4.5h2.5c1 0 1.5.5 1.5 1.5 0-1 .5-1.5 1.5-1.5H18M14 6v16M10 23.5h2.5c1 0 1.5-.5 1.5-1.5 0 1 .5 1.5 1.5 1.5H18';
        let set = {};
        if (c?.shape === 'ipad') {
            set = {
                default: url(24, 12, 12, '<circle cx="12" cy="12" r="9" fill="rgba(60,60,67,0.55)" stroke="rgba(255,255,255,0.8)" stroke-width="1.2"/>', 'auto'),
                pointer: url(32, 16, 16, `<circle cx="16" cy="16" r="13" fill="${c.accent}" fill-opacity="0.35" stroke="rgba(255,255,255,0.85)" stroke-width="1.2"/>`, 'pointer'),
                text: url(24, 12, 12, '<rect x="10.5" y="1.5" width="3" height="21" rx="1.5" fill="rgba(60,60,67,0.75)" stroke="rgba(255,255,255,0.8)"/>', 'text')
            };
        } else if (c?.shape === 'reticle') {
            set = {
                default: url(32, 16, 16, `${lines('M16 3v6M16 23v6M3 16h6M23 16h6', c.accent)}<circle cx="16" cy="16" r="7" stroke="rgba(0,0,0,0.75)" stroke-width="3.6"/><circle cx="16" cy="16" r="7" stroke="${c.accent}" stroke-width="1.6"/><circle cx="16" cy="16" r="1.6" fill="${c.accent}"/>`, 'crosshair'),
                pointer: url(32, 16, 16, `${lines('M5 11V5h6M21 5h6v6M27 21v6h-6M11 27H5v-6', c.accent)}<path d="M16 11.5l4.5 4.5-4.5 4.5-4.5-4.5Z" fill="${c.accent}" stroke="rgba(0,0,0,0.75)"/>`, 'pointer'),
                text: url(32, 16, 16, `<rect x="14.5" y="4" width="3" height="24" fill="${c.accent}" stroke="rgba(0,0,0,0.75)"/>`, 'text')
            };
        } else if (c) {
            const shape = (d, fill) => `<path d="${d}" fill="${fill}" stroke="${c.stroke}" stroke-width="1.6"/>`;
            set = {
                default: url(28, 7, 4, shape(ARROW, c.fill), 'auto'),
                pointer: url(28, 11, 3, shape(HAND, c.accent === c.fill ? c.fill : c.accent) + `<path d="M13.2 12.1v4.4M16.4 12.4v4M19.4 13.1v3.6" stroke="${c.stroke}" stroke-width="1.2"/>`, 'pointer'),
                text: c.text === 'beam' ? url(28, 14, 14, lines(BEAM, c.fill), 'text') : null
            };
        }
        for (const kind of ['default', 'pointer', 'text']) {
            set[kind] ? root.setProperty(`--cursor-${kind}`, set[kind]) : root.removeProperty(`--cursor-${kind}`);
        }
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
            // download is ignored on some origins (e.g. file://); a new tab keeps the portfolio open either way
            link.target = '_blank';
            link.rel = 'noopener';
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
        this.random.addEventListener('click', () => this.pickRandom());

        // Click ripple in the theme's style (styles.css, .cursor-ping); the cursor image itself can't animate
        window.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'touch' || this.reducedMotion.matches) return;
            const ping = document.createElement('span');
            ping.className = 'cursor-ping';
            ping.style.left = `${e.clientX}px`;
            ping.style.top = `${e.clientY}px`;
            ping.addEventListener('animationend', () => ping.remove());
            // While the chooser is open it sits in the top layer, so the ripple has to live inside it to be seen
            (this.chooser.open ? this.chooser : document.body).append(ping);
        }, { passive: true });

        this.list.addEventListener('click', (e) => {
            const item = e.target.closest('[data-theme]');
            if (!item) return;
            const key = item.dataset.theme;
            // Collapse first, then cross-fade to the new theme
            this.closeChooser(() => {
                if (key !== this.currentTheme) this.loadTheme(key, { pushHistory: true });
            });
        });

        // The switcher still opens the chooser; unticking the box brings it back on every visit
        this.skip.addEventListener('change', () => this.save(this.skip.checked ? '1' : null, 'portfolio-chooser-hide'));

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
        this.list.querySelectorAll('[data-theme]').forEach((item, i) => {
            item.setAttribute('aria-current', item.dataset.theme === this.currentTheme ? 'true' : 'false');
            item.style.setProperty('--i', i);
        });
        this.skip.checked = !!this.readSaved('portfolio-chooser-hide');
        document.getElementById('themeChooserContinue').textContent = `Continue with ${this.metaFor(this.currentTheme).label}`;
        document.getElementById('themeChooserContinue').setAttribute('aria-label', `Continue with ${current.name}`);

        this.chooser.classList.remove('is-closing');
        this.chooser.style.transformOrigin = '';
        if (!this.chooser.open) this.chooser.showModal();
        // Focus the window itself: the current card is already marked, and a focus ring on it would draw a second box
        this.chooser.querySelector('.chooser-panel').focus();
    }

    // First visit only: with no click, key, scroll or tap in the chooser for 5s, continue with the preselected theme.
    // The clock starts once the page has loaded; a fill across "Continue" (styles.css, .is-counting) shows it.
    startAutoContinue() {
        const button = document.getElementById('themeChooserContinue');
        const events = ['pointerdown', 'keydown', 'wheel'];
        const start = () => {
            if (!this.chooser.open) return;
            button.classList.add('is-counting');
            this.autoContinue = setTimeout(() => this.closeChooser(), 5000);
        };
        this.stopAutoContinue = () => {
            clearTimeout(this.autoContinue);
            button.classList.remove('is-counting');
            events.forEach(type => this.chooser.removeEventListener(type, this.stopAutoContinue));
            window.removeEventListener('load', start);
            this.stopAutoContinue = null;
        };
        events.forEach(type => this.chooser.addEventListener(type, this.stopAutoContinue, { passive: true }));
        if (document.readyState === 'complete') start();
        else window.addEventListener('load', start, { once: true });
    }

    // Lights cards up in turn, slowing down like a roulette wheel, then opens the one it lands on (never the current one)
    pickRandom() {
        if (this.rolling) return;
        const keys = Object.keys(this.themes).filter(key => key !== this.currentTheme);
        const pick = keys[Math.floor(Math.random() * keys.length)];
        const go = () => this.closeChooser(() => this.loadTheme(pick, { pushHistory: true }));
        if (this.reducedMotion.matches) return go();

        const card = key => this.list.querySelector(`[data-theme="${key}"]`);
        let step = 0;
        let lit = null;
        this.rolling = true;
        const tick = () => {
            lit?.classList.remove('is-rolling');
            if (!this.chooser.open) return (this.rolling = false); // closed mid-roll: cancel
            const others = keys.filter(key => key !== lit?.dataset.theme);
            const key = step < 9 ? others[Math.floor(Math.random() * others.length)] : pick;
            lit = card(key);
            lit.classList.add('is-rolling');
            if (step++ < 9) return setTimeout(tick, 50 + step * step * 3);
            setTimeout(() => {
                this.rolling = false;
                if (this.chooser.open) go();
                lit.classList.remove('is-rolling');
            }, 380);
        };
        tick();
    }

    closeChooser(then) {
        if (!this.chooser.open || this.chooser.classList.contains('is-closing')) return;
        this.stopAutoContinue?.();
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

    // ---------- in-browser agents (WebMCP; only browsers that ship navigator.modelContext) ----------

    registerAgentTools() {
        const tools = navigator.modelContext;
        if (!tools?.registerTool) return;
        const text = value => ({ content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value) }] });
        const { stats, chatCommands, skillLabels, ...profile } = portfolioContent;
        try {
            tools.registerTool({
                name: 'get_profile',
                description: `${portfolioContent.name}'s résumé as JSON: experience, projects, skills, education, certifications, patents and contact details.`,
                inputSchema: { type: 'object', properties: {} },
                annotations: { readOnlyHint: true },
                execute: async () => text({ ...profile, stats })
            });
            tools.registerTool({
                name: 'switch_theme',
                description: 'Show the portfolio in another interface. Every theme has the same content.',
                inputSchema: { type: 'object', properties: { theme: { type: 'string', enum: Object.keys(this.themes) } }, required: ['theme'] },
                execute: async ({ theme }) => {
                    if (!this.themes[theme]) return text(`Unknown theme "${theme}"`);
                    this.closeChooser();
                    this.loadTheme(theme, { pushHistory: true });
                    return text(`Switched to ${this.themes[theme].name}`);
                }
            });
        } catch (error) {
            console.warn('WebMCP tools not registered:', error);
        }
    }

    // ---------- persistence (per browser; storage can be unavailable in private mode) ----------

    readSaved(name = 'portfolio-theme') {
        try {
            return localStorage.getItem(name);
        } catch {
            return null;
        }
    }

    save(key, name = 'portfolio-theme') {
        try {
            key === null ? localStorage.removeItem(name) : localStorage.setItem(name, key);
        } catch {
            // Storage blocked: the URL hash still keeps the theme on refresh (and the chooser simply keeps asking)
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}

// A theme's opening: `anims` (Web Animations) are paused on their first frame, which keeps their elements hidden while the
// theme chooser is open, and play once it closes. Any key, click or tap finishes them. Returns a stop() for cleanup().
function playOpening(anims, onStart) {
    const chooser = document.getElementById('themeChooser');
    let stopped = false;
    anims.forEach(a => a.pause());
    const finish = () => { anims.forEach(a => a.finish()); stop(); };
    const stop = () => {
        stopped = true;
        chooser.removeEventListener('close', start);
        window.removeEventListener('keydown', finish);
        window.removeEventListener('pointerdown', finish);
    };
    const start = () => {
        if (stopped) return;
        anims.forEach(a => a.play());
        onStart?.();
        window.addEventListener('keydown', finish);
        window.addEventListener('pointerdown', finish);
        Promise.all(anims.map(a => a.finished)).then(stop, stop);
    };
    // On page load the chooser opens right after the theme's first render, so look a microtask later
    queueMicrotask(() => (stopped ? null : chooser.open ? chooser.addEventListener('close', start, { once: true }) : start()));
    return stop;
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
