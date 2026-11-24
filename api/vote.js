// Best-theme vote (the chooser's Vote mode in js/main.js), on the same Vercel project and Upstash store as api/chat.js.
// GET → {counts: {theme: n}, mine}. POST {theme} → the same after counting it. One vote per visitor IP; voting again moves it.
// Redis: hash `votes` (theme → count) and `voter:<sha256 of IP>` → theme, so the IP itself is never stored.
const crypto = require('node:crypto');
const { ORIGINS, LOCAL, STORE, STORE_TOKEN } = require('./chat.js');
// The enabled themes in js/main.js (tests/vote-api.test.mjs fails when they drift)
const THEMES = ['chatgpt', 'modelcard', 'vscode', 'terminal', 'notebook', 'paper', 'book', 'apple', 'scifi'];

const redis = cmds => fetch(`${STORE}/pipeline`, {
    method: 'POST', headers: { Authorization: `Bearer ${STORE_TOKEN}` }, signal: AbortSignal.timeout(3000), body: JSON.stringify(cmds)
}).then(r => { if (!r.ok) throw new Error(`store ${r.status}`); return r.json(); }).then(rows => rows.map(row => row.result));

async function handler(req, res) {
    const origin = req.headers.origin || '';
    if (!ORIGINS.includes(origin) && !LOCAL.test(origin)) return res.status(403).json({ error: 'origin not allowed' });
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(204).end();
    }
    if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'GET or POST only' });
    const theme = req.body?.theme;
    if (req.method === 'POST' && !THEMES.includes(theme)) return res.status(400).json({ error: 'unknown theme' });
    const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for']?.split(',')[0].trim();
    if (!STORE || !ip) return res.status(503).json({ error: 'voting is closed' });
    const voter = `voter:${crypto.createHash('sha256').update(ip).digest('hex')}`;

    res.setHeader('Cache-Control', 'no-store');
    try {
        if (req.method === 'POST') {
            const [previous] = await redis([['SET', voter, theme, 'GET']]); // atomic swap: a double click counts once
            if (previous !== theme) {
                await redis([['HINCRBY', 'votes', theme, 1], ...(THEMES.includes(previous) ? [['HINCRBY', 'votes', previous, -1]] : [])]);
            }
        }
        const [flat, mine] = await redis([['HGETALL', 'votes'], ['GET', voter]]);
        const counts = Object.fromEntries(THEMES.map(key => [key, 0]));
        for (let i = 0; i < (flat?.length || 0); i += 2) if (flat[i] in counts) counts[flat[i]] = Math.max(0, Number(flat[i + 1]) || 0);
        res.status(200).json({ counts, mine: THEMES.includes(mine) ? mine : null });
    } catch (err) {
        console.error('vote', err.message);
        res.status(502).json({ error: 'store unavailable' });
    }
}

module.exports = handler;
module.exports.THEMES = THEMES;
