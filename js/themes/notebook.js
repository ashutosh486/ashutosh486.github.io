// Notebook theme - the résumé as a Jupyter notebook (Notebook 7, light) that runs itself once the theme chooser closes.
// Every fact comes from portfolioContent; the Python in the cells is just the story around it
const NotebookTheme = {
    name: "Interactive Notebook",
    token: 0,
    batch: 0,
    mod: /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl+',

    render() {
        const c = portfolioContent;
        this.token++;
        this.cells = this.notebook();
        this.count = 0;
        this.pending = [];
        this.draining = null;
        this.active = 0;
        this.openMenu = null;
        this.fast = this.calm();
        this.file = `${c.name.replace(/\s+/g, '_')}.ipynb`;
        const first = this.cells.findIndex(cell => cell.src);

        document.getElementById('themeContainer').innerHTML = `
            <div id="nbRoot">
                <header class="nb-head">
                    <div class="nb-top">
                        <i class="fas fa-book nb-logo" aria-hidden="true"></i>
                        <span class="nb-file">${this.file}</span>
                        <span class="nb-check nb-wide">Last Checkpoint: just now</span>
                    </div>
                    <nav class="nb-menubar" role="menubar" aria-label="Notebook menu">${this.menubar()}</nav>
                    <div class="nb-tools" role="toolbar" aria-label="Notebook">
                        <button type="button" class="nb-tool" data-action="advance" aria-label="Run this cell and advance" title="Run this cell and advance (Shift+Enter)"><i class="fas fa-play" aria-hidden="true"></i></button>
                        <button type="button" class="nb-tool" data-action="interrupt" aria-label="Interrupt the kernel" title="Interrupt the kernel (I, I)"><i class="fas fa-stop" aria-hidden="true"></i></button>
                        <button type="button" class="nb-tool" data-action="restart" aria-label="Restart the kernel and run all cells" title="Restart the kernel and run all cells"><i class="fas fa-forward" aria-hidden="true"></i></button>
                        <span class="nb-grow"></span>
                        <span id="nbKernel" class="nb-kernel" role="status" aria-label="Kernel idle"><span>Python 3<span class="nb-wide"> (ipykernel)</span></span><span class="nb-dot" aria-hidden="true"></span></span>
                    </div>
                </header>
                <main id="nbCells" class="nb-page">
                    ${this.cells.map((cell, i) => this.cellHtml(cell, i, i === first && !this.fast)).join('')}
                </main>
                <dialog id="nbDialog" class="nb-dialog" aria-labelledby="nbDialogTitle"></dialog>
            </div>`;
        this.select(0);
        this.bind();
        this.intro(this.token);
    },

    // ---------- the notebook: markdown cells ({ md }) and code cells ({ src, kind, out, text? }) ----------
    // kind 'result' gets an Out prompt, 'display' and 'stream' don't; text outputs render as preformatted text

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
            { src: `for area, tools in me.skills.items():\n    print(f"{area:<${pad}}{', '.join(tools)}")`, kind: 'stream', text: true, out: () => skills.map(([label, list]) => label.padEnd(pad) + list.join(', ')).join('\n') },
            md('<h2>Projects</h2>'),
            { src: 'pd.DataFrame(me.projects)[["title", "description", "highlights", "stack"]]', kind: 'result', out: () => this.frame(['title', 'description', 'highlights', 'stack'], c.projects.map(p => [
                p.site ? `<a href="https://${p.site}" target="_blank" rel="noopener">${esc(p.title)}</a>` : esc(p.title), esc(p.description), esc(p.highlights.join('; ')), esc(p.tags.join(', '))])) },
            md('<h2>Education</h2>'),
            { src: 'pd.DataFrame(me.education)[["degree", "institution", "years", "gpa", "highlights"]]', kind: 'result', out: () => this.frame(['degree', 'institution', 'years', 'gpa', 'highlights'],
                c.education.map(e => [e.degree, e.institution, e.year, e.gpa, e.achievements.join('; ')].map(esc))) },
            { src: 'Markdown(me.credentials())', kind: 'result', out: () => this.credentials() },
            ...(c.currentlyReading.length ? [
                md('<h2>Reading</h2>'),
                { src: 'for book in me.reading:\n    print(f"{book.title} ({book.author})")\n    print(f"  {book.bar()} {book.progress}%")\n    print(f"  {book.notes}\\n  {book.link}\\n")', kind: 'stream', text: true, out: () => c.currentlyReading
                    .map(b => [`${b.title} (${b.author})`, `  ${'█'.repeat(Math.round(b.progress / 5)).padEnd(20, '░')} ${b.progress}%`, b.notes && `  ${b.notes}`, b.link && `  ${b.link}`].filter(Boolean).join('\n')).join('\n\n') }] : []),
            ...(c.hobbies?.length ? [
                md('<h2>Outside work</h2>'),
                { src: 'me.hobbies', kind: 'result', text: true, out: () => this.repr(c.hobbies) }] : []),
            md('<h2>Contact</h2>'),
            { src: 'me.contact()', kind: 'result', out: () => this.contact() }
        ];
    },

    profile() {
        const c = portfolioContent, s = c.stats;
        return `
            <div class="nb-profile">
                ${caricatureSVG()}
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
        return `
            <div class="nb-rendered"><ul>
                ${links.map(([label, href]) => `<li><strong>${label}:</strong> <a href="${href}" ${href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${href.replace(/^(mailto:|https?:\/\/(www\.)?)/, '')}</a></li>`).join('')}
                ${c.resume ? `<li><strong>Résumé:</strong> <a ${this.resumeAttrs()}>${c.resume}</a></li>` : ''}
            </ul></div>`;
    },

    // download is ignored on some origins (e.g. file://); a new tab keeps the portfolio open either way
    resumeAttrs() {
        const r = portfolioContent.resume;
        return `href="${r}" download="${r.split('/').pop()}" target="_blank" rel="noopener"`;
    },

    // A pandas DataFrame as Jupyter renders it: index column, header rule, striped rows; numbers right-aligned, long text kept readable
    frame(cols, rows) {
        return `
            <div class="nb-df"><table>
                <thead><tr><th></th>${cols.map(col => `<th>${col}</th>`).join('')}</tr></thead>
                <tbody>${rows.map((row, i) => `<tr><th>${i}</th>${row.map(v => `<td${/^\d/.test(v) ? ' class="nb-num"' : v.replace(/<[^>]+>/g, '').length > 80 ? ' class="nb-long"' : ''}>${v}</td>`).join('')}</tr>`).join('')}</tbody>
            </table></div>`;
    },

    // A list of strings as IPython prints it: one line when short, one item per line otherwise
    repr(list) {
        const items = list.map(s => s.includes("'") && !s.includes('"') ? `"${s}"` : `'${s.replace(/'/g, "\\'")}'`);
        const flat = `[${items.join(', ')}]`;
        return flat.length <= 79 ? flat : `[${items.join(',\n ')}]`;
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
                <div class="nb-row nb-in">
                    <div class="nb-prompt">[ ]:</div>
                    <pre class="nb-editor"><code>${this.code(blank ? '' : cell.src)}</code></pre>
                    <button type="button" class="nb-ph" data-expand="in" aria-label="Expand code">···</button>
                </div>
                <div class="nb-row nb-out" hidden></div>
                <div class="nb-row nb-ph-out"><div class="nb-prompt"></div><button type="button" class="nb-ph" data-expand="out" aria-label="Expand output">···</button></div>
            </div>`;
    },

    // One block per source line, so View › Show Line Numbers can number them
    code(src) {
        return src.split('\n').map(line => `<span class="nb-line">${this.py(line)}</span>`).join('');
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

    // ---------- menu bar: Notebook 7's menus, keeping only the items that do something here ----------

    menus() {
        return [
            ['File', [['Download', 'download'], portfolioContent.resume && ['Download Résumé (PDF)', 'resume']]],
            ['Edit', [['Clear Cell Output', 'clearOne'], ['Clear Outputs of All Cells', 'clearAll']]],
            ['View', [['Collapse All Code', 'collapseCode'], ['Expand All Code', 'expandCode'], '-', ['Collapse All Outputs', 'collapseOutput'], ['Expand All Outputs', 'expandOutput'], '-', ['Show Line Numbers', 'lineNumbers', 'Shift+L', 'check']]],
            ['Run', [['Run Selected Cell', 'advance', 'Shift+Enter'], ['Run Selected Cell and Do not Advance', 'runHere', `${this.mod}Enter`], '-', ['Run All Above Selected Cell', 'runAbove'], ['Run Selected Cell and All Below', 'runBelow'], '-', ['Run All Cells', 'runAll']]],
            ['Kernel', [['Interrupt Kernel', 'interrupt', 'I, I'], '-', ['Restart Kernel', 'restartKernel', '0, 0'], ['Restart Kernel and Clear Outputs of All Cells', 'restartClear'], ['Restart Kernel and Run All Cells', 'restart']]],
            ['Help', [['Keyboard Shortcuts', 'shortcuts', 'H']]]
        ];
    },

    menubar() {
        return this.menus().map(([label, items], m) => `
            <div class="nb-menu-wrap">
                <button type="button" class="nb-menu-btn" role="menuitem" aria-haspopup="menu" aria-expanded="false" data-menu="${m}">${label}</button>
                <div class="nb-menu" role="menu" aria-label="${label}" hidden>
                    ${items.filter(Boolean).map(item => {
                        if (item === '-') return '<div class="nb-menu-sep" role="separator"></div>';
                        const [text, action, keys = '', check] = item;
                        if (action === 'resume') return `<a class="nb-menu-item" role="menuitem" tabindex="-1" ${this.resumeAttrs()}><span>${text}</span></a>`;
                        return `<button type="button" class="nb-menu-item" role="${check ? 'menuitemcheckbox' : 'menuitem'}" ${check ? 'aria-checked="false"' : ''} tabindex="-1" data-action="${action}"><span>${text}</span>${keys ? `<kbd>${keys}</kbd>` : ''}</button>`;
                    }).join('')}
                </div>
            </div>`).join('');
    },

    showMenu(m, focusFirst = false) {
        this.hideMenu();
        const btn = document.querySelector(`#nbRoot [data-menu="${m}"]`);
        btn.setAttribute('aria-expanded', 'true');
        btn.nextElementSibling.hidden = false;
        this.openMenu = m;
        if (focusFirst) btn.nextElementSibling.querySelector('.nb-menu-item').focus();
    },

    hideMenu(refocus = false) {
        if (this.openMenu === null) return;
        const btn = document.querySelector(`#nbRoot [data-menu="${this.openMenu}"]`);
        btn.setAttribute('aria-expanded', 'false');
        btn.nextElementSibling.hidden = true;
        this.openMenu = null;
        if (refocus) btn.focus();
    },

    // Menu keys: ←/→ between menus, ↑/↓ within one, Escape closes back to its title
    menuKey(e) {
        const btns = [...document.querySelectorAll('#nbRoot .nb-menu-btn')];
        const m = +e.target.closest('.nb-menu-wrap').querySelector('.nb-menu-btn').dataset.menu;
        const inMenu = !!e.target.closest('.nb-menu');
        if (e.key === 'Escape' || e.key === 'Tab') {
            if (e.key === 'Escape') e.preventDefault();
            return this.hideMenu(e.key === 'Escape');
        }
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const next = (m + (e.key === 'ArrowRight' ? 1 : -1) + btns.length) % btns.length;
            if (this.openMenu !== null) return this.showMenu(next, true);
            return btns[next].focus();
        }
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        if (!inMenu) return this.showMenu(m, true);
        const items = [...e.target.closest('.nb-menu').querySelectorAll('.nb-menu-item')];
        items[(items.indexOf(e.target.closest('.nb-menu-item')) + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
    },

    // ---------- menu and toolbar actions ----------

    codeCells() {
        return this.cells.flatMap((cell, i) => cell.src ? [i] : []);
    },

    runHere() {
        this.enqueue([this.active]);
    },

    runAll() {
        this.enqueue(this.codeCells());
    },

    runAbove() {
        this.enqueue(this.codeCells().filter(i => i < this.active));
    },

    runBelow() {
        this.enqueue(this.codeCells().filter(i => i >= this.active));
    },

    // Clearing an output also clears its execution count, as in Jupyter
    clear(list) {
        for (const i of list) {
            if (!this.cells[i].src) continue;
            delete this.cells[i].n;
            const out = this.cellEl(i).querySelector('.nb-out');
            out.hidden = true;
            out.innerHTML = '';
            if (!this.pending.includes(i)) this.prompt(i);
        }
    },

    clearOne() {
        this.clear([this.active]);
    },

    clearAll() {
        this.clear(this.codeCells());
    },

    collapse(part, on) {
        document.querySelectorAll('#nbCells .nb-cell:not(.nb-md)').forEach(el => el.classList.toggle(`${part}-collapsed`, on));
    },

    collapseCode() { this.collapse('in', true); },
    expandCode() { this.collapse('in', false); },
    collapseOutput() { this.collapse('out', true); },
    expandOutput() { this.collapse('out', false); },

    lineNumbers() {
        const on = document.getElementById('nbRoot').classList.toggle('show-ln');
        document.querySelector('#nbRoot [data-action="lineNumbers"]').setAttribute('aria-checked', on);
    },

    restartKernel() {
        this.interrupt();
        this.count = 0;
    },

    restartClear() {
        this.restartKernel();
        this.clearAll();
    },

    // Help › Keyboard Shortcuts: Jupyter's command-mode keys that work here
    shortcuts() {
        const keys = [['Shift+Enter', 'Run the selected cell and select the next'], [`${this.mod}Enter`, 'Run the selected cell'], ['↑ / K', 'Select the cell above'], ['↓ / J', 'Select the cell below'],
            ['I, I', 'Interrupt the kernel'], ['0, 0', 'Restart the kernel'], ['Shift+L', 'Show or hide line numbers'], ['H', 'Show keyboard shortcuts']];
        const dialog = document.getElementById('nbDialog');
        dialog.innerHTML = `
            <form method="dialog">
                <h2 id="nbDialogTitle">Keyboard Shortcuts</h2>
                <table class="nb-keys">${keys.map(([k, what]) => `<tr><td><kbd>${k}</kbd></td><td>${what}</td></tr>`).join('')}</table>
                <div class="nb-dialog-actions"><button type="submit" class="nb-btn" autofocus>Close</button></div>
            </form>`;
        dialog.showModal();
    },

    // File › Download: the notebook as a real .ipynb (nbformat 4), with the outputs as they are now
    ipynb() {
        const lines = s => s.split(/(?<=\n)/);
        const plain = html => { const t = document.createElement('template'); t.innerHTML = html; return t.content.textContent.replace(/\s+/g, ' ').trim(); };
        const output = cell => {
            const body = cell.out();
            if (cell.kind === 'stream') return { output_type: 'stream', name: 'stdout', text: lines(`${body}\n`) };
            // The caricature is styled by this page's CSS, so it would render as blank shapes in Jupyter
            const data = cell.text ? { 'text/plain': lines(body) } : { 'text/html': lines(body.replace(/<svg[\s\S]*?<\/svg>/g, '').trim()), 'text/plain': [plain(body)] };
            return cell.kind === 'result' ? { output_type: 'execute_result', execution_count: cell.n, metadata: {}, data } : { output_type: 'display_data', metadata: {}, data };
        };
        return {
            cells: this.cells.map((cell, i) => cell.md
                ? { cell_type: 'markdown', id: `cell-${i}`, metadata: {}, source: lines(cell.md) }
                : { cell_type: 'code', id: `cell-${i}`, execution_count: cell.n ?? null, metadata: {}, outputs: cell.n ? [output(cell)] : [], source: lines(cell.src) }),
            metadata: {
                kernelspec: { display_name: 'Python 3 (ipykernel)', language: 'python', name: 'python3' },
                language_info: { name: 'python' }
            },
            nbformat: 4,
            nbformat_minor: 5
        };
    },

    download() {
        URL.revokeObjectURL(this.blobUrl);
        this.blobUrl = URL.createObjectURL(new Blob([JSON.stringify(this.ipynb(), null, 1)], { type: 'application/x-ipynb+json' }));
        const a = document.createElement('a');
        a.href = this.blobUrl;
        a.download = this.file;
        a.click();
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
                code.innerHTML = this.code(src.slice(0, k));
            }
            el.classList.remove('is-editing');
        }
        code.innerHTML = this.code(src);
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
        this.restartKernel();
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
        // Jupyter turns URLs in text output into links
        const body = cell.text ? `<pre class="nb-stream">${this.esc(cell.out()).replace(/https?:\/\/[^\s<]+/g, url => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`)}</pre>` : cell.out();
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
        const root = document.getElementById('nbRoot');
        root.addEventListener('click', (e) => {
            const menuBtn = e.target.closest('[data-menu]');
            if (menuBtn) return this.openMenu === +menuBtn.dataset.menu ? this.hideMenu() : this.showMenu(+menuBtn.dataset.menu);
            if (e.target.closest('.nb-menu-item')) this.hideMenu();
            const action = e.target.closest('[data-action]');
            if (action) return this[action.dataset.action]();
            const expand = e.target.closest('[data-expand]');
            if (expand) expand.closest('.nb-cell').classList.remove(`${expand.dataset.expand}-collapsed`);
            const cell = e.target.closest('.nb-cell');
            if (cell) this.select(+cell.dataset.i);
        });
        // With a menu open, hovering another title switches to it, as in a desktop menu bar
        root.querySelector('.nb-menubar').addEventListener('mouseover', (e) => {
            const btn = e.target.closest('[data-menu]');
            if (btn && this.openMenu !== null && this.openMenu !== +btn.dataset.menu) this.showMenu(+btn.dataset.menu);
        });
        root.querySelector('.nb-menubar').addEventListener('keydown', (e) => this.menuKey(e));
        // Backdrop click closes the shortcuts dialog
        root.querySelector('#nbDialog').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });

        this.onDown = (e) => {
            if (this.openMenu !== null && !e.target.closest?.('.nb-menubar')) this.hideMenu();
        };
        window.addEventListener('pointerdown', this.onDown);

        // Jupyter's command mode: Shift+Enter runs and advances, Ctrl/⌘+Enter runs in place, ↑/↓ or k/j move,
        // I,I interrupts, 0,0 restarts, Shift+L toggles line numbers, H lists the shortcuts
        this.onKey = (e) => {
            if (document.querySelector('dialog[open]') || e.target.closest?.('a, button, input, textarea, select')) return;
            if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault();
                return this.advance();
            }
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                return this.runHere();
            }
            if (e.altKey || e.ctrlKey || e.metaKey || !(e.target === document.body || e.target.closest?.('#nbCells'))) return;
            if (e.key === 'L' && e.shiftKey) return this.lineNumbers();
            if (e.shiftKey) return;
            const step = { ArrowDown: 1, j: 1, ArrowUp: -1, k: -1 }[e.key];
            if (step) {
                e.preventDefault();
                return this.select(Math.max(0, Math.min(this.active + step, this.cells.length - 1)), true);
            }
            if (e.key === 'h') return this.shortcuts();
            if (e.key !== 'i' && e.key !== '0') return;
            if (this.lastKey === e.key && e.timeStamp - this.lastAt < 600) {
                this.lastKey = null;
                return e.key === 'i' ? this.interrupt() : this.restartKernel();
            }
            this.lastKey = e.key;
            this.lastAt = e.timeStamp;
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
        window.removeEventListener('pointerdown', this.onDown);
        this.onDown = null;
        document.getElementById('themeChooser')?.removeEventListener('close', this.onChooser);
        this.onChooser = null;
        URL.revokeObjectURL(this.blobUrl);
        this.blobUrl = null;
    }
};

if (typeof window !== 'undefined') {
    window.NotebookTheme = NotebookTheme;
}
