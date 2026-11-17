// Résumé chat API (api/chat.js) without network: node tests/chat-api.test.mjs
import assert from 'node:assert';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
process.env.KV_REST_API_URL = 'https://store.example'; process.env.KV_REST_API_TOKEN = 't'; // saving on, checked below
const handler = require('../api/chat.js');
const { clean, deltas, prompt, tenure } = handler;
const SYSTEM = prompt();
const c = require('../js/content.js');

const stream = parts => new ReadableStream({ start(ctl) { parts.forEach(p => ctl.enqueue(new TextEncoder().encode(p))); ctl.close(); } });
const collect = async gen => { let s = ''; for await (const t of gen) s += t; return s; };
const u = content => ({ role: 'user', content }), a = content => ({ role: 'assistant', content });

// The prompt carries the résumé from content.js, not the UI-only fields
assert.ok(SYSTEM.includes(c.name) && SYSTEM.includes(c.email) && SYSTEM.includes(c.experience[0].company), 'prompt has résumé facts');
// Tenure is worked out in code, both start and end months counted, Present = this month
const t = tenure(new Date(2026, 10, 16));
assert.match(t, /Today is November 2026/);
assert.match(t, /Analyst at Accenture[^\n]*\(September 2018 - May 2021\): 2 years 9 months/, 'per role');
assert.match(t, /Total at NielsenIQ: 4 years 3 months/, 'per company, to Present');
assert.match(t, /Total at Accenture[^:]*: 4 years\n/, 'per company, whole years');
assert.match(t, /Career so far: 8 years 3 months across 2 companies; average 4 years 2 months per company/, 'total and average');
assert.ok(SYSTEM.includes('Worked-out tenure'), 'prompt carries the tenure');
assert.ok(SYSTEM.includes('{{card:contact}}') && SYSTEM.includes('{{card:resume}}') && !SYSTEM.includes('{{card:help}}'), 'cards listed from chatCommands');
assert.ok(SYSTEM.includes(`"resume":"${c.site}/${c.resume}"`), 'résumé given as a full URL');
assert.ok(!SYSTEM.includes('chatCommands') && !SYSTEM.includes('skillGroups'), 'prompt skips UI fields');

// Input validation
assert.deepEqual(clean([u(' hi ')]), [u('hi')], 'trims');
for (const bad of [null, 'hi', [], [a('x')], [u('x'), a('y')], [u('')], [{ role: 'system', content: 'x' }], [u(5)], [u('x'.repeat(12001))]])
    assert.equal(clean(bad), null, `rejects ${JSON.stringify(bad)?.slice(0, 40)}`);
const long = Array.from({ length: 15 }, (_, i) => i % 2 ? a(`a${i}`) : u(`u${i}`));
const kept = clean(long);
assert.ok(kept.length <= 10 && kept[0].role === 'user' && kept.at(-1).content === 'u14', 'keeps the last turns, starting with the visitor');
const big = clean([u('x'.repeat(11000)), a('y'.repeat(11000)), u('z'.repeat(11000))]);
assert.deepEqual(big.map(m => m.content[0]), ['z'], 'drops the oldest past the total cap');

// SSE parsing: split lines, heartbeats, reasoning deltas and [DONE]
const sse = (o) => `data: ${JSON.stringify(o)}\n\n`;
const body = [': heartbeat\n\n', sse({ choices: [{ delta: { reasoning: 'thinking' } }] }), sse({ choices: [{ delta: { content: 'Hel' } }] }).slice(0, 20),
    sse({ choices: [{ delta: { content: 'Hel' } }] }).slice(20), sse({ choices: [{ delta: { content: 'lo' } }] }), 'data: [DONE]\n\n'];
assert.equal(await collect(deltas(stream(body))), 'Hello', 'joins content deltas only');

