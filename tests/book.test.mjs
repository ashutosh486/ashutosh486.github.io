// Book theme checks: node tests/book.test.mjs [screenshot-dir]
import { openPage, sleep } from './cdp.mjs';
import assert from 'node:assert';
import { mkdirSync } from 'node:fs';
const shots = process.argv[2] || 'tests/screenshots';
mkdirSync(shots, { recursive: true });
const out = `${shots}/book`;
const waiting = `document.getElementById('bkRoot').classList.contains('is-waiting')`;
const open = `document.getElementById('bkRoot').classList.contains('sidebar-visible')`;
// Nothing may sit under the theme switcher once a chapter is scrolled to the end
const cornerClear = `(() => { scrollTo(0, document.documentElement.scrollHeight);
    const d = document.getElementById('themeDock').getBoundingClientRect();
    return [...document.querySelectorAll('#bkMain > *, .bk-nav a, .bk-nav-side')].every(el => { const r = el.getBoundingClientRect();
        return !r.width || r.bottom <= d.top || r.top >= d.bottom || r.right <= d.left || r.left >= d.right; }); })()`;

for (const [label, opts] of [['desk', {}], ['m', { width: 390, height: 844, mobile: true }]]) {
    const phone = label === 'm';
    const b = await openPage('book', opts);
    const c = await b.evaluate('JSON.stringify(portfolioContent)').then(JSON.parse);
    const noOverflow = async what => assert.equal(await b.evaluate(`innerWidth + 'x' + document.documentElement.scrollWidth`), `${opts.width || 1440}x${opts.width || 1440}`, `${label}: no horizontal overflow (${what})`);
    const h1 = () => b.evaluate(`document.querySelector('#bkMain h1').textContent`);

    // Nothing plays behind the theme chooser; closing it types the chapter's Markdown, then renders it
    assert.ok(await b.evaluate(`document.getElementById('themeChooser').open && ${waiting} && document.getElementById('bkSrc').hidden`), `${label}: nothing plays behind the chooser`);
    await b.evaluate(`document.getElementById('themeChooser').close()`); await sleep(300);
    assert.ok(await b.evaluate(`!document.getElementById('bkSrc').hidden && document.getElementById('bkSrc').textContent.startsWith('# ' + portfolioContent.name)`), `${label}: opening types the Markdown source`);
    await b.shot(`${out}-${label}-0-source.png`);
    for (let i = 0; i < 40 && await b.evaluate(waiting); i++) await sleep(100);
    assert.ok(!await b.evaluate(waiting), `${label}: opening finishes`);
    await sleep(900);
    assert.ok(await b.evaluate(`document.getElementById('bkSrc').hidden`), `${label}: source gives way to the rendered chapter`);

    // A key press skips the opening
    await b.evaluate(`portfolioController.loadTheme('notebook', { animate: false }); portfolioController.loadTheme('book', { animate: false })`); await sleep(200);
    await b.evaluate(`dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }))`); await sleep(100);
    assert.ok(await b.evaluate(`!${waiting} && document.getElementById('bkSrc').hidden && BookTheme.anims.every(a => a.playState === 'finished')`), `${label}: a key press skips the opening`);

    // Every fact comes from content.js, across all chapters
    const ids = await b.evaluate(`BookTheme.chapters.map(ch => ch.id)`);
    let text = '';
    for (const id of ids) text += await b.evaluate(`BookTheme.go('${id}'); document.getElementById('bkMain').innerText.replace(/\\s+/g, ' ')`) + ' ';
    for (const fact of [c.name, c.title, c.email, c.about.bio.slice(0, 60), c.about.tagline, `${c.stats.years} years`, c.impact[0].value, c.impact.at(-1).label,
        ...c.experience.map(e => e.position), ...c.experience.map(e => e.achievements.at(-1)), ...c.projects.map(p => p.title), c.projects.at(-1).description.slice(0, 50),
        c.education[0].institution, c.education.at(-1).gpa, c.patents[0].number, ...c.certifications.map(x => x.title), ...c.currentlyReading.map(r => r.title),
        c.currentlyReading[0].notes, c.hobbies.at(-1), 'github.com/ashutosh486'])
        assert.ok(text.includes(fact), `${label}: book shows "${fact.slice(0, 40)}" from content.js`);
    assert.ok(!text.includes(c.phone), `${label}: phone number not shown`);
    // Skills table lists each skill once, and all of them
    await b.evaluate(`BookTheme.go('skills')`);
    const listed = await b.evaluate(`[...document.querySelectorAll('#bkMain tbody code')].map(x => x.textContent.toLowerCase())`);
    assert.equal(listed.length, new Set(listed).size, `${label}: each skill listed once`);
    assert.equal(listed.length, c.stats.skills, `${label}: every skill listed`);
    await b.evaluate(`BookTheme.go('contact')`);
    assert.ok(await b.evaluate(`[...document.querySelectorAll('#bkMain a[download]')].some(a => a.getAttribute('href') === portfolioContent.resume && a.target === '_blank')`), `${label}: résumé link uses content.js path and opens in a new tab`);

    await b.evaluate(`BookTheme.go('intro')`); await sleep(300);
    assert.ok(await b.evaluate(`!!document.querySelector('.bk-figure svg.cc') && !document.querySelector('#bkRoot img')`), `${label}: introduction shows the caricature, not the photo`);
    assert.ok(await b.evaluate(`document.querySelector('.bk-menu').offsetHeight <= innerHeight * 0.2`), `${label}: menu bar takes at most 20% of the screen`);
    await noOverflow('introduction');
    await b.shot(`${out}-${label}-1-intro.png`);

    // A heading link scrolls without changing the URL
    await b.evaluate(`document.querySelectorAll('#bkMain h2 .bk-header')[1].click()`); await sleep(700);
    assert.ok(await b.evaluate(`location.hash === '#book' && document.querySelectorAll('#bkMain h2')[1].getBoundingClientRect().top < innerHeight / 2`), `${label}: heading link scrolls, URL keeps #book`);

    // Sidebar: open by default on wide screens only; numbered like SUMMARY.md
    assert.equal(await b.evaluate(open), !phone, `${label}: sidebar ${phone ? 'closed' : 'open'} at first`);
    assert.ok(await b.evaluate(`(t => t.includes('1. Experience') && t.includes('1.1. ' + portfolioContent.experience[0].position) && t.includes('Introduction'))(document.getElementById('bkSidebar').innerText.replace(/\\s+/g, ' '))`), `${label}: sidebar lists numbered chapters`);
    if (phone) {
        await b.evaluate(`document.querySelector('[data-action="sidebar"]').click()`); await sleep(400);
        assert.ok(await b.evaluate(`${open} && document.getElementById('bkSidebar').getBoundingClientRect().left === 0 && !document.getElementById('bkSidebar').inert`), 'm: toggle opens the sidebar');
        assert.ok(await b.evaluate(`[...document.querySelectorAll('.bk-chapter a')].every(a => a.offsetHeight >= 44) && [...document.querySelectorAll('.bk-menu .bk-icon')].every(a => a.offsetWidth >= 44 && a.offsetHeight >= 44)`), 'm: 44px sidebar links and menu buttons');
        await noOverflow('sidebar open');
        await b.shot(`${out}-${label}-2-sidebar.png`);
    }
    await b.evaluate(`document.querySelector('#bkSidebar [data-ch="projects"]').click()`); await sleep(400);
    assert.ok(await h1() === 'Projects' && await b.evaluate(`document.querySelector('#bkSidebar [data-ch="projects"]').getAttribute('aria-current') === 'page' && location.hash === '#book' && scrollY === 0`), `${label}: sidebar opens Projects and marks it`);
    if (phone) {
        assert.ok(!await b.evaluate(open), 'm: sidebar closes after picking a chapter');
        await b.evaluate(`document.querySelector('[data-action="sidebar"]').click()`); await sleep(400);
        await b.key('Escape'); await sleep(400);
        assert.ok(!await b.evaluate(open), 'm: Escape closes the sidebar');
    } else {
        // Toggle hides it and the chapter recentres
        await b.evaluate(`document.querySelector('[data-action="sidebar"]').click()`); await sleep(400);
        assert.ok(await b.evaluate(`!${open} && document.getElementById('bkSidebar').inert && Math.abs(document.querySelector('.bk-stack').getBoundingClientRect().left - (innerWidth - 750) / 2) < 20`), 'desk: toggle hides the sidebar and recentres the chapter');
        await b.evaluate(`document.querySelector('[data-action="sidebar"]').click()`); await sleep(400);
    }

    // ← → turn chapters; arrows show on the sides (wide) or under the chapter (narrow)
    await b.evaluate(`dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))`); await sleep(300);
    assert.equal(await h1(), 'Skills', `${label}: → goes to the next chapter`);
    await b.evaluate(`dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))`); await sleep(300);
    assert.equal(await h1(), 'Projects', `${label}: ← goes back`);
    assert.ok(await b.evaluate(phone ? `document.querySelector('.bk-nav .bk-next').offsetWidth > 0 && !document.querySelector('.bk-nav-side.bk-next').offsetWidth` : `document.querySelector('.bk-nav-side.bk-next').offsetWidth > 0 && !document.querySelector('.bk-nav .bk-next').offsetWidth`), `${label}: chapter arrows ${phone ? 'under the chapter' : 'on the sides'}`);
    await b.evaluate(`document.querySelector('${phone ? '.bk-nav .bk-next' : '.bk-nav-side.bk-next'}').click()`); await sleep(300);
    assert.equal(await h1(), 'Skills', `${label}: next arrow turns the chapter`);
    await noOverflow('skills');
    await b.evaluate(`BookTheme.go('projects')`); await sleep(300);
    assert.ok(await b.evaluate(cornerClear), `${label}: switcher corner clear at the end of a chapter`);
    await b.shot(`${out}-${label}-3-end.png`);

    // Themes: mdBook's five; the pick paints the page and is remembered
    await b.evaluate(`scrollTo(0, 0); document.querySelector('[data-action="themes"]').click()`); await sleep(200);
    assert.ok(await b.evaluate(`!document.getElementById('bkThemes').hidden && document.querySelectorAll('#bkThemes [data-palette]').length === 5 && document.activeElement.getAttribute('aria-checked') === 'true'`), `${label}: theme menu opens with the current theme focused`);
    await b.shot(`${out}-${label}-4-themes.png`);
    await b.evaluate(`document.querySelector('[data-palette="rust"]').click()`); await sleep(200);
    assert.ok(await b.evaluate(`document.getElementById('bkRoot').dataset.theme === 'rust' && document.getElementById('bkThemes').hidden && document.body.style.backgroundColor === 'rgb(225, 225, 219)' && localStorage.getItem('portfolio-book-theme') === 'rust'`), `${label}: Rust applies, paints the page and is saved`);
    await b.evaluate(`portfolioController.loadTheme('notebook', { animate: false }); portfolioController.loadTheme('book', { animate: false })`); await sleep(200);
    assert.ok(await b.evaluate(`document.getElementById('bkRoot').dataset.theme === 'rust' && document.body.style.backgroundColor === 'rgb(225, 225, 219)'`), `${label}: theme survives a reload`);
    await b.evaluate(`dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }))`); await sleep(300);
    await b.shot(`${out}-${label}-5-rust.png`);
    await b.evaluate(`BookTheme.setPalette('light')`);

    // Search: S opens it, results list chapter » heading, a result opens the chapter with the words marked
    await b.evaluate(`dispatchEvent(new KeyboardEvent('keydown', { key: 's' }))`); await sleep(200);
    assert.ok(await b.evaluate(`!document.getElementById('bkSearch').hidden && document.activeElement.id === 'bkSearchbar'`), `${label}: S opens and focuses search`);
    await b.evaluate(`{ const i = document.getElementById('bkSearchbar'); i.value = 'patent'; i.dispatchEvent(new Event('input')) }`);
    assert.ok(await b.evaluate(`document.querySelectorAll('#bkResults li').length > 0 && document.querySelector('.bk-results-head').textContent.includes("'patent'") && !!document.querySelector('.bk-teaser em')`), `${label}: search finds "patent"`);
    await b.evaluate(`{ const i = document.getElementById('bkSearchbar'); i.value = '<img src=x>'; i.dispatchEvent(new Event('input')) }`);
    assert.ok(await b.evaluate(`document.querySelector('.bk-results-head').textContent.startsWith('No search results') && !document.querySelector('#bkSearch img')`), `${label}: search escapes what the visitor types`);
    await b.evaluate(`{ const i = document.getElementById('bkSearchbar'); i.value = 'patents'; i.dispatchEvent(new Event('input')) }`);
    await b.shot(`${out}-${label}-6-search.png`);
    await b.evaluate(`document.querySelector('#bkResults a').click()`); await sleep(500);
    assert.ok(await h1() === 'Education' && await b.evaluate(`document.getElementById('bkSearch').hidden && document.querySelectorAll('#bkMain mark').length > 0`), `${label}: a result opens the chapter with the words marked`);
    await b.evaluate(`document.querySelector('#bkMain p').click()`);
    assert.equal(await b.evaluate(`document.querySelectorAll('#bkMain mark').length`), 0, `${label}: clicking the page clears the marks`);

    // Print prints the résumé PDF: from an off-screen frame, or in a new tab where the browser can't
    await b.evaluate(`window.open = url => { window.opened = url; }; document.querySelector('[data-action="print"]').click()`); await sleep(1500);
    assert.ok(await b.evaluate(`(f => f ? f.getAttribute('src') === portfolioContent.resume : window.opened === portfolioContent.resume)(document.querySelector('body > iframe'))`), `${label}: print loads the résumé PDF from content.js`);

    await b.evaluate(`portfolioController.loadTheme('notebook')`); await sleep(300);
    assert.ok(await b.evaluate(`BookTheme.onScroll === null && BookTheme.onKey === null && BookTheme.onSkip === null && !document.querySelector('body > iframe') && BookTheme.onWide === null`), `${label}: cleanup removes the listeners`);
    assert.deepEqual(b.errors.filter(e => e.includes('/book.js')), [], `${label}: no runtime errors`);
    b.close();
}
console.log('all book checks passed');
