/* ==============================================================
   Future Me — application logic
   Vanilla JS, no dependencies. Everything persists in localStorage.
   ============================================================== */
(function () {
  "use strict";

  /* ---------- Constants ---------- */
  const STORE_KEY = "futureme.capsules.v1";
  const THEME_KEY = "futureme.theme";
  const SECOND = 1000, MINUTE = 60 * SECOND, HOUR = 60 * MINUTE, DAY = 24 * HOUR;

  /* The hero's second line types itself out of these, one after the
     other. Each one has to finish the sentence "Write to the person …". */
  const HERO_PHRASES = [
    "you\u2019re becoming.",
    "you\u2019ll thank later.",
    "you haven\u2019t met yet.",
    "you\u2019re building.",
    "who opens this.",
  ];
  const TYPE_MS = 58;        // per character, plus a little jitter
  const ERASE_MS = 26;       // backspacing is always faster than typing
  const HOLD_MS = 1900;      // finished phrase sits still long enough to read
  const GAP_MS = 420;        // beat between erasing one and starting the next

  /* ---------- Element refs ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const el = {
    html: document.documentElement,
    themeToggle: $("#themeToggle"),
    form: $("#capsuleForm"),
    name: $("#name"),
    message: $("#message"),
    date: $("#unlockDate"),
    charCount: $("#charCount"),
    list: $("#capsuleList"),
    empty: $("#emptyState"),
    summary: $("#vaultSummary"),
    toast: $("#toast"),
    modal: $("#modal"),
    modalTitle: $("#modalTitle"),
    modalMeta: $("#modalMeta"),
    modalRef: $("#modalRef"),
    modalBody: $("#modalBody"),
    confirm: $("#confirm"),
    confirmTitle: $("#confirmTitle"),
    confirmText: $("#confirmText"),
    confirmOk: $("#confirmOk"),
    confirmCancel: $("#confirmCancel"),
    stars: $("#stars"),
    aurora: $(".aurora"),
    progress: $("#scrollProgress"),
    glide: $(".filter-glide"),
    phrase: $("#heroPhrase"),
    specCountdown: $("#specCountdown"),
    specSealed: $("#specSealed"),
    specOpens: $("#specOpens"),
  };

  /* ---------- State ---------- */
  let capsules = load();
  let filter = "all";
  let lastFocused = null;
  let confirmState = null;             // { resolve, returnTo } while the dialog is open
  const dialogStack = [];              // topmost open dialog is last
  let specimen = null;                 // the hero's example record
  const rendered = new Map();          // id -> { root, units, bar, pct, remain }

  /* ==============================================================
     Storage
     ============================================================== */
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data.filter(isValidCapsule) : [];
    } catch (err) {
      console.warn("Could not read saved letters:", err);
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(capsules));
      return true;
    } catch (err) {
      toast("Storage is full — this letter could not be saved.");
      console.error(err);
      return false;
    }
  }

  function isValidCapsule(c) {
    return c && typeof c.id === "string" && typeof c.message === "string" &&
      Number.isFinite(c.unlockAt) && Number.isFinite(c.createdAt);
  }

  function uid() {
    return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ==============================================================
     Theme
     The <head> sets data-theme before first paint; this only wires
     the toggle and keeps the label describing the *next* state.
     ============================================================== */
  function initTheme() {
    const current = el.html.dataset.theme === "light" ? "light" : "dark";
    setTheme(current);

    el.themeToggle.addEventListener("click", () => {
      setTheme(el.html.dataset.theme === "dark" ? "light" : "dark");
    });
  }

  function setTheme(theme) {
    el.html.dataset.theme = theme;
    el.themeToggle.setAttribute(
      "aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
    );
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
    drawStars();
  }

  /* ==============================================================
     Starfield — dark-mode ambience only. Painted once per theme
     change or resize; nothing animates, so it costs one pass.
     ============================================================== */
  function drawStars() {
    const c = el.stars;
    if (!c || el.html.dataset.theme !== "dark") return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth, h = window.innerHeight;
    c.width = w * dpr;
    c.height = h * dpr;
    c.style.width = w + "px";
    c.style.height = h + "px";

    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const count = Math.round((w * h) / 9000);
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 1.1 + 0.2;
      ctx.globalAlpha = Math.random() * 0.7 + 0.15;
      ctx.fillStyle = i % 9 === 0 ? "#818cf8" : "#fafafa";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ==============================================================
     Formatting helpers
     ============================================================== */
  const pad = (n) => String(n).padStart(2, "0");

  function fmtDate(ts) {
    return new Date(ts).toLocaleString(undefined, {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  function fmtDateShort(ts) {
    return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }

  function humanRemaining(ms) {
    if (ms <= 0) return "open";
    const d = Math.floor(ms / DAY);
    if (d >= 365) return "~" + (d / 365).toFixed(1) + " years left";
    if (d >= 1) return d + (d === 1 ? " day left" : " days left");
    const h = Math.floor(ms / HOUR);
    if (h >= 1) return h + (h === 1 ? " hour left" : " hours left");
    const m = Math.max(1, Math.floor(ms / MINUTE));
    return m + (m === 1 ? " minute left" : " minutes left");
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[ch]);
  }

  /* A letter always looks the same from one visit to the next, so
     both its reference code and its redaction come from an LCG
     seeded by the capsule id — never from Math.random(). */
  function seeded(seedStr) {
    let seed = 0;
    for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
    return function () {
      seed = (seed * 1103515245 + 12345) >>> 0;
      return seed / 4294967296;
    };
  }

  function refCode(c) {
    const rnd = seeded(c.id);
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no look-alike glyphs
    let block = "";
    for (let i = 0; i < 4; i++) block += alphabet[Math.floor(rnd() * alphabet.length)];
    return "FM-" + block + "-" + new Date(c.unlockAt).getFullYear();
  }

  /* The text is genuinely withheld, so it is drawn as withheld:
     bars of ink standing in for words. */
  function redaction(id, bars) {
    const rnd = seeded(id + "·redaction");
    let out = "";
    for (let i = 0; i < bars; i++) {
      out += '<span style="--n:' + i + ';width:' + (8 + Math.floor(rnd() * 26)) + '%"></span>';
    }
    return out;
  }

  /* ==============================================================
     Form
     ============================================================== */
  function initForm() {
    // Minimum = one minute from now, in local time. Refreshed whenever the
    // field is touched: set once, it would drift into the past on a page
    // left open, and the picker would offer moments the form then rejects.
    refreshDateFloor();
    el.date.value = toLocalInput(new Date(Date.now() + 7 * DAY));
    el.date.addEventListener("focus", refreshDateFloor);
    el.date.addEventListener("pointerdown", refreshDateFloor);

    el.message.addEventListener("input", () => {
      el.charCount.textContent = el.message.value.length;
      clearError(el.message);
    });
    el.name.addEventListener("input", () => clearError(el.name));
    el.date.addEventListener("input", () => clearError(el.date));

    $$(".preset").forEach((preset) => {
      preset.addEventListener("click", () => {
        const days = Number(preset.dataset.preset);
        el.date.value = toLocalInput(new Date(Date.now() + days * DAY));
        clearError(el.date);
      });
    });

    el.form.addEventListener("submit", onSubmit);
    el.form.addEventListener("reset", () => {
      setTimeout(resetFormState, 0);
    });
  }

  function refreshDateFloor() {
    el.date.min = toLocalInput(new Date(Date.now() + MINUTE));
  }

  function resetFormState() {
    el.charCount.textContent = "0";
    refreshDateFloor();
    el.date.value = toLocalInput(new Date(Date.now() + 7 * DAY));
    [el.name, el.message, el.date].forEach(clearError);
  }

  function toLocalInput(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
      "T" + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function setError(input, msg) {
    input.classList.add("invalid");
    const slot = $('[data-error-for="' + input.id + '"]');
    if (slot) slot.textContent = msg;
  }

  function clearError(input) {
    input.classList.remove("invalid");
    const slot = $('[data-error-for="' + input.id + '"]');
    if (slot) slot.textContent = "";
  }

  function onSubmit(e) {
    e.preventDefault();

    const name = el.name.value.trim();
    const message = el.message.value.trim();
    const rawDate = el.date.value;
    let ok = true;

    if (!name) { setError(el.name, "Add a name so the letter has a sender."); ok = false; }
    if (message.length < 5) { setError(el.message, "Write at least a few words."); ok = false; }

    let unlockAt = NaN;
    if (!rawDate) {
      setError(el.date, "Pick the date this letter should open.");
      ok = false;
    } else {
      unlockAt = new Date(rawDate).getTime();
      if (!Number.isFinite(unlockAt)) {
        setError(el.date, "That date isn't valid.");
        ok = false;
      } else if (unlockAt <= Date.now()) {
        setError(el.date, "That moment has passed. Choose one in the future.");
        ok = false;
      }
    }

    if (!ok) {
      const firstBad = $(".invalid");
      if (firstBad) firstBad.focus();
      return;
    }

    const capsule = {
      id: uid(),
      name: name,
      message: message,
      createdAt: Date.now(),
      unlockAt: unlockAt,
      opened: false,
    };

    capsules.push(capsule);
    if (!save()) { capsules.pop(); return; }

    el.form.reset();
    setTimeout(resetFormState, 0);

    render();
    toast("Sealed. Opens " + fmtDate(unlockAt) + ".");

    const card = el.list.querySelector('[data-id="' + capsule.id + '"]');
    if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ==============================================================
     Rendering
     ============================================================== */
  const ICON_LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
  const ICON_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 7.8-1.2"/></svg>';
  const ICON_READ = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/></svg>';
  const ICON_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>';

  function isUnlocked(c) { return Date.now() >= c.unlockAt; }

  function render() {
    rendered.clear();
    el.list.innerHTML = "";

    const sorted = capsules.slice().sort((a, b) => {
      const au = isUnlocked(a), bu = isUnlocked(b);
      if (au !== bu) return au ? 1 : -1;      // sealed (counting down) first
      return au ? b.unlockAt - a.unlockAt      // newest-opened first
                : a.unlockAt - b.unlockAt;     // soonest-to-open first
    });

    const visible = sorted.filter((c) => {
      if (filter === "locked") return !isUnlocked(c);
      if (filter === "unlocked") return isUnlocked(c);
      return true;
    });

    visible.forEach((c, i) => {
      const card = buildCard(c);
      card.style.setProperty("--i", (i * 0.05) + "s");
      el.list.appendChild(card);
    });

    updateCounts();

    const isEmpty = visible.length === 0;
    el.empty.hidden = !isEmpty;
    el.list.hidden = isEmpty;
    if (isEmpty) setEmptyCopy();

    tick();
  }

  function setEmptyCopy() {
    const head = $("#emptyState h3");
    const body = $("#emptyState p");

    if (capsules.length === 0) {
      head.textContent = "Nothing sealed yet";
      body.textContent = "Write your first letter and it will appear here, counting down.";
    } else if (filter === "locked") {
      head.textContent = "No letters waiting";
      body.textContent = "Every letter you have written has already opened.";
    } else {
      head.textContent = "Nothing has opened yet";
      body.textContent = "Your sealed letters appear here on the dates you chose.";
    }
  }

  function buildCard(c) {
    const unlocked = isUnlocked(c);
    const card = document.createElement("article");
    card.className = "capsule " + (unlocked ? "unlocked" : "locked");
    card.dataset.id = c.id;

    const record =
      '<dl class="record">' +
        '<div class="record-row"><dt>Sealed</dt><dd>' + escapeHtml(fmtDateShort(c.createdAt)) + "</dd></div>" +
        '<div class="record-row"><dt>' + (unlocked ? "Opened" : "Opens") + "</dt><dd>" +
          escapeHtml(fmtDate(c.unlockAt)) +
        "</dd></div>" +
      "</dl>";

    const body = unlocked
      ? '<div class="message-body">' + escapeHtml(c.message) + "</div>"
      : '<div class="redaction" role="img" aria-label="Withheld until ' +
          escapeHtml(fmtDateShort(c.unlockAt)) + '">' + redaction(c.id, 12) + "</div>";

    const countdown = unlocked ? "" :
      '<div class="countdown" aria-hidden="true">' +
        [["days", "days"], ["hours", "hrs"], ["mins", "min"], ["secs", "sec"]].map(([unit, label]) =>
          '<div class="unit"><b class="reel" data-unit="' + unit + '"></b><span>' + label + "</span></div>"
        ).join("") +
      "</div>" +
      '<div class="progress-wrap">' +
        '<div class="progress"><div class="progress-bar"></div></div>' +
        '<div class="progress-meta"><span data-pct>0%</span><span data-remain></span></div>' +
      "</div>";

    card.innerHTML =
      '<div class="capsule-top">' +
        '<div class="capsule-who">' +
          '<span class="capsule-name">' + escapeHtml(c.name || "Anonymous") + "</span>" +
          '<span class="ref">' + escapeHtml(refCode(c)) + "</span>" +
        "</div>" +
        '<span class="badge ' + (unlocked ? "unlocked" : "locked") + '">' +
          (unlocked ? ICON_OPEN + "Open" : ICON_LOCK + "Sealed") +
        "</span>" +
      "</div>" +
      record +
      body +
      countdown +
      '<div class="capsule-actions">' +
        '<button class="mini" data-act="read"' + (unlocked ? "" : " disabled") + ">" + ICON_READ + "Read</button>" +
        '<button class="mini danger" data-act="delete">' + ICON_TRASH + "Delete</button>" +
      "</div>";

    if (unlocked) {
      const mb = $(".message-body", card);
      requestAnimationFrame(() => {
        if (mb.scrollHeight > mb.clientHeight + 2) mb.classList.add("clipped");
      });
    } else {
      rendered.set(c.id, refsFor(card));
    }

    return card;
  }

  /* Cache the nodes the per-second tick writes to, so it never
     touches the DOM tree itself. */
  function refsFor(root) {
    return {
      units: {
        days: $('.reel[data-unit="days"]', root),
        hours: $('.reel[data-unit="hours"]', root),
        mins: $('.reel[data-unit="mins"]', root),
        secs: $('.reel[data-unit="secs"]', root),
      },
      bar: $(".progress-bar", root),
      pct: $("[data-pct]", root),
      remain: $("[data-remain]", root),
    };
  }

  function updateCounts() {
    const total = capsules.length;
    const open = capsules.filter(isUnlocked).length;
    const sealed = total - open;

    setCount($('[data-count="all"]'), total);
    setCount($('[data-count="locked"]'), sealed);
    setCount($('[data-count="unlocked"]'), open);

    if (!total) {
      el.summary.textContent = "Nothing sealed yet";
      return;
    }
    const bits = [total + (total === 1 ? " letter" : " letters")];
    if (sealed) bits.push(sealed + " sealed");
    if (open) bits.push(open + (open === 1 ? " open" : " open"));
    el.summary.textContent = bits.join("  ·  ");
  }

  /* Write a count, and flick it only when the number moved. */
  function setCount(node, value) {
    if (!node || node.textContent === String(value)) return;
    node.textContent = value;
    node.classList.remove("bump");
    void node.offsetWidth;                 // restart the animation
    node.classList.add("bump");
  }

  /* ==============================================================
     Tick — countdowns, progress, auto-open
     ============================================================== */
  function tick() {
    const now = Date.now();
    let needsRender = false;

    const matured = [];
    rendered.forEach((ref, id) => {
      const c = capsules.find((x) => x.id === id);
      if (!c) return;

      if (c.unlockAt - now <= 0) {
        needsRender = true;
        matured.push(c);
        return;
      }
      paint(ref, c.createdAt, c.unlockAt, now);
    });

    // Collected first, handled once: two letters maturing in the same second
    // used to fire two toasts and slam two modals over each other.
    if (matured.length) release(matured);

    if (specimen) paint(specimen, specimen.from, specimen.to, now);

    if (needsRender) {
      updateCounts();
      render();
    }
  }

  /* Write one countdown: four reels, the bar, and its two labels. */
  function paint(ref, from, to, now) {
    const remaining = Math.max(0, to - now);

    const d = Math.floor(remaining / DAY);
    const h = Math.floor((remaining % DAY) / HOUR);
    const m = Math.floor((remaining % HOUR) / MINUTE);
    const s = Math.floor((remaining % MINUTE) / SECOND);
    setReel(ref.units.days, d > 99 ? String(d) : pad(d));
    setReel(ref.units.hours, pad(h));
    setReel(ref.units.mins, pad(m));
    setReel(ref.units.secs, pad(s));

    // A capsule can carry a nonsense span (created after it unlocks, or the
    // two stamps equal). Progress is undefined there, so report 0% while
    // there is still time on the clock rather than a contradictory 100%.
    const span = to - from;
    const pct = span > 0
      ? Math.min(100, Math.max(0, ((now - from) / span) * 100))
      : (remaining > 0 ? 0 : 100);
    ref.bar.style.width = pct.toFixed(2) + "%";
    ref.pct.textContent = pct.toFixed(pct >= 0.1 && pct < 10 ? 1 : 0) + "% elapsed";
    ref.remain.textContent = humanRemaining(remaining);
  }

  /* --- Reel ----------------------------------------------------
     Each column holds CYCLES copies of 9,8,7…0 stacked downward.
     `pos` counts how many cells the strip has travelled, so the
     digit on show is always 9 - (pos % 10). Advancing `pos` only
     ever moves the strip one way: 1 -> 0 -> 9 is three straight
     steps down, not a rewind back to the top.                     */
  const CYCLES = 3;
  const CELLS = CYCLES * 10;

  function setReel(node, value) {
    if (!node || node.dataset.value === value) return;
    const fresh = node.childElementCount !== value.length;
    node.dataset.value = value;

    // Rebuild columns only when the digit count changes (99 -> 100 days).
    if (fresh) {
      node.innerHTML = "";
      for (let i = 0; i < value.length; i++) node.appendChild(makeDigit());
    }

    for (let i = 0; i < value.length; i++) {
      const strip = node.children[i].firstElementChild;
      const to = Number(value[i]);
      if (!Number.isFinite(to)) continue;

      // A brand new column just appears at the right digit.
      if (fresh) { place(strip, 9 - to, true); continue; }

      let pos = Number(strip.dataset.pos) || 0;

      // Rebase into the first cycle while at rest. Same digit on
      // screen, so the jump is invisible — and it guarantees the
      // strip never runs off the end of its cells.
      if (pos >= 10) { pos -= 10; place(strip, pos, true); }

      // Smallest forward travel that lands on `to`.
      const step = ((9 - to) - (pos % 10) + 10) % 10;
      if (step === 0) continue;              // this column didn't change

      // Multi-step moves just roll a little longer — nothing to clean
      // up afterwards, so a plain toggle is enough.
      strip.classList.toggle("spin", step > 1);
      place(strip, pos + step, false);
    }
  }

  /* Move a strip to cell `pos`; `instant` skips the transition. */
  function place(strip, pos, instant) {
    strip.dataset.pos = pos;
    if (instant) {
      strip.classList.add("rebase");
      strip.style.transform = "translateY(" + (-pos * (100 / CELLS)) + "%)";
      void strip.offsetHeight;               // flush before re-enabling
      strip.classList.remove("rebase");
    } else {
      strip.style.transform = "translateY(" + (-pos * (100 / CELLS)) + "%)";
    }
  }

  function makeDigit() {
    const col = document.createElement("span");
    col.className = "digit";
    const strip = document.createElement("span");
    strip.className = "strip";
    for (let c = 0; c < CYCLES; c++) {
      for (let n = 9; n >= 0; n--) {
        const cell = document.createElement("i");
        cell.textContent = n;
        strip.appendChild(cell);
      }
    }
    col.appendChild(strip);
    return col;
  }

  /* Called the moment a letter's date arrives while the page is open. */
  function release(list) {
    const fresh = list.filter((c) => !c.opened);
    if (!fresh.length) return;

    fresh.forEach((c) => { c.opened = true; });
    save();

    const first = fresh[0];
    toast(fresh.length === 1
      ? "A letter from " + (first.name || "you") + " has opened."
      : fresh.length + " letters have opened.");

    setTimeout(() => {
      fresh.forEach((c) => {
        const card = el.list.querySelector('[data-id="' + c.id + '"]');
        if (card) card.classList.add("just-opened");
      });
      // Never yank a dialog out from under someone mid-decision; the card
      // is already marked and readable.
      if (!dialogStack.length) openModal(first);
    }, 400);
  }

  /* ==============================================================
     Hero specimen — a worked example, sealed at the start of this
     year and due at the start of the next.
     ============================================================== */
  function initSpecimen() {
    if (!el.specCountdown) return;
    const year = new Date().getFullYear();
    const from = new Date(year, 0, 1).getTime();
    const to = new Date(year + 1, 0, 1).getTime();

    el.specSealed.textContent = fmtDateShort(from);
    el.specOpens.textContent = fmtDate(to);

    specimen = refsFor(el.specCountdown.parentElement);
    specimen.from = from;
    specimen.to = to;
  }

  /* ==============================================================
     Modal
     ============================================================== */
  function openModal(c) {
    lastFocused = document.activeElement;
    el.modalTitle.textContent = "Dear " + (c.name || "future me");
    el.modalRef.textContent = refCode(c);
    el.modalMeta.textContent =
      "Sealed " + fmtDate(c.createdAt) + "  ·  Opened " + fmtDate(c.unlockAt);

    // Word-by-word fade-in — the one flourish the page keeps.
    el.modalBody.innerHTML = "";
    c.message.split(/(\s+)/).forEach((part, i) => {
      const span = document.createElement("span");
      span.textContent = part;
      span.style.animationDelay = Math.min(i * 0.018, 1.4) + "s";
      el.modalBody.appendChild(span);
    });

    openDialog(el.modal);
    const closeBtn = el.modal.querySelector("[data-close].btn");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    closeDialog(el.modal);
    if (lastFocused && lastFocused.isConnected && lastFocused.focus) lastFocused.focus();
  }

  /* ==============================================================
     Dialog plumbing
     Everything outside the topmost dialog is made inert while it is
     open, which removes it from the tab order *and* the accessibility
     tree. The Tab handler then wraps focus inside the dialog, covering
     wrap-around and browsers without inert.
     ============================================================== */
  const TABBABLE = 'a[href], button:not([disabled]), input:not([disabled]), ' +
                   'textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function openDialog(node) {
    if (dialogStack.indexOf(node) === -1) dialogStack.push(node);
    node.hidden = false;
    syncDialogs();
  }

  function closeDialog(node) {
    const i = dialogStack.indexOf(node);
    if (i !== -1) dialogStack.splice(i, 1);
    node.hidden = true;
    syncDialogs();
  }

  function syncDialogs() {
    const top = dialogStack[dialogStack.length - 1] || null;
    Array.from(document.body.children).forEach((child) => {
      // The toast is an aria-live region — inert would silence it.
      if (!top || child === top || child === el.toast) child.removeAttribute("inert");
      else child.setAttribute("inert", "");
    });
    document.body.style.overflow = top ? "hidden" : "";
  }

  function focusablesIn(node) {
    return Array.from(node.querySelectorAll(TABBABLE))
      .filter((n) => n.offsetParent !== null || n.getClientRects().length);
  }

  function trapTab(e) {
    if (e.key !== "Tab" || !dialogStack.length) return;
    const top = dialogStack[dialogStack.length - 1];
    const items = focusablesIn(top);
    if (!items.length) { e.preventDefault(); return; }

    const first = items[0], last = items[items.length - 1];
    const active = document.activeElement;
    const outside = !top.contains(active);

    if (e.shiftKey && (active === first || outside)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (active === last || outside)) { e.preventDefault(); first.focus(); }
  }

  /* ==============================================================
     Confirm dialog
     Stands in for window.confirm so the question looks like the rest
     of the page. Resolves true only if the destructive button is the
     one that closes it.
     ============================================================== */
  function askConfirm(opts) {
    return new Promise((resolve) => {
      // A second call while one is open answers the first with "no".
      if (confirmState) closeConfirm(false);

      confirmState = { resolve: resolve, returnTo: document.activeElement };

      el.confirmTitle.textContent = opts.title;
      el.confirmText.textContent = opts.body;
      el.confirmOk.textContent = opts.confirmLabel;

      openDialog(el.confirm);
      el.confirmCancel.focus();          // the safe option, not the destructive one
    });
  }

  function closeConfirm(answer) {
    if (!confirmState) return;
    const state = confirmState;
    confirmState = null;

    closeDialog(el.confirm);

    // The button that opened this may have been deleted along the way.
    if (state.returnTo && state.returnTo.isConnected && state.returnTo.focus) {
      state.returnTo.focus();
    }
    state.resolve(answer);
  }

  /* ==============================================================
     Events
     ============================================================== */
  function initEvents() {
    $$(".filter").forEach((btn) => {
      btn.addEventListener("click", () => {
        filter = btn.dataset.filter;
        $$(".filter").forEach((b) => {
          const on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-pressed", String(on));
        });
        moveGlide();
        render();
      });
    });

    el.list.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const card = btn.closest(".capsule");
      const c = capsules.find((x) => x.id === card.dataset.id);
      if (!c) return;

      if (btn.dataset.act === "read") {
        if (!isUnlocked(c)) { toast("Still sealed. It opens " + fmtDate(c.unlockAt) + "."); return; }
        openModal(c);
      } else if (btn.dataset.act === "delete") {
        const ok = await askConfirm({
          title: "Delete this letter?",
          body: isUnlocked(c)
            ? "It has already opened, but deleting removes the text for good."
            : "It is still sealed. Delete it and it will never be read.",
          confirmLabel: "Delete letter",
        });
        if (!ok) return;

        card.classList.add("is-removing");
        setTimeout(() => {
          capsules = capsules.filter((x) => x.id !== c.id);
          save();
          render();
          toast("Letter deleted.");
        }, 300);
      }
    });

    el.modal.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) closeModal();
    });

    el.confirm.addEventListener("click", (e) => {
      if (e.target.closest("[data-cancel]")) closeConfirm(false);
      else if (e.target.closest("#confirmOk")) closeConfirm(true);
    });

    document.addEventListener("keydown", trapTab);

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (!el.confirm.hidden) { closeConfirm(false); return; }   // topmost first
      if (!el.modal.hidden) closeModal();
    });

    // Keep multiple tabs in sync.
    window.addEventListener("storage", (e) => {
      if (e.key === STORE_KEY) { capsules = load(); render(); }
      if (e.key === THEME_KEY && (e.newValue === "dark" || e.newValue === "light")) setTheme(e.newValue);
    });

    let resizeId;
    window.addEventListener("resize", () => {
      clearTimeout(resizeId);
      resizeId = setTimeout(() => { drawStars(); moveGlide(); }, 200);
    });
  }

  /* ==============================================================
     Motion
     Everything here is decoration: each piece degrades to a static
     page if it fails, and the reduced-motion query neutralises the
     lot in CSS.
     ============================================================== */

  /* Rewrite a heading as words that can rise out of their own
     baseline, keeping any inline markup (the hero's <em>) intact. */
  function splitWords(root) {
    if (!root || root.dataset.split === "1") return;
    root.dataset.split = "1";

    let index = 0;
    (function walk(node) {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
            const wrap = document.createElement("span");
            wrap.className = "word";
            const inner = document.createElement("i");
            inner.textContent = part;
            inner.style.transitionDelay = (index++ * 0.055).toFixed(3) + "s";
            wrap.appendChild(inner);
            frag.appendChild(wrap);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          if (child.dataset && "noSplit" in child.dataset) return;
          walk(child);
        }
      });
    })(root);

    root.classList.add("split-words");
  }

  /* One observer drives every on-scroll entrance: .reveal fades,
     .split-words rises, and rules draw themselves from `.in`. */
  function initReveal() {
    $$(".stage, .fact").forEach((n) => n.classList.add("reveal"));
    $$(".hero h1, .section-head h2, .panel-head h2").forEach(splitWords);

    const items = $$(".reveal, .split-words, .timeline, .facts");
    const show = (n) => n.classList.add("in", "words-in");

    if (!("IntersectionObserver" in window)) {
      items.forEach(show);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        show(entry.target);
        io.unobserve(entry.target);
      });
      // threshold 0 + a bottom inset, so an element taller than the
      // viewport still reveals — a percentage threshold never would.
    }, { threshold: 0, rootMargin: "0px 0px -12% 0px" });
    items.forEach((n) => io.observe(n));
  }

  /* The hero's second line, typed and erased on a loop. One
     self-scheduling timeout rather than an interval, so a slow frame
     can never stack two keystrokes on top of each other. */
  function initPhraseTyper() {
    const box = el.phrase;
    if (!box) return;

    // A hidden copy of the longest phrase holds the box open, so typing and
    // erasing never move anything below the headline.
    const sizer = document.createElement("span");
    sizer.className = "phrase-sizer";
    sizer.setAttribute("aria-hidden", "true");
    sizer.textContent = HERO_PHRASES.reduce((a, b) => (b.length > a.length ? b : a));

    const live = document.createElement("span");
    live.className = "phrase-live";
    const text = document.createElement("em");
    text.className = "phrase-text";
    const caret = document.createElement("span");
    caret.className = "caret";
    live.appendChild(text);
    live.appendChild(caret);

    box.appendChild(sizer);
    box.appendChild(live);

    /* Shrink the line only as much as the column demands, so the longest
       phrase still lands on one row. Measured unscaled each time, so it
       recovers when the window grows again. */
    const fitPhrase = () => {
      box.style.setProperty("--phrase-fit", "1");
      const avail = box.clientWidth;
      if (!avail) return;
      const caretRoom = parseFloat(getComputedStyle(box).fontSize) * 0.16;
      // scrollWidth is 0 on an inline box; the rect is the real width.
      const natural = sizer.getBoundingClientRect().width + caretRoom;
      const scale = natural > avail ? Math.max(0.5, avail / natural) : 1;
      box.style.setProperty("--phrase-fit", scale.toFixed(4));
    };

    fitPhrase();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitPhrase);
    let fitId;
    window.addEventListener("resize", () => {
      clearTimeout(fitId);
      fitId = setTimeout(fitPhrase, 120);
    });

    // Reduced motion: the line still says something, it just says it once.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      text.textContent = HERO_PHRASES[0];
      return;
    }

    let phrase = 0, chars = 0, erasing = false;

    const step = () => {
      const target = HERO_PHRASES[phrase];
      chars += erasing ? -1 : 1;
      text.textContent = target.slice(0, chars);

      let delay;
      if (!erasing && chars === target.length) {
        erasing = true;
        delay = HOLD_MS;                 // hold the finished phrase
      } else if (erasing && chars === 0) {
        erasing = false;
        phrase = (phrase + 1) % HERO_PHRASES.length;
        delay = GAP_MS;
      } else {
        delay = erasing ? ERASE_MS : TYPE_MS + Math.random() * 45;
      }

      // Blink only between phrases — a cursor mid-word never blinks.
      box.classList.toggle("is-typing", chars !== 0 && chars !== target.length);
      setTimeout(step, delay);
    };

    setTimeout(step, 700);               // let the headline land first
  }

  /* Scroll-driven: the progress rule at the top of the window, and a
     slow parallax on the ambient wash. Both read in one rAF frame. */
  function initScrollMotion() {
    let queued = false;

    const frame = () => {
      queued = false;
      const y = window.scrollY;
      const travel = document.documentElement.scrollHeight - window.innerHeight;

      if (el.progress) {
        const pct = travel > 0 ? Math.min(1, y / travel) : 0;
        el.progress.style.transform = "scaleX(" + pct.toFixed(4) + ")";
      }
      if (el.aurora) {
        el.aurora.style.transform = "translate3d(0," + (y * 0.12).toFixed(1) + "px,0)";
      }
    };

    window.addEventListener("scroll", () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(frame);
    }, { passive: true });

    frame();
  }

  /* The pane behind the active filter slides rather than blinks. */
  function moveGlide() {
    const active = $(".filter.is-active");
    if (!el.glide || !active) return;
    el.glide.style.width = active.offsetWidth + "px";
    el.glide.style.transform = "translateX(" + active.offsetLeft + "px)";
  }

  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add("show");
    clearTimeout(toast._id);
    toast._id = setTimeout(() => el.toast.classList.remove("show"), 3400);
  }

  /* ==============================================================
     Boot
     ============================================================== */
  initTheme();
  drawStars();
  initForm();
  initEvents();
  initReveal();
  initPhraseTyper();
  initScrollMotion();
  initSpecimen();
  render();
  moveGlide();

  // Web fonts change the filter widths under the glide.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveGlide);

  setInterval(tick, 1000);
})();
