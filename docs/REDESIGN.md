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
node tests/notebook.test.mjs   # desktop + 390px phone
node tests/paper.test.mjs      # desktop + 390px phone
node tests/book.test.mjs       # desktop + 390px phone
node tests/apple.test.mjs      # desktop + 390px phone
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
| Terminal | ✅ | **Rebuilt (5 rounds), merged** | `theme/terminal` | Merged to `develop` |
| Notebook | ✅ | **Rebuilt (2 rounds), merged** | `theme/notebook` | Merged to `develop` |
| Research Paper | ✅ | **Rebuilt (2 rounds), merged** | `theme/paper` | Merged to `develop` |
| Markdown Book | ✅ | **Rebuilt (3 rounds), merged** | `theme/book` | Merged to `develop` |
| Contact Card (was Apple Persona Card) | ✅ | **Rebuilt, in review** | `theme/apple` | iOS Contacts card with a Contact Poster |
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

#### Terminal round 2 (owner feedback)

The feedback was: it isn't true to a real terminal (it should match the visitor's device, and be a plain terminal on phones), the earlier version looked better, and it needs a beautiful opening animation like a loading screen instead of looking bland.

- **Matches the device** (`detect()`): macOS gets macOS Terminal (traffic lights, `guest — -zsh — 138×34` title with the live window size, zsh prompt, `Last login: …`). Windows gets Windows Terminal running PowerShell (tab strip, window controls, `PS C:\Users\guest>`, the real PowerShell banner and "is not recognized as the name of a cmdlet" error, a bar cursor). Linux and the rest get Ubuntu's GNOME Terminal (header bar, aubergine background, Tango colours, `guest@ashutosh:~$`, Ubuntu's "Command 'x' not found, did you mean:"). Phones and narrow windows get a plain full-screen terminal with no chrome. Each uses its OS's terminal font where installed (SF Mono, Cascadia Mono, Ubuntu Mono), with Geist Mono as the fallback.
- **Window on the desk:** on desktop the terminal is a window with layered shadows that zooms open, and the switcher sits on the desk below it. (Round 3 removed the window buttons.)
- **Boot sequence:** the greeting prints, `./portfolio` types itself, and a loader spins through each module from `content.js` (experience, projects, skills, education, certifications) with a filling progress bar. It folds into one `✔ loaded 5 modules in 1.4s` line, then the first name prints as a block-letter banner (built from `content.js` with a 5×5 pixel font and a drop shadow, scaled to fit any width) and neofetch draws in. Any key, click or tap skips it, and reduced motion shows it all at once. It takes about 3.5s.
- **Portrait instead of the photo:** your photo is drawn as a half-block pixel portrait in the terminal's green, the way terminal image viewers (`chafa`, `viu`) do it. It's a head-and-shoulders crop faded at the edges, and it prints row by row. An ASCII-character version was tried and dropped because it didn't read as a face. If the canvas can't read the image (a local `file://` copy), the photo is shown instead.
- **Colour like the earlier version:** each OS's real ANSI palette. Titles are yellow, labels and links cyan, prompt, bullets and banner green, and errors red, and neofetch ends with the palette's colour swatches. *Deliberate deviation from the one-accent rule:* terminals are ANSI-coloured, and the owner preferred the earlier multi-colour look.
- **Real cursor:** a block cursor that blinks when focused and turns hollow when not (a bar on Windows). The input sits transparent over the echoed text.
- **Phones:** commands are 44px bordered buttons in a wrapping grid (not underlined words with big gaps). (Round 5 went back to the desktop look with hidden 44px tap areas.)
- **Code:** `cleanup()` also removes the skip listener and the window-size observer. Boot waits are cancellable, so switching theme mid-boot stops it.

#### Terminal round 2 verified

Checked with `tests/terminal.test.mjs` at 1440px and 390px:

- The boot shows the loader before the prompt; a key press skips straight to the finished boot.
- macOS on desktop and the phone terminal on phones; forcing Windows and Linux gives their prompts and not-found wording.
- The banner spells the first name from `content.js`; the portrait is drawn; the menu lists every `chatCommand`.
- The prompt echo shows typed text with the cursor after it.
- All round 1 checks still pass.

