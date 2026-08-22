/* ============================================================
   Color Palette Explorer — server
   Express 5, no build step. Serves /public and three JSON routes.
   Click history persists to data/history.json.
   ============================================================ */
"use strict";

const express = require("express");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const PALETTE_FILE = path.join(DATA_DIR, "palette.json");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");
const HISTORY_TMP = HISTORY_FILE + ".tmp";

const MAX_HISTORY = 200; // entries kept on disk
const DEFAULT_RECENT = 5; // swatches shown in "Recently Viewed"

/* ---------- Color math ---------- */

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function rgbToHsl({ r, g, b }) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case rn: h = ((gn - bn) / delta) % 6; break;
      case gn: h = (bn - rn) / delta + 2; break;
      default: h = (rn - gn) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// WCAG relative luminance — decides whether card text should be dark or light.
function relativeLuminance({ r, g, b }) {
  const channel = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

const INK_DARK = "#111318";
const INK_LIGHT = "#FFFFFF";

function decorate(color) {
  const hex = color.hex.toUpperCase();
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  const luminance = relativeLuminance(rgb);

  return {
    name: color.name,
    hex,
    rgb,
    hsl,
    rgbString: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hslString: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    luminance: Number(luminance.toFixed(4)),
    textOn: luminance > 0.45 ? INK_DARK : INK_LIGHT,
  };
}

/* ---------- Palette (read once at boot) ---------- */

const PALETTE = JSON.parse(fs.readFileSync(PALETTE_FILE, "utf8")).map(decorate);
const BY_HEX = new Map(PALETTE.map((c) => [c.hex, c]));

/* ---------- History persistence ----------
   Every read-modify-write goes through `queue` so two fast clicks can't
   interleave and lose an entry. Writes land in a temp file first, then get
   renamed, so the JSON on disk is never half-written.
------------------------------------------- */

let queue = Promise.resolve();

function serialize(task) {
  const run = queue.then(task, task);
  queue = run.catch(() => {}); // a failed task must not poison the chain
  return run;
}

async function readHistory() {
  try {
    const raw = await fsp.readFile(HISTORY_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return []; // missing or corrupt file — start clean rather than crash
  }
}

async function writeHistory(entries) {
  await fsp.writeFile(HISTORY_TMP, JSON.stringify(entries, null, 2) + "\n", "utf8");
  await fsp.rename(HISTORY_TMP, HISTORY_FILE);
}

// Newest first, one entry per color — a repeat click moves it to the front
// instead of filling the strip with duplicates.
function recentUnique(entries, limit) {
  const seen = new Set();
  const out = [];

  for (let i = entries.length - 1; i >= 0 && out.length < limit; i--) {
    const entry = entries[i];
    if (!entry || seen.has(entry.hex)) continue;
    seen.add(entry.hex);
    const color = BY_HEX.get(entry.hex);
    out.push({
      hex: entry.hex,
      name: entry.name,
      timestamp: entry.timestamp,
      textOn: color ? color.textOn : INK_LIGHT,
    });
  }

  return out;
}

function parseLimit(value) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_RECENT;
  return Math.min(n, 50);
}

/* ---------- Routes ---------- */

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/colors", (_req, res) => {
  res.json(PALETTE);
});

app.get("/api/history", async (req, res) => {
  const limit = parseLimit(req.query.limit);
  const entries = await serialize(readHistory);
  res.json(recentUnique(entries, limit));
});

app.post("/api/clicks", async (req, res) => {
  const hex = String(req.body?.hex || "").toUpperCase();
  const color = BY_HEX.get(hex);

  if (!color) {
    return res.status(400).json({ error: `Unknown color: ${req.body?.hex}` });
  }

  const limit = parseLimit(req.query.limit);

  try {
    const recent = await serialize(async () => {
      const entries = await readHistory();
      entries.push({
        hex: color.hex,
        name: color.name,
        timestamp: new Date().toISOString(),
      });
      const trimmed = entries.slice(-MAX_HISTORY);
      await writeHistory(trimmed);
      return recentUnique(trimmed, limit);
    });

    res.json({ saved: true, recent });
  } catch (err) {
    console.error("Failed to save click:", err);
    res.status(500).json({ error: "Could not save click history." });
  }
});

app.listen(PORT, () => {
  console.log(`\n  🎨  Color Palette Explorer running at http://localhost:${PORT}`);
  console.log(`      ${PALETTE.length} colors loaded · history → ${path.relative(process.cwd(), HISTORY_FILE)}\n`);
});
