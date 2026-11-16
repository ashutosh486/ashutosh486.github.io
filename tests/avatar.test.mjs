// Caricature moments and the soul lift: node tests/avatar.test.mjs [screenshot-dir]
import { openTheme, sleep } from './cdp.mjs';
import assert from 'node:assert';
import { mkdirSync } from 'node:fs';
const shots = process.argv[2] || 'tests/screenshots';
mkdirSync(shots, { recursive: true });

// The element that scrolls the caricature (themes scroll the page or an inner panel)
const scroller = `(() => { let el = document.querySelector('#themeContainer svg.cc'); while ((el = el.parentElement)) { const o = getComputedStyle(el).overflowY; if (/(auto|scroll)/.test(o) && el.scrollHeight > el.clientHeight) return el; } return document.scrollingElement; })()`;
const lift = b => b.evaluate(`JSON.stringify((l => l && { on: l.classList.contains('is-on'), y: parseFloat(l.style.getPropertyValue('--y')), spin: l.style.getPropertyValue('--spin') })(document.querySelector('.lift')))`).then(JSON.parse);

for (const theme of ['apple', 'paper', 'book', 'notebook', 'scifi', 'terminal']) {
    const b = await openTheme(theme, { width: 1280, height: 720 });
    await b.evaluate(`document.dispatchEvent(new KeyboardEvent('keydown'))`); // finish the opening
    await sleep(theme === 'terminal' || theme === 'notebook' ? 6000 : 3500);
    if (theme === 'terminal') { // grow the output so the boot header can scroll away
        for (let i = 0; i < 6; i++) await b.evaluate(`(i => { i.value = 'help'; i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); })(document.getElementById('tmInput'))`);
        await sleep(800);
    }
    const canScroll = await b.evaluate(`(s => s.scrollHeight - s.clientHeight)(${scroller})`);
    if (canScroll < 200) { console.log(`${theme}: caricature panel doesn't scroll far enough (${canScroll}px), skipped`); b.close(); continue; }
    await b.evaluate(`(s => s.scrollTop = s.scrollHeight)(${scroller})`); await sleep(1100);
    if (await b.evaluate(`document.querySelector('#themeContainer svg.cc').getBoundingClientRect().bottom > 0`)) {
        console.log(`${theme}: caricature never leaves the screen at this size, skipped`); b.close(); continue;
    }
    const down = await lift(b);
    assert.ok(down?.on, `${theme}: lift appears once the caricature is scrolled away`);
    assert.ok(down.y > 200, `${theme}: basket rides down with the scroll`);
    assert.notEqual(down.spin, '0deg', `${theme}: pulley turned`);
    await b.shot(`${shots}/avatar-lift-${theme}.png`);
    await b.evaluate(`(s => s.scrollTop = 0)(${scroller})`); await sleep(1100);
    assert.equal((await lift(b)).on, false, `${theme}: soul climbs back when the caricature returns`);
    assert.deepEqual(b.errors, [], `${theme}: no errors`);
    b.close();
    console.log(`${theme}: lift ok`);
}

// Themes and pages without the caricature on screen keep the soul in the basket from the start
for (const theme of ['chatgpt', 'modelcard', 'vscode']) {
    const b = await openTheme(theme, { width: 1280, height: 720 });
    await sleep(800);
    assert.equal((await lift(b))?.on, true, `${theme}: soul rides the lift (no caricature in this theme)`);
    await b.shot(`${shots}/avatar-lift-${theme}.png`);
    b.close();
}
{
    const b = await openTheme('book', { width: 1280, height: 720 });
    await sleep(800);
    await b.evaluate(`[...document.querySelectorAll('a, button')].find(el => /Projects/.test(el.textContent))?.click()`); await sleep(1200);
    assert.ok(await b.evaluate(`!document.querySelector('#themeContainer svg.cc') || document.querySelector('#themeContainer svg.cc').getBoundingClientRect().bottom < 0`), 'book: projects chapter has no caricature in view');
    assert.equal((await lift(b)).on, true, 'book: soul rides the lift on chapters without the caricature');
    // Space scrolls the page, and the basket follows
    const before = (await lift(b)).y;
    await b.evaluate(`document.activeElement?.blur()`);
    for (const type of ['keyDown', 'keyUp']) await b.send('Input.dispatchKeyEvent', { type, key: ' ', code: 'Space', windowsVirtualKeyCode: 32, ...(type === 'keyDown' ? { text: ' ' } : {}) });
    await sleep(1200);
    assert.ok((await lift(b)).y > before, 'book: Space scrolls and the basket follows');
    await b.shot(`${shots}/avatar-lift-book-projects.png`);
    b.close();
}

// Moments: idle sleep and waking, wave on click, dizzy on a shake, confetti on a résumé download
const b = await openTheme('apple', { width: 1280, height: 720 });
await sleep(3000);
const has = c => b.evaluate(`document.querySelector('#themeContainer svg.cc').classList.contains('${c}')`);
await b.evaluate(`caricatureFx.lastActive = Date.now() - 60000`); await sleep(1300);
assert.ok(await has('cc--asleep'), 'falls asleep when the visitor is idle');
await b.shot(`${shots}/avatar-asleep.png`);
await b.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 600, y: 300 }); await sleep(150);
assert.ok(!(await has('cc--asleep')) && await has('cc--startle'), 'wakes with a start');
await sleep(1000);
const r = JSON.parse(await b.evaluate(`JSON.stringify(document.querySelector('#themeContainer svg.cc').getBoundingClientRect())`));
for (const type of ['mousePressed', 'mouseReleased']) await b.send('Input.dispatchMouseEvent', { type, x: r.x + r.width / 2, y: r.y + r.height / 3, button: 'left', clickCount: 1 });
await sleep(100);
assert.ok(await has('cc--hi'), 'says hi when clicked');
await sleep(2000);
for (let i = 0; i < 14; i++) await b.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: i % 2 ? 1100 : 200, y: 300 + (i % 3) * 20 });
await sleep(100);
assert.ok(await has('cc--dizzy'), 'gets dizzy when the pointer whips around');
await sleep(2800);
await b.evaluate(`(a => { a.href = 'docs/Ashutosh_Pandey_Resume.pdf'; a.addEventListener('click', e => e.preventDefault()); document.body.append(a); a.click(); })(document.createElement('a'))`);
await sleep(100);
assert.ok(await has('cc--party'), 'cheers a résumé download');
assert.deepEqual(b.errors, [], 'no errors');
b.close();
console.log('all avatar checks passed');