#### Terminal round 3 (owner feedback)

The feedback was: the boot plays in the background before a theme is chosen; the prompt shows a text box although the blinking cursor already says where to type; the boot header takes too much of the screen (keep it to 10–20%); the window buttons do nothing, so drop them; and add colour options if real terminals have them.

- **Waits for the chooser:** the window stays hidden while the theme chooser is open. When the chooser closes, the window zooms open and the boot starts. Switching to Terminal from the chooser starts it straight away.
- **No box around the prompt:** the input has no focus outline; the block cursor shows focus (solid and blinking when focused, hollow when not).
- **Compact boot header (about 15% of the window):** a small pixel portrait beside the name banner, then two lines: name and title, then location, years, companies, projects and skills. The full card with the big portrait is still there under `neofetch`.
- **No dead buttons:** the traffic lights, the Windows tab close, new-tab and window controls, and the Ubuntu header buttons are gone. Each OS keeps only its title (macOS with the live window size, the PowerShell tab on Windows, `guest@ashutosh: ~` on Ubuntu).
- **Colour schemes:** a `theme` command, like a terminal's profiles: `default` (the OS's own), `homebrew`, `dracula`, `solarized-dark` and `solarized-light`. `theme` lists them with a preview swatch (background, text and ANSI colours) and marks the current one. Click one or type `theme dracula`; `theme default` goes back. The pick is remembered in this browser. `theme` is in the boot menu and in `help`.

#### Terminal round 3 verified

Checked with `tests/terminal.test.mjs` at 1440px and 390px:

- With the chooser open the window is hidden and nothing has printed; closing the chooser opens it and starts the boot.
- The boot header is at most 20% of the window; the focused prompt has no outline.
- The menu lists every `chatCommand`, then `theme`.
- `theme` lists five schemes; clicking `dracula` applies it and remembers it; an unknown scheme is rejected; `theme default` restores the OS colours.
- All earlier checks still pass.

#### Terminal round 4 (owner feedback)

The feedback was: `clear` wipes the boot header too, but that top section should stay; and draw a caricature of a plus-size person working on a laptop.

- **`clear` and Ctrl+L keep the boot header:** everything else goes, and the header stays at the top without replaying its entrance animation.
- **Caricature (`js/caricature.js`, shared by every theme):** a hand-drawn SVG of a plus-size developer behind a laptop: round full-cheeked face, short side-swept black hair, light stubble, big smile, light-blue collared shirt, laptop with stickers, a coffee mug. It's animated: the screen glow flickers on the face, steam rises from the mug, and bits of code (`</>`, `01`, `{ }`) float up. (Round 1 also had blinking, typing arms and a nod; see caricature round 2 for the current motion.) Everything is off under reduced motion.
  - `caricatureSVG(label)` returns the inline SVG; each copy gets its own clip-path id. Colours are `--cc-*` variables (skin, hair, shirt, laptop, mug, glow, code), so each theme can recolour it; the styles live under `.cc` in `styles.css`.
  - In Terminal it replaces the small portrait in the boot header. The floating code takes the terminal's green and the glow its cyan, so it follows the colour scheme. The pixel photo portrait is still under `neofetch`.

#### Terminal round 4 verified

Checked with `tests/terminal.test.mjs` at 1440px and 390px:

- The boot header shows the caricature.
- Ctrl+L and `clear` leave exactly the header (with the caricature) on screen.
- `neofetch` still draws the pixel portrait.
- All earlier checks still pass.

#### Caricature round 2 (owner feedback)

The feedback was: the lips don't move, the coffee looks like it's floating, the hand motion isn't visible (eye movement would be enough, as if reading), and people who code look serious, with changing expressions.

- **Reading eyes:** eye whites with pupils that scan three lines left to right, then glance up to think; half-lidded upper lids give a focused look; it still blinks. The typing-arm motion is gone.
- **Expressions on a 12s working cycle:** focused (brows drawn in, flat mouth, lips muttering now and then), thinking (one brow up, pursed mouth, head tilted), focused again, puzzled (frown, brows knitted), then a small "got it" smile. Mouths cross-fade (opacity) and brows and head move with transforms, so it works in every browser. Under reduced motion it rests on the focused face.
- **Grounded:** a solid desk; the laptop and the mug (with a contact shadow) stand on it.

