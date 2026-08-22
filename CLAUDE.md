# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Layout: three independent apps

This directory holds three unrelated projects that share no code, no build, and no dependencies:

| | Root (`index.html`, `script.js`, `style.css`) | `color-palette-explorer/` | `job-portal/` |
|---|---|---|---|
| App | **Future Me** — sealed time-capsule letters | **Color Palette Explorer** — 20-color browser | **Shortlist** — job portal with fit scoring |
| Stack | Vanilla JS, zero deps, no server | Express 5 + static `public/`, no build step | React 19 + Vite, no server |
| Persistence | `localStorage` only | `data/history.json` on the server | `localStorage` only |

One git repo at the root covering all three. No test suite and no linter anywhere — don't invent
commands for them. Only `job-portal/` has a bundler.

## Repository structure

```
.
├── index.html, script.js, style.css   Future Me — the repo root *is* the app
├── color-palette-explorer/
│   ├── server.js                      Express 5; reads data/palette.json once at boot
│   ├── data/palette.json              {name, hex} source of truth — restart to pick up edits
│   ├── data/history.json              runtime click log; gitignored, safe to delete
│   └── public/                        index.html, app.js, styles.css — served statically
├── job-portal/
│   ├── index.html                     Vite entry; inline pre-paint theme script
│   ├── vite.config.js                 port 5173, strictPort
│   ├── README.md                      routes, scoring weights, layout — read before editing
│   └── src/
│       ├── data/                      seed listings, company profiles + inline SVG logos, taxonomies
│       ├── lib/                       fit engine, filter/sort pipeline, storage, formatting, hooks
│       ├── store/AppStore.jsx         one context: all state, persisted to localStorage
│       ├── components/                Header, JobCard, JobDetail, Dialog, FitMeter, Filters…
│       ├── pages/                     one file per route
│       └── styles/                    tokens → base → components → layout → job (import order)
└── CLAUDE.md
```

`node_modules/`, `job-portal/dist/`, `.vscode/`, `.claude/settings.local.json`, `.sf/` (Salesforce
CLI cache) and the explorer's `data/history.json` are gitignored. Everything else is tracked,
including `job-portal/`'s setup-guide PDF.

## Commands

```bash
# Color Palette Explorer
cd color-palette-explorer && npm install && npm start   # http://localhost:3000, PORT env overrides

# Future Me — no build. Open index.html directly, or serve statically:
python3 -m http.server 8931                              # then http://localhost:8931

# Job Portal
cd job-portal && npm install && npm run dev      # http://localhost:5173 (port is pinned)

# Syntax check after editing — the only "test" the two vanilla apps have
node --check script.js
node --check color-palette-explorer/server.js color-palette-explorer/public/app.js

# Job Portal — production build; the closest thing to a type check in this repo
cd job-portal && npm run build
cd job-portal && npm run preview                         # serve that build on :5173
```

There is **no test runner, no linter and no formatter** in any of the three apps. Don't invent
`npm test` or `npm run lint` — they do not exist. Verification is: run the app, click the flow,
read the console. For the Job Portal, `npm run build` also has to pass.

## Git conventions

### Branching

Branch off `main` for all new work. Keep branches short-lived, open a PR when ready, and delete
the branch after merging.

```
feature/add-job-filter-sidebar         # New features
fix/employer-route-redirect-loop       # Bug fixes
docs/update-readme                     # Documentation only
chore/upgrade-dependencies             # Maintenance, tooling
refactor/simplify-auth-context         # Code refactoring
style/mobile-job-card-spacing          # Visual/style changes
```

### Commit messages

Follow **Conventional Commits**:

```
feat: add saved jobs count to navbar
fix: correct role guard on employer routes
docs: update README with localStorage keys
chore: upgrade react-router to v7.8
refactor: extract job card into reusable component
style: fix spacing on mobile job list
```

- Present tense, lowercase, no trailing period
- Subject line under 72 characters
- Add a body for non-obvious changes — what changed and *why*
- Keep the `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` trailer on Claude-authored commits

Commits predating this convention use a sentence-case subject with no type prefix; leave them be
and use Conventional Commits from here on. Because the three apps share a repo but no code, keep a
commit inside one app unless the change genuinely spans them (this file is the usual exception).

### Pull requests

- PR title follows the same Conventional Commits format as the subject line
- Description carries a summary and a test plan
- Base branch is `main`

Commit or push only when asked, and branch before committing rather than adding to `main` directly.

## Coding standards

### Repo-wide

The three apps share no code, but they do share these rules. Breaking one is a regression even
when nothing visibly breaks:

- **No native `alert` / `confirm` / `prompt`, anywhere.** Each app has its own in-page dialog
  helper — `openDialog`/`closeDialog` in Future Me, `Dialog`/`ConfirmDialog` in the Job Portal.
  Route new dialogs through them so focus trapping, Escape, `inert` and scroll locking come free.
