// Terminal theme - the visitor's own terminal (macOS Terminal, Windows PowerShell, Ubuntu, or a plain phone terminal).
// It boots with a loader, then type (or click) a command; every answer comes from portfolioContent
const TerminalTheme = {
    name: "Terminal",

    // One per device: window chrome, prompt, greeting and error wording follow the real thing
    profiles: {
        mac: {
            shell: 'zsh 5.9', script: './portfolio',
            prompt: h => `<span class="tm-acc">guest@${h}</span> <span class="tm-key">~</span> %`,
            greeting: () => {
                const d = new Date();
                return [`Last login: ${d.toDateString().slice(0, 10)} ${d.toTimeString().slice(0, 8)} on ttys000`];
            },
            notFound: (w, near) => `<p>zsh: command not found: ${w}</p>${near ? `<p class="tm-dim">Did you mean ${near}?</p>` : ''}`
        },
        windows: {
            shell: 'PowerShell 5.1', script: '.\\portfolio.ps1',
            prompt: () => 'PS C:\\Users\\guest&gt;',
            greeting: () => ['Windows PowerShell', 'Copyright (C) Microsoft Corporation. All rights reserved.', '',
                'Install the latest PowerShell for new features and improvements! https://aka.ms/PSWindows'],
            notFound: (w, near) => `<p class="tm-err">${w} : The term '${w}' is not recognized as the name of a cmdlet, function, script file, or operable program.</p>${near ? `<p class="tm-dim">Did you mean ${near}?</p>` : ''}`
        },
        linux: {
            shell: 'bash 5.2', script: './portfolio',
            prompt: h => `<b class="tm-acc">guest@${h}</b>:<b class="tm-blue">~</b>$`,
            greeting: () => ['Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-48-generic x86_64)', '', ' * Documentation:  https://help.ubuntu.com'],
            notFound: (w, near) => near ? `<p>Command '${w}' not found, did you mean:</p><p>&nbsp;&nbsp;command ${near} from portfolio</p>` : `<p>${w}: command not found</p>`
        },
        phone: {
            shell: 'sh', script: './portfolio',
            prompt: h => `<span class="tm-acc">guest@${h}</span>:<span class="tm-key">~</span>$`,
            greeting: () => [`Welcome to ${portfolioContent.name}'s portfolio!`, 'Tap a command below, or type one.'],
            notFound: (w, near) => `<p>${w}: command not found</p>${near ? `<p class="tm-dim">Did you mean ${near}?</p>` : ''}`
        }
    },

    // Phones (and narrow windows) get the plain terminal; desktops get their own OS's
    detect() {
        const ua = navigator.userAgent, platform = navigator.userAgentData?.platform || navigator.platform || '';
        if (navigator.userAgentData?.mobile || /Android|iPhone|iPod|Mobile/i.test(ua) || matchMedia('(max-width: 767px)').matches) return 'phone';
        if (/Win/i.test(platform)) return 'windows';
        if (/Mac/i.test(platform)) return 'mac';
        return 'linux'; // Linux, ChromeOS and the rest get Ubuntu's terminal
    },

    render() {
        const c = portfolioContent;
        this.os = this.detect();
        this.p = this.profiles[this.os];
        this.host = c.name.split(' ')[0].toLowerCase();
        this.history = [];
        this.at = 0;
        this.commands = this.registry();
        this.token = (this.token || 0) + 1;
        this.art = this.pixelArt(48);
        const scheme = this.savedScheme();

        document.getElementById('themeContainer').innerHTML = `
            <div id="tmRoot" data-os="${this.os}" ${scheme ? `data-scheme="${scheme}"` : ''}>
                <div class="tm-win">
                    ${this.chrome()}
                    <div id="tmScreen" class="tm-screen">
                        <div id="tmOut" role="log" aria-live="polite" aria-label="Terminal output"></div>
                        <label class="tm-line tm-entry-line" hidden>${this.prompt()}<span class="tm-field"><span id="tmEcho" aria-hidden="true"></span><input id="tmInput" type="text" aria-label="Command" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go"></span></label>
                    </div>
                </div>
            </div>`;
        this.root = document.getElementById('tmRoot');
        this.screen = document.getElementById('tmScreen');
        this.out = document.getElementById('tmOut');
        this.input = document.getElementById('tmInput');
        this.echo = document.getElementById('tmEcho');
        this.bind();
        this.sync();
        this.boot(this.token);
    },

    // Title only: window buttons that do nothing would only invite clicks
    chrome() {
        if (this.os === 'mac') return `<header class="tm-bar" aria-hidden="true"><span id="tmTitle" class="tm-title">guest — -zsh</span></header>`;
        if (this.os === 'windows') return `<header class="tm-bar" aria-hidden="true"><span class="tm-tab"><span class="tm-ps">&gt;_</span>Windows PowerShell</span></header>`;
        if (this.os === 'linux') return `<header class="tm-bar" aria-hidden="true"><span class="tm-title">guest@${this.host}: ~</span></header>`;
        return '';
    },

    // ---------- boot: greeting, a loader, the name banner, then neofetch ----------

    // Waits resolve at once after a skip (any key, click or tap) or under reduced motion
    wait(ms) {
        if (this.fast) return Promise.resolve();
        return new Promise(r => { this.wake = r; this.timer = setTimeout(r, ms); });
    },

    skip() {
        this.fast = true;
        clearTimeout(this.timer);
        this.wake?.();
    },

    async boot(t) {
        const c = portfolioContent, s = c.stats, live = () => t === this.token;
        this.busy = this.booting = true;
        this.fast = this.calm();
        // Nothing plays behind the theme chooser: the window opens once it's closed.
        // On page load the chooser opens right after this first render, so look a microtask later
        await null;
        const chooser = document.getElementById('themeChooser');
        if (chooser?.open) {
            await new Promise(r => { this.onChooser = r; chooser.addEventListener('close', r, { once: true }); });
            if (!live()) return;
        }
        this.root.classList.add('is-live');
        this.onSkip = () => this.skip();
        window.addEventListener('keydown', this.onSkip);
        const line = this.root.querySelector('.tm-entry-line');
        const add = (parent, html, cls = '') => {
            parent.insertAdjacentHTML('beforeend', `<div class="${cls}">${html}</div>`);
            this.screen.scrollTop = this.screen.scrollHeight;
            return parent.lastElementChild;
        };

        for (const g of this.p.greeting()) {
            add(this.out, g ? this.esc(g) : '&nbsp;', 'tm-sys');
            await this.wait(70); if (!live()) return;
        }
        line.hidden = false;
        await this.wait(380); if (!live()) return;
        await this.type(this.p.script); if (!live()) return;
        const entry = this.print(this.p.script);
        line.hidden = true;
        this.input.value = '';
        this.sync();

        // Loader: each module from content.js spins, then ticks; a bar fills; it all folds into one line
        const steps = [['experience', `${c.experience.length} roles`], ['projects', s.projects], ['skills', s.skills],
            ['education', c.education.length], ['certifications', c.certifications.length + c.patents.length]];
        const width = this.os === 'phone' ? 18 : 30, started = performance.now();
        const box = add(entry, '', 'tm-out tm-load');
        box.setAttribute('aria-hidden', 'true');
        const bar = n => `[<span class="tm-acc">${'█'.repeat(Math.round(n * width))}</span><span class="tm-dim">${'░'.repeat(width - Math.round(n * width))}</span>] ${String(Math.round(n * 100)).padStart(3)}%`;
        const rows = add(box, ''), meter = add(box, bar(0));
        const hint = add(box, this.os === 'phone' ? 'tap to skip' : 'press any key to skip', 'tm-dim');
        for (const [i, [name, n]] of steps.entries()) {
            const row = add(rows, '');
            for (const f of '⠋⠙⠹⠸') {
                row.innerHTML = `<span class="tm-key">${f}</span> loading ${name}…`;
                await this.wait(55); if (!live()) return;
            }
            row.innerHTML = `<span class="tm-acc">✔</span> ${name} <span class="tm-dim">${'.'.repeat(16 - name.length)}</span> ${n}`;
            meter.innerHTML = bar((i + 1) / steps.length);
        }
        hint.remove();
        await this.wait(260); if (!live()) return;
        box.innerHTML = `<span class="tm-acc">✔</span> loaded ${steps.length} modules <span class="tm-dim">in ${((performance.now() - started) / 1000).toFixed(1)}s</span>`;
        box.removeAttribute('aria-hidden');

        const out = add(entry, '', 'tm-out');
        this.artLines = await this.art; if (!live()) return;
        add(out, this.header());
        await this.wait(600); if (!live()) return;
        add(out, this.menu());
        line.hidden = false;
        this.done();
    },

    done() {
        window.removeEventListener('keydown', this.onSkip);
        this.busy = this.booting = false;
        this.fast = false;
        this.screen.scrollTop = this.screen.scrollHeight;
        if (matchMedia('(pointer: fine)').matches) this.input.focus({ preventScroll: true });
    },

    // Boot header, kept to a few lines: the caricature at its laptop, the name banner and the essentials
    header() {
        const c = portfolioContent, s = c.stats;
        return `
            <div class="tm-head">
                ${caricatureSVG()}
                <div class="tm-head-text">
                    <div class="tm-banner">${this.banner(c.name.split(' ')[0])}</div>
                    <p><b>${c.name}</b> <span class="tm-dim">·</span> ${c.title}</p>
                    <p class="tm-dim">${c.location} · ${s.years} years · ${s.companies} companies · ${s.projects} projects · ${s.skills} skills</p>
                </div>
            </div>`;
    },

    portrait() {
        const c = portfolioContent;
        if (this.artLines) return `<pre class="tm-art" aria-hidden="true">${this.artLines.map((l, i) => `<span style="--i:${i}">${l}</span>`).join('')}</pre>`;
        return c.picture ? `<img src="${c.picture}" alt="" class="tm-photo" onerror="this.remove()">` : '';
    },

    // The first name in 5x5 block letters with a drop shadow, built from the name in content.js
    font: {
        A: '.###. #...# ##### #...# #...#', B: '####. #...# ####. #...# ####.', C: '.#### #.... #.... #.... .####', D: '####. #...# #...# #...# ####.',
        E: '##### #.... ####. #.... #####', F: '##### #.... ####. #.... #....', G: '.#### #.... #..## #...# .####', H: '#...# #...# ##### #...# #...#',
        I: '##### ..#.. ..#.. ..#.. #####', J: '..### ...#. ...#. #..#. .##..', K: '#...# #..#. ###.. #..#. #...#', L: '#.... #.... #.... #.... #####',
        M: '#...# ##.## #.#.# #...# #...#', N: '#...# ##..# #.#.# #..## #...#', O: '.###. #...# #...# #...# .###.', P: '####. #...# ####. #.... #....',
        Q: '.###. #...# #.#.# #..#. .##.#', R: '####. #...# ####. #..#. #...#', S: '.#### #.... .###. ....# ####.', T: '##### ..#.. ..#.. ..#.. ..#..',
        U: '#...# #...# #...# #...# .###.', V: '#...# #...# #...# .#.#. ..#..', W: '#...# #...# #.#.# ##.## #...#', X: '#...# .#.#. ..#.. .#.#. #...#',
        Y: '#...# .#.#. ..#.. ..#.. ..#..', Z: '##### ...#. ..#.. .#... #####', '-': '..... ..... .###. ..... .....', ' ': '... ... ... ... ...'
    },

    banner(word) {
        // One pixel is two characters wide, so the letters keep their shape
        const glyphs = [...word.toUpperCase()].map(ch => this.font[ch]?.split(' ')).filter(Boolean);
        const px = [0, 1, 2, 3, 4].map(r => glyphs.map(g => g[r]).join('.')).map(row => [...row].flatMap(b => [b, b]));
        const on = (r, c) => px[r]?.[c] === '#';
        const cols = px[0].length + 1;
        const rows = [0, 1, 2, 3, 4, 5].map(r => Array.from({ length: cols }, (_, c) => on(r, c) ? '█' : on(r - 1, c - 1) ? '<span class="tm-shade">░</span>' : ' ').join(''));
        return `<pre aria-label="${this.esc(word)}" style="--cols:${cols}">${rows.map((r, i) => `<span style="--i:${i}">${r}</span>`).join('')}</pre>`;
    },

    // The profile photo as a half-block portrait (how terminal image viewers draw): each character is two pixels,
    // ▀ in the top one's shade on the bottom one's, in the theme's green. A centred head-and-shoulders crop,
    // contrast-stretched and faded out at the edges. Resolves to null when the canvas can't read the image
    // (e.g. a local file:// copy); the photo is shown instead
    pixelArt(cols) {
        const src = portfolioContent.picture;
        if (!src) return Promise.resolve(null);
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => {
                try {
                    // A character is 0.6em wide and each half 0.5em tall, so 1.2 pixel rows per column keeps the aspect
                    const rows = Math.round(cols * 1.2 / 2) * 2, size = Math.min(img.naturalWidth, img.naturalHeight) * 0.64;
                    const cv = Object.assign(document.createElement('canvas'), { width: cols, height: rows });
                    const g = cv.getContext('2d', { willReadFrequently: true });
                    g.drawImage(img, (img.naturalWidth - size) / 2, img.naturalHeight * 0.17, size, size, 0, 0, cols, rows);
                    const d = g.getImageData(0, 0, cols, rows).data;
                    const lum = Array.from({ length: cols * rows }, (_, i) => 0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]);
                    const sorted = [...lum].sort((a, b) => a - b), lo = sorted[Math.floor(lum.length * 0.03)], hi = sorted[Math.floor(lum.length * 0.97)];
                    const level = (x, y) => {
                        const fade = Math.min(1, Math.max(0, (1.1 - Math.hypot(((x + 0.5) / cols - 0.5) / 0.34, ((y + 0.5) / rows - 0.47) / 0.52)) / 0.25));
                        return Math.round(Math.min(1, Math.max(0, (lum[y * cols + x] - lo) / (hi - lo))) * fade * 20) * 5;
                    };
                    resolve(Array.from({ length: rows / 2 }, (_, r) => Array.from({ length: cols }, (_, x) => `<i style="--a:${level(x, r * 2)};--b:${level(x, r * 2 + 1)}">▀</i>`).join('')));
                } catch {
                    resolve(null);
                }
            };
            img.onerror = () => resolve(null);
            img.src = src;
        });
    },

    // ---------- commands: chatCommands from content.js, plus a few shell built-ins ----------

    builtins: {
        neofetch: 'Who is behind this terminal',
        theme: 'Change the colour scheme',
        history: 'Commands you ran',
        clear: 'Clear the screen'
    },
    aliases: { ls: 'help', dir: 'help', man: 'help', whoami: 'about', cv: 'resume', cls: 'clear' },

    registry() {
        const views = {
            help: () => this.help(), about: () => this.about(), skills: () => this.skills(), experience: () => this.experience(),
            education: () => this.education(), certifications: () => this.certifications(), projects: () => this.projects(),
            reading: () => this.reading(), contact: () => this.contact(), hire: () => this.hire(), resume: () => this.resume(),
            neofetch: () => this.neofetch(), theme: arg => this.theme(arg), history: () => this.list(this.history.map(h => this.esc(h)))
        };
        const cmds = {};
        portfolioContent.chatCommands.forEach(({ command, description }) => {
            const name = command.replace(/^\//, '');
            if (views[name]) cmds[name] = { desc: description, view: views[name] };
        });
        Object.entries(this.builtins).forEach(([name, desc]) => { cmds[name] = { desc, view: views[name] }; });
        return cmds;
    },

    menu() {
        return `<p class="tm-menu"><span>Type a command, or ${this.os === 'phone' ? 'tap' : 'click'} one:</span> ${Object.keys(this.commands).filter(n => !this.builtins[n] || n === 'theme').map(n => this.chip(n)).join(' ')}</p>`;
    },

    neofetch() {
        const c = portfolioContent, s = c.stats;
        const rows = [['Role', c.title], ['Focus', c.specialization], ['Location', c.location], ['Uptime', `${s.years} years`],
            ['Companies', s.companies], ['Projects', s.projects], ['Skills', s.skills], ['Shell', this.p.shell]];
        return `
            <div class="tm-fetch">
                ${this.portrait()}
                <div class="tm-info">
                    <p><b class="tm-acc">${c.name}</b></p>
                    <p class="tm-dim" aria-hidden="true">${'-'.repeat(c.name.length)}</p>
                    <dl class="tm-kv">${rows.map(([k, v]) => `<dt class="tm-acc">${k}</dt><dd>${v}</dd>`).join('')}</dl>
                    <p class="tm-dim">${c.tagline}</p>
                    <p aria-hidden="true">${this.swatch()}</p>
                </div>
            </div>`;
    },

    // Colour schemes, like a terminal's profiles; the pick is remembered in this browser
    schemes: ['default', 'homebrew', 'dracula', 'solarized-dark', 'solarized-light'],

    theme(arg) {
        const current = this.root.dataset.scheme || 'default', pick = n => this.chip(`theme ${n}`, n);
        if (arg && !this.schemes.includes(arg)) return `<p>theme: no such colour scheme: ${this.esc(arg)}</p><p class="tm-dim">Try ${this.schemes.map(pick).join(' ')}</p>`;
        if (arg) {
            this.setScheme(arg);
            return `<p>Colour scheme set to <b>${arg}</b>.</p>`;
        }
        return `
            <dl class="tm-kv tm-schemes">${this.schemes.map(n => `<dt>${pick(n)}</dt><dd>${this.swatch(n)}${n === current ? ' <span class="tm-dim">(current)</span>' : ''}</dd>`).join('')}</dl>
            <p class="tm-dim">Type theme &lt;name&gt;, or click one.</p>`;
    },

    // A scheme's background, text and ANSI colours; the default scheme is the OS's own
    swatch(scheme) {
        const attr = !scheme ? '' : scheme === 'default' ? `data-os="${this.os}"` : `data-scheme="${scheme}"`;
        return `<span class="tm-swatch" ${attr} aria-hidden="true"><span class="tm-sample">Aa</span>${['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'].map(n => `<i style="background:var(--tm-${n})"></i>`).join('')}</span>`;
    },

    setScheme(name) {
        if (name === 'default') delete this.root.dataset.scheme; else this.root.dataset.scheme = name;
        try { localStorage.setItem('terminal-scheme', name); } catch { /* storage blocked: the pick lasts until reload */ }
    },

    savedScheme() {
        try {
            const name = localStorage.getItem('terminal-scheme');
            return name !== 'default' && this.schemes.includes(name) ? name : null;
        } catch {
            return null;
        }
    },

    help() {
        return `
            <dl class="tm-kv tm-help">${Object.entries(this.commands).map(([name, { desc }]) => `<dt>${this.chip(name)}</dt><dd>${desc}</dd>`).join('')}</dl>
            <p class="tm-dim"><kbd>Tab</kbd> completes · <kbd>↑</kbd> <kbd>↓</kbd> history · <kbd>Ctrl</kbd>+<kbd>L</kbd> clears</p>`;
    },

    about() {
        const c = portfolioContent;
        return `
            <p><b>${c.name}</b> <span class="tm-dim">· ${c.title} · ${c.location}</span></p>
            <p>${c.about.bio}</p>
            ${this.kv(c.impact.map(m => [m.value, m.label]), 'tm-acc')}
            <p><span class="tm-key">interests</span> ${c.about.interests.join(' · ')}</p>
            ${c.about.funFact ? `<p class="tm-dim">${c.about.funFact}</p>` : ''}`;
    },

    // Roles as a git log graph
    experience() {
        return `<div class="tm-log">${portfolioContent.experience.map(e => `
            <section>
                <p><b>${e.position}</b> <span class="tm-dim">@</span> <span class="tm-key">${e.company}</span></p>
                <p class="tm-dim">${e.period} · ${e.location}</p>
                ${this.list(e.achievements)}
                <p class="tm-dim">${e.technologies.join(' · ')}</p>
            </section>`).join('')}</div>`;
    },

    projects() {
        return portfolioContent.projects.map((p, i) => `
            <section>
                <p><span class="tm-dim">[${i + 1}]</span> <b>${p.title}</b></p>
                <p>${p.description}</p>
                ${this.list(p.highlights)}
                <p class="tm-key">${p.tags.join(' · ')}</p>
                ${p.site ? `<p>${this.link(`https://${p.site}`)}</p>` : ''}
            </section>`).join('');
    },

    // Skill categories overlap in content.js, so each skill is listed once, under its first category
    skills() {
        const c = portfolioContent, seen = new Set();
        return this.kv(Object.entries(c.skills)
            .map(([key, list]) => [c.skillLabels?.[key] || key, list.filter(s => !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase()))])
            .filter(([, list]) => list.length)
            .map(([label, list]) => [label, list.join(', ')]));
    },

    education() {
        return portfolioContent.education.map(e => `
            <section>
                <p><b>${e.degree}</b></p>
                <p>${e.institution}</p>
                <p class="tm-dim">${e.year} · GPA <span class="tm-acc">${e.gpa}</span></p>
            </section>`).join('');
    },

    certifications() {
        const c = portfolioContent;
        return `
            ${this.list(c.certifications.map(x => `${x.link ? this.link(x.link, x.title) : x.title} <span class="tm-dim">· ${x.issuer} · ${x.year}</span>`))}
            ${c.patents.length ? `<p><b>Patents</b></p>${this.list(c.patents.map(x => `${this.link(x.link, x.title)} <span class="tm-dim">· ${x.number} · ${x.status} ${x.year}</span>`))}` : ''}`;
    },

    reading() {
        return portfolioContent.currentlyReading.map(b => {
            const done = Math.round(b.progress / 5);
            return `
                <section>
                    <p><b>${b.title}</b> <span class="tm-dim">· ${b.author}</span></p>
                    <p aria-label="${b.progress}% read"><span aria-hidden="true">[<span class="tm-acc">${'#'.repeat(done)}</span><span class="tm-dim">${'-'.repeat(20 - done)}</span>]</span> ${b.status === 'completed' ? `finished ${b.endDate}` : `${b.progress}%`}</p>
                    <p class="tm-dim">${b.notes}</p>
                    ${b.link ? `<p>${this.link(b.link)}</p>` : ''}
                </section>`;
        }).join('');
    },

    contact() {
        return this.kv(this.links());
    },

    hire() {
        const c = portfolioContent;
        return `
            <p><b>${c.name}</b> <span class="tm-dim">· ${c.title}</span></p>
            <p>${c.tagline}</p>
            ${this.kv(c.impact.map(m => [m.value, m.label]), 'tm-acc')}
            ${this.kv(this.links())}
            <p><a href="mailto:${c.email}" class="tm-btn">Write to me</a></p>`;
    },

    resume() {
        const r = portfolioContent.resume;
        if (!r) return '<p>no such file: résumé</p>';
        return `
            <p>${r.split('/').pop()} <span class="tm-dim">· PDF</span></p>
            <p><a href="${r}" target="_blank" rel="noopener" class="tm-btn">Open</a> <a ${this.resumeAttrs()} class="tm-btn">Download</a></p>`;
    },

    // ---------- small pieces ----------

    prompt() {
        return `<span class="tm-prompt" aria-hidden="true">${this.p.prompt(this.host)}</span>`;
    },

    chip(cmd, label = cmd) {
        return `<button type="button" class="tm-run" data-run="${cmd}">${label}</button>`;
    },

    kv(rows, keyClass = 'tm-key') {
        return `<dl class="tm-kv">${rows.map(([k, v]) => `<dt class="${keyClass}">${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
    },

    list(items) {
        return `<ul class="tm-list">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
    },

    links() {
        const c = portfolioContent;
        return [['email', c.email && `mailto:${c.email}`], ['github', c.social.github], ['linkedin', c.social.linkedin], ['website', c.social.portfolio]]
            .filter(([, href]) => href).map(([label, href]) => [label, this.link(href)])
            .concat(c.resume ? [['résumé', `<a ${this.resumeAttrs()}>${c.resume.split('/').pop()}</a>`]] : []);
    },

    link(href, text = href.replace(/^(mailto:|https?:\/\/(www\.)?)/, '').replace(/\/$/, '')) {
        return `<a href="${href}" ${href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${text}</a>`;
    },

    // download is ignored on some origins (e.g. file://); a new tab keeps the portfolio open either way
    resumeAttrs() {
        const r = portfolioContent.resume;
        return `href="${r}" download="${r.split('/').pop()}" target="_blank" rel="noopener"`;
    },

    esc(s) {
        return String(s).replace(/[&<>"]/g, ch => `&#${ch.charCodeAt(0)};`);
    },

    calm() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    // Typos within two edits, or a prefix of 3+ letters
    closest(word) {
        const dist = (a, b) => {
            let prev = [...Array(b.length + 1).keys()];
            for (let i = 1; i <= a.length; i++) {
                const cur = [i];
                for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] !== b[j - 1]));
                prev = cur;
            }
            return prev[b.length];
        };
        const names = Object.keys(this.commands);
        return names.map(n => [n, dist(word, n)]).sort((a, b) => a[1] - b[1]).find(([, d]) => d <= 2)?.[0]
            || (word.length >= 3 && names.find(n => n.startsWith(word)));
    },

    // ---------- behaviour ----------

    // One prompt line (null: no prompt) and its output, appended to the log
    print(line, html = '') {
        const entry = document.createElement('div');
        entry.className = 'tm-entry';
        entry.innerHTML = (line === null ? '' : `<div class="tm-line">${this.prompt()}<span class="tm-cmd">${this.esc(line)}</span></div>`)
            + (html ? `<div class="tm-out">${html}</div>` : '');
        entry.querySelectorAll('.tm-out > *').forEach((el, i) => el.style.setProperty('--i', Math.min(i, 12)));
        this.out.append(entry);
        return entry;
    },

    run(raw) {
        const line = raw.trim(), [word, arg] = line.split(/\s+/), name = word.toLowerCase();
        this.input.value = '';
        this.sync();
        if (line && line !== this.history.at(-1)) this.history.push(line);
        this.at = this.history.length;
        const cmd = this.commands[this.aliases[name] || name];
        if (cmd === this.commands.clear) return this.clear();
        const near = !cmd && this.closest(name);
        const html = !line ? '' : cmd ? cmd.view(arg?.toLowerCase())
            : name === 'sudo' ? '<p>guest is not in the sudoers file. This incident will be reported.</p>'
            : this.p.notFound(this.esc(word), near && this.chip(near)) + (near ? '' : `<p class="tm-dim">Type ${this.chip('help')} to see what's here.</p>`);
        this.follow(this.print(line, html));
    },

    // Long answers start at their command line; short ones just keep the prompt in view
    follow(entry) {
        const top = Math.min(entry.offsetTop - 12, this.screen.scrollHeight - this.screen.clientHeight);
        this.screen.scrollTo({ top, behavior: this.calm() ? 'auto' : 'smooth' });
    },

    // Like clear in a real terminal, except the boot header stays at the top
    clear() {
        this.out.innerHTML = `<div class="tm-entry tm-static"><div class="tm-out">${this.header()}</div></div>`;
        this.screen.scrollTop = 0;
    },

    // Types a command at the prompt, a key at a time
    async type(cmd) {
        this.root.classList.add('is-typing');
        for (let i = 1; i <= cmd.length; i++) {
            this.input.value = cmd.slice(0, i);
            this.sync(i);
            await this.wait(38 + Math.random() * 30);
        }
        await this.wait(160);
        this.root.classList.remove('is-typing');
    },

    // A clicked command types itself, then runs
    async click(cmd) {
        if (this.busy) return;
        const t = this.token;
        this.busy = true;
        this.fast = this.calm();
        await this.type(cmd);
        if (t !== this.token) return;
        this.busy = this.fast = false;
        this.run(cmd);
    },

    // The visible prompt text with a block cursor (the real input sits on top, transparent)
    sync(at = this.input.selectionStart ?? this.input.value.length) {
        const v = this.input.value;
        this.echo.innerHTML = `${this.esc(v.slice(0, at))}<span class="tm-cursor">${this.esc(v[at] || ' ')}</span>${this.esc(v.slice(at + 1))}`;
    },

    complete() {
        const v = this.input.value.trimStart().toLowerCase();
        if (v.includes(' ')) return;
        const names = Object.keys(this.commands).filter(n => n.startsWith(v));
        if (!names.length) return;
        const common = names.reduce((p, n) => { while (!n.startsWith(p)) p = p.slice(0, -1); return p; });
        if (names.length === 1) this.input.value = names[0];
        else if (common.length > v.length) this.input.value = common;
        else this.follow(this.print(this.input.value, `<p>${names.map(n => this.chip(n)).join(' ')}</p>`));
        this.sync(this.input.value.length);
    },

    recall(step) {
        this.at = Math.max(0, Math.min(this.history.length, this.at + step));
        this.input.value = this.history[this.at] || '';
        this.input.setSelectionRange(this.input.value.length, this.input.value.length);
        this.sync();
    },

    bind() {
        this.screen.addEventListener('click', (e) => {
            if (this.booting) return this.skip();
            const run = e.target.closest('[data-run]');
            if (run) return this.click(run.dataset.run);
            // Clicking the screen focuses the prompt, unless it ends a text selection or hits a link (desktop only: on phones it would pop the keyboard)
            if (!e.target.closest('a, input') && !getSelection().toString() && matchMedia('(pointer: fine)').matches) this.input.focus({ preventScroll: true });
        });

        ['input', 'keyup', 'click', 'select', 'focus', 'blur'].forEach(ev => this.input.addEventListener(ev, () => this.sync()));
        this.input.addEventListener('keydown', (e) => {
            if (this.busy) return e.preventDefault();
            if (e.key === 'Enter') return this.run(this.input.value);
            if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); return this.complete(); }
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); return this.recall(e.key === 'ArrowUp' ? -1 : 1); }
            if (!e.ctrlKey || e.metaKey || e.altKey) return;
            const k = e.key.toLowerCase();
            if (k === 'l') { e.preventDefault(); return this.clear(); }
            // Ctrl+C cancels the line, unless text is selected (copy on Windows/Linux)
            if (k === 'c' && this.input.selectionStart === this.input.selectionEnd) {
                this.follow(this.print(`${this.input.value}^C`));
                this.input.value = '';
                this.sync();
            }
        });

        // macOS Terminal shows the window size in its title
        const title = document.getElementById('tmTitle');
        if (title) {
            this.sizer = new ResizeObserver(() => {
                const ch = this.echo.querySelector('.tm-cursor')?.getBoundingClientRect().width || 8.4;
                title.textContent = `guest — -zsh — ${Math.floor((this.screen.clientWidth - 40) / ch)}×${Math.floor(this.screen.clientHeight / (ch / 0.6 * 1.6))}`;
            });
            this.sizer.observe(this.screen);
        }
    },

    cleanup() {
        this.token++;
        clearTimeout(this.timer);
        this.timer = null;
        window.removeEventListener('keydown', this.onSkip);
        this.onSkip = null;
        document.getElementById('themeChooser')?.removeEventListener('close', this.onChooser);
        this.onChooser = null;
        this.sizer?.disconnect();
        this.sizer = null;
    }
};

if (typeof window !== 'undefined') {
    window.TerminalTheme = TerminalTheme;
}
