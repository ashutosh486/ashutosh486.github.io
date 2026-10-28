// Terminal theme checks: node tests/terminal.test.mjs [screenshot-dir]
import { openTheme, sleep } from './cdp.mjs';
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
    const b = await openTheme('terminal', opts);
    const c = await b.evaluate('JSON.stringify(portfolioContent)').then(JSON.parse);
    const noOverflow = async what => assert.equal(await b.evaluate(`innerWidth + 'x' + document.documentElement.scrollWidth`), `${opts.width || 1440}x${opts.width || 1440}`, `${label}: no horizontal overflow (${what})`);

    // Login: neofetch from content.js and a clickable menu built from chatCommands
    const login = await b.evaluate(screen);
    for (const fact of [c.name, c.title, `${c.stats.years} years`, c.location]) assert.ok(login.includes(fact), `${label}: login shows "${fact}" from content.js`);
    assert.ok(await b.evaluate(`!!document.querySelector('#tmOut .tm-photo[src="${c.picture}"]')`), `${label}: login shows the profile photo`);
    const menu = await b.evaluate(`[...document.querySelectorAll('#tmOut .tm-entry:last-child [data-run]')].map(e => e.dataset.run).join()`);
    assert.equal(menu, c.chatCommands.map(x => x.command.slice(1)).join(), `${label}: menu lists every chatCommand`);
    await noOverflow('login');
    await b.shot(`${out}-${label}-1-login.png`);

    // Typed command, from content.js
    await enter(b, 'experience');
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

    // Ctrl+L clears
    await b.evaluate(press('l', 'ctrlKey: true,'));
    assert.equal(await b.evaluate(`document.getElementById('tmOut').children.length`), 0, `${label}: Ctrl+L clears the screen`);

    // Switching theme mid-typing: the timer is cleared, no errors
    await b.evaluate(`document.querySelector('#tmRoot') && TerminalTheme.type('projects')`);
    await b.evaluate(`portfolioController.loadTheme('paper')`); await sleep(800);
    assert.equal(await b.evaluate(`TerminalTheme.timer`), null, `${label}: cleanup clears the typing timer`);
    assert.deepEqual(b.errors.filter(e => e.includes('terminal.js')), [], `${label}: no runtime errors`);
    b.close();
}
console.log('all terminal checks passed');