- **Components read design tokens, never colour literals.** Add a token before you add a hex.
- **Everything interpolated into HTML must be escaped.** Future Me builds cards as `innerHTML`
  strings and has `escapeHtml()` for exactly this; React escapes for you, so don't reach for
  `dangerouslySetInnerHTML`.
- **Treat `localStorage` as untrusted input.** It is user-editable and survives schema changes;
  validate shape on read and fall back to defaults rather than throwing.
- **Honour `prefers-reduced-motion: reduce`** in every new animation, in CSS and in JS timers.
- **One `<h1>` per page**, labelled controls, visible focus rings, and text at WCAG AA contrast.
- **Vanilla stays vanilla.** Future Me and the explorer have zero front-end dependencies and no
  build step; don't introduce a framework, a bundler or a package into either.
- Match the file you are editing — its comment density, naming and idiom — over any house style.
  Comments explain *why*, especially where an invariant is easy to break by accident.

### Job Portal (React)

- **No TypeScript** — plain JSX throughout; do not add `.ts`/`.tsx` files.
- **Functional components only** — no class components.
- Keep components focused; extract reusable pieces into `src/components/`.
- **React Context for shared state, no external state library.** One provider, `AppStore.jsx`.
- Persist user data to `localStorage` under the versioned `jobportal.v1.*` keys via
  `lib/storage.js` — never call `localStorage` directly from a component.
- Mobile-first responsive CSS: base rules are the small-screen case, `min-width` media queries
  layer on the larger ones.

### Naming

- Components: `PascalCase` (e.g. `JobCard.jsx`)
- Variables and functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE` (e.g. `WEIGHTS`, `LEVEL_ORDER`, `SEED_JOBS`)
- Files match the name they export (`JobCard.jsx` exports `JobCard`)

## Future Me (root)

A single-page product site: masthead → hero → how it works → composer → register → privacy →
footer. `script.js` is one IIFE. Capsules are `{ id, name, message, createdAt, unlockAt, opened }`
in `localStorage["futureme.capsules.v1"]`; `load()` drops anything failing `isValidCapsule`, so
schema changes need a migration or old data silently vanishes. Nothing is derived from the schema
at write time — the reference code and redaction are computed from `id` at render.

- **Render model:** `render()` wipes `#capsuleList` and rebuilds every card. A `setInterval(tick, 1000)`
  then updates only the nodes cached in the `rendered` Map (sealed capsules only) plus the hero
  `specimen` — never re-render on the tick path except when `tick()` detects an expiry and sets
  `needsRender`. `refsFor(root)` caches those nodes and is shared by cards and the specimen, so both
  countdowns go through the same `paint(ref, from, to, now)`.
- **Auto-open:** `tick()` collects *every* capsule that matured this second and hands the array to
  `release()` once — two letters maturing in the same second must produce one toast and at most one
  modal, not a race. `release()` also declines to open the modal while a dialog is already up, so it
  never yanks a confirmation out from under someone. Capsules that expired while the page was closed
  just render open.
- **Dialogs** (`#modal`, `#confirm`) go through `openDialog`/`closeDialog`, which push and pop
  `dialogStack` and then `syncDialogs()`: every body child except the topmost dialog gets `inert`
  (the toast is exempt — `inert` would silence its `aria-live`), and body scroll is locked. `trapTab`
  wraps Tab and Shift+Tab inside the top dialog. Add a new dialog through those helpers, not by
  toggling `hidden` yourself, or the background stays reachable.
- **Reels** (`setReel`/`place`/`makeDigit`) are the subtlest code here. Each column is `CYCLES`(3)
  stacked copies of `9…0`, and `strip.dataset.pos` counts cells travelled — the visible digit is
  `9 - (pos % 10)`. Motion is always *forward*; `1 → 0 → 9` rolls three steps down rather than
  rewinding. When `pos >= 10` the strip silently rebases into the first cycle (`place(..., true)` skips
  the transition) so it can never run off the end. Preserve this invariant when touching countdowns.
- **Hero typer:** `initPhraseTyper()` types, holds, and erases `HERO_PHRASES` in the hero's second
  line, driven by one self-scheduling `setTimeout` (never an interval — a slow frame must not stack
  two keystrokes). `.caret` blinks only between phrases; `.phrase.is-typing` freezes it mid-word. The
  container is `aria-hidden`, with a static `.sr-only` copy of the first phrase next to it so the
  heading has one stable accessible name.
  Two invariants keep the hero still: a hidden `.phrase-sizer` holding the **longest** phrase reserves
  the box, so typing and erasing never move the lede below it; and `fitPhrase()` sets `--phrase-fit`
  to scale the line down just enough to fit the column. Both layers are `nowrap`, so a phrase can
  never break onto a second row (which would both clip on mobile and leave a dead line on desktop).
  Measure the sizer with `getBoundingClientRect()` — `scrollWidth` is 0 on an inline box.
