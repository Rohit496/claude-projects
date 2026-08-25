# Shortlist — Job Portal (React UI)

A job portal that scores every opening against your profile and shows its working, so you
can tell which handful of roles are worth a real application.

Front end only. **No database, no API, no server** — every listing ships with the app and
everything you do is kept in `localStorage` on your own device.

## Run it

Follow the setup guide: install Node.js (LTS), then from this folder:

```bash
node -v          # check Node is installed
npm install      # install dependencies
npm run dev      # start the dev server
```

Open **http://localhost:5173**. Press `Ctrl + C` in the terminal to stop the server.

```bash
npm run build    # production build into dist/
npm run preview  # serve that build on :5173
```

## What's in it

| Page | What it does |
|---|---|
| `/` | Hero with a live fit-scoring panel, top matches, company grid, newest roles |
| `/jobs` | Split board: filter rail, search, sort, job list, detail panel |
| `/jobs/:id` | Full job page with company card and related roles |
| `/companies` | Searchable directory of 14 companies |
| `/companies/:id` | Company profile, facts, perks and its open roles |
| `/saved` | Roles you kept, re-scored, best fit first |
| `/applications` | Pipeline counts and a stage tracker per application |
| `/profile` | The five inputs every score is measured against |
| `/post` | Post a listing, with a live preview scored as candidates will see it |
| `/terms` | Terms of Service — what a demo board is, and what it does with your data |

24 seed roles across 14 companies, plus anything you post yourself.

## The fit score

Each role is scored out of 100 from four weighted parts, and the job detail shows the
breakdown so a score can be argued with rather than just trusted:

| Part | Weight | Measured on |
|---|---|---|
| Skills | 45 | How many of the role's listed skills are on your profile |
| Seniority | 20 | Distance between your level and the role's |
| Location | 20 | Whether the city and work mode suit you |
| Pay | 15 | Whether the band clears your salary floor |

Bands: 78+ strong, 58+ good, 38+ worth a look, below that a long shot. Change anything on
`/profile` and every score on the board updates immediately.

## Structure

```
src/
  data/        seed listings, company profiles (logos drawn as inline SVG), shared vocabularies
  lib/         fit engine, filter/sort pipeline, storage, formatting
  store/       AppStore — one context, all state, persisted to localStorage
  components/  Header, JobCard, JobDetail, Dialog, FitMeter, Filters, Toasts, Icons…
  pages/       one file per route
  styles/      tokens → base → components → layout → job
```

**Storage keys** are namespaced and versioned (`jobportal.v1.*`). `readJSON` falls back to
defaults unless the stored value both parses and matches the expected shape, so hand-edited
or stale storage can't crash the app.

**Company logos** are inline SVG in `data/companies.jsx`, not remote images: the portal
renders identically offline, with no broken-image states and no third-party requests.

**Theming** is `[data-theme]` on `<html>` plus custom properties; an inline script in
`index.html` applies the saved theme before first paint so there is no flash. Components
read tokens only — never hard-code a colour.

**Dialogs** go through `components/Dialog.jsx`, which traps Tab, closes on Escape, restores
focus to the trigger, and makes the rest of the page `inert`. There are no native
`alert`/`confirm`/`prompt` calls anywhere. Build new dialogs on that component.
