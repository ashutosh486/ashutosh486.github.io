# Portfolio Redesign Tracker

Goal: every theme should feel smooth and polished, on desktop and phones. We work through them **one theme at a time**. A theme gets rebuilt from scratch when patching it wouldn't get it there.

## Ground rules

- **`js/content.js` is the single source of truth.** Themes never hardcode facts, numbers, links or dates. Derived numbers (years, unique skills, companies) come from `portfolioContent.stats`. If a theme needs a new fact, add a field to `content.js`.
- **Works at 390px wide**, with no horizontal scroll and nothing hidden under the global theme button (bottom-left, 72px).
- **Motion is smooth but optional:** every animation has a `prefers-reduced-motion` fallback.
- **Theme hygiene:** escape anything the visitor types, use no dead image/placeholder URLs, and have `cleanup()` clear every timer and global listener the theme creates.
- Keep all theme files, including the disabled ones (neural, api, prompt, gitdiff, json, training) and the unused ones (agent, aiplayground).

## Branching

| Branch | Purpose |
|---|---|
| `main` | Live site |
| `feature/ashutoshcodes` | Integration branch; theme branches merge here after review |
| `theme/<key>` | One branch per theme, cut from `feature/ashutoshcodes` (e.g. `theme/chatgpt`) |
| `theme/shell` | Shared page shell: `index.html`, `main.js`, theme picker, loading/transition |

Flow: branch → rebuild → run the theme's test → update this file → commit on the branch → review → merge into `feature/ashutoshcodes`.

## Testing

Tests drive the real page in headless Chrome. They need no npm install, only Node 22+ and Google Chrome.

```sh
node tests/chatgpt.test.mjs            # screenshots go to tests/screenshots/ (git-ignored)
```

`tests/cdp.mjs` has `openTheme(key, { width, height, mobile })`, which works for any theme.

## Status

| Theme | Enabled | Status | Branch | Notes |
|---|---|---|---|---|
| Shell (picker, loading, transitions) | — | Not started | `theme/shell` | See shared backlog |
| ChatGPT | ✅ | **Rebuilt, in review** | `theme/chatgpt` | See log below |
| Model Card | ✅ | Not started | | 465px wide on phones |
| VSCode | ✅ | Not started | | 594px wide on phones; sidebar takes 2/3 of screen |
| Terminal | ✅ | Not started | | Leaks a document click listener and startup timer |
| Notebook | ✅ | Not started | | 491px wide on phones |
| Research Paper | ✅ | Not started | | Fits phones |
| Markdown Book | ✅ | Not started | | Sidebar opens over content on phones; headings unstyled |
| Apple Persona Card | ✅ | Not started | | Strongest current design |
| Sci-Fi Console | ✅ | Not started | | Dense; everything is cyan |
| Neural, API, Prompt, Git Diff, JSON, Training | ❌ | Parked | | Training needs Chart.js, which isn't loaded |
| Agent, AI Playground | ❌ (not loaded) | Parked | | Agent has links to agents that don't exist |

## Theme log

### ChatGPT (`theme/chatgpt`): rebuilt from scratch

**Before**
- Animations: messages slid up 20px, a pulsing "Online" dot, sidebar tooltips. Every reply waited a fixed 500ms with no typing indicator.
- Look: a purple gradient with a "Send" button and an icon rail. It didn't resemble ChatGPT.
- Bugs:
  - Typed text was injected as HTML (XSS).
  - Plain questions ("what's your stack?") were answered with "unknown command".
  - Reading covers used `via.placeholder.com`, which no longer works, so they showed as broken images.
  - The help list was hardcoded rather than read from `content.js`.
  - The page was too wide for phones.

**After**
- **Layout:** a dark ChatGPT-style interface. The sidebar lists topics, a profile and social links; on phones it becomes a slide-in drawer with a dimmed backdrop.
- **Welcome screen:** greeting, short bio and four suggestion cards (two on phones).
- **Composer:** a pill-shaped box that grows as you type and an up-arrow send button that stays disabled while the box is empty. A `/` command menu supports ↑/↓ and Enter/Tab; Shift+Enter adds a new line.
- **Understands plain questions:** typed questions are matched to a topic by keyword (company names come from `content.js`). Unknown input is escaped and answered with suggestions.
- **Replies:** a bouncing typing indicator, then the answer reveals block by block (70ms stagger). The question scrolls to the top like ChatGPT, and each answer ends with follow-up suggestions.
- **Answer content:**
  - About shows stats cards.
  - Experience is a timeline with the current role highlighted.
  - Projects are cards that lift slightly on hover.
  - Certifications include the patent.
  - Reading shows drawn book covers with progress bars that fill in.
  - Contact has a copy-email button.
  - Hire shows the `impact` numbers and call-to-action buttons.
- **Code:** everything comes from `content.js`. `cleanup()` clears pending timers, so switching theme mid-reply is safe. All motion is off under `prefers-reduced-motion`.
- **Shared CSS:** the old chat CSS in `styles.css` was replaced by the `.cg-*` styles. The unused `typing-animation` styles were removed.

**Verified** with `tests/chatgpt.test.mjs` on desktop at 1440px and phone at 390px:
- Welcome suggestions render.
- About shows the bio from `content.js`.
- Free text "what's your tech stack?" maps to skills, and "…Nielsen?" maps to experience.
- `<img onerror>` is escaped.
- `/toString` and "already" fall through to unknown, rather than hitting a built-in method or matching "read".
- The slash menu filters, and arrow + Enter picks.
- Progress bars fill, and the question scrolls to the top.
- Switching theme mid-reply throws no errors.
- The phone layout has no overflow, and the drawer closes after picking a topic.

**Follow-ups**
- The extra space under the composer on phones exists only to clear the global theme button. Remove it once the shell moves that button.

## Shared backlog (shell / cross-theme)

- [ ] **Loading:** the spinner is held up by fixed 400ms + 300ms timers on every load and switch. Replace it with a cross-fade (View Transitions API) and no artificial delay.
- [ ] **Theme button:** it covers content in several themes. Consider a smaller button, or moving it top-right on phones.
- [ ] **Picker:** it opens on CSS hover *and* on JS click, and the two fight. It has no Escape key, no focus handling and no `aria-label`s.
- [ ] **Container transform:** `#themeContainer` keeps `transform: scale(1)` after a switch, which makes `position: fixed` inside themes relative to the container instead of the window. It's harmless for full-height themes, but worth clearing.
- [ ] **Random theme on load:** visitors can't share a link to a specific theme. Add `#theme` links (these work on GitHub Pages).
- [ ] **Tailwind:** the CDN script isn't meant for production. Move to a Tailwind CLI build.
- [ ] **Basics:** meta description, Open Graph tags, favicon. Strip `console.log`s. Remove the committed `.DS_Store` files.
- [ ] **Terminal timers:** Terminal's startup timer runs after you switch away and throws an error (found while testing ChatGPT).

## content.js notes (for the owner to decide)

- `summary` says "6+ years"; computed `stats.years` is 8.
- `coverImage`, `picture` and `projects[].image` point at `via.placeholder.com`, which no longer works. Themes should not use them until real images are added.
- The phone number is shown publicly in several themes.
