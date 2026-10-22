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
- **Works at 390px wide**, with no horizontal scroll. The theme switcher never covers content: a theme offers a `data-theme-slot` in its header, or leaves the bottom-right corner free.
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

When one branch needs another, cut it from that branch and merge in order. Right now `theme/shell` is stacked on `theme/chatgpt`, because ChatGPT's header hosts the switcher. Merge `theme/chatgpt` first, then `theme/shell`.

## Testing

Tests drive the real page in headless Chrome. They need no npm install, only Node 22+ and Google Chrome.

```sh
node tests/shell.test.mjs      # switcher, chooser, refresh, Back, phone sheet
node tests/chatgpt.test.mjs    # screenshots go to tests/screenshots/ (git-ignored)
```

`tests/cdp.mjs` has two helpers:

- `openPage(hash, { width, height, mobile })` loads the page as a visitor sees it, with the chooser open.
- `openTheme(key, …)` opens a theme with the chooser dismissed. It works for any theme.

## Status

| Theme | Enabled | Status | Branch | Notes |
| --- | --- | --- | --- | --- |
| Shell (switcher, chooser, transitions) | — | **Rebuilt, in review** | `theme/shell` | See log below |
| ChatGPT | ✅ | **Rebuilt (2 rounds), in review** | `theme/chatgpt` | Hosts the switcher in its header |
| Model Card | ✅ | Not started | | 465px wide on phones |
| VSCode | ✅ | Not started | | 594px wide on phones; sidebar takes 2/3 of screen |
| Terminal | ✅ | Not started | | Leaks a document click listener and startup timer |
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

#### Verified

Checked with `tests/shell.test.mjs`:

- The chooser asks on first visit with the current theme focused.
- Escape collapses it and returns focus to the switcher.
- The switcher sits in ChatGPT's slot.
- Picking Paper updates `#paper` and the switcher floats.
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

#### ChatGPT verified

Checked with `tests/chatgpt.test.mjs`:

- The bio comes from `content.js`.
- Free text maps to topics, including the "Nielsen" and "NIT" names from `content.js`.
- XSS is escaped.
- `/toString` and "already" fall through to unknown.
- The slash menu works with arrow keys and Enter.
- Progress bars fill, and the question scrolls to the top.
- The desktop sidebar collapses and reopens.
- Switching theme mid-reply throws no errors.
- On phones there's no overflow and the drawer works.

## Shared backlog (shell / cross-theme)

- [x] ~~Loading spinner with artificial delay~~ (shell)
- [x] ~~Theme button covering content~~ (shell: slot or bottom-right pill)
- [x] ~~Picker hover/click conflict, no Escape/focus/labels~~ (shell)
- [x] ~~`#themeContainer` transform breaking `position: fixed`~~ (shell)
- [x] ~~Random theme on load, no shareable links~~ (shell: `#theme` and localStorage)
- [ ] **Each theme should add a `data-theme-slot`** in its header when redesigned, or keep the bottom-right corner clear.
- [ ] **Tailwind:** the CDN script isn't meant for production. Move to a Tailwind CLI build.
- [ ] **Basics:** meta description, Open Graph tags, favicon. Strip `content.js`'s `console.log`s. Remove the committed `.DS_Store` files.
- [ ] **Terminal timers:** Terminal's startup timer runs after you switch away and throws an error.

## content.js notes (for the owner to decide)

- `summary` says "6+ years"; computed `stats.years` is 8.
- `coverImage` and `projects[].image` still point at `via.placeholder.com`, which no longer works. Themes should not use them until real images are added. (`picture` now uses `images/profile.jpg`.)
- The phone number is shown publicly in several themes.