#### Terminal round 5 (owner feedback)

The feedback was: on phones every clickable command is a bordered tile; it should look the same as on desktop.

- **Phones match desktop:** commands are the same dotted-underlined green words (menu, `help`, suggestions, scheme list), and Open / Download / Write to me are the same small buttons. The phone prompt shows `guest@ashutosh:~$` like the desktop ones. Each keeps a 44px tap area through an invisible `::after` hit zone, and the rows are spaced so neighbouring hit zones barely overlap. Checked by `tests/terminal.test.mjs`: no tile border, and a tap area of at least 44px.

### Notebook (`theme/notebook`): rebuilt from scratch

#### Notebook before

- A generic white page with an orange "Run All" button and a green gradient "Hire Me" button. It didn't look like Jupyter.
- Only the second cell had run; every other cell waited for a click. Each run replaced the cell's HTML and re-bound every listener on the page.
- The cells pasted `content.js` into Python source as `JSON.stringify` dumps, so the code was mostly data. The output showed the phone number and a fixed "featured projects: 3".
- 491px wide on phones, with the header buttons pushed off to the top-right.
- Timers from Run All were never cleared, and `transition: all` was used on every cell.

#### Notebook after

- **Jupyter Notebook 7 (light):**
  - The header has the logo, `Ashutosh_Pandey.ipynb` and "Last Checkpoint".
  - The toolbar has only buttons that work: Run (and advance), Interrupt, and Restart & Run All.
  - The kernel indicator reads "Python 3 (ipykernel)", with a hollow circle when idle and a filled one when busy.
  - The page is white on grey with Jupyter's blue selection bar, `[n]:` prompts (blue for input, orange-red for output) and Jupyter's Python syntax colours.
- **Opening (after the theme chooser closes):** the first cell types itself in edit mode, then the whole notebook runs. Every prompt shows `[*]:`, the kernel goes busy, and the outputs appear one by one, numbered in order. A key press or a click skips to the finished notebook. With reduced motion, everything shows at once.
- **Short code, real outputs:** cells read like real notebook code (`pd.DataFrame(me.projects)`, `display(Markdown(...))`, `print(...)`). Every output is built from `content.js`:
  - **Profile:** the caricature (`js/caricature.js`, code glyphs in Jupyter orange), tagline, bio, stats and interests.
  - **Impact, Projects and Education:** pandas DataFrame tables.
  - **Experience:** rendered Markdown per role.
  - **Skills:** aligned stdout, each skill once.
  - **Patents and certificates:** links.
  - **Reading:** text progress bars.
  - **Contact:** links plus the résumé download.
  - There are no charts, and the phone number is not shown.
- **Command mode:** click a cell to select it. Shift+Enter runs it and selects the next cell; Ctrl/⌘+Enter runs it in place; ↑/↓ or k/j move the selection. Cells queue like a real kernel: each run takes the next execution count, and Interrupt resets queued cells to their last count.
- **Phones:** full-width page with prompts above their cells (as JupyterLab does on narrow screens) and 44px toolbar buttons. Wide DataFrames scroll sideways inside their output, and long text keeps a readable column width.

#### Notebook verified

Checked with `tests/notebook.test.mjs` at 1440px and 390px:

- With the chooser open nothing runs and the first cell is empty. Closing the chooser types it, shows `[*]:` while the kernel is busy, then numbers every cell 1…n in order.
- A key press skips straight to the finished run.
- The facts come from `content.js`: name, bio, stats, impact, every role's last achievement, every project, degree, patent number, certificates, books and email. Each skill is listed once and all of them are listed.
- The résumé link uses the `content.js` path and opens in a new tab, and the profile shows the caricature rather than the photo.
- The header takes at most 20% of the screen. There's no horizontal overflow, and toolbar buttons are 44px on phones.
- Click selects a cell and ↓ moves the selection. Shift+Enter runs the cell with the next count and advances; Ctrl+Enter runs it in place.
- Interrupt stops a run with no `[*]` left. Restart & Run All renumbers from 1.
- The switcher corner is clear at the end of the notebook. Cleanup removes the listeners, and there are no runtime errors.

