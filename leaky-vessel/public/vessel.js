// LEAKY VESSEL — collector's interface
// Watches the live field through the current month's element, shows the
// machine's logs, holds the year, and asks for the monthly choice.

const KEY = new URLSearchParams(location.search).get("key") || "";
const DAY_MS = 86_400_000;
const LOST = ""; // a letter the server has already erased

let S = null; // public state from the server
let fetchedAt = 0;
let isCollector = false;
let live;
let lastFieldAt = 0;
let relic = null;
let after = null;
let focusDay = null;
let MONO = "monospace";
let SERIF = "serif";
const promptedMonths = new Set();
let ultMonth = null; // month shown in the ultimatum, if open

const $ = (id) => document.getElementById(id);
const pad = (n, w = 2) => String(n).padStart(w, "0");

// ------------------------------------------------------------- server

async function post(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json", "x-vessel-key": KEY },
    body: JSON.stringify(body || {}),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

async function init() {
  if (KEY) isCollector = (await post("/api/whoami")).status === 200;
  applyState(await (await fetch("/api/state")).json());
  const es = new EventSource("/api/stream");
  es.addEventListener("field", (e) => {
    const d = JSON.parse(e.data);
    live.push(decodeField(d.rgb));
    lastFieldAt = Date.now();
  });
  es.addEventListener("day", (e) => {
    if (!S) return;
    const day = JSON.parse(e.data);
    const i = S.days.findIndex((x) => x.d === day.d);
    if (i >= 0) S.days[i] = day;
    else S.days.push(day);
    render();
  });
  es.addEventListener("phase", (e) => applyState(JSON.parse(e.data)));
}

function applyState(s) {
  S = s;
  fetchedAt = Date.now();
  if (S.phase === "afterimage" && !after) loadAfterimage();
  render();
}

// -------------------------------------------------------------- clock

function vNow() {
  return S.clock.virtual + (Date.now() - fetchedAt) * S.clock.speed;
}

function dayFloat() {
  return (vNow() - S.clock.genesisMidnight) / DAY_MS;
}

function today() {
  return Math.floor(dayFloat());
}

function currentMonth() {
  if (!S || !S.acquisition) return null;
  const d = today();
  const i = S.months.findIndex((m) => d >= m.start && d < m.end);
  return i < 0 ? null : i;
}

function realDuration(virtualMs) {
  const ms = virtualMs / S.clock.speed;
  if (ms < 60_000) return `${Math.max(0, Math.round(ms / 1000))} s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)} min`;
  if (ms < DAY_MS * 2) return `${(ms / 3_600_000).toFixed(1)} h`;
  return `${Math.round(ms / DAY_MS)} days`;
}

function virtualDuration(virtualMs) {
  const days = virtualMs / DAY_MS;
  if (days >= 1) return `${days.toFixed(1)} days`;
  return `${Math.max(0, Math.round(days * 24))} hours`;
}

// ------------------------------------------------------------- render

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function logHtml(text) {
  return escapeHtml(text).split(LOST).join('<span class="lost"></span>');
}

const STATUS_WORD = {
  before: "lost before you arrived",
  limbo: "held",
  saved: "kept",
  dissolved: "dissolved",
  collapsed: "collapsed",
};

function render() {
  if (!S) return;
  document.body.classList.toggle("afterimage", S.phase === "afterimage");
  renderClock();

  const phaseText = {
    pre: `Watching. Not yet acquired.`,
    alive: `Acquired. Year in progress.`,
    ended: `The year is over. The lens is off.`,
    collapsed: `Collapsed on day ${pad(S.endedAtDay, 4)}. The lens is off.`,
    afterimage: `Afterimage. Nothing more will be recorded.`,
  }[S.phase];
  const scars = S.scars ? ` ${S.scars} ${S.scars === 1 ? "month" : "months"} lost whole.` : "";
  $("status").textContent = phaseText + scars;

  $("acquire").hidden = !(isCollector && S.phase === "pre");
  $("reflect").hidden = !(isCollector && ["alive", "ended", "collapsed"].includes(S.phase));

  // A choice made elsewhere (or a deadline passing) closes a stale ultimatum.
  if (ultMonth !== null && (!S.months[ultMonth] || S.months[ultMonth].status !== "open")) {
    $("ultimatum").hidden = true;
    ultMonth = null;
  }
  renderBanner();
  renderYear();
  renderLogs();
  renderCaption();

  if (S.phase === "afterimage" && after) {
    $("final-text").hidden = false;
    $("final-text").textContent = after.text;
  }
}

function renderClock() {
  if (!S) return;
  const f = dayFloat();
  const d = Math.floor(f);
  const mins = Math.floor((f - d) * 24 * 60);
  const date = new Date(vNow());
  const iso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  let text = `Day ${pad(d, 4)} · ${pad(Math.floor(mins / 60))}:${pad(mins % 60)} · ${iso}`;
  if (S.acquisition && S.phase === "alive") {
    const m = currentMonth();
    text += ` · Month ${pad(m + 1)}/12 · day ${d - S.acquisition.day + 1} of ${S.acquisition.totalDays}`;
  }
  if (S.clock.speed > 1) text += ` · time ×${S.clock.speed}`;
  $("clock").textContent = text;
}

function renderBanner() {
  const b = $("banner");
  const open = S.months.filter((m) => m.status === "open");
  if (!open.length) {
    if (S.phase === "alive" && S.consecutiveMisses > 0) {
      b.hidden = false;
      b.textContent = `${S.consecutiveMisses} of ${S.collapseLimit} months unanswered in a row. At ${S.collapseLimit}, the system collapses.`;
    } else b.hidden = true;
    return;
  }
  const M = open[0];
  const left = M.deadline * DAY_MS - (vNow() - S.clock.genesisMidnight);
  const realNote = S.clock.speed > 1 ? ` (about ${realDuration(left)} of real time)` : "";
  b.hidden = false;
  if (isCollector) {
    b.innerHTML =
      `Month ${pad(M.m + 1)} has ended. Keep one day; the rest dissolve. ` +
      `If you do nothing, the whole month is lost in ${virtualDuration(left)}${realNote}.` +
      `<br><button class="act" id="banner-open">Choose</button>`;
    $("banner-open").onclick = () => openUltimatum(M.m);
    if (!promptedMonths.has(M.m)) {
      promptedMonths.add(M.m);
      openUltimatum(M.m);
    }
  } else {
    b.textContent = `Month ${pad(M.m + 1)} has ended. The collector is choosing which day to keep. ${virtualDuration(left)} remain.`;
  }
}

function dayRecord(d) {
  return S.days.find((x) => x.d === d);
}

function renderYear() {
  const el = $("year");
  el.innerHTML = "";
  if (!S.acquisition) {
    const lost = S.days.length;
    el.innerHTML = `<p class="note">No year has begun. ${lost} ${lost === 1 ? "day has" : "days have"} been observed and lost already.</p>`;
    return;
  }
  const now = today();
  const cm = currentMonth();
  S.months.forEach((M, i) => {
    const row = document.createElement("div");
    row.className = "month" + (i === cm ? " current" : "");
    const label = document.createElement("span");
    label.className = "sys";
    label.textContent = `${pad(i + 1)} ${ELEMENTS[i].name}`;
    const cells = document.createElement("div");
    cells.className = "cells";
    for (let d = M.start; d < M.end; d++) {
      const rec = dayRecord(d);
      let cls = "future";
      if (rec) cls = rec.status;
      else if (d === now && S.phase === "alive") cls = "running";
      const c = document.createElement(rec ? "button" : "span");
      c.className = `cell ${cls}` + (focusDay === d ? " focus" : "");
      c.title = `Day ${d}${rec ? ` · ${rec.date} · ${STATUS_WORD[rec.status]}` : ""}`;
      if (rec) {
        c.setAttribute("aria-label", c.title);
        c.onclick = () => {
          focusDay = d;
          renderYear();
          renderLogs(true);
          if (rec.status === "saved") playRelic(d);
        };
      }
      cells.appendChild(c);
    }
    row.append(label, cells);
    el.appendChild(row);
  });
}

function renderLogs(scrollToFocus) {
  const ol = $("logs");
  const days = [...S.days].reverse();
  $("logs-title").textContent = days.length ? `Logs · ${days.length}` : "Logs · none yet";
  ol.innerHTML = days
    .map(
      (r) =>
        `<li class="${r.status}${r.d === focusDay ? " focus" : ""}" data-d="${r.d}">` +
        `<p class="sys">Day ${pad(r.d, 4)} · ${r.date} · ${STATUS_WORD[r.status]}</p>` +
        `<p class="log">${logHtml(r.log)}</p></li>`
    )
    .join("");
  if (scrollToFocus && focusDay !== null) {
    const li = ol.querySelector(`[data-d="${focusDay}"]`);
    if (li) li.scrollIntoView({ block: "center", behavior: "smooth" });
  }
}

function renderCaption() {
  const label = $("element-label");
  const note = $("element-note");
  $("back-live").hidden = !relic;
  if (S.phase === "afterimage") {
    const n = after ? after.saved.length : 0;
    label.textContent = `Afterimage · ${n} of ${S.acquisition ? S.acquisition.totalDays : 0} days kept`;
    note.textContent = after && after.saved.length ? "Each kept day returns through the element of the month it came from, over the complement of all of them." : "Nothing was kept. Only the words remain.";
    return;
  }
  if (relic) {
    const E = ELEMENTS[relic.month];
    label.textContent = `Kept · day ${pad(relic.d, 4)} · month ${pad(relic.month + 1)} — ${E.name}`;
    note.textContent = `${relic.frames.length} hourly frames of 48×36. This is all that remains of the day.`;
    return;
  }
  if (S.phase === "ended" || S.phase === "collapsed") {
    label.textContent = "The lens is off";
    note.textContent = "Nothing more will be seen. What remains is being decided.";
    return;
  }
  const m = currentMonth();
  const idx = m === null ? 0 : m;
  const E = ELEMENTS[idx];
  label.textContent = m === null ? `Before acquisition — ${E.name}` : `Element ${pad(m + 1)} / 12 — ${E.name}`;
  const stale = !lastFieldAt || Date.now() - lastFieldAt > 6000;
  note.textContent = stale ? "The lens has not sent anything for a while." : E.note;
}

// --------------------------------------------------------- ultimatum

function openUltimatum(i) {
  const M = S.months[i];
  if (!M || M.status !== "open") return;
  const days = S.days.filter((r) => r.d >= M.start && r.d < M.end && r.status === "limbo");
  $("ult-head").textContent = `Month ${pad(i + 1)} of 12 · ${ELEMENTS[i].name}`;
  $("ult-title").textContent = "Keep one day.";
  $("ult-sub").textContent =
    `You cannot see any of these days. You have only what the machine wrote. ` +
    `The day you keep stays with you. The other ${days.length - 1} are deleted when you confirm.`;
  $("ult-days").innerHTML = days
    .map(
      (r) =>
        `<li><label><input type="radio" name="keep" value="${r.d}">` +
        `<span><span class="sys">Day ${pad(r.d, 4)} · ${r.date}</span><p class="log">${logHtml(r.log)}</p></span></label></li>`
    )
    .join("");
  const keep = $("ult-keep");
  keep.disabled = true;
  keep.textContent = "Choose a day";
  keep.classList.remove("armed");
  let armed = false;
  let chosen = null;
  $("ult-days").onchange = (e) => {
    chosen = Number(e.target.value);
    armed = false;
    keep.disabled = false;
    keep.classList.remove("armed");
    keep.textContent = `Keep day ${pad(chosen, 4)}`;
  };
  keep.onclick = async () => {
    if (chosen === null) return;
    if (!armed) {
      armed = true;
      keep.classList.add("armed");
      keep.textContent = `Dissolve the other ${days.length - 1} days — confirm`;
      return;
    }
    keep.disabled = true;
    const r = await post("/api/choose", { month: i, day: chosen, reflection: $("ult-reflect").value });
    if (r.status === 200) {
      $("ult-reflect").value = "";
      $("ultimatum").hidden = true;
      ultMonth = null;
    } else {
      keep.disabled = false;
      keep.textContent = r.body.error || "Something went wrong";
    }
  };
  $("ult-close").onclick = () => {
    $("ultimatum").hidden = true;
    ultMonth = null;
  };
  ultMonth = i;
  $("ultimatum").hidden = false;
}

// ------------------------------------------------------------- relics

async function playRelic(d) {
  const res = await fetch(`/api/relic/${d}`);
  if (!res.ok) return;
  const r = await res.json();
  const frames = r.frames.filter(Boolean).map(decodeField);
  const feed = new Feed();
  frames.forEach((f) => feed.push(f));
  relic = { d, month: r.month, frames, feed, i: 0, last: millis() };
  renderCaption();
}

function stopRelic() {
  relic = null;
  renderCaption();
}

// ---------------------------------------------------------- afterimage

async function loadAfterimage() {
  const res = await fetch("/api/afterimage");
  if (!res.ok) return;
  const a = await res.json();
  const seed = parseInt(a.seed.slice(0, 8), 16);
  const days = a.saved.map((s) => {
    const frames = s.frames.filter(Boolean).map(decodeField);
    const feed = new Feed();
    frames.forEach((f) => feed.push(f));
    return { d: s.d, month: s.month, frames, feed, i: 0, last: 0 };
  });
  // the complement of every kept frame, averaged
  const sum = new Float32Array(FN * 3);
  let n = 0;
  for (const day of days) {
    for (const f of day.frames) {
      for (let i = 0; i < FN * 3; i++) sum[i] += f[i] / 255;
      n++;
    }
  }
  const ghost = createGraphics(FW, FH);
  ghost.pixelDensity(1);
  ghost.loadPixels();
  for (let i = 0; i < FN; i++) {
    for (let c = 0; c < 3; c++) ghost.pixels[i * 4 + c] = n ? (1 - sum[i * 3 + c] / n) * 255 : 0;
    ghost.pixels[i * 4 + 3] = 255;
  }
  ghost.updatePixels();
  const words = [];
  a.reflections.forEach((text) => text.split(/\s+/).forEach((w) => w && words.push(w)));
  after = { ...a, days, ghost, words, seedInt: seed };
  relic = null;
  render();
}

function advance(day, every) {
  if (!day.frames.length) return;
  if (millis() - day.last > every) {
    day.last = millis();
    day.i = (day.i + 1) % day.frames.length;
    day.feed.push(day.frames[day.i]);
  }
}

function drawAfterimage(t) {
  background(GROUND);
  const opts = { t, text: after.text, progress: 1, seed: after.seedInt, mono: MONO };
  const PER = 18;
  const ctx = drawingContext;
  if (after.days.length) {
    const k = Math.floor(t / PER) % after.days.length;
    const local = (t % PER) / PER;
    const day = after.days[k];
    advance(day, 650);
    day.feed.step();
    ctx.globalAlpha = Math.min(1, local / 0.15, (1 - local) / 0.15);
    if (day.feed.has) ELEMENTS[day.month].draw(day.feed, 0, 0, width, height, opts);
    ctx.globalAlpha = 0.22 + 0.12 * Math.sin(t * 0.21);
    blendMode(SCREEN);
    image(after.ghost, 0, 0, width, height);
    blendMode(BLEND);
    ctx.globalAlpha = 1;
  }
  // the collector's words, drifting through what is left
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  after.words.forEach((w, i) => {
    const s = after.seedInt + i * 101;
    const size = Math.round(height * (0.025 + hash01(s) * 0.035));
    const speed = 6 + hash01(s + 1) * 14;
    const span = width + 300;
    const x = ((hash01(s + 2) * span + t * speed) % span) - 150;
    const y = height * (0.08 + hash01(s + 3) * 0.84);
    ctx.font = `italic ${size}px ${SERIF}`;
    ctx.fillStyle = `rgba(${PAPER[0]},${PAPER[1]},${PAPER[2]},${0.25 + 0.3 * hash01(s + 4)})`;
    ctx.fillText(w, x, y);
  });
  rawDone();
  drawScars(after.scars, 0, 0, width, height);
}

// ----------------------------------------------------------------- p5

function setup() {
  const c = createCanvas(10, 10);
  c.parent("holder");
  const css = getComputedStyle(document.documentElement);
  MONO = css.getPropertyValue("--mono").trim() || MONO;
  SERIF = css.getPropertyValue("--serif").trim() || SERIF;
  live = new Feed();
  fit();
  $("back-live").onclick = stopRelic;
  $("acquire-btn").onclick = async (e) => {
    const btn = e.currentTarget;
    if (!btn.classList.contains("armed")) {
      btn.classList.add("armed");
      btn.textContent = "Begin the year — this cannot be undone";
      return;
    }
    btn.disabled = true;
    const r = await post("/api/acquire");
    if (r.status !== 200) {
      btn.disabled = false;
      btn.textContent = r.body.error || "Something went wrong";
    }
  };
  $("reflect-btn").onclick = async () => {
    const text = $("reflect-text").value;
    if (!text.trim()) return;
    const r = await post("/api/reflect", { text });
    if (r.status === 200) {
      $("reflect-text").value = "";
      $("reflect-btn").textContent = "Left here";
      setTimeout(() => ($("reflect-btn").textContent = "Leave this here"), 2500);
    }
  };
  setInterval(() => {
    if (!S) return;
    renderClock();
    renderCaption();
    if (S.months.some((m) => m.status === "open")) renderBanner();
  }, 1000);
  init();
}

function fit() {
  const holder = $("holder");
  const s = Math.min(holder.clientWidth / 4, holder.clientHeight / 3);
  resizeCanvas(Math.max(40, Math.floor(s * 4)), Math.max(30, Math.floor(s * 3)));
}

function windowResized() {
  fit();
}

function draw() {
  if (!S) {
    background(GROUND);
    return;
  }
  const t = millis() / 1000;
  if (S.phase === "afterimage") {
    if (after) drawAfterimage(t);
    else background(GROUND);
    return;
  }
  background(GROUND);
  if (relic) {
    advance(relic, 700);
    relic.feed.step();
    if (relic.feed.has) ELEMENTS[relic.month].draw(relic.feed, 0, 0, width, height, { t, text: dayRecord(relic.d).log, progress: 1, seed: relic.month, mono: MONO });
    drawScars(S.scars, 0, 0, width, height);
    return;
  }
  if (S.phase === "ended" || S.phase === "collapsed") {
    drawScars(S.scars, 0, 0, width, height);
    return;
  }
  live.step();
  if (live.has) {
    const m = currentMonth();
    const idx = m === null ? 0 : m;
    let progress = 0;
    if (m !== null) {
      const M = S.months[m];
      progress = (dayFloat() - M.start) / (M.end - M.start);
    }
    const latest = S.days.length ? S.days[S.days.length - 1].log.split(LOST).join(" ") : "";
    ELEMENTS[idx].draw(live, 0, 0, width, height, { t, text: latest, progress, seed: idx * 977, mono: MONO });
  }
  drawScars(S.scars, 0, 0, width, height);
}
