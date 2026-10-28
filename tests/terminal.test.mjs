// Terminal theme checks: node tests/terminal.test.mjs [screenshot-dir]
import { openPage, sleep } from './cdp.mjs';
import assert from 'node:assert';
import { mkdirSync } from 'node:fs';
const shots = process.argv[2] || 'tests/screenshots';
mkdirSync(shots, { recursive: true });
const out = `${shots}/terminal`;
const screen = `document.getElementById('tmScreen').innerText`;
const last = `document.querySelector('#tmOut .tm-entry:last-child').innerText`;
const type = v => `(() => { const i = document.getElementById('tmInput'); i.value = ${JSON.stringify(v)}; })()`;
const press = (k, mods = '') => `document.getElementById('tmInput').dispatchEvent(new KeyboardEvent('keydown', { key: '${k}', ${mods} bubbles: true, cancelable: true }))`;
const enter = async (b, v) => { await b.evaluate(type(v)); await b.evaluate(press('Enter')); await sleep(400); };
// Nothing may sit under the theme switcher once the screen is scrolled to the end
const cornerClear = `(() => { const s = document.getElementById('tmScreen'); s.scrollTop = s.scrollHeight;
    const d = document.getElementById('themeDock').getBoundingClientRect();
    return [...document.querySelectorAll('#tmRoot .tm-out > *, #tmRoot .tm-line')].every(el => { const r = el.getBoundingClientRect();
        return !r.width || r.bottom <= d.top || r.top >= d.bottom || r.right <= d.left || r.left >= d.right; }); })()`;

