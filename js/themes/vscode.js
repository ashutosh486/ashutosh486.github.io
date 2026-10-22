// VS Code theme - the résumé as a workspace in VS Code (Dark Modern); every fact comes from portfolioContent
const VSCodeTheme = {
    name: "VSCode Workspace",
    mod: /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl+',

    render() {
        this.root = portfolioContent.name.toLowerCase().replace(/\s+/g, '-');
        this.files = this.workspace();
        this.tabs = ['README.md', 'experience.md'];
        this.active = null;
        this.scroll = {};
        this.sideOpen = !this.phone();

        document.getElementById('themeContainer').innerHTML = `
            <div id="vsRoot" class="${this.sideOpen ? 'side-open' : ''}">
                <header class="vs-title">
                    <button type="button" class="vs-menu" data-action="explorer" aria-controls="vsSide" aria-expanded="${this.sideOpen}" aria-label="Explorer"><i class="fas fa-bars" aria-hidden="true"></i></button>
                    <button type="button" class="vs-cc" data-action="quick" aria-label="Go to file"><i class="fas fa-magnifying-glass" aria-hidden="true"></i><span>${this.root}</span><kbd class="vs-kbd">${this.mod}P</kbd></button>
                </header>
                <div class="vs-body">
                    <nav class="vs-activity" aria-label="Activity bar">
                        <button type="button" class="vs-act" data-action="explorer" aria-controls="vsSide" aria-expanded="${this.sideOpen}" aria-label="Explorer" title="Explorer (${this.mod}B)"><i class="far fa-copy" aria-hidden="true"></i></button>
                        <button type="button" class="vs-act" data-action="quick" aria-label="Go to file" title="Go to File (${this.mod}P)"><i class="fas fa-magnifying-glass" aria-hidden="true"></i></button>
                        <div class="vs-act-end">${this.links().map(([label, href, icon]) => `<a class="vs-act" href="${href}" ${this.ext(href)} aria-label="${label}" title="${label}"><i class="${icon}" aria-hidden="true"></i></a>`).join('')}</div>
                    </nav>
                    <aside id="vsSide" class="vs-side" aria-label="Explorer">
                        <h2 class="vs-side-title">Explorer</h2>
                        <div class="vs-tree">
                            <button type="button" class="vs-row vs-row-root" data-folder aria-expanded="true" style="--d:0"><span class="vs-twist"><i class="fas fa-chevron-right vs-chev" aria-hidden="true"></i></span><span class="vs-row-name">${this.root}</span></button>
                            <ul>${this.tree()}</ul>
                        </div>
                    </aside>
                    <div class="vs-scrim" data-action="explorer" aria-hidden="true"></div>
                    <main class="vs-main">
                        <div id="vsTabs" class="vs-tabs" aria-label="Open editors"></div>
                        <div id="vsCrumbs" class="vs-crumbs" aria-label="Breadcrumbs"></div>
                        <div id="vsEditor" class="vs-editor" tabindex="-1"></div>
                    </main>
                </div>
                <footer class="vs-status">
                    <span class="vs-remote" aria-hidden="true"><i class="fas fa-code"></i></span>
                    <span><i class="fas fa-code-branch" aria-hidden="true"></i>main</span>
                    <span class="vs-wide"><i class="far fa-circle-xmark" aria-hidden="true"></i>0<i class="fas fa-triangle-exclamation" aria-hidden="true"></i>0</span>
                    <span class="vs-grow"></span>
                    <span id="vsPos" class="vs-wide"></span>
                    <span class="vs-wide">UTF-8</span>
                    <span id="vsLang"></span>
                </footer>
                <dialog id="vsQuick" class="vs-quick" aria-label="Go to file">
                    <input type="text" role="combobox" aria-expanded="true" aria-controls="vsQuickList" aria-autocomplete="list" aria-label="File name" placeholder="Search files by name…" autocomplete="off" spellcheck="false">
                    <ul id="vsQuickList" role="listbox" aria-label="Files"></ul>
                </dialog>
            </div>
        `;
        this.bind();
        this.openFile('README.md');
    },

    // ---------- workspace: path -> { lang, code?, view() } ----------

    workspace() {
        const c = portfolioContent, files = {};
        const md = view => ({ lang: 'Markdown', view });
        files['README.md'] = md(() => this.readme());
        files['experience.md'] = md(() => this.experience());
        c.projects.forEach(p => { files[`projects/${this.slug(p.title)}.md`] = md(() => this.project(p)); });
        if (c.currentlyReading.length) files['reading.md'] = md(() => this.reading());
        files['skills.json'] = { lang: 'JSON', code: true, view: () => this.code(this.json()) };
        files['education.yml'] = { lang: 'YAML', code: true, view: () => this.code(this.yaml()) };
        if (c.resume) files[c.resume.split('/').pop()] = { lang: 'PDF', view: () => this.binary() };

        // Explorer order: folders first, then files, case-insensitive
        const byName = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' });
        const paths = Object.keys(files);
        this.paths = [...paths.filter(p => p.includes('/')).sort(byName), ...paths.filter(p => !p.includes('/')).sort(byName)];
        return files;
    },

    tree() {
        const dirs = [...new Set(this.paths.filter(p => p.includes('/')).map(p => p.split('/')[0]))];
        const row = (p, d) => `<li><button type="button" class="vs-row" data-open="${p}" style="--d:${d}"><span class="vs-twist"></span>${this.icon(p)}<span class="vs-row-name">${p.split('/').pop()}</span></button></li>`;
        return dirs.map(dir => `
            <li>
                <button type="button" class="vs-row" data-folder aria-expanded="true" style="--d:1"><span class="vs-twist"><i class="fas fa-chevron-right vs-chev" aria-hidden="true"></i></span><span class="vs-row-name">${dir}</span></button>
                <ul>${this.paths.filter(p => p.startsWith(`${dir}/`)).map(p => row(p, 2)).join('')}</ul>
            </li>`).join('') + this.paths.filter(p => !p.includes('/')).map(p => row(p, 1)).join('');
    },

    // ---------- Markdown files (shown as VS Code's Markdown preview) ----------

    readme() {
        const c = portfolioContent, s = c.stats;
        return `
            <header class="vs-md-head">
                ${c.picture ? `<img src="${c.picture}" alt="" class="vs-md-avatar" onerror="this.remove()">` : ''}
                <div><h1>${c.name}</h1><p>${c.title} · ${c.location}</p></div>
            </header>
            <blockquote><p>${c.tagline}</p></blockquote>
            <p>${c.about.bio}</p>
            <h2>At a glance</h2>
            <table>
                <thead><tr><th>Impact</th><th class="vs-num">Result</th></tr></thead>
                <tbody>${c.impact.map(m => `<tr><td>${m.label}</td><td class="vs-num">${m.value}</td></tr>`).join('')}</tbody>
            </table>
            <p><strong>${s.years}</strong> years · <strong>${s.companies}</strong> companies · <strong>${s.projects}</strong> projects · <strong>${s.skills}</strong> skills</p>
            <h2>Interests</h2>
            <p class="vs-chips">${c.about.interests.map(i => `<code>${i}</code>`).join(' ')}</p>
            <h2>Contact</h2>
            <ul>
                ${this.links().map(([label, href]) => `<li><strong>${label}:</strong> <a href="${href}" ${this.ext(href)}>${href.replace(/^(mailto:|https?:\/\/(www\.)?)/, '')}</a></li>`).join('')}
                ${c.resume ? `<li><strong>Résumé:</strong> <a ${this.resumeAttrs()}>${c.resume.split('/').pop()}</a></li>` : ''}
            </ul>
            ${c.about.funFact ? `<hr><p class="vs-md-dim">${c.about.funFact}</p>` : ''}`;
    },

    experience() {
        return `<h1>Experience</h1>${portfolioContent.experience.map(e => `
            <h2>${e.position}</h2>
            <p><strong>${e.company}</strong> · ${e.location} · <span class="vs-num">${e.period}</span></p>
            <ul>${e.achievements.map(a => `<li>${a}</li>`).join('')}</ul>
            <p class="vs-chips">${e.technologies.map(t => `<code>${t}</code>`).join(' ')}</p>`).join('')}`;
    },

    project(p) {
        return `
            <h1>${p.title}</h1>
            <p>${p.description}</p>
            ${p.site ? `<p><strong>Live:</strong> <a href="https://${p.site}" target="_blank" rel="noopener">${p.site}</a></p>` : ''}
            <h2>Highlights</h2>
            <ul>${p.highlights.map(h => `<li>${h}</li>`).join('')}</ul>
            <h2>Stack</h2>
            <p class="vs-chips">${p.tags.map(t => `<code>${t}</code>`).join(' ')}</p>`;
    },

    reading() {
        return `<h1>Reading</h1>${portfolioContent.currentlyReading.map(b => `
            <h2>${b.title}</h2>
            <p><em>${b.author}</em> · ${b.status === 'completed' ? `finished ${b.endDate}` : `in progress, <span class="vs-num">${b.progress}%</span>`}</p>
            <blockquote><p>${b.notes}</p></blockquote>
            ${b.link ? `<p><a href="${b.link}" target="_blank" rel="noopener">${b.link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</a></p>` : ''}`).join('')}`;
    },

    // The PDF opens like any binary file in VS Code: no viewer, just the way out
    binary() {
        return `
            <div class="vs-binary">
                <p>The file is not displayed in the text editor because it is either binary or uses an unsupported text encoding.</p>
                <div class="vs-binary-actions">
                    <a href="${portfolioContent.resume}" target="_blank" rel="noopener" class="vs-btn">Open in browser</a>
                    <a ${this.resumeAttrs()} class="vs-btn vs-btn-primary"><i class="fas fa-arrow-down" aria-hidden="true"></i>Download</a>
                </div>
            </div>`;
    },

    // ---------- source files (syntax-highlighted lines: [indent, html]) ----------

    json() {
        const p = s => this.t('p', s), groups = this.skills();
        return [[0, p('{')],
            ...groups.map(([label, list], i) => [1, `${this.t('key', JSON.stringify(label))}${p(': [')}${list.map(s => this.t('str', JSON.stringify(s))).join(p(', '))}${p(i < groups.length - 1 ? '],' : ']')}`]),
            [0, p('}')]];
    },

    yaml() {
        const c = portfolioContent;
        const sections = {
            education: c.education.map(e => ({ degree: e.degree, institution: e.institution, years: e.year, gpa: e.gpa, location: e.location, highlights: e.achievements })),
            certifications: c.certifications.map(x => ({ title: x.title, issuer: x.issuer, year: x.year, url: x.link })),
            patents: c.patents.map(x => ({ title: x.title, number: x.number, status: x.status, year: x.year, url: x.link }))
        };
        return [[0, this.t('cmt', '# Education, certifications and patents')],
            ...Object.entries(sections).filter(([, v]) => v.length).flatMap(([k, v]) => [[0, ''], ...this.yamlLines({ [k]: v })])];
    },

    // Indent is in 2-space steps: a list item's "- " sits one step in, its other keys two
    yamlLines(obj, ind = 0, out = []) {
        for (const [k, v] of Object.entries(obj)) {
            if (v == null || v === '' || (Array.isArray(v) && !v.length)) continue;
            const key = this.t('ykey', k) + this.t('p', ':');
            if (!Array.isArray(v)) { out.push([ind, `${key} ${this.scalar(v)}`]); continue; }
            out.push([ind, key]);
            for (const item of v) {
                const at = out.length;
                if (typeof item === 'object') this.yamlLines(item, ind + 2, out); else out.push([ind + 2, this.scalar(item)]);
                out[at] = [ind + 1, this.t('p', '- ') + out[at][1]];
            }
        }
        return out;
    },

    scalar(v) {
        const s = String(v);
        if (/^https?:\/\//.test(s)) return `<a href="${this.esc(s)}" target="_blank" rel="noopener" class="vs-t-str vs-url">${this.esc(s)}</a>`;
        return this.t(/^\d+(\.\d+)?$/.test(s) ? 'num' : 'str', s);
    },

    code(lines) {
        return `<div class="vs-code">${lines.map(([ind, html], i) => `<div class="vs-line" data-line="${i + 1}"><span class="vs-ln" aria-hidden="true">${i + 1}</span><span class="vs-src" style="--ind:${ind}">${html}</span></div>`).join('')}</div>`;
    },

    // Skill categories overlap in content.js, so each skill is listed once, under its first category
    skills() {
        const c = portfolioContent, seen = new Set();
        return Object.entries(c.skills)
            .map(([key, list]) => [c.skillLabels?.[key] || key, list.filter(s => !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase()))])
            .filter(([, list]) => list.length);
    },

    // ---------- small pieces ----------

    t(kind, s) {
        return `<span class="vs-t-${kind}">${this.esc(s)}</span>`;
    },

    esc(s) {
        return String(s).replace(/[&<>"]/g, ch => `&#${ch.charCodeAt(0)};`);
    },

    slug(title) {
        return title.split(' - ')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    },

    // Seti file icons (VS Code's default icon theme)
    icon(path) {
        const [glyph, color] = path === 'README.md' ? ['<i class="fas fa-circle-info"></i>', '#519aba'] : {
            md: ['<i class="fab fa-markdown"></i>', '#519aba'],
            json: ['{}', '#cbcb41'],
            yml: ['<i class="fas fa-list"></i>', '#a074c4'],
            pdf: ['<i class="fas fa-file-pdf"></i>', '#cc3e44']
        }[path.split('.').pop()] || ['<i class="far fa-file"></i>', '#9d9d9d'];
        return `<span class="vs-ico" style="color:${color}" aria-hidden="true">${glyph}</span>`;
    },

    links() {
        const c = portfolioContent;
        return [['GitHub', c.social.github, 'fab fa-github'], ['LinkedIn', c.social.linkedin, 'fab fa-linkedin-in'], ['Website', c.social.portfolio, 'fas fa-globe'], ['Email', c.email && `mailto:${c.email}`, 'far fa-envelope']]
            .filter(([, href]) => href);
    },

    ext(href) {
        return href.startsWith('http') ? 'target="_blank" rel="noopener"' : '';
    },

    // download is ignored on some origins (e.g. file://); a new tab keeps the portfolio open either way
    resumeAttrs() {
        const r = portfolioContent.resume;
        return `href="${r}" download="${r.split('/').pop()}" target="_blank" rel="noopener"`;
    },

    phone() {
        return window.matchMedia('(max-width: 767px)').matches;
    },

    // ---------- behaviour ----------

    openFile(path) {
        const editor = document.getElementById('vsEditor');
        if (this.active) this.scroll[this.active] = editor.scrollTop;
        if (!this.tabs.includes(path)) this.tabs.push(path);
        this.active = path;
        const f = this.files[path];
        editor.innerHTML = `<div class="vs-view ${f.lang === 'Markdown' ? 'vs-md' : ''}">${f.view()}</div>`;
        editor.scrollTop = this.scroll[path] || 0;
        this.paint();
        if (this.phone()) this.toggleSide(false);
    },

    closeTab(path) {
        const i = this.tabs.indexOf(path);
        this.tabs.splice(i, 1);
        delete this.scroll[path];
        if (path !== this.active) return this.paint();
        this.active = null;
        const next = this.tabs[Math.min(i, this.tabs.length - 1)];
        next ? this.openFile(next) : this.empty();
    },

    // All tabs closed: VS Code's empty editor with its shortcuts
    empty() {
        document.getElementById('vsEditor').innerHTML = `
            <div class="vs-view vs-empty">
                <i class="fas fa-code vs-empty-logo" aria-hidden="true"></i>
                <button type="button" data-action="quick"><span>Go to File</span><kbd class="vs-kbd">${this.mod}P</kbd></button>
                <button type="button" data-action="explorer"><span>Toggle Explorer</span><kbd class="vs-kbd">${this.mod}B</kbd></button>
                <button type="button" data-open="README.md"><span>Open README.md</span></button>
            </div>`;
        this.paint();
    },

    // Tabs, breadcrumbs, explorer selection and status bar follow the active file
    paint() {
        const f = this.files[this.active];
        document.getElementById('vsTabs').innerHTML = this.tabs.map(p => `
            <div class="vs-tab" ${p === this.active ? 'aria-current="true"' : ''}>
                <button type="button" class="vs-tab-open" data-open="${p}" title="${p}">${this.icon(p)}${p.split('/').pop()}</button>
                <button type="button" class="vs-tab-close" data-close="${p}" aria-label="Close ${p.split('/').pop()}"><i class="fas fa-xmark" aria-hidden="true"></i></button>
            </div>`).join('');
        document.querySelector('#vsTabs [aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        const parts = this.active ? [this.root, ...this.active.split('/')] : [];
        document.getElementById('vsCrumbs').innerHTML = parts.map((s, i) => `<span class="vs-crumb">${i === parts.length - 1 ? this.icon(this.active) : ''}${s}</span>`)
            .join('<i class="fas fa-chevron-right vs-crumb-sep" aria-hidden="true"></i>');
        document.querySelectorAll('#vsRoot .vs-row[data-open]').forEach(b => b.setAttribute('aria-current', b.dataset.open === this.active));
        document.getElementById('vsPos').textContent = f?.code ? 'Ln 1, Col 1' : '';
        document.getElementById('vsLang').textContent = f?.lang || '';
    },

    // Desktop: shows/hides the sidebar. Phones: slides the explorer drawer in/out
    toggleSide(open = !this.sideOpen) {
        this.sideOpen = open;
        document.getElementById('vsRoot').classList.toggle('side-open', open);
        document.querySelectorAll('#vsRoot [data-action="explorer"][aria-expanded]').forEach(b => b.setAttribute('aria-expanded', open));
    },

    quickOpen() {
        const quick = document.getElementById('vsQuick'), input = quick.querySelector('input');
        input.value = '';
        this.filter('');
        if (!quick.open) quick.showModal();
        input.focus();
    },

    // Fuzzy match like VS Code: the typed letters appear in order anywhere in the path
    filter(q) {
        const needle = q.toLowerCase().replace(/\s+/g, '');
        this.matches = this.paths.filter(p => {
            let i = 0;
            for (const ch of p.toLowerCase()) if (ch === needle[i]) i++;
            return i === needle.length;
        });
        document.getElementById('vsQuickList').innerHTML = this.matches.map((p, i) => `
            <li id="vsQ${i}" class="vs-q-item" role="option" data-open="${p}" aria-selected="false">${this.icon(p)}<span class="vs-q-name">${p.split('/').pop()}</span><span class="vs-q-dir">${p.includes('/') ? p.split('/')[0] : ''}</span></li>`).join('')
            || '<li class="vs-q-none">No matching results</li>';
        this.highlight(0);
    },

    highlight(i) {
        this.pick = i;
        const input = document.querySelector('#vsQuick input'), li = document.getElementById(`vsQ${i}`);
        document.querySelectorAll('#vsQuickList [role="option"]').forEach((el, j) => el.setAttribute('aria-selected', j === i));
        li?.scrollIntoView({ block: 'nearest' });
        li ? input.setAttribute('aria-activedescendant', li.id) : input.removeAttribute('aria-activedescendant');
    },

    selectLine(line) {
        document.querySelector('#vsEditor .vs-line.is-active')?.classList.remove('is-active');
        line.classList.add('is-active');
        document.getElementById('vsPos').textContent = `Ln ${line.dataset.line}, Col 1`;
    },

    bind() {
        const root = document.getElementById('vsRoot'), quick = document.getElementById('vsQuick'), input = quick.querySelector('input');
        root.addEventListener('click', (e) => {
            if (e.target === quick) return quick.close(); // backdrop
            const el = e.target.closest('[data-open], [data-close], [data-action], [data-folder], .vs-line');
            if (!el) return;
            if (el.dataset.close) return this.closeTab(el.dataset.close);
            if (el.dataset.open) {
                if (quick.open) quick.close();
                return this.openFile(el.dataset.open);
            }
            if (el.dataset.action === 'explorer') return this.toggleSide();
            if (el.dataset.action === 'quick') return this.quickOpen();
            if (el.hasAttribute('data-folder')) {
                const open = el.getAttribute('aria-expanded') !== 'true';
                el.setAttribute('aria-expanded', open);
                el.nextElementSibling.hidden = !open;
                return;
            }
            if (!e.target.closest('a')) this.selectLine(el);
        });

        input.addEventListener('input', () => this.filter(input.value));
        input.addEventListener('keydown', (e) => {
            if (!this.matches.length) return;
            if (e.key === 'Enter') {
                quick.close();
                return this.openFile(this.matches[this.pick]);
            }
            if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
            e.preventDefault();
            this.highlight((this.pick + (e.key === 'ArrowDown' ? 1 : -1) + this.matches.length) % this.matches.length);
        });

        this.onKey = (e) => {
            if (e.key === 'Escape' && this.sideOpen && this.phone()) return this.toggleSide(false);
            const k = (e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase();
            if (k !== 'p' && k !== 'b') return;
            e.preventDefault();
            if (document.querySelector('dialog[open]')) return; // theme chooser or quick open already up
            k === 'p' ? this.quickOpen() : this.toggleSide();
        };
        window.addEventListener('keydown', this.onKey);
    },

    cleanup() {
        window.removeEventListener('keydown', this.onKey);
        this.onKey = null;
    }
};

if (typeof window !== 'undefined') {
    window.VSCodeTheme = VSCodeTheme;
}
