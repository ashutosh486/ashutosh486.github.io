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
const menu = name => `[...document.querySelectorAll('.nb-menu-btn')].find(x => x.textContent === '${name}')`;
const pick = async (b, name, item) => {
    await b.evaluate(`${menu(name)}.click()`);
    await b.evaluate(`[...document.querySelectorAll('.nb-menu:not([hidden]) .nb-menu-item')].find(x => x.textContent.trim().startsWith(${JSON.stringify(item)})).click()`);
};
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
        ...c.experience.map(e => e.achievements.at(-1)), ...c.projects.map(p => p.title), c.projects[0].highlights[0], c.education.at(-1).achievements[0],
        ...c.currentlyReading.map(r => r.title), c.currentlyReading[0].notes, ...c.hobbies])
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

    // 0,0 restarts the kernel: the next run counts from 1 again
    for (const k of ['0', '0']) await b.evaluate(key(k));
    await b.evaluate(key('Enter', 'ctrlKey: true,')); await idle(b);
    assert.equal(await b.evaluate(`document.querySelector('.nb-cell[data-i="3"] .nb-prompt').textContent`), '[1]:', `${label}: 0,0 restarts the kernel`);

    // Menu bar: Notebook 7's menus, every item working
    assert.equal(await b.evaluate(`[...document.querySelectorAll('.nb-menu-btn')].map(x => x.textContent).join()`), 'File,Edit,View,Run,Kernel,Help', `${label}: menu bar`);
    for (const name of ['File', 'Edit', 'View', 'Run', 'Kernel', 'Help']) {
        await b.evaluate(`${menu(name)}.click()`);
        assert.ok(await b.evaluate(`(() => { const m = document.querySelector('.nb-menu:not([hidden])'), r = m.getBoundingClientRect();
            return document.querySelectorAll('.nb-menu:not([hidden])').length === 1 && r.left >= 0 && r.right <= innerWidth
                && [...m.querySelectorAll('.nb-menu-item')].every(i => i.offsetHeight >= ${phone ? 44 : 20}); })()`), `${label}: ${name} menu opens on screen${phone ? ' with 44px items' : ''}`);
        if (name === 'File') await b.shot(`${out}-${label}-4-menu.png`);
    }
    await b.evaluate(`document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))`);
    assert.ok(await b.evaluate(`!document.querySelector('.nb-menu:not([hidden])')`), `${label}: a click outside closes the menu`);
    // Keyboard: ↓ opens a menu on its first item, → moves to the next menu, Escape returns to its title
    await b.evaluate(`${menu('File')}.focus(); document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))`);
    assert.ok(await b.evaluate(`document.activeElement.matches('.nb-menu-item') && !${menu('File')}.nextElementSibling.hidden`), `${label}: ↓ opens the menu on its first item`);
    await b.evaluate(`document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))`);
    await b.evaluate(`document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
    assert.ok(await b.evaluate(`document.activeElement === ${menu('Edit')} && !document.querySelector('.nb-menu:not([hidden])')`), `${label}: → then Escape lands on the Edit title`);

    // File › Download: a real nbformat 4 notebook with the current outputs
    await b.evaluate(`HTMLAnchorElement.prototype.click = function () { window.dl = { name: this.download, href: this.href }; }`);
    await pick(b, 'File', 'Download');
    assert.equal(await b.evaluate(`window.dl.name`), `${c.name.replace(/\s+/g, '_')}.ipynb`, `${label}: File › Download saves the .ipynb`);
    const nb = JSON.parse(await b.evaluate(`fetch(window.dl.href).then(r => r.text())`));
    const code = nb.cells.filter(x => x.cell_type === 'code');
    assert.ok(nb.nbformat === 4 && nb.metadata.kernelspec.name === 'python3' && nb.cells.length === await b.evaluate(`NotebookTheme.cells.length`), `${label}: .ipynb is nbformat 4 with every cell`);
    assert.equal(code.map(x => x.execution_count).join(), await b.evaluate(`NotebookTheme.cells.filter(x => x.src).map(x => x.n ?? null).join()`), `${label}: .ipynb keeps the execution counts`);
    assert.ok(code.every(x => x.outputs.length) && !JSON.stringify(nb).includes('<svg'), `${label}: .ipynb has every output, without the page-styled caricature`);

    // Edit › Clear Outputs of All Cells, then Run › Run All Cells
    await pick(b, 'Edit', 'Clear Outputs of All Cells');
    assert.ok(await b.evaluate(`!document.querySelector('#nbCells .nb-out:not([hidden])') && !/[\\d*]/.test(${prompts})`), `${label}: Edit › Clear Outputs of All Cells empties outputs and counts`);
    await pick(b, 'Run', 'Run All Cells'); await idle(b);
    assert.equal(await b.evaluate(`document.querySelectorAll('#nbCells .nb-out:not([hidden])').length`), codeCells, `${label}: Run › Run All Cells`);
    // Run › Run Selected Cell and All Below, from the last code cell: only that one runs
    const lastCode = await b.evaluate(`NotebookTheme.codeCells().at(-1)`), before = await b.evaluate(prompts);
    await b.evaluate(`NotebookTheme.select(${lastCode})`);
    await pick(b, 'Run', 'Run Selected Cell and All Below'); await idle(b);
    assert.equal((await b.evaluate(prompts)).split(' ').filter((p, i) => p !== before.split(' ')[i]).length, 1, `${label}: Run › Run Selected Cell and All Below runs only the cells below`);

    // View: collapse code (··· placeholders, click one to expand), expand, line numbers
    await pick(b, 'View', 'Collapse All Code');
    assert.ok(await b.evaluate(`[...document.querySelectorAll('#nbCells .nb-editor')].every(e => !e.offsetHeight) && document.querySelector('.nb-in .nb-ph').offsetHeight > 0`), `${label}: View › Collapse All Code shows placeholders`);
    await b.evaluate(`document.querySelector('.nb-in .nb-ph').click()`);
    assert.equal(await b.evaluate(`[...document.querySelectorAll('#nbCells .nb-editor')].filter(e => e.offsetHeight).length`), 1, `${label}: clicking a placeholder expands that cell`);
    await pick(b, 'View', 'Expand All Code');
    await pick(b, 'View', 'Collapse All Outputs');
    assert.ok(await b.evaluate(`[...document.querySelectorAll('#nbCells .nb-out')].every(e => !e.offsetHeight)`), `${label}: View › Collapse All Outputs`);
    await pick(b, 'View', 'Expand All Outputs');
    await pick(b, 'View', 'Show Line Numbers');
    assert.ok(await b.evaluate(`document.getElementById('nbRoot').classList.contains('show-ln') && document.querySelector('[data-action="lineNumbers"]').getAttribute('aria-checked') === 'true'`), `${label}: View › Show Line Numbers is ticked`);
    await b.shot(`${out}-${label}-5-lines.png`);
    await b.evaluate(`document.querySelector('.nb-cell').focus()`);
    await b.evaluate(key('L', 'shiftKey: true,'));
    assert.ok(!(await b.evaluate(`document.getElementById('nbRoot').classList.contains('show-ln')`)), `${label}: Shift+L hides line numbers`);

    // Help › Keyboard Shortcuts (and H); Escape closes it
    await pick(b, 'Help', 'Keyboard Shortcuts');
    assert.ok(await b.evaluate(`document.getElementById('nbDialog').open && document.querySelectorAll('.nb-keys tr').length >= 8`), `${label}: Help › Keyboard Shortcuts`);
    await b.shot(`${out}-${label}-6-shortcuts.png`);
    await b.key('Escape'); await sleep(100);
    await b.evaluate(`document.querySelector('.nb-cell').focus()`);
    await b.evaluate(key('h'));
    assert.ok(await b.evaluate(`document.getElementById('nbDialog').open`), `${label}: H opens the shortcuts`);
    await b.key('Escape'); await sleep(100);
    assert.ok(!(await b.evaluate(`document.getElementById('nbDialog').open`)), `${label}: Escape closes the shortcuts`);
    await noOverflow('menus');

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
    assert.ok(await b.evaluate(`NotebookTheme.onKey === null && NotebookTheme.onSkip === null && NotebookTheme.onDown === null`), `${label}: cleanup removes the listeners`);
    assert.deepEqual(b.errors.filter(e => e.includes('notebook.js')), [], `${label}: no runtime errors`);
    b.close();
}
console.log('all notebook checks passed');
