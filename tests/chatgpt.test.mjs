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
await b.evaluate(`window.fetch = () => Promise.reject(new Error('offline'))`); // keyword answers below; the chat API is checked at the end
assert.equal(await b.evaluate(`document.querySelectorAll('#cgWelcome [data-key]').length`), 4, 'welcome suggestions');
assert.ok(await b.evaluate(`(() => { const r = document.getElementById('cgNewChat').getBoundingClientRect(); return r.width <= 44 && !document.getElementById('cgNewChat').innerText.trim(); })()`), 'new chat hover area is just the pencil');
assert.ok((await ask(b, 'can I download your CV?')).includes('Download'), 'free text -> résumé');
assert.equal(await b.evaluate(`[...document.querySelectorAll('.cg-body')].at(-1).querySelector('a[download]').getAttribute('href')`), await b.evaluate('portfolioContent.resume'), 'résumé download uses content.js path');
assert.ok(await b.evaluate(`[...document.querySelectorAll('#cgRoot a[download]')].every(a => a.target === '_blank')`), 'résumé downloads never replace the page');
await b.shot(`${out}-1-welcome.png`);
assert.ok((await ask(b, '/about')).includes(await b.evaluate('portfolioContent.about.bio.slice(0, 40)')), 'about shows bio from content.js');
assert.match(await ask(b, "what's your tech stack?"), /skills across/, "free text -> skills");
await sleep(500); await b.shot(`${out}-2b-skills.png`);
assert.match(await ask(b, 'where did you work at Nielsen?'), /companies/, 'company -> experience');
await b.shot(`${out}-2-experience.png`);
await b.evaluate(`[...document.querySelectorAll('[data-more]')].at(-1).click()`); await sleep(400);
assert.ok(await b.evaluate(`(() => { const btn = [...document.querySelectorAll('[data-more]')].at(-1), ul = btn.previousElementSibling;
    return btn.textContent.trim() === 'Show less' && [...ul.children].every(li => !li.hidden) && ul.lastElementChild.getBoundingClientRect().bottom <= btn.getBoundingClientRect().top; })()`), 'show more expands in place, button below');
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
assert.ok(await b.evaluate(`(() => { const side = document.getElementById('cgSidebar').getBoundingClientRect(), topic = document.querySelector('.cg-topic').getBoundingClientRect();
    return side.left === 0 && side.width === 60 && topic.width > 0 && getComputedStyle(document.querySelector('.cg-topic .cg-label')).display === 'none'; })()`), 'desktop collapses to a 60px icon rail');
await b.shot(`${out}-6-collapsed.png`);
await b.evaluate(`document.getElementById('cgClose').click()`); await sleep(400);
assert.equal(await b.evaluate(`document.getElementById('cgSidebar').getBoundingClientRect().width`), 260, 'rail expands back');
await ask(b, '/hire'); await b.shot(`${out}-5-hire.png`);
// Free text goes to the chat API: streamed in, light Markdown rendered with everything escaped, history sent along
await b.evaluate(`window.__sent = []; window.fetch = (url, opts) => { __sent.push(JSON.parse(opts.body));
    const parts = ['I have **5+ years**', ' of Python.\\n- Built <b>APIs</b>\\n- Led a team\\n\\n| Role | Years |\\n|---|---|\\n| Manager | 1 |\\n\\nMail ash@example.com or [call](tel:+911234) · [x](javascript:alert(1)) · https://example.com/a.'];
    return Promise.resolve(new Response(new ReadableStream({ start(c) { parts.forEach(p => c.enqueue(new TextEncoder().encode(p))); c.close(); } }))); }`);
assert.match(await ask(b, 'do you know python?'), /5\+ years of Python/, 'streamed answer shown');
assert.equal(await b.evaluate(`(el => [el.querySelectorAll('strong').length, el.querySelectorAll('li').length, el.querySelectorAll('b, .cg-caret').length].join())([...document.querySelectorAll('.cg-body')].at(-1))`), '1,2,0', 'bold and bullets rendered, model HTML escaped, no dot once done');
assert.equal(await b.evaluate(`[...[...document.querySelectorAll('.cg-body')].at(-1).querySelectorAll('th, td')].map(c => c.textContent).join()`), 'Role,Years,Manager,1', 'table rendered, separator row dropped');
assert.deepEqual(await b.evaluate(`[...[...document.querySelectorAll('.cg-body')].at(-1).querySelectorAll('a')].map(a => a.getAttribute('href'))`), ['mailto:ash@example.com', 'tel:+911234', 'https://example.com/a'], 'email, phone and URL linked; javascript: link left as text');

