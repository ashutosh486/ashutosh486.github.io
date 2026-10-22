// ChatGPT-Style Portfolio Theme - dark chat UI; every answer is built from portfolioContent
const ChatGPTTheme = {
    name: "ChatGPT Interface",
    timers: [],

    // Icon per command key (UI only - the commands themselves come from content.js chatCommands)
    icons: {
        about: 'fa-user', skills: 'fa-code', experience: 'fa-briefcase', education: 'fa-graduation-cap',
        certifications: 'fa-certificate', projects: 'fa-rocket', reading: 'fa-book-open',
        contact: 'fa-envelope', hire: 'fa-handshake', help: 'fa-circle-question'
    },

    // Free-text questions map to a command by word prefix; first match wins, so "hire" is checked before "job"
    intents: [
        ['hire', ['hire', 'hiring', 'available', 'opportunit', 'recruit', 'freelance']],
        ['contact', ['contact', 'email', 'mail', 'phone', 'reach', 'connect', 'linkedin', 'github', 'call']],
        ['skills', ['skill', 'stack', 'tech', 'tool', 'language', 'framework', 'know']],
        ['projects', ['project', 'built', 'build', 'made', 'portfolio']],
        ['education', ['education', 'degree', 'college', 'university', 'study', 'studied', 'school', 'nit', 'gpa']],
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
        reading: ['about', 'contact'], contact: ['hire'], hire: ['projects', 'contact'], help: ['about', 'projects']
    },

    render() {
        const c = portfolioContent;
        this.first = c.name.split(' ')[0];
        this.commands = c.chatCommands.map(({ command, description }) => ({ key: command.slice(1), command, description }));
        this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        document.getElementById('themeContainer').innerHTML = `
            <div id="cgRoot" class="flex h-[100dvh] overflow-hidden bg-[#212121] text-[#ececec] antialiased">
                <div id="cgScrim" class="fixed inset-0 z-30 bg-black/60 opacity-0 pointer-events-none transition-opacity duration-300 md:hidden"></div>

                <!-- Sidebar (drawer on mobile) -->
                <aside id="cgSidebar" class="fixed inset-y-0 left-0 z-40 flex w-[280px] shrink-0 -translate-x-full flex-col bg-[#171717] transition-transform duration-300 ease-[cubic-bezier(.32,.72,0,1)] md:static md:translate-x-0" aria-label="Topics">
                    <div class="flex items-center gap-1 px-3 pt-3">
                        <button id="cgNewChat" class="flex flex-1 items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/5">
                            ${this.avatar('h-8 w-8 text-xs')}
                            <span class="font-semibold">${this.first}GPT</span>
                            <i class="fas fa-pen-to-square ml-auto text-sm text-[#b4b4b4]" title="New chat"></i>
                        </button>
                        <button id="cgClose" class="h-9 w-9 rounded-lg text-[#b4b4b4] hover:bg-white/5 md:hidden" aria-label="Close sidebar"><i class="fas fa-xmark"></i></button>
                    </div>
                    <nav class="cg-scroll mt-5 flex-1 overflow-y-auto px-3">
                        <p class="px-2 pb-2 text-xs font-medium text-[#8e8e8e]">Topics</p>
                        ${this.commands.filter(cmd => cmd.key !== 'help').map(cmd => `
                            <button class="cg-topic group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-[#d1d1d1] transition-colors hover:bg-white/5" data-key="${cmd.key}">
                                <i class="fas ${this.icons[cmd.key] || 'fa-message'} w-4 text-center text-[#8e8e8e] transition-colors group-hover:text-[#ececec]"></i>
                                <span class="truncate">${cmd.description}</span>
                            </button>
                        `).join('')}
                    </nav>
                    <!-- Bottom padding keeps the profile clear of the global theme button -->
                    <div class="border-t border-white/5 p-3 pb-24">
                        <div class="flex items-center gap-3 rounded-xl px-2 py-2">
                            ${this.avatar('h-9 w-9 text-xs')}
                            <div class="min-w-0">
                                <p class="truncate text-sm font-medium">${c.name}</p>
                                <p class="truncate text-xs text-[#8e8e8e]">${c.title}</p>
                            </div>
                        </div>
                        <div class="mt-1 flex gap-1 px-1">
                            ${[[c.social.github, 'fab fa-github', 'GitHub'], [c.social.linkedin, 'fab fa-linkedin-in', 'LinkedIn'], [`mailto:${c.email}`, 'fas fa-envelope', 'Email']]
                                .map(([href, icon, label]) => `<a href="${href}" target="_blank" rel="noopener" aria-label="${label}" title="${label}" class="flex h-9 w-9 items-center justify-center rounded-lg text-[#b4b4b4] transition-colors hover:bg-white/5 hover:text-white"><i class="${icon}"></i></a>`).join('')}
                        </div>
                    </div>
                </aside>

                <!-- Chat -->
                <main class="relative flex min-w-0 flex-1 flex-col">
                    <header class="flex h-14 shrink-0 items-center gap-2 px-3 md:px-5">
                        <button id="cgMenuBtn" class="h-10 w-10 rounded-lg text-[#b4b4b4] hover:bg-white/5 md:hidden" aria-label="Open sidebar"><i class="fas fa-bars"></i></button>
                        <p class="text-lg font-semibold">${this.first}GPT <span class="hidden text-sm font-normal text-[#8e8e8e] sm:inline">· ${c.title}</span></p>
                        <p class="ml-auto flex items-center gap-2 text-xs text-[#b4b4b4]"><span class="cg-online"></span><span class="hidden sm:inline">Online</span></p>
                    </header>

                    <div id="cgScroll" class="cg-scroll flex-1 overflow-y-auto">
                        <div id="cgThread" class="relative mx-auto flex min-h-full max-w-3xl flex-col gap-8 px-4 pb-10 pt-4 md:px-6"></div>
                    </div>

                    <!-- Composer; extra bottom padding on mobile keeps it above the global theme button -->
                    <div class="mx-auto w-full max-w-3xl px-3 pb-[88px] md:px-6 md:pb-4">
                        <div class="relative">
                            <div class="pointer-events-none absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-[#212121]"></div>
                            <div id="cgMenu" class="absolute bottom-full left-0 right-0 mb-2 hidden max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-[#2a2a2a] p-1.5 shadow-2xl" role="listbox"></div>
                            <form id="cgForm" class="flex items-end gap-2 rounded-[28px] bg-[#303030] py-2 pl-5 pr-2 ring-1 ring-white/5 transition-shadow focus-within:ring-white/15">
                                <textarea id="cgInput" rows="1" placeholder="Ask anything, or type /" aria-label="Message" class="max-h-48 flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-6 text-[#ececec] placeholder-[#8e8e8e] outline-none"></textarea>
                                <button id="cgSend" type="submit" disabled aria-label="Send" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition-all hover:scale-105 disabled:scale-100 disabled:bg-white/15 disabled:text-white/40"><i class="fas fa-arrow-up"></i></button>
                            </form>
                        </div>
                        <p class="mt-2 text-center text-xs text-[#8e8e8e]">Answers come straight from ${this.first}'s résumé<span class="hidden sm:inline"> · Enter to send, / for commands</span></p>
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

        // One delegated handler: anything with data-key asks that topic; data-copy copies text
        this.root.addEventListener('click', (e) => {
            const copy = e.target.closest('[data-copy]');
            if (copy) return this.copy(copy);
            const target = e.target.closest('[data-key]');
            if (target) this.send(`/${target.dataset.key}`, this.menu.contains(target));
        });

        document.getElementById('cgForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.send(this.input.value, true);
        });
        document.getElementById('cgNewChat').addEventListener('click', () => this.showWelcome());
        document.getElementById('cgMenuBtn').addEventListener('click', () => this.toggleDrawer(true));
        document.getElementById('cgClose').addEventListener('click', () => this.toggleDrawer(false));
        document.getElementById('cgScrim').addEventListener('click', () => this.toggleDrawer(false));

        this.input.addEventListener('input', () => {
            this.input.style.height = 'auto';
            this.input.style.height = `${Math.min(this.input.scrollHeight, 192)}px`;
            this.sendBtn.disabled = !this.input.value.trim();
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
                e.preventDefault();
                this.send(this.input.value, true);
            }
        });
    },

    // ---------- conversation ----------

    showWelcome() {
        const c = portfolioContent;
        const picks = ['about', 'experience', 'projects', 'skills']
            .map(key => this.commands.find(cmd => cmd.key === key)).filter(Boolean);

        this.clearTimers();
        this.setActive(null);
        this.toggleDrawer(false);
        this.thread.innerHTML = `
            <div id="cgWelcome" class="m-auto flex w-full flex-col items-center py-8 text-center">
                <div class="cg-block" style="--i:0">${this.avatar('cg-glow h-16 w-16 text-xl')}</div>
                <p class="cg-block mt-6 text-[#b4b4b4]" style="--i:1">${c.about.greeting}</p>
                <h1 class="cg-block mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl" style="--i:2">What would you like to know?</h1>
                <p class="cg-block mt-3 max-w-lg text-[15px] leading-7 text-[#b4b4b4]" style="--i:3">${c.about.shortBio}</p>
                <div class="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                    ${picks.map((cmd, i) => `
                        <button data-key="${cmd.key}" style="--i:${i + 4}" class="cg-block ${i > 1 ? 'hidden sm:flex' : 'flex'} items-start gap-3 rounded-2xl border border-white/10 px-4 py-3 text-left text-sm transition-colors hover:border-white/20 hover:bg-white/5">
                            <i class="fas ${this.icons[cmd.key]} mt-0.5 w-4 text-center text-[#10a37f]"></i>
                            <span><span class="block font-medium text-[#ececec]">${cmd.description}</span><span class="block font-mono text-xs text-[#8e8e8e]">${cmd.command}</span></span>
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
            this.sendBtn.disabled = true;
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
                ${this.avatar('mt-0.5 h-8 w-8 shrink-0 text-xs')}
                <div class="cg-body min-w-0 flex-1 space-y-4 text-[15px] leading-7 text-[#ececec]">
                    <div class="cg-dots pt-2" aria-label="Typing"><span></span><span></span><span></span></div>
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
            this.later(() => body.querySelectorAll('[data-width]').forEach(bar => { bar.style.width = bar.dataset.width; }), 60);
            this.setActive(key);
            // Now the answer exists there is room to bring the question to the top, like ChatGPT
            scrollToQuestion();
        }, this.reduced ? 0 : 450 + Math.random() * 350);
    },

    matchIntent(text) {
        const t = text.toLowerCase();
        const has = word => new RegExp(`\\b${word}`).test(t);
        const companies = portfolioContent.experience.map(exp => exp.company.split(' ')[0].toLowerCase());
        if (companies.some(has)) return 'experience';
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
                ${next.map(cmd => `<button data-key="${cmd.key}" class="rounded-full border border-white/10 px-3 py-1.5 text-xs text-[#d1d1d1] transition-colors hover:border-white/20 hover:bg-white/5"><i class="fas ${this.icons[cmd.key] || 'fa-message'} mr-1.5 text-[#8e8e8e]"></i>${cmd.description}</button>`).join('')}
            </div>` : '');
    },

    // Each section returns top-level blocks; every block fades in one after another
    sections: {
        about() {
            const c = portfolioContent, s = c.stats;
            return `
                <p>${c.about.bio}</p>
                <div class="grid grid-cols-3 gap-2 sm:gap-3">
                    ${[[`${s.years}+`, 'Years'], [`${s.skills}+`, 'Skills'], [s.projects, 'Projects']].map(([value, label]) => `
                        <div class="rounded-2xl bg-white/[0.04] px-3 py-4 text-center ring-1 ring-white/10">
                            <p class="text-2xl font-semibold text-white">${value}</p>
                            <p class="mt-0.5 text-xs text-[#8e8e8e]">${label}</p>
                        </div>`).join('')}
                </div>
                <div class="flex flex-wrap gap-2">${c.about.interests.map(this.chip).join('')}</div>
                <p class="rounded-2xl border-l-2 border-[#10a37f] bg-[#10a37f]/10 px-4 py-3 text-sm">${c.about.funFact}</p>
            `;
        },

        skills() {
            const c = portfolioContent;
            // Curated categories - content.js has overlapping lists (ml/aiml, database/databases)
            const groups = [['backend', 'Backend'], ['frontend', 'Frontend'], ['database', 'Databases'], ['cloud', 'Cloud'], ['aiml', 'AI / ML'], ['mlops', 'MLOps'], ['tools', 'Tools']]
                .filter(([key]) => c.skills[key]);
            return `
                <p>Here's my toolkit: ${c.stats.skills} distinct skills across ${groups.length} areas.</p>
                ${groups.map(([key, label]) => `
                    <div>
                        <p class="mb-2 text-xs font-medium uppercase tracking-wider text-[#8e8e8e]">${label}</p>
                        <div class="flex flex-wrap gap-2">${c.skills[key].map(this.chip).join('')}</div>
                    </div>`).join('')}
            `;
        },

        experience() {
            const c = portfolioContent;
            return `
                <p>${c.stats.years}+ years across ${c.stats.companies} companies, most recent first.</p>
                <ol class="space-y-7 border-l border-white/10 pl-6">
                    ${c.experience.map((exp, i) => `
                        <li class="relative">
                            <span class="absolute -left-[29.5px] top-2 h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-[#10a37f] ring-4 ring-[#10a37f]/20' : 'bg-[#5d5d5d]'}"></span>
                            <div class="flex flex-wrap items-baseline justify-between gap-x-3">
                                <h3 class="font-semibold text-white">${exp.position}</h3>
                                <span class="text-xs text-[#8e8e8e]">${exp.period}</span>
                            </div>
                            <p class="text-sm text-[#b4b4b4]">${exp.company} · ${exp.location}</p>
                            <ul class="mt-2 space-y-1.5 text-sm leading-6 text-[#d1d1d1]">
                                ${exp.achievements.map(item => `<li class="flex gap-2.5"><span class="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#8e8e8e]"></span><span>${item}</span></li>`).join('')}
                            </ul>
                            <div class="mt-3 flex flex-wrap gap-1.5">${exp.technologies.map(this.chip).join('')}</div>
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
                        <article class="flex flex-col rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-white/[0.06] hover:ring-white/20">
                            <h3 class="font-semibold leading-6 text-white">${project.title}</h3>
                            ${project.site ? `<a href="https://${project.site}" target="_blank" rel="noopener" class="mt-1 text-xs text-[#10a37f] hover:underline"><i class="fas fa-arrow-up-right-from-square mr-1"></i>${project.site}</a>` : ''}
                            <p class="mt-2 text-sm leading-6 text-[#b4b4b4]">${project.description}</p>
                            <ul class="mt-3 space-y-1 text-xs text-[#d1d1d1]">
                                ${project.highlights.map(item => `<li><i class="fas fa-check mr-2 text-[#10a37f]"></i>${item}</li>`).join('')}
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
                        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#10a37f]/15 text-[#10a37f]"><i class="fas fa-graduation-cap"></i></div>
                        <div class="min-w-0">
                            <h3 class="font-semibold leading-6 text-white">${edu.degree}</h3>
                            <p class="text-sm text-[#b4b4b4]">${edu.institution}</p>
                            <p class="mt-1 text-xs text-[#8e8e8e]">${edu.year} · GPA ${edu.gpa} · ${edu.location}</p>
                        </div>
                    </div>
                    <ul class="mt-4 space-y-1.5 text-sm text-[#d1d1d1]">
                        ${edu.achievements.map(item => `<li class="flex gap-2.5"><span class="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#8e8e8e]"></span><span>${item}</span></li>`).join('')}
                    </ul>
                </div>`).join('');
        },

        certifications() {
            const c = portfolioContent;
            const row = (icon, title, meta, link, linkLabel) => `
                <a href="${link}" target="_blank" rel="noopener" class="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/5">
                    <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-[#10a37f]"><i class="fas ${icon}"></i></span>
                    <span class="min-w-0 flex-1"><span class="block text-sm font-medium text-white">${title}</span><span class="block text-xs text-[#8e8e8e]">${meta}</span></span>
                    <span class="hidden text-xs text-[#8e8e8e] transition-colors group-hover:text-white sm:inline">${linkLabel}</span>
                    <i class="fas fa-arrow-up-right-from-square text-xs text-[#8e8e8e] group-hover:text-white"></i>
                </a>`;
            return `
                <p>${c.certifications.length} certifications${c.patents.length ? ` and ${c.patents.length} patent${c.patents.length > 1 ? 's' : ''}` : ''}.</p>
                <div class="divide-y divide-white/5 overflow-hidden rounded-2xl ring-1 ring-white/10">
                    ${c.certifications.map(cert => row('fa-certificate', cert.title, `${cert.issuer} · ${cert.year}`, cert.link, 'Verify')).join('')}
                </div>
                ${c.patents.length ? `
                    <div class="divide-y divide-white/5 overflow-hidden rounded-2xl ring-1 ring-white/10">
                        ${c.patents.map(p => row('fa-lightbulb', `Patent: ${p.title}`, `${p.number} · ${p.status} · ${p.year}`, p.link, 'View')).join('')}
                    </div>` : ''}
            `;
        },

        reading() {
            const c = portfolioContent;
            const fmt = date => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            const covers = ['from-[#10a37f] to-[#0b5e4a]', 'from-[#6d5dfc] to-[#3b2f9e]', 'from-[#f59e0b] to-[#b45309]'];
            return c.currentlyReading.map((book, i) => `
                <div class="flex gap-4 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
                    <!-- Drawn cover: the content.js cover URLs point at a placeholder service that no longer exists -->
                    <div class="flex h-28 w-20 shrink-0 items-end rounded-md bg-gradient-to-br ${covers[i % covers.length]} p-2 shadow-lg shadow-black/40 ring-1 ring-white/10">
                        <span class="text-[10px] font-semibold leading-tight text-white/90">${book.title}</span>
                    </div>
                    <div class="min-w-0 flex-1">
                        <h3 class="font-semibold leading-6 text-white">${book.title}</h3>
                        <p class="text-sm text-[#b4b4b4]">${book.author}</p>
                        <p class="mt-1 text-xs text-[#8e8e8e]">
                            ${book.status === 'completed' ? '<i class="fas fa-check mr-1 text-[#10a37f]"></i>Finished' : '<i class="fas fa-book-open mr-1 text-[#10a37f]"></i>Reading'}
                            · ${fmt(book.startDate)}${book.endDate ? ` – ${fmt(book.endDate)}` : ''}
                        </p>
                        <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div class="cg-bar h-full w-0 rounded-full bg-[#10a37f]" data-width="${book.progress}%"></div>
                        </div>
                        <p class="mt-3 text-sm italic text-[#b4b4b4]">${book.notes}</p>
                        ${book.link ? `<a href="${book.link}" target="_blank" rel="noopener" class="mt-2 inline-block text-xs text-[#10a37f] hover:underline">Learn more <i class="fas fa-arrow-up-right-from-square ml-1"></i></a>` : ''}
                    </div>
                </div>`).join('');
        },

        contact() {
            const c = portfolioContent;
            const row = (icon, label, value, href) => `
                <a href="${href}" ${href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} class="group flex min-w-0 flex-1 items-center gap-3 px-4 py-3">
                    <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-[#ececec]"><i class="${icon}"></i></span>
                    <span class="min-w-0"><span class="block text-xs text-[#8e8e8e]">${label}</span><span class="block truncate text-sm font-medium text-white group-hover:underline">${value}</span></span>
                </a>`;
            return `
                <p>Here's where to find me:</p>
                <div class="divide-y divide-white/5 overflow-hidden rounded-2xl ring-1 ring-white/10">
                    <div class="flex items-center pr-3 transition-colors hover:bg-white/5">
                        ${row('fas fa-envelope', 'Email', c.email, `mailto:${c.email}`)}
                        <button data-copy="${c.email}" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#8e8e8e] transition-colors hover:bg-white/10 hover:text-white" aria-label="Copy email" title="Copy email"><i class="fas fa-copy"></i></button>
                    </div>
                    <div class="flex transition-colors hover:bg-white/5">${row('fas fa-phone', 'Phone', c.phone, `tel:${c.phone}`)}</div>
                    <div class="flex transition-colors hover:bg-white/5">${row('fab fa-linkedin-in', 'LinkedIn', c.social.linkedin.replace('https://', ''), c.social.linkedin)}</div>
                    <div class="flex transition-colors hover:bg-white/5">${row('fab fa-github', 'GitHub', c.social.github.replace('https://', ''), c.social.github)}</div>
                </div>
                <p class="text-sm text-[#b4b4b4]"><i class="fas fa-location-dot mr-2 text-[#8e8e8e]"></i>${c.location}</p>
            `;
        },

        hire() {
            const c = portfolioContent;
            return `
                <div class="overflow-hidden rounded-3xl bg-gradient-to-br from-[#10a37f]/25 via-white/[0.03] to-transparent p-6 ring-1 ring-white/10">
                    <h3 class="text-xl font-semibold text-white">Let's build something together</h3>
                    <p class="mt-2 text-[#d1d1d1]">${c.about.shortBio}</p>
                    <div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        ${c.impact.map(item => `
                            <div class="rounded-2xl bg-black/20 px-4 py-3 ring-1 ring-white/10">
                                <p class="text-xl font-semibold text-white">${item.value}</p>
                                <p class="text-xs text-[#b4b4b4]">${item.label}</p>
                            </div>`).join('')}
                    </div>
                    <p class="mt-5 flex flex-wrap gap-2">${[c.title, c.location, `${c.stats.years}+ years`].map(this.chip).join('')}</p>
                    <div class="mt-6 flex flex-wrap gap-3">
                        <a href="mailto:${c.email}" class="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"><i class="fas fa-envelope mr-2"></i>Email me</a>
                        <a href="${c.social.linkedin}" target="_blank" rel="noopener" class="rounded-full px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/5"><i class="fab fa-linkedin-in mr-2"></i>LinkedIn</a>
                    </div>
                </div>
            `;
        },

        help() {
            return `
                <p>Here's everything you can ask. Click one, type it, or just ask in your own words.</p>
                <div class="grid gap-2 sm:grid-cols-2">
                    ${this.commands.map(cmd => `
                        <button data-key="${cmd.key}" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left ring-1 ring-white/10 transition-colors hover:bg-white/5">
                            <i class="fas ${this.icons[cmd.key] || 'fa-message'} w-4 text-center text-[#10a37f]"></i>
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
                    ${this.commands.filter(cmd => cmd.key !== 'help').map(cmd => `<button data-key="${cmd.key}" class="rounded-full border border-white/10 px-3 py-1.5 font-mono text-xs text-[#d1d1d1] transition-colors hover:border-white/20 hover:bg-white/5">${cmd.command}</button>`).join('')}
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
            <button type="button" role="option" aria-selected="${i === this.menuIndex}" data-key="${cmd.key}" class="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${i === this.menuIndex ? 'bg-white/10' : 'hover:bg-white/5'}">
                <i class="fas ${this.icons[cmd.key] || 'fa-message'} w-4 text-center text-[#8e8e8e]"></i>
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
            button.innerHTML = '<i class="fas fa-check text-[#10a37f]"></i>';
            this.later(() => { button.innerHTML = '<i class="fas fa-copy"></i>'; }, 1500);
        });
    },

    avatar(classes) {
        const initials = portfolioContent.name.split(' ').map(part => part[0]).join('').slice(0, 2);
        return `<div class="flex items-center justify-center rounded-full bg-gradient-to-br from-[#10a37f] to-[#0b6b54] font-semibold text-white ${classes}">${initials}</div>`;
    },

    chip(text) {
        return `<span class="rounded-full bg-white/5 px-2.5 py-1 text-xs text-[#d1d1d1] ring-1 ring-white/10">${text}</span>`;
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
