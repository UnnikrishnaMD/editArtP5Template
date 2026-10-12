// LEAKY VESSEL — server
//
// Keeps the clock, receives the lens, writes the daily logs, purges the
// source, holds each month's residue until the collector chooses, and
// enforces the one-year lifecycle. No dependencies beyond Node itself
// (the vision model SDK is optional).

import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { localLog, visionLog, afterimageText } from "./lib/poet.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(here, "public");
const P5 = path.join(here, "..", "p5.min.js");
const DATA = process.env.DATA_DIR || path.join(here, "data");
const SOURCE = path.join(DATA, "source");
const RESIDUE = path.join(DATA, "residue");
const STATE_FILE = path.join(DATA, "state.json");
const KEYS_FILE = path.join(DATA, "keys.json");
const AFTER_FILE = path.join(DATA, "afterimage.json");

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const FIELD_W = 48;
const FIELD_H = 36;
const FIELD_BYTES = FIELD_W * FIELD_H * 3;
const MONTHS = 12;

const CFG = {
  port: Number(process.env.PORT || 8080),
  speed: Math.max(1, Number(process.env.SPEED || 1)), // virtual seconds per real second
  graceDays: Math.max(1, Number(process.env.GRACE_DAYS || 7)),
  collapseLimit: Math.max(1, Number(process.env.COLLAPSE_LIMIT || 3)),
  poet: process.env.POET || (process.env.ANTHROPIC_API_KEY ? "vision" : "local"),
};

// ---------------------------------------------------------------- storage

fs.mkdirSync(SOURCE, { recursive: true });
fs.mkdirSync(RESIDUE, { recursive: true });

function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJSON(file, value) {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value));
  fs.renameSync(tmp, file);
}

const keys = readJSON(KEYS_FILE, null) || {
  collector: crypto.randomBytes(12).toString("hex"),
  lens: crypto.randomBytes(12).toString("hex"),
};
if (process.env.COLLECTOR_KEY) keys.collector = process.env.COLLECTOR_KEY;
if (process.env.LENS_KEY) keys.lens = process.env.LENS_KEY;
writeJSON(KEYS_FILE, keys);

function freshState() {
  const now = Date.now();
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  return {
    version: 1,
    startReal: now,
    startVirtual: now,
    speed: CFG.speed,
    genesisMidnight: midnight.getTime(),
    phase: "pre", // pre → alive → ended | collapsed → afterimage
    lastFinalized: -1,
    acquisition: null,
    months: [],
    days: {},
    scars: 0,
    consecutiveMisses: 0,
    reflections: [],
    reflectionsAbsorbed: 0,
    endedAtDay: null,
  };
}

const state = readJSON(STATE_FILE, null) || freshState();

// Changing SPEED between runs must not make the clock jump.
if (state.speed !== CFG.speed) {
  const now = Date.now();
  state.startVirtual = state.startVirtual + (now - state.startReal) * state.speed;
  state.startReal = now;
  state.speed = CFG.speed;
}
const saveState = () => writeJSON(STATE_FILE, state);
saveState();

// ------------------------------------------------------------------ clock

const virtualNow = () => state.startVirtual + (Date.now() - state.startReal) * state.speed;
const sinceGenesis = () => virtualNow() - state.genesisMidnight;
const currentDay = () => Math.floor(sinceGenesis() / DAY_MS);
const currentSlot = () => Math.floor((((sinceGenesis() % DAY_MS) + DAY_MS) % DAY_MS) / HOUR_MS);

function dateOf(d) {
  const t = new Date(state.genesisMidnight + d * DAY_MS + 12 * HOUR_MS);
  const p = (n) => String(n).padStart(2, "0");
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
}

function monthOf(d) {
  if (!state.acquisition) return null;
  const i = state.months.findIndex((m) => d >= m.start && d < m.end);
  return i < 0 ? null : i;
}

// ------------------------------------------------------- the day in hand

function emptyDay(d) {
  return { d, slots: Array(24).fill(null), fields: Array(24).fill(null), keyframes: {} };
}

const sourceDir = (d) => path.join(SOURCE, String(d));

