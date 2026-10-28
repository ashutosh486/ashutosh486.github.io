// Terminal theme - a zsh session: type (or click) a command, every answer comes from portfolioContent
const TerminalTheme = {
    name: "Terminal",

    render() {
        const c = portfolioContent;
        this.host = c.name.split(' ')[0].toLowerCase();
        this.history = [];
        this.at = 0;
        this.commands = this.registry();

        document.getElementById('themeContainer').innerHTML = `
            <div id="tmRoot">
                <header class="tm-bar"><span class="tm-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="tm-title">guest@${this.host}: ~ — zsh</span></header>
                <div id="tmScreen" class="tm-screen">
                    <div id="tmOut" role="log" aria-live="polite" aria-label="Terminal output"></div>
                    <label class="tm-line tm-entry-line">${this.prompt()}<input id="tmInput" type="text" aria-label="Command" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go"></label>
                </div>
            </div>`;
        this.screen = document.getElementById('tmScreen');
        this.out = document.getElementById('tmOut');
        this.input = document.getElementById('tmInput');
        this.bind();

        // Login: neofetch, then the menu
        this.print('neofetch', this.commands.neofetch.view());
        this.print(null, `<p>Type a command, or click one: ${Object.keys(this.commands).filter(n => !this.builtins[n]).map(n => this.chip(n)).join(' ')}</p>`);
    },

    // ---------- commands: chatCommands from content.js, plus a few shell built-ins ----------

    builtins: {
        neofetch: 'Who is behind this terminal',
        history: 'Commands you ran',
        clear: 'Clear the screen'
    },
    aliases: { ls: 'help', man: 'help', whoami: 'about', cv: 'resume', cls: 'clear' },

    registry() {
        const views = {
            help: () => this.help(), about: () => this.about(), skills: () => this.skills(), experience: () => this.experience(),
            education: () => this.education(), certifications: () => this.certifications(), projects: () => this.projects(),
            reading: () => this.reading(), contact: () => this.contact(), hire: () => this.hire(), resume: () => this.resume(),
            neofetch: () => this.neofetch(), history: () => this.list(this.history)
        };
        const cmds = {};
        portfolioContent.chatCommands.forEach(({ command, description }) => {
            const name = command.replace(/^\//, '');
            if (views[name]) cmds[name] = { desc: description, view: views[name] };
        });
        Object.entries(this.builtins).forEach(([name, desc]) => { cmds[name] = { desc, view: views[name] }; });
        return cmds;
    },

    neofetch() {
        const c = portfolioContent, s = c.stats;
        const rows = [['Title', c.title], ['Focus', c.specialization], ['Location', c.location], ['Uptime', `${s.years} years`],
            ['Companies', s.companies], ['Projects', s.projects], ['Skills', s.skills]];
        return `
            <div class="tm-fetch">
                ${c.picture ? `<img src="${c.picture}" alt="" class="tm-photo" onerror="this.remove()">` : ''}
                <div>
                    <p><b class="tm-acc">${c.name}</b></p>
                    <p class="tm-dim" aria-hidden="true">${'-'.repeat(c.name.length)}</p>
                    ${this.kv(rows)}
                    <p class="tm-dim">${c.tagline}</p>
                </div>
            </div>`;
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
            <p><span class="tm-dim">interests</span> ${c.about.interests.join(' · ')}</p>
            ${c.about.funFact ? `<p class="tm-dim">${c.about.funFact}</p>` : ''}`;
    },

    // Roles as a git log graph
    experience() {
        return `<div class="tm-log">${portfolioContent.experience.map(e => `
            <section>
                <p><b>${e.position}</b> <span class="tm-dim">@</span> ${e.company}</p>
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
                <p class="tm-dim">${p.tags.join(' · ')}</p>
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
                <p class="tm-dim">${e.year} · GPA ${e.gpa}</p>
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
        if (!r) return '<p>zsh: no such file: résumé</p>';
        return `
            <p>${r.split('/').pop()} <span class="tm-dim">· PDF</span></p>
            <p><a href="${r}" target="_blank" rel="noopener" class="tm-btn">Open</a> <a ${this.resumeAttrs()} class="tm-btn">Download</a></p>`;
    },

    // ---------- small pieces ----------

    prompt() {
        return `<span class="tm-prompt" aria-hidden="true"><span class="tm-acc">guest@${this.host}</span> <b>~</b> <span class="tm-dim">%</span></span>`;
    },

    chip(name) {
        return `<button type="button" class="tm-run" data-run="${name}">${name}</button>`;
    },

    kv(rows, keyClass = 'tm-dim') {
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
        const line = raw.trim(), word = line.split(/\s+/)[0], name = word.toLowerCase();
        this.input.value = '';
        if (line && line !== this.history.at(-1)) this.history.push(line);
        this.at = this.history.length;
        const cmd = this.commands[this.aliases[name] || name];
        if (cmd === this.commands.clear) return this.clear();
        const html = !line ? '' : cmd ? cmd.view()
            : name === 'sudo' ? '<p>guest is not in the sudoers file. This incident will be reported.</p>'
            : `<p>zsh: command not found: ${this.esc(word)}</p><p class="tm-dim">${(near => near ? `Did you mean ${this.chip(near)}?` : `Type ${this.chip('help')} to see what's here.`)(this.closest(name))}</p>`;
        this.follow(this.print(line, html));
    },

    // Long answers start at their command line; short ones just keep the prompt in view
    follow(entry) {
        const top = Math.min(entry.offsetTop - 12, this.screen.scrollHeight - this.screen.clientHeight);
        this.screen.scrollTo({ top, behavior: this.calm() ? 'auto' : 'smooth' });
    },

    clear() {
        this.out.innerHTML = '';
        this.screen.scrollTop = 0;
    },

    // A clicked command types itself at the prompt, then runs
    type(cmd) {
        clearTimeout(this.timer);
        if (this.calm()) return this.run(cmd);
        let i = 0;
        const step = () => {
            this.input.value = cmd.slice(0, ++i);
            this.timer = setTimeout(i < cmd.length ? step : () => this.run(cmd), i < cmd.length ? 35 : 140);
        };
        step();
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
    },

    recall(step) {
        this.at = Math.max(0, Math.min(this.history.length, this.at + step));
        this.input.value = this.history[this.at] || '';
        requestAnimationFrame(() => this.input.setSelectionRange(this.input.value.length, this.input.value.length));
    },

    bind() {
        this.screen.addEventListener('click', (e) => {
            const run = e.target.closest('[data-run]');
            if (run) return this.type(run.dataset.run);
            // Clicking the screen focuses the prompt, unless it ends a text selection or hits a link (desktop only: on phones it would pop the keyboard)
            if (!e.target.closest('a, input') && !getSelection().toString() && matchMedia('(pointer: fine)').matches) this.input.focus({ preventScroll: true });
        });

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') return this.run(this.input.value);
            if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); return this.complete(); }
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); return this.recall(e.key === 'ArrowUp' ? -1 : 1); }
            if (!e.ctrlKey || e.metaKey || e.altKey) return;
            const k = e.key.toLowerCase();
            if (k === 'l') { e.preventDefault(); return this.clear(); }
            // Ctrl+C cancels the line, unless text is selected (copy on Windows/Linux)
            if (k === 'c' && this.input.selectionStart === this.input.selectionEnd) {
                clearTimeout(this.timer);
                this.follow(this.print(`${this.input.value}^C`));
                this.input.value = '';
            }
        });
    },

    cleanup() {
        clearTimeout(this.timer);
        this.timer = null;
    }
};

if (typeof window !== 'undefined') {
    window.TerminalTheme = TerminalTheme;
}
