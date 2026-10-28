# Portfolio Redesign Tracker

Goal: every theme should feel smooth and polished, on desktop and phones. We work through them **one theme at a time**. A theme gets rebuilt from scratch when patching it wouldn't get it there.

## Ground rules

- **`js/content.js` is the single source of truth.** Themes never hardcode facts, numbers, links or dates. Derived numbers (years, unique skills, companies) come from `portfolioContent.stats`. If a theme needs a new fact, add a field to `content.js`.
- **No "AI slop":**
  - No decorative gradients and no purple-blue glow.
  - At most one accent colour per theme.
  - Crisp semi-transparent borders with layered shadows.
  - Real content (photo, numbers) instead of filler.
- **[Vercel Web Interface Guidelines](https://vercel.com/design/guidelines):**
  - 44px tap targets on phones.
  - 16px inputs on phones.
  - `:focus-visible` rings.
  - Animate only transform and opacity.
  - `prefers-reduced-motion` respected.
  - Theme kept in the URL.
  - No `transition: all`.
  - `…` in placeholders.
- **Works at 390px wide**, with no horizontal scroll. The theme switcher is a pill (current theme's tile and name) fixed bottom-right (16px inset) in **every** theme, and a 44px icon button on phones. Its live width is published as `--theme-dock-w`, which themes use to keep that corner clear (ChatGPT sizes a gap beside its composer with it below 1440px).
- **Theme hygiene:** escape anything the visitor types, use no dead image/placeholder URLs, and have `cleanup()` clear every timer and global listener the theme creates.
- Keep all theme files, including the disabled ones (neural, api, prompt, gitdiff, json, training) and the unused ones (agent, aiplayground).

## Branching

| Branch | Purpose |
| --- | --- |
| `main` | Live site |
| `feature/ashutoshcodes` | Integration branch; theme branches merge here after review |
| `theme/<key>` | One branch per theme, cut from `feature/ashutoshcodes` (e.g. `theme/chatgpt`) |
| `theme/shell` | Shared page shell: `index.html`, `main.js`, theme switcher and chooser |

Flow: branch → rebuild → run the tests → update this file → commit on the branch → review → merge into `feature/ashutoshcodes`.

When one branch needs another, cut it from that branch and merge in order. `theme/chatgpt` and `theme/shell` were stacked and are both merged. `theme/modelcard` is cut from `feature/ashutoshcodes` after it was fast-forwarded to `develop` (to pick up the M.Tech `content.js` update).

## Testing

Tests drive the real page in headless Chrome. They need no npm install, only Node 22+ and Google Chrome.

```sh
node tests/shell.test.mjs      # switcher, chooser, refresh, Back, phone sheet
node tests/chatgpt.test.mjs    # screenshots go to tests/screenshots/ (git-ignored)
node tests/modelcard.test.mjs  # desktop + 390px phone
node tests/vscode.test.mjs     # desktop + 390px phone
node tests/terminal.test.mjs   # desktop + 390px phone
```

`tests/cdp.mjs` has two helpers:

- `openPage(hash, { width, height, mobile })` loads the page as a visitor sees it, with the chooser open.
- `openTheme(key, …)` opens a theme with the chooser dismissed. It works for any theme.

## Status

| Theme | Enabled | Status | Branch | Notes |
| --- | --- | --- | --- | --- |
| Shell (switcher, chooser, transitions) | — | **Rebuilt (3 rounds), merged** | `theme/shell` | Merged to `develop` |
| ChatGPT | ✅ | **Rebuilt (3 rounds), merged** | `theme/chatgpt` + `theme/shell` | Merged to `develop` |
| Model Card | ✅ | **Rebuilt (2 rounds), merged** | `theme/modelcard` | Merged to `develop` |
| VSCode | ✅ | **Rebuilt, merged** | `theme/vscode` | Merged to `develop` |
| Terminal | ✅ | **Rebuilt, in review** | `theme/terminal` | |
| Notebook | ✅ | Not started | | 491px wide on phones; header buttons sit top-right |
| Research Paper | ✅ | Not started | | Fits phones |
| Markdown Book | ✅ | Not started | | Sidebar opens over content on phones; headings unstyled |
| Apple Persona Card | ✅ | Not started | | Purple-pink gradient hero to remove |
| Sci-Fi Console | ✅ | Not started | | Dense; everything is cyan |
| Neural, API, Prompt, Git Diff, JSON, Training | ❌ | Parked | | Training needs Chart.js, which isn't loaded |
| Agent, AI Playground | ❌ (not loaded) | Parked | | Agent has links to agents that don't exist |

## Theme log

### Shell (`theme/shell`)

#### Before

- A purple-blue gradient palette button sat bottom-left, covering content in several themes.
- The picker opened on CSS hover *and* JS click, and the two fought. It had no Escape key, no focus handling and no labels.
- Every load picked a **random** theme, so a refresh lost what you were looking at, and there was no way to link to a theme.
- A "Loading theme…" spinner was held up by fixed 400ms + 300ms timers.
- `#themeContainer` kept a `transform`, which breaks `position: fixed` inside themes.

#### After

- **Keeps your theme:** the theme lives in the URL (`#chatgpt`) and in `localStorage`. Refresh and shared links keep it, and Back/Forward step through themes.
- **Chooser:** opens on every visit with the current theme preselected and focused. It shows a 3×3 grid of theme cards; each preview tile uses the theme's own background and accent.
  - It's a native `<dialog>`, which gives a focus trap, Escape and an inert background.
  - Escape, a backdrop click, the collapse button or "Continue with X" collapses it: the window shrinks into the switcher.
  - On phones it's a bottom sheet.
- **Switcher pill:** shows the current theme's tile and name. It mounts inside a theme's `[data-theme-slot]` when there is one (ChatGPT's header), otherwise it floats bottom-right. On phones it's a 44px icon button.
- **Transitions:** themes cross-fade with the View Transitions API, with no artificial delay. Reduced motion switches instantly.
- **Page details:**
  - The tab title is `Name · Theme`.
  - `theme-color` and `color-scheme` follow the theme.
  - There's a skip link.
  - The CDNs are preconnected.
  - Geist is used for the shell UI.
- **Code:** removed the loading overlay, the dead commented routing code and the `console.log` noise in `main.js`.

#### Round 2 (owner feedback)

The feedback was: the top-right pill looked bad, the switcher should sit in the same place as in every other theme, there was a box inside a box on load, and visitors should be able to download the résumé.

- **Switcher:** now one round 44px palette button, fixed bottom-right in every theme, with no label, tile or chevron. The `data-theme-slot` mechanism is gone.
- **No double box:**
  - On open, focus goes to the chooser window itself instead of the current card. That card already has a white border, and the focus ring was drawing a second box around it.
  - Keyboard focus rings on cards now sit on the border (`outline-offset: -1px`).
- **Résumé:** `content.js` `resume` → `docs/Ashutosh_Pandey_Resume.pdf`. The chooser footer has "Download Résumé" ("Résumé" on phones), so it's available in every theme.

#### Round 3 (owner feedback)

- The owner preferred the earlier pill. The tile, name and chevron are restored, now always fixed bottom-right. A `ResizeObserver` publishes the pill's width as `--theme-dock-w`.
- **Résumé links:** browsers ignore `download` for some origins (e.g. a local `file://` copy), so the PDF replaced the portfolio page. Every résumé download link now also has `target="_blank"`: it downloads where allowed, otherwise it opens in a new tab.

#### Verified

Checked with `tests/shell.test.mjs`:

- The chooser asks on first visit with the current theme focused.
- Focus lands on the window, not a card.
- The résumé link uses the `content.js` path, downloads, and opens in a new tab as a fallback.
- Escape collapses it and returns focus to the switcher.
- The switcher is 16px from the bottom-right corner in ChatGPT and in Paper.
- Picking Paper updates `#paper`.
- The switcher never overlaps ChatGPT's composer at 1440, 1100, 1024 or 390px, with the sidebar expanded or collapsed to the rail.
- Refresh keeps Paper and asks again.
- A backdrop click collapses the chooser, and Back returns to the previous theme.
- On phones (390px) there's no overflow, the bottom sheet is full-width and the switcher is at least 44px.

### ChatGPT (`theme/chatgpt`): rebuilt from scratch

#### ChatGPT before

- Animations: messages slid up 20px, a pulsing "Online" dot, sidebar tooltips. Every reply waited a fixed 500ms with no typing indicator.
- Look: a purple gradient with a "Send" button and an icon rail. It didn't resemble ChatGPT.
- Bugs:
  - Typed text was injected as HTML (XSS).
  - Plain questions ("what's your stack?") were answered with "unknown command".
  - Reading covers used `via.placeholder.com`, which no longer works, so they showed as broken images.
  - The help list was hardcoded rather than read from `content.js`.
  - The page was too wide for phones.

#### Round 1

- **Layout:** a dark ChatGPT-style interface. The sidebar lists topics, a profile and social links; on phones it becomes a slide-in drawer with a dimmed backdrop.
- **Composer:** grows as you type. A `/` command menu supports ↑/↓ and Enter/Tab; Shift+Enter adds a new line.
- **Understands plain questions:** typed questions are matched to a topic by keyword. Company and school names come from `content.js`. Unknown input is escaped and answered with suggestions.
- **Replies:** a typing indicator, then the answer reveals block by block. The question scrolls to the top like ChatGPT, and each answer ends with follow-up suggestions.
- **Answer content:**
  - Experience is a timeline.
  - Projects are cards.
  - Certifications include the patent.
  - Reading shows drawn book covers with progress bars.
  - Contact has a copy-email button.
  - Hire shows the `impact` numbers.
- **Code:** `cleanup()` clears pending timers, so switching theme mid-reply is safe.

#### Round 2 (owner feedback)

The feedback was: no gradients, less empty space, shorter skills, use the profile photo, and `content.js` only.

- **Monochrome:** every gradient and the green accent are gone. The look follows ChatGPT's grayscale UI.
- **Photo:** `content.js` `picture` → `images/profile.jpg`, used for the assistant avatar, sidebar profile, welcome screen and hire card. Initials are the fallback.
- **Less empty space:**
  - The chat column is `max-w-4xl`.
  - The welcome screen is a profile row, a 4-up stats strip and four suggestion cards. The cards are the first four non-help `chatCommands`.
  - The sidebar collapses on desktop.
  - On phones there's no reserved space for the old floating button.
- **Skills:** one compact table with one row per category. Each skill appears once. Labels come from the new `content.js` `skillLabels`; `languages` moved to the top of `skills` (order only).
- **Experience:** shows three achievements per role, with a native `<details>` "Show N more".
- **Guidelines:**
  - 16px composer text.
  - 44px mobile targets.
  - `:focus-visible` rings.
  - `touch-action: manipulation`.
  - `overscroll-behavior: contain`.
  - `color-scheme: dark`.
  - Progress animates with `transform`.
  - `tabular-nums`.
  - `aria-live` answers.
  - Labels on icon-only buttons.
- **Deliberate deviation:** Enter sends and Shift+Enter adds a line, as in ChatGPT. The guidelines suggest ⌘+Enter for textareas.

#### Round 3 (owner feedback, on `theme/shell`)

- **Sidebar header:** the brand (photo and name) is now plain text. "New chat" is its own pencil button, so hovering highlights only the pencil.
- **Collapse → icon rail:**
  - On desktop the sidebar collapses to a 60px rail, not to nothing.
  - The rail keeps the expand button, new chat, every topic icon (each with a tooltip), the photo and the links.
  - The width animates.
- **Header:** the theme pill was removed from the top-right corner.
- **Content above the composer:** the fade overlay that dimmed the conversation's last line above the composer was removed.
- **Résumé:**
  - A `/resume` command was added to `content.js` `chatCommands`.
  - Free text such as "can I download your CV?" now maps to it.
  - The answer is a file card with Open and Download buttons.
  - The download icon is also in the sidebar links, and "Download Résumé" is on the hire card.
- **Composer:** a gap keeps it clear of the floating switcher below 1280px.

#### ChatGPT verified

Checked with `tests/chatgpt.test.mjs`:

- The bio comes from `content.js`.
- Free text maps to topics, including the "Nielsen" and "NIT" names from `content.js`.
- XSS is escaped.
- `/toString` and "already" fall through to unknown.
- The slash menu works with arrow keys and Enter.
- Progress bars fill, and the question scrolls to the top.
- The new-chat hover area is only the pencil.
- The desktop sidebar collapses to a 60px rail with topic icons visible and expands back to 260px.
- `/resume` and "download your CV?" give a download link with the `content.js` path.
- Every résumé download link opens in a new tab rather than replacing the page.
- Switching theme mid-reply throws no errors.
- On phones there's no overflow and the drawer works.

### Model Card (`theme/modelcard`): rebuilt from scratch

#### Model Card before

- A stack of identical white cards, each with a different coloured icon square (purple, blue, green, orange, indigo, teal), gradient stat tiles and a purple-blue gradient contact card.
- "Production Ready" / "Open to Opportunities" badges and a "Version 2026.1 · Last Updated: today" line, all made up in the theme.
- Skills listed per category with heavy duplication (Python under four categories).
- Only four projects, descriptions cut at 100 characters mid-word.
- The phone number in a contact tile; 465px wide on phones.

#### Model Card after

- **Looks like a Hugging Face model page:** `user / Model-Name` header (GitHub username from `content.js`), tag pills (specialization, interests, location, years), and a "Model card | Résumé" tab bar where Résumé opens the PDF.
- **README with the standard model card sections**, all from `content.js`:
  - *Model Details*: bio and a "Developed by / Model type / …" list.
  - *Evaluation*: `impact` as a results table.
  - *Training Details*: a **training schedule** (a Gantt chart of every role on a shared time axis, durations computed from `period`) and each role with three achievements plus a native `<details>` "Show N more", and its technologies.
  - *Uses*: every project as a card, with its site link when there is one.
  - *Technical Specifications*: skills as one table, each skill listed once (same dedupe as ChatGPT).
  - *Training Data*: education and certifications.
  - *Citation*: the patent as a BibTeX block with a copy button.
  - *Model Card Contact*: email and links.
- **Sticky sidebar** (below the README on phones): photo, Hire me (mailto), Download résumé, icon links; "Model size" from `stats`; a "Model tree" from the first degree (base model) through each company (fine-tunes) with the roles held there.
- **Look:** white and grays, Geist, crisp borders with layered shadows. One accent (amber) used only for the current role's bar and the current node in the model tree. No gradients.
- **Motion:** sections rise in on scroll (IntersectionObserver, opacity + transform); the schedule bars grow in with a stagger (`scaleX`). Skipped entirely under reduced motion.
- **Guidelines:** 44px targets on phones, `:focus-visible` rings, `tabular-nums`, labelled icon links, `touch-action: manipulation`, chart has a text `aria-label`. `cleanup()` disconnects the observer and clears the copy-feedback timer.
- **Dropped:** the phone number (still in `content.js`; see notes below), and the invented status badges and version line.

#### Model Card round 2 (owner feedback)

The feedback was: the Résumé tab looks like it should open in the same tab, the page scrolls too far at the bottom and the sidebar gets pushed up, "Show N more" leaves the toggle stuck between the bullets (ChatGPT too), and add some benchmark graphs.

- **Résumé tab** is a real tab now (`role="tablist"`): it swaps the page in place and the URL keeps `#modelcard`. An embedded PDF viewer was tried and rejected (it looked like a reader, not part of the app), so the résumé is now an HTML page built from `content.js`: summary, all experience, projects, skills (deduped), education, certifications and the patent, on a white sheet in the theme's own type. "Open PDF" and "Download PDF" sit above it. It fits phones too.
- **Bottom of the page:** the trailing space is now just enough to clear the switcher (it was about 150px). On desktop the bottom padding sits inside the README column, so the sticky sidebar is never pushed off the top. The sidebar is capped to the viewport height and scrolls on its own on short screens.
- **Show N more** (Model Card and ChatGPT): the hidden items join the end of the same list and the button moves below them as "Show less" (`aria-expanded`). They rise in, except under reduced motion.
- **Graphs:** a technology-usage bar chart and a cumulative "training curve" were tried under Evaluation and removed at the owner's request (they didn't look good). Revisit later if wanted.

#### Model Card verified

Checked with `tests/modelcard.test.mjs` at 1440px and 390px:

- Name, bio, first achievement, degree, patent number, impact and `stats.years` come from `content.js`.
- One schedule bar per role; every skill appears once.
- Résumé links use the `content.js` path and open in a new tab.
- No horizontal overflow at 390px.
- Every section is revealed after scrolling, and nothing sits under the switcher at the bottom of the page.
- Switching theme disconnects the observer, with no runtime errors.
- Round 2: show more expands in place with the button below. The Résumé tab switches in place, keeps `#modelcard`, is built from `content.js` (no embedded PDF viewer) and has no overflow at 390px. The sidebar isn't pushed off the top at the end, and there's no more than 100px of blank space after the content.

### VS Code (`theme/vscode`): rebuilt from scratch

#### VS Code before

- A fixed 256px sidebar and a 192px fake terminal (`ls -la`, `git status`, today's date): 594px wide on phones, with the sidebar taking 2/3 of the screen.
- Every file was Markdown pushed through a regex converter (headings in blue, green and yellow; tables in cyan).
- One tab that just renamed itself; activity bar icons did nothing; no keyboard support; file rows were `div`s.
- Showed the phone number twice; "Open To" list (speaking, consulting) was made up in the theme.
- Switching files waited on a 150ms `setTimeout`.

#### VS Code after

- **Looks like VS Code (Dark Modern):** title bar with the command center, activity bar (Explorer, Go to File, then GitHub / LinkedIn / Website / Email), Explorer tree, tabs, breadcrumbs, editor and status bar (branch, problems, `Ln, Col`, encoding, language mode). Seti file icons. One accent: VS Code blue.
- **Workspace built from `content.js`:**
  - `README.md`: photo, name, title, tagline, bio, `impact` table, `stats`, interests, contact links and the résumé.
  - `experience.md`: every role with all achievements and technologies.
  - `projects/`: one Markdown file per project (slug from the title), with highlights, stack and site link.
  - `reading.md`: `currentlyReading`.
  - `skills.json`: syntax-highlighted, line-numbered, each skill once (same dedupe as Model Card), valid JSON.
  - `education.yml`: education, certifications and the patent, with clickable URLs.
  - `Ashutosh_Pandey_Resume.pdf`: VS Code's "binary file" notice with Open in browser / Download. No embedded viewer.
  - Markdown files show as VS Code's Markdown preview; JSON/YAML as source with a line gutter. Clicking a line highlights it and updates `Ln N, Col 1`.
- **Behaves like VS Code:**
  - Opening a file adds a tab; tabs close (the neighbour takes over); closing them all shows the empty editor with its shortcuts.
  - Each file keeps its scroll position.
  - `⌘P` / `Ctrl+P` (or the command center) opens Quick Open: fuzzy file search, ↑/↓, Enter, Escape, click outside.
  - `⌘B` / `Ctrl+B` or the Explorer icon hides the sidebar. The `projects` folder and the root collapse.
- **Phones:** the activity bar goes away; a 44px menu button slides the Explorer in as a drawer over a dimmed backdrop (Escape or a tap outside closes it, picking a file closes it). 44px rows and tabs, 16px Quick Open input, only the active tab shows its close button.
- **Motion:** files fade and rise in, Quick Open drops in, folder chevrons rotate, the drawer slides. All transform/opacity, all off under reduced motion.
- **Corner:** the editor ends with enough padding to clear the switcher, and the status bar's right side stops at `--theme-dock-w` + 24px.
- **Code:** `cleanup()` removes the window key listener. Text in source views is escaped. No timers.
- **Dropped:** the fake terminal, the phone number, the "Open To" list.

#### VS Code verified

Checked with `tests/vscode.test.mjs` at 1440px and 390px:

- README shows name, bio, impact, email and `stats.years` from `content.js`; one file per project.
- Clicking a file makes it the active tab and highlights it in the Explorer; on phones the drawer slides in and closes after the pick, with 44px targets.
- `skills.json` is valid JSON with each skill once; the status bar follows the file and the clicked line.
- `education.yml` shows the degree, patent number and certificate links.
- `Ctrl+P` focuses Quick Open, "asr" + Enter opens the ASR project.
- The PDF tab has no embedded viewer and downloads from the `content.js` path in a new tab.
- Closing every tab shows the empty editor, which reopens README. `Ctrl+B` hides the sidebar.
- No horizontal overflow; nothing under the switcher at the end of a file.
- Switching theme removes the key listener, with no runtime errors.

### Terminal (`theme/terminal`): rebuilt from scratch

#### Terminal before

- A 76-column ASCII "ASHUTOSH" banner and fixed-width box tables (skills), too wide for phones. The banner hardcoded the name.
- Typed commands were echoed as HTML (XSS). `education` was defined twice. The help list was hardcoded.
- A 500ms startup timer ran `help` even after you switched theme, and a `document` click listener was never removed.
- Showed the phone number twice. The "I'm available for…" list and "Response time: 24 hours" were made up in the theme.
- Experience showed two achievements per role; green, cyan, yellow and magenta all used as accents.

#### Terminal after

- **Looks like a zsh session:** a slim title bar (`guest@ashutosh: ~ — zsh`, host from the first name in `content.js`), a `guest@ashutosh ~ %` prompt, Geist Mono, near-black with one accent (terminal green).
- **Login is `neofetch`:** the profile photo next to Title, Focus, Location, Uptime (`stats.years`), companies, projects and skills from `stats`, then a clickable menu of every command.
- **Commands come from `content.js` `chatCommands`** (names and descriptions), plus shell built-ins `neofetch`, `history`, `clear`, and aliases `ls`/`man` → help, `whoami` → about, `cv` → resume. All from `content.js`:
  - `experience`: every role and every achievement as a `git log --graph` (a `*` per role, joined by a rail).
  - `projects`, `skills` (each skill once, same dedupe as VS Code), `education`, `certifications` (with the patent), `reading` (an ASCII progress bar), `contact`, `hire` (impact numbers and links), `resume` (Open / Download).
- **Behaves like a terminal:** Tab completes (common prefix, or lists the matches), ↑/↓ history, Ctrl+L clears, Ctrl+C cancels the line. Unknown commands print `zsh: command not found` with a "Did you mean …?" (typos within two edits, or a 3+ letter prefix). `sudo` has an answer.
- **Clickable:** every command name in the output is a button. A clicked command types itself at the prompt, then runs.
- **Scrolling:** a long answer starts at its command line; a short one keeps the prompt in view. Clicking the screen focuses the prompt on desktop, but not when you're selecting text or clicking a link.
- **Motion:** output streams in block by block (opacity + transform, staggered); typing and smooth scroll are skipped under reduced motion.
- **Phones:** the photo sits above the details, command buttons are 44px, the prompt input is 16px. The screen's bottom padding keeps the prompt clear of the switcher.
- **Code:** typed text is escaped; no global listeners; `cleanup()` clears the typing timer. The old `.text-magenta-400` helper is gone. Geist Mono added to the font link in `index.html`; the chooser tile uses the new background.
- **Dropped:** the ASCII banner, the phone number, the invented availability list and response time, "Last login".

#### Terminal verified

Checked with `tests/terminal.test.mjs` at 1440px and 390px:

- The login shows name, title, `stats.years`, location and the photo from `content.js`; the menu lists every `chatCommand`.
- `experience` shows every role with every achievement, and the answer starts at its command line.
- A clicked command types itself, then runs; `skills` lists each skill once (`stats.skills`).
- `help` shows every `chatCommands` description; `whoami` gives the bio; on phones command targets are at least 44px.
- Typed HTML is escaped; "projcts" suggests `projects`; Tab completes "cert"; ↑/↓ walk the history.
- Résumé links use the `content.js` path and open in a new tab; no phone number anywhere.
- No horizontal overflow; nothing under the switcher at the end; Ctrl+L clears.
- Switching theme mid-typing clears the timer, with no runtime errors.

## Shared backlog (shell / cross-theme)

- [x] ~~Loading spinner with artificial delay~~ (shell)
- [x] ~~Theme button covering content~~ (shell: one bottom-right button; themes keep that corner clear)
- [x] ~~Picker hover/click conflict, no Escape/focus/labels~~ (shell)
- [x] ~~`#themeContainer` transform breaking `position: fixed`~~ (shell)
- [x] ~~Random theme on load, no shareable links~~ (shell: `#theme` and localStorage)
- [ ] **Each theme keeps the bottom-right corner clear** (`--theme-dock-w` + 24px wide, 60px tall) when redesigned.
- [ ] **Tailwind:** the CDN script isn't meant for production. Move to a Tailwind CLI build.
- [x] ~~Favicon~~ (shell: `images/favicon.png`, a round crop of the profile photo; `images/apple-touch-icon.png` for home screens)
- [ ] **Basics:** meta description, Open Graph tags. Strip `content.js`'s `console.log`s. Remove the committed `.DS_Store` files.
- [x] ~~Terminal timers~~ (terminal: no startup timer; `cleanup()` clears the typing timer)

## content.js notes (for the owner to decide)

- `summary` says "6+ years"; computed `stats.years` is 8.
- `coverImage` and `projects[].image` still point at `via.placeholder.com`, which no longer works. Themes should not use them until real images are added. (`picture` now uses `images/profile.jpg`.)
- The phone number is shown publicly in several themes (and in the résumé PDF).
- The Model Card BibTeX lists only `name` as the patent's author. If the patent has co-inventors, add them to `patents[]` in `content.js`.
- The résumé PDF lives in `docs/` next to this tracker. Consider moving it to `files/` or `assets/` and updating `resume` in `content.js`.