function loadDayData(d) {
  const data = readJSON(path.join(sourceDir(d), "day.json"), null);
  return data && data.d === d ? data : null;
}

let today = null;
let prevLum = null;
let todayDirty = false;

function persistToday() {
  if (!today || !todayDirty) return;
  fs.mkdirSync(sourceDir(today.d), { recursive: true });
  writeJSON(path.join(sourceDir(today.d), "day.json"), today);
  todayDirty = false;
}

async function purgeSource(d) {
  await fsp.rm(sourceDir(d), { recursive: true, force: true });
}

const lensOpen = () => state.phase === "pre" || state.phase === "alive";

// Accumulate one incoming field into the current hour's measurements.
function ingestField(buf) {
  const slot = currentSlot();
  const n = FIELD_W * FIELD_H;
  const lum = new Float32Array(n);
  let sum = 0;
  let min = 1;
  let r = 0;
  let g = 0;
  let b = 0;
  for (let i = 0; i < n; i++) {
    const R = buf[i * 3] / 255;
    const G = buf[i * 3 + 1] / 255;
    const B = buf[i * 3 + 2] / 255;
    const L = 0.2126 * R + 0.7152 * G + 0.0722 * B;
    lum[i] = L;
    sum += L;
    if (L < min) min = L;
    r += R;
    g += G;
    b += B;
  }
  const mean = sum / n;
  let motion = 0;
  let mx = 0;
  let my = 0;
  let mw = 0;
  let bx = 0;
  let by = 0;
  let bw = 0;
  for (let i = 0; i < n; i++) {
    const x = (i % FIELD_W) / (FIELD_W - 1);
    const y = Math.floor(i / FIELD_W) / (FIELD_H - 1);
    if (prevLum) {
      const dl = Math.abs(lum[i] - prevLum[i]);
      motion += dl;
      if (dl > 0.04) {
        mx += x * dl;
        my += y * dl;
        mw += dl;
      }
    }
    const over = lum[i] - mean;
    if (over > 0) {
      bx += x * over;
      by += y * over;
      bw += over;
    }
  }
  motion = prevLum ? motion / n : 0;
  prevLum = lum;

  const s =
    today.slots[slot] ||
    (today.slots[slot] = { n: 0, lum: 0, lumMin: 1, motion: 0, mx: 0, my: 0, mw: 0, bx: 0, by: 0, bw: 0, r: 0, g: 0, b: 0 });
  s.n++;
  s.lum += mean;
  s.lumMin = Math.min(s.lumMin, min);
  s.motion += motion;
  s.mx += mx;
  s.my += my;
  s.mw += mw;
  s.bx += bx;
  s.by += by;
  s.bw += bw;
  s.r += r / n;
  s.g += g / n;
  s.b += b / n;
  // The first field of each hour becomes that hour's residue frame.
  if (!today.fields[slot]) today.fields[slot] = buf.toString("base64");
  todayDirty = true;
  return slot;
}

// ------------------------------------------------------------- the purge

async function readKeyframes(d) {
  const dir = sourceDir(d);
  let files = [];
  try {
    files = (await fsp.readdir(dir)).filter((f) => /^kf-\d\d\.jpg$/.test(f)).sort();
  } catch {
    return [];
  }
  const want = 6;
  const chosen = [];
  for (let i = 0; i < Math.min(want, files.length); i++) {
    chosen.push(files[Math.floor((i * files.length) / Math.min(want, files.length))]);
  }
  return Promise.all(
    chosen.map(async (f) => ({
      hour: Number(f.slice(3, 5)),
      jpegBase64: (await fsp.readFile(path.join(dir, f))).toString("base64"),
    }))
  );
}

