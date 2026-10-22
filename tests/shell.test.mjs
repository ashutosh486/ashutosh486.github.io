// Shell checks (theme switcher, chooser, persistence): node tests/shell.test.mjs [screenshot-dir]
import { openPage, sleep } from './cdp.mjs';
import assert from 'node:assert';
import { mkdirSync } from 'node:fs';
const shots = process.argv[2] || 'tests/screenshots';
mkdirSync(shots, { recursive: true });
const out = `${shots}/shell`;

const state = b => b.evaluate(`JSON.stringify({
    theme: portfolioController.currentTheme,
    hash: location.hash,
    open: document.getElementById('themeChooser').open,
    current: document.querySelector('#themeChooserList [aria-current="true"]')?.dataset.theme,
    dock: (r => [Math.round(innerWidth - r.right), Math.round(innerHeight - r.bottom)])(document.getElementById('themeDock').getBoundingClientRect()),
    panelFocused: document.activeElement?.classList.contains('chooser-panel'),
    title: document.title,
    focus: document.activeElement?.id || document.activeElement?.dataset?.theme
})`).then(JSON.parse);
const click = async (b, x, y) => {
    for (const type of ['mousePressed', 'mouseReleased']) await b.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
};

// Desktop: first visit asks, with the current theme preselected and focused
let b = await openPage();
let s = await state(b);
assert.equal(s.open, true, 'chooser asks on first visit');
assert.equal(s.current, s.theme, 'current theme preselected');
assert.equal(s.panelFocused, true, 'focus starts on the window, not a card (no double box)');
assert.equal(await b.evaluate(`document.getElementById('themeChooserResume').getAttribute('href')`), await b.evaluate('portfolioContent.resume'), 'chooser offers the résumé from content.js');
assert.ok(await b.evaluate(`(l => l.hasAttribute('download') && l.target === '_blank')(document.getElementById('themeChooserResume'))`), 'résumé link downloads, or opens in a new tab where download is blocked');
assert.equal(s.title, `${await b.evaluate('portfolioContent.name')} · ${await b.evaluate('ChatGPTTheme.name')}`, 'title reflects theme');
await b.shot(`${out}-1-chooser.png`);

// Escape collapses into the switcher, bottom-right like every theme
await b.key('Escape'); await sleep(400);
s = await state(b);
assert.equal(s.open, false, 'Escape collapses');
assert.equal(s.focus, 'themeDock', 'focus returns to the switcher');
assert.deepEqual(s.dock, [16, 16], 'switcher sits bottom-right');
await b.shot(`${out}-2-docked.png`);

// Reopen and pick a theme without a slot
await b.evaluate(`document.getElementById('themeDock').click()`); await sleep(400);
assert.equal((await state(b)).open, true, 'switcher reopens chooser');
await b.evaluate(`document.querySelector('[data-theme="paper"]').click()`); await sleep(900);
s = await state(b);
assert.deepEqual([s.theme, s.hash, s.open, s.dock], ['paper', '#paper', false, [16, 16]], 'pick switches theme, updates URL, switcher stays bottom-right');
await b.shot(`${out}-3-paper.png`);

// Refresh keeps the theme and asks again with it preselected
await b.send('Page.reload'); await sleep(2500);
s = await state(b);
assert.deepEqual([s.theme, s.open, s.current], ['paper', true, 'paper'], 'refresh keeps theme and asks');

// Backdrop click collapses
await click(b, 8, 8); await sleep(400);
assert.equal((await state(b)).open, false, 'backdrop click collapses');

// Back returns to the previous theme
await b.evaluate(`document.getElementById('themeDock').click()`); await sleep(400);
await b.evaluate(`document.querySelector('[data-theme="terminal"]').click()`); await sleep(900);
assert.equal((await state(b)).theme, 'terminal', 'switched to terminal');
await b.evaluate('history.back()'); await sleep(900);
assert.equal((await state(b)).theme, 'paper', 'Back returns to previous theme');
assert.deepEqual(b.errors.filter(e => /main\.js|chatgpt\.js/.test(e)), [], 'no shell errors');
b.close();

// The switcher never covers ChatGPT's composer, at any width
const overlaps = `(() => { const a = document.getElementById('themeDock').getBoundingClientRect(), f = document.getElementById('cgForm').getBoundingClientRect();
    return a.left < f.right && f.left < a.right && a.top < f.bottom && f.top < a.bottom; })()`;
for (const [width, height, mobile] of [[1440, 900, false], [1100, 800, false], [1024, 768, false], [390, 844, true]]) {
    b = await openPage('chatgpt', { width, height, mobile });
    await b.evaluate(`document.getElementById('themeChooser').close()`); await sleep(300);
    assert.equal(await b.evaluate(overlaps), false, `switcher clear of composer at ${width}px`);
    if (!mobile) {
        await b.evaluate(`document.getElementById('cgClose').click()`); await sleep(400);
        assert.equal(await b.evaluate(overlaps), false, `switcher clear of composer at ${width}px with rail`);
    }
    b.close();
}

// Phone: bottom sheet, 44px targets, no sideways scroll
b = await openPage('', { width: 390, height: 844, mobile: true });
assert.equal(await b.evaluate(`innerWidth + 'x' + document.documentElement.scrollWidth`), '390x390', 'no horizontal overflow');
const sheet = JSON.parse(await b.evaluate(`JSON.stringify(document.querySelector('.chooser-panel').getBoundingClientRect())`));
assert.ok(Math.abs(sheet.bottom - 844) < 2 && Math.abs(sheet.width - 390) < 2, 'chooser is a full-width bottom sheet');
await b.shot(`${out}-4-m-sheet.png`);
await b.evaluate(`document.querySelector('.chooser-primary').click()`); await sleep(400);
const dock = JSON.parse(await b.evaluate(`JSON.stringify(document.getElementById('themeDock').getBoundingClientRect())`));
assert.ok(dock.width >= 44 && dock.height >= 44, 'switcher is at least 44px on phones');
await b.shot(`${out}-5-m-docked.png`);
await b.evaluate(`document.getElementById('themeDock').click()`); await sleep(400);
await b.evaluate(`document.querySelector('[data-theme="apple"]').click()`); await sleep(900);
await b.shot(`${out}-6-m-floating.png`);
assert.deepEqual(b.errors.filter(e => /main\.js|chatgpt\.js/.test(e)), [], 'no shell errors (phone)');
b.close();
console.log('all shell checks passed');