// Handler
const call = async (req, upstream) => {
    const sent = [], saved = [];
    globalThis.fetch = async (url, opts) => {
        if (url.startsWith('https://store.example')) { saved.push({ url, auth: opts.headers.Authorization, cmds: JSON.parse(opts.body) }); return new Response('[]'); }
        sent.push(JSON.parse(opts.body)); return upstream();
    };
    const res = { code: 200, headers: {}, body: '', status(n) { this.code = n; return this; }, json(o) { this.body = JSON.stringify(o); }, setHeader(k, v) { this.headers[k] = v; }, write(t) { this.body += t; }, end() {} };
    await handler({ method: 'POST', headers: { origin: 'https://ashutoshcodes.in' }, body: { messages: [u('hi')] }, ...req }, res);
    return { res, sent, saved };
};
const ok = () => new Response(stream(body));
assert.equal((await call({ headers: { origin: 'https://evil.example' } }, ok)).res.code, 403, 'unknown origin refused');
assert.equal((await call({ headers: {} }, ok)).res.code, 403, 'missing origin refused');
assert.equal((await call({ method: 'OPTIONS' }, ok)).res.code, 204, 'preflight');
assert.equal((await call({ body: { messages: [a('x')] } }, ok)).res.code, 400, 'bad history');
let { res, sent } = await call({}, ok);
assert.equal(res.code, 200); assert.equal(res.body, 'Hello', 'streams the answer');
assert.equal(res.headers['Access-Control-Allow-Origin'], 'https://ashutoshcodes.in');
assert.ok(sent[0].stream && sent[0].models.length && sent[0].messages[0].role === 'system' && sent[0].messages.at(-1).content === 'hi', 'gateway request');
assert.equal((await call({ headers: { origin: 'http://localhost:8000' } }, ok)).res.code, 200, 'local dev allowed');
// Saving: the last question and the real answer, under the browser's chat id; a forged earlier answer isn't stored
let saved;
({ res, saved } = await call({ headers: { origin: 'https://ashutoshcodes.in', 'x-vercel-ip-country': 'IN' }, body: { chat: '20261117103005-abc123', messages: [u('hi'), a('forged'), u('python?')] } }, ok));
const [[push, key, entry], expire] = saved[0].cmds, turn = JSON.parse(entry);
assert.ok(saved.length === 1 && saved[0].url === 'https://store.example/pipeline' && saved[0].auth === 'Bearer t', 'saved to the store');
assert.deepEqual([push, key, turn.question, turn.answer, turn.country, turn.page], ['RPUSH', 'chat:20261117103005-abc123', 'python?', 'Hello', 'IN', 'https://ashutoshcodes.in'], 'one turn per question');
assert.deepEqual(expire, ['EXPIRE', 'chat:20261117103005-abc123', 180 * 86400], 'kept 180 days');
assert.ok(!entry.includes('forged'), 'browser-sent history not stored');
for (const chat of [undefined, 'short', 'x'.repeat(65), 'a:b/../c-1234', 42]) assert.equal((await call({ body: { chat, messages: [u('hi')] } }, ok)).saved.length, 0, `no save for chat id ${chat}`);
globalThis.fetch = async url => url.startsWith('https://store.example') ? Promise.reject(new Error('store down')) : ok();
const down = { code: 200, body: '', headers: {}, status(n) { this.code = n; return this; }, setHeader() {}, write(t) { this.body += t; }, end() { this.ended = true; } };
const err = console.error; console.error = () => {};
await handler({ method: 'POST', headers: { origin: 'https://ashutoshcodes.in' }, body: { chat: '20261117103005-abc123', messages: [u('hi')] } }, down);
console.error = err;
assert.ok(down.ended && down.body === 'Hello', 'store down: answer still delivered');
assert.equal((await call({}, () => new Response('no credits', { status: 402 }))).res.code, 502, 'gateway error -> 502');
assert.equal((await call({}, () => Promise.reject(new Error('down')))).res.code, 502, 'network error -> 502');
// Rate limit: counted per visitor IP per hour in the store; over 40 is refused before the model is called
for (const [count, code] of [[1, 200], [40, 200], [41, 429]]) {
    const calls = [];
    globalThis.fetch = async (url, opts) => {
        calls.push(url);
        if (url.startsWith('https://store.example')) return new Response(JSON.stringify(JSON.parse(opts.body)[0][0] === 'INCR' ? [{ result: count }, { result: 1 }] : []));
        return ok();
    };
    const r = { code: 200, body: '', headers: {}, status(n) { this.code = n; return this; }, json() {}, setHeader() {}, write() {}, end() {} };
    await handler({ method: 'POST', headers: { origin: 'https://ashutoshcodes.in', 'x-real-ip': '203.0.113.9' }, body: { messages: [u('hi')] } }, r);
    assert.equal(r.code, code, `question ${count} this hour -> ${code}`);
    assert.equal(calls.some(u => u.includes('ai-gateway')), code === 200, `model ${code === 200 ? '' : 'not '}called at ${count}`);
}
console.log('all chat api checks passed');