async function finalizeDay(d, data, backlog) {
  const acq = state.acquisition;
  const inLife = !!acq && d >= acq.day && d < acq.endDay;
  const status = !acq || d < acq.day ? "before" : inLife ? "limbo" : null;

  if (status) {
    let result;
    if (CFG.poet === "vision" && backlog <= 2) {
      result = await visionLog(d, data, await readKeyframes(d));
    } else {
      result = { text: localLog(d, data), source: "local" };
    }
    if (inLife) {
      // What survives the purge, for now: one 48×36 field per hour.
      writeJSON(path.join(RESIDUE, `${d}.json`), { d, w: FIELD_W, h: FIELD_H, frames: data.fields });
    }
    state.days[d] = { d, date: dateOf(d), status, log: result.text, voice: result.source, month: monthOf(d) };
  }

  await purgeSource(d);
  state.lastFinalized = d;
  erodeLogs(d + 1);
  saveState();
  if (status) broadcast("day", state.days[d]);
  console.log(`[day ${d}] ${status || "outside lifecycle"} — source purged`);
}

// Logs of the inaccessible past, and of dissolved days, lose letters as they age.
// The loss is written back to disk: the erased letters cannot be recovered.
const LOST = "\uE000";

function erodeText(text, d, amount) {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const r = (((Math.imul(d * 1009 + i, 2654435761) >>> 0) ^ 0x5bd1e995) >>> 0) % 10007 / 10007;
    out += ch !== " " && ch !== LOST && r < amount ? LOST : ch;
  }
  return out;
}

function erodeLogs(day) {
  for (const rec of Object.values(state.days)) {
    let amount = 0;
    if (rec.status === "before") amount = Math.min(0.92, (day - rec.d) / 100);
    else if (rec.status === "dissolved" || rec.status === "collapsed") amount = Math.min(0.96, (day - rec.d - 30) / 90);
    if (amount > 0) rec.log = erodeText(rec.log, rec.d, amount);
  }
}

async function deleteResidue(d) {
  await fsp.rm(path.join(RESIDUE, `${d}.json`), { force: true });
}

// ------------------------------------------------------------ lifecycle

function acquire() {
  if (state.acquisition) return { error: "This system has already been acquired. Its year cannot be restarted.", code: 409 };
  if (state.phase !== "pre") return { error: "The system is no longer alive.", code: 409 };
  const day = currentDay();
  const start = new Date(state.genesisMidnight + day * DAY_MS + 12 * HOUR_MS);
  const months = [];
  let prev = day;
  for (let m = 1; m <= MONTHS; m++) {
    const t = new Date(start);
    t.setMonth(start.getMonth() + m);
    const end = day + Math.round((t.getTime() - start.getTime()) / DAY_MS);
    months.push({ m: m - 1, start: prev, end, status: "future", savedDay: null, deadline: null });
    prev = end;
  }
  state.acquisition = { day, atVirtual: virtualNow(), endDay: prev, totalDays: prev - day };
  state.months = months;
  state.phase = "alive";
  saveState();
  broadcast("phase", publicState());
  console.log(`[acquired] day ${day}; the feed ends on day ${prev}`);
  return { ok: true };
}

async function collapseMonth(i) {
  const M = state.months[i];
  if (M.status === "saved" || M.status === "collapsed") return;
  for (let d = M.start; d < M.end; d++) {
    if (state.days[d] && state.days[d].status === "limbo") {
      state.days[d].status = "collapsed";
      await deleteResidue(d);
    }
  }
  M.status = "collapsed";
  state.scars++;
  state.consecutiveMisses++;
  console.log(`[month ${i + 1}] no choice made — collapsed (scar ${state.scars})`);
}

async function totalCollapse(day) {
  state.phase = "collapsed";
  state.endedAtDay = day;
  if (today) await purgeSource(today.d);
  today = null;
  prevLum = null;
  for (let i = 0; i < state.months.length; i++) {
    const M = state.months[i];
    if (M.status !== "saved" && M.status !== "collapsed") {
      for (let d = M.start; d < M.end; d++) {
        if (state.days[d] && state.days[d].status === "limbo") {
          state.days[d].status = "collapsed";
          await deleteResidue(d);
        }
      }
      M.status = "collapsed";
    }
  }
  console.log(`[collapse] ${CFG.collapseLimit} months unanswered in a row — the system has failed`);
}

