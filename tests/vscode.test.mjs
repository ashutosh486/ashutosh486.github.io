// VS Code theme checks: node tests/vscode.test.mjs [screenshot-dir]
import { openTheme, sleep } from './cdp.mjs';
import assert from 'node:assert';
import { mkdirSync } from 'node:fs';
const shots = process.argv[2] || 'tests/screenshots';
mkdirSync(shots, { recursive: true });
const out = `${shots}/vscode`;
const click = sel => `document.querySelector(${JSON.stringify(sel)}).click()`;
const editor = `document.getElementById('vsEditor').innerText`;
const ctrl = k => `dispatchEvent(new KeyboardEvent('keydown', { key: '${k}', ctrlKey: true, bubbles: true }))`;
// Nothing may sit under the theme switcher once the editor is scrolled to the end
const cornerClear = `(() => { const ed = document.getElementById('vsEditor'); ed.scrollTop = ed.scrollHeight;
    const d = document.getElementById('themeDock').getBoundingClientRect();
    return [...document.querySelectorAll('#vsRoot .vs-src, #vsRoot .vs-md > *, #vsRoot .vs-status > span:not(:empty)')].every(el => { const r = el.getBoundingClientRect();
        return !r.width || r.bottom <= d.top || r.top >= d.bottom || r.right <= d.left || r.left >= d.right; }); })()`;