for (const [label, opts] of [['desk', {}], ['m', { width: 390, height: 844, mobile: true }]]) {
    const phone = label === 'm';
    const b = await openPage('terminal', opts);
    const c = await b.evaluate('JSON.stringify(portfolioContent)').then(JSON.parse);

    // Nothing plays behind the theme chooser; closing it opens the window and starts the boot
    assert.ok(await b.evaluate(`document.getElementById('themeChooser').open && !document.getElementById('tmOut').children.length && getComputedStyle(document.querySelector('.tm-win')).visibility === 'hidden'`), `${label}: no boot behind the chooser`);
    await b.evaluate(`document.getElementById('themeChooser').close()`); await sleep(600);
    assert.ok(await b.evaluate(`document.getElementById('tmOut').children.length > 0 && getComputedStyle(document.querySelector('.tm-win')).visibility === 'visible'`), `${label}: closing the chooser starts the boot`);
    const noOverflow = async what => assert.equal(await b.evaluate(`innerWidth + 'x' + document.documentElement.scrollWidth`), `${opts.width || 1440}x${opts.width || 1440}`, `${label}: no horizontal overflow (${what})`);

    // Boot: greeting, a loader, then the banner and neofetch; any key skips it
    await b.evaluate(`portfolioController.loadTheme('paper', { animate: false }); portfolioController.loadTheme('terminal', { animate: false })`);
    for (let i = 0; i < 30 && !(await b.evaluate(`!!document.querySelector('#tmOut .tm-load')`)); i++) await sleep(100);
    assert.ok(await b.evaluate(`!!document.querySelector('#tmOut .tm-load') && document.querySelector('.tm-entry-line').hidden && TerminalTheme.booting`), `${label}: boot shows the loader before the prompt`);
    await b.shot(`${out}-${label}-0-boot.png`);
    await b.evaluate(`dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }))`); await sleep(400);
    assert.ok(await b.evaluate(`!TerminalTheme.booting && !document.querySelector('.tm-entry-line').hidden && !!document.querySelector('.tm-menu')`), `${label}: a key press skips to the finished boot`);
    assert.equal(await b.evaluate(`document.getElementById('tmRoot').dataset.os`), phone ? 'phone' : 'mac', `${label}: terminal matches the device`);

    // neofetch from content.js, the name banner and the portrait, and a clickable menu built from chatCommands
    const login = await b.evaluate(screen);
    for (const fact of [c.name, c.title, `${c.stats.years} years`, c.location]) assert.ok(login.includes(fact), `${label}: boot shows "${fact}" from content.js`);
    assert.equal(await b.evaluate(`document.querySelector('.tm-banner pre').getAttribute('aria-label')`), c.name.split(' ')[0], `${label}: banner spells the first name`);
    assert.ok(await b.evaluate(`document.querySelectorAll('.tm-art > span').length > 20 || !!document.querySelector('.tm-photo')`), `${label}: portrait is drawn`);
    const menu = await b.evaluate(`[...document.querySelectorAll('.tm-menu [data-run]')].map(e => e.dataset.run).join()`);
    assert.equal(menu, [...c.chatCommands.map(x => x.command.slice(1)), 'theme'].join(), `${label}: menu lists every chatCommand, then theme`);
    // The boot header stays small: at most a fifth of the window
    assert.ok(await b.evaluate(`document.querySelector('.tm-head').getBoundingClientRect().height <= document.querySelector('.tm-win').getBoundingClientRect().height * 0.2`), `${label}: boot header takes at most 20% of the window`);
    assert.equal(await b.evaluate(`getComputedStyle(document.getElementById('tmInput')).outlineStyle`), 'none', `${label}: no box around the focused prompt`);
    await noOverflow('boot');
    await b.shot(`${out}-${label}-1-login.png`);

    // Prompt echo with a block cursor follows the input
    await b.evaluate(`(() => { const i = document.getElementById('tmInput'); i.value = 'abc'; i.dispatchEvent(new Event('input')); })()`);
    assert.equal(await b.evaluate(`document.getElementById('tmEcho').textContent`), 'abc ', `${label}: typed text is echoed with the cursor after it`);

    // Typed command, from content.js
    await enter(b, 'experience'); await sleep(600); // smooth scroll
    const exp = await b.evaluate(last);
    for (const e of c.experience) assert.ok(exp.includes(e.position) && exp.includes(e.achievements.at(-1)), `${label}: experience shows ${e.position} with every achievement`);
    assert.ok(await b.evaluate(`(() => { const s = document.getElementById('tmScreen'), e = document.querySelector('#tmOut .tm-entry:last-child');
        return Math.abs(e.getBoundingClientRect().top - s.getBoundingClientRect().top - 12) < 4; })()`), `${label}: a long answer starts at its command line`);
    await noOverflow('experience');
    await b.shot(`${out}-${label}-2-experience.png`);

    // Clicking a command types it, then runs it
    await b.evaluate(`document.querySelector('#tmOut [data-run="skills"]').click()`); await sleep(120);
    assert.ok('skills'.startsWith(await b.evaluate(`document.getElementById('tmInput').value`)), `${label}: clicked command types itself at the prompt`);
    await sleep(700);
    const skills = await b.evaluate(`[...document.querySelectorAll('#tmOut .tm-entry:last-child dd')].flatMap(d => d.textContent.split(', ')).map(s => s.toLowerCase())`);
    assert.equal(skills.length, c.stats.skills, `${label}: skills lists each skill once (${c.stats.skills})`);
    assert.equal(await b.evaluate(`document.getElementById('tmInput').value`), '', `${label}: prompt clears after the run`);
    await noOverflow('skills');

    // Help lists chatCommands descriptions; aliases work
    await enter(b, 'help');
    const help = await b.evaluate(last);
    for (const x of c.chatCommands) assert.ok(help.includes(x.description), `${label}: help shows "${x.description}"`);
    if (phone) assert.ok(await b.evaluate(`[...document.querySelectorAll('#tmOut .tm-entry:last-child [data-run]')].every(el => el.getBoundingClientRect().height >= 44)`), 'm: 44px command targets');
    await b.shot(`${out}-${label}-3-help.png`);
    await enter(b, 'whoami');
    assert.ok((await b.evaluate(last)).includes(c.about.bio.slice(0, 60)), `${label}: whoami is about`);

    // Typed text is escaped; unknown commands get a suggestion
    await enter(b, '<img src=x onerror="window.pwned=1">');
    assert.ok(await b.evaluate(`!window.pwned && !document.querySelector('#tmOut img[src="x"]')`), `${label}: typed text is escaped`);
    assert.ok((await b.evaluate(last)).includes('command not found'), `${label}: unknown command`);
    await enter(b, 'projcts');
    assert.equal(await b.evaluate(`document.querySelector('#tmOut .tm-entry:last-child [data-run]')?.dataset.run`), 'projects', `${label}: "projcts" suggests projects`);

    // Tab completion and history
    await b.evaluate(type('cert')); await b.evaluate(press('Tab'));
    assert.equal(await b.evaluate(`document.getElementById('tmInput').value`), 'certifications', `${label}: Tab completes "cert"`);
    await b.evaluate(press('Enter')); await sleep(300);
    const certs = await b.evaluate(last);
    assert.ok(certs.includes(c.certifications[0].title) && certs.includes(c.patents[0].number), `${label}: certifications show certificates and the patent`);
    await b.evaluate(press('ArrowUp'));
    assert.equal(await b.evaluate(`document.getElementById('tmInput').value`), 'certifications', `${label}: ↑ recalls the last command`);
    await b.evaluate(press('ArrowDown'));
    assert.equal(await b.evaluate(`document.getElementById('tmInput').value`), '', `${label}: ↓ returns to an empty prompt`);

    // Résumé and contact: content.js paths, new tab, no phone number
    await enter(b, 'resume');
    assert.ok(await b.evaluate(`[...document.querySelectorAll('#tmRoot a[download]')].every(a => a.getAttribute('href') === portfolioContent.resume && a.target === '_blank')`), `${label}: résumé link uses content.js path and opens in a new tab`);
    await enter(b, 'hire');
    assert.ok(!(await b.evaluate(screen)).includes(c.phone), `${label}: no phone number`);
    await noOverflow('hire');
    await b.shot(`${out}-${label}-4-hire.png`);
    assert.ok(await b.evaluate(cornerClear), `${label}: switcher corner clear at the end`);

    // Colour schemes: listed, applied, remembered, and rejected when unknown
    await enter(b, 'theme');
    assert.equal(await b.evaluate(`document.querySelectorAll('#tmOut .tm-entry:last-child .tm-schemes [data-run]').length`), 5, `${label}: theme lists the colour schemes`);
    await b.evaluate(`document.querySelector('#tmOut .tm-entry:last-child [data-run="theme dracula"]').click()`); await sleep(1400);
    assert.equal(await b.evaluate(`document.getElementById('tmRoot').dataset.scheme + '|' + getComputedStyle(document.getElementById('tmRoot')).getPropertyValue('--tm-bg').trim() + '|' + localStorage.getItem('terminal-scheme')`), 'dracula|#282a36|dracula', `${label}: clicking a scheme applies and remembers it`);
    await b.shot(`${out}-${label}-5-dracula.png`);
    await enter(b, 'theme nope');
    assert.ok((await b.evaluate(last)).includes('no such colour scheme'), `${label}: unknown scheme is rejected`);
    await enter(b, 'theme default');
    assert.ok(await b.evaluate(`!document.getElementById('tmRoot').dataset.scheme`), `${label}: theme default restores the OS colours`);

    // Ctrl+L clears
    await b.evaluate(press('l', 'ctrlKey: true,'));
    assert.equal(await b.evaluate(`document.getElementById('tmOut').children.length`), 0, `${label}: Ctrl+L clears the screen`);

    // Desktop: Windows gets PowerShell and Linux gets Ubuntu's terminal, each with its own wording
    if (!phone) for (const [os, prompt, err] of [['windows', 'PS C:\\Users\\guest>', "is not recognized as the name of a cmdlet"], ['linux', 'guest@ashutosh:~$', "Command 'projcts' not found, did you mean:"]]) {
        await b.evaluate(`TerminalTheme.detect = () => '${os}'; portfolioController.loadTheme('paper', { animate: false }); portfolioController.loadTheme('terminal', { animate: false }); TerminalTheme.skip()`);
        await sleep(500);
        assert.equal(await b.evaluate(`document.getElementById('tmRoot').dataset.os`), os, `desk: ${os} profile`);
        assert.equal(await b.evaluate(`document.querySelector('.tm-entry-line .tm-prompt').textContent`), prompt, `desk: ${os} prompt`);
        await enter(b, 'projcts');
        assert.ok((await b.evaluate(last)).includes(err), `desk: ${os} not-found wording`);
        await b.shot(`${out}-desk-${os}.png`);
    }

    // Switching theme mid-typing: the timer is cleared, no errors
    await b.evaluate(`TerminalTheme.click('projects')`);
    await b.evaluate(`portfolioController.loadTheme('paper')`); await sleep(800);
    assert.equal(await b.evaluate(`TerminalTheme.timer`), null, `${label}: cleanup clears the typing timer`);
    assert.deepEqual(b.errors.filter(e => e.includes('terminal.js')), [], `${label}: no runtime errors`);
    b.close();
}
console.log('all terminal checks passed');
