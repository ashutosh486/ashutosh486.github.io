// Paper theme - the résumé as an arXiv preprint open in a PDF viewer. Pages are typeset in HTML (two columns, Latin Modern)
// from portfolioContent; the outline, page box, zoom and download in the toolbar all work. Opens with a pdflatex run
const PaperTheme = {
    name: "Research Paper",
    token: 0,
    steps: [0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2],

    render() {
        const c = portfolioContent, now = new Date();
        this.token++;
        this.zoomed = false;
        this.anims = [];
        this.pin = null;
        this.fast = this.calm();
        this.last = c.name.split(' ').at(-1);
        this.file = `${this.last.toLowerCase()}${now.getFullYear()}.pdf`;
        this.phone = window.matchMedia('(max-width: 899px)');
        this.wide = window.matchMedia('(min-width: 1280px)');
        this.refs = this.references();
        this.outline = [];
        this.nodes = this.blocks();

        document.getElementById('themeContainer').innerHTML = `
            <div id="ppRoot" lang="en" class="${this.fast ? '' : 'is-waiting'}${this.wide.matches ? ' side-open' : ''}">
                <header class="pp-bar" role="toolbar" aria-label="PDF viewer">
                    <div class="pp-bar-l">
                        <button type="button" class="pp-btn" data-action="side" aria-controls="ppSide" aria-expanded="${this.wide.matches}" aria-label="Document outline" title="Document outline"><i class="fas fa-bars" aria-hidden="true"></i></button>
                        <span class="pp-file">${this.file}</span>
                    </div>
                    <div class="pp-bar-c pp-paged">
                        <input id="ppPageIn" class="pp-page-in" type="text" inputmode="numeric" value="1" aria-label="Page number"><span class="pp-of">/</span><span id="ppCount">1</span>
                        <span class="pp-div" aria-hidden="true"></span>
                        <button type="button" class="pp-btn" data-action="zoomOut" aria-label="Zoom out" title="Zoom out"><i class="fas fa-minus" aria-hidden="true"></i></button>
                        <span id="ppZoom" class="pp-zoom" aria-live="polite">100%</span>
                        <button type="button" class="pp-btn" data-action="zoomIn" aria-label="Zoom in" title="Zoom in"><i class="fas fa-plus" aria-hidden="true"></i></button>
                    </div>
                    <div class="pp-bar-r">
                        ${c.resume ? `<a class="pp-btn" href="${c.resume}" download="${c.resume.split('/').pop()}" target="_blank" rel="noopener" aria-label="Download résumé (PDF)" title="Download résumé (PDF)"><i class="fas fa-download" aria-hidden="true"></i></a>` : ''}
                    </div>
                </header>
                <nav id="ppSide" class="pp-side" aria-label="Outline">
                    <ul>${this.outline.map(([id, text, sub]) => `<li><a href="#${id}" class="pp-ol${sub ? ' pp-ol-sub' : ''}" data-ol="${id}">${text}</a></li>`).join('')}</ul>
                </nav>
                <div class="pp-scrim" data-action="side" aria-hidden="true"></div>
                <main id="ppDoc" class="pp-doc"><div id="ppPages" class="pp-pages"></div></main>
                <div id="ppLog" class="pp-log" hidden><pre></pre></div>
            </div>`;

        this.paginate();
        this.fit();
        this.bind();
        // Page breaks depend on the font, so typeset again once Latin Modern has loaded
        const t = this.token;
        this.fonts = Promise.all(['', 'italic ', 'bold ', 'italic bold '].map(f => document.fonts.load(`${f}16px "Latin Modern"`))).catch(() => {});
        this.fonts.then(() => { if (t === this.token) { this.paginate(); this.sync(); } });
        this.intro(t);
    },

    // ---------- content: every fact from portfolioContent ----------

    // "Ashutosh Pandey" → "A. Pandey", as in a bibliography
    short(name) {
        return name.trim().split(/\s+/).map((w, i, all) => i < all.length - 1 ? `${w[0]}.` : w).join(' ');
    },

    titleCase(s) {
        return s.replace(/\b[a-z][a-z]*/g, (w, i) => i && /^(a|an|and|as|at|by|for|in|of|on|or|the|to|with)$/.test(w) ? w : w[0].toUpperCase() + w.slice(1));
    },

    list(items) {
        return items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
    },

    link(href, text) {
        return `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
    },

    // Bibliography, numbered in the order the sections cite it
    references() {
        const c = portfolioContent, me = this.short(c.name), refs = [];
        c.projects.filter(p => p.site).forEach(p => refs.push({ key: `p${p.id}`, html: `${me}. ${p.title}. ${this.link(`https://${p.site}`, p.site)}.` }));
        c.patents.forEach(p => refs.push({ key: p.number, html: `${me}. ${p.title}. Patent ${this.link(p.link, p.number)}, ${p.status.toLowerCase()} ${p.year}.` }));
        c.certifications.forEach(x => refs.push({ key: `c:${x.title}`, html: `${x.title}. <em>${x.issuer}</em>, ${x.year}. ${this.link(x.link, 'Certificate')}.` }));
        c.currentlyReading.forEach(b => refs.push({ key: `b:${b.title}`, html: `${this.list(b.author.split(/,\s*/).map(a => this.short(a)))}. <em>${b.title}</em>. ${b.link ? this.link(b.link, b.link.replace(/^https?:\/\/(www\.)?|\/$/g, '')) : ''}` }));
        return refs;
    },

    cite(...keys) {
        return `[${keys.map(k => {
            const n = this.refs.findIndex(r => r.key === k) + 1;
            return `<a class="pp-cite" href="#pp-ref-${n}">${n}</a>`;
        }).join(', ')}]`;
    },

    // Flat list of blocks the paginator places one by one; h2/h3 stay with what follows, .pp-float may move to the next column
    blocks() {
        const c = portfolioContent, s = c.stats;
        let n = 0;
        const sec = (id, title, numbered = true) => {
            const num = numbered ? `${++n}` : '';
            this.outline.push([`pp-${id}`, `${num ? `${num} ` : ''}${title}`]);
            return `<h2 id="pp-${id}">${num ? `<span class="pp-n">${num}</span>` : ''}${title}</h2>`;
        };
        let sub = 0;
        const subsec = (id, title) => {
            this.outline.push([`pp-${id}`, `${n}.${++sub} ${title}`, true]);
            return `<h3 id="pp-${id}"><span class="pp-n">${n}.${sub}</span>${title}</h3>`;
        };
        const li = html => `<ul class="pp-ul"><li>${html}</li></ul>`;
        const fun = c.about.funFact?.replace(/\s*\p{Extended_Pictographic}️?/gu, '');
        const skills = this.skills();
        const reading = c.currentlyReading;
        const sections = ['Experience', 'Projects', 'Technical Stack', 'Education and Credentials', ...(reading.length ? ['Ongoing Work'] : [])];

        this.outline.push(['pp-abstract', 'Abstract']);
        const out = [
            `<div class="pp-abstract" id="pp-abstract"><h2>Abstract</h2><p>${c.about.bio} We summarise ${s.years} years of industry practice across ${s.companies} organisations, ${s.projects} projects and ${s.skills} tools.</p></div>`,
            `<p class="pp-keywords"><strong>Keywords:</strong> ${c.about.interests.join(' · ')}</p>`,
            `<figure class="pp-float pp-fig">${caricatureSVG('Caricature of the author working at a laptop')}<figcaption><strong>Figure 1:</strong> The author, mid-experiment.</figcaption></figure>`,

            sec('intro', 'Introduction'),
            `<p>${c.about.shortBio}${fun ? ` ${fun}` : ''}</p>`,
            `<p>The author is currently ${c.experience[0].position} at ${c.experience[0].company}. Our main contributions are:</p>`,
            ...c.impact.map(m => li(`<strong>${m.value}</strong> ${m.label.toLowerCase()}.`)),
            `<p>The rest of this paper is organised as follows. ${sections.map((t, i) => `Section&nbsp;<a class="pp-ref" href="#pp-s${i + 2}">${i + 2}</a> covers ${t.toLowerCase()}`).join('; ')}.</p>`,

            sec('s2', 'Experience'),
            ...c.experience.flatMap((e, i) => [
                subsec(`e${i}`, `${e.position}, ${e.company}`),
                `<p class="pp-meta">${e.period.replace(' - ', ' – ')} · ${e.location}</p>`,
                ...e.achievements.map(li)
            ]),

            sec('s3', 'Projects'),
            ...c.projects.map(p => `<p class="pp-para"><strong>${p.title}.</strong> ${p.description}${p.site ? ` ${this.cite(`p${p.id}`)}` : ''} <em>Highlights:</em> ${this.list(p.highlights.map(h => /^[A-Z][a-z]/.test(h) ? h[0].toLowerCase() + h.slice(1) : h))}.</p>`),

            sec('s4', 'Technical Stack'),
            `<p>Table&nbsp;1 lists the tools used across this work, grouped by area; each tool appears once, under the first area it belongs to.</p>`,
            `<figure class="pp-float pp-table"><figcaption><strong>Table 1:</strong> Tools by area.</figcaption><table>
                <thead><tr><th>Area</th><th>Tools</th></tr></thead>
                <tbody>${skills.map(([label, tools]) => `<tr><td>${label}</td><td>${tools.join(', ')}</td></tr>`).join('')}</tbody>
            </table></figure>`
        ];
        sub = 0;
        out.push(
            sec('s5', 'Education and Credentials'),
            ...c.education.map(e => `<p class="pp-para"><strong>${e.degree}.</strong> <em>${e.institution}</em>, ${e.year.replace(' - ', '–')}. GPA ${e.gpa}.${e.description ? ` ${e.description}.` : ''}</p>`),
            ...(c.patents.length ? [subsec('patents', 'Patents'), ...c.patents.map(p => `<p>${p.title}: ${p.description} ${this.cite(p.number)}.</p>`)] : []),
            subsec('certs', 'Certifications'),
            `<p>${this.list(c.certifications.map(x => `${x.title} ${this.cite(`c:${x.title}`)}`))}.</p>`
        );
        if (reading.length) out.push(
            sec('s6', 'Ongoing Work'),
            ...reading.map(b => `<p>${b.status === 'completed' ? 'Recently finished' : `Reading (${b.progress}%)`}: <em>${b.title}</em> ${this.cite(`b:${b.title}`)}. ${b.notes}</p>`)
        );
        if (c.hobbies?.length) out.push(sec('ack', 'Acknowledgments', false), `<p>Outside work, the author enjoys ${this.list(c.hobbies.map(h => h.toLowerCase()))}.</p>`);
        out.push(
            sec('refs', 'References', false),
            ...this.refs.map((r, i) => `<p class="pp-bib" id="pp-ref-${i + 1}"><span>[${i + 1}]</span>${r.html}</p>`)
        );
        return out;
    },

    // Skill categories overlap in content.js, so each skill is listed once, under its first category
    skills() {
        const c = portfolioContent, seen = new Set();
        return Object.entries(c.skills)
            .map(([key, list]) => [c.skillLabels?.[key] || key, list.filter(s => !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase()))])
            .filter(([, list]) => list.length);
    },

    // Title and authors, full width on page 1
    head() {
        const c = portfolioContent;
        return `
            <div class="pp-head">
                <h1>${this.titleCase(c.tagline)}</h1>
                <p class="pp-authors"><strong>${c.name}</strong><sup>*</sup><br>${c.title}<br>${c.experience[0].company} · ${c.location}<br><a class="pp-tt" href="mailto:${c.email}">${c.email}</a></p>
            </div>`;
    },

    foot() {
        const s = portfolioContent.social;
        const links = [['Website', s.portfolio], ['GitHub', s.github], ['LinkedIn', s.linkedin]].filter(([, h]) => h);
        return `<p class="pp-foot"><sup>*</sup>${links.map(([label, h]) => `${label}: ${this.link(h, h.replace(/^https?:\/\/(www\.)?/, ''))}`).join('. ')}.</p>`;
    },

    // The grey arXiv identifier down the left margin of page 1
    stamp() {
        const d = new Date(), name = portfolioContent.name;
        const id = [...name].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 100000, 7);
        const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        return `arXiv:${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}.${String(id).padStart(5, '0')}v1 [cs.LG] ${date}`;
    },

    // ---------- typesetting: fill fixed-height columns block by block (phones: one flowing sheet) ----------

    paginate() {
        const host = document.getElementById('ppPages'), flow = this.phone.matches;
        const nodes = this.nodes.map(html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; });
        host.innerHTML = '';
        host.classList.toggle('is-flow', flow);
        let cols, ci, floats = [];
        const page = () => {
            const n = host.children.length + 1, el = document.createElement('section');
            el.className = 'pp-page';
            el.setAttribute('aria-label', `Page ${n}`);
            el.innerHTML = `${n === 1 ? `<div class="pp-stamp" aria-hidden="true">${this.stamp()}</div>${this.head()}` : ''}
                <div class="pp-cols">${'<div class="pp-col"></div>'.repeat(flow ? 1 : 2)}</div>
                ${n === 1 ? this.foot() : ''}<div class="pp-folio" aria-hidden="true">${n}</div>`;
            host.append(el);
            cols = [...el.querySelectorAll('.pp-col')];
            ci = 0;
        };
        // Floats that didn't fit wait for the top of the next column, as LaTeX does
        const next = () => {
            if (++ci === cols.length) page();
            cols[ci].append(...floats);
            floats = [];
        };
        const over = () => cols[ci].scrollHeight > cols[ci].clientHeight + 1;
        page();
        for (const node of nodes) {
            cols[ci].append(node);
            if (!over() || cols[ci].children.length === 1) continue;
            if (node.classList.contains('pp-float')) {
                node.remove();
                floats.push(node);
                continue;
            }
            // Headings move with the block after them
            const moving = [node];
            for (let p = node.previousElementSibling; p?.matches('h2, h3'); p = p.previousElementSibling) moving.unshift(p);
            if (moving.length === cols[ci].children.length) continue; // taller than a column: leave it, never hide text
            do {
                next();
                cols[ci].append(...moving);
            } while (over() && cols[ci].children.length > moving.length);
        }
        if (floats.length) next();
        if (!flow && ci === 0) this.balance(cols);
        this.pages = [...host.children];
        document.getElementById('ppCount').textContent = this.pages.length;
    },

    // Last page: share the text between both columns, as the balance package does
    balance([a, b]) {
        const used = col => col.lastElementChild ? col.lastElementChild.offsetTop + col.lastElementChild.offsetHeight - col.offsetTop : 0;
        while (a.children.length > 1 && used(a) - a.lastElementChild.offsetHeight > used(b)) b.prepend(a.lastElementChild);
        while (a.children.length > 1 && a.lastElementChild.matches('h2, h3')) b.prepend(a.lastElementChild);
    },

    // ---------- viewer ----------

    // Fit the page to the width left beside the outline, up to 125%
    fit() {
        if (this.zoomed || this.phone.matches) return this.setZoom(this.phone.matches ? 1 : this.zoom);
        const side = this.wide.matches && document.getElementById('ppRoot').classList.contains('side-open') ? 260 : 0;
        this.setZoom(Math.max(0.5, Math.min(1.25, (innerWidth - side - 48) / 816)));
    },

    setZoom(z) {
        this.zoom = z;
        document.getElementById('ppPages').style.zoom = this.phone.matches ? '' : z;
        document.getElementById('ppZoom').textContent = `${Math.round(z * 100)}%`;
    },

    zoomIn() {
        this.zoomed = true;
        this.setZoom(this.steps.find(s => s > this.zoom + 0.001) ?? this.zoom);
        this.sync();
    },

    zoomOut() {
        this.zoomed = true;
        this.setZoom(this.steps.findLast(s => s < this.zoom - 0.001) ?? this.zoom);
        this.sync();
    },

    side(open = !document.getElementById('ppRoot').classList.contains('side-open')) {
        document.getElementById('ppRoot').classList.toggle('side-open', open);
        document.querySelector('#ppRoot [data-action="side"]').setAttribute('aria-expanded', open);
        if (this.wide.matches) this.fit();
    },

    goPage(n) {
        const page = this.pages[Math.max(1, Math.min(n, this.pages.length)) - 1];
        if (page) scrollTo({ top: page.getBoundingClientRect().top + scrollY - this.barH() - 12, behavior: this.calm() ? 'auto' : 'smooth' });
    },

    go(id) {
        const el = document.getElementById(id);
        if (!el) return;
        scrollTo({ top: el.getBoundingClientRect().top + scrollY - this.barH() - 16, behavior: this.calm() ? 'auto' : 'smooth' });
        // The jump target stays current while its heading is on screen
        this.pin = this.outline.find(([oid]) => oid === id) ? id : null;
        this.pinSeen = false;
        if (!this.wide.matches) this.side(false);
    },

    barH() {
        return document.querySelector('#ppRoot .pp-bar').offsetHeight;
    },

    // Page box and outline follow the scroll position
    sync() {
        const mid = innerHeight / 2, input = document.getElementById('ppPageIn');
        const n = Math.max(1, this.pages.filter(p => p.getBoundingClientRect().top < mid).length);
        if (document.activeElement !== input) input.value = n;
        // Current section: the one holding the first block not yet scrolled past, in reading order (left column, then right).
        // Screen height alone is wrong in two columns, where a later heading can sit higher than the one being read
        const bar = this.barH(), line = bar + 48, ids = new Set(this.outline.map(([id]) => id));
        let active = this.outline[0][0];
        for (const el of document.querySelectorAll('#ppPages .pp-col > *')) {
            if (ids.has(el.id)) active = el.id;
            if (el.getBoundingClientRect().bottom > line) break;
        }
        // A jump target stays marked while the scroll heads there, and until its heading leaves the screen
        const pinned = this.pin && document.getElementById(this.pin)?.getBoundingClientRect();
        if (pinned) {
            const shown = pinned.bottom > bar && pinned.top < innerHeight;
            if (shown || !this.pinSeen) active = this.pin;
            if (shown) this.pinSeen = true;
            else if (this.pinSeen) this.pin = null;
        }
        document.querySelectorAll('#ppSide [data-ol]').forEach(a => a.toggleAttribute('aria-current', a.dataset.ol === active));
    },

    calm() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    bind() {
        const root = document.getElementById('ppRoot');
        this.wasWide = this.wide.matches;
        root.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]');
            if (action) return this[action.dataset.action]();
            // In-document links scroll instead of changing the hash, which holds the theme
            const local = e.target.closest('a[href^="#pp-"]');
            if (local) {
                e.preventDefault();
                this.go(local.getAttribute('href').slice(1));
            }
        });
        const input = document.getElementById('ppPageIn');
        input.addEventListener('change', () => this.goPage(parseInt(input.value, 10) || 1));
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); });
        input.addEventListener('blur', () => this.sync());

        this.onScroll = () => { cancelAnimationFrame(this.raf); this.raf = requestAnimationFrame(() => this.sync()); };
        window.addEventListener('scroll', this.onScroll, { passive: true });
        // Crossing the phone breakpoint re-typesets; otherwise only the fitted zoom changes
        this.onResize = () => {
            const flow = document.getElementById('ppPages').classList.contains('is-flow');
            if (flow !== this.phone.matches) this.paginate();
            // Only when crossing the breakpoint: phones fire resize as the URL bar hides
            if (this.wide.matches !== this.wasWide) this.side(this.wasWide = this.wide.matches);
            this.fit();
            this.sync();
        };
        window.addEventListener('resize', this.onResize);
        this.onKey = (e) => {
            if (e.key === 'Escape' && !this.wide.matches && root.classList.contains('side-open') && !document.querySelector('dialog[open]')) this.side(false);
        };
        window.addEventListener('keydown', this.onKey);
    },

    // ---------- opening: pdflatex compiles the paper, then the pages rise in and typeset ----------

    async intro(t) {
        const live = () => t === this.token, root = document.getElementById('ppRoot');
        if (this.fast) return this.sync();
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

        const log = document.getElementById('ppLog'), pre = log.querySelector('pre'), tex = this.file.replace('.pdf', '.tex'), year = new Date().getFullYear();
        const lines = [`$ pdflatex ${tex}`, `This is pdfTeX, Version 3.141592653-2.6-1.40.27 (TeX Live ${year})`, `(./${tex}`, `LaTeX2e <${year - 1}-11-01>`,
            '(./icml.sty) (./natbib.sty) (./booktabs.sty) (./hyperref.sty)',
            ...this.outline.filter(([, , sub]) => !sub).map(([id, text]) => `(./sections/${text.replace(/^\d+\s/, '').toLowerCase().replace(/\W+/g, '-')}.tex)`)];
        log.hidden = false;
        for (const line of lines) {
            if (!this.fast) pre.append(`${line}\n`);
            await this.wait(70);
            if (!live()) return;
        }
        await this.fonts;
        if (!live()) return;
        if (!this.fast) {
            pre.append(`${this.pages.map((_, i) => `[${i + 1}]`).join(' ')} )\nOutput written on ${this.file} (${this.pages.length} pages).\n`);
            await this.wait(450);
            if (!live()) return;
        }
        log.hidden = true;
        root.classList.remove('is-waiting');
        this.sync();
        if (!this.fast) {
            // Pages rise one after another; page 1's title, authors and first blocks set in reading order
            const ease = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
            this.anims = this.pages.slice(0, 3).map((p, i) => p.animate([{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: i * 120, easing: ease, fill: 'backwards' }));
            this.anims.push(...[...this.pages[0].querySelectorAll('.pp-head > *, .pp-col > *, .pp-foot')].slice(0, 24).map((el, i) =>
                el.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 360, delay: 180 + i * 45, easing: ease, fill: 'backwards' })));
        }
        this.endIntro();
    },

    skip() {
        this.fast = true;
        clearTimeout(this.timer);
        this.wake?.();
        this.anims.forEach(a => a.finish());
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

    cleanup() {
        this.token++;
        clearTimeout(this.timer);
        this.timer = null;
        cancelAnimationFrame(this.raf);
        this.endIntro();
        for (const [type, fn] of [['scroll', this.onScroll], ['resize', this.onResize], ['keydown', this.onKey]]) window.removeEventListener(type, fn);
        this.onScroll = this.onResize = this.onKey = null;
        document.getElementById('themeChooser')?.removeEventListener('close', this.onChooser);
        this.onChooser = null;
    }
};

if (typeof window !== 'undefined') {
    window.PaperTheme = PaperTheme;
}