for (const [label, opts] of [['desk', {}], ['m', { width: 390, height: 844, mobile: true }]]) {
    const phone = label === 'm';
    const b = await openTheme('vscode', opts);
    const c = await b.evaluate('JSON.stringify(portfolioContent)').then(JSON.parse);
    const noOverflow = async what => assert.equal(await b.evaluate(`innerWidth + 'x' + document.documentElement.scrollWidth`), `${opts.width || 1440}x${opts.width || 1440}`, `${label}: no horizontal overflow (${what})`);

    // README from content.js
    const readme = await b.evaluate(editor);
    for (const fact of [c.name, c.about.bio.slice(0, 60), c.impact[0].value, c.email, `${c.stats.years} years`])
        assert.ok(readme.includes(fact), `${label}: README shows "${fact.slice(0, 30)}" from content.js`);
    assert.equal(await b.evaluate(`document.querySelectorAll('.vs-row[data-open^="projects/"]').length`), c.projects.length, `${label}: one file per project`);
    assert.ok(await b.evaluate(`[...document.querySelectorAll('#vsRoot a[download]')].every(a => a.getAttribute('href') === portfolioContent.resume && a.target === '_blank')`), `${label}: résumé link uses content.js path and opens in a new tab`);
    await noOverflow('README');
    if (phone) assert.ok(await b.evaluate(`getComputedStyle(document.getElementById('vsSide')).visibility === 'hidden'`), 'm: explorer starts closed');
    await b.shot(`${out}-${label}-1-readme.png`);

    // Explorer: opening a file adds a tab, activates it, highlights the row (and closes the drawer on phones)
    if (phone) {
        await b.evaluate(click('.vs-menu')); await sleep(400);
        assert.ok(await b.evaluate(`document.getElementById('vsSide').getBoundingClientRect().left === 0`), 'm: drawer slides in');
        assert.ok(await b.evaluate(`[...document.querySelectorAll('.vs-row, .vs-menu')].every(el => el.getBoundingClientRect().height >= 44)`), 'm: 44px explorer targets');
        await b.shot(`${out}-m-2-drawer.png`);
    }
    await b.evaluate(click('[data-open="skills.json"]')); await sleep(400);
    assert.equal(await b.evaluate(`document.querySelector('.vs-tab[aria-current] [data-open]').dataset.open`), 'skills.json', `${label}: clicked file is the active tab`);
    assert.equal(await b.evaluate(`document.querySelector('.vs-row[aria-current="true"]').dataset.open`), 'skills.json', `${label}: explorer highlights the open file`);
    if (phone) assert.ok(await b.evaluate(`!document.getElementById('vsRoot').classList.contains('side-open')`), 'm: drawer closes after picking a file');
    assert.equal(await b.evaluate(`(() => { const s = [...document.querySelectorAll('.vs-t-str')].map(e => e.textContent.toLowerCase()); return s.length - new Set(s).size; })()`), 0, `${label}: each skill listed once`);
    assert.ok(await b.evaluate(`!!JSON.parse([...document.querySelectorAll('#vsEditor .vs-src')].map(e => e.textContent).join(''))`), `${label}: skills.json is valid JSON`);
    await b.evaluate(`document.querySelector('.vs-line[data-line="3"]').click()`);
    assert.equal(await b.evaluate(`document.getElementById('vsLang').textContent + '|' + (getComputedStyle(document.getElementById('vsPos')).display === 'none' || document.getElementById('vsPos').textContent)`), phone ? 'JSON|true' : 'JSON|Ln 3, Col 1', `${label}: status bar follows file and line`);
    await noOverflow('skills.json');
    await b.shot(`${out}-${label}-3-json.png`);

    // education.yml: degree, patent and certificate links from content.js
    await b.evaluate(click('[data-open="education.yml"]')); await sleep(300);
    const yml = await b.evaluate(editor);
    for (const fact of [c.education[0].degree, c.patents[0].number, c.certifications[0].title]) assert.ok(yml.includes(fact), `${label}: education.yml shows "${fact.slice(0, 30)}"`);
    assert.ok(await b.evaluate(`[...document.querySelectorAll('#vsEditor a')].some(a => a.href === portfolioContent.certifications[0].link)`), `${label}: certificate links are clickable`);
    await b.shot(`${out}-${label}-4-yaml.png`);
    assert.ok(await b.evaluate(cornerClear), `${label}: switcher corner clear at the end of a file`);

    // Quick open: Ctrl+P, fuzzy filter, Enter
    await b.evaluate(ctrl('p')); await sleep(250);
    assert.ok(await b.evaluate(`document.getElementById('vsQuick').open && document.activeElement === document.querySelector('#vsQuick input')`), `${label}: Ctrl+P opens quick open with focus in the input`);
    const asr = c.projects.find(p => /ASR/.test(p.title));
    await b.evaluate(`(() => { const i = document.querySelector('#vsQuick input'); i.value = 'asr'; i.dispatchEvent(new Event('input')); })()`);
    await b.shot(`${out}-${label}-5-quick.png`);
    await b.evaluate(`document.querySelector('#vsQuick input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))`); await sleep(300);
    assert.ok(!(await b.evaluate(`document.getElementById('vsQuick').open`)), `${label}: Enter closes quick open`);
    assert.ok((await b.evaluate(editor)).includes(asr.description.slice(0, 40)), `${label}: quick open "asr" opens the ASR project`);

    // Résumé PDF: VS Code's binary-file notice, no embedded viewer
    await b.evaluate(click(`[data-open="${c.resume.split('/').pop()}"]`)); await sleep(300);
    assert.equal(await b.evaluate(`document.querySelectorAll('#vsEditor object, #vsEditor iframe, #vsEditor embed').length`), 0, `${label}: no embedded PDF viewer`);
    assert.ok(await b.evaluate(`document.querySelector('#vsEditor a[download]')?.getAttribute('href') === portfolioContent.resume`), `${label}: PDF tab offers the download`);

    // Close every tab: neighbour takes over, then the empty editor
    const tabs = await b.evaluate(`VSCodeTheme.tabs.length`);
    for (let i = 0; i < tabs; i++) await b.evaluate(click('.vs-tab[aria-current] .vs-tab-close'));
    assert.ok(await b.evaluate(`!!document.querySelector('.vs-empty') && !document.querySelector('.vs-tab')`), `${label}: closing all tabs shows the empty editor`);
    await b.evaluate(click('.vs-empty [data-open="README.md"]')); await sleep(300);
    assert.ok((await b.evaluate(editor)).includes(c.name), `${label}: empty editor reopens README`);

    if (!phone) {
        await b.evaluate(ctrl('b'));
        assert.equal(await b.evaluate(`getComputedStyle(document.getElementById('vsSide')).display`), 'none', 'desk: Ctrl+B hides the sidebar');
        await b.evaluate(ctrl('b'));
    }

    await b.evaluate(`portfolioController.loadTheme('paper')`); await sleep(300);
    assert.equal(await b.evaluate(`VSCodeTheme.onKey`), null, `${label}: cleanup removes the key listener`);
    await b.evaluate(ctrl('p'));
    assert.deepEqual(b.errors.filter(e => e.includes('vscode.js')), [], `${label}: no runtime errors`);
    b.close();
}
console.log('all vscode checks passed');
