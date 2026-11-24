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
await b.reload();
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

// "Don't show again": the next visit skips the chooser (the switcher still opens it, ticked); unticking asks again
b = await openPage('paper');
assert.equal(await b.evaluate(`document.getElementById('themeChooserSkip').checked`), false, "don't show starts unticked");
await b.evaluate(`document.getElementById('themeChooserSkip').click()`);
await b.reload();
assert.equal((await state(b)).open, false, "don't show again skips the chooser on the next visit");
await sleep(4000); // Paper's opening runs about 3s
assert.ok(await b.evaluate(`!PaperTheme.onSkip && !document.getElementById('ppRoot').classList.contains('is-waiting')`), 'the opening plays without the chooser');
await b.evaluate(`document.getElementById('themeDock').click()`); await sleep(400);
assert.ok(await b.evaluate(`document.getElementById('themeChooser').open && document.getElementById('themeChooserSkip').checked`), 'switcher still opens it, ticked');
await b.evaluate(`document.getElementById('themeChooserSkip').click()`);
await b.reload();
assert.equal((await state(b)).open, true, 'unticking asks again');
b.close();

// Openings added to ChatGPT, Model Card and VS Code (playOpening): held while the chooser is open, play once it closes,
// a key press finishes them
const anims = b => b.evaluate(`JSON.stringify(document.getAnimations().filter(a => a.constructor === Animation && a.effect?.getTiming().fill === 'backwards').map(a => a.playState))`).then(JSON.parse);
for (const key of ['chatgpt', 'modelcard', 'vscode']) {
    b = await openPage(key);
    const held = await anims(b);
    assert.ok(held.length > 10 && held.every(p => p === 'paused'), `${key}: opening held behind the chooser`);
    await b.key('Escape'); await sleep(600);
    assert.ok((await anims(b)).includes('running'), `${key}: opening plays after the chooser closes`);
    await b.key('a'); await sleep(50);
    assert.ok((await anims(b)).every(p => p === 'finished'), `${key}: a key press finishes the opening`);
    assert.deepEqual(b.errors, [], `${key}: no errors`);
    b.close();
}

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
const check = JSON.parse(await b.evaluate(`JSON.stringify(document.querySelector('.chooser-check').getBoundingClientRect())`));
assert.ok(check.height >= 44 && check.right <= 390, "don't show again fits the sheet with a 44px target");
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
// Random: rolls over the cards, then opens a different theme
b = await openPage('paper');
await b.evaluate(`document.getElementById('themeChooserRandom').click()`); await sleep(250);
assert.equal(await b.evaluate(`document.querySelectorAll('.chooser-item.is-rolling').length`), 1, 'one card lit while rolling');
await b.shot(`${out}-7-rolling.png`);
await sleep(1800);
s = await state(b);
assert.equal(s.open, false, 'random closes the chooser');
assert.notEqual(s.theme, 'paper', 'random picks a different theme');
assert.equal(s.hash, `#${s.theme}`, 'random pick is in the URL');
// Ticked, every refresh opens a different theme; unticked, a refresh keeps the theme
for (let i = 0; i < 3; i++) {
    const before = s.theme;
    await b.reload();
    s = await state(b);
    assert.notEqual(s.theme, before, 'random refresh opens a different theme');
    assert.equal(s.hash, `#${s.theme}`, 'random refresh is in the URL');
}
assert.equal(await b.evaluate(`document.getElementById('themeChooserRandom').checked`), true, 'random stays ticked');
await b.evaluate(`document.getElementById('themeChooserRandom').click()`);
await b.reload();
assert.equal((await state(b)).theme, s.theme, 'unticked, refresh keeps the theme');
await b.evaluate(`document.getElementById('themeChooser').close()`); await sleep(300);

// System cursors (arrow, hand on buttons); the theme-coloured ripple shows on click
assert.equal(await b.evaluate(`document.documentElement.dataset.theme`), s.theme, 'html carries the theme');
assert.equal(await b.evaluate(`getComputedStyle(document.body).cursor`), 'auto', 'system arrow');
assert.equal(await b.evaluate(`getComputedStyle(document.getElementById('themeDock')).cursor`), 'pointer', 'system hand on buttons');
await click(b, 300, 300);
assert.equal(await b.evaluate(`document.querySelectorAll('.cursor-ping').length`), 1, 'click ripple appears');
await sleep(700);
assert.equal(await b.evaluate(`document.querySelectorAll('.cursor-ping').length`), 0, 'click ripple cleans up');
b.close();

