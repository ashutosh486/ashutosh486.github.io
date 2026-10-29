// Contact Card theme checks: node tests/apple.test.mjs [screenshot-dir]
import { openPage, sleep } from './cdp.mjs';
import assert from 'node:assert';
import { mkdirSync } from 'node:fs';
const shots = process.argv[2] || 'tests/screenshots';
mkdirSync(shots, { recursive: true });
const out = `${shots}/apple`;
const waiting = `document.getElementById('apRoot').classList.contains('is-waiting')`;
const pageOpen = `!document.getElementById('apPage').hidden`;
// Nothing may sit under the theme switcher once the card (or a page) is scrolled to the end
const cornerClear = sel => `(() => { const d = document.getElementById('themeDock').getBoundingClientRect();
    return [...document.querySelectorAll('${sel}')].every(el => { const r = el.getBoundingClientRect();
        return !r.width || r.bottom <= d.top || r.top >= d.bottom || r.right <= d.left || r.left >= d.right; }); })()`;

for (const [label, opts] of [['desk', {}], ['m', { width: 390, height: 844, mobile: true }]]) {
    const phone = label === 'm';
    const b = await openPage('apple', opts);
    const c = await b.evaluate('JSON.stringify(portfolioContent)').then(JSON.parse);
    const noOverflow = async what => assert.equal(await b.evaluate(`innerWidth + 'x' + document.documentElement.scrollWidth`), `${opts.width || 1440}x${opts.width || 1440}`, `${label}: no horizontal overflow (${what})`);
    const open = async id => { await b.evaluate(`document.querySelector('[data-page="${id}"]').click()`); await sleep(600); };
    const back = async () => { await b.evaluate(`document.querySelector('.ap-back').click()`); await sleep(600); };

    // Nothing plays behind the theme chooser; closing it starts the opening
    assert.ok(await b.evaluate(`document.getElementById('themeChooser').open && ${waiting} && getComputedStyle(document.querySelector('.ap-letter')).opacity === '0'`), `${label}: nothing plays behind the chooser`);
    await b.evaluate(`document.getElementById('themeChooser').close()`); await sleep(500);
    assert.ok(await b.evaluate(`!${waiting} && AppleTheme.anims.some(a => a.playState === 'running')`), `${label}: closing the chooser starts the opening`);
    await b.shot(`${out}-${label}-0-opening.png`);
    for (let i = 0; i < 40 && await b.evaluate(`AppleTheme.onSkip !== null`); i++) await sleep(100);
    assert.ok(await b.evaluate(`AppleTheme.anims.every(a => a.playState === 'finished')`), `${label}: opening finishes`);

    // A key press skips the opening
    await b.evaluate(`portfolioController.loadTheme('book', { animate: false }); portfolioController.loadTheme('apple', { animate: false })`); await sleep(400);
    await b.evaluate(`dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }))`); await sleep(100);
    assert.ok(await b.evaluate(`AppleTheme.anims.length > 0 && AppleTheme.anims.every(a => a.playState === 'finished') && AppleTheme.onSkip === null`), `${label}: a key press skips the opening`);

    // Poster: the caricature in front of the name
    assert.ok(await b.evaluate(`document.querySelector('.ap-name').getAttribute('aria-label') === portfolioContent.name && !!document.querySelector('.ap-figure svg.cc') && !document.querySelector('#apRoot img')`), `${label}: poster shows the name and the caricature, not the photo`);
    assert.ok(await b.evaluate(`(n => document.querySelector('.ap-figure').getBoundingClientRect().top < n.bottom)(document.querySelector('.ap-name').getBoundingClientRect())`), `${label}: caricature overlaps the name`);
    await noOverflow('card');
    await b.shot(`${out}-${label}-1-card.png`);

    // Every fact comes from content.js, on the card and its pages
    let text = await b.evaluate(`document.querySelector('.ap-card').innerText.replace(/\\s+/g, ' ')`);
    const ids = await b.evaluate(`AppleTheme.pages.map(p => p.id)`);
    for (const id of ids) {
        await open(id);
        text += ' ' + await b.evaluate(`document.getElementById('apPage').innerText.replace(/\\s+/g, ' ')`);
        await back();
    }
    for (const fact of [c.title, c.specialization, c.email, c.location.split(', ')[0], c.about.bio.slice(0, 60), c.about.tagline, `${c.stats.years} years`,
        c.impact[0].value, c.impact.at(-1).label, c.about.funFact.slice(0, 40), c.hobbies.at(-1), 'github.com/ashutosh486',
        ...c.experience.map(e => e.position), ...c.experience.map(e => e.achievements.at(-1)), ...c.projects.map(p => p.title), c.projects.at(-1).description.slice(0, 50),
        c.education[0].institution, c.education.at(-1).gpa, c.patents[0].number, ...c.certifications.map(x => x.title), ...c.currentlyReading.map(r => r.title), c.currentlyReading[0].notes])
        assert.ok(text.includes(fact), `${label}: card shows "${fact.slice(0, 40)}" from content.js`);
    assert.ok(!text.includes(c.phone), `${label}: phone number not shown`);
    await open('skills');
    const listed = await b.evaluate(`[...document.querySelectorAll('.ap-skills span')].map(x => x.textContent.toLowerCase())`);
    assert.equal(listed.length, new Set(listed).size, `${label}: each skill listed once`);
    assert.equal(listed.length, c.stats.skills, `${label}: every skill listed`);
    await back();
    assert.ok(await b.evaluate(`(l => l.length === 2 && l.every(a => a.getAttribute('href') === portfolioContent.resume && a.target === '_blank'))(document.querySelectorAll('.ap-card a[download]'))`), `${label}: résumé links use the content.js path and open in a new tab`);

    // Push a page: slides in, card goes inert, focus on Back; Escape or Back returns focus to the row
    await b.evaluate(`document.querySelector('[data-page="experience"]').click()`); await sleep(200);
    assert.ok(await b.evaluate(`AppleTheme.pageAnims[0].playState === 'running'`), `${label}: page slides in`);
    await sleep(400);
    assert.ok(await b.evaluate(`${pageOpen} && document.getElementById('apPageTitle').textContent === 'Experience' && document.getElementById('apMain').inert && document.activeElement.classList.contains('ap-back') && document.activeElement.offsetHeight >= 44 && [...document.querySelectorAll('#apPage .ap-row')].every(el => el.offsetHeight >= 44)`), `${label}: Experience opens with focus on a 44px Back, rows 44px`);
    if (!phone) assert.ok(await b.evaluate(`document.getElementById('apPage').getBoundingClientRect().left === document.querySelector('.ap-poster').getBoundingClientRect().right`), 'desk: page opens beside the poster');
    await noOverflow('page');
    await b.shot(`${out}-${label}-2-experience.png`);
    await b.evaluate(`document.getElementById('apPage').scrollTop = 1e6`); await sleep(200);
    assert.ok(await b.evaluate(cornerClear('.ap-page-body > *')), `${label}: switcher corner clear at the end of a page`);
    await b.key('Escape'); await sleep(600);
    assert.ok(await b.evaluate(`!${pageOpen} && !document.getElementById('apMain').inert && document.activeElement.dataset.page === 'experience'`), `${label}: Escape goes back and refocuses the row`);
    await open('education'); await back();
    assert.ok(await b.evaluate(`!${pageOpen} && document.activeElement.dataset.page === 'education'`), `${label}: Back returns to the card`);

    // Share Contact: a vCard built from content.js (download where the browser can't share files)
    await b.evaluate(`Object.defineProperty(navigator, 'canShare', { value: undefined }); HTMLAnchorElement.prototype.click = function () { window.saved = { href: this.href, name: this.download }; };
        document.querySelector('[data-action="share"]').click()`); await sleep(300);
    const card = await b.evaluate(`fetch(window.saved.href).then(r => r.text())`);
    assert.equal(await b.evaluate(`window.saved.name`), `${c.name}.vcf`, `${label}: vCard named after the contact`);
    for (const line of ['BEGIN:VCARD', `FN:${c.name}`, `EMAIL;TYPE=INTERNET,WORK:${c.email}`, `TITLE:${c.title}`, `ORG:${c.experience[0].company}`, `URL:${c.social.github}`, 'X-ABLabel:GitHub', 'END:VCARD'])
        assert.ok(card.includes(line), `${label}: vCard has ${line.slice(0, 30)}`);
    assert.ok(card.includes('\r\n') && !card.includes(c.phone), `${label}: vCard uses CRLF and leaves out the phone number`);

    // Scrolled to the end: corner clear; phones get the compact bar, wide screens keep the poster in place
    await b.evaluate(`scrollTo(0, document.documentElement.scrollHeight)`); await sleep(400);
    assert.ok(await b.evaluate(cornerClear('.ap-card > *')), `${label}: switcher corner clear at the end of the card`);
    if (phone) {
        assert.ok(await b.evaluate(`document.getElementById('apRoot').classList.contains('is-compact') && getComputedStyle(document.querySelector('.ap-bar')).opacity === '1'`), 'm: compact bar shows once the poster scrolls away');
        assert.ok(await b.evaluate(`[...document.querySelectorAll('.ap-card .ap-row, .ap-action')].every(el => el.offsetHeight >= 44)`), 'm: 44px rows and buttons');
    } else assert.ok(await b.evaluate(`document.querySelector('.ap-poster').getBoundingClientRect().top === 0`), 'desk: poster stays in place');
    await b.shot(`${out}-${label}-3-end.png`);

    await b.evaluate(`portfolioController.loadTheme('book')`); await sleep(300);
    assert.ok(await b.evaluate(`AppleTheme.onKey === null && AppleTheme.onSkip === null && AppleTheme.observer === null && AppleTheme.vcardUrl === null`), `${label}: cleanup removes the listeners`);
    assert.deepEqual(b.errors.filter(e => e.includes('/apple.js')), [], `${label}: no runtime errors`);
    b.close();
}
console.log('all apple checks passed');
