// Agent/crawler checks: generated files, raw HTML, WebMCP tools, and .htaccess on a local Apache: node tests/seo.test.mjs
import { openPage, sleep } from './cdp.mjs';
import assert from 'node:assert';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
execFileSync('node', ['scripts/build-seo.js', '--check'], { cwd: root, stdio: 'inherit' });

// Raw HTML, as an agent without JavaScript reads it
const html = readFileSync(join(root, 'index.html'), 'utf8');
assert.equal(html.match(/<h1[\s>]/g)?.length, 1, 'exactly one h1');
assert.match(html, /<meta name="description" content="[^"]{50,}">/, 'meta description');
assert.match(html, /<link rel="canonical" href="https:\/\/ashutoshcodes\.in\/">/, 'canonical');
const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
const person = ld['@graph'].find(n => n['@type'] === 'Person');
assert.ok(person.sameAs.length >= 2 && person.email.startsWith('mailto:') && person.worksFor['@type'] === 'Organization', 'Person with sameAs, email, worksFor');
assert.ok(['WebSite', 'ProfilePage'].every(t => ld['@graph'].some(n => n['@type'] === t)), 'several schema types');
const text = html.replace(/<(script|style)[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
assert.ok(text.length > 3000, `main copy is in the HTML (${text.length} chars)`);
assert.match(html, /href="mailto:/, 'mailto link');
const llms = readFileSync(join(root, 'llms.txt'), 'utf8');
assert.match(llms, /^# .+\n\n> .+/, 'llms.txt has a title and a summary');
assert.match(llms, /\]\(https:\/\/ashutoshcodes\.in\/index\.md\)/, 'llms.txt links the Markdown profile');
assert.match(readFileSync(join(root, 'robots.txt'), 'utf8'), /Content-Signal: .*\n[\s\S]*Sitemap: https:\/\/ashutoshcodes\.in\/sitemap\.xml/, 'robots.txt has Content-Signal and Sitemap');

// In the browser: the static copy hides, the theme renders, WebMCP tools work
const b = await openPage('chatgpt');
await b.send('Page.enable');
await b.send('Page.addScriptToEvaluateOnNewDocument', { source: 'window.__tools = {}; navigator.modelContext = { registerTool: t => { window.__tools[t.name] = t; } };' });
await b.reload();
assert.equal(await b.evaluate(`document.querySelector('.static-page')`), null, 'the theme replaces the static copy');
assert.deepEqual(JSON.parse(await b.evaluate(`JSON.stringify(Object.keys(__tools))`)), ['get_profile', 'switch_theme'], 'WebMCP tools registered');
const profile = JSON.parse(JSON.parse(await b.evaluate(`__tools.get_profile.execute({}).then(r => JSON.stringify(r.content[0].text))`)));
assert.equal(profile.name, await b.evaluate('portfolioContent.name'), 'get_profile returns content.js');
await b.evaluate(`__tools.switch_theme.execute({ theme: 'paper' })`); await sleep(800);
assert.deepEqual([await b.evaluate('portfolioController.currentTheme'), await b.evaluate(`document.getElementById('themeChooser').open`)], ['paper', false], 'switch_theme switches and closes the chooser');
assert.deepEqual(b.errors, [], 'no errors');
b.close();

// .htaccess on the macOS Apache (Hostinger runs LiteSpeed, which reads the same rules)
if (!existsSync('/usr/sbin/httpd')) {
    console.log('skipped .htaccess checks: no /usr/sbin/httpd');
} else {
    const dir = mkdtempSync(join(tmpdir(), 'theme-test-httpd-')), docroot = join(dir, 'public_html');
    execFileSync('git', ['worktree', 'add', '--detach', '-q', docroot], { cwd: root });
    for (const f of ['.htaccess', 'index.html', 'index.md', 'llms.txt', 'robots.txt', 'sitemap.xml', 'js/main.js']) writeFileSync(join(docroot, f), readFileSync(join(root, f)));
    const mod = m => `LoadModule ${m}_module libexec/apache2/mod_${m}.so`;
    writeFileSync(join(dir, 'httpd.conf'), [`ServerRoot "/usr"`, 'Listen 127.0.0.1:8089', ...['mpm_prefork', 'authz_core', 'unixd', 'dir', 'mime', 'rewrite', 'headers', 'log_config'].map(mod),
        'TypesConfig /private/etc/apache2/mime.types', `PidFile ${dir}/httpd.pid`, `Mutex file:${dir} default`, `DefaultRuntimeDir ${dir}`, `ErrorLog ${dir}/error.log`, 'ServerName localhost',
        `DocumentRoot "${docroot}"`, '<Directory />', 'AllowOverride None', 'Require all denied', '</Directory>',
        `<Directory "${docroot}">`, 'AllowOverride All', 'Require all granted', '</Directory>', '<Files ".ht*">', 'Require all denied', '</Files>'].join('\n'));
    const httpd = ['-f', join(dir, 'httpd.conf'), '-k'];
    spawnSync('/usr/sbin/httpd', [...httpd, 'start']);
    try {
        await sleep(800);
        const get = (path, headers) => fetch(`http://127.0.0.1:8089${path}`, { headers, redirect: 'manual' });
        for (const [path, type] of [['/robots.txt', 'text/plain'], ['/llms.txt', 'text/plain'], ['/sitemap.xml', 'xml'], ['/index.md', 'text/markdown']]) {
            const r = await get(path);
            assert.ok(r.status === 200 && r.headers.get('content-type').includes(type), `${path} is served as ${type}`);
        }
        const home = await get('/');
        assert.ok(home.headers.get('link')?.includes('<llms.txt>; rel="describedby"') && /accept/i.test(home.headers.get('vary')), 'home has Link and Vary: Accept');
        const md = await get('/', { Accept: 'text/markdown' });
        assert.ok(md.headers.get('content-type').startsWith('text/markdown') && (await md.text()).startsWith('# '), 'Accept: text/markdown gets Markdown');
        assert.ok((await (await get('/', { Accept: 'text/html' })).text()).startsWith('<!DOCTYPE html>'), 'browsers still get HTML');
        for (const path of ['/nope', '/.well-known/mcp/server-card.json', '/package.json', '/scripts/build-seo.js', '/tests/seo.test.mjs', '/docs/REDESIGN.md', '/.git/config'])
            assert.ok([403, 404].includes((await get(path)).status), `${path} is not served`);
    } finally {
        spawnSync('/usr/sbin/httpd', [...httpd, 'stop']);
        execFileSync('git', ['worktree', 'remove', '--force', docroot], { cwd: root });
        rmSync(dir, { recursive: true, force: true });
    }
}
console.log('all seo checks passed');
