// Notebook theme checks: node tests/notebook.test.mjs [screenshot-dir]
import { openPage, sleep } from './cdp.mjs';
import assert from 'node:assert';
import { mkdirSync } from 'node:fs';
const shots = process.argv[2] || 'tests/screenshots';
mkdirSync(shots, { recursive: true });
const out = `${shots}/notebook`;
const page = `document.getElementById('nbCells').innerText`;
const prompts = `[...document.querySelectorAll('#nbCells .nb-row:first-child > .nb-prompt')].map(p => p.textContent).filter(Boolean).join(' ')`;
const key = (k, mods = '') => `document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: '${k}', ${mods} bubbles: true, cancelable: true }))`;
const idle = async b => { for (let i = 0; i < 60 && !(await b.evaluate(`!NotebookTheme.draining`)); i++) await sleep(100); };
// Nothing may sit under the theme switcher once the page is scrolled to the end
const cornerClear = `(() => { scrollTo(0, document.documentElement.scrollHeight);
    const d = document.getElementById('themeDock').getBoundingClientRect();
    return [...document.querySelectorAll('#nbCells .nb-editor, #nbCells .nb-out-body > *, #nbCells .nb-rendered > *')].every(el => { const r = el.getBoundingClientRect();
        return !r.width || r.bottom <= d.top || r.top >= d.bottom || r.right <= d.left || r.left >= d.right; }); })()`;