#### Notebook round 2 (owner feedback)

The feedback was that the notebook should have Jupyter's other options and didn't show everything. Of the options offered (menu bar, table of contents, dark theme, cells visitors can type in), the owner picked the menu bar.

- **Menu bar:** Notebook 7's File, Edit, View, Run, Kernel and Help menus, keeping only items that work here. Settings is left out because none of its real options would do anything.
  - **File:** Download saves a real `.ipynb` (nbformat 4) with the current outputs and execution counts, so it opens in Jupyter. The caricature is left out of the file because it needs this page's CSS. Download Résumé (PDF) is also here.
  - **Edit:** Clear Cell Output, or Clear Outputs of All Cells. As in Jupyter, clearing also clears the execution count.
  - **View:** Collapse or Expand All Code, and Collapse or Expand All Outputs. Collapsed parts show Jupyter's `···` placeholder, which expands that cell when clicked. Show Line Numbers is ticked when on.
  - **Run:** Run Selected Cell, Run Selected Cell and Do not Advance, Run All Above Selected Cell, Run Selected Cell and All Below, and Run All Cells.
  - **Kernel:** Interrupt, Restart (counts start from 1 again), Restart and Clear Outputs, and Restart and Run All.
  - **Help:** a Keyboard Shortcuts dialog.
  - Menus open on click. With one open, hovering another title switches to it. ↓ opens a menu on its first item, ←/→ move between menus, and Escape returns to the title. A click outside closes it. On phones the titles and items are 44px and a menu spans the screen.
- **More of Jupyter's keys:** `I, I` interrupts, `0, 0` restarts the kernel, `Shift+L` toggles line numbers and `H` opens the shortcuts.
- **Content that was missing:**
  - Project highlights and degree highlights are now table columns.
  - Each book shows its notes and a link (URLs in text output become links, as in Jupyter).
  - A new "Outside work" cell prints `me.hobbies` as IPython shows a list.

#### Notebook round 2 verified

Checked with `tests/notebook.test.mjs` at 1440px and 390px:

- The menu bar reads File, Edit, View, Run, Kernel, Help. Each menu opens on screen, with 44px items on phones. A click outside closes it, and ↓, → and Escape behave as described.
- File › Download saves `Ashutosh_Pandey.ipynb`. The file is nbformat 4 with every cell, the same execution counts as the page, and every output, without the caricature.
- Clear Outputs of All Cells empties every output and count, and Run All Cells brings them back. Run Selected Cell and All Below, from the last cell, runs only that cell.
- Collapse All Code shows placeholders, and clicking one expands that cell. Collapse All Outputs works. Show Line Numbers is ticked, and Shift+L turns it off.
- Help › Keyboard Shortcuts and `H` open the dialog, and Escape closes it. `0, 0` restarts the counts.
- Project highlights, degree highlights, book notes and every hobby come from `content.js`.
- All round 1 checks still pass.

### Research Paper (`theme/paper`): rebuilt from scratch

#### Research Paper before

- A white page in Times with two loose columns. It looked like a styled web page, not a paper.
- The CSS forced colours with `!important` on every element, including links.
- The prose was invented ("An Empirical Analysis…", "Open to collaboration…"). "References" were the first three projects cited with today's year.
- It showed only three projects and only the latest role's achievements. The phone number was shown.

#### Research Paper after

- **Chrome's PDF viewer:** the dark toolbar has the outline button, `pandey2026.pdf`, a page box (`1 / 3`), zoom − / % / +, and a download button for the résumé PDF. Every control works:
  - **Outline:** lists the PDF's bookmarks (sections and roles) and marks the one being read. On wide screens it is open and pushes the pages aside. Elsewhere it slides over the pages and closes after a jump or on Escape.
  - **Page box:** follows the scroll. Typing a number and pressing Enter jumps to that page.
  - **Zoom:** steps through Chrome's levels (50–200%). The page starts fitted to the width, up to 125%.
