// Model Card theme - my career as a Hugging Face-style model card; every fact comes from portfolioContent
const ModelCardTheme = {
    name: "Model Card Resume",
    timers: [],
    chip: 'mc-mono inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[12.5px] text-gray-700',
    btn: 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors md:min-h-10',

    render() {
        const c = portfolioContent;
        const user = c.social.github.split('/').filter(Boolean).pop();
        const model = c.name.replace(/\s+/g, '-');
        this.resumeAttrs = c.resume ? `href="${c.resume}" download="${c.resume.split('/').pop()}" target="_blank" rel="noopener"` : '';

        document.getElementById('themeContainer').innerHTML = `
            <div id="mcRoot" class="min-h-screen bg-white text-gray-900 antialiased">
                <header class="border-b border-gray-200 bg-gray-50/60">
                    <div class="mx-auto max-w-[1280px] px-4 pt-6 md:px-8 md:pt-8">
                        <h1 class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-lg md:text-xl">
                            ${this.avatar('h-7 w-7 text-xs')}
                            <span class="text-gray-500">${user}</span><span class="text-gray-300" aria-hidden="true">/</span>
                            <span class="min-w-0 break-all font-semibold">${model}</span>
                        </h1>
                        <ul class="mt-4 flex flex-wrap gap-1.5 text-sm" aria-label="Tags">
                            ${this.tag('fa-bolt', c.specialization)}
                            ${c.about.interests.filter(i => i !== c.specialization).map(i => this.tag('', i)).join('')}
                            ${this.tag('fa-location-dot', c.location)}
                            ${this.tag('fa-clock', `${c.stats.years} years in production`)}
                        </ul>
                        <nav class="mt-5 flex gap-1 text-sm" aria-label="Model card sections">
                            <span class="flex min-h-11 items-center gap-2 border-b-2 border-gray-900 px-3 font-medium" aria-current="page"><i class="fas fa-file-lines text-gray-500" aria-hidden="true"></i>Model card</span>
                            ${c.resume ? `<a ${this.resumeAttrs} class="flex min-h-11 items-center gap-2 border-b-2 border-transparent px-3 text-gray-500 transition-colors hover:text-gray-900"><i class="fas fa-file-pdf" aria-hidden="true"></i>Résumé</a>` : ''}
                        </nav>
                    </div>
                </header>

                <div class="mx-auto grid max-w-[1280px] gap-x-12 px-4 pb-28 md:px-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <article class="min-w-0 py-8 md:py-10">${this.readme()}</article>
                    <aside class="space-y-4 pb-8 lg:sticky lg:top-0 lg:self-start lg:py-10" aria-label="Model summary">${this.sidebar()}</aside>
                </div>
            </div>
        `;
        this.bind();
    },

    // ---------- README (main column): the standard model card sections ----------

    readme() {
        const c = portfolioContent;
        return `
            <section class="mc-reveal">
                <h2 class="text-3xl font-semibold tracking-tight md:text-4xl">${c.name}</h2>
                <p class="mt-2 text-lg text-gray-500">${c.tagline}</p>
            </section>

            ${this.section('Model Details', `
                <h3 class="mc-h3">Model Description</h3>
                <p class="leading-7 text-gray-700">${c.about.bio}</p>
                <ul class="mt-4 space-y-1.5 text-[15px] text-gray-700">
                    ${[['Developed by', c.name], ['Model type', c.title], ['Specialization', c.specialization], ['Location', c.location],
                       ['Trained on', `${c.stats.years} years of production work at ${c.stats.companies} companies`]]
                        .map(([k, v]) => `<li class="flex gap-2"><span class="text-gray-400" aria-hidden="true">•</span><span><strong class="font-semibold text-gray-900">${k}:</strong> ${v}</span></li>`).join('')}
                </ul>
            `)}

            ${this.section('Evaluation', `
                <h3 class="mc-h3">Results</h3>
                <div class="overflow-hidden rounded-xl border border-gray-200">
                    <table class="w-full text-left text-[15px]">
                        <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th class="px-4 py-2.5 font-medium">Metric</th><th class="px-4 py-2.5 text-right font-medium">Result</th></tr></thead>
                        <tbody class="divide-y divide-gray-100">
                            ${c.impact.map(m => `<tr><td class="px-4 py-3 text-gray-700">${m.label}</td><td class="px-4 py-3 text-right font-semibold tabular-nums">${m.value}</td></tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            `)}

            ${this.section('Training Details', `
                <h3 class="mc-h3">Training Schedule</h3>
                ${this.schedule()}
                <h3 class="mc-h3 mt-8">Training Procedure</h3>
                <ol class="space-y-3">${c.experience.map(exp => this.role(exp)).join('')}</ol>
            `)}

            ${this.section('Uses', `
                <h3 class="mc-h3">Downstream Use</h3>
                <div class="grid gap-3 sm:grid-cols-2">
                    ${c.projects.map(p => `
                        <div class="mc-card flex flex-col rounded-xl bg-white p-4">
                            <h4 class="font-semibold">${p.title}</h4>
                            <p class="mt-1.5 line-clamp-3 text-sm leading-6 text-gray-600">${p.description}</p>
                            <div class="mt-3 flex flex-wrap gap-1">${p.tags.map(t => `<span class="${this.chip}">${t}</span>`).join('')}</div>
                            ${p.site ? `<a href="https://${p.site}" target="_blank" rel="noopener" class="mt-3 inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-medium text-gray-900 underline decoration-gray-300 underline-offset-4 transition-colors hover:decoration-gray-900 md:min-h-0">${p.site}<i class="fas fa-arrow-up-right-from-square text-[11px] text-gray-400" aria-hidden="true"></i></a>` : ''}
                        </div>`).join('')}
                </div>
            `)}

            ${this.section('Technical Specifications', `
                <h3 class="mc-h3">Model Architecture</h3>
                <dl class="divide-y divide-gray-100 rounded-xl border border-gray-200">
                    ${this.skills().map(([label, list]) => `
                        <div class="grid gap-2 px-4 py-3 sm:grid-cols-[140px_1fr] sm:gap-4">
                            <dt class="text-sm font-medium text-gray-500 sm:pt-0.5">${label}</dt>
                            <dd class="flex flex-wrap gap-1">${list.map(s => `<span class="${this.chip}">${s}</span>`).join('')}</dd>
                        </div>`).join('')}
                </dl>
            `)}

            ${this.section('Training Data', `
                <h3 class="mc-h3">Education</h3>
                <ul class="space-y-3">
                    ${c.education.map(e => `
                        <li class="mc-card rounded-xl p-4">
                            <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                <p class="font-semibold">${e.degree}</p>
                                <p class="text-sm tabular-nums text-gray-500">${e.year}</p>
                            </div>
                            <p class="mt-0.5 text-sm text-gray-600">${e.institution}${e.location ? ` · ${e.location}` : ''}</p>
                            ${e.gpa ? `<p class="mt-2 text-sm"><span class="text-gray-500">GPA</span> <span class="font-medium tabular-nums">${e.gpa}</span></p>` : ''}
                            ${e.description ? `<p class="mt-2 text-sm leading-6 text-gray-600">${e.description}</p>` : ''}
                        </li>`).join('')}
                </ul>
                <h3 class="mc-h3 mt-8">Certifications</h3>
                <ul class="divide-y divide-gray-100 rounded-xl border border-gray-200">
                    ${c.certifications.map(cert => `
                        <li><a href="${cert.link}" target="_blank" rel="noopener" class="group flex min-h-11 items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50">
                            <span class="min-w-0 flex-1"><span class="block font-medium">${cert.title}</span><span class="block text-sm text-gray-500">${cert.issuer} · ${cert.year}</span></span>
                            <i class="fas fa-arrow-up-right-from-square text-xs text-gray-300 transition-colors group-hover:text-gray-700" aria-hidden="true"></i>
                        </a></li>`).join('')}
                </ul>
            `)}

            ${c.patents.length + c.publications.length ? this.section('Citation', `
                <p class="mb-3 text-[15px] text-gray-700"><strong class="font-semibold text-gray-900">BibTeX:</strong> ${c.patents.map(p => `<a href="${p.link}" target="_blank" rel="noopener" class="underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900">${p.title} (${p.number}, ${p.status.toLowerCase()} ${p.year})</a>`).join(', ')}</p>
                ${[...c.patents.map(p => this.bibtex('patent', p, { number: p.number, year: p.year })), ...c.publications.map(p => this.bibtex('misc', p, {}))].join('')}
            `) : ''}

            ${this.section('Model Card Contact', `
                <p class="text-[15px] text-gray-700">Questions, collaborations or roles: <a href="mailto:${c.email}" class="font-medium text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900">${c.email}</a></p>
                <div class="mt-4 flex flex-wrap gap-2">${this.links()}</div>
            `)}
        `;
    },

    // Career as a Gantt chart: one bar per role on a shared time axis, current role in the accent colour
    schedule() {
        const c = portfolioContent, now = Date.now();
        const when = s => s.trim() === 'Present' ? now : new Date(+s.trim().split(' ')[1], MONTHS.indexOf(s.trim().split(' ')[0])).getTime();
        const roles = c.experience.map(exp => { const [from, to] = exp.period.split(' - ').map(when); return { ...exp, from, to }; }).reverse();
        const start = Math.min(...roles.map(r => r.from)), span = now - start;
        const pct = t => ((t - start) / span) * 100;
        const firstYear = new Date(start).getFullYear() + 1, lastYear = new Date(now).getFullYear();
        const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);
        return `
            <div class="mc-card rounded-xl p-4" role="img" aria-label="${roles.map(r => `${r.position} at ${r.company}, ${r.period}`).join('; ')}">
                <div class="space-y-3 sm:space-y-2" aria-hidden="true">
                    ${roles.map((r, i) => `
                        <div class="grid gap-1.5 sm:grid-cols-[230px_1fr] sm:items-center sm:gap-4">
                            <div class="min-w-0 text-sm">
                                <p class="truncate font-medium">${r.position}</p>
                                <p class="truncate text-xs text-gray-500">${r.company.split(' ')[0]} · <span class="tabular-nums">${this.duration(r.to - r.from)}</span></p>
                            </div>
                            <div class="relative h-3 rounded-full bg-gray-100">
                                <div class="mc-bar absolute inset-y-0 rounded-full ${r.to === now ? 'bg-amber-400' : 'bg-gray-800'}" style="left:${pct(r.from)}%;width:${pct(r.to) - pct(r.from)}%;--i:${i}"></div>
                            </div>
                        </div>`).join('')}
                    <div class="relative h-5 sm:ml-[246px]">
                        ${years.map((y, i) => `<span class="absolute top-1 -translate-x-1/2 text-[11px] tabular-nums text-gray-400 ${i % 2 ? 'max-sm:hidden' : ''}" style="left:${pct(new Date(y, 0).getTime())}%">${y}</span>`).join('')}
                    </div>
                </div>
            </div>`;
    },

    duration(ms) {
        const months = Math.round(ms / (30.44 * 24 * 3600 * 1000)), y = Math.floor(months / 12), m = months % 12;
        return [y && `${y} yr`, m && `${m} mo`].filter(Boolean).join(' ');
    },

    role(exp) {
        const [shown, more] = [exp.achievements.slice(0, 3), exp.achievements.slice(3)];
        const item = a => `<li class="flex gap-2.5"><span class="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-gray-400" aria-hidden="true"></span><span>${a}</span></li>`;
        return `
            <li class="mc-card rounded-xl p-4 md:p-5">
                <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h4 class="font-semibold">${exp.position} <span class="font-normal text-gray-500">· ${exp.company}</span></h4>
                    <p class="text-sm tabular-nums text-gray-500">${exp.period}</p>
                </div>
                <p class="mt-0.5 text-sm text-gray-500">${exp.location}</p>
                <ul class="mt-3 space-y-1.5 text-[15px] leading-6 text-gray-700">${shown.map(item).join('')}</ul>
                ${more.length ? `
                    <details class="mc-more mt-1.5">
                        <summary class="inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 md:min-h-8">
                            <i class="fas fa-chevron-down text-[10px] transition-transform" aria-hidden="true"></i><span>Show ${more.length} more</span>
                        </summary>
                        <ul class="mt-1 space-y-1.5 text-[15px] leading-6 text-gray-700">${more.map(item).join('')}</ul>
                    </details>` : ''}
                <div class="mt-3 flex flex-wrap gap-1">${exp.technologies.map(t => `<span class="${this.chip}">${t}</span>`).join('')}</div>
            </li>`;
    },

    // Skill categories overlap in content.js, so each skill is listed once, under its first category
    skills() {
        const c = portfolioContent, seen = new Set();
        return Object.entries(c.skills)
            .map(([key, list]) => [c.skillLabels?.[key] || key, list.filter(s => !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase()))])
            .filter(([, list]) => list.length);
    },

    bibtex(type, item, fields) {
        const c = portfolioContent;
        const key = `${c.name.split(' ').pop()}${item.year || ''}${item.title.split(' ')[0]}`.toLowerCase().replace(/[^a-z0-9]/g, '');
        const rows = { title: item.title, author: c.name, ...fields, url: item.link };
        const width = Math.max(...Object.keys(rows).map(k => k.length));
        const text = `@${type}{${key},\n${Object.entries(rows).map(([k, v]) => `  ${k.padEnd(width)} = {${v}}`).join(',\n')}\n}`;
        return `
            <div class="relative mb-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <pre class="mc-mono overflow-x-auto p-4 pr-14 text-[13px] leading-6 text-gray-800"><code>${text}</code></pre>
                <button type="button" class="mc-copy absolute right-1.5 top-1.5 flex h-11 w-11 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-200/70 hover:text-gray-900 md:h-9 md:w-9" data-copy="${encodeURIComponent(text)}" aria-label="Copy BibTeX" title="Copy">
                    <i class="fas fa-copy" aria-hidden="true"></i>
                </button>
            </div>`;
    },

    // ---------- sidebar ----------

    sidebar() {
        const c = portfolioContent;
        const companies = [...new Set([...c.experience].reverse().map(e => e.company))];
        const base = [...c.education].sort((a, b) => parseInt(a.year) - parseInt(b.year))[0];
        const stat = (value, label) => `<div><p class="text-2xl font-semibold tabular-nums">${value}</p><p class="text-xs text-gray-500">${label}</p></div>`;
        const node = (kind, title, sub, last) => `
            <li class="relative pl-6">
                ${last ? '' : '<span class="absolute bottom-[-14px] left-[5px] top-4 w-px bg-gray-200" aria-hidden="true"></span>'}
                <span class="absolute left-0 top-[5px] h-[11px] w-[11px] rounded-full border-2 ${last ? 'border-amber-400 bg-amber-400' : 'border-gray-300 bg-white'}" aria-hidden="true"></span>
                <p class="text-xs text-gray-500">${kind}</p>
                <p class="text-sm font-medium leading-5">${title}</p>
                ${sub ? `<p class="text-xs text-gray-500">${sub}</p>` : ''}
            </li>`;
        return `
            <div class="mc-card mc-reveal rounded-xl p-4">
                <div class="flex items-center gap-3">
                    ${this.avatar('h-12 w-12 text-base')}
                    <div class="min-w-0"><p class="truncate font-semibold">${c.name}</p><p class="truncate text-sm text-gray-500">${c.title}</p></div>
                </div>
                <div class="mt-4 grid gap-2">
                    <a href="mailto:${c.email}" class="${this.btn} bg-gray-900 text-white hover:bg-gray-700"><i class="fas fa-handshake" aria-hidden="true"></i>Hire me</a>
                    ${c.resume ? `<a ${this.resumeAttrs} class="${this.btn} border border-gray-200 bg-white text-gray-900 hover:bg-gray-50"><i class="fas fa-arrow-down" aria-hidden="true"></i>Download résumé</a>` : ''}
                </div>
                <div class="mt-3 flex justify-center gap-1">${this.links(true)}</div>
            </div>

            <div class="mc-card mc-reveal rounded-xl p-4">
                <h2 class="text-sm font-medium text-gray-500">Model size</h2>
                <div class="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                    ${stat(c.stats.years, 'years trained')}${stat(c.stats.skills, 'skills')}${stat(c.stats.projects, 'projects')}${stat(c.stats.companies, 'companies')}
                </div>
            </div>

            <div class="mc-card mc-reveal rounded-xl p-4">
                <h2 class="text-sm font-medium text-gray-500">Model tree</h2>
                <ol class="mt-3 space-y-3.5">
                    ${base ? node('Base model', base.institution.replace(/\s*\(.*\)$/, ''), base.degree.replace(/\s*\(.*\)$/, '')) : ''}
                    ${companies.map((co, i) => node('Fine-tuned', co, c.experience.filter(e => e.company === co).map(e => e.position).reverse().join(' → '), i === companies.length - 1)).join('')}
                </ol>
            </div>`;
    },

    // ---------- small pieces ----------

    section(title, body) {
        return `<section class="mc-reveal mt-12" aria-label="${title}"><h2 class="mb-5 border-b border-gray-200 pb-2 text-2xl font-semibold tracking-tight">${title}</h2>${body}</section>`;
    },

    tag(icon, text) {
        return `<li class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-gray-700">${icon ? `<i class="fas ${icon} text-xs text-gray-400" aria-hidden="true"></i>` : ''}${text}</li>`;
    },

    links(iconOnly) {
        const c = portfolioContent;
        return [[c.social.github, 'fab fa-github', 'GitHub'], [c.social.linkedin, 'fab fa-linkedin-in', 'LinkedIn'], [c.social.portfolio, 'fas fa-globe', 'Website'], [`mailto:${c.email}`, 'fas fa-envelope', 'Email']]
            .filter(([href]) => href && href !== 'mailto:')
            .map(([href, icon, label]) => {
                const ext = href.startsWith('http') ? 'target="_blank" rel="noopener"' : '';
                return iconOnly
                    ? `<a href="${href}" ${ext} aria-label="${label}" title="${label}" class="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 md:h-9 md:w-9"><i class="${icon}" aria-hidden="true"></i></a>`
                    : `<a href="${href}" ${ext} class="${this.btn} border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"><i class="${icon}" aria-hidden="true"></i>${label}</a>`;
            }).join('');
    },

    // Profile photo with initials behind it, shown if the image fails
    avatar(size) {
        const c = portfolioContent;
        const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2);
        return `<span class="relative inline-flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 font-semibold text-gray-600" aria-hidden="true">${initials}
            ${c.picture ? `<img src="${c.picture}" alt="" class="absolute inset-0 h-full w-full object-cover" onerror="this.remove()">` : ''}</span>`;
    },

    // ---------- behaviour ----------

    bind() {
        const root = document.getElementById('mcRoot');
        root.addEventListener('click', (e) => {
            const btn = e.target.closest('.mc-copy');
            if (!btn) return;
            const done = (icon) => {
                btn.firstElementChild.className = `fas ${icon}`;
                this.timers.push(setTimeout(() => { btn.firstElementChild.className = 'fas fa-copy'; }, 1500));
            };
            navigator.clipboard?.writeText(decodeURIComponent(btn.dataset.copy)).then(() => done('fa-check'), () => done('fa-xmark'));
        });

        // Sections rise in as they scroll into view; without motion (or observer) everything is simply shown
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
        root.classList.add('mc-anim');
        this.observer = new IntersectionObserver((entries) => entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            this.observer.unobserve(entry.target);
        }), { rootMargin: '0px 0px -8% 0px' });
        root.querySelectorAll('.mc-reveal').forEach(el => this.observer.observe(el));
    },

    cleanup() {
        this.observer?.disconnect();
        this.observer = null;
        this.timers.forEach(clearTimeout);
        this.timers = [];
    }
};

if (typeof window !== 'undefined') {
    window.ModelCardTheme = ModelCardTheme;
}
