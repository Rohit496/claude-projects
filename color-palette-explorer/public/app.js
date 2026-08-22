/* ============================================================
   Color Palette Explorer — client
   Vanilla JS. Colors + click history come from the Express API.
   ============================================================ */
(function () {
  "use strict";

  const THEME_KEY = "cpe.theme";
  const RECENT_LIMIT = 5;
  const TOAST_MS = 2200;

  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");
  const count = document.getElementById("count");
  const search = document.getElementById("search");
  const searchClear = document.getElementById("searchClear");
  const themeToggle = document.getElementById("themeToggle");
  const recentSection = document.getElementById("recentSection");
  const recentList = document.getElementById("recentList");
  const toast = document.getElementById("toast");

  let colors = [];
  let cards = [];
  let toastTimer = null;

  /* ---------- Theme ---------- */

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") || "light";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* private mode */ }
  }

  themeToggle.addEventListener("click", () => {
    // Drop any color wash first — while one is active it owns the surface
    // tokens, so the toggle would otherwise look like it did nothing.
    clearBackground();
    setTheme(currentTheme() === "dark" ? "light" : "dark");
  });
  setTheme(currentTheme());

  /* ---------- Rendering ---------- */

  function buildCard(color, index) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.setAttribute("role", "listitem");
    card.style.background = color.hex;
    card.style.color = color.textOn;
    card.style.setProperty("--delay", index * 28 + "ms");
    card.setAttribute("aria-label", `${color.name}, ${color.hex}. Click to copy the hex code.`);

    card.dataset.name = color.name.toLowerCase();
    card.dataset.hex = color.hex;

    const head = document.createElement("div");

    const name = document.createElement("div");
    name.className = "card-name";
    name.textContent = color.name;

    const hex = document.createElement("div");
    hex.className = "card-hex";
    hex.textContent = color.hex;

    head.append(name, hex);

    const values = document.createElement("div");
    values.className = "card-values";

    const rgb = document.createElement("span");
    rgb.textContent = color.rgbString;

    const hsl = document.createElement("span");
    hsl.textContent = color.hslString;

    values.append(rgb, hsl);

    const copy = document.createElement("span");
    copy.className = "card-copy";
    copy.textContent = "Copy";

    card.append(copy, head, values);
    card.addEventListener("click", () => selectColor(color));

    return card;
  }

  function renderGrid() {
    const fragment = document.createDocumentFragment();
    cards = colors.map((color, i) => {
      const card = buildCard(color, i);
      fragment.appendChild(card);
      return card;
    });
    grid.appendChild(fragment);
    count.textContent = `${colors.length} colors`;
  }

  /* ---------- Recently viewed ---------- */

  function relativeTime(iso) {
    const then = new Date(iso).getTime();
    if (!Number.isFinite(then)) return "";

    const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
    if (seconds < 45) return "just now";
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.round(hours / 24)}d ago`;
  }

  function renderRecent(entries) {
    recentList.textContent = "";

    if (!entries || !entries.length) {
      recentSection.hidden = true;
      return;
    }

    entries.forEach((entry) => {
      const swatch = document.createElement("button");
      swatch.type = "button";
      swatch.className = "swatch";
      swatch.style.background = entry.hex;
      swatch.title = `${entry.name} · ${entry.hex} · ${relativeTime(entry.timestamp)}`;
      swatch.setAttribute("aria-label", `${entry.name}, viewed ${relativeTime(entry.timestamp)}. Click to apply.`);

      const color = colors.find((c) => c.hex === entry.hex) || entry;
      swatch.addEventListener("click", () => applyBackground(color));

      recentList.appendChild(swatch);
    });

    recentSection.hidden = false;
  }

  /* ---------- Selection: background + clipboard + toast + history ---------- */

  function clearBackground() {
    document.body.style.removeProperty("--page-bg");
    document.documentElement.classList.remove("tint-dark", "tint-light");
  }

  function applyBackground(color) {
    document.body.style.setProperty("--page-bg", color.hex);
    // Follow the background, not the toggle, so surrounding text stays readable.
    const dark = color.textOn ? color.textOn === "#FFFFFF" : true;
    document.documentElement.classList.toggle("tint-dark", dark);
    document.documentElement.classList.toggle("tint-light", !dark);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for non-secure origins (e.g. opened over plain http on a LAN IP).
    return new Promise((resolve, reject) => {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.cssText = "position:fixed;top:-1000px;opacity:0;";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      ok ? resolve() : reject(new Error("copy failed"));
    });
  }

  function showToast(message, color) {
    toast.textContent = "";

    if (color) {
      const dot = document.createElement("span");
      dot.className = "toast-dot";
      dot.style.background = color.hex;
      toast.appendChild(dot);
    }

    toast.appendChild(document.createTextNode(message));
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), TOAST_MS);
  }

  async function recordClick(color) {
    try {
      const res = await fetch(`/api/clicks?limit=${RECENT_LIMIT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hex: color.hex }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      renderRecent(data.recent);
    } catch (err) {
      console.error("Could not record click:", err);
    }
  }

  function selectColor(color) {
    applyBackground(color);
    recordClick(color);

    // Optimistic toast: Chrome parks clipboard writes while the document is
    // unfocused, so awaiting the promise would stall the whole interaction.
    // If the write actually rejects, the toast corrects itself.
    showToast("Copied HEX to clipboard!", color);
    copyText(color.hex).catch(() => {
      showToast(`${color.hex} — select and press ⌘C to copy`, color);
    });
  }

  /* ---------- Search ---------- */

  function filter(query) {
    const q = query.trim().toLowerCase();
    const bare = q.replace(/^#/, "");
    let visible = 0;

    cards.forEach((card) => {
      const match =
        !q ||
        card.dataset.name.includes(q) ||
        card.dataset.hex.toLowerCase().replace("#", "").includes(bare);
      card.hidden = !match;
      if (match) visible++;
    });

    count.textContent = q ? `${visible} of ${colors.length}` : `${colors.length} colors`;
    searchClear.hidden = !q;

    if (visible === 0) {
      empty.textContent = "";
      empty.append("No colors match ", Object.assign(document.createElement("strong"), { textContent: `“${query.trim()}”` }), ". Try a name like “teal” or a hex like 2563EB.");
      empty.hidden = false;
    } else {
      empty.hidden = true;
    }
  }

  search.addEventListener("input", () => filter(search.value));
  search.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      search.value = "";
      filter("");
    }
  });
  searchClear.addEventListener("click", () => {
    search.value = "";
    filter("");
    search.focus();
  });

  /* ---------- Boot ---------- */

  async function init() {
    try {
      const [colorsRes, recentRes] = await Promise.all([
        fetch("/api/colors"),
        fetch(`/api/history?limit=${RECENT_LIMIT}`),
      ]);

      if (!colorsRes.ok) throw new Error(`HTTP ${colorsRes.status}`);
      colors = await colorsRes.json();
      renderGrid();

      if (recentRes.ok) renderRecent(await recentRes.json());
    } catch (err) {
      console.error("Failed to load palette:", err);
      empty.textContent = "Could not load the palette. Is the server running?";
      empty.hidden = false;
    }
  }

  init();
})();