- **Typeset like LaTeX:** the font is Latin Modern (Computer Modern), loaded from jsDelivr (`latex.css@1.10.0`). Pages are Letter-sized with two columns in the ICML style. JS fills the columns block by block:
  - Headings stay with the text after them.
  - Figure 1 and Table 1 float to the top of the next column when they don't fit, as LaTeX floats do.
  - The last page's columns are balanced.
  - Text is never clipped: a block taller than a column stays where it is.
  - Typesetting runs again once the font loads.
- **The paper:** every fact comes from `content.js`.
  - The arXiv identifier runs down page 1's left margin.
  - The title is the tagline; the author block shows name, title, company, location and email. A footnote lists website, GitHub and LinkedIn.
  - The abstract is the bio plus the stats, followed by keywords from `interests`.
  - **Figure 1** is the caricature.
  - **Introduction:** short bio and fun fact (emoji dropped). The impact numbers are the "main contributions", followed by a "rest of this paper" paragraph whose section links work.
  - **Experience:** every role and every achievement.
  - **Projects:** every project, with its highlights.
  - **Technical Stack:** Table 1 in booktabs style, each skill listed once.
  - **Education and Credentials:** degrees, the patent and certifications.
  - **Ongoing Work:** books in progress.
  - **Acknowledgments:** hobbies.
  - **References:** numbered entries for project sites, the patent, certificates and books. Citations `[n]` scroll to their entry without touching the `#paper` hash.
  - The phone number and `summary` (which says "6+ years") are not used.
- **Opening (after the theme chooser closes):** a `pdflatex` log streams, listing a `.tex` file per section, and ends with "Output written on pandey2026.pdf (3 pages)." Then the pages rise in, and page 1's title, authors and first blocks set in reading order. A key press or click skips it. With reduced motion, the paper shows at once.
- **Phones:** no fixed pages. The paper is one flowing sheet at 15.5px, with the arXiv line at the top and the footnote at the end. The page box and zoom are hidden, and toolbar buttons are 44px. The chooser tile is now Chrome's viewer grey with a PDF icon.

#### Research Paper verified

Checked with `tests/paper.test.mjs` at 1440px and 390px:

- Nothing plays behind the chooser. Closing it shows the pdflatex log, which ends with "Output written on…" and closes before the pages appear. A key press skips the opening.
- The facts come from `content.js`: name, title, email, bio, stats, impact, every role's last achievement, every project, institutions, GPA, patent number, every certificate, books, notes and hobbies.
- Table 1 lists each skill once and all of them. Every citation resolves, and the bibliography has one entry per site, patent, certificate and book.
- The résumé download uses the `content.js` path and opens in a new tab. Figure 1 is the caricature, not the photo.
- The toolbar takes at most 20% of the screen, and no column overflows its page.
- A citation scrolls to its reference and the URL stays `#paper`.
- Desktop has 3 two-column pages, counted in the toolbar. The page box jumps to page 2. Zoom out works, and zoom in stops at 200% with no page-level horizontal overflow.
- The outline opens and jumps to Projects, marking it. On phones it closes after the jump and on Escape. On desktop, closing it refits the page.
- Phones show one sheet with 44px buttons and text of at least 15px.
- The switcher corner is clear at the end. Cleanup removes the listeners, and there are no runtime errors.
- All other suites (shell, ChatGPT, Model Card, VS Code, Terminal, Notebook) still pass.

#### Research Paper round 2 (owner feedback)

- **Outline highlight jumped ahead:** clicking Education marked References. In two columns, a later right-column heading can sit higher on screen than the left-column one being read, and the highlight went by screen height. It now follows reading order: the current section holds the first block not yet scrolled past (left column, then right). A clicked item stays marked while the page scrolls to it and until its heading leaves the screen.
- `tests/paper.test.mjs` now jumps to Education, scrolls a little, and checks that Education stays marked.

### Markdown Book (`theme/book`): rebuilt from scratch

#### Markdown Book before

