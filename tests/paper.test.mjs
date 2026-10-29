// Paper theme checks: node tests/paper.test.mjs [screenshot-dir]
import { openPage, sleep } from './cdp.mjs';
import assert from 'node:assert';
import { mkdirSync } from 'node:fs';
const shots = process.argv[2] || 'tests/screenshots';
mkdirSync(shots, { recursive: true });
const out = `${shots}/paper`;
const waiting = `document.getElementById('ppRoot').classList.contains('is-waiting')`;
// Nothing may sit under the theme switcher once the page is scrolled to the end
const cornerClear = `(() => { scrollTo(0, document.documentElement.scrollHeight);
    const d = document.getElementById('themeDock').getBoundingClientRect();
    return [...document.querySelectorAll('.pp-col > *, .pp-foot')].every(el => { const r = el.getBoundingClientRect();
        return !r.width || r.bottom <= d.top || r.top >= d.bottom || r.right <= d.left || r.left >= d.right; }); })()`;

for (const [label, opts] of [['desk', {}], ['m', { width: 390, height: 844, mobile: true }]]) {
    const phone = label === 'm';
    const b = await openPage('paper', opts);
    const c = await b.evaluate('JSON.stringify(portfolioContent)').then(JSON.parse);
    const noOverflow = async what => assert.equal(await b.evaluate(`innerWidth + 'x' + document.documentElement.scrollWidth`), `${opts.width || 1440}x${opts.width || 1440}`, `${label}: no horizontal overflow (${what})`);

    // Nothing plays behind the theme chooser; closing it runs pdflatex, then the pages rise in
    assert.ok(await b.evaluate(`document.getElementById('themeChooser').open && ${waiting} && document.getElementById('ppLog').hidden`), `${label}: nothing plays behind the chooser`);
    await b.evaluate(`document.getElementById('themeChooser').close()`); await sleep(350);
    assert.ok(await b.evaluate(`!document.getElementById('ppLog').hidden && document.querySelector('#ppLog pre').textContent.startsWith('$ pdflatex')`), `${label}: opening shows the pdflatex log`);
    await b.shot(`${out}-${label}-0-compile.png`);
    for (let i = 0; i < 40 && await b.evaluate(waiting); i++) await sleep(100);
    assert.ok(await b.evaluate(`document.querySelector('#ppLog pre').textContent.includes('Output written on ' + PaperTheme.file) && document.getElementById('ppLog').hidden`), `${label}: log ends with "Output written on" and closes`);
    await sleep(1600);

    // A key press skips the opening straight to the finished paper
    await b.evaluate(`portfolioController.loadTheme('notebook', { animate: false }); portfolioController.loadTheme('paper', { animate: false })`); await sleep(300);
    await b.evaluate(`dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }))`); await sleep(100);
    assert.ok(await b.evaluate(`!${waiting} && document.getElementById('ppLog').hidden && (PaperTheme.anims || []).every(a => a.playState === 'finished')`), `${label}: a key press skips the opening`);
    await sleep(300);

    // Every fact comes from content.js
    const text = await b.evaluate(`document.getElementById('ppPages').innerText.replace(/\\s+/g, ' ')`);
    for (const fact of [c.name, c.title, c.email, c.about.bio.slice(0, 60), `${c.stats.years} years`, c.impact[0].value, c.experience[0].company, ...c.experience.map(e => e.achievements.at(-1)),
        ...c.projects.map(p => p.title), c.projects.at(-1).description.slice(0, 50), c.education[0].institution, c.education.at(-1).gpa, c.patents[0].number, ...c.certifications.map(x => x.title),
        ...c.currentlyReading.map(r => r.title), c.currentlyReading[0].notes, c.hobbies.at(-1).toLowerCase()])
        assert.ok(text.includes(fact), `${label}: paper shows "${fact.slice(0, 40)}" from content.js`);
    // Table 1 lists each skill once, and all of them
    const listed = await b.evaluate(`[...document.querySelectorAll('.pp-table tbody td:last-child')].flatMap(td => td.textContent.split(', ')).map(s => s.toLowerCase())`);
    assert.equal(listed.length, new Set(listed).size, `${label}: each skill listed once`);
    assert.equal(listed.length, c.stats.skills, `${label}: every skill listed`);
    // Every citation points at a reference; no two references share a number
    assert.ok(await b.evaluate(`[...document.querySelectorAll('.pp-cite')].every(a => document.querySelector(a.getAttribute('href'))) && document.querySelectorAll('.pp-cite').length >= portfolioContent.certifications.length`), `${label}: citations resolve`);
    assert.equal(await b.evaluate(`document.querySelectorAll('.pp-bib').length`), c.projects.filter(p => p.site).length + c.patents.length + c.certifications.length + c.currentlyReading.length, `${label}: bibliography has every entry`);
    assert.ok(await b.evaluate(`[...document.querySelectorAll('#ppRoot a[download]')].some(a => a.getAttribute('href') === portfolioContent.resume && a.target === '_blank')`), `${label}: résumé download uses content.js path and opens in a new tab`);
    assert.ok(await b.evaluate(`!!document.querySelector('.pp-fig svg.cc') && !document.querySelector('#ppRoot img')`), `${label}: Figure 1 is the caricature, not the photo`);
    assert.ok(await b.evaluate(`document.querySelector('.pp-bar').offsetHeight <= innerHeight * 0.2`), `${label}: toolbar takes at most 20% of the screen`);
    // Typesetting never clips: no column holds more than it shows
    assert.ok(await b.evaluate(`[...document.querySelectorAll('.pp-col')].every(col => col.scrollHeight <= col.clientHeight + 1)`), `${label}: no column overflows its page`);
    await noOverflow('finished paper');
    await b.shot(`${out}-${label}-1-top.png`);

    // A citation scrolls to its reference and keeps the theme in the URL
    await b.evaluate(`document.querySelector('.pp-cite').click()`); await sleep(900);
    assert.ok(await b.evaluate(`location.hash === '#paper' && (r => r.top >= document.querySelector('.pp-bar').offsetHeight && r.bottom <= innerHeight)(document.querySelector(document.querySelector('.pp-cite').getAttribute('href')).getBoundingClientRect())`), `${label}: citation scrolls its reference into view, URL keeps #paper`);

    if (phone) {
        assert.ok(await b.evaluate(`PaperTheme.pages.length === 1 && getComputedStyle(document.querySelector('.pp-paged')).display === 'none'`), 'm: one flowing sheet, no page box or zoom');
        assert.ok(await b.evaluate(`[...document.querySelectorAll('.pp-bar .pp-btn')].filter(t => t.offsetParent).every(t => t.offsetWidth >= 44 && t.offsetHeight >= 44)`), 'm: 44px toolbar buttons');
        assert.ok(await b.evaluate(`parseFloat(getComputedStyle(document.querySelector('.pp-col p')).fontSize) >= 15`), 'm: body text at least 15px');
    } else {
        // Pages: two fixed-height columns per Letter page; the page box follows the scroll and jumps on Enter
        const pages = await b.evaluate(`PaperTheme.pages.length`);
        assert.ok(pages >= 2 && await b.evaluate(`document.querySelectorAll('.pp-page:first-child .pp-col').length === 2 && document.getElementById('ppCount').textContent === '${pages}'`), `desk: ${pages} two-column pages, counted in the toolbar`);
        await b.evaluate(`const i = document.getElementById('ppPageIn'); i.value = '2'; i.dispatchEvent(new Event('change'))`); await sleep(900);
        assert.ok(await b.evaluate(`Math.abs(PaperTheme.pages[1].getBoundingClientRect().top - document.querySelector('.pp-bar').offsetHeight) < 30 && document.getElementById('ppPageIn').value === '2'`), 'desk: page box jumps to page 2');
        await b.shot(`${out}-${label}-2-page2.png`);
        // Zoom: −/+ step through Chrome's zoom levels
        const z0 = await b.evaluate(`PaperTheme.zoom`);
        await b.evaluate(`document.querySelector('[data-action="zoomOut"]').click()`);
        assert.ok(await b.evaluate(`PaperTheme.zoom < ${z0} && document.getElementById('ppZoom').textContent === Math.round(PaperTheme.zoom * 100) + '%' && +document.getElementById('ppPages').style.zoom === PaperTheme.zoom`), 'desk: zoom out');
        for (let i = 0; i < 8; i++) await b.evaluate(`document.querySelector('[data-action="zoomIn"]').click()`);
        assert.equal(await b.evaluate(`document.getElementById('ppZoom').textContent`), '200%', 'desk: zoom in stops at 200%');
        await noOverflow('200% zoom');
        await b.evaluate(`PaperTheme.zoomed = false; PaperTheme.fit()`);
    }

    // Outline: open (pushes the pages aside on wide screens, slides over them on phones), jump to a section
    if (await b.evaluate(`!document.getElementById('ppRoot').classList.contains('side-open')`)) await b.evaluate(`document.querySelector('.pp-bar [data-action="side"]').click()`);
    await sleep(300);
    assert.ok(await b.evaluate(`document.getElementById('ppSide').getBoundingClientRect().left === 0 && document.querySelector('.pp-bar [data-action="side"]').getAttribute('aria-expanded') === 'true'`), `${label}: outline opens`);
    await b.shot(`${out}-${label}-3-outline.png`);
    await b.evaluate(`document.querySelector('#ppSide [data-ol="pp-s3"]').click()`); await sleep(900);
    assert.ok(await b.evaluate(`document.querySelector('#ppSide [data-ol="pp-s3"]').hasAttribute('aria-current') && Math.abs(document.getElementById('pp-s3').getBoundingClientRect().top - document.querySelector('.pp-bar').offsetHeight) < 40`), `${label}: outline jumps to Projects and marks it`);
    // Regression: after jumping to Education and scrolling a little, a later right-column heading (References) must not take over
    if (await b.evaluate(`!document.getElementById('ppRoot').classList.contains('side-open')`)) await b.evaluate(`document.querySelector('.pp-bar [data-action="side"]').click()`);
    await sleep(300);
    await b.evaluate(`document.querySelector('#ppSide [data-ol="pp-s5"]').click()`); await sleep(900);
    const marked = () => b.evaluate(`document.querySelector('#ppSide [aria-current]').dataset.ol`);
    assert.equal(await marked(), 'pp-s5', `${label}: outline marks Education after the jump`);
    await b.evaluate(`scrollBy(0, 150)`); await sleep(200);
    assert.equal(await marked(), 'pp-s5', `${label}: Education stays marked while its heading is on screen`);
    await b.evaluate(`PaperTheme.pin = null; PaperTheme.sync()`);
    assert.ok(['pp-s5', 'pp-patents', 'pp-certs'].includes(await marked()), `${label}: scrolling within Education follows reading order, not a higher right-column heading`);
    await b.evaluate(`document.querySelector('#ppSide [data-ol="pp-s3"]').click()`); await sleep(900);

    if (phone) {
        assert.ok(await b.evaluate(`!document.getElementById('ppRoot').classList.contains('side-open')`), 'm: outline closes after a jump');
        await b.evaluate(`document.querySelector('.pp-bar [data-action="side"]').click()`); await sleep(300);
        await b.key('Escape'); await sleep(300);
        assert.ok(await b.evaluate(`!document.getElementById('ppRoot').classList.contains('side-open')`), 'm: Escape closes the outline');
    } else {
        await b.evaluate(`document.querySelector('.pp-bar [data-action="side"]').click()`); await sleep(300);
        assert.ok(await b.evaluate(`!document.getElementById('ppRoot').classList.contains('side-open') && PaperTheme.zoom > 1`), 'desk: closing the outline refits the page');
    }
    await noOverflow('outline');
    assert.ok(await b.evaluate(cornerClear), `${label}: switcher corner clear at the end of the paper`);
    await b.shot(`${out}-${label}-4-end.png`);

    await b.evaluate(`portfolioController.loadTheme('notebook')`); await sleep(300);
    assert.ok(await b.evaluate(`PaperTheme.onScroll === null && PaperTheme.onResize === null && PaperTheme.onKey === null && PaperTheme.onSkip === null`), `${label}: cleanup removes the listeners`);
    assert.deepEqual(b.errors.filter(e => e.includes('paper.js')), [], `${label}: no runtime errors`);
    b.close();
}
console.log('all paper checks passed');
