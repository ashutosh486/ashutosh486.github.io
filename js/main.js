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

        // Every theme opens at the top: no restored scroll position on refresh
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

        this.currentTheme = null;
        this.dock = document.getElementById('themeDock');
        this.chooser = document.getElementById('themeChooser');
        this.list = document.getElementById('themeChooserList');
        this.skip = document.getElementById('themeChooserSkip');
        this.random = document.getElementById('themeChooserRandom');
        this.voteButton = document.getElementById('themeChooserVote');
        this.hint = document.getElementById('themeChooserHint');
        // Best-theme vote (api/vote.js on the same Vercel project as the résumé chat). Use '/api/vote' under `vercel dev`
        this.voteApi = 'https://ashutoshgpt.vercel.app/api/vote';
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        this.buildChooser();
        this.bindChooser();

        // Themes read --theme-dock-w to keep their bottom-right corner clear of the switcher
        new ResizeObserver(() => document.documentElement.style.setProperty('--theme-dock-w', `${this.dock.offsetWidth}px`)).observe(this.dock);

        // "Random" ticked: every visit opens a theme other than the last one. Otherwise the URL first (shareable links),
        // then this browser's last pick, then the first theme
        const initial = this.readSaved('portfolio-random')
            ? this.randomTheme(this.readSaved())
            : [location.hash.slice(1), this.readSaved()].find(key => this.themes[key]) || Object.keys(this.themes)[0];
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
    }

    // ---------- chooser ----------

    buildChooser() {
        const count = Object.keys(this.themes).length;
        this.hintText = `One résumé, ${count} interfaces. Switch anytime from the theme button.`;
        this.hint.textContent = this.hintText;
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
                        <span class="chooser-item-votes"></span>
                    </span>
                    <i class="fas fa-check chooser-item-check" aria-hidden="true"></i>
                    <i class="fas fa-crown chooser-item-crown" aria-hidden="true"></i>
                </button>`;
        }).join('');
    }

    bindChooser() {
        this.dock.addEventListener('click', () => this.openChooser());
        // Ticking rolls now and keeps every refresh random; unticking only stops the refreshes
        this.random.addEventListener('change', () => {
            this.save(this.random.checked ? '1' : null, 'portfolio-random');
            if (this.random.checked) this.pickRandom();
        });

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
            if (this.voting) return this.castVote(key);
            // Collapse first, then cross-fade to the new theme
            this.closeChooser(() => {
                if (key !== this.currentTheme) this.loadTheme(key, { pushHistory: true });
            });
        });

        // The switcher still opens the chooser; unticking the box brings it back on every visit
        this.skip.addEventListener('change', () => this.save(this.skip.checked ? '1' : null, 'portfolio-chooser-hide'));

        this.voteButton.addEventListener('click', () => this.setVoting(!this.voting));

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
        this.setVoting(false);
        if (!this.votes) this.loadVotes();
        this.skip.checked = !!this.readSaved('portfolio-chooser-hide');
        this.random.checked = !!this.readSaved('portfolio-random');
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

    randomTheme(except) {
        const keys = Object.keys(this.themes).filter(key => key !== except);
        return keys[Math.floor(Math.random() * keys.length)];
    }

    // Lights cards up in turn, slowing down like a roulette wheel, then opens the one it lands on (never the current one)
    pickRandom() {
        if (this.rolling) return;
        const keys = Object.keys(this.themes).filter(key => key !== this.currentTheme);
        const pick = this.randomTheme(this.currentTheme);
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

    // ---------- best-theme vote ----------

    // Vote mode: tapping a card votes for it instead of opening it. Results stay hidden until this visitor has voted.
    setVoting(on) {
        this.voting = on;
        this.chooser.classList.toggle('is-voting', on);
        this.voteButton.setAttribute('aria-pressed', String(on));
        document.getElementById('themeChooserTitle').textContent = on ? 'Vote for the Best Theme' : 'Choose a Theme';
        this.hint.textContent = on ? 'Pick your favourite to see how everyone else voted.' : this.hintText;
        this.list.classList.remove('has-results');
        this.list.querySelectorAll('[data-theme]').forEach(item => (on ? item.setAttribute('aria-pressed', 'false') : item.removeAttribute('aria-pressed')));
        if (!on) return;
        if (this.votes?.mine) this.showResults(this.votes); // already loaded when the chooser opened: no wait
        this.loadVotes();
    }

    // Runs when the chooser opens too, so the counts are ready and the (often cold) Vercel function is awake by the first tap
    loadVotes() {
        return this.voteRequest().then(data => {
            if (this.voteBusy) return; // a vote in flight has newer numbers
            this.votes = data;
            if (this.voting && data.mine) this.showResults(data);
        }).catch(() => {});
    }

    // The tap shows its result at once from the last known counts, and the server's reply corrects them. Taps made while a
    // vote is in flight wait their turn, so the server ends up with the last one.
    castVote(key) {
        const before = this.votes;
        if (before) {
            const counts = { ...before.counts };
            if (before.mine !== key) {
                counts[key]++;
                if (before.mine) counts[before.mine]--;
            }
            this.votes = { counts, mine: key };
            this.showResults(this.votes);
        } else {
            // Counts not loaded yet: mark the pick and say so until the reply lands
            this.list.querySelectorAll('[data-theme]').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.theme === key)));
            this.hint.textContent = `Counting your vote for ${this.metaFor(key).label}…`;
        }
        if (this.voteBusy) return (this.voteNext = key);
        this.voteBusy = true;
        this.voteRequest({ theme: key })
            .then(data => {
                this.votes = data;
                if (this.voting && !this.voteNext) this.showResults(data);
            })
            .catch(() => {
                this.votes = before;
                this.voteNext = null;
                if (!this.voting) return;
                if (before?.mine) this.showResults(before);
                else this.setVoting(true);
                this.hint.textContent = 'Voting is offline right now. Try again in a bit.';
            })
            .finally(() => {
                this.voteBusy = false;
                const next = this.voteNext;
                this.voteNext = null;
                if (next) this.castVote(next);
            });
    }

    voteRequest(body) {
        const init = body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {};
        return fetch(this.voteApi, { ...init, signal: AbortSignal.timeout(6000) }).then(res => (res.ok ? res.json() : Promise.reject(res.status)));
    }

    // Each card fills with its share of the votes; the leader gets a crown and the hint says how this visitor's pick ranks
    showResults({ counts, mine }) {
        const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
        const pct = key => Math.round((counts[key] / total) * 100);
        const top = Math.max(...Object.values(counts));
        const leader = Object.keys(counts).find(key => counts[key] === top);
        const rank = 1 + Object.values(counts).filter(n => n > counts[mine]).length; // ties share a place
        this.list.querySelectorAll('[data-theme]').forEach(item => {
            const key = item.dataset.theme;
            const n = counts[key] || 0;
            item.style.setProperty('--share', n / total);
            item.setAttribute('aria-pressed', String(key === mine));
            item.classList.toggle('is-leader', n === top && n > 0);
            item.querySelector('.chooser-item-votes').textContent = `${pct(key)}% · ${n} vote${n === 1 ? '' : 's'}`;
        });
        this.list.classList.add('has-results');
        const label = key => this.metaFor(key).label;
        this.hint.textContent = rank === 1
            ? `You backed the winner: ${label(mine)} leads with ${pct(mine)}% of ${total} vote${total === 1 ? '' : 's'}. Tap another card to change your vote.`
            : `${label(mine)} is #${rank} with ${pct(mine)}%; ${label(leader)} leads with ${pct(leader)}%. Tap another card to change your vote.`;
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
