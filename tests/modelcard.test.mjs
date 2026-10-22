// Model Card theme checks: node tests/modelcard.test.mjs [screenshot-dir]
import { openTheme, sleep } from './cdp.mjs';
import assert from 'node:assert';
import { mkdirSync } from 'node:fs';
const shots = process.argv[2] || 'tests/screenshots';
mkdirSync(shots, { recursive: true });
const out = `${shots}/modelcard`;
const scrollEnd = async b => { await b.evaluate(`(async () => { for (let y = 0; y <= document.documentElement.scrollHeight; y += 400) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } })()`); await sleep(1200); };
// Nothing on the page may sit under the theme switcher once scrolled to the bottom
const cornerClear = `(() => { const d = document.getElementById('themeDock').getBoundingClientRect();
    return [...document.querySelectorAll('#mcRoot p, #mcRoot a, #mcRoot li, #mcRoot span, #mcRoot button')].every(el => { const r = el.getBoundingClientRect();
        return !r.width || r.bottom <= d.top || r.top >= d.bottom || r.right <= d.left || r.left >= d.right; }); })()`;

for (const [label, opts] of [['desk', {}], ['m', { width: 390, height: 844, mobile: true }]]) {
    const b = await openTheme('modelcard', opts);
    const c = await b.evaluate('JSON.stringify(portfolioContent)').then(JSON.parse);
    const text = await b.evaluate(`document.getElementById('mcRoot').innerText`);
    for (const fact of [c.name, c.about.bio.slice(0, 60), c.experience[0].achievements[0], c.education[0].degree, c.patents[0].number, c.impact[0].value])
        assert.ok(text.includes(fact), `${label}: shows "${fact.slice(0, 30)}" from content.js`);
    assert.ok(text.includes(`${c.stats.years} years`), `${label}: years from stats`);
    assert.equal(await b.evaluate(`document.querySelectorAll('.mc-bar').length`), c.experience.length, `${label}: one schedule bar per role`);
    assert.equal(await b.evaluate(`(() => { const s = [...document.querySelectorAll('dl .mc-mono')].map(e => e.textContent.toLowerCase()); return s.length - new Set(s).size; })()`), 0, `${label}: each skill listed once`);
    assert.ok(await b.evaluate(`[...document.querySelectorAll('#mcRoot a[download]')].every(a => a.getAttribute('href') === portfolioContent.resume && a.target === '_blank')`), `${label}: résumé links use content.js path and open in a new tab`);
    assert.equal(await b.evaluate(`innerWidth + 'x' + document.documentElement.scrollWidth`), `${opts.width || 1440}x${opts.width || 1440}`, `${label}: no horizontal overflow`);
    await b.shot(`${out}-${label}-1-top.png`);
    await scrollEnd(b);
    assert.equal(await b.evaluate(`document.querySelectorAll('.mc-reveal:not(.is-in)').length`), 0, `${label}: every section revealed after scrolling`);
    assert.ok(await b.evaluate(cornerClear), `${label}: switcher corner clear at the bottom`);
    await b.shot(`${out}-${label}-3-bottom.png`);
    await b.evaluate(`document.querySelector('[aria-label="Training Details"]').scrollIntoView()`); await sleep(1200);
    await b.shot(`${out}-${label}-2-training.png`);
    await b.evaluate(`portfolioController.loadTheme('paper')`); await sleep(300);
    assert.equal(await b.evaluate(`ModelCardTheme.observer`), null, `${label}: cleanup disconnects the observer`);
    assert.deepEqual(b.errors.filter(e => e.includes('modelcard.js')), [], `${label}: no runtime errors`);
    b.close();
}
console.log('all modelcard checks passed');
