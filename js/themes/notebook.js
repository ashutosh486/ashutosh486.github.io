// Notebook theme - the résumé as a Jupyter notebook (Notebook 7, light) that runs itself once the theme chooser closes.
// Every fact comes from portfolioContent; the Python in the cells is just the story around it
const NotebookTheme = {
    name: "Interactive Notebook",
    token: 0,
    batch: 0,

    render() {
        const c = portfolioContent;
        this.token++;
        this.cells = this.notebook();
        this.count = 0;
        this.pending = [];
        this.draining = null;
        this.active = 0;
        this.fast = this.calm();
        const first = this.cells.findIndex(cell => cell.src);

        document.getElementById('themeContainer').innerHTML = `
            <div id="nbRoot">
                <header class="nb-head">
                    <div class="nb-top">
                        <i class="fas fa-book nb-logo" aria-hidden="true"></i>
                        <span class="nb-file">${c.name.replace(/\s+/g, '_')}.ipynb</span>
                        <span class="nb-check nb-wide">Last Checkpoint: just now</span>
                    </div>
                    <div class="nb-tools" role="toolbar" aria-label="Notebook">
                        <button type="button" class="nb-tool" data-action="advance" aria-label="Run this cell and advance" title="Run this cell and advance (Shift+Enter)"><i class="fas fa-play" aria-hidden="true"></i></button>
                        <button type="button" class="nb-tool" data-action="interrupt" aria-label="Interrupt the kernel" title="Interrupt the kernel"><i class="fas fa-stop" aria-hidden="true"></i></button>
                        <button type="button" class="nb-tool" data-action="restart" aria-label="Restart the kernel and run all cells" title="Restart the kernel and run all cells"><i class="fas fa-forward" aria-hidden="true"></i></button>
                        <span class="nb-grow"></span>
                        <span id="nbKernel" class="nb-kernel" role="status" aria-label="Kernel idle"><span>Python 3<span class="nb-wide"> (ipykernel)</span></span><span class="nb-dot" aria-hidden="true"></span></span>
                    </div>
                </header>
                <main id="nbCells" class="nb-page">
                    ${this.cells.map((cell, i) => this.cellHtml(cell, i, i === first && !this.fast)).join('')}
                </main>
            </div>`;
        this.select(0);
        this.bind();
        this.intro(this.token);
    },

    // ---------- the notebook: markdown cells ({ md }) and code cells ({ src, kind, out }) ----------

    notebook() {
        const c = portfolioContent, md = html => ({ md: html }), esc = s => this.esc(s);
        const skills = this.skills(), pad = Math.max(...skills.map(([label]) => label.length)) + 2;
        return [
            md(`<h1>${c.name}</h1><p>${c.title} · ${c.location}</p>`),
            { src: 'import pandas as pd\nfrom IPython.display import Markdown\nfrom portfolio import me\n\nme', kind: 'result', out: () => this.profile() },
            md(`<h2>Impact</h2>${c.about.funFact ? `<p>${c.about.funFact}</p>` : ''}`),
            { src: 'pd.DataFrame(me.impact)', kind: 'result', out: () => this.frame(['value', 'label'], c.impact.map(m => [m.value, m.label].map(esc))) },
            md('<h2>Experience</h2>'),
            { src: 'for role in me.experience:\n    display(Markdown(role.summary()))', kind: 'display', out: () => c.experience.map(e => `
                <div class="nb-rendered">
                    <h3>${e.position} · ${e.company}</h3>
                    <p><em>${e.period} · ${e.location}</em></p>
                    <ul>${e.achievements.map(a => `<li>${a}</li>`).join('')}</ul>
                    <p>${e.technologies.map(t => `<code>${t}</code>`).join(' ')}</p>
                </div>`).join('') },
            md('<h2>Skills</h2>'),
            { src: `for area, tools in me.skills.items():\n    print(f"{area:<${pad}}{', '.join(tools)}")`, kind: 'stream', out: () => skills.map(([label, list]) => label.padEnd(pad) + list.join(', ')).join('\n') },
            md('<h2>Projects</h2>'),
            { src: 'pd.DataFrame(me.projects)[["title", "description", "stack"]]', kind: 'result', out: () => this.frame(['title', 'description', 'stack'], c.projects.map(p => [
                p.site ? `<a href="https://${p.site}" target="_blank" rel="noopener">${esc(p.title)}</a>` : esc(p.title), esc(p.description), esc(p.tags.join(', '))])) },
            md('<h2>Education</h2>'),
            { src: 'pd.DataFrame(me.education)[["degree", "institution", "years", "gpa"]]', kind: 'result', out: () => this.frame(['degree', 'institution', 'years', 'gpa'], c.education.map(e => [e.degree, e.institution, e.year, e.gpa].map(esc))) },
            { src: 'Markdown(me.credentials())', kind: 'result', out: () => this.credentials() },
            ...(c.currentlyReading.length ? [
                md('<h2>Reading</h2>'),
                { src: 'for book in me.reading:\n    print(f"{book.title} ({book.author})")\n    print(f"  {book.bar()} {book.progress}%")', kind: 'stream', out: () => c.currentlyReading
                    .map(b => `${b.title} (${b.author})\n  ${'█'.repeat(Math.round(b.progress / 5)).padEnd(20, '░')} ${b.progress}%`).join('\n') }] : []),
            md('<h2>Contact</h2>'),
            { src: 'me.contact()', kind: 'result', out: () => this.contact() }
        ];
    },

    profile() {
        const c = portfolioContent, s = c.stats;
        return `
            <div class="nb-profile">
                ${c.picture ? `<img src="${c.picture}" alt="" class="nb-avatar" onerror="this.remove()">` : ''}
                <div class="nb-rendered">
                    <p><strong>${c.tagline}</strong></p>
                    <p>${c.about.bio}</p>
                    <p><strong>${s.years}</strong> years · <strong>${s.companies}</strong> companies · <strong>${s.projects}</strong> projects · <strong>${s.skills}</strong> skills</p>
                    <p>${c.about.interests.map(i => `<code>${i}</code>`).join(' ')}</p>
                </div>
            </div>`;
    },

    credentials() {
        const c = portfolioContent, a = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
        return `
            <div class="nb-rendered">
                ${c.patents.length ? `<h4>Patents</h4><ul>${c.patents.map(p => `<li>${a(p.link, p.title)} · <code>${p.number}</code> · ${p.status} ${p.year}</li>`).join('')}</ul>` : ''}
                <h4>Certifications</h4>
                <ul>${c.certifications.map(x => `<li>${a(x.link, x.title)} · ${x.issuer} · ${x.year}</li>`).join('')}</ul>
            </div>`;
    },

    contact() {
        const c = portfolioContent;
        const links = [['Email', c.email && `mailto:${c.email}`], ['LinkedIn', c.social.linkedin], ['GitHub', c.social.github], ['Website', c.social.portfolio]].filter(([, href]) => href);
        // download is ignored on some origins (e.g. file://); a new tab keeps the portfolio open either way
        return `
            <div class="nb-rendered"><ul>
                ${links.map(([label, href]) => `<li><strong>${label}:</strong> <a href="${href}" ${href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${href.replace(/^(mailto:|https?:\/\/(www\.)?)/, '')}</a></li>`).join('')}
                ${c.resume ? `<li><strong>Résumé:</strong> <a href="${c.resume}" download="${c.resume.split('/').pop()}" target="_blank" rel="noopener">${c.resume}</a></li>` : ''}
            </ul></div>`;
    },

    // A pandas DataFrame as Jupyter renders it: index column, header rule, striped rows; numbers right-aligned, long text kept readable
    frame(cols, rows) {
        return `
            <div class="nb-df"><table>
                <thead><tr><th></th>${cols.map(col => `<th>${col}</th>`).join('')}</tr></thead>
                <tbody>${rows.map((row, i) => `<tr><th>${i}</th>${row.map(v => `<td${/^\d/.test(v) ? ' class="nb-num"' : v.replace(/<[^>]+>/g, '').length > 80 ? ' class="nb-long"' : ''}>${v}</td>`).join('')}</tr>`).join('')}</tbody>
            </table></div>`;
    },

    // Skill categories overlap in content.js, so each skill is listed once, under its first category
    skills() {
        const c = portfolioContent, seen = new Set();
        return Object.entries(c.skills)
            .map(([key, list]) => [c.skillLabels?.[key] || key, list.filter(s => !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase()))])
            .filter(([, list]) => list.length);
    },

    cellHtml(cell, i, blank) {
        if (cell.md) return `<div class="nb-cell nb-md" data-i="${i}" tabindex="-1"><div class="nb-row"><div class="nb-prompt"></div><div class="nb-rendered">${cell.md}</div></div></div>`;
        return `
            <div class="nb-cell" data-i="${i}" tabindex="-1">
                <div class="nb-row"><div class="nb-prompt">[ ]:</div><pre class="nb-editor"><code>${blank ? '' : this.py(cell.src)}</code></pre></div>
                <div class="nb-row nb-out" hidden></div>
            </div>`;
    },

    // Python highlighting in Jupyter's light colours: comments, strings, keywords, builtins, numbers, operators
    py(src) {
        const re = /(#.*)|(f?"(?:[^"\\\n]|\\.)*"|f?'(?:[^'\\\n]|\\.)*')|\b(import|from|for|in|as|if|else|def|return|not|and|or|None|True|False)\b|\b(print|display|len)\b(?=\()|\b(\d+)\b|(==|[=+\-*/<>%])/g;
        let html = '', last = 0;
        for (const m of src.matchAll(re)) {
            const kind = ['c', 's', 'k', 'b', 'n', 'o'][m.slice(1).findIndex(g => g !== undefined)];
            html += `${this.esc(src.slice(last, m.index))}<span class="nb-t-${kind}">${this.esc(m[0])}</span>`;
            last = m.index + m[0].length;
        }
        return html + this.esc(src.slice(last));
    },

    esc(s) {
        return String(s).replace(/[&<>"]/g, ch => `&#${ch.charCodeAt(0)};`);
    },

    calm() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    // ---------- opening: type the first cell, then run them all ----------

    async intro(t) {
        const live = () => t === this.token;
        // Nothing plays behind the theme chooser. On page load it opens right after this first render, so look a microtask later
        await null;
        const chooser = document.getElementById('themeChooser');
        if (chooser?.open) {
            await new Promise(r => { this.onChooser = r; chooser.addEventListener('close', r, { once: true }); });
            if (!live()) return;
        }
        this.onSkip = () => this.skip();
        window.addEventListener('keydown', this.onSkip);
        window.addEventListener('pointerdown', this.onSkip);

        const first = this.cells.findIndex(cell => cell.src), el = this.cellEl(first), code = el.querySelector('code'), src = this.cells[first].src;
        this.select(first);
        if (!this.fast) {
            el.classList.add('is-editing');
            for (let k = 0; k < src.length;) {
                await this.wait(k ? 22 : 350);
                if (!live()) return;
                k = this.fast ? src.length : k + 1;
                code.innerHTML = this.py(src.slice(0, k));
            }
            el.classList.remove('is-editing');
        }
        code.innerHTML = this.py(src);
        await this.enqueue(this.codeCells());
        if (!live()) return;
        this.endIntro();
        this.fast = this.calm();
    },

    skip() {
        this.fast = true;
        clearTimeout(this.timer);
        this.wake?.();
    },

    endIntro() {
        window.removeEventListener('keydown', this.onSkip);
        window.removeEventListener('pointerdown', this.onSkip);
        this.onSkip = null;
    },

    wait(ms) {
        if (this.fast) return Promise.resolve();
        return new Promise(r => { this.wake = r; this.timer = setTimeout(r, ms); });
    },

    // ---------- kernel: a queue of cells, run one after another like Jupyter does ----------

    codeCells() {
        return this.cells.flatMap((cell, i) => cell.src ? [i] : []);
    },

    enqueue(list) {
        list = list.filter(i => this.cells[i].src);
        if (!list.length) return this.draining;
        for (const i of list) {
            this.pending.push(i);
            this.prompt(i, '*');
        }
        return this.draining ||= this.drain(this.batch);
    },

    async drain(batch) {
        this.kernel(true);
        while (this.pending.length) {
            await this.wait(300);
            if (batch !== this.batch) return;
            this.show(this.pending.shift());
        }
        this.draining = null;
        this.kernel(false);
    },

    // Queued cells go back to their last execution count, as in Jupyter
    interrupt() {
        this.batch++;
        this.draining = null;
        clearTimeout(this.timer);
        this.wake?.();
        this.pending.splice(0).forEach(i => this.prompt(i));
        this.kernel(false);
    },

    restart() {
        this.interrupt();
        this.count = 0;
        this.cells.forEach(cell => { delete cell.n; });
        this.enqueue(this.codeCells());
    },

    // Shift+Enter: run the selected cell, select the next one
    advance() {
        this.enqueue([this.active]);
        this.select(Math.min(this.active + 1, this.cells.length - 1), true);
    },

    show(i) {
        const cell = this.cells[i], out = this.cellEl(i).querySelector('.nb-out');
        cell.n = ++this.count;
        this.prompt(i);
        const body = cell.kind === 'stream' ? `<pre class="nb-stream">${this.esc(cell.out())}</pre>` : cell.out();
        out.innerHTML = `<div class="nb-prompt nb-prompt-out">${cell.kind === 'result' ? `[${cell.n}]:` : ''}</div><div class="nb-out-body">${body}</div>`;
        out.hidden = false;
        if (!this.fast) out.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 280, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
    },

    prompt(i, mark = this.cells[i].n ?? ' ') {
        this.cellEl(i).querySelector('.nb-prompt').textContent = `[${mark}]:`;
    },

    kernel(busy) {
        const el = document.getElementById('nbKernel');
        el.classList.toggle('is-busy', busy);
        el.setAttribute('aria-label', `Kernel ${busy ? 'busy' : 'idle'}`);
    },

    cellEl(i) {
        return document.querySelector(`#nbCells .nb-cell[data-i="${i}"]`);
    },

    select(i, reveal = false) {
        this.active = i;
        document.querySelectorAll('#nbCells .nb-cell').forEach((el, j) => {
            el.classList.toggle('is-active', j === i);
            el.tabIndex = j === i ? 0 : -1;
        });
        if (!reveal) return;
        const el = this.cellEl(i);
        el.focus({ preventScroll: true });
        el.scrollIntoView({ block: 'nearest', behavior: this.calm() ? 'auto' : 'smooth' });
    },

    bind() {
        document.getElementById('nbRoot').addEventListener('click', (e) => {
            const tool = e.target.closest('[data-action]');
            if (tool) return this[tool.dataset.action]();
            const cell = e.target.closest('.nb-cell');
            if (cell) this.select(+cell.dataset.i);
        });

        // Jupyter's command mode: Shift+Enter runs and advances, Ctrl/⌘+Enter runs in place, ↑/↓ or k/j move
        this.onKey = (e) => {
            if (document.querySelector('dialog[open]') || e.target.closest?.('a, button, input, textarea, select')) return;
            if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault();
                return this.advance();
            }
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                return this.enqueue([this.active]);
            }
            if (!e.target.closest?.('.nb-cell') || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
            const step = { ArrowDown: 1, j: 1, ArrowUp: -1, k: -1 }[e.key];
            if (!step) return;
            e.preventDefault();
            this.select(Math.max(0, Math.min(this.active + step, this.cells.length - 1)), true);
        };
        window.addEventListener('keydown', this.onKey);
    },

    cleanup() {
        this.token++;
        this.batch++;
        clearTimeout(this.timer);
        this.timer = null;
        this.endIntro();
        window.removeEventListener('keydown', this.onKey);
        this.onKey = null;
        document.getElementById('themeChooser')?.removeEventListener('close', this.onChooser);
        this.onChooser = null;
    }
};

if (typeof window !== 'undefined') {
    window.NotebookTheme = NotebookTheme;
}
