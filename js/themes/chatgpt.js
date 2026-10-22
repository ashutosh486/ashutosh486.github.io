// ChatGPT-Style Portfolio Theme - monochrome dark chat UI; every answer is built from portfolioContent
const ChatGPTTheme = {
    name: "ChatGPT Interface",
    timers: [],
    iconBtn: 'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[#b4b4b4] transition-colors hover:bg-white/5 hover:text-white md:h-9 md:w-9',

    // Icon per command key (UI only - the commands themselves come from content.js chatCommands)
    icons: {
        about: 'fa-user', skills: 'fa-code', experience: 'fa-briefcase', education: 'fa-graduation-cap',
        certifications: 'fa-certificate', projects: 'fa-rocket', reading: 'fa-book-open',
        contact: 'fa-envelope', hire: 'fa-handshake', resume: 'fa-file-arrow-down', help: 'fa-circle-question'
    },

    // Free-text questions map to a command by word prefix; first match wins, so "hire" is checked before "job"
    intents: [
        ['resume', ['resume', 'résumé', 'cv', 'download', 'pdf']],
        ['hire', ['hire', 'hiring', 'available', 'opportunit', 'recruit', 'freelance']],
        ['contact', ['contact', 'email', 'mail', 'phone', 'reach', 'connect', 'linkedin', 'github', 'call']],
        ['skills', ['skill', 'stack', 'tech', 'tool', 'language', 'framework', 'know']],
        ['projects', ['project', 'built', 'build', 'made', 'portfolio']],
        ['education', ['education', 'degree', 'college', 'university', 'study', 'studied', 'school', 'gpa']],
        ['certifications', ['cert', 'course', 'patent']],
        ['reading', ['read', 'book']],
        ['experience', ['experience', 'work', 'job', 'career', 'role', 'company', 'years']],
        ['about', ['about', 'who', 'yourself', 'bio', 'background', 'intro', 'hobb', 'interest']],
        ['help', ['help', 'command', 'what can']]
    ],

    // Suggested next questions shown under each answer
    followUps: {
        about: ['experience', 'projects'], skills: ['projects', 'experience'], experience: ['projects', 'skills'],
        projects: ['experience', 'contact'], education: ['certifications', 'experience'], certifications: ['education', 'projects'],
        reading: ['about', 'contact'], contact: ['resume', 'hire'], hire: ['resume', 'projects'], resume: ['contact', 'hire'], help: ['about', 'projects']
    },

    render() {
        const c = portfolioContent;
        this.first = c.name.split(' ')[0];
        this.commands = c.chatCommands.map(({ command, description }) => ({ key: command.slice(1), command, description }));
        this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        document.getElementById('themeContainer').innerHTML = `
            <div id="cgRoot" class="flex h-[100dvh] overflow-hidden bg-[#212121] text-[#ececec] antialiased">
                <div id="cgScrim" class="fixed inset-0 z-30 bg-black/60 opacity-0 pointer-events-none transition-opacity duration-300 md:hidden"></div>

                <!-- Sidebar: drawer on mobile; on desktop it collapses to an icon rail (.cg-label hides) -->
                <aside id="cgSidebar" class="fixed inset-y-0 left-0 z-40 flex w-[260px] shrink-0 -translate-x-full flex-col overflow-hidden bg-[#171717] transition-transform duration-300 ease-[cubic-bezier(.32,.72,0,1)] md:static md:translate-x-0" aria-label="Topics">
                    <div class="cg-side-head flex items-center gap-1 px-2 pt-2">
                        <p class="cg-label flex min-w-0 flex-1 items-center gap-2.5 px-2">
                            ${this.avatar('h-7 w-7')}
                            <span class="truncate font-semibold" translate="no">${this.first}GPT</span>
                        </p>
                        <button id="cgNewChat" class="${this.iconBtn}" aria-label="New chat" title="New chat"><i class="fas fa-pen-to-square" aria-hidden="true"></i></button>
                        <button id="cgClose" class="${this.iconBtn}" aria-label="Close sidebar" title="Collapse sidebar" aria-expanded="true">
                            <i class="fas fa-xmark md:hidden" aria-hidden="true"></i><i class="fas fa-table-columns hidden md:inline" aria-hidden="true"></i>
                        </button>
                    </div>
                    <nav class="cg-scroll mt-4 flex-1 overflow-y-auto overscroll-contain px-2">
                        <p class="cg-label px-2 pb-1.5 text-xs font-medium text-[#8e8e8e]">Topics</p>
                        ${this.commands.filter(cmd => cmd.key !== 'help').map(cmd => `
                            <button class="cg-topic group flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-left text-sm text-[#d1d1d1] transition-colors hover:bg-white/5 md:min-h-9" data-key="${cmd.key}" title="${cmd.description}">
                                <i class="fas ${this.icons[cmd.key] || 'fa-message'} w-4 shrink-0 text-center text-[#8e8e8e] transition-colors group-hover:text-[#ececec]" aria-hidden="true"></i>
                                <span class="cg-label truncate">${cmd.description}</span>
                            </button>
                        `).join('')}
                    </nav>
                    <div class="border-t border-white/5 p-2">
                        <div class="cg-profile flex items-center gap-3 px-2 py-2">
                            ${this.avatar('h-8 w-8')}
                            <div class="cg-label min-w-0">
                                <p class="truncate text-sm font-medium">${c.name}</p>
                                <p class="truncate text-xs text-[#8e8e8e]">${c.title}</p>
                            </div>
                        </div>
                        <div class="cg-links flex items-center gap-1">
                            ${[[c.social.github, 'fab fa-github', 'GitHub'], [c.social.linkedin, 'fab fa-linkedin-in', 'LinkedIn'], [`mailto:${c.email}`, 'fas fa-envelope', 'Email']]
                                .map(([href, icon, label]) => `<a href="${href}" ${href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} aria-label="${label}" title="${label}" class="${this.iconBtn}"><i class="${icon}" aria-hidden="true"></i></a>`).join('')}
                            ${c.resume ? `<a href="${c.resume}" download="${c.resume.split('/').pop()}" aria-label="Download résumé" title="Download résumé" class="${this.iconBtn}"><i class="fas fa-file-arrow-down" aria-hidden="true"></i></a>` : ''}
                        </div>
                    </div>
                </aside>

                <!-- Chat -->
                <main class="relative flex min-w-0 flex-1 flex-col">
                    <header class="flex h-14 shrink-0 items-center gap-1 px-2 md:px-4">
                        <button id="cgMenuBtn" class="${this.iconBtn} md:hidden" aria-label="Open sidebar"><i class="fas fa-bars" aria-hidden="true"></i></button>
                        <p class="px-1 text-lg font-semibold"><span translate="no">${this.first}GPT</span> <span class="hidden text-sm font-normal text-[#8e8e8e] lg:inline">· ${c.title}</span></p>
                    </header>

                    <div id="cgScroll" class="cg-scroll flex-1 overflow-y-auto overscroll-contain">
                        <div id="cgThread" class="relative mx-auto flex min-h-full max-w-4xl flex-col gap-6 px-4 pb-6 pt-2 md:px-8"></div>
                    </div>

                    <!-- Composer -->
                    <div class="mx-auto w-full max-w-4xl px-3 pb-[max(12px,env(safe-area-inset-bottom))] md:px-8">
                        <div class="relative flex items-end gap-2">
                            <div id="cgMenu" class="absolute bottom-full left-0 right-0 mb-2 hidden max-h-72 overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#2a2a2a] p-1.5 shadow-[0_1px_2px_rgba(0,0,0,.4),0_12px_32px_rgba(0,0,0,.45)]" role="listbox" aria-label="Commands"></div>
                            <form id="cgForm" class="flex flex-1 items-end gap-2 rounded-[26px] bg-[#303030] py-2 pl-5 pr-2 ring-1 ring-white/5 transition-shadow focus-within:ring-white/20">
                                <label for="cgInput" class="sr-only">Message</label>
                                <textarea id="cgInput" rows="1" placeholder="Ask anything…" autocomplete="off" class="max-h-48 flex-1 resize-none bg-transparent py-1.5 text-base leading-6 text-[#ececec] placeholder-[#8e8e8e] outline-none"></textarea>
                                <button id="cgSend" type="submit" aria-label="Send message" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white/40 transition-[background-color,color,transform] active:scale-95 md:h-9 md:w-9"><i class="fas fa-arrow-up" aria-hidden="true"></i></button>
                            </form>
                            <!-- Keeps the composer clear of the page's floating theme switcher (bottom-right) on narrower screens -->
                            <div class="cg-dock-gap" aria-hidden="true"></div>
                        </div>
                        <p class="mt-2 text-center text-xs text-[#8e8e8e]">Answers come from ${this.first}'s résumé<span class="hidden sm:inline"> · Enter to send · Type / for commands</span></p>
                    </div>
                </main>
            </div>
        `;

        this.bind();
        this.showWelcome();
    },

    bind() {
        this.root = document.getElementById('cgRoot');
        this.thread = document.getElementById('cgThread');
        this.scroller = document.getElementById('cgScroll');
        this.input = document.getElementById('cgInput');
        this.sendBtn = document.getElementById('cgSend');
        this.menu = document.getElementById('cgMenu');
        this.matches = [];
        this.menuIndex = 0;
        const desktop = window.matchMedia('(min-width: 768px)');

        // One delegated handler: anything with data-key asks that topic; data-copy copies text
        this.root.addEventListener('click', (e) => {
            const copy = e.target.closest('[data-copy]');
            if (copy) return this.copy(copy);
            const target = e.target.closest('[data-key]');
            if (target) this.send(`/${target.dataset.key}`, this.menu.contains(target));
        });
        this.root.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.toggleDrawer(false);
        });

        document.getElementById('cgForm').addEventListener('submit', (e) => {
            e.preventDefault();
            if (!this.input.value.trim()) return this.input.focus();
            this.send(this.input.value, true);
        });
        document.getElementById('cgNewChat').addEventListener('click', () => this.showWelcome());
        document.getElementById('cgMenuBtn').addEventListener('click', () => this.toggleDrawer(true));
        // Mobile: closes the drawer. Desktop: toggles between the full sidebar and the icon rail
        document.getElementById('cgClose').addEventListener('click', (e) => {
            if (!desktop.matches) return this.toggleDrawer(false);
            const collapsed = this.root.classList.toggle('cg-collapsed');
            e.currentTarget.setAttribute('aria-expanded', String(!collapsed));
            e.currentTarget.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
            e.currentTarget.title = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
        });
        document.getElementById('cgScrim').addEventListener('click', () => this.toggleDrawer(false));

        this.input.addEventListener('input', () => {
            this.input.style.height = 'auto';
            this.input.style.height = `${Math.min(this.input.scrollHeight, 192)}px`;
            this.updateSendButton();
            this.menuIndex = 0;
            this.updateMenu();
        });

        this.input.addEventListener('keydown', (e) => {
            const menuOpen = !this.menu.classList.contains('hidden');
            if (menuOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                e.preventDefault();
                const step = e.key === 'ArrowDown' ? 1 : -1;
                this.menuIndex = (this.menuIndex + step + this.matches.length) % this.matches.length;
                this.updateMenu();
            } else if (menuOpen && (e.key === 'Enter' || e.key === 'Tab')) {
                e.preventDefault();
                this.send(`/${this.matches[this.menuIndex].key}`, true);
            } else if (e.key === 'Escape') {
                this.hideMenu();
            } else if (e.key === 'Enter' && !e.shiftKey) {
                // Chat convention (as in ChatGPT): Enter sends, Shift+Enter adds a line
                e.preventDefault();
                document.getElementById('cgForm').requestSubmit();
            }
        });
    },

    // ---------- conversation ----------

    showWelcome() {
        const c = portfolioContent, s = c.stats;
        // First four topics in content.js chatCommands order
        const picks = this.commands.filter(cmd => cmd.key !== 'help').slice(0, 4);

        this.clearTimers();
        this.setActive(null);
        this.toggleDrawer(false);
        this.thread.innerHTML = `
            <div id="cgWelcome" class="m-auto w-full py-6">
                <div class="cg-block flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left" style="--i:0">
                    ${this.avatar('h-20 w-20 ring-1 ring-white/10', c.name)}
                    <div class="min-w-0">
                        <p class="text-[#b4b4b4]">${c.about.greeting}</p>
                        <h1 class="mt-1 text-3xl font-semibold tracking-tight text-white md:text-4xl">What would you like to know?</h1>
                        <p class="mt-2 max-w-2xl text-pretty text-[15px] leading-6 text-[#b4b4b4]">${c.about.shortBio}</p>
                    </div>
                </div>
                <dl class="cg-block mt-6 grid grid-cols-4 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10" style="--i:1">
                    ${[[`${s.years}+`, 'Years'], [`${s.skills}`, 'Skills'], [s.projects, 'Projects'], [s.companies, 'Companies']].map(([value, label]) => `
                        <div class="min-w-0 bg-[#212121] px-3 py-2.5 sm:px-4 sm:py-3">
                            <dt class="text-xs text-[#8e8e8e]">${label}</dt>
                            <dd class="mt-0.5 text-xl font-semibold tabular-nums text-white sm:text-2xl">${value}</dd>
                        </div>`).join('')}
                </dl>
                <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    ${picks.map((cmd, i) => `
                        <button data-key="${cmd.key}" style="--i:${i + 2}" class="cg-block flex min-h-11 items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-left text-sm transition-colors hover:border-white/20 hover:bg-white/5">
                            <i class="fas ${this.icons[cmd.key] || 'fa-message'} w-4 text-center text-[#8e8e8e]" aria-hidden="true"></i>
                            <span class="font-medium text-[#ececec]">${cmd.description}</span>
                            <span class="ml-auto font-mono text-xs text-[#8e8e8e]">${cmd.command}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    },

    send(text, fromComposer = false) {
        text = text.trim();
        if (!text) return;

        if (fromComposer || this.input.value.startsWith('/')) {
            this.input.value = '';
            this.input.style.height = 'auto';
            this.updateSendButton();
        }
        this.hideMenu();
        this.toggleDrawer(false);
        document.getElementById('cgWelcome')?.remove();

        let key = text.startsWith('/') ? text.slice(1).toLowerCase().split(/\s/)[0] : this.matchIntent(text);
        if (key === 'hireme') key = 'hire';

        const user = this.el(`<div class="cg-in flex justify-end"><div class="max-w-[85%] whitespace-pre-wrap break-words rounded-3xl bg-[#303030] px-5 py-2.5"></div></div>`);
        user.firstElementChild.textContent = text;
        const bot = this.el(`
            <div class="cg-in flex gap-3 md:gap-4">
                ${this.avatar('mt-0.5 h-8 w-8 shrink-0')}
                <div class="cg-body min-w-0 flex-1 space-y-4 text-[15px] leading-7 text-[#ececec]" aria-live="polite">
                    <div class="cg-dots pt-2" role="status" aria-label="Typing…"><span></span><span></span><span></span></div>
                </div>
            </div>
        `);
        this.thread.append(user, bot);
        const scrollToQuestion = () => this.scroller.scrollTo({ top: user.offsetTop - 12, behavior: this.reduced ? 'auto' : 'smooth' });
        scrollToQuestion();

        this.later(() => {
            const body = bot.querySelector('.cg-body');
            body.innerHTML = this.answer(key, text);
            [...body.children].forEach((block, i) => {
                block.classList.add('cg-block');
                block.style.setProperty('--i', i);
            });
            // Progress bars grow from 0 once they're on screen
            this.later(() => body.querySelectorAll('.cg-bar').forEach(bar => bar.classList.add('is-filled')), 60);
            this.setActive(key);
            // Now the answer exists there is room to bring the question to the top, like ChatGPT
            scrollToQuestion();
        }, this.reduced ? 0 : 450 + Math.random() * 350);
    },

    matchIntent(text) {
        const t = text.toLowerCase();
        const has = word => new RegExp(`\\b${word}`).test(t);
        const c = portfolioContent;
        // Names from content.js: first word of each company, and the short name in brackets of each institution
        const companies = c.experience.map(exp => exp.company.split(' ')[0].toLowerCase());
        const schools = c.education.flatMap(edu => (edu.institution.match(/\(([^)]+)\)/)?.[1] || '').toLowerCase().split(/\s+/).filter(Boolean));
        if (companies.some(has)) return 'experience';
        if (schools.some(has)) return 'education';
        const hit = this.intents.find(([, words]) => words.some(has));
        return hit ? hit[0] : null;
    },

    answer(key, text) {
        const section = key !== 'unknown' && Object.hasOwn(this.sections, key) ? this.sections[key] : null;
        if (!section) return this.sections.unknown.call(this, text);
        const next = (this.followUps[key] || [])
            .map(k => this.commands.find(cmd => cmd.key === k)).filter(Boolean);
        return section.call(this) + (next.length ? `
            <div class="flex flex-wrap gap-2 pt-1">
                ${next.map(cmd => `<button data-key="${cmd.key}" class="min-h-9 whitespace-nowrap rounded-full border border-white/10 px-3 text-xs text-[#d1d1d1] transition-colors hover:border-white/20 hover:bg-white/5"><i class="fas ${this.icons[cmd.key] || 'fa-message'} mr-1.5 text-[#8e8e8e]" aria-hidden="true"></i>${cmd.description}</button>`).join('')}
            </div>` : '');
    },

    // Each section returns top-level blocks; every block fades in one after another
    sections: {
        about() {
            const c = portfolioContent;
            return `
                <p>${c.about.bio}</p>
                <div class="flex flex-wrap gap-1.5">${c.about.interests.map(this.chip).join('')}</div>
                <p class="rounded-xl border-l-2 border-white/30 bg-white/[0.04] px-4 py-3 text-sm">${c.about.funFact}</p>
            `;
        },

        skills() {
            const c = portfolioContent, seen = new Set();
            // Categories overlap in content.js, so each skill is listed once, under its first category
            const groups = Object.entries(c.skills)
                .map(([key, list]) => [c.skillLabels?.[key] || key, list.filter(skill => !seen.has(skill.toLowerCase()) && seen.add(skill.toLowerCase()))])
                .filter(([, list]) => list.length);
            return `
                <p>${c.stats.skills} skills across ${groups.length} areas.</p>
                <dl class="divide-y divide-white/5 overflow-hidden rounded-2xl ring-1 ring-white/10">
                    ${groups.map(([label, list]) => `
                        <div class="grid gap-2 px-4 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
                            <dt class="text-xs font-medium uppercase tracking-wider text-[#8e8e8e] sm:pt-1">${label}</dt>
                            <dd class="flex flex-wrap gap-1.5">${list.map(this.chip).join('')}</dd>
                        </div>`).join('')}
                </dl>
            `;
        },

        experience() {
            const c = portfolioContent;
            const bullet = item => `<li class="flex gap-2.5"><span class="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#8e8e8e]"></span><span>${item}</span></li>`;
            return `
                <p>${c.stats.years}+ years across ${c.stats.companies} companies, most recent first.</p>
                <ol class="space-y-6 border-l border-white/10 pl-6">
                    ${c.experience.map((exp, i) => `
                        <li class="relative">
                            <span class="absolute -left-[29.5px] top-2 h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-white ring-4 ring-white/10' : 'bg-[#5d5d5d]'}"></span>
                            <div class="flex flex-wrap items-baseline justify-between gap-x-3">
                                <h3 class="font-semibold text-white">${exp.position}</h3>
                                <span class="text-xs tabular-nums text-[#8e8e8e]">${exp.period}</span>
                            </div>
                            <p class="text-sm text-[#b4b4b4]">${exp.company} · ${exp.location}</p>
                            <ul class="mt-2 space-y-1 text-sm leading-6 text-[#d1d1d1]">${exp.achievements.slice(0, 3).map(bullet).join('')}</ul>
                            ${exp.achievements.length > 3 ? `
                                <details class="group mt-1">
                                    <summary class="inline-flex min-h-9 cursor-pointer list-none items-center gap-1.5 text-xs text-[#8e8e8e] transition-colors hover:text-white">
                                        <i class="fas fa-chevron-down text-[10px] transition-transform group-open:rotate-180" aria-hidden="true"></i>
                                        <span class="group-open:hidden">Show ${exp.achievements.length - 3} more</span><span class="hidden group-open:inline">Show less</span>
                                    </summary>
                                    <ul class="space-y-1 text-sm leading-6 text-[#d1d1d1]">${exp.achievements.slice(3).map(bullet).join('')}</ul>
                                </details>` : ''}
                            <div class="mt-2 flex flex-wrap gap-1.5">${exp.technologies.map(this.chip).join('')}</div>
                        </li>`).join('')}
                </ol>
            `;
        },

        projects() {
            const c = portfolioContent;
            return `
                <p>Here are ${c.projects.length} projects I've worked on.</p>
                <div class="grid gap-3 sm:grid-cols-2">
                    ${c.projects.map(project => `
                        <article class="flex flex-col rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 transition-[background-color,box-shadow] hover:bg-white/[0.06] hover:ring-white/20">
                            <h3 class="font-semibold leading-6 text-white">${project.title}</h3>
                            ${project.site ? `<a href="https://${project.site}" target="_blank" rel="noopener" class="mt-0.5 text-xs text-[#b4b4b4] underline decoration-white/20 underline-offset-4 hover:text-white hover:decoration-white">${project.site}</a>` : ''}
                            <p class="mt-2 text-sm leading-6 text-[#b4b4b4]">${project.description}</p>
                            <ul class="mt-3 space-y-1 text-xs text-[#d1d1d1]">
                                ${project.highlights.map(item => `<li><i class="fas fa-check mr-2 text-[#8e8e8e]" aria-hidden="true"></i>${item}</li>`).join('')}
                            </ul>
                            <div class="mt-auto flex flex-wrap gap-1.5 pt-4">${project.tags.map(this.chip).join('')}</div>
                        </article>`).join('')}
                </div>
            `;
        },

        education() {
            const c = portfolioContent;
            return c.education.map(edu => `
                <div class="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10">
                    <div class="flex items-start gap-4">
                        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[#ececec]"><i class="fas fa-graduation-cap" aria-hidden="true"></i></div>
                        <div class="min-w-0">
                            <h3 class="font-semibold leading-6 text-white">${edu.degree}</h3>
                            <p class="text-sm text-[#b4b4b4]">${edu.institution}</p>
                            <p class="mt-1 text-xs tabular-nums text-[#8e8e8e]">${edu.year} · GPA ${edu.gpa} · ${edu.location}</p>
                        </div>
                    </div>
                    <ul class="mt-4 space-y-1 text-sm text-[#d1d1d1]">
                        ${edu.achievements.map(item => `<li class="flex gap-2.5"><span class="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#8e8e8e]"></span><span>${item}</span></li>`).join('')}
                    </ul>
                </div>`).join('');
        },

        certifications() {
            const c = portfolioContent;
            const row = (icon, title, meta, link, linkLabel) => `
                <a href="${link}" target="_blank" rel="noopener" class="group flex min-h-14 items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/5">
                    <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-[#b4b4b4]"><i class="fas ${icon}" aria-hidden="true"></i></span>
                    <span class="min-w-0 flex-1"><span class="block text-sm font-medium text-white">${title}</span><span class="block text-xs text-[#8e8e8e]">${meta}</span></span>
                    <span class="hidden text-xs text-[#8e8e8e] transition-colors group-hover:text-white sm:inline">${linkLabel}</span>
                    <i class="fas fa-arrow-up-right-from-square text-xs text-[#8e8e8e] group-hover:text-white" aria-hidden="true"></i>
                </a>`;
            return `
                <p>${c.certifications.length} certifications${c.patents.length ? ` & ${c.patents.length} patent${c.patents.length > 1 ? 's' : ''}` : ''}.</p>
                <div class="divide-y divide-white/5 overflow-hidden rounded-2xl ring-1 ring-white/10">
                    ${c.certifications.map(cert => row('fa-certificate', cert.title, `${cert.issuer} · ${cert.year}`, cert.link, 'Verify')).join('')}
                    ${c.patents.map(p => row('fa-lightbulb', `Patent: ${p.title}`, `${p.number} · ${p.status} · ${p.year}`, p.link, 'View')).join('')}
                </div>
            `;
        },

        reading() {
            const c = portfolioContent;
            const fmt = date => new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
            return c.currentlyReading.map(book => `
                <div class="flex gap-4 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
                    <!-- Drawn cover: the content.js cover URLs point at a placeholder service that no longer exists -->
                    <div class="flex h-24 w-16 shrink-0 items-end overflow-hidden rounded-[4px] border-l-4 border-white/20 bg-[#3a3a3a] p-1.5 shadow-[0_1px_2px_rgba(0,0,0,.5),0_6px_16px_rgba(0,0,0,.35)]" aria-hidden="true">
                        <span class="text-[9px] font-semibold leading-tight text-white/80 [hyphens:auto] [overflow-wrap:break-word]">${book.title}</span>
                    </div>
                    <div class="min-w-0 flex-1">
                        <h3 class="font-semibold leading-6 text-white">${book.title}</h3>
                        <p class="text-sm text-[#b4b4b4]">${book.author}</p>
                        <p class="mt-1 text-xs tabular-nums text-[#8e8e8e]">
                            ${book.status === 'completed' ? 'Finished' : `Reading · ${book.progress}%`} · ${fmt(book.startDate)}${book.endDate ? ` – ${fmt(book.endDate)}` : ''}
                        </p>
                        <div class="mt-2.5 h-1 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow="${book.progress}" aria-valuemin="0" aria-valuemax="100" aria-label="Progress">
                            <div class="cg-bar h-full rounded-full bg-white" style="width: ${book.progress}%"></div>
                        </div>
                        <p class="mt-2.5 text-sm text-[#b4b4b4]">${book.notes}</p>
                        ${book.link ? `<a href="${book.link}" target="_blank" rel="noopener" class="mt-1 inline-flex min-h-9 items-center text-xs text-[#b4b4b4] underline decoration-white/20 underline-offset-4 hover:text-white">Learn more</a>` : ''}
                    </div>
                </div>`).join('');
        },

        contact() {
            const c = portfolioContent;
            const row = (icon, label, value, href) => `
                <a href="${href}" ${href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} class="group flex min-h-14 min-w-0 flex-1 items-center gap-3 px-4 py-2.5">
                    <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-[#ececec]"><i class="${icon}" aria-hidden="true"></i></span>
                    <span class="min-w-0"><span class="block text-xs text-[#8e8e8e]">${label}</span><span class="block truncate text-sm font-medium text-white group-hover:underline">${value}</span></span>
                </a>`;
            return `
                <div class="divide-y divide-white/5 overflow-hidden rounded-2xl ring-1 ring-white/10">
                    <div class="flex items-center pr-2 transition-colors hover:bg-white/5">
                        ${row('fas fa-envelope', 'Email', c.email, `mailto:${c.email}`)}
                        <button data-copy="${c.email}" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[#8e8e8e] transition-colors hover:bg-white/10 hover:text-white" aria-label="Copy email address"><i class="fas fa-copy" aria-hidden="true"></i></button>
                    </div>
                    <div class="flex transition-colors hover:bg-white/5">${row('fas fa-phone', 'Phone', c.phone, `tel:${c.phone}`)}</div>
                    <div class="flex transition-colors hover:bg-white/5">${row('fab fa-linkedin-in', 'LinkedIn', c.social.linkedin.replace('https://', ''), c.social.linkedin)}</div>
                    <div class="flex transition-colors hover:bg-white/5">${row('fab fa-github', 'GitHub', c.social.github.replace('https://', ''), c.social.github)}</div>
                </div>
                <p class="text-sm text-[#b4b4b4]"><i class="fas fa-location-dot mr-2 text-[#8e8e8e]" aria-hidden="true"></i>${c.location}</p>
            `;
        },

        hire() {
            const c = portfolioContent;
            return `
                <div class="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 md:p-6">
                    <div class="flex items-center gap-4">
                        ${this.avatar('h-12 w-12 ring-1 ring-white/10', c.name)}
                        <div class="min-w-0">
                            <h3 class="text-lg font-semibold text-white">${c.name}</h3>
                            <p class="text-sm text-[#b4b4b4]">${c.title} · ${c.location}</p>
                        </div>
                    </div>
                    <p class="mt-4 text-[#d1d1d1]">${c.about.shortBio}</p>
                    <dl class="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/10 sm:grid-cols-3">
                        ${c.impact.map(item => `
                            <div class="bg-[#262626] px-4 py-3">
                                <dt class="text-xs text-[#8e8e8e]">${item.label}</dt>
                                <dd class="mt-0.5 text-xl font-semibold tabular-nums text-white">${item.value}</dd>
                            </div>`).join('')}
                    </dl>
                    <div class="mt-5 flex flex-wrap gap-2">
                        <a href="mailto:${c.email}" class="inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-white/85"><i class="fas fa-envelope mr-2" aria-hidden="true"></i>Email Me</a>
                        <a href="${c.social.linkedin}" target="_blank" rel="noopener" class="inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/5"><i class="fab fa-linkedin-in mr-2" aria-hidden="true"></i>LinkedIn</a>
                        ${c.resume ? `<a href="${c.resume}" download="${c.resume.split('/').pop()}" class="inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/5"><i class="fas fa-arrow-down mr-2" aria-hidden="true"></i>Download Résumé</a>` : ''}
                    </div>
                </div>
            `;
        },

        resume() {
            const c = portfolioContent;
            if (!c.resume) return `<p>My résumé isn't available for download yet. Try /contact instead.</p>`;
            const file = c.resume.split('/').pop();
            return `
                <p>Here's my résumé as a PDF.</p>
                <div class="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10 sm:gap-4 sm:p-4">
                    <span class="flex h-12 w-10 shrink-0 items-center justify-center rounded-md bg-white/5 text-[#ececec] ring-1 ring-white/10"><i class="fas fa-file-pdf" aria-hidden="true"></i></span>
                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium text-white">${file}</p>
                        <p class="text-xs text-[#8e8e8e]">PDF · ${c.name}</p>
                    </div>
                    <a href="${c.resume}" target="_blank" rel="noopener" class="hidden min-h-11 items-center rounded-full px-4 text-sm font-medium text-white ring-1 ring-white/20 transition-colors hover:bg-white/5 sm:inline-flex">Open</a>
                    <a href="${c.resume}" download="${file}" class="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-semibold text-black transition-colors hover:bg-white/85"><i class="fas fa-arrow-down mr-2" aria-hidden="true"></i>Download</a>
                </div>
            `;
        },

        help() {
            return `
                <p>Click a topic, type a command, or ask in your own words.</p>
                <div class="grid gap-2 sm:grid-cols-2">
                    ${this.commands.map(cmd => `
                        <button data-key="${cmd.key}" class="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-left ring-1 ring-white/10 transition-colors hover:bg-white/5">
                            <i class="fas ${this.icons[cmd.key] || 'fa-message'} w-4 text-center text-[#8e8e8e]" aria-hidden="true"></i>
                            <span class="font-mono text-sm text-white">${cmd.command}</span>
                            <span class="truncate text-sm text-[#8e8e8e]">${cmd.description}</span>
                        </button>`).join('')}
                </div>
            `;
        },

        unknown(text) {
            return `
                <p>I don't have an answer for “${this.esc(text)}” yet. Try one of these:</p>
                <div class="flex flex-wrap gap-2">
                    ${this.commands.filter(cmd => cmd.key !== 'help').map(cmd => `<button data-key="${cmd.key}" class="min-h-9 whitespace-nowrap rounded-full border border-white/10 px-3 font-mono text-xs text-[#d1d1d1] transition-colors hover:border-white/20 hover:bg-white/5">${cmd.command}</button>`).join('')}
                </div>
            `;
        }
    },

    // ---------- slash command menu ----------

    updateMenu() {
        const value = this.input.value;
        if (!value.startsWith('/') || /\s/.test(value)) return this.hideMenu();
        const query = value.slice(1).toLowerCase();
        this.matches = this.commands.filter(cmd => cmd.key.startsWith(query));
        if (!this.matches.length) return this.hideMenu();

        this.menuIndex = Math.min(this.menuIndex, this.matches.length - 1);
        this.menu.innerHTML = this.matches.map((cmd, i) => `
            <button type="button" role="option" aria-selected="${i === this.menuIndex}" data-key="${cmd.key}" class="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition-colors md:min-h-9 ${i === this.menuIndex ? 'bg-white/10' : 'hover:bg-white/5'}">
                <i class="fas ${this.icons[cmd.key] || 'fa-message'} w-4 text-center text-[#8e8e8e]" aria-hidden="true"></i>
                <span class="font-mono text-[#ececec]">${cmd.command}</span>
                <span class="truncate text-[#8e8e8e]">${cmd.description}</span>
            </button>
        `).join('');
        this.menu.classList.remove('hidden');
    },

    hideMenu() {
        this.menu.classList.add('hidden');
    },

    // ---------- helpers ----------

    updateSendButton() {
        const ready = !!this.input.value.trim();
        this.sendBtn.classList.toggle('bg-white', ready);
        this.sendBtn.classList.toggle('text-black', ready);
        this.sendBtn.classList.toggle('bg-white/15', !ready);
        this.sendBtn.classList.toggle('text-white/40', !ready);
    },

    toggleDrawer(open) {
        document.getElementById('cgSidebar').classList.toggle('-translate-x-full', !open);
        const scrim = document.getElementById('cgScrim');
        scrim.classList.toggle('opacity-0', !open);
        scrim.classList.toggle('pointer-events-none', !open);
    },

    setActive(key) {
        this.root.querySelectorAll('.cg-topic').forEach(topic => {
            const active = topic.dataset.key === key;
            topic.classList.toggle('bg-white/10', active);
            topic.classList.toggle('text-white', active);
        });
    },

    copy(button) {
        navigator.clipboard?.writeText(button.dataset.copy).then(() => {
            button.innerHTML = '<i class="fas fa-check text-white" aria-hidden="true"></i><span class="sr-only">Copied</span>';
            this.later(() => { button.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i>'; }, 1500);
        });
    },

    // Profile photo from content.js; falls back to initials. Pass alt only where the photo isn't next to the name.
    avatar(classes, alt = '') {
        const c = portfolioContent;
        if (c.picture) return `<img src="${c.picture}" alt="${alt}" width="80" height="80" class="shrink-0 rounded-full bg-[#303030] object-cover ${classes}">`;
        const initials = c.name.split(' ').map(part => part[0]).join('').slice(0, 2);
        return `<div class="flex shrink-0 items-center justify-center rounded-full bg-[#3a3a3a] text-xs font-semibold text-white ${classes}">${initials}</div>`;
    },

    chip(text) {
        return `<span class="whitespace-nowrap rounded-md bg-white/[0.06] px-2 py-0.5 text-xs text-[#d1d1d1] ring-1 ring-white/10">${text}</span>`;
    },

    el(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstElementChild;
    },

    esc(text) {
        return String(text).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
    },

    later(fn, ms) {
        this.timers.push(setTimeout(fn, ms));
    },

    clearTimers() {
        this.timers.forEach(clearTimeout);
        this.timers = [];
    },

    cleanup() {
        this.clearTimers();
    }
};

// Make it globally available
if (typeof window !== 'undefined') {
    window.ChatGPTTheme = ChatGPTTheme;
}
