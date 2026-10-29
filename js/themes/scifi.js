// Sci-Fi Console theme - a starship's crew records terminal on an amber phosphor CRT (cassette futurism). A numbered
// menu (keys 1-7, arrows) switches record screens, the selected one in inverse video; each screen prints line by line.
// Opens after the theme chooser closes: the tube powers on, runs a self-test, then the console draws in
const SciFiTheme = {
    name: "Sci-Fi Console",
    token: 0,

    render() {
        const c = portfolioContent;
        this.token++;
        this.anims = [];
        this.fast = this.calm();
        this.screens = this.records();
        this.current = this.screens[0].id;

        document.getElementById('themeContainer').innerHTML = `
            <div id="sfRoot" lang="en" class="${this.fast ? '' : 'is-waiting'}">
                <div class="sf-crt">
                    <header class="sf-top">
                        <span class="sf-top-title">Crew records <span class="sf-sep">//</span> ${this.esc(c.name)}</span>
                        <span class="sf-clock" aria-hidden="true">Ship time <span id="sfClock">${this.stamp()}</span></span>
                    </header>
                    <div class="sf-body">
                        <nav class="sf-menu" role="tablist" aria-label="Crew records" aria-orientation="vertical">${this.screens.map((s, i) => `
                            <button type="button" role="tab" id="sfTab-${s.id}" class="sf-tab" data-screen="${s.id}" aria-controls="sfPanel"
                                aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" aria-keyshortcuts="${i + 1}"><span class="sf-key">${i + 1}</span><span>${s.title}</span></button>`).join('')}
                        </nav>
                        <main id="sfPanel" class="sf-panel" role="tabpanel" aria-labelledby="sfTab-${this.current}" tabindex="0">${this.screens[0].html}</main>
                    </div>
                    <footer class="sf-keys" aria-hidden="true">
                        <span><b>1</b>–<b>${this.screens.length}</b> Select</span><span><b>↑</b><b>↓</b> Move</span>
                    </footer>
                    <div class="sf-boot" aria-hidden="true" ${this.fast ? 'hidden' : ''}>${this.bootLines().map(l => `<p>${l}</p>`).join('')}<p class="sf-cursor">&nbsp;</p></div>
                </div>
                <div class="sf-glass" aria-hidden="true"></div>
            </div>`;

        this.root = document.getElementById('sfRoot');
        this.panel = document.getElementById('sfPanel');
        this.bind();
        const t = this.token;
        this.intro(t);
    },

    // ---------- record screens: every fact from portfolioContent ----------

    records() {
        const c = portfolioContent, s = c.stats, e = x => this.esc(x);
        const h = x => `<h3 class="sf-h">${e(x)}</h3>`;
        const link = (href, text, download = false) => `<a href="${href}" ${download ? 'download target="_blank" rel="noopener"' : /^https?:/.test(href) ? 'target="_blank" rel="noopener"' : ''}>${e(text)}</a>`;
        const host = url => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
        const list = items => `<ul class="sf-list">${items.map(x => `<li>${x}</li>`).join('')}</ul>`;
        // Colour emoji would break the single-phosphor screen
        const plain = x => x.replace(/\s*\p{Extended_Pictographic}️?/gu, '');
        const seen = new Set();
        const skills = Object.entries(c.skills)
            .map(([key, items]) => [c.skillLabels[key] || key, items.filter(x => !seen.has(x.toLowerCase()) && seen.add(x.toLowerCase()))])
            .filter(([, items]) => items.length);
        const now = c.experience[0];
        const channels = [['Email', `mailto:${c.email}`, c.email], ['GitHub', c.social.github, host(c.social.github)],
            ['LinkedIn', c.social.linkedin, host(c.social.linkedin)], ['Homepage', c.social.portfolio, host(c.social.portfolio)],
            ['Twitter', c.social.twitter && `https://twitter.com/${c.social.twitter}`, `@${c.social.twitter}`]].filter(([, href]) => href);
        const screen = (title, note, body) => `<div class="sf-screen"><h2 class="sf-title">${e(title)}<span>${e(note)}</span></h2>${body}</div>`;

        return [
            { id: 'dossier', title: 'Dossier', html: screen('Crew dossier', 'Personnel file', `
                <div class="sf-id">
                    <figure class="sf-portrait">${caricatureSVG(`Caricature of ${e(c.name)}`)}<figcaption>Visual ID on file</figcaption></figure>
                    <dl class="sf-fields">
                        <div><dt>Name</dt><dd>${e(c.name)}</dd></div>
                        <div><dt>Designation</dt><dd>${e(c.title)}</dd></div>
                        <div><dt>Specialty</dt><dd>${e(c.specialization)}</dd></div>
                        <div><dt>Posting</dt><dd>${e(now.company)} · ${e(now.location)}</dd></div>
                        <div><dt>Home port</dt><dd>${e(c.location)}</dd></div>
                        <div><dt>In service</dt><dd>${s.years} years · ${s.companies} companies</dd></div>
                    </dl>
                </div>
                ${h('Profile')}<p>${e(c.about.tagline)}.</p><p>${e(c.about.bio)}</p>
                ${h('Commendations')}${list(c.impact.map(i => `<b>${e(i.value)}</b> ${e(i.label)}`))}<p>${e(plain(c.about.funFact))}</p>
                ${h('Focus')}<p class="sf-tags">${c.about.interests.map(x => `<span>${e(x)}</span>`).join('')}</p>
                ${h('Off duty')}<p>${e(c.hobbies.join(' · '))}</p>`) },
            { id: 'service', title: 'Service record', html: screen('Service record', `${s.years} years · ${c.experience.length} postings`, c.experience.map(x => `
                <article class="sf-entry">
                    <p class="sf-date">${e(x.period)}</p>
                    <h3 class="sf-entry-title">${e(x.position)}</h3>
                    <p class="sf-dim">${e(x.company)} · ${e(x.location)}</p>
                    ${list(x.achievements.map(e))}
                    <p class="sf-dim">Systems: ${e(x.technologies.join(', '))}</p>
                </article>`).join('')) },
            { id: 'missions', title: 'Missions', html: screen('Mission log', `${s.projects} missions`, c.projects.map(p => `
                <article class="sf-entry">
                    <p class="sf-date">MSN-${String(p.id).padStart(3, '0')}</p>
                    <h3 class="sf-entry-title">${e(p.title)}</h3>
                    <p>${e(p.description)}</p>
                    ${list(p.highlights.map(e))}
                    <p class="sf-dim">Systems: ${e(p.tags.join(', '))}</p>
                    ${p.site ? `<p>Uplink: ${link(`https://${p.site}`, p.site)}</p>` : ''}
                </article>`).join('')) },
            { id: 'systems', title: 'Systems', html: screen('Systems check', `${s.skills} modules online`, skills.map(([label, items]) => `
                ${h(label)}<ul class="sf-grid">${items.map(x => `<li>${e(x)}</li>`).join('')}</ul>`).join('')) },
            { id: 'training', title: 'Training', html: screen('Training', `${c.education.length} academies · ${c.certifications.length} certificates`, c.education.map(x => `
                <article class="sf-entry">
                    <p class="sf-date">${e(x.year)}</p>
                    <h3 class="sf-entry-title">${e(x.degree)}</h3>
                    <p class="sf-dim">${e(x.institution)} · ${e(x.location)} · GPA ${e(x.gpa)}</p>
                    ${list((x.achievements.length ? x.achievements : [x.description].filter(Boolean)).map(e))}
                </article>`).join('')
                + h(c.patents.length > 1 ? 'Patents' : 'Patent') + list(c.patents.map(p => `${link(p.link, p.title)} <span class="sf-dim">${e(p.number)} · ${e(p.status)} ${e(p.year)}</span><br>${e(p.description)}`))
                + h('Certificates') + list(c.certifications.map(x => `${link(x.link, x.title)} <span class="sf-dim">${e(x.issuer)} · ${e(x.year)}</span>`))) },
            { id: 'archive', title: 'Archive', html: screen('Reading archive', `${c.currentlyReading.length} volumes`, c.currentlyReading.map(r => `
                <article class="sf-entry">
                    <p class="sf-date">${r.status === 'completed' ? 'Finished' : `${e(r.progress)}% read`}</p>
                    <h3 class="sf-entry-title">${link(r.link, r.title)}</h3>
                    <p class="sf-dim">${e(r.author)}</p>
                    <p>${e(r.notes)}</p>
                </article>`).join('')) },
            { id: 'comms', title: 'Comms', html: screen('Comms', 'Channels open', `
                <dl class="sf-fields sf-channels">${channels.map(([label, href, text]) => `
                    <div><dt>${label}</dt><dd>${link(href, text)}</dd></div>`).join('')}
                    ${c.resume ? `<div><dt>Dossier</dt><dd>${link(c.resume, 'Download résumé (PDF)', true)}</dd></div>` : ''}
                    <div><dt>Location</dt><dd>${e(c.location)}</dd></div>
                </dl>
                <p class="sf-dim">Awaiting transmission<span class="sf-cursor">&nbsp;</span></p>`) }
        ];
    },

    // Power-on self-test; the counts are real
    bootLines() {
        const c = portfolioContent, s = c.stats;
        return ['Power on', 'Self-test .......... OK', 'Crew registry link .. OK', `Query: ${this.esc(c.name)}`,
            `${c.experience.length} postings · ${s.projects} missions · ${s.skills} modules`, 'Access granted'];
    },

    // Day-of-year ship time, e.g. 2026.302 14:05:09
    stamp() {
        const d = new Date();
        const day = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
        return `${d.getFullYear()}.${String(day).padStart(3, '0')} ${d.toTimeString().slice(0, 8)}`;
    },

    esc(s) {
        return String(s).replace(/[&<>"']/g, ch => `&#${ch.charCodeAt(0)};`);
    },

    // ---------- behaviour ----------

    bind() {
        this.tabs = [...this.root.querySelectorAll('.sf-tab')];
        this.root.querySelector('.sf-menu').addEventListener('click', (e) => {
            const tab = e.target.closest('[data-screen]');
            if (tab) this.show(tab.dataset.screen);
        });

        // 1-7 open a screen from anywhere; arrows, Home and End move along the menu (a tablist)
        this.onKey = (e) => {
            if (e.metaKey || e.ctrlKey || e.altKey || document.getElementById('themeChooser')?.open) return;
            const n = Number(e.key);
            if (n >= 1 && n <= this.tabs.length) return this.show(this.screens[n - 1].id, true);
            const at = this.tabs.indexOf(document.activeElement);
            if (at < 0) return;
            const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
            const to = step ? (at + step + this.tabs.length) % this.tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? this.tabs.length - 1 : -1;
            if (to < 0) return;
            e.preventDefault();
            this.show(this.screens[to].id, true);
        };
        window.addEventListener('keydown', this.onKey);

        this.clock = setInterval(() => { document.getElementById('sfClock').textContent = this.stamp(); }, 1000);
    },

    // Swap the panel to a screen; it prints in line by line (CSS, --i per line)
    show(id, focus = false) {
        const tab = this.tabs.find(t => t.dataset.screen === id);
        if (focus) tab.focus();
        if (id === this.current) return;
        this.current = id;
        this.tabs.forEach(t => {
            t.setAttribute('aria-selected', t === tab);
            t.tabIndex = t === tab ? 0 : -1;
        });
        this.panel.setAttribute('aria-labelledby', tab.id);
        this.panel.innerHTML = this.screens.find(s => s.id === id).html;
        this.lines(this.panel).forEach((el, i) => {
            el.classList.add('sf-line');
            el.style.setProperty('--i', Math.min(i, 30));
        });
        this.panel.scrollTop = 0;
        tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        // Phones scroll the page, not the panel: bring the new screen's top under the sticky menu
        const menu = this.root.querySelector('.sf-menu').getBoundingClientRect();
        const top = this.panel.getBoundingClientRect().top;
        if (getComputedStyle(this.panel).overflowY === 'visible' && top < menu.bottom) scrollBy(0, top - menu.bottom);
    },

    lines(scope) {
        return [...scope.querySelectorAll('.sf-screen > :not(.sf-entry, .sf-list, .sf-id, .sf-fields), .sf-entry > :not(.sf-list), .sf-portrait, .sf-fields > div, .sf-list > li')];
    },

    calm() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    // ---------- opening: the tube powers on, the self-test prints, then the console draws in ----------

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
        const q = sel => [...this.root.querySelectorAll(sel)];
        const ease = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
        const boot = q('.sf-boot p'), lineAt = 520, uiAt = lineAt + boot.length * 140 + 260;
        const ui = [...q('.sf-top, .sf-tab'), ...this.lines(this.panel), ...q('.sf-keys')];
        this.anims = [
            // A bright line opens out to the full tube
            this.root.querySelector('.sf-crt').animate([{ transform: 'scale(0.6, 0.004)', opacity: 0 }, { transform: 'scale(1, 0.004)', opacity: 1, offset: 0.45 }, { transform: 'none', opacity: 1 }], { duration: 480, easing: ease, fill: 'backwards' }),
            ...boot.map((el, i) => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 60, delay: lineAt + i * 140, fill: 'backwards' })),
            this.root.querySelector('.sf-boot').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, delay: uiAt - 120, fill: 'forwards' }),
            ...ui.map((el, i) => el.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: uiAt + Math.min(i, 40) * 28, easing: ease, fill: 'backwards' }))
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
        if (this.root?.isConnected) this.root.querySelector('.sf-boot').hidden = true;
    },

    cleanup() {
        this.token++;
        this.endIntro();
        window.removeEventListener('keydown', this.onKey);
        this.onKey = null;
        clearInterval(this.clock);
        this.clock = null;
        document.getElementById('themeChooser')?.removeEventListener('close', this.onChooser);
        this.onChooser = null;
    }
};

if (typeof window !== 'undefined') {
    window.SciFiTheme = SciFiTheme;
}