// Auto-continue: 5s untouched continues with the preselected theme; a key press keeps the chooser open
b = await openPage('paper');
await b.evaluate('portfolioController.startAutoContinue()'); await sleep(300);
assert.ok(await b.evaluate(`document.getElementById('themeChooserContinue').classList.contains('is-counting')`), 'countdown bar shows on Continue');
await sleep(5200);
s = await state(b);
assert.deepEqual([s.open, s.theme], [false, 'paper'], 'untouched for 5s continues with the current theme');
await b.evaluate(`document.getElementById('themeDock').click()`); await sleep(400);
await b.evaluate('portfolioController.startAutoContinue()'); await sleep(300);
await b.key('ArrowRight'); await sleep(5200);
assert.equal((await state(b)).open, true, 'a key press cancels auto-continue');
assert.equal(await b.evaluate(`document.getElementById('themeChooserContinue').classList.contains('is-counting')`), false, 'countdown bar goes once cancelled');
b.close();

// Caricature: the eyes follow the pointer
b = await openPage('apple');
await b.evaluate(`document.getElementById('themeChooser').close()`); await sleep(300);
const eyes = JSON.parse(await b.evaluate(`JSON.stringify(document.querySelector('svg.cc .cc-eye-white').getBoundingClientRect())`));
await b.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: eyes.x + 400, y: eyes.y + eyes.height / 2 }); await sleep(100);
assert.ok(await b.evaluate(`document.querySelector('svg.cc').classList.contains('cc--looking')`), 'caricature looks at the pointer');
// Pupils = paused reading pose + look offset; together they point right
assert.ok(await b.evaluate(`(svg => new DOMMatrixReadOnly(getComputedStyle(svg.querySelector('.cc-pupils')).transform).e + parseFloat(svg.querySelector('.cc-look').style.transform.slice(10)) > 2)(document.querySelector('svg.cc'))`), 'pupils turn right toward a pointer on the right');
b.close();
// Vote mode: a card click votes instead of switching; results appear on the cards right away (API stubbed: file:// origin)
for (const [width, height, mobile] of [[1440, 900, false], [390, 844, true]]) {
    b = await openPage('chatgpt', { width, height, mobile });
    await b.evaluate(`(() => {
        const counts = { chatgpt: 5, modelcard: 1, vscode: 2, terminal: 4, notebook: 0, paper: 1, book: 0, apple: 0, scifi: 2 };
        let mine = null;
        window.fetch = async (url, opts = {}) => {
            if (opts.method === 'POST') { const t = JSON.parse(opts.body).theme; if (mine !== t) { counts[t]++; if (mine) counts[mine]--; mine = t; } }
            return new Response(JSON.stringify({ counts, mine }));
        };
    })()`);
    await b.evaluate(`document.getElementById('themeChooserVote').click()`); await sleep(200);
    assert.equal(await b.evaluate(`document.getElementById('themeChooserList').classList.contains('has-results')`), false, 'results hidden before voting');
    await b.evaluate(`document.querySelector('[data-theme="terminal"]').click()`); await sleep(800);
    const v = JSON.parse(await b.evaluate(`JSON.stringify({
        theme: portfolioController.currentTheme, open: document.getElementById('themeChooser').open,
        results: document.getElementById('themeChooserList').classList.contains('has-results'),
        mine: document.querySelector('[data-theme="terminal"]').getAttribute('aria-pressed'),
        votes: document.querySelector('[data-theme="terminal"] .chooser-item-votes').textContent,
        leaders: [...document.querySelectorAll('.is-leader')].map(el => el.dataset.theme),
        hint: document.getElementById('themeChooserHint').textContent,
        overflow: document.documentElement.scrollWidth > innerWidth
    })`));
    assert.deepEqual([v.theme, v.open, v.results, v.mine], ['chatgpt', true, true, 'true'], 'vote keeps the theme and the chooser, shows results');
    assert.equal(v.votes, '31% · 5 votes', 'card shows share and count');
    assert.deepEqual(v.leaders.sort(), ['chatgpt', 'terminal'], 'tied leaders both crowned');
    assert.match(v.hint, /^You backed the winner: Terminal/, 'hint ranks the pick');
    assert.equal(v.overflow, false, 'no horizontal scroll');
    await b.shot(`${out}-vote-${width}.png`);
    await b.evaluate(`document.querySelector('[data-theme="paper"]').click()`); await sleep(300);
    assert.match(await b.evaluate(`document.getElementById('themeChooserHint').textContent`), /^Paper is #3 with 13%; ChatGPT leads/, 'changing the vote re-ranks');
    // Leaving vote mode restores normal picking
    await b.evaluate(`document.getElementById('themeChooserVote').click()`); await sleep(100);
    assert.equal(await b.evaluate(`document.getElementById('themeChooserTitle').textContent`), 'Choose a Theme');
    await b.evaluate(`document.querySelector('[data-theme="book"]').click()`); await sleep(900);
    assert.equal(await b.evaluate('portfolioController.currentTheme'), 'book', 'cards switch themes again');
    b.close();
}
console.log('all shell checks passed');
