// Contact Card theme - the résumé as an iPhone contact card (iOS Contacts). A Contact Poster puts the caricature in front
// of the name (the poster's depth effect); under it come the action buttons, grouped fields, Notes, and rows that push
// detail pages. Share Contact hands over a real vCard. Opens after the theme chooser closes: the name rises letter by
// letter, the caricature steps in front of it, then the card fills in
const AppleTheme = {
    name: "Contact Card",
    token: 0,

    render() {
        const c = portfolioContent;
        this.token++;
        this.anims = [];
        this.openId = null;
        this.fast = this.calm();
        this.pages = this.book();
        const [first, ...rest] = c.name.split(' ');
        const letters = word => [...word].map(ch => `<span class="ap-letter">${this.esc(ch)}</span>`).join('');
        const host = url => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
        const urls = [['homepage', c.social.portfolio], ['GitHub', c.social.github], ['LinkedIn', c.social.linkedin],
            ['Twitter', c.social.twitter && `https://twitter.com/${c.social.twitter}`]].filter(([, url]) => url);
        const actions = [['mail', 'fas fa-envelope', `mailto:${c.email}`], ['GitHub', 'fab fa-github', c.social.github],
            ['LinkedIn', 'fab fa-linkedin-in', c.social.linkedin], c.resume && ['résumé', 'fas fa-file-arrow-down', c.resume]].filter(Boolean);

        document.getElementById('themeContainer').innerHTML = `
            <div id="apRoot" lang="en" class="${this.fast ? '' : 'is-waiting'}">
                <div class="ap-bar" aria-hidden="true">${this.esc(c.name)}</div>
                <section class="ap-poster" aria-label="Contact poster">
                    <h1 class="ap-name" aria-label="${this.esc(c.name)}">
                        <span aria-hidden="true">${letters(first)}</span>
                        <span aria-hidden="true">${letters(rest.join(' '))}</span>
                    </h1>
                    <div class="ap-figure">${caricatureSVG(`Caricature of ${this.esc(c.name)}`)}</div>
                </section>
                <div id="apMain" class="ap-main">
                    <main class="ap-card" tabindex="-1">
                        <div class="ap-head">
                            <p class="ap-title">${this.esc(c.title)}</p>
                            <p class="ap-org">${this.esc(c.specialization)} · ${this.esc(c.experience[0].company)}</p>
                        </div>
                        <nav class="ap-actions" aria-label="Contact actions">${actions.map(([label, icon, href]) => `
                            <a class="ap-action" href="${href}" ${this.external(href, label === 'résumé')}><i class="${icon}" aria-hidden="true"></i><span>${label}</span></a>`).join('')}
                        </nav>
                        <div class="ap-group">${this.field('work', c.email, `mailto:${c.email}`)}</div>
                        <div class="ap-group">${urls.map(([label, url]) => this.field(label, host(url), url)).join('')}</div>
                        <div class="ap-group">${this.field('home', c.location.split(', '), `https://maps.apple.com/?q=${encodeURIComponent(c.location)}`)}</div>
                        <div class="ap-group">
                            <div class="ap-row ap-field ap-notes">
                                <span class="ap-label">Notes</span>
                                <p>${this.esc(c.about.tagline)}.</p>
                                <p>${this.esc(c.about.bio)}</p>
                                <p>${c.impact.map(i => `${this.esc(i.value)} – ${this.esc(i.label)}`).join('<br>')}</p>
                                <p>${this.esc(c.about.funFact)}</p>
                                <p>Off the clock: ${this.esc(c.hobbies.join(', '))}.</p>
                            </div>
                        </div>
                        <div class="ap-group">${this.pages.map(p => `
                            <button type="button" class="ap-row ap-more" data-page="${p.id}"><span>${p.title}</span><span class="ap-detail">${p.value}</span><i class="fas fa-chevron-right" aria-hidden="true"></i></button>`).join('')}
                        </div>
                        <div class="ap-group">
                            <button type="button" class="ap-row ap-link" data-action="share">Share Contact</button>
                            ${c.resume ? `<a class="ap-row ap-link" href="${c.resume}" ${this.external(c.resume, true)}>Download Résumé</a>` : ''}
                        </div>
                    </main>
                </div>
                <section id="apPage" class="ap-page" aria-labelledby="apPageTitle" hidden>
                    <div class="ap-nav">
                        <button type="button" class="ap-back" data-action="back" aria-label="Back to ${this.esc(first)}"><i class="fas fa-chevron-left" aria-hidden="true"></i><span>${this.esc(first)}</span></button>
                        <h2 id="apPageTitle" class="ap-nav-title"></h2>
                    </div>
                    <div id="apPageBody" class="ap-page-body"></div>
                </section>
            </div>`;

        this.root = document.getElementById('apRoot');
        this.main = document.getElementById('apMain');
        this.page = document.getElementById('apPage');
        this.bind();
        // The shell paints the page with the chooser tile's (poster) colour after render; the card's grey goes on top
        const t = this.token;
        queueMicrotask(() => { if (t === this.token) this.paint(); });
        this.intro(t);
    },

    // ---------- detail pages: one per disclosure row, every fact from portfolioContent ----------

    book() {
        const c = portfolioContent, s = c.stats, e = x => this.esc(x);
        const item = (title, ...subs) => `<div class="ap-row ap-item"><strong>${e(title)}</strong>${subs.filter(Boolean).map(x => `<span class="ap-sub">${e(x)}</span>`).join('')}</div>`;
        const link = (href, title, ...subs) => `<a class="ap-row ap-item ap-out" href="${href}" ${this.external(href)}><strong>${e(title)}</strong>${subs.filter(Boolean).map(x => `<span class="ap-sub">${e(x)}</span>`).join('')}</a>`;
        const text = x => `<div class="ap-row ap-text">${e(x)}</div>`;
        const seen = new Set();
        const skills = Object.entries(c.skills)
            .map(([key, list]) => [c.skillLabels[key] || key, list.filter(x => !seen.has(x.toLowerCase()) && seen.add(x.toLowerCase()))])
            .filter(([, list]) => list.length);

        return [
            { id: 'experience', title: 'Experience', value: `${s.years} yrs`,
                html: this.caption(`${s.years} years across ${s.companies} companies`) + c.experience.map(x => this.group(x.company,
                    [item(x.position, `${x.period} · ${x.location}`), ...x.achievements.map(text)], x.technologies.join(' · '))).join('') },
            { id: 'projects', title: 'Projects', value: s.projects,
                html: c.projects.map(p => this.group('', [item(p.title, p.highlights.join(' · ')), text(p.description),
                    p.site && this.field('website', p.site, `https://${p.site}`)], p.tags.join(' · '))).join('') },
            { id: 'skills', title: 'Skills', value: s.skills,
                html: this.caption(`${s.skills} skills, each listed once`) + skills.map(([label, list]) => this.group(label,
                    [`<div class="ap-row ap-text ap-skills">${list.map(x => `<span>${e(x)}</span>`).join(', ')}</div>`])).join('') },
            { id: 'education', title: 'Education', value: c.education.length,
                html: c.education.map(x => this.group('', [item(x.degree, x.institution), item(x.year, `GPA ${x.gpa}`, x.location),
                    ...(x.achievements.length ? x.achievements : [x.description].filter(Boolean)).map(text)])).join('')
                    + this.group(c.patents.length > 1 ? 'Patents' : 'Patent', c.patents.map(p => link(p.link, p.title, `${p.number} · ${p.status} ${p.year}`, p.description)))
                    + this.group('Certifications', c.certifications.map(x => link(x.link, x.title, `${x.issuer} · ${x.year}`))) },
            { id: 'reading', title: 'Reading List', value: c.currentlyReading.length,
                html: this.group('', c.currentlyReading.map(r => link(r.link, r.title, r.author,
                    r.status === 'completed' ? 'Finished' : `${r.progress}% read`, r.notes))) }
        ];
    },

    group(header, rows, footer = '') {
        rows = rows.filter(Boolean);
        if (!rows.length) return '';
        return `${header ? `<h3 class="ap-section">${this.esc(header)}</h3>` : '<div class="ap-gap"></div>'}<div class="ap-group">${rows.join('')}</div>${footer ? `<p class="ap-footer">${this.esc(footer)}</p>` : ''}`;
    },

    // A labelled field, as Contacts shows one: label above, value (one line or several) in the tint colour
    field(label, value, href) {
        return `<a class="ap-row ap-field" href="${href}" ${this.external(href)}><span class="ap-label">${label}</span><span class="ap-value">${[].concat(value).map(v => this.esc(v)).join('<br>')}</span></a>`;
    },

    caption(s) {
        return `<p class="ap-caption">${this.esc(s)}</p>`;
    },

    external(href, download = false) {
        if (download) return `download target="_blank" rel="noopener"`;
        return /^https?:/.test(href) ? 'target="_blank" rel="noopener"' : '';
    },

    esc(s) {
        return String(s).replace(/[&<>"']/g, ch => `&#${ch.charCodeAt(0)};`);
    },

    // ---------- behaviour ----------

    bind() {
        this.root.addEventListener('click', (e) => {
            const row = e.target.closest('[data-page]');
            if (row) return this.open(row.dataset.page, row);
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (action === 'back') this.back();
            else if (action === 'share') this.share();
        });

        this.onKey = (e) => {
            if (e.key === 'Escape' && this.openId && !document.getElementById('themeChooser')?.open) this.back();
        };
        window.addEventListener('keydown', this.onKey);

        // Phones: once the poster scrolls away, a compact bar keeps the name on screen, as in Contacts
        this.observer = new IntersectionObserver(([entry]) => this.root.classList.toggle('is-compact', !entry.isIntersecting), { rootMargin: '-44px 0px 0px 0px' });
        this.observer.observe(this.root.querySelector('.ap-poster'));
    },

    // Push a detail page: it slides in from the right while the card drifts left, like a navigation push on iOS
    open(id, from) {
        const page = this.pages.find(p => p.id === id);
        if (!page || this.openId) return;
        this.openId = id;
        this.opener = from;
        document.getElementById('apPageTitle').textContent = page.title;
        document.getElementById('apPageBody').innerHTML = page.html;
        this.page.hidden = false;
        this.page.scrollTop = 0;
        this.main.inert = true;
        this.slide(true);
        this.page.querySelector('.ap-back').focus({ preventScroll: true });
    },

    back() {
        if (!this.openId) return;
        this.openId = null;
        this.main.inert = false;
        this.slide(false, () => { this.page.hidden = true; });
        this.opener?.focus({ preventScroll: true });
    },

    slide(push, done) {
        this.pageAnims?.forEach(a => a.cancel());
        if (this.calm()) return done?.();
        const timing = { duration: 460, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' };
        const page = [{ transform: 'translateX(100%)' }, { transform: 'none' }], card = [{ transform: 'none' }, { transform: 'translateX(-30%)' }];
        if (!push) [page, card].forEach(k => k.reverse());
        this.pageAnims = [this.page.animate(page, timing), this.main.animate(card, timing)];
        this.pageAnims[0].onfinish = () => done?.();
    },

    vcard() {
        const c = portfolioContent;
        const v = s => String(s).replace(/[\\,;]/g, '\\$&').replace(/\n/g, '\\n');
        const [first, ...rest] = c.name.split(' ');
        const [city, country] = c.location.split(', ');
        const urls = [['homepage', c.social.portfolio], ['GitHub', c.social.github], ['LinkedIn', c.social.linkedin]].filter(([, url]) => url);
        return ['BEGIN:VCARD', 'VERSION:3.0', `N:${v(rest.join(' '))};${v(first)};;;`, `FN:${v(c.name)}`,
            `ORG:${v(c.experience[0].company)}`, `TITLE:${v(c.title)}`, `EMAIL;TYPE=INTERNET,WORK:${c.email}`,
            // item.X-ABLabel is how Contacts names a URL ("GitHub") when it saves a card
            ...urls.flatMap(([label, url], i) => [`item${i + 1}.URL:${url}`, `item${i + 1}.X-ABLabel:${v(label)}`]),
            `ADR;TYPE=HOME:;;;${v(city)};;;${v(country || '')}`, `NOTE:${v(c.about.shortBio)}`, 'END:VCARD', ''].join('\r\n');
    },

    // Share Contact: the share sheet where the browser can share files (phones), otherwise the .vcf downloads
    async share() {
        const file = new File([this.vcard()], `${portfolioContent.name}.vcf`, { type: 'text/vcard' });
        if (navigator.canShare?.({ files: [file] })) {
            try {
                return await navigator.share({ files: [file], title: portfolioContent.name });
            } catch (error) {
                if (error.name === 'AbortError') return;
            }
        }
        if (this.vcardUrl) URL.revokeObjectURL(this.vcardUrl);
        this.vcardUrl = URL.createObjectURL(file);
        Object.assign(document.createElement('a'), { href: this.vcardUrl, download: file.name }).click();
    },

    // Page background and scrollbars follow the card's grey (light or dark, as the OS is)
    paint() {
        document.body.style.backgroundColor = getComputedStyle(this.root).getPropertyValue('--bg').trim();
        document.documentElement.style.colorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },

    calm() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    // ---------- opening: the name rises letter by letter, the caricature steps in front of it, the card fills in ----------

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

        this.root.classList.remove('is-waiting');
        const spring = 'cubic-bezier(0.34, 1.4, 0.64, 1)', ease = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
        const letters = [...this.root.querySelectorAll('.ap-letter')], figureAt = 160 + letters.length * 38;
        const card = [this.root.querySelector('.ap-head'), ...this.root.querySelectorAll('.ap-action, .ap-card > .ap-group')];
        this.anims = [
            ...letters.map((el, i) => el.animate([{ opacity: 0, transform: 'translateY(45%) scale(0.9)' }, { opacity: 1, transform: 'none' }], { duration: 620, delay: 120 + i * 38, easing: spring, fill: 'backwards' })),
            this.root.querySelector('.ap-figure').animate([{ opacity: 0, transform: 'translateY(18%) scale(0.9)' }, { opacity: 1, transform: 'none' }], { duration: 820, delay: figureAt, easing: spring, fill: 'backwards' }),
            ...card.map((el, i) => el.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: figureAt + 280 + i * 55, easing: ease, fill: 'backwards' }))
        ];
        await Promise.all(this.anims.map(a => a.finished)).catch(() => {});
        if (live()) this.endIntro();
    },

    skip() {
        this.anims.forEach(a => a.finish());
        this.endIntro();
    },

    endIntro() {
        window.removeEventListener('keydown', this.onSkip);
        window.removeEventListener('pointerdown', this.onSkip);
        this.onSkip = null;
    },

    cleanup() {
        this.token++;
        this.endIntro();
        window.removeEventListener('keydown', this.onKey);
        this.onKey = null;
        this.observer?.disconnect();
        this.observer = null;
        if (this.vcardUrl) URL.revokeObjectURL(this.vcardUrl);
        this.vcardUrl = null;
        document.getElementById('themeChooser')?.removeEventListener('close', this.onChooser);
        this.onChooser = null;
    }
};

if (typeof window !== 'undefined') {
    window.AppleTheme = AppleTheme;
}