async function choose(i, d, reflection) {
  const M = state.months[i];
  if (!M || M.status !== "open") return { error: "This month is not waiting for a choice.", code: 409 };
  if (!(d >= M.start && d < M.end) || !state.days[d] || state.days[d].status !== "limbo") {
    return { error: "That day cannot be kept.", code: 400 };
  }
  for (let k = M.start; k < M.end; k++) {
    const day = state.days[k];
    if (!day || k === d) continue;
    if (day.status === "limbo") {
      day.status = "dissolved";
      await deleteResidue(k);
    }
  }
  state.days[d].status = "saved";
  M.status = "saved";
  M.savedDay = d;
  state.consecutiveMisses = 0;
  if (reflection) addReflection(reflection, i);
  saveState();
  broadcast("phase", publicState());
  console.log(`[month ${i + 1}] kept day ${d}; ${M.end - M.start - 1} days dissolved`);
  return { ok: true };
}

function addReflection(text, month) {
  const clean = String(text).replace(/\s+/g, " ").trim().slice(0, 1000);
  if (!clean) return false;
  state.reflections.push({ day: currentDay(), month, text: clean });
  return true;
}

let synthesizing = false;
async function synthesize() {
  if (synthesizing) return;
  synthesizing = true;
  const saved = [];
  for (const M of state.months) {
    if (M.status !== "saved") continue;
    const residue = readJSON(path.join(RESIDUE, `${M.savedDay}.json`), null);
    saved.push({
      d: M.savedDay,
      date: state.days[M.savedDay].date,
      month: M.m,
      log: state.days[M.savedDay].log,
      frames: residue ? residue.frames : [],
    });
  }
  const reflections = state.reflections;
  const { text, source } = await afterimageText(
    saved,
    reflections,
    state.scars,
    state.acquisition.totalDays,
    CFG.poet === "vision"
  );
  writeJSON(AFTER_FILE, {
    seed: crypto.createHash("sha256").update(JSON.stringify([saved.map((s) => s.d), reflections])).digest("hex").slice(0, 16),
    w: FIELD_W,
    h: FIELD_H,
    saved,
    scars: state.scars,
    collapsed: state.endedAtDay !== state.acquisition.endDay,
    reflections: reflections.map((r) => r.text),
    text,
    voice: source,
    totalDays: state.acquisition.totalDays,
  });
  // The residue now lives only inside the afterimage. The reflections are absorbed.
  await fsp.rm(RESIDUE, { recursive: true, force: true });
  await fsp.rm(SOURCE, { recursive: true, force: true });
  state.reflectionsAbsorbed = reflections.length;
  state.reflections = [];
  state.phase = "afterimage";
  saveState();
  broadcast("phase", publicState());
  console.log("[afterimage] synthesized; the system is now a loop");
}

let busy = false;
async function tick() {
  if (busy || state.phase === "afterimage") return;
  busy = true;
  try {
    const day = currentDay();
    const stopDay = lensOpen() ? day : state.endedAtDay;

    while (state.lastFinalized < stopDay - 1) {
      const d = state.lastFinalized + 1;
      let data;
      if (today && today.d === d) {
        data = today;
        today = null;
        prevLum = null;
      } else {
        data = loadDayData(d) || emptyDay(d);
      }
      await finalizeDay(d, data, stopDay - 1 - d);
    }

    if (lensOpen() && (!today || today.d !== day)) {
      today = loadDayData(day) || emptyDay(day);
      prevLum = null;
    }

    const acq = state.acquisition;
    if (!acq) return;

    if (state.phase === "alive" && day >= acq.endDay && state.lastFinalized >= acq.endDay - 1) {
      state.phase = "ended";
      state.endedAtDay = acq.endDay;
      today = null;
      prevLum = null;
      await fsp.rm(SOURCE, { recursive: true, force: true });
      fs.mkdirSync(SOURCE, { recursive: true });
      saveState();
      broadcast("phase", publicState());
      console.log("[end] the year is over; the lens is switched off for good");
    }

    let changed = false;
    for (let i = 0; i < state.months.length; i++) {
      const M = state.months[i];
      if (M.status === "future" && day >= M.end && state.lastFinalized >= M.end - 1) {
        M.status = "open";
        M.deadline = M.end + CFG.graceDays;
        changed = true;
        console.log(`[month ${i + 1}] ended — choose one day before day ${M.deadline}`);
      } else if (M.status === "open" && day >= M.deadline) {
        await collapseMonth(i);
        changed = true;
        if (state.phase === "alive" && state.consecutiveMisses >= CFG.collapseLimit) {
          await totalCollapse(day);
        }
      }
    }
    // A collapse can end the system while months are still running.
    if (state.phase === "collapsed") {
      for (let i = 0; i < state.months.length; i++) {
        if (state.months[i].status === "future" || state.months[i].status === "open") {
          await collapseMonth(i);
          changed = true;
        }
      }
    }
    if (changed) {
      saveState();
      broadcast("phase", publicState());
    }

    const resolved = state.months.every((M) => M.status === "saved" || M.status === "collapsed");
    if ((state.phase === "ended" || state.phase === "collapsed") && resolved) {
      await synthesize();
    }
  } catch (err) {
    console.error("[tick]", err);
  } finally {
    busy = false;
  }
}

