// ChatGPT theme checks: node tests/chatgpt.test.mjs [screenshot-dir]
import { openTheme, sleep } from './cdp.mjs';
import assert from 'node:assert';
import { mkdirSync } from 'node:fs';
const shots = process.argv[2] || 'tests/screenshots';
mkdirSync(shots, { recursive: true });
const out = `${shots}/chatgpt`;
const ask = async (b, text) => { await b.evaluate(`ChatGPTTheme.send(${JSON.stringify(text)}, true)`); await sleep(1600); return b.evaluate(`[...document.querySelectorAll('.cg-body')].at(-1).innerText`); };

// Desktop
let b = await openTheme('chatgpt');
assert.equal(await b.evaluate(`document.querySelectorAll('#cgWelcome [data-key]').length`), 4, 'welcome suggestions');
await b.shot(`${out}-1-welcome.png`);
assert.ok((await ask(b, '/about')).includes(await b.evaluate('portfolioContent.about.bio.slice(0, 40)')), 'about shows bio from content.js');
assert.match(await ask(b, "what's your tech stack?"), /skills across/, "free text -> skills");
await sleep(500); await b.shot(`${out}-2b-skills.png`);
assert.match(await ask(b, 'where did you work at Nielsen?'), /companies/, 'company -> experience');
await b.shot(`${out}-2-experience.png`);
await ask(b, '<img src=x onerror="window.__xss=1">');
assert.equal(await b.evaluate(`document.querySelectorAll('#cgThread img[src="x"], #cgThread [onerror]').length + (window.__xss || 0)`), 0, 'user text escaped');
assert.match(await ask(b, '/toString'), /don't have an answer/, 'bogus command -> unknown');
assert.match(await ask(b, 'already'), /don't have an answer/, '"already" must not match "read"');
await ask(b, "/projects"); await sleep(600);
assert.ok(await b.evaluate(`(() => { const u = [...document.querySelectorAll("#cgThread > .justify-end")].at(-1); return u.getBoundingClientRect().top - document.getElementById("cgScroll").getBoundingClientRect().top; })()`) < 40, "question scrolled to top after answer");
await b.shot(`${out}-3-projects.png`);
// slash menu
await b.evaluate(`(() => { const i = document.getElementById('cgInput'); i.value = '/e'; i.dispatchEvent(new Event('input')); })()`);
assert.match(await b.evaluate(`document.getElementById('cgMenu').innerText`), /\/experience[\s\S]*\/education/, 'slash menu filters');
await b.shot(`${out}-4-menu.png`);
await b.evaluate(`document.getElementById('cgInput').dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown'}))`);
await b.evaluate(`document.getElementById('cgInput').dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}))`); await sleep(1600);
assert.ok((await b.evaluate(`[...document.querySelectorAll('.cg-body')].at(-1).innerText`)).includes(await b.evaluate('portfolioContent.education[0].degree')), 'arrow+enter picks 2nd option');
await ask(b, '/reading');
assert.ok(await b.evaluate(`[...document.querySelectorAll('.cg-bar')].every(bar => bar.classList.contains('is-filled'))`), 'progress bars fill');
assert.ok((await ask(b, 'did you study at NIT?')).includes(await b.evaluate('portfolioContent.education[0].degree')), 'school name from content.js -> education');
await b.evaluate(`document.getElementById('cgClose').click()`); await sleep(400);
assert.ok(await b.evaluate(`document.getElementById('cgRoot').classList.contains('cg-collapsed') && document.getElementById('cgSidebar').getBoundingClientRect().right <= 0`), 'desktop sidebar collapses');
await b.shot(`${out}-6-collapsed.png`);
await b.evaluate(`document.getElementById('cgMenuBtn').click()`); await sleep(400);
assert.ok(await b.evaluate(`document.getElementById('cgSidebar').getBoundingClientRect().left === 0`), 'desktop sidebar reopens');
await ask(b, '/hire'); await b.shot(`${out}-5-hire.png`);
// switching theme mid-reply must not throw
await b.evaluate(`ChatGPTTheme.send('/about', true); portfolioController.loadTheme('apple')`); await sleep(2000);
assert.deepEqual(b.errors.filter(e => e.includes('chatgpt.js')), [], 'no runtime errors');
b.close();

// Mobile
b = await openTheme('chatgpt', { width: 390, height: 844, mobile: true });
assert.equal(await b.evaluate(`innerWidth + 'x' + document.documentElement.scrollWidth`), '390x390', 'no horizontal overflow');
await b.shot(`${out}-7-m-welcome.png`);
await b.evaluate(`document.getElementById('cgMenuBtn').click()`); await sleep(500); await b.shot(`${out}-8-m-drawer.png`);
await b.evaluate(`document.querySelector('.cg-topic[data-key="experience"]').click()`); await sleep(1800);
assert.equal(await b.evaluate(`document.getElementById('cgSidebar').classList.contains('-translate-x-full')`), true, 'drawer closes after pick');
await b.shot(`${out}-9-m-experience.png`);
assert.equal(await b.evaluate(`innerWidth + 'x' + document.documentElement.scrollWidth`), '390x390', 'no overflow after answer');
assert.deepEqual(b.errors.filter(e => e.includes('chatgpt.js')), [], 'no runtime errors (mobile)');
b.close();
console.log('all chatgpt checks passed');