- A GitBook-style page built from Tailwind classes: initials in a purple-blue gradient tile, a gradient "Contact Me" button, and a round floating menu button on phones.
- On phones the sidebar opened over the content. Chapter headings had no styles (Tailwind's reset), so they looked like body text.
- The chapters were HTML templates with some invented copy.

#### Markdown Book after

- **Looks like mdBook** (the Rust book): menu bar, numbered `SUMMARY.md` sidebar (Introduction, 1. Experience with 1.1–1.4 per role, 2. Projects, 3. Skills, 4. Education, 5. Reading List, then Contact after a spacer), and mdBook's own fonts (Open Sans, Source Code Pro from jsDelivr), sizes and colours. Every control works:
  - **Sidebar toggle:** open on wide screens, where it pushes the page (the chapter re-centres with a FLIP, so only transforms animate). Under 1080px it starts closed and slides the page aside like mdBook. It closes after a pick, on a tap beside it, or on Escape.
  - **Themes:** mdBook's five (Light, Rust, Coal, Navy, Ayu) with their real palettes. The first visit follows the OS (Navy when dark, like mdBook). The choice is remembered and also paints the page background, browser colour and scrollbars.
  - **Search** (button, S or /): mdBook's search bar and results ("N search results for '…'", `Chapter » Heading`, teaser with the words in bold). ↑/↓ move through the results. A result opens the chapter at that heading and marks the words, and clicking the page clears the marks.
  - **Print:** prints the résumé PDF (from `content.js`) through an off-screen frame. Where the browser has no inline PDF viewer (phones) or refuses, the PDF opens in a new tab to print from there. Ctrl+P prints the open chapter without the sidebar, menu or switcher.
  - **GitHub** link, and **← →** arrows: a 48px box mid-height in each side gutter on wide screens (highlighted on hover), and 64×44px buttons under the chapter on narrow ones. The arrow keys turn chapters too. The theme menu draws its focus ring inside each item.
  - The menu bar slides away while you scroll down and comes back when you scroll up.
- **Written in Markdown:** each chapter is a Markdown string built from `content.js` and rendered by a small renderer (headings, paragraphs, lists, quotes, tables, the caricature image, inline code/bold/italic/links). Links to `foo.md` turn chapters. Heading links scroll without touching the `#book` hash.
- **The book:** every fact comes from `content.js`. The Introduction has the caricature, title, tagline, bio, stats, impact numbers, fun fact and hobbies. Experience has every role and every achievement. Projects have their highlights, tags and sites. Skills is a table listing each skill once. Education has degrees, patents and certifications. The Reading List shows the books, and Contact lists the links and the résumé PDF. The phone number and `summary` aren't used.
- **Opening (after the theme chooser closes):** the chapter's Markdown types out with tinted markup (`#`, `**`, `` ` ``, links), up to a screenful. Then it fades as the rendered chapter rises in block by block and the sidebar fills in. A key press or click skips it. With reduced motion, the chapter shows at once.
- **Phones:** 44px menu buttons, sidebar links and theme items, a 16px search input, and tables that scroll inside their box.
- **Chooser tile:** mdBook's link blue on white.

#### Markdown Book verified

Checked by `tests/book.test.mjs` at 1440px and 390px:

- Nothing plays behind the chooser. Closing it types the Markdown (`# <name>` first), then the chapter renders. A key press skips the opening.
- The facts from `content.js` appear across all chapters, and the phone number does not. Skills lists each skill once, and all of them (`stats.skills`). The résumé link uses the `content.js` path. The Introduction shows the caricature, not the photo.
- The menu bar takes at most 20% of the screen. Heading links scroll and keep `#book`.
- The sidebar is open on desktop and closed on phones, and numbered like `SUMMARY.md`. Picking Projects opens and marks it. On phones it opens, closes after a pick and closes on Escape, with 44px links and buttons. On desktop, hiding it re-centres the chapter.
- ← and → turn chapters, and the arrows sit on the sides (desktop) or under the chapter (phone).
- The theme menu opens on the current theme. Rust applies, paints the page, is saved, and survives a reload.
- S opens search. "patent" finds results, and typed HTML is escaped. A result opens Education with the words marked, and a click clears the marks.
- Print loads the résumé PDF from `content.js`, and cleanup removes the frame.
- No horizontal overflow, and the switcher corner is clear at the end of a chapter. Cleanup removes the listeners, and there are no runtime errors.
- Also fixed in Notebook and Paper (same pattern): if the theme was switched away within a microtask of rendering, the old theme's opening still ran and threw. All three now check the render token after `await null`. All other suites still pass.

### Contact Card (`theme/apple`): rebuilt from scratch

#### Contact Card before

- "Apple Persona Card": a white card whose left half was a blue-purple-pink gradient with blurred, pulsing orbs and the initials in a frosted circle. Stats were coloured blue, purple and pink.
- "View Details" opened a Tailwind table of skills and other lists under the card. The bio was cut at 200 characters with "...".

#### Contact Card after

**Looks like iOS Contacts** (a contact card with a Contact Poster). It uses iOS's system colours (light and dark, following the OS), the SF font stack, inset grouped lists and the 44px rows. The theme key stays `apple` so links keep working. The chooser shows it as "Contact Card" on the poster colour.
- **Poster:** the name in large rounded type with the caricature standing in front of its lower half, like the poster's depth effect. On wide screens (900px and up) the poster stays on the left and the card scrolls on the right.
- **Card:** job title, then specialization · company. Below that sit four action buttons (mail, GitHub, LinkedIn, résumé) and the fields: work email, URLs (homepage, GitHub, LinkedIn), home address (opens Apple Maps). Notes holds the tagline, bio, impact numbers, fun fact and hobbies. Then come the disclosure rows and Share Contact / Download Résumé.
- **Detail pages:** Experience (shows `stats.years`), Projects, Skills, Education and Reading List push in from the right like an iOS navigation push, while the card drifts left (transform only). Each page has a "‹ <first name>" Back button. Escape also goes back, and focus returns to the row. Each role, project and degree is its own group, with technologies and tags as the group footer. Skills lists each skill once. Education also covers the patent and certifications (with links).
- **Share Contact:** builds a vCard from `content.js` (name, title, company, email, labelled URLs, city, short bio; no phone number). It opens the share sheet where the browser can share files (phones). Otherwise it downloads `<name>.vcf`, which iOS and macOS open in Contacts.
- **Phones:** once the poster scrolls away, a compact blurred bar keeps the name at the top, as in Contacts. Rows, action buttons and Back are at least 44px.
- **Opening (after the theme chooser closes):** the name rises letter by letter with a slight spring, then the caricature steps up in front of it, then the card fills in group by group. A key press or click skips it. With reduced motion everything shows at once.

#### Contact Card verified

Checked by `tests/apple.test.mjs` at 1440px and 390px:
- Nothing plays behind the chooser, closing it starts the opening, and a key press skips it.
- The poster shows the name and caricature (no photo), and the caricature overlaps the name.
- The facts from `content.js` appear across the card and all pages, and the phone number does not. Skills lists every skill once (`stats.skills`), as a comma list (owner found the commas missing in round 1: the row was a flex box, so each skill became a flex item). The résumé links use the `content.js` path.
- A page slides in, the card goes inert and focus lands on Back. On desktop the page opens beside the poster. Escape and Back return to the card with focus on the row.
- The vCard has the right name, fields and CRLF line ends, and no phone number.
- There is no horizontal overflow, and the switcher corner stays clear at the end of the card and of a page. On phones the compact bar shows after scrolling and targets are 44px; on desktop the poster stays in place. Cleanup removes the listeners and the observer, and there are no runtime errors. The shell, ChatGPT and Book suites still pass.

## Shared backlog (shell / cross-theme)

- [x] ~~Loading spinner with artificial delay~~ (shell)
- [x] ~~Theme button covering content~~ (shell: one bottom-right button; themes keep that corner clear)
- [x] ~~Picker hover/click conflict, no Escape/focus/labels~~ (shell)
- [x] ~~`#themeContainer` transform breaking `position: fixed`~~ (shell)
- [x] ~~Random theme on load, no shareable links~~ (shell: `#theme` and localStorage)
- [ ] **Caricature:** use `caricatureSVG()` (js/caricature.js) in place of the photo where a theme shows a face, recoloured with `--cc-*` to suit the theme.
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
