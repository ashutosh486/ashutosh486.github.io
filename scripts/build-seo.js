// Builds what crawlers and AI agents read without running JavaScript, all from js/content.js:
// index.html's description/canonical/JSON-LD and its static copy, plus index.md, llms.txt and sitemap.xml.
// npm run build:seo   (after editing content.js)   ·   node scripts/build-seo.js --check   (fails if anything is stale)
const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const c = require(join(root, 'js/content.js'));

const site = c.site.replace(/\/$/, '');
const url = path => `${site}/${path}`;
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
const skills = [...new Map(Object.values(c.skills).flat().map(s => [s.toLowerCase(), s])).values()];
const sameAs = [c.social.github, c.social.linkedin, c.social.twitter].filter(Boolean);
const current = c.experience.find(e => e.period.endsWith('Present'));

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Person',
            '@id': `${site}/#person`,
            name: c.name,
            jobTitle: c.title,
            description: c.about.shortBio,
            url: `${site}/`,
            image: url(c.picture),
            email: `mailto:${c.email}`,
            address: { '@type': 'PostalAddress', addressLocality: c.location.split(',')[0].trim(), addressCountry: c.location.split(',').pop().trim() },
            sameAs,
            knowsAbout: c.about.interests,
            ...(current && { worksFor: { '@type': 'Organization', name: current.company } }),
            alumniOf: c.education.map(e => ({ '@type': 'CollegeOrUniversity', name: e.institution }))
        },
        { '@type': 'WebSite', '@id': `${site}/#website`, url: `${site}/`, name: c.name, inLanguage: 'en', publisher: { '@id': `${site}/#person` } },
        { '@type': 'ProfilePage', '@id': `${site}/#page`, url: `${site}/`, name: `${c.name} · ${c.title}`, isPartOf: { '@id': `${site}/#website` }, mainEntity: { '@id': `${site}/#person` } },
        ...c.patents.map(p => ({ '@type': 'CreativeWork', name: `${p.title} (patent ${p.number})`, url: p.link, creator: { '@id': `${site}/#person` }, datePublished: p.year })),
        ...(c.resume ? [{ '@type': 'DigitalDocument', name: `${c.name} résumé (PDF)`, url: url(c.resume), encodingFormat: 'application/pdf', about: { '@id': `${site}/#person` } }] : [])
    ]
};

const head = `
    <meta name="description" content="${esc(`${c.name}, ${c.title}. ${c.about.shortBio}`)}">
    <link rel="canonical" href="${site}/">
    <link rel="alternate" type="text/markdown" href="index.md">
    <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
    `;

// The page as plain HTML: what agents and no-JS readers get; main.js replaces it with the chosen theme
const body = `
        <main class="static-page">
            <h1>${esc(c.name)}</h1>
            <p>${esc(c.title)} · ${esc(c.location)}</p>
            <p>${esc(c.tagline)}</p>
            <nav aria-label="Sections">
                <a href="#about">About</a> · <a href="#experience">Experience</a> · <a href="#projects">Projects</a> · <a href="#skills">Skills</a> · <a href="#education">Education</a> · <a href="#contact">Contact</a>${c.resume ? ` · <a href="${c.resume}">Résumé (PDF)</a>` : ''}
            </nav>
            <section id="about"><h2>About</h2><p>${esc(c.about.bio)}</p>
                <ul>${c.impact.map(m => `<li>${esc(m.label)}: ${esc(m.value)}</li>`).join('')}</ul></section>
            <section id="experience"><h2>Experience</h2>${c.experience.map(e => `
                <h3>${esc(e.position)}, ${esc(e.company)}</h3><p>${esc(e.period)} · ${esc(e.location)}</p>
                <ul>${e.achievements.map(a => `<li>${esc(a)}</li>`).join('')}</ul>`).join('')}</section>
            <section id="projects"><h2>Projects</h2>${c.projects.map(p => `
                <h3>${esc(p.title)}</h3><p>${esc(p.description)}${p.site ? ` <a href="https://${esc(p.site)}">${esc(p.site)}</a>` : ''}</p>`).join('')}</section>
            <section id="skills"><h2>Skills</h2><p>${skills.map(esc).join(', ')}</p></section>
            <section id="education"><h2>Education</h2><ul>${c.education.map(e => `<li>${esc(e.degree)}, ${esc(e.institution)} (${esc(e.year)})</li>`).join('')}</ul>
                <h3>Certifications and patents</h3><ul>${c.certifications.map(x => `<li><a href="${esc(x.link)}">${esc(x.title)}</a>, ${esc(x.issuer)} (${esc(x.year)})</li>`).join('')}${c.patents.map(p => `<li><a href="${esc(p.link)}">Patent ${esc(p.number)}: ${esc(p.title)}</a> (${esc(p.year)})</li>`).join('')}</ul></section>
            <section id="contact"><h2>Contact</h2><ul>
                <li>Email: <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>
                ${sameAs.map(s => `<li><a href="${esc(s)}" rel="me">${esc(s.replace('https://', ''))}</a></li>`).join('\n                ')}
            </ul></section>
        </main>
    `;

