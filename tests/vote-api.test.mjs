// Theme vote API (api/vote.js) against an in-memory store: node tests/vote-api.test.mjs
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
process.env.KV_REST_API_URL = 'https://store.example'; process.env.KV_REST_API_TOKEN = 't';
const handler = require('../api/vote.js');

// Server list matches the enabled (uncommented) themes in main.js
const enabled = [...readFileSync(new URL('../js/main.js', import.meta.url), 'utf8').matchAll(/^ {12}(\w+): \w+Theme,?$/gm)].map(m => m[1]);
assert.deepEqual(handler.THEMES, enabled, 'api/vote.js THEMES = main.js enabled themes');

// Just enough Redis for the commands vote.js sends
const kv = new Map(), hash = new Map();
globalThis.fetch = async (url, opts) => {
    assert.equal(opts.headers.Authorization, 'Bearer t');
    const run = ([cmd, ...a]) => {
        if (cmd === 'SET') { const old = kv.get(a[0]) ?? null; kv.set(a[0], a[1]); return old; }
        if (cmd === 'GET') return kv.get(a[0]) ?? null;
        if (cmd === 'HINCRBY') { hash.set(a[1], (hash.get(a[1]) || 0) + a[2]); return hash.get(a[1]); }
        if (cmd === 'HGETALL') return [...hash].flatMap(([k, v]) => [k, String(v)]);
        throw new Error(cmd);
    };
    return new Response(JSON.stringify(JSON.parse(opts.body).map(c => ({ result: run(c) }))));
};
const call = async (req) => {
    const res = { code: 200, headers: {}, body: null, status(n) { this.code = n; return this; }, json(o) { this.body = o; }, setHeader(k, v) { this.headers[k] = v; }, end() {} };
    await handler({ method: 'GET', ...req, headers: { origin: 'https://ashutoshcodes.in', 'x-real-ip': '1.1.1.1', ...req.headers } }, res);
    return res;
};
const vote = (theme, ip = '1.1.1.1') => call({ method: 'POST', headers: { 'x-real-ip': ip }, body: { theme } });

assert.equal((await call({ headers: { origin: 'https://evil.example' } })).code, 403, 'unknown origin refused');
assert.equal((await call({ method: 'OPTIONS' })).code, 204, 'preflight');
assert.equal((await call({ method: 'DELETE' })).code, 405, 'other methods refused');
assert.equal((await vote('nope')).code, 400, 'unknown theme refused');
assert.equal((await vote('__proto__')).code, 400, 'prototype key refused');

let r = await call({});
assert.equal(r.code, 200);
assert.equal(r.body.mine, null, 'no vote yet');
assert.equal(Object.values(r.body.counts).reduce((a, b) => a + b), 0, 'all zero');

r = await vote('terminal');
assert.equal(r.body.counts.terminal, 1); assert.equal(r.body.mine, 'terminal');
r = await vote('terminal');
assert.equal(r.body.counts.terminal, 1, 'same vote twice counts once');
r = await vote('paper');
assert.deepEqual([r.body.counts.terminal, r.body.counts.paper, r.body.mine], [0, 1, 'paper'], 'changing a vote moves it');
r = await vote('paper', '2.2.2.2');
assert.equal(r.body.counts.paper, 2, 'another visitor adds');
assert.equal((await call({ headers: { 'x-real-ip': '3.3.3.3' } })).body.mine, null, 'mine is per visitor');
assert.ok(![...kv.keys()].some(k => k.includes('1.1.1.1')), 'IPs are hashed, not stored');

hash.set('junk', 99);
assert.ok(!('junk' in (await call({})).body.counts), 'unknown keys in the store are ignored');

globalThis.fetch = async () => new Response('', { status: 500 });
assert.equal((await vote('book')).code, 502, 'store down');

console.log('vote api ok');
