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
    assert.equal(await b.evaluate(`document.querySelectorAll('[aria-label="Training Details"] .mc-bar').length`), c.experience.length, `${label}: one schedule bar per role`);
    // Show N more: extras join the same list, button follows as "Show less"
    await b.evaluate(`document.querySelector('.mc-more').click()`);
    assert.ok(await b.evaluate(`(() => { const btn = document.querySelector('.mc-more'), ul = btn.previousElementSibling;
        return btn.textContent.trim() === 'Show less' && [...ul.children].every(li => !li.hidden) && ul.lastElementChild.getBoundingClientRect().bottom <= btn.getBoundingClientRect().top; })()`), `${label}: show more expands in place, button below`);
    await b.evaluate(`document.querySelector('.mc-more').click()`);
    assert.equal(await b.evaluate(`document.querySelector('.mc-more').textContent.trim()`), `Show ${c.experience[0].achievements.length - 3} more`, `${label}: show less collapses`);
    assert.equal(await b.evaluate(`(() => { const s = [...document.querySelectorAll('dl .mc-mono')].map(e => e.textContent.toLowerCase()); return s.length - new Set(s).size; })()`), 0, `${label}: each skill listed once`);
    assert.ok(await b.evaluate(`[...document.querySelectorAll('#mcRoot a[download]')].every(a => a.getAttribute('href') === portfolioContent.resume && a.target === '_blank')`), `${label}: résumé links use content.js path and open in a new tab`);
    assert.equal(await b.evaluate(`innerWidth + 'x' + document.documentElement.scrollWidth`), `${opts.width || 1440}x${opts.width || 1440}`, `${label}: no horizontal overflow`);
    await b.shot(`${out}-${label}-1-top.png`);
    await scrollEnd(b);
    assert.equal(await b.evaluate(`document.querySelectorAll('.mc-reveal:not(.is-in)').length`), 0, `${label}: every section revealed after scrolling`);
    assert.ok(await b.evaluate(cornerClear), `${label}: switcher corner clear at the bottom`);
    assert.ok(await b.evaluate(`document.querySelector('#mcCard aside').getBoundingClientRect().top >= 0`), `${label}: sidebar not pushed off the top at the end`);
    assert.ok(await b.evaluate(`document.documentElement.scrollHeight - Math.max(...[...document.querySelectorAll('#mcCard .mc-card, #mcCard a')].map(e => e.getBoundingClientRect().bottom + scrollY))`) <= 100, `${label}: no long blank run after the content`);
    await b.shot(`${out}-${label}-3-bottom.png`);
    await b.evaluate(`document.querySelector('[aria-label="Training Details"]').scrollIntoView()`); await sleep(1200);
    await b.shot(`${out}-${label}-2-training.png`);
    // Résumé tab: same page, rendered as HTML (no PDF viewer)
    await b.evaluate(`scrollTo(0, 0); document.getElementById('mcTabResume').click()`); await sleep(1500);
    assert.ok(await b.evaluate(`document.getElementById('mcCard').hidden && !document.getElementById('mcResume').hidden && location.hash === '#modelcard'`), `${label}: résumé tab switches in place`);
    assert.ok(await b.evaluate(`(() => { const t = document.getElementById('mcResume').innerText; return t.includes(portfolioContent.experience.at(-1).achievements.at(-1)) && t.includes(portfolioContent.education.at(-1).institution); })()`), `${label}: résumé page built from content.js`);
    assert.equal(await b.evaluate(`document.querySelectorAll('#mcResume object, #mcResume iframe, #mcResume embed').length`), 0, `${label}: no embedded PDF viewer`);
    assert.equal(await b.evaluate(`innerWidth + 'x' + document.documentElement.scrollWidth`), `${opts.width || 1440}x${opts.width || 1440}`, `${label}: résumé has no horizontal overflow`);
    await b.shot(`${out}-${label}-4-resume.png`);
    await b.evaluate(`document.getElementById('mcTabCard').click()`);
    assert.ok(await b.evaluate(`!document.getElementById('mcCard').hidden`), `${label}: back to model card`);
    await b.evaluate(`portfolioController.loadTheme('paper')`); await sleep(300);
    assert.equal(await b.evaluate(`ModelCardTheme.observer`), null, `${label}: cleanup disconnects the observer`);
    assert.deepEqual(b.errors.filter(e => e.includes('modelcard.js')), [], `${label}: no runtime errors`);
    b.close();
}
console.log('all modelcard checks passed');