const md = `# ${c.name}

${c.title} · ${c.location}

> ${c.about.shortBio}

## About

${c.about.bio}

${c.impact.map(m => `- ${m.label}: ${m.value}`).join('\n')}

## Experience
${c.experience.map(e => `
### ${e.position}, ${e.company}

${e.period} · ${e.location}

${e.achievements.map(a => `- ${a}`).join('\n')}
`).join('')}
## Projects
${c.projects.map(p => `
### ${p.title}

${p.description}${p.site ? ` [${p.site}](https://${p.site})` : ''}
`).join('')}
## Skills

${skills.join(', ')}

## Education

${c.education.map(e => `- ${e.degree}, ${e.institution} (${e.year})`).join('\n')}

## Certifications and patents

${c.certifications.map(x => `- [${x.title}](${x.link}), ${x.issuer} (${x.year})`).join('\n')}
${c.patents.map(p => `- [Patent ${p.number}: ${p.title}](${p.link}) (${p.year})`).join('\n')}

## Contact

- Email: [${c.email}](mailto:${c.email})
${sameAs.map(s => `- [${s.replace('https://', '')}](${s})`).join('\n')}
${c.resume ? `- Résumé: [${c.resume.split('/').pop()}](${url(c.resume)})\n` : ''}`;

const llms = `# ${c.name}

> ${c.name} is a ${c.title} based in ${c.location}. ${c.about.shortBio}

This site is an interactive portfolio with several themes. Every theme shows the same résumé data.

## Profile

- [Full profile in Markdown](${url('index.md')}): about, experience, projects, skills, education, certifications, contact
${c.resume ? `- [Résumé (PDF)](${url(c.resume)})\n` : ''}- [Portfolio home](${site}/)

## Elsewhere

${sameAs.map(s => `- [${s.replace(/^https:\/\/(www\.)?/, '').split('/')[0]}](${s})`).join('\n')}
- [Email](mailto:${c.email})
`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${site}/</loc></url>
${c.resume ? `  <url><loc>${url(c.resume)}</loc></url>\n` : ''}</urlset>
`;

// index.html keeps everything else; only the marked blocks are replaced
const between = (html, name, inner) => {
    const re = new RegExp(`(<!-- ${name} -->)[\\s\\S]*?(<!-- /${name} -->)`);
    if (!re.test(html)) throw new Error(`index.html is missing the <!-- ${name} --> markers`);
    return html.replace(re, `$1${inner}$2`);
};
const html = between(between(readFileSync(join(root, 'index.html'), 'utf8'), 'seo:head', head), 'seo:body', body);

const outputs = { 'index.html': html, 'index.md': md, 'llms.txt': llms, 'sitemap.xml': sitemap };
const stale = Object.entries(outputs).filter(([file, text]) => {
    try { return readFileSync(join(root, file), 'utf8') !== text; } catch { return true; }
}).map(([file]) => file);

if (process.argv.includes('--check')) {
    if (stale.length) {
        process.stderr.write(`Out of date with content.js: ${stale.join(', ')}. Run npm run build:seo\n`);
        process.exit(1);
    }
} else {
    stale.forEach(file => writeFileSync(join(root, file), outputs[file]));
    process.stdout.write(stale.length ? `Updated ${stale.join(', ')}\n` : 'Up to date\n');
}
