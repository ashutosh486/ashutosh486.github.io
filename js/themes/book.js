// Book theme - the résumé as an mdBook. Chapters are written in Markdown from portfolioContent and rendered by a small
// Markdown renderer. Everything in the menu bar works: sidebar toggle, mdBook's five themes, search (S or /), print (the
// résumé PDF) and the GitHub link; ← → turn chapters. Opens with the chapter's Markdown typing out, then rendering
const BookTheme = {
    name: "Markdown Book",
    token: 0,
    current: 'intro',
    palettes: [['light', 'Light'], ['rust', 'Rust'], ['coal', 'Coal'], ['navy', 'Navy'], ['ayu', 'Ayu']],

    render() {
        const c = portfolioContent;
        this.token++;
        this.anims = [];
        this.marks = false;
        this.fast = this.calm();
        this.wide = window.matchMedia('(min-width: 1080px)');
        this.chapters = this.book();
        this.byId = Object.fromEntries(this.chapters.map(ch => [ch.id, ch]));
        if (!this.byId[this.current]) this.current = 'intro';
        this.index = this.searchIndex();
        const palette = this.readPalette(), open = this.wide.matches, firstSuffix = this.chapters.find(ch => ch.suffix);

        document.getElementById('themeContainer').innerHTML = `
            <div id="bkRoot" lang="en" data-theme="${palette}" class="${this.fast ? '' : 'is-waiting'}${open ? ' sidebar-visible' : ''}">
                <nav id="bkSidebar" class="bk-sidebar" aria-label="Table of contents" ${open ? '' : 'inert'}>
                    <ol class="bk-chapter">${this.chapters.map(ch => `
                        ${ch === firstSuffix ? '<li class="bk-spacer" aria-hidden="true"></li>' : ''}
                        <li class="${ch.num.split('.').length > 2 ? 'bk-sub' : ''}"><a href="#book" data-ch="${ch.id}">${ch.num ? `<strong aria-hidden="true">${ch.num}</strong> ` : ''}${ch.title}</a></li>`).join('')}
                    </ol>
                </nav>
                <div class="bk-page">
                    <div id="bkMenu" class="bk-menu">
                        <div class="bk-buttons">
                            <button type="button" class="bk-icon" data-action="sidebar" aria-controls="bkSidebar" aria-expanded="${open}" aria-label="Toggle Table of Contents" title="Toggle Table of Contents"><i class="fas fa-bars" aria-hidden="true"></i></button>
                            <button type="button" class="bk-icon" data-action="themes" aria-controls="bkThemes" aria-haspopup="menu" aria-expanded="false" aria-label="Change theme" title="Change theme"><i class="fas fa-paintbrush" aria-hidden="true"></i></button>
                            <ul id="bkThemes" class="bk-themes" role="menu" aria-label="Themes" hidden>
                                ${this.palettes.map(([key, label]) => `<li role="none"><button type="button" role="menuitemradio" class="bk-theme" data-palette="${key}" aria-checked="${key === palette}">${label}</button></li>`).join('')}
                            </ul>
                            <button type="button" class="bk-icon" data-action="search" aria-controls="bkSearch" aria-expanded="false" aria-keyshortcuts="S /" aria-label="Toggle Searchbar" title="Search. (Shortkey: s)"><i class="fas fa-magnifying-glass" aria-hidden="true"></i></button>
                        </div>
                        <h1 class="bk-title">${c.name}</h1>
                        <div class="bk-buttons bk-buttons-r">
                            ${c.resume ? '<button type="button" class="bk-icon" data-action="print" aria-label="Print résumé (PDF)" title="Print résumé (PDF)"><i class="fas fa-print" aria-hidden="true"></i></button>' : ''}
                            <a class="bk-icon" href="${c.social.github}" target="_blank" rel="noopener" aria-label="Git repository" title="Git repository"><i class="fab fa-github" aria-hidden="true"></i></a>
                        </div>
                    </div>
                    <div id="bkSearch" class="bk-search" hidden>
                        <form role="search" onsubmit="return false"><input id="bkSearchbar" type="search" placeholder="Search this book…" aria-label="Search this book" aria-controls="bkResults" autocomplete="off" spellcheck="false"></form>
                        <div class="bk-results" hidden><p class="bk-results-head" aria-live="polite"></p><ul id="bkResults"></ul></div>
                    </div>
                    <div class="bk-content">
                        <div class="bk-stack">
                            <pre id="bkSrc" class="bk-src" aria-hidden="true" hidden></pre>
                            <main id="bkMain" tabindex="-1"></main>
                        </div>
                        <nav class="bk-nav" aria-label="Chapter navigation"></nav>
                    </div>
                    <nav class="bk-nav-wide" aria-label="Chapter navigation"></nav>
                </div>
            </div>`;

        this.root = document.getElementById('bkRoot');
        this.main = document.getElementById('bkMain');
        this.go(this.current, { quiet: true });
        this.bind();
        // The shell paints the page with the chooser tile's colour after render; the book's palette goes on top
        const t = this.token;
        queueMicrotask(() => { if (t === this.token) this.paint(); });
        this.intro(t);
    },

    // ---------- the book: one Markdown chapter per section, every fact from portfolioContent ----------

    book() {
        const c = portfolioContent, s = c.stats, first = c.name.split(' ')[0], list = [];
        const code = items => items.map(t => `\`${t}\``).join(' ');
        const host = url => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
        const add = (id, title, md, num = '', suffix = false) => list.push({ id, title, md: md.trim(), num, suffix });
        let n = 0;

        add('intro', 'Introduction', `
# ${c.name}

![Caricature of ${first} working at a laptop](caricature.svg)

**${c.title}** at ${c.experience[0].company} · ${c.location}

> ${c.about.tagline}

${c.about.bio}

## At a glance

- **${s.years} years** of experience across **${s.companies} companies**
- **${s.projects} projects**, in [Projects](projects.md)
- **${s.skills} skills**, in [Skills](skills.md)

## Impact

${c.impact.map(i => `- **${i.value}** – ${i.label}`).join('\n')}

> ${c.about.funFact}

## Outside work

${c.hobbies.map(h => `- ${h}`).join('\n')}

## Reading this book

Start with [Experience](experience.md), or pick a chapter from the sidebar. Press ← and → to turn chapters, and S to search.`);

        const top = ++n;
        add('experience', 'Experience', `
# Experience

${s.years} years across ${s.companies} companies, newest role first.

${c.experience.map((e, i) => `- [${e.position}](experience-${i + 1}.md), ${e.company} · ${e.period}`).join('\n')}`, `${top}.`);
        c.experience.forEach((e, i) => add(`experience-${i + 1}`, e.position, `
# ${e.position}

**${e.company}** · ${e.period} · ${e.location}

${e.achievements.map(a => `- ${a}`).join('\n')}

## Stack

${code(e.technologies)}`, `${top}.${i + 1}.`));

        add('projects', 'Projects', `
# Projects

${c.projects.map(p => `## ${p.title}

${p.description}

${p.highlights.map(h => `- ${h}`).join('\n')}

Built with ${code(p.tags)}${p.site ? `

Live at [${p.site}](https://${p.site})` : ''}`).join('\n\n')}`, `${++n}.`);

        add('skills', 'Skills', `
# Skills

${s.skills} skills, each listed once under its first group.

| Group | Skills |
| --- | --- |
${this.skills().map(([label, items]) => `| ${label} | ${items.map(t => `\`${t}\``).join(', ')} |`).join('\n')}`, `${++n}.`);

        add('education', 'Education', `
# Education

${c.education.map(e => `## ${e.degree}

**${e.institution}** · ${e.year} · ${e.location}${e.gpa ? `

GPA ${e.gpa}` : ''}${e.description ? `

${e.description}` : ''}${e.achievements.length ? `

${e.achievements.map(a => `- ${a}`).join('\n')}` : ''}`).join('\n\n')}

## Patents

${c.patents.map(p => `- [${p.title}](${p.link}), ${p.number} · ${p.status} ${p.year}`).join('\n')}

## Certifications

${c.certifications.map(x => `- [${x.title}](${x.link}), ${x.issuer} · ${x.year}`).join('\n')}`, `${++n}.`);

        add('reading', 'Reading List', `
# Reading List

${c.currentlyReading.map(b => `## ${b.title}

*${b.author}* · ${b.status === 'completed' ? 'Finished' : `In progress, ${b.progress}%`}

> ${b.notes}

[${host(b.link)}](${b.link})`).join('\n\n')}`, `${++n}.`);

        const links = [['Email', `mailto:${c.email}`, c.email], ['GitHub', c.social.github], ['LinkedIn', c.social.linkedin], ['Website', c.social.portfolio], ['Twitter', c.social.twitter]]
            .filter(([, url]) => url).map(([label, url, text]) => `- ${label}: [${text || host(url)}](${url})`);
        if (c.resume) links.push(`- Résumé: [${c.resume.split('/').pop()}](${c.resume})`);
        add('contact', 'Contact', `
# Contact

${links.join('\n')}`, '', true);
        return list;
    },

    // Skill categories overlap in content.js, so each skill is listed once, under its first category
    skills() {
        const c = portfolioContent, seen = new Set();
        return Object.entries(c.skills)
            .map(([key, list]) => [c.skillLabels?.[key] || key, list.filter(s => !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase()))])
            .filter(([, list]) => list.length);
    },

    // ---------- Markdown: headings, paragraphs, lists, quotes, tables, images; inline code, bold, italic, links ----------

    block: /^(#{1,3} |>|- |\||!\[.*\]\(.*\)$)/,

    md(src) {
        const lines = src.split('\n'), out = [];
        const take = test => { const got = []; while (lines.length && test(lines[0])) got.push(lines.shift()); return got; };
        while (lines.length) {
            const line = lines[0];
            let m;
            if (!line.trim()) lines.shift();
            else if ((m = line.match(/^(#{1,3}) (.*)/))) {
                lines.shift();
                const id = this.slug(m[2]), h = m[1].length;
                out.push(`<h${h} id="${id}"><a class="bk-header" href="#${id}">${this.inline(m[2])}</a></h${h}>`);
            } else if (line.startsWith('>')) out.push(`<blockquote>${this.md(take(l => l.startsWith('>')).map(l => l.replace(/^> ?/, '')).join('\n'))}</blockquote>`);
            else if (line.startsWith('- ')) out.push(`<ul>${take(l => l.startsWith('- ')).map(l => `<li>${this.inline(l.slice(2))}</li>`).join('')}</ul>`);
            else if (line.startsWith('|')) {
                const [head, , ...rows] = take(l => l.startsWith('|')).map(l => l.slice(1, -1).split('|').map(cell => this.inline(cell.trim())));
                out.push(`<div class="bk-table"><table><thead><tr>${head.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
            } else if ((m = line.match(/^!\[(.*)\]\((.*)\)$/))) {
                lines.shift();
                out.push(`<figure class="bk-figure">${m[2] === 'caricature.svg' ? caricatureSVG(m[1]) : `<img src="${m[2]}" alt="${m[1]}">`}</figure>`);
            } else out.push(`<p>${this.inline([lines.shift(), ...take(l => l.trim() && !this.block.test(l))].join(' '))}</p>`);
        }
        return out.join('\n');
    },

    inline(s) {
        return s.replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => this.link(text, href));
    },

    // Links to other chapters (foo.md) turn the page; everything else opens in a new tab
    link(text, href) {
        if (href.endsWith('.md')) return `<a href="#book" data-ch="${href.slice(0, -3)}">${text}</a>`;
        if (href.startsWith('mailto:')) return `<a href="${href}">${text}</a>`;
        return `<a href="${href}" target="_blank" rel="noopener"${href.endsWith('.pdf') ? ` download="${href.split('/').pop()}"` : ''}>${text}</a>`;
    },

    slug(s) {
        return s.replace(/<[^>]+>/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
    },

    esc(s) {
        return s.replace(/[&<>"']/g, ch => `&#${ch.charCodeAt(0)};`);
    },

    // Raw Markdown for the opening, markup tinted like an editor
    tint(line) {
        return this.esc(line).replace(/^(#{1,3} |&#62; ?|- )/, '<span class="bk-mk">$1</span>')
            .replace(/(\*\*|`|!?\[|\]\([^)]*\)?|\|)/g, '<span class="bk-mk">$1</span>');
    },

    // ---------- navigation ----------

    go(id, { anchor, terms, quiet } = {}) {
        const ch = this.byId[id];
        if (!ch) return;
        this.current = id;
        this.unmark();
        this.main.innerHTML = this.md(ch.md);
        this.root.querySelectorAll('.bk-chapter a').forEach(a => a.dataset.ch === id ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
        const i = this.chapters.indexOf(ch), prev = this.chapters[i - 1], next = this.chapters[i + 1];
        const arrow = (to, dir, cls) => to ? `<a href="#book" class="${cls} bk-${dir}" data-ch="${to.id}" rel="${dir}" aria-label="${dir === 'prev' ? 'Previous' : 'Next'} chapter: ${to.title}" title="${dir === 'prev' ? 'Previous' : 'Next'} chapter" aria-keyshortcuts="${dir === 'prev' ? 'ArrowLeft' : 'ArrowRight'}"><i class="fas fa-angle-${dir === 'prev' ? 'left' : 'right'}" aria-hidden="true"></i></a>` : '';
        this.root.querySelector('.bk-nav').innerHTML = arrow(prev, 'prev', 'bk-nav-btn') + arrow(next, 'next', 'bk-nav-btn');
        this.root.querySelector('.bk-nav-wide').innerHTML = arrow(prev, 'prev', 'bk-nav-side') + arrow(next, 'next', 'bk-nav-side');
        if (quiet) return;

        if (!this.wide.matches) this.toggleSidebar(false);
        const target = anchor && document.getElementById(anchor);
        if (target) target.scrollIntoView();
        else window.scrollTo(0, 0);
        if (terms) this.mark(terms);
        this.main.focus({ preventScroll: true });
        if (!this.calm()) this.main.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
    },

    step(by) {
        const next = this.chapters[this.chapters.findIndex(ch => ch.id === this.current) + by];
        if (next) this.go(next.id);
    },

    // Wide screens: the sidebar pushes the page (FLIP, so only transforms animate). Narrow: it slides the page aside
    toggleSidebar(show = !this.root.classList.contains('sidebar-visible')) {
        const sidebar = document.getElementById('bkSidebar');
        if (show === this.root.classList.contains('sidebar-visible')) return;
        const moving = this.wide.matches ? [...this.root.querySelectorAll('.bk-content, .bk-menu > *, .bk-nav-side')] : [];
        const before = moving.map(el => el.getBoundingClientRect().left);
        this.root.classList.toggle('sidebar-visible', show);
        sidebar.inert = !show;
        this.root.querySelector('[data-action="sidebar"]').setAttribute('aria-expanded', show);
        if (this.calm()) return;
        moving.forEach((el, i) => {
            const dx = before[i] - el.getBoundingClientRect().left;
            if (dx) el.animate([{ transform: `translateX(${dx}px)` }, { transform: 'none' }], { duration: 300, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
        });
    },

    // ---------- themes (mdBook's own five), remembered per browser ----------

    readPalette() {
        try {
            const saved = localStorage.getItem('portfolio-book-theme');
            if (this.palettes.some(([key]) => key === saved)) return saved;
        } catch {
            // Storage blocked: fall back to the OS preference, as mdBook does
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'navy' : 'light';
    },

    setPalette(key) {
        this.root.dataset.theme = key;
        this.root.querySelectorAll('[data-palette]').forEach(b => b.setAttribute('aria-checked', b.dataset.palette === key));
        try {
            localStorage.setItem('portfolio-book-theme', key);
        } catch {
            // Not remembered; the book still switches
        }
        this.paint();
    },

    // Page background, browser UI colour and scrollbars follow the palette
    paint() {
        const bg = getComputedStyle(this.root).getPropertyValue('--bg').trim();
        document.body.style.backgroundColor = bg;
        document.querySelector('meta[name="theme-color"]').content = bg;
        document.documentElement.style.colorScheme = ['light', 'rust'].includes(this.root.dataset.theme) ? 'light' : 'dark';
    },

    togglePalettes(show) {
        const list = document.getElementById('bkThemes');
        list.hidden = !show;
        this.root.querySelector('[data-action="themes"]').setAttribute('aria-expanded', show);
        if (show) (list.querySelector('[aria-checked="true"]') || list.querySelector('button')).focus();
    },

    // ---------- search: every heading section of every chapter, all words must match ----------

    searchIndex() {
        const box = document.createElement('div'), sections = [];
        for (const ch of this.chapters) {
            box.innerHTML = this.md(ch.md);
            for (const el of box.children) {
                if (/^H[1-3]$/.test(el.tagName)) sections.push({ ch, id: el.id, heading: el.textContent, text: '' });
                else if (sections.length && el.tagName !== 'FIGURE') sections.at(-1).text += ` ${el.textContent}`;
            }
        }
        return sections;
    },

    search(query) {
        const terms = query.toLowerCase().split(/\s+/).filter(Boolean), outer = this.root.querySelector('.bk-results');
        this.terms = terms;
        outer.hidden = !terms.length;
        if (!terms.length) return;
        const count = (hay, t) => hay.split(t).length - 1;
        const hits = this.index.map(sec => {
            const hay = `${sec.heading} ${sec.text}`.toLowerCase();
            return { sec, score: terms.every(t => hay.includes(t)) ? terms.reduce((n, t) => n + count(hay, t) + 5 * count(sec.heading.toLowerCase(), t), 0) : 0 };
        }).filter(h => h.score).sort((a, b) => b.score - a.score).slice(0, 30);

        const q = query.trim();
        this.root.querySelector('.bk-results-head').textContent = hits.length ? `${hits.length} search result${hits.length > 1 ? 's' : ''} for '${q}':` : `No search results for '${q}'.`;
        const re = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
        document.getElementById('bkResults').innerHTML = hits.map(({ sec }) => {
            const text = sec.text.trim(), at = Math.max(0, text.toLowerCase().indexOf(terms[0]) - 60);
            const teaser = `${at ? '…' : ''}${text.slice(at, at + 180)}${text.length > at + 180 ? '…' : ''}`;
            const label = sec.heading === sec.ch.title ? sec.ch.title : `${sec.ch.title} » ${sec.heading}`;
            return `<li><a href="#book" data-ch="${sec.ch.id}" data-anchor="${sec.id}">${this.esc(label)}</a><span class="bk-teaser">${this.esc(teaser).replace(re, '<em>$1</em>')}</span></li>`;
        }).join('');
    },

    toggleSearch(show) {
        const wrap = document.getElementById('bkSearch'), input = document.getElementById('bkSearchbar');
        wrap.hidden = !show;
        this.root.querySelector('[data-action="search"]').setAttribute('aria-expanded', show);
        if (show) {
            window.scrollTo(0, 0);
            this.root.querySelector('.bk-menu').classList.remove('is-hidden');
            input.focus();
            input.select();
        }
    },

    // Search terms stay marked on the page until it's clicked, as in mdBook
    mark(terms) {
        const re = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
        const walker = document.createTreeWalker(this.main, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement.closest('svg') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        for (const node of nodes) {
            const parts = node.data.split(re);
            if (parts.length < 2) continue;
            node.replaceWith(...parts.map((part, i) => {
                if (i % 2 === 0) return part;
                const mark = document.createElement('mark');
                mark.textContent = part;
                return mark;
            }));
            this.marks = true;
        }
    },

    unmark() {
        if (!this.marks) return;
        this.main.querySelectorAll('mark').forEach(m => m.replaceWith(m.textContent));
        this.main.normalize();
        this.marks = false;
    },

    // ---------- events ----------

    bind() {
        const root = this.root, menu = root.querySelector('.bk-menu');
        root.addEventListener('click', (e) => {
            const narrowOpen = !this.wide.matches && root.classList.contains('sidebar-visible');
            if (narrowOpen && !e.target.closest('.bk-sidebar, [data-action="sidebar"]')) {
                e.preventDefault();
                return this.toggleSidebar(false);
            }
            if (!document.getElementById('bkThemes').hidden && !e.target.closest('#bkThemes, [data-action="themes"]')) this.togglePalettes(false);
            if (e.target.closest('#bkMain')) this.unmark();
            const el = e.target.closest('a, button');
            if (!el) return;
            if (el.dataset.ch) {
                e.preventDefault();
                const fromSearch = !!el.closest('#bkResults');
                if (fromSearch) this.toggleSearch(false);
                return this.go(el.dataset.ch, { anchor: el.dataset.anchor, terms: fromSearch && this.terms });
            }
            if (el.classList.contains('bk-header')) {
                // Heading links scroll without touching the URL, which keeps #book
                e.preventDefault();
                return el.parentElement.scrollIntoView({ behavior: this.calm() ? 'auto' : 'smooth' });
            }
            if (el.dataset.palette) {
                this.setPalette(el.dataset.palette);
                this.togglePalettes(false);
                return root.querySelector('[data-action="themes"]').focus();
            }
            const action = el.dataset.action;
            if (action === 'sidebar') this.toggleSidebar();
            else if (action === 'themes') this.togglePalettes(document.getElementById('bkThemes').hidden);
            else if (action === 'search') this.toggleSearch(document.getElementById('bkSearch').hidden);
            else if (action === 'print') this.printResume();
        });

        document.getElementById('bkSearchbar').addEventListener('input', (e) => this.search(e.target.value));

        // The menu bar slides away while reading down and comes back on the way up
        this.lastY = window.scrollY;
        this.onScroll = () => {
            const y = window.scrollY;
            menu.classList.toggle('is-bordered', y > 0);
            if (document.getElementById('bkSearch').hidden && document.getElementById('bkThemes').hidden) menu.classList.toggle('is-hidden', y > this.lastY && y > 50);
            this.lastY = y;
        };
        window.addEventListener('scroll', this.onScroll, { passive: true });

        this.onKey = (e) => this.key(e);
        window.addEventListener('keydown', this.onKey);

        this.onWide = () => this.toggleSidebar(this.wide.matches);
        this.wide.addEventListener('change', this.onWide);
    },

    // Prints the résumé PDF from an off-screen frame, as print-js does. Browsers without an inline PDF viewer (phones)
    // or that refuse the frame get the PDF in a new tab, to print from there
    printResume() {
        const url = portfolioContent.resume;
        this.printFrame?.remove();
        if (!navigator.pdfViewerEnabled) return window.open(url, '_blank', 'noopener');
        const frame = this.printFrame = Object.assign(document.createElement('iframe'), { src: url, title: 'Résumé', tabIndex: -1 });
        frame.setAttribute('aria-hidden', 'true');
        frame.style.cssText = 'position: fixed; width: 0; height: 0; border: 0; visibility: hidden';
        frame.onload = () => {
            try {
                frame.contentWindow.focus();
                frame.contentWindow.print();
            } catch {
                window.open(url, '_blank', 'noopener');
            }
        };
        document.body.append(frame);
    },

    key(e) {
        if (document.getElementById('themeChooser')?.open || e.ctrlKey || e.metaKey || e.altKey) return;
        const searchOpen = !document.getElementById('bkSearch').hidden, themes = document.getElementById('bkThemes');
        const typing = e.target.id === 'bkSearchbar', results = [...document.querySelectorAll('#bkResults a')], at = results.indexOf(document.activeElement);

        if (e.key === 'Escape') {
            if (!themes.hidden) {
                this.togglePalettes(false);
                this.root.querySelector('[data-action="themes"]').focus();
            } else if (searchOpen) this.toggleSearch(false);
            else if (!this.wide.matches) this.toggleSidebar(false);
            return;
        }
        if (!themes.hidden && /^Arrow(Up|Down)$/.test(e.key)) {
            e.preventDefault();
            const items = [...themes.querySelectorAll('button')], i = items.indexOf(document.activeElement);
            return items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus();
        }
        // Up/Down move between search results, from the search bar too
        if (searchOpen && (typing || at >= 0) && /^Arrow(Up|Down)$/.test(e.key) && results.length) {
            e.preventDefault();
            const next = e.key === 'ArrowDown' ? at + 1 : at - 1;
            return next < 0 ? document.getElementById('bkSearchbar').focus() : results[Math.min(next, results.length - 1)].focus();
        }
        if (typing || e.shiftKey) return;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            this.step(e.key === 'ArrowLeft' ? -1 : 1);
        } else if (e.key === 's' || e.key === 'S' || e.key === '/') {
            e.preventDefault();
            this.toggleSearch(true);
        }
    },

    calm() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    // ---------- opening: the chapter's Markdown types out, then renders into the page ----------

    async intro(t) {
        const live = () => t === this.token;
        if (this.fast) return;
        // Nothing plays behind the theme chooser. On page load it opens right after this first render, so look a microtask later
        await null;
        if (!live()) return;
        const chooser = document.getElementById('themeChooser');
        if (chooser?.open) {
            await new Promise(r => { this.onChooser = r; chooser.addEventListener('close', r, { once: true }); });
            if (!live()) return;
        }
        this.onSkip = () => this.skip();
        window.addEventListener('keydown', this.onSkip);
        window.addEventListener('pointerdown', this.onSkip);

        const src = document.getElementById('bkSrc');
        src.hidden = false;
        let done = '';
        for (const line of this.byId[this.current].md.split('\n')) {
            // Each line types in at most 12 steps, so a long paragraph doesn't hold the page up
            const step = Math.max(2, Math.ceil(line.length / 12));
            for (let n = step; n < line.length && !this.fast; n += step) {
                src.innerHTML = `${done}${this.tint(line.slice(0, n))}<span class="bk-caret"></span>`;
                await this.wait(24);
                if (!live()) return;
            }
            done += `${this.tint(line)}\n`;
            src.innerHTML = `${done}<span class="bk-caret"></span>`;
            if (this.fast || src.getBoundingClientRect().bottom > innerHeight - 40) break;
            await this.frame();
            if (!live()) return;
        }
        await this.wait(260);
        if (!live()) return;

        // The source fades as the rendered chapter rises in block by block, and the sidebar fills in
        this.root.classList.remove('is-waiting');
        if (this.fast) src.hidden = true;
        else {
            const ease = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
            const out = src.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 320, easing: 'ease-out', fill: 'forwards' });
            out.onfinish = () => { if (live()) src.hidden = true; };
            this.anims = [out,
                ...[...this.main.children].slice(0, 14).map((el, i) => el.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 650, delay: 200 + i * 90, easing: ease, fill: 'backwards' })),
                ...[...this.root.querySelectorAll('.bk-chapter li')].map((el, i) => el.animate([{ opacity: 0, transform: 'translateX(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 450, delay: 100 + i * 50, easing: ease, fill: 'backwards' }))];
        }
        this.endIntro();
    },

    skip() {
        this.fast = true;
        clearTimeout(this.timer);
        cancelAnimationFrame(this.raf);
        this.wake?.();
        this.anims.forEach(a => a.finish());
    },

    endIntro() {
        window.removeEventListener('keydown', this.onSkip);
        window.removeEventListener('pointerdown', this.onSkip);
        this.onSkip = null;
    },

    frame() {
        if (this.fast) return Promise.resolve();
        return new Promise(r => { this.wake = r; this.raf = requestAnimationFrame(r); });
    },

    wait(ms) {
        if (this.fast) return Promise.resolve();
        return new Promise(r => { this.wake = r; this.timer = setTimeout(r, ms); });
    },

    cleanup() {
        this.token++;
        clearTimeout(this.timer);
        cancelAnimationFrame(this.raf);
        this.endIntro();
        for (const [type, fn] of [['scroll', this.onScroll], ['keydown', this.onKey]]) window.removeEventListener(type, fn);
        this.wide?.removeEventListener('change', this.onWide);
        this.onScroll = this.onKey = this.onWide = null;
        this.printFrame?.remove();
        this.printFrame = null;
        document.getElementById('themeChooser')?.removeEventListener('close', this.onChooser);
        this.onChooser = null;
    }
};

if (typeof window !== 'undefined') {
    window.BookTheme = BookTheme;
}