for (const [label, opts] of [['desk', {}], ['m', { width: 390, height: 844, mobile: true }]]) {
    const phone = label === 'm';
    const b = await openPage('notebook', opts);
    const c = await b.evaluate('JSON.stringify(portfolioContent)').then(JSON.parse);
    const codeCells = await b.evaluate(`NotebookTheme.codeCells().length`);
    const noOverflow = async what => assert.equal(await b.evaluate(`innerWidth + 'x' + document.documentElement.scrollWidth`), `${opts.width || 1440}x${opts.width || 1440}`, `${label}: no horizontal overflow (${what})`);

    // Nothing runs behind the theme chooser; closing it types the first cell, then runs every cell in order
    assert.ok(await b.evaluate(`document.getElementById('themeChooser').open && !document.querySelector('#nbCells .nb-out:not([hidden])') && document.querySelector('#nbCells code').textContent === ''`), `${label}: nothing runs behind the chooser`);
    await b.evaluate(`document.getElementById('themeChooser').close()`); await sleep(900);
    assert.ok(await b.evaluate(`document.querySelector('.nb-cell.is-editing code').textContent.length > 0`), `${label}: first cell types itself in edit mode`);
    await b.shot(`${out}-${label}-0-typing.png`);
    for (let i = 0; i < 40 && !(await b.evaluate(`document.getElementById('nbKernel').classList.contains('is-busy')`)); i++) await sleep(100);
    assert.ok((await b.evaluate(prompts)).includes('[*]:'), `${label}: queued cells show [*] while the kernel is busy`);
    await idle(b);
    assert.equal(await b.evaluate(prompts), Array.from({ length: codeCells }, (_, i) => `[${i + 1}]:`).join(' '), `${label}: run all numbers the cells in order`);
    assert.ok(await b.evaluate(`!document.getElementById('nbKernel').classList.contains('is-busy')`), `${label}: kernel is idle after the run`);

    // A key press skips the opening straight to the finished notebook
    await b.evaluate(`portfolioController.loadTheme('paper', { animate: false }); portfolioController.loadTheme('notebook', { animate: false })`); await sleep(500);
    await b.evaluate(`dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }))`); await sleep(200);
    assert.equal(await b.evaluate(`document.querySelectorAll('#nbCells .nb-out:not([hidden])').length`), codeCells, `${label}: a key press skips to the finished run`);

    // Every fact comes from content.js
    const text = await b.evaluate(page);
    for (const fact of [c.name, c.title, c.about.bio.slice(0, 60), `${c.stats.years} years`, c.impact[0].value, c.education[0].degree, c.patents[0].number, c.certifications[0].title, c.email,
        ...c.experience.map(e => e.achievements.at(-1)), ...c.projects.map(p => p.title), ...c.currentlyReading.map(r => r.title)])
        assert.ok(text.includes(fact), `${label}: notebook shows "${fact.slice(0, 40)}" from content.js`);
    const skills = await b.evaluate(`document.querySelectorAll('#nbCells .nb-stream')[0].textContent`);
    const listed = skills.split('\n').flatMap(l => l.trim().split(/\s{2,}/)[1].split(', ')).map(s => s.toLowerCase());
    assert.equal(listed.length, new Set(listed).size, `${label}: each skill listed once`);
    assert.equal(listed.length, c.stats.skills, `${label}: every skill listed`);
    assert.ok(await b.evaluate(`[...document.querySelectorAll('#nbCells a[download]')].some(a => a.getAttribute('href') === portfolioContent.resume && a.target === '_blank')`), `${label}: résumé link uses content.js path and opens in a new tab`);
    assert.ok(await b.evaluate(`!!document.querySelector('.nb-profile svg.cc') && !document.querySelector('#nbCells img')`), `${label}: profile shows the caricature, not the photo`);
    // The sticky header stays small
    assert.ok(await b.evaluate(`document.querySelector('.nb-head').offsetHeight <= innerHeight * 0.2`), `${label}: header takes at most 20% of the screen`);
    if (phone) assert.ok(await b.evaluate(`[...document.querySelectorAll('.nb-tool')].every(t => t.offsetWidth >= 44 && t.offsetHeight >= 44)`), 'm: 44px toolbar buttons');
    await noOverflow('finished run');
    await b.shot(`${out}-${label}-1-top.png`);

    // Command mode: click selects, ↓ moves, Shift+Enter runs and advances, Ctrl+Enter runs in place
    await b.evaluate(`document.querySelectorAll('#nbCells .nb-cell')[1].click(); document.querySelectorAll('#nbCells .nb-cell')[1].focus()`);
    assert.equal(await b.evaluate(`document.querySelector('.nb-cell.is-active').dataset.i`), '1', `${label}: clicking a cell selects it`);
    await b.evaluate(key('ArrowDown')); await b.evaluate(key('ArrowDown'));
    assert.equal(await b.evaluate(`document.querySelector('.nb-cell.is-active').dataset.i`), '3', `${label}: ↓ moves the selection`);
    await b.evaluate(key('Enter', 'shiftKey: true,')); await idle(b);
    assert.equal(await b.evaluate(`document.querySelector('.nb-cell[data-i="3"] .nb-prompt').textContent + document.querySelector('.nb-cell[data-i="3"] .nb-prompt-out').textContent + document.querySelector('.nb-cell.is-active').dataset.i`),
        `[${codeCells + 1}]:[${codeCells + 1}]:4`, `${label}: Shift+Enter runs the cell with the next count and selects the next cell`);
    await b.evaluate(key('ArrowUp')); await b.evaluate(key('Enter', 'ctrlKey: true,')); await idle(b);
    assert.equal(await b.evaluate(`document.querySelector('.nb-cell[data-i="3"] .nb-prompt').textContent + document.querySelector('.nb-cell.is-active').dataset.i`), `[${codeCells + 2}]:3`, `${label}: Ctrl+Enter runs in place`);

    // Toolbar: restart & run all renumbers from 1; interrupt stops the queue and resets queued prompts
    await b.evaluate(`document.querySelector('[data-action="restart"]').click()`); await sleep(700);
    await b.evaluate(`document.querySelector('[data-action="interrupt"]').click()`);
    const stopped = await b.evaluate(prompts);
    assert.ok(stopped.startsWith('[1]:') && !stopped.includes('[*]') && !(await b.evaluate(`document.getElementById('nbKernel').classList.contains('is-busy')`)), `${label}: interrupt stops the run (${stopped})`);
    await b.evaluate(`document.querySelector('[data-action="restart"]').click()`); await idle(b);
    assert.equal(await b.evaluate(prompts), Array.from({ length: codeCells }, (_, i) => `[${i + 1}]:`).join(' '), `${label}: restart & run all renumbers from 1`);
    await b.evaluate(`scrollTo(0, document.querySelector('.nb-df').getBoundingClientRect().top + scrollY - 200)`); await sleep(200);
    await b.shot(`${out}-${label}-2-tables.png`);
    await noOverflow('tables');
    assert.ok(await b.evaluate(cornerClear), `${label}: switcher corner clear at the end of the notebook`);
    await b.shot(`${out}-${label}-3-end.png`);

    await b.evaluate(`portfolioController.loadTheme('paper')`); await sleep(300);
    assert.ok(await b.evaluate(`NotebookTheme.onKey === null && NotebookTheme.onSkip === null`), `${label}: cleanup removes the key listeners`);
    assert.deepEqual(b.errors.filter(e => e.includes('notebook.js')), [], `${label}: no runtime errors`);
    b.close();
}
console.log('all notebook checks passed');
