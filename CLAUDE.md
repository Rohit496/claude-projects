# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Layout: two independent apps

This directory holds two unrelated projects that share no code, no build, and no dependencies:

| | Root (`index.html`, `script.js`, `style.css`) | `color-palette-explorer/` |
|---|---|---|
| App | **Future Me** — sealed time-capsule letters | **Color Palette Explorer** — 20-color browser |
| Stack | Vanilla JS, zero deps, no server | Express 5 + static `public/`, no build step |
| Persistence | `localStorage` only | `data/history.json` on the server |

Not a git repo. No test suite, no linter, no bundler — don't invent commands for them.

## Commands

```bash
# Color Palette Explorer
cd color-palette-explorer && npm install && npm start   # http://localhost:3000, PORT env overrides

# Future Me — no build. Open index.html directly, or serve statically:
python3 -m http.server 8931                              # then http://localhost:8931

# Syntax check after editing (the only "test" available)
node --check script.js
```

## Future Me (root)

`script.js` is one IIFE. Capsules are `{ id, name, message, createdAt, unlockAt, opened }` in
`localStorage["futureme.capsules.v1"]`; `load()` drops anything failing `isValidCapsule`, so schema
changes need a migration or old data silently vanishes.

- **Render model:** `render()` wipes `#capsuleList` and rebuilds every card. A `setInterval(tick, 1000)`
  then updates only the nodes cached in the `rendered` Map (locked capsules only) — never re-render on
  the tick path except when `tick()` detects an expiry and sets `needsRender`.
- **Auto-unlock:** when `unlockAt` passes with the page open, `tick()` → `celebrate()` flips `opened`,
  toasts, and pops the modal. Capsules that expired while the page was closed just render unlocked.
- **Digit reels** (`setReel`/`place`/`makeDigit`) are the subtlest code here. Each column is `CYCLES`(3)
  stacked copies of `9…0`, and `strip.dataset.pos` counts cells travelled — the visible digit is
  `9 - (pos % 10)`. Motion is always *forward*; `1 → 0 → 9` rolls three steps down rather than
  rewinding. When `pos >= 10` the strip silently rebases into the first cycle (`place(..., true)` skips
  the transition) so it can never run off the end. Preserve this invariant when touching countdowns.
- **XSS:** cards are assembled as `innerHTML` strings, so every interpolated value must go through
  `escapeHtml()`. The modal builds `<span>`s per word with `textContent` instead — keep it that way.
- `cipher(id, 120)` produces the deterministic scrambled preview of a locked message from an LCG seeded
  by the capsule id — same capsule always shows the same gibberish.
- `DEMO_BANNER_EXPIRES_AT` (top of `script.js`) is currently `now + 1 minute` for testing; replace with
  a fixed date for a real launch.

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

## Theming (both apps, same pattern, separate state)

`[data-theme="dark"|"light"]` on `<html>` selects a block of CSS custom properties; components only ever
read tokens (`--bg`, `--text`, `--accent`, …). Keys differ: `futureme.theme` vs `cpe.theme` — the
explorer additionally sets the attribute in an inline `<head>` script to avoid a light-mode flash.

In the explorer, clicking a swatch washes the page via `--page-bg` and sets `html.tint-dark` /
`.tint-light`, which **outrank** `[data-theme]` (element+class specificity) so text stays legible over
any color. That's why `themeToggle` calls `clearBackground()` before `setTheme()` — otherwise the toggle
appears to do nothing.

Both stylesheets honour `prefers-reduced-motion: reduce`; new animations should too.
