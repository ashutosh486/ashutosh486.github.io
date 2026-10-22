// Minimal Chrome DevTools driver for theme tests - no npm deps, uses the locally installed Chrome
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

export const sleep = ms => new Promise(r => setTimeout(r, ms));
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const INDEX = `file://${resolve(import.meta.dirname, '..', 'index.html')}`;

// Opens index.html (optionally at #hash) at the given viewport; the theme chooser is left as the page shows it
export async function openPage(hash = '', { width = 1440, height = 900, mobile = false } = {}) {
    // Port 0 lets Chrome pick a free port, so parallel or leftover runs never collide
    const profile = mkdtempSync(join(tmpdir(), 'theme-test-'));
    const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
        '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
    const portFile = join(profile, 'DevToolsActivePort');
    while (!existsSync(portFile) || !readFileSync(portFile, 'utf8').includes('\n')) await sleep(100);
    const port = readFileSync(portFile, 'utf8').split('\n')[0];
    const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
    await new Promise(r => { ws.onopen = r; });

    let id = 0;
    const pending = {}, errors = [];
    ws.onmessage = e => {
        const m = JSON.parse(e.data);
        if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
        if (pending[m.id]) { pending[m.id](m); delete pending[m.id]; }
    };
    const send = (method, params = {}) => new Promise(r => { pending[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
    const evaluate = async expr => {
        const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
        return r.result.result.value ?? r.result.exceptionDetails?.exception?.description;
    };
    const shot = async path => {
        const s = await send('Page.captureScreenshot', { format: 'png' });
        writeFileSync(path, Buffer.from(s.result.data, 'base64'));
    };
    const key = async k => {
        for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key: k, code: k, windowsVirtualKeyCode: k === 'Escape' ? 27 : 0 });
    };

    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
    await send('Page.navigate', { url: INDEX + (hash ? `#${hash}` : '') });
    await sleep(2500); // Tailwind CDN + first render
    return { send, evaluate, shot, key, errors, close: () => { ws.close(); chrome.kill(); } };
}

// Opens the page straight on `theme` with the chooser dismissed
export async function openTheme(theme, options) {
    const page = await openPage(theme, options);
    await page.evaluate(`document.getElementById('themeChooser').close()`);
    await sleep(300);
    return page;
}