// --------------------------------------------------------- public view

function monthView(M, day) {
  let status = M.status;
  if (status === "future" && day >= M.start) status = "running";
  return { ...M, status };
}

function publicState() {
  const day = currentDay();
  return {
    phase: state.phase,
    clock: {
      virtual: virtualNow(),
      real: Date.now(),
      speed: state.speed,
      genesisMidnight: state.genesisMidnight,
      day,
    },
    acquisition: state.acquisition,
    months: state.months.map((M) => monthView(M, day)),
    days: Object.values(state.days).sort((a, b) => a.d - b.d),
    scars: state.scars,
    consecutiveMisses: state.consecutiveMisses,
    collapseLimit: CFG.collapseLimit,
    graceDays: CFG.graceDays,
    reflections: state.reflections.length,
    reflectionsAbsorbed: state.reflectionsAbsorbed,
    endedAtDay: state.endedAtDay,
    voice: CFG.poet,
  };
}

// --------------------------------------------------------------- stream

const clients = new Set();

function broadcast(event, data) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) res.write(msg);
}

setInterval(() => {
  for (const res of clients) res.write(": still here\n\n");
}, 15_000);

// ----------------------------------------------------------------- http

function digest(s) {
  return crypto.createHash("sha256").update(String(s || "")).digest();
}

function keyMatches(req, expected) {
  return crypto.timingSafeEqual(digest(req.headers["x-vessel-key"]), digest(expected));
}

function send(res, code, body) {
  const json = JSON.stringify(body);
  res.writeHead(code, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(json);
}

function readBody(req, limit = 1_500_000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error("too large"));
        req.destroy();
      } else chunks.push(c);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

async function serveStatic(req, res, pathname) {
  let file;
  if (pathname === "/p5.min.js") file = P5;
  else {
    const rel = pathname === "/" ? "index.html" : pathname.slice(1);
    file = path.normalize(path.join(PUBLIC, rel));
    if (!file.startsWith(PUBLIC + path.sep)) return send(res, 404, { error: "not found" });
  }
  try {
    const body = await fsp.readFile(file);
    res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    send(res, 404, { error: "not found" });
  }
}