await ask(b, 'and java?');
assert.deepEqual(await b.evaluate(`__sent.at(-1).messages.map(m => m.role)`), ['user', 'assistant', 'user'], 'history sent with the question');
assert.ok(await b.evaluate(`/^\\d{14}-\\w{4,}$/.test(__sent[0].chat) && __sent[0].chat === __sent.at(-1).chat`), 'one chat id per conversation');
await b.shot(`${out}-10-ai.png`);
// Mid-stream: the words so far, then the pulsing dot inside the last line; New chat stops the answer
await b.evaluate(`window.fetch = () => Promise.resolve(new Response(new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('Still typing')); } })))`);
assert.equal(await ask(b, 'tell me more'), 'Still typing', 'partial answer shown while streaming');
assert.ok(await b.evaluate(`!![...document.querySelectorAll('.cg-body')].at(-1).querySelector('p > .cg-caret')`), 'pulsing dot while streaming');
await b.shot(`${out}-10a-streaming.png`);
await b.evaluate(`document.getElementById('cgNewChat').click(); document.querySelector('[data-fit]').click()`);
assert.ok(await b.evaluate(`document.activeElement.id === 'cgInput' && /job description/.test(cgInput.placeholder) && ChatGPTTheme.history.length === 0 && !ChatGPTTheme.chatId`), 'fit button focuses the composer; new chat clears history');
await b.shot(`${out}-11-fit.png`);
// {{card:x}} tags become the topic's own card (known topics only, each once); a tag still arriving is hidden
const reply = (text, close = true) => b.evaluate(`window.fetch = () => Promise.resolve(new Response(new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode(${JSON.stringify(text)})); ${close ? 'c.close();' : ''} } })))`);
await reply("{{title:Contact Details}}\nHere's how to reach me.\n{{card:contact}}\n{{card:contact}} {{card:bogus}} {{card:help}} {{card:toString}}");
const cardText = await ask(b, 'how can I contact you?');
assert.ok(!cardText.includes('{{'), 'card tags never show as text');
assert.equal(await b.evaluate(`(el => el.querySelectorAll('.cg-card').length + ':' + !!el.querySelector('.cg-card [data-copy]'))([...document.querySelectorAll('.cg-body')].at(-1))`), '1:true', 'one contact card, with its copy button');
await b.shot(`${out}-12-card.png`);
await reply('Sure, here it is.\n{{card:res', false);
assert.equal(await ask(b, 'your resume'), 'Sure, here it is.', 'half-arrived tag hidden');
await reply('Sure, here it is.\n{{card:resume}}');
await ask(b, 'your resume again');
assert.equal(await b.evaluate(`[...document.querySelectorAll('.cg-body')].at(-1).querySelector('.cg-card a[download]')?.getAttribute('href')`), await b.evaluate('portfolioContent.resume'), 'résumé card has the download');
// {{ask:…}} follow-ups: up to three buttons, escaped; a tap asks it; only the latest answer keeps them
await reply('Four years at NielsenIQ.\n{{ask:What did you build there?}}\n{{ask:<img src=x onerror=window.__xss2=1>}}\n{{ask:Why hire you?}}\n{{ask:A fourth one}}');
assert.equal(await ask(b, 'how long at NielsenIQ?'), 'Four years at NielsenIQ.\n\nWhat did you build there?\n<img src=x onerror=window.__xss2=1>\nWhy hire you?', 'three follow-ups, tags hidden');
assert.equal(await b.evaluate(`document.querySelectorAll('#cgThread .cg-asks img').length + (window.__xss2 || 0)`), 0, 'follow-up text escaped');
await b.shot(`${out}-13-followups.png`);
await reply('Mostly automation platforms.');
await b.evaluate(`[...document.querySelectorAll('[data-ask]')].at(-3).click()`); await sleep(1600);
assert.equal(await b.evaluate(`[...document.querySelectorAll('#cgThread > .justify-end')].at(-1).innerText`), 'What did you build there?', 'tap asks the follow-up');
assert.equal(await b.evaluate(`[...document.querySelectorAll('.cg-asks')].filter(el => el.offsetParent).length`), 0, 'older follow-ups hidden');
// Past chats: listed in the sidebar (this browser only), newest first; a click restores it and the chat carries on
const titles = () => b.evaluate(`[...document.querySelectorAll('#cgChats [data-chat]')].map(el => el.innerText.trim())`);
assert.deepEqual(await titles(), ['Contact Details', 'do you know python?'], 'chats listed newest first; model title, else the question');
assert.ok(await b.evaluate(`document.querySelector('#cgChats [data-chat]').getAttribute('aria-current') === 'true'`), 'current chat highlighted');
await b.evaluate(`document.getElementById('cgNewChat').click()`);
assert.equal(await b.evaluate(`document.querySelectorAll('#cgChats [aria-current]').length`), 0, 'new chat: nothing highlighted');
await b.evaluate(`document.querySelectorAll('#cgChats [data-chat]')[1].click()`); await sleep(300);
assert.deepEqual(await b.evaluate(`[...document.querySelectorAll('#cgThread > .justify-end')].map(el => el.innerText)`), ['do you know python?', 'and java?'], 'old chat restored');
assert.ok(await b.evaluate(`ChatGPTTheme.history.length === 4 && !!document.querySelector('#cgThread table')`), 'history and Markdown restored');
await b.shot(`${out}-14-chats.png`);
await reply('Java too.');
await ask(b, 'one more');
assert.ok(await b.evaluate(`(c => c[0].title === 'do you know python?' && c[0].messages.length === 6 && c.length === 2)(JSON.parse(localStorage.getItem('cgChats')))`), 'continued chat moves to the top');
await b.evaluate(`window.fetch = () => Promise.resolve(new Response('', { status: 502 }))`);
assert.ok((await ask(b, 'can I download your CV?')).includes('Download'), 'API down -> keyword answer');
// switching theme mid-reply must not throw
await b.evaluate(`ChatGPTTheme.send('/about', true); portfolioController.loadTheme('apple')`); await sleep(2000);
assert.deepEqual(b.errors.filter(e => e.includes('chatgpt.js')), [], 'no runtime errors');
b.close();

// Mobile
b = await openTheme('chatgpt', { width: 390, height: 844, mobile: true });
await b.evaluate(`window.fetch = () => Promise.reject(new Error('offline'))`); // keyword answers below; the chat API is checked at the end
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
