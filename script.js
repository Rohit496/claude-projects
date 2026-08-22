/* ============================================================
   Future Me — application logic
   Vanilla JS, no dependencies. Everything persists in localStorage.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Constants ---------- */
  const STORE_KEY = "futureme.capsules.v1";
  const THEME_KEY = "futureme.theme";
  const SECOND = 1000, MINUTE = 60 * SECOND, HOUR = 60 * MINUTE, DAY = 24 * HOUR;

  // Demo banner: fixed schedule set by the developer — the banner disappears on its own once
  // the clock passes this moment. For a real launch, replace with a fixed date, e.g.:
  //   const DEMO_BANNER_EXPIRES_AT = new Date("2026-09-01T00:00:00");
  // Left as "1 minute from page load" here for testing, so you can watch it auto-dismiss.
  const DEMO_BANNER_EXPIRES_AT = new Date(Date.now() + 1 * MINUTE);

  const QUOTES = [
    { t: "The best time to plant a tree was twenty years ago. The second best time is now.", a: "Chinese proverb" },
    { t: "You are always one decision away from a totally different life.", a: "Mel Robbins" },
    { t: "What you do today can improve all your tomorrows.", a: "Ralph Marston" },
    { t: "The future depends on what you do today.", a: "Mahatma Gandhi" },
    { t: "Do something today that your future self will thank you for.", a: "Sean Patrick Flanery" },
    { t: "Time is the coin of your life. Only you can determine how it will be spent.", a: "Carl Sandburg" },
    { t: "Little by little, one travels far.", a: "J.R.R. Tolkien" },
    { t: "It is never too late to be what you might have been.", a: "George Eliot" },
    { t: "The only person you are destined to become is the person you decide to be.", a: "Ralph Waldo Emerson" },
    { t: "How we spend our days is, of course, how we spend our lives.", a: "Annie Dillard" },
    { t: "Change is the end result of all true learning.", a: "Leo Buscaglia" },
    { t: "Your future is created by what you do today, not tomorrow.", a: "Robert Kiyosaki" },
  ];

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
    quoteCard: $(".quote-card"),
    quoteText: $("#quoteText"),
    quoteAuthor: $("#quoteAuthor"),
    newQuote: $("#newQuote"),
    toast: $("#toast"),
    modal: $("#modal"),
    modalTitle: $("#modalTitle"),
    modalMeta: $("#modalMeta"),
    modalBody: $("#modalBody"),
    stars: $("#stars"),
    demoBanner: $("#demoBanner"),
    demoBannerClose: $("#demoBannerClose"),
    demoBannerTime: $("#demoBannerTime"),
  };

  /* ---------- State ---------- */
  let capsules = load();
  let filter = "all";
  let lastFocused = null;
  const rendered = new Map(); // id -> { root, unitEls, bar, pctEl, remainEl }

  /* ============================================================
     Storage
     ============================================================ */
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data.filter(isValidCapsule) : [];
    } catch (err) {
      console.warn("Could not read saved capsules:", err);
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(capsules));
      return true;
    } catch (err) {
      toast("Storage is full — this capsule could not be saved.");
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

  /* ============================================================
     Theme
     ============================================================ */
  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (_) {}
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    setTheme(saved || (prefersLight ? "light" : "dark"));

    el.themeToggle.addEventListener("click", () => {
      const next = el.html.dataset.theme === "dark" ? "light" : "dark";
      setTheme(next);
      toast(next === "dark" ? "Dark mode on" : "Light mode on");
    });
  }

  function setTheme(theme) {
    el.html.dataset.theme = theme;
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
    drawStars();
  }

  /* ============================================================
     Starfield (dark mode ambience)
     ============================================================ */
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
      ctx.fillStyle = i % 9 === 0 ? "#a78bfa" : "#ffffff";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ============================================================
     Quotes
     ============================================================ */
  let quoteIndex = Math.floor(Math.random() * QUOTES.length);

  function showQuote(step) {
    if (step) quoteIndex = (quoteIndex + step + QUOTES.length) % QUOTES.length;
    const q = QUOTES[quoteIndex];
    const apply = () => {
      el.quoteText.textContent = "“" + q.t + "”";
      el.quoteAuthor.textContent = q.a;
      el.quoteCard.classList.remove("is-swapping");
    };
    if (step) {
      el.quoteCard.classList.add("is-swapping");
      setTimeout(apply, 260);
    } else {
      apply();
    }
  }

  /* ============================================================
     Formatting helpers
     ============================================================ */
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
    if (ms <= 0) return "unlocked";
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

  /* Deterministic scrambled preview of a locked message. */
  function cipher(seedStr, len) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789$#@%&*+=?";
    let seed = 0;
    for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
    let out = "";
    for (let i = 0; i < len; i++) {
      seed = (seed * 1103515245 + 12345) >>> 0;
      out += (seed % 7 === 0) ? " " : chars[seed % chars.length];
    }
    return out;
  }

  /* ============================================================
     Form
     ============================================================ */
  function initForm() {
    // Minimum = one minute from now, in local time.
    const minLocal = toLocalInput(new Date(Date.now() + MINUTE));
    el.date.min = minLocal;
    el.date.value = toLocalInput(new Date(Date.now() + 7 * DAY));

    el.message.addEventListener("input", () => {
      el.charCount.textContent = el.message.value.length;
      clearError(el.message);
    });
    el.name.addEventListener("input", () => clearError(el.name));
    el.date.addEventListener("input", () => clearError(el.date));

    $$(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const days = Number(chip.dataset.preset);
        el.date.value = toLocalInput(new Date(Date.now() + days * DAY));
        clearError(el.date);
      });
    });

    el.form.addEventListener("submit", onSubmit);
    el.form.addEventListener("reset", () => {
      setTimeout(() => {
        el.charCount.textContent = "0";
        el.date.value = toLocalInput(new Date(Date.now() + 7 * DAY));
        [el.name, el.message, el.date].forEach(clearError);
      }, 0);
    });
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

    if (!name) { setError(el.name, "Tell us who this is from."); ok = false; }
    if (message.length < 5) { setError(el.message, "Write at least a few words."); ok = false; }

    let unlockAt = NaN;
    if (!rawDate) {
      setError(el.date, "Pick a date in the future.");
      ok = false;
    } else {
      unlockAt = new Date(rawDate).getTime();
      if (!Number.isFinite(unlockAt)) {
        setError(el.date, "That date isn't valid.");
        ok = false;
      } else if (unlockAt <= Date.now()) {
        setError(el.date, "That moment has already passed — choose a future one.");
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
    setTimeout(() => {
      el.charCount.textContent = "0";
      el.date.value = toLocalInput(new Date(Date.now() + 7 * DAY));
    }, 0);

    render();
    toast("Sealed. Opens " + fmtDate(unlockAt) + ".");

    const card = el.list.querySelector('[data-id="' + capsule.id + '"]');
    if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ============================================================
     Rendering
     ============================================================ */
  const ICON_LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
  const ICON_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 7.8-1.2"/></svg>';
  const ICON_READ = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/></svg>';
  const ICON_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>';

  function isUnlocked(c) { return Date.now() >= c.unlockAt; }

  function render() {
    rendered.clear();
    el.list.innerHTML = "";

    const sorted = capsules.slice().sort((a, b) => {
      const au = isUnlocked(a), bu = isUnlocked(b);
      if (au !== bu) return au ? 1 : -1;      // locked (counting down) first
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
      card.style.setProperty("--i", (i * 0.06) + "s");
      el.list.appendChild(card);
    });

    updateCounts();
    const isEmpty = visible.length === 0;
    el.empty.hidden = !isEmpty;
    el.list.hidden = isEmpty;
    if (isEmpty && capsules.length > 0) {
      $("#emptyState h3").textContent = filter === "locked" ? "No capsules waiting" : "Nothing opened yet";
      $("#emptyState p").textContent = filter === "locked"
        ? "Every letter you've written has already been opened."
        : "Your sealed letters will appear here once their date arrives.";
    } else if (isEmpty) {
      $("#emptyState h3").textContent = "Nothing sealed yet";
      $("#emptyState p").textContent = "Your first letter to the future is one form away.";
    }

    tick();
  }

  function buildCard(c) {
    const unlocked = isUnlocked(c);
    const card = document.createElement("article");
    card.className = "capsule " + (unlocked ? "unlocked" : "locked");
    card.dataset.id = c.id;

    const body = unlocked
      ? '<div class="message-body">' + escapeHtml(c.message) + "</div>"
      : '<div class="locked-body">' +
          '<span class="cipher">' + escapeHtml(cipher(c.id, 120)) + "</span>" +
          "Sealed until " + escapeHtml(fmtDateShort(c.unlockAt)) +
        "</div>";

    const countdown = unlocked ? "" :
      '<div class="countdown">' +
        ["days", "hours", "mins", "secs"].map((u) =>
          '<div class="unit"><b class="reel" data-unit="' + u + '"></b><span>' + u + "</span></div>"
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
          '<span class="capsule-sub">Written ' + escapeHtml(fmtDateShort(c.createdAt)) + "</span>" +
        "</div>" +
        '<span class="badge ' + (unlocked ? "unlocked" : "locked") + '">' +
          (unlocked ? ICON_OPEN + "Open" : ICON_LOCK + "Sealed") +
        "</span>" +
      "</div>" +
      countdown +
      body +
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
      rendered.set(c.id, {
        root: card,
        units: {
          days: $('.reel[data-unit="days"]', card),
          hours: $('.reel[data-unit="hours"]', card),
          mins: $('.reel[data-unit="mins"]', card),
          secs: $('.reel[data-unit="secs"]', card),
        },
        bar: $(".progress-bar", card),
        pct: $("[data-pct]", card),
        remain: $("[data-remain]", card),
      });
    }

    return card;
  }

  function updateCounts() {
    const total = capsules.length;
    const open = capsules.filter(isUnlocked).length;
    $('[data-count="all"]').textContent = total;
    $('[data-count="locked"]').textContent = total - open;
    $('[data-count="unlocked"]').textContent = open;
  }

  /* ============================================================
     Tick — countdowns, progress, auto-unlock
     ============================================================ */
  function tick() {
    const now = Date.now();
    let needsRender = false;

    rendered.forEach((ref, id) => {
      const c = capsules.find((x) => x.id === id);
      if (!c) return;

      const remaining = c.unlockAt - now;

      if (remaining <= 0) {
        needsRender = true;
        celebrate(c);
        return;
      }

      const d = Math.floor(remaining / DAY);
      const h = Math.floor((remaining % DAY) / HOUR);
      const m = Math.floor((remaining % HOUR) / MINUTE);
      const s = Math.floor((remaining % MINUTE) / SECOND);
      setReel(ref.units.days, d > 99 ? String(d) : pad(d));
      setReel(ref.units.hours, pad(h));
      setReel(ref.units.mins, pad(m));
      setReel(ref.units.secs, pad(s));

      const span = c.unlockAt - c.createdAt;
      const pct = span > 0 ? Math.min(100, Math.max(0, ((now - c.createdAt) / span) * 100)) : 100;
      ref.bar.style.width = pct.toFixed(2) + "%";
      ref.pct.textContent = pct.toFixed(pct < 10 ? 1 : 0) + "% of the wait";
      ref.remain.textContent = humanRemaining(remaining);
    });

    if (needsRender) {
      updateCounts();
      render();
    }
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

  /* Called the moment a capsule's date arrives while the page is open. */
  function celebrate(c) {
    if (c.opened) return;
    c.opened = true;
    save();
    toast("A capsule from " + (c.name || "you") + " just unlocked.");
    setTimeout(() => {
      const card = el.list.querySelector('[data-id="' + c.id + '"]');
      if (card) card.classList.add("just-opened");
      openModal(c);
    }, 400);
  }

  /* ============================================================
     Modal
     ============================================================ */
  function openModal(c) {
    lastFocused = document.activeElement;
    el.modalTitle.textContent = "Dear " + (c.name || "future me");
    el.modalMeta.textContent =
      "Written " + fmtDate(c.createdAt) + "  ·  Unlocked " + fmtDate(c.unlockAt);

    // Word-by-word blur-in reveal.
    el.modalBody.innerHTML = "";
    const parts = c.message.split(/(\s+)/);
    parts.forEach((part, i) => {
      const span = document.createElement("span");
      span.textContent = part;
      span.style.animationDelay = Math.min(i * 0.022, 2.2) + "s";
      el.modalBody.appendChild(span);
    });

    el.modal.hidden = false;
    document.body.style.overflow = "hidden";
    const closeBtn = el.modal.querySelector(".btn");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    el.modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  /* ============================================================
     Events
     ============================================================ */
  function initEvents() {
    el.newQuote.addEventListener("click", () => showQuote(1));

    $$(".filter").forEach((btn) => {
      btn.addEventListener("click", () => {
        filter = btn.dataset.filter;
        $$(".filter").forEach((b) => {
          const on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-selected", String(on));
        });
        render();
      });
    });

    el.list.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const card = btn.closest(".capsule");
      const c = capsules.find((x) => x.id === card.dataset.id);
      if (!c) return;

      if (btn.dataset.act === "read") {
        if (!isUnlocked(c)) { toast("Still sealed. Patience."); return; }
        openModal(c);
      } else if (btn.dataset.act === "delete") {
        const label = isUnlocked(c) ? "Delete this opened capsule?" : "Delete this capsule? It will never be read.";
        if (!window.confirm(label)) return;
        card.classList.add("is-removing");
        setTimeout(() => {
          capsules = capsules.filter((x) => x.id !== c.id);
          save();
          render();
          toast("Capsule deleted.");
        }, 320);
      }
    });

    el.modal.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !el.modal.hidden) closeModal();
    });

    // Keep multiple tabs in sync.
    window.addEventListener("storage", (e) => {
      if (e.key === STORE_KEY) { capsules = load(); render(); }
      if (e.key === THEME_KEY && e.newValue) setTheme(e.newValue);
    });

    let resizeId;
    window.addEventListener("resize", () => {
      clearTimeout(resizeId);
      resizeId = setTimeout(drawStars, 200);
    });
  }

  /* Scroll-reveal for hero + composer. */
  function initReveal() {
    const items = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((n) => n.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach((n) => io.observe(n));
  }

  /* Demo banner: hides itself once DEMO_BANNER_EXPIRES_AT has passed, shows a live
     countdown until then, and lets the visitor dismiss it early by hand. */
  function initDemoBanner() {
    const banner = el.demoBanner;
    if (!banner) return;

    if (DEMO_BANNER_EXPIRES_AT - new Date() <= 0) {
      banner.remove();
      return;
    }

    const hideBanner = () => {
      clearInterval(tickId);
      banner.classList.add("is-hidden");
      setTimeout(() => banner.remove(), 500); // let the collapse transition finish
    };

    const tick = () => {
      const msLeft = DEMO_BANNER_EXPIRES_AT - new Date();
      if (msLeft <= 0) { hideBanner(); return; }
      const totalSec = Math.ceil(msLeft / SECOND);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      if (el.demoBannerTime) el.demoBannerTime.textContent = `(hides in ${m}:${String(s).padStart(2, "0")})`;
    };

    tick();
    const tickId = setInterval(tick, SECOND);

    el.demoBannerClose?.addEventListener("click", hideBanner);
  }

  /* ============================================================
     Boot
     ============================================================ */
  initTheme();
  drawStars();
  showQuote(0);
  initForm();
  initEvents();
  initReveal();
  initDemoBanner();
  render();

  setInterval(tick, 1000);
  // Rotate the quote gently on its own.
  setInterval(() => showQuote(1), 25000);

  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add("show");
    clearTimeout(toast._id);
    toast._id = setTimeout(() => el.toast.classList.remove("show"), 3400);
  }
})();