async function route(req, res) {
  const url = new URL(req.url, "http://local");
  const p = url.pathname;

  if (req.method === "GET" && p === "/api/state") return send(res, 200, publicState());

  if (req.method === "GET" && p === "/api/stream") {
    res.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-store",
      connection: "keep-alive",
    });
    res.write(`event: phase\ndata: ${JSON.stringify(publicState())}\n\n`);
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  // A kept day's residue — only ever for days the collector chose.
  const relic = p.match(/^\/api\/relic\/(\d+)$/);
  if (req.method === "GET" && relic) {
    const d = Number(relic[1]);
    if (state.phase === "afterimage") {
      const after = readJSON(AFTER_FILE, null);
      const s = after && after.saved.find((x) => x.d === d);
      return s ? send(res, 200, { d, w: FIELD_W, h: FIELD_H, frames: s.frames, month: s.month }) : send(res, 404, { error: "gone" });
    }
    if (!state.days[d] || state.days[d].status !== "saved") return send(res, 403, { error: "This day was not kept." });
    const residue = readJSON(path.join(RESIDUE, `${d}.json`), null);
    return residue ? send(res, 200, { ...residue, month: state.days[d].month }) : send(res, 404, { error: "gone" });
  }

  if (req.method === "GET" && p === "/api/afterimage") {
    if (state.phase !== "afterimage") return send(res, 404, { error: "Not yet." });
    return send(res, 200, readJSON(AFTER_FILE, null));
  }

  if (req.method === "POST" && p.startsWith("/api/lens/")) {
    if (!keyMatches(req, keys.lens)) return send(res, 401, { error: "wrong lens key" });
    let body;
    try {
      body = await readBody(req);
    } catch {
      return send(res, 400, { error: "bad body" });
    }
    if (!lensOpen()) return send(res, 410, { error: "The feed has ended.", phase: state.phase });
    if (!today || today.d !== currentDay()) await tick();
    // Mid-rotation (a day is being written and purged): drop this frame.
    if (!today || today.d !== currentDay()) return send(res, 202, { ok: false, waiting: true });

    if (p === "/api/lens/field") {
      const buf = Buffer.from(String(body.rgb || ""), "base64");
      if (buf.length !== FIELD_BYTES) return send(res, 400, { error: "field must be 48×36 rgb" });
      const slot = ingestField(buf);
      broadcast("field", { w: FIELD_W, h: FIELD_H, rgb: body.rgb });
      const wantKeyframe = CFG.poet === "vision" && !today.keyframes[slot];
      return send(res, 200, { ok: true, slot, keyframe: wantKeyframe ? slot : null, phase: state.phase });
    }
    if (p === "/api/lens/keyframe") {
      const m = String(body.jpeg || "").match(/^data:image\/jpeg;base64,(.+)$/);
      const slot = Number(body.slot);
      if (!m || !(slot >= 0 && slot < 24)) return send(res, 400, { error: "bad keyframe" });
      fs.mkdirSync(sourceDir(today.d), { recursive: true });
      await fsp.writeFile(path.join(sourceDir(today.d), `kf-${String(slot).padStart(2, "0")}.jpg`), Buffer.from(m[1], "base64"));
      today.keyframes[slot] = true;
      todayDirty = true;
      return send(res, 200, { ok: true });
    }
    return send(res, 404, { error: "not found" });
  }

  if (req.method === "POST" && p.startsWith("/api/")) {
    if (!keyMatches(req, keys.collector)) return send(res, 401, { error: "Only the collector can do this." });
    let body;
    try {
      body = await readBody(req, 20_000);
    } catch {
      return send(res, 400, { error: "bad body" });
    }
    if (p === "/api/acquire") {
      const r = acquire();
      return send(res, r.code || 200, r);
    }
    if (p === "/api/choose") {
      const r = await choose(Number(body.month), Number(body.day), body.reflection);
      return send(res, r.code || 200, r);
    }
    if (p === "/api/reflect") {
      if (state.phase === "pre" || state.phase === "afterimage") return send(res, 409, { error: "Not now." });
      if (!addReflection(body.text, monthOf(currentDay()))) return send(res, 400, { error: "Empty." });
      saveState();
      broadcast("phase", publicState());
      return send(res, 200, { ok: true });
    }
    if (p === "/api/whoami") return send(res, 200, { collector: true });
    return send(res, 404, { error: "not found" });
  }

  if (req.method === "GET") return serveStatic(req, res, p);
  send(res, 405, { error: "method not allowed" });
}

const server = http.createServer((req, res) => {
  route(req, res).catch((err) => {
    console.error(err);
    if (!res.headersSent) send(res, 500, { error: "internal" });
  });
});

setInterval(tick, 250);
setInterval(persistToday, 10_000);
tick();

server.listen(CFG.port, () => {
  const base = `http://localhost:${CFG.port}`;
  console.log(`LEAKY VESSEL — phase: ${state.phase}, speed ×${CFG.speed}, voice: ${CFG.poet}`);
  console.log(`  public view     ${base}/`);
  console.log(`  collector view  ${base}/?key=${keys.collector}`);
  console.log(`  lens (artist)   ${base}/lens.html?key=${keys.lens}`);
});

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    persistToday();
    saveState();
    process.exit(0);
  });
}
