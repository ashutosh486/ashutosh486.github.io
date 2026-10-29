// Sci-Fi Console theme checks: node tests/scifi.test.mjs [screenshot-dir]
import { openPage, sleep } from './cdp.mjs';
import assert from 'node:assert';
import { mkdirSync } from 'node:fs';
const shots = process.argv[2] || 'tests/screenshots';
mkdirSync(shots, { recursive: true });
const out = `${shots}/scifi`;
const waiting = `document.getElementById('sfRoot').classList.contains('is-waiting')`;
const selected = `document.querySelector('.sf-tab[aria-selected="true"]').dataset.screen`;
// Nothing may sit under the theme switcher once a screen is scrolled to the end
const cornerClear = sel => `(() => { const d = document.getElementById('themeDock').getBoundingClientRect();
    return [...document.querySelectorAll('${sel}')].every(el => { const r = el.getBoundingClientRect();
        return !r.width || r.bottom <= d.top || r.top >= d.bottom || r.right <= d.left || r.left >= d.right; }); })()`;

for (const [label, opts] of [['desk', {}], ['m', { width: 390, height: 844, mobile: true }]]) {
    const phone = label === 'm';
    const b = await openPage('scifi', opts);
    const c = await b.evaluate('JSON.stringify(portfolioContent)').then(JSON.parse);
    const noOverflow = async what => assert.equal(await b.evaluate(`innerWidth + 'x' + document.documentElement.scrollWidth`), `${opts.width || 1440}x${opts.width || 1440}`, `${label}: no horizontal overflow (${what})`);
    const toEnd = `(p => { p.scrollTop = 1e6; scrollTo(0, document.documentElement.scrollHeight); })(document.getElementById('sfPanel'))`;

    // Nothing plays behind the theme chooser; closing it powers the tube on, and the self-test gives way to the console
    assert.ok(await b.evaluate(`document.getElementById('themeChooser').open && ${waiting} && getComputedStyle(document.querySelector('.sf-crt')).opacity === '0'`), `${label}: nothing plays behind the chooser`);
    await b.evaluate(`document.getElementById('themeChooser').close()`); await sleep(1000);
    assert.ok(await b.evaluate(`!${waiting} && SciFiTheme.anims.some(a => a.playState === 'running')`), `${label}: closing the chooser starts the boot`);
    await b.shot(`${out}-${label}-0-boot.png`);
    for (let i = 0; i < 50 && await b.evaluate(`SciFiTheme.onSkip !== null`); i++) await sleep(100);
    assert.ok(await b.evaluate(`SciFiTheme.anims.every(a => a.playState === 'finished') && document.querySelector('.sf-boot').hidden`), `${label}: boot finishes and the printout goes`);
    assert.ok(await b.evaluate(`document.querySelector('.sf-boot').textContent.includes(portfolioContent.stats.skills + ' modules')`), `${label}: self-test counts come from content.js`);

    // A key press skips the boot
    await b.evaluate(`portfolioController.loadTheme('book', { animate: false }); portfolioController.loadTheme('scifi', { animate: false })`); await sleep(400);
    await b.evaluate(`dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }))`); await sleep(100);
    assert.ok(await b.evaluate(`SciFiTheme.anims.length > 0 && SciFiTheme.anims.every(a => a.playState === 'finished') && SciFiTheme.onSkip === null`), `${label}: a key press skips the boot`);

    // Dossier: caricature (no photo), one amber accent
    assert.ok(await b.evaluate(`!!document.querySelector('.sf-portrait svg.cc') && !document.querySelector('#sfRoot img')`), `${label}: dossier shows the caricature, not the photo`);
    assert.ok(await b.evaluate(`!/22d3ee|cyan/i.test(document.getElementById('sfRoot').outerHTML)`), `${label}: no cyan left`);
    await noOverflow('dossier');
    await b.shot(`${out}-${label}-1-dossier.png`);

    // Every fact comes from content.js, across all screens; digits switch screens
    let text = '';
    const ids = await b.evaluate(`SciFiTheme.screens.map(s => s.id)`);
    for (const [i, id] of ids.entries()) {
        await b.evaluate(`dispatchEvent(new KeyboardEvent('keydown', { key: '${i + 1}' }))`); await sleep(150);
        assert.equal(await b.evaluate(selected), id, `${label}: key ${i + 1} opens ${id}`);
        assert.ok(await b.evaluate(`document.getElementById('sfPanel').getAttribute('aria-labelledby') === document.activeElement.id`), `${label}: panel labelled by the focused tab (${id})`);
        text += ' ' + await b.evaluate(`document.getElementById('sfPanel').innerText.replace(/\\s+/g, ' ')`);
        await noOverflow(id);
    }
    text = text.toLowerCase();
    for (const fact of [c.name, c.title, c.specialization, c.location, c.about.bio.slice(0, 60), c.about.tagline, `${c.stats.years} years`, `${c.stats.skills} modules`,
        c.impact[0].value, c.impact.at(-1).label, c.about.funFact.slice(0, 40), c.hobbies.at(-1), c.email, 'github.com/ashutosh486',
        ...c.experience.map(e => e.position), ...c.experience.map(e => e.achievements.at(-1)), ...c.projects.map(p => p.title), c.projects.at(-1).description.slice(0, 50),
        c.education[0].institution, c.education.at(-1).gpa, c.patents[0].number, ...c.certifications.map(x => x.title), ...c.currentlyReading.map(r => r.title), c.currentlyReading[0].notes])
        assert.ok(text.includes(fact.toLowerCase()), `${label}: console shows "${fact.slice(0, 40)}" from content.js`);
    assert.ok(!text.includes(c.phone), `${label}: phone number not shown`);
    assert.ok(!/\p{Extended_Pictographic}/u.test(text), `${label}: no colour emoji on the phosphor screen`);

    // Systems lists each skill once
    await b.evaluate(`dispatchEvent(new KeyboardEvent('keydown', { key: '4' }))`); await sleep(100);
    const listed = await b.evaluate(`[...document.querySelectorAll('.sf-skills li')].map(x => x.textContent.toLowerCase())`);
    assert.equal(listed.length, new Set(listed).size, `${label}: each skill listed once`);
    assert.equal(listed.length, c.stats.skills, `${label}: every skill listed`);

    // Comms: résumé from the content.js path, new tab
    await b.evaluate(`dispatchEvent(new KeyboardEvent('keydown', { key: '7' }))`); await sleep(400);
    assert.ok(await b.evaluate(`(a => a && a.getAttribute('href') === portfolioContent.resume && a.target === '_blank')(document.querySelector('#sfPanel a[download]'))`), `${label}: résumé link uses the content.js path`);
    await b.shot(`${out}-${label}-2-comms.png`);

    // Arrow keys move along the menu (wrapping); a screen prints in line by line
    await b.evaluate(`document.getElementById('sfTab-comms').focus()`);
    await b.key('ArrowDown'); await sleep(50);
    assert.ok(await b.evaluate(`${selected} === 'dossier' && document.activeElement.id === 'sfTab-dossier'`), `${label}: arrow wraps to the first screen`);
    await b.key('ArrowUp'); await sleep(50);
    assert.ok(await b.evaluate(`${selected} === 'comms'`), `${label}: arrow up moves back`);
    await b.evaluate(`document.getElementById('sfTab-service').click()`); await sleep(60);
    assert.ok(await b.evaluate(`document.querySelectorAll('#sfPanel .sf-line').length > 10 && document.getAnimations().some(a => a.animationName === 'sf-print' && a.playState === 'running')`), `${label}: a new screen prints in`);
    await sleep(900);
    await b.shot(`${out}-${label}-3-service.png`);

    // Targets and corner
    assert.ok(await b.evaluate(`[...document.querySelectorAll('.sf-tab')].every(el => el.offsetHeight >= ${phone ? 44 : 40})`), `${label}: menu targets`);
    await b.evaluate(toEnd); await sleep(300);
    assert.ok(await b.evaluate(cornerClear('#sfPanel .sf-entry > *, .sf-keys > *')), `${label}: switcher corner clear at the end of a screen`);
    if (phone) {
        assert.ok(await b.evaluate(`document.querySelector('.sf-menu').getBoundingClientRect().top === 0`), 'm: menu sticks to the top');
        await b.evaluate(`document.getElementById('sfTab-missions').click()`); await sleep(300);
        assert.ok(await b.evaluate(`Math.abs(document.getElementById('sfPanel').getBoundingClientRect().top - document.querySelector('.sf-menu').getBoundingClientRect().bottom) < 2`), 'm: a new screen starts under the menu');
    } else assert.ok(await b.evaluate(`document.documentElement.scrollHeight === innerHeight`), 'desk: the console fills the window, the panel scrolls');
    await b.shot(`${out}-${label}-4-end.png`);

    await b.evaluate(`portfolioController.loadTheme('book')`); await sleep(300);
    assert.ok(await b.evaluate(`SciFiTheme.onKey === null && SciFiTheme.onSkip === null && SciFiTheme.clock === null`), `${label}: cleanup removes the listeners and the clock`);
    assert.deepEqual(b.errors.filter(e => e.includes('/scifi.js')), [], `${label}: no runtime errors`);
    b.close();
}
console.log('all scifi checks passed');
