// Résumé chat API (api/chat.js) without network: node tests/chat-api.test.mjs
import assert from 'node:assert';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const handler = require('../api/chat.js');
const { clean, deltas, SYSTEM } = handler;
const c = (log => { console.log = () => {}; const content = require('../js/content.js'); console.log = log; return content; })(console.log);

const stream = parts => new ReadableStream({ start(ctl) { parts.forEach(p => ctl.enqueue(new TextEncoder().encode(p))); ctl.close(); } });
const collect = async gen => { let s = ''; for await (const t of gen) s += t; return s; };
const u = content => ({ role: 'user', content }), a = content => ({ role: 'assistant', content });

// The prompt carries the résumé from content.js, not the UI-only fields
assert.ok(SYSTEM.includes(c.name) && SYSTEM.includes(c.email) && SYSTEM.includes(c.experience[0].company), 'prompt has résumé facts');
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
    const sent = [];
    globalThis.fetch = async (url, opts) => { sent.push(JSON.parse(opts.body)); return upstream(); };
    const res = { code: 200, headers: {}, body: '', status(n) { this.code = n; return this; }, json(o) { this.body = JSON.stringify(o); }, setHeader(k, v) { this.headers[k] = v; }, write(t) { this.body += t; }, end() {} };
    await handler({ method: 'POST', headers: { origin: 'https://ashutoshcodes.in' }, body: { messages: [u('hi')] }, ...req }, res);
    return { res, sent };
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
assert.equal((await call({}, () => new Response('no credits', { status: 402 }))).res.code, 502, 'gateway error -> 502');
assert.equal((await call({}, () => Promise.reject(new Error('down')))).res.code, 502, 'network error -> 502');
console.log('all chat api checks passed');