- **XSS:** cards are assembled as `innerHTML` strings, so every interpolated value must go through
  `escapeHtml()`. The modal builds `<span>`s per word with `textContent` instead — keep it that way.
- `seeded(str)` is an LCG used for anything that must look the same on every visit: `refCode(c)`
  (the `FM-XXXX-YYYY` reference on each card) and `redaction(id, bars)` (the ink bars standing in for
  a sealed letter's text). Never use `Math.random()` for those — the same capsule must always render
  identically.
- **Motion** lives in `initReveal` / `initPhraseTyper` / `initScrollMotion` plus the CSS `@keyframes`.
  One IntersectionObserver adds `.in` (and `.words-in`) to `.reveal`, `.split-words`, `.timeline` and
  `.facts`; rules that draw themselves key off `.in`. `splitWords()` rewrites a heading into per-word
  `<span class="word"><i>` pairs and skips any subtree marked `data-no-split` — the hero reel and its
  `.sr-only` fallback rely on that. Everything decorative is neutralised by the `prefers-reduced-motion`
  block, and `initPhraseTyper` additionally checks it directly, rendering one phrase and stopping.
- The hero's `.specimen` is a worked example, not stored data: sealed 1 Jan this year, opening
  1 Jan next, wired to the shared `paint()`.

## Color Palette Explorer

- `data/palette.json` is `{name, hex}` only. `server.js` reads it **once at boot** and runs `decorate()`
  to derive rgb/hsl/luminance and `textOn` (WCAG relative luminance > 0.45 → dark ink). Editing the
  palette requires a server restart. `BY_HEX` also acts as the allowlist validating `POST /api/clicks`.
- **History writes are serialized.** All read-modify-write goes through the `serialize()` promise chain
  so concurrent clicks can't lose entries, and `writeHistory` writes `history.json.tmp` then renames, so
  the file on disk is never half-written. Keep both properties if you add routes that touch history.
  Corrupt/missing history is swallowed and treated as `[]` rather than crashing. Capped at `MAX_HISTORY`.
- API: `GET /api/colors`, `GET /api/history?limit=`, `POST /api/clicks` (body `{hex}`, returns
  `{saved, recent}`). `limit` is clamped to 1–50 by `parseLimit`.

## Job Portal (`job-portal/`)

React 19 SPA on Vite 8 with React Router 7. Plain JSX, no TypeScript. Read
`job-portal/README.md` first; it documents the routes, the scoring weights and the layout.

### Architecture

**No backend, no API, no auth.** Every listing ships with the app and everything the user does
stays in `localStorage`. There is no login, no user account and no role system — a visitor is
simply a candidate with a profile, and "posting a job" writes to the same local store. Don't add
route guards or an auth context without being asked; nothing is protected because nothing is
private.

**Styling is hand-written CSS with design tokens — there is no Tailwind, no CSS-in-JS and no CSS
modules.** Five stylesheets import in a fixed order (`tokens → base → components → layout → job`),
and cascade order is load-bearing: `tokens.css` defines the custom properties everything else
reads, so a rule that needs to win goes later in the order, not to `!important`. The only
`!important` in the app is the `prefers-reduced-motion` block in `base.css`, which has to override
every animation unconditionally — keep it the only one. Small one-off positioning is done with a
`style` prop; anything reusable becomes a class.

**Icons and toasts are ours, not libraries.** `components/Icons.jsx` draws every glyph as inline
SVG on a 24×24 grid, and `components/Toasts.jsx` is a local `aria-live` region. The app has no
icon or notification dependency — keep it that way.

### State

**One context, not several.** `store/AppStore.jsx` is the single provider (`AppProvider` /
`useApp`) holding profile, saved ids, applications, posted jobs, recent searches, theme and the
toast queue. There is no Redux, Zustand or data-fetching layer, because there is nothing to fetch.

- Every slice persists through `usePersistentState`, which writes on change under a versioned key:
  `jobportal.v1.saved`, `.applications`, `.postedJobs`, `.profile`, `.recentSearches`, plus
  `jobportal.theme`. Keys live in `lib/storage.js:KEYS` — never type a raw key or touch
  `localStorage` from a component.
- **Side effects must stay outside state updaters.** React invokes updaters twice in development,
  so a `pushToast` inside one announces every action twice. Compute the next value from the
  current state, call the setter, then fire the effect.
- **Storage is untrusted input.** `readJSON` falls back to defaults unless the stored value both
  parses *and* matches the fallback's shape; a key holding `"a string"` parses fine and then
  explodes on `.map()`. Objects are merged over the fallback so a pruned object keeps every key.

### The fit engine

`src/lib/fit.js` is the product. Every role scores out of 100 from four weighted parts — skills
45, seniority 20, location 20, pay 15 — and `scoreFit` returns the per-part breakdown alongside
the number, because the UI renders that breakdown verbatim. Change a weight in `WEIGHTS` and the
detail panel, the profile stats and the hero demo all follow. `LEVELS` in `data/taxonomy.js` is
ordered junior → senior and the engine measures distance along it, so keep it ordered if you add
a rung. `lib/filters.js` is the one place search, filters and sorting are applied, so every page
narrows results identically.

### Component rules

- **Dialogs** go through `components/Dialog.jsx`: it traps Tab, closes on Escape, restores focus
  to the trigger and sets `inert` on every body child except the dialog and the toast region
  (inert would silence the toast's `aria-live`). There are no native `alert`/`confirm`/`prompt`
  calls — use `Dialog` and `ConfirmDialog`.
- **Job cards** are an overlay pattern: the title button carries an `::after` spanning the whole
  card, and the save button sits later in the DOM with its own stacking position. Don't nest the
  save button inside the open button — it would be invalid and unreachable by keyboard.
- **Company logos** are inline SVG in `data/companies.jsx`, authored on a 24×24 grid and
  inheriting `currentColor`. Nothing is fetched, so there is no broken-image state; a company
  with no profile falls back to tinted initials.
- **Headings:** `JobDetail` takes `asPage` — `h1` on the job route, `h2` in the board's split
  panel, where the board owns the `h1`. Each route sets its own tab title via
  `useDocumentTitle`; child effects run before the parent's, so a title map in `App` would
  overwrite whatever a dynamic route had set.
- **Focus after validation** moves in an effect, not in the submit handler — `aria-invalid`
  doesn't exist in the DOM until React commits the state change.
- **A city search also returns remote roles** (you can do them from that city). The result count
  splits the two — drop that note and the extra rows read as a broken filter.
- Informational text must not use `--ink-faint`; it fails WCAG AA. That token is for
  placeholders, icons and borders only — use `--ink-3` for text.

## Theming (all three apps, same pattern, separate state)

`[data-theme="dark"|"light"]` on `<html>` selects a block of CSS custom properties, and components
only ever read tokens — never a colour literal. All three set the attribute in an inline `<head>`
script before first paint to avoid a theme flash, so `initTheme()` in Future Me — and `AppProvider`
in the Job Portal — only read back what that script already decided and wire the toggle.

The pattern is shared; the vocabularies are not. Future Me and the explorer use `--bg` / `--text` /
`--surface`; the Job Portal uses `--paper` / `--ink` / `--surface` with numbered ramps
(`--ink-2`, `--ink-3`, `--surface-2`). Storage keys differ too: `futureme.theme`, `cpe.theme`,
`jobportal.theme`. Don't copy a token name from one app into another and assume it resolves.

Future Me's design language tracks the current mainstream product stack rather than a house style,
so keep new work inside it:

- **Colour is OKLCH on a true-neutral grayscale**, with values lifted from shadcn/ui's Tailwind v4
  theme (`oklch(.985 0 0)` / `oklch(.145 0 0)` surfaces, `oklch(.556 0 0)` and `oklch(.708 0 0)` muted
  text, `oklch(.922 0 0)` and `oklch(1 0 0 / 12%)` borders, `oklch(.577 .245 27.325)` destructive) and
  the scale conventions from Vercel Geist. Dark-mode borders are alpha, not solid grays.
- **One saturated accent** — indigo, from shadcn's chart-1 — carries every interactive state, paired
  with a violet `--accent-2` used only for gradients (progress fills, card seal lines).
- **Radii all derive from `--radius: 0.625rem`**: `--r-1` (×0.6) chips, `--r-2` (×1) buttons and
  inputs, `--r-3` (×1.4) cards, panels, modals. Change the base, not the individual values.
- **Type is Geist / Geist Mono only.** Headlines are sans with tight negative tracking (h1 sits at
  `-.042em`); there is no serif display face. Mono carries eyebrows, labels, reference codes, and the
  countdown reels.

In the explorer, clicking a swatch washes the page via `--page-bg` and sets `html.tint-dark` /
`.tint-light`, which **outrank** `[data-theme]` (element+class specificity) so text stays legible over
any color. That's why `themeToggle` calls `clearBackground()` before `setTheme()` — otherwise the toggle
appears to do nothing.

All three stylesheets honour `prefers-reduced-motion: reduce`, and the Job Portal's hero panel
checks it in JS as well before starting its timer; new animations should do the same.
