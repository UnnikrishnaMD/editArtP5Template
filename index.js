// LEAKY VESSEL / TOUCHPOINTS — platform edition
//
// A day of consumer communication arrives in a room: push notifications,
// receipts, packaging, billboards, feeds, shop signs. None of it is ever shown
// as written. Each message lands already transmuted into a typographic
// abstraction built from its own letterforms. At 23:00 the system writes one
// log about what it observed. At midnight the day's marks are purged; half of
// what survived before leaks away, and only a faint residue, plus the one mark
// the viewer chose to hold, is carried into the next day.
//
// The five sliders follow one chain, each a single element to explore:
//   m0 CONSUMER CULTURE   how many messages reach the room in a day
//   m1 PARASOCIAL         how many speak as if they know you
//   m2 COMMON HUMAN       the rhythm of the person's day, and its light
//   m3 ADVERTISING        which touchpoints dominate: screen, hand, street
//   m4 TYPOGRAPHY         the operation that turns letters into abstraction
//
// Everything the sketch shows depends only on m0..m4, except what the viewer
// chooses to hold. Add ?clock=local to run on real local time (one day is one
// day) for gallery screens.

const DAY_SECONDS = 96; // compressed day: one hour every 4 s
const ARRIVE_MS = 1800;
const PURGE_MS = 3200;
const LOG_HOUR = 23; // the log is written here; holding closes here
const RETAIN = 0.5; // share of the residue that survives each night
const START_HOUR = 16; // a fresh run, and the preview, begin here on day 2
const ARCHIVE_MAX = 16;

const CLOCK_LOCAL = new URLSearchParams(window.location.search).get("clock") === "local";

// ------------------------------------------------------------------ type
// A 5×7 face drawn for this work. Every mark and every log is set in it, so
// the abstraction and the text that describes it share one letterform.

const FACE = {
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  C: [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  G: [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".####"],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: [".###.", "..#..", "..#..", "..#..", "..#..", "..#..", ".###."],
  J: ["..###", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##.."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  N: ["#...#", "#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  Q: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  V: ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  W: ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "#.#.#", ".#.#."],
  X: ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  Z: ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  0: [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
  1: ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  2: [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  3: ["#####", "...#.", "..#..", "...#.", "....#", "#...#", ".###."],
  4: ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  5: ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  6: ["..##.", ".#...", "#....", "####.", "#...#", "#...#", ".###."],
  7: ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
  8: [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  9: [".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."],
  ".": [".....", ".....", ".....", ".....", ".....", ".##..", ".##.."],
  ",": [".....", ".....", ".....", ".....", ".##..", "..#..", ".#..."],
  ":": [".....", ".##..", ".##..", ".....", ".##..", ".##..", "....."],
  "'": ["..#..", "..#..", ".#...", ".....", ".....", ".....", "....."],
  "?": [".###.", "#...#", "....#", "...#.", "..#..", ".....", "..#.."],
  "!": ["..#..", "..#..", "..#..", "..#..", "..#..", ".....", "..#.."],
  "%": ["##..#", "##..#", "...#.", "..#..", ".#...", "#..##", "#..##"],
  "-": [".....", ".....", ".....", "#####", ".....", ".....", "....."],
  "/": ["....#", "....#", "...#.", "..#..", ".#...", "#....", "#...."],
  "&": [".##..", "#..#.", "#.#..", ".#...", "#.#.#", "#..#.", ".##.#"],
  "+": [".....", "..#..", "..#..", "#####", "..#..", "..#..", "....."],
  "·": [".....", ".....", ".....", "..#..", ".....", ".....", "....."],
  "(": ["...#.", "..#..", ".#...", ".#...", ".#...", "..#..", "...#."],
  ")": [".#...", "..#..", "...#.", "...#.", "...#.", "..#..", ".#..."],
};

// Per glyph: its lit cells, and its rows merged into horizontal runs for
// setting text quickly.
const CELLS = {};
const RUNS = {};
for (const ch in FACE) {
  const cells = [];
  const runs = [];
  FACE[ch].forEach((row, r) => {
    let start = -1;
    for (let c = 0; c <= 5; c++) {
      const on = c < 5 && row[c] === "#";
      if (on) cells.push([c, r]);
      if (on && start < 0) start = c;
      if (!on && start >= 0) {
        runs.push([start, r, c - start]);
        start = -1;
      }
    }
  });
  CELLS[ch] = cells;
  RUNS[ch] = runs;
}

function wrapText(str, cols) {
  const lines = [];
  let line = "";
  for (let word of str.split(" ")) {
    while (word.length > cols) {
      if (line) lines.push(line);
      lines.push(word.slice(0, cols));
      word = word.slice(cols);
      line = "";
    }
    if (!word) continue;
    if (!line) line = word;
    else if (line.length + 1 + word.length <= cols) line += " " + word;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Set a string in the face. `erode(i)` marks letters that have been lost:
// they are drawn as a hairline where the letter was.
function setText(c, str, x, y, u, color, erode, lostColor) {
  x = Math.round(x);
  y = Math.round(y);
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const gx = x + i * 6 * u;
    if (ch === " ") continue;
    if (erode && erode(i)) {
      c.fillStyle = lostColor;
      c.fillRect(gx, y + 6 * u, 5 * u, Math.max(1, Math.round(u * 0.35)));
      continue;
    }
    const runs = RUNS[ch];
    if (!runs) continue;
    c.fillStyle = color;
    for (const [c0, r, len] of runs) c.fillRect(gx + c0 * u, y + r * u, len * u, u);
  }
  return str.length * 6 * u;
}

// ------------------------------------------------------------------ touchpoints
// Original copy, written for this work. Lines in [1] speak as if they know you.

const CHANNELS = [
  { id: "PUSH", said: "PHONE", fam: 0, w: 1.2, scale: 1.0, wrap: 22,
    lines: [["FLASH SALE ENDS AT MIDNIGHT", "PRICE DROP ON 3 ITEMS", "YOUR ORDER HAS SHIPPED", "NEW ARRIVALS ARE IN", "ONLY 2 LEFT IN STOCK"],
            ["YOUR CART MISSES YOU", "WE SAVED THIS JUST FOR YOU", "COME BACK, IT HAS BEEN A WHILE", "YOU LEFT SOMETHING BEHIND"]] },
  { id: "STREAM", said: "SCREEN", fam: 0, w: 0.7, scale: 1.0, wrap: 24,
    lines: [["NEW EPISODE AVAILABLE", "TRENDING NOW IN YOUR AREA", "AUTOPLAY IN 5"],
            ["ARE YOU STILL WATCHING?", "PICKED FOR YOU", "WELCOME BACK", "BECAUSE YOU WATCHED"]] },
  { id: "EMAIL", said: "INBOX", fam: 0, w: 0.8, scale: 1.0, wrap: 28,
    lines: [["LAST CHANCE: 40% OFF", "YOUR WEEKLY DIGEST", "WE HAVE UPDATED OUR TERMS", "RECEIPT FOR YOUR PURCHASE"],
            ["A LITTLE GIFT, FROM US TO YOU", "WE THOUGHT OF YOU TODAY", "HAPPY BIRTHDAY, HERE IS 15% OFF"]] },
  { id: "SMS", said: "TEXT MESSAGES", fam: 0, w: 0.7, scale: 1.0, wrap: 20,
    lines: [["YOUR CODE IS 4471. DO NOT SHARE.", "DELIVERY TODAY 2-4 PM", "BALANCE LOW. RECHARGE NOW.", "PAYMENT RECEIVED"],
            ["HEY! YOUR REWARD EXPIRES SOON", "WE MISS YOU. 20% OFF TODAY"]] },
  { id: "FEED", said: "FEED", fam: 0, w: 1.1, scale: 1.3, wrap: 18,
    lines: [["SPONSORED", "LINK IN BIO", "SWIPE UP", "LIMITED DROP AT 6 PM"],
            ["HI BESTIES, YOU ASKED SO HERE IT IS", "I ONLY USE THIS ONE, TRUST ME", "YOU GUYS ARE MY FAMILY", "GOOD MORNING TO YOU ONLY", "I MADE THIS FOR YOU"]] },
  { id: "RECEIPT", said: "RECEIPTS", fam: 1, w: 0.8, scale: 0.9, wrap: 12,
    lines: [["THANK YOU FOR SHOPPING", "TOTAL 12.80", "POINTS EARNED 40", "NO REFUND WITHOUT RECEIPT", "TAX INCLUDED"],
            ["SEE YOU AGAIN SOON!", "YOU SAVED 3.20 TODAY"]] },
  { id: "PACKAGING", said: "PACKAGING", fam: 1, w: 0.9, scale: 1.5, wrap: 14,
    lines: [["BEST BEFORE 14 11", "SERVING SUGGESTION", "NEW IMPROVED TASTE", "RECYCLE ME", "NET WT 250 G"],
            ["MADE WITH CARE FOR YOU", "A SMALL JOY, JUST FOR YOU"]] },
  { id: "RADIO", said: "RADIO", fam: 1, w: 0.6, scale: 1.2, wrap: 16,
    lines: [["LA LA LA, ONLY ON 98.4", "CALL NOW, LINES ARE OPEN", "TERMS AND CONDITIONS APPLY"],
            ["STAY WITH US, FRIEND", "THIS ONE IS FOR YOU OUT THERE"]] },
  { id: "POSTER", said: "POSTERS", fam: 2, w: 0.7, scale: 2.6, wrap: 12,
    lines: [["NEW SEASON", "THE FUTURE IS SOFT", "GRAND OPENING", "NOW SHOWING"],
            ["YOU DESERVE THIS", "MADE FOR YOU"]] },
  { id: "BILLBOARD", said: "BILLBOARDS", fam: 2, w: 0.5, scale: 4.0, wrap: 14,
    lines: [["LIVE BRIGHTER", "UPGRADE YOUR MORNINGS", "ALWAYS ON", "MORE FOR LESS"],
            ["YOU HAVE EARNED IT", "WE SEE YOU"]] },
  { id: "SIGN", said: "SHOP SIGNS", fam: 2, w: 0.8, scale: 4.5, wrap: 8,
    lines: [["OPEN", "SALE", "50% OFF", "CLOSING DOWN", "2 FOR 1", "NO PARKING"],
            ["WELCOME", "YOU ARE HERE"]] },
];
const FAMILIES = ["SCREEN", "HAND", "STREET"];
const TYPES = ["SLICE", "OVERPRINT", "CONSTELLATION", "SEDIMENT", "BARCODE"];

// The light the person lives in, from early riser to night owl.
const PALETTES = [
  { ground: [233, 229, 219], ink: [22, 21, 19], accent: [214, 64, 36] },
  { ground: [221, 224, 222], ink: [16, 20, 26], accent: [28, 78, 226] },
  { ground: [198, 189, 174], ink: [30, 24, 22], accent: [160, 22, 40] },
  { ground: [14, 14, 15], ink: [232, 228, 218], accent: [255, 86, 48] },
];

// ------------------------------------------------------------------ helpers

function hash01(n) {
  let x = (n | 0) ^ 0x9e3779b9;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const pad = (n, k) => String(n).padStart(k, "0");
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const mixc = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

function clockOf(hour) {
  const mins = Math.floor(hour * 60) % (24 * 60);
  return `${pad(Math.floor(mins / 60), 2)}:${pad(mins % 60, 2)}`;
}

// ------------------------------------------------------------------ state

let W, H, ctx;
let P, PAL, LAY, KEY;
let dayLayer, residue, dissolve;
let T = 0;
let lastMs = 0;
let day = null;
let archive = [];
let active = [];
let purge = null;
let previewSent = false;

function setup() {
  pixelDensity(Math.min(2, displayDensity()));
  createCanvas(windowWidth, windowHeight);
  ctx = drawingContext;
  reset();
}

function windowResizedUser() {
  resizeCanvas(windowWidth, windowHeight);
}

function reset() {
  W = width;
  H = height;
  KEY = [m0, m1, m2, m3, m4].map((v) => v.toFixed(3)).join("|");
  P = {
    volume: Math.round(16 + 184 * m0),
    intimacy: 0.04 + 0.86 * m1,
    peak: 7 + 16 * m2,
    fam: [0, 0.5, 1].map((c) => 0.12 + Math.exp(-((m3 - c) ** 2) / 0.06)),
    type: Math.min(4, Math.floor(m4 * 5)),
  };
  const pal = PALETTES[Math.min(3, Math.floor(m2 * 4))];
  PAL = {
    ...pal,
    faint: mixc(pal.ink, pal.ground, 0.55),
    lost: mixc(pal.ink, pal.ground, 0.78),
  };
  layout();

  for (const g of [dayLayer, residue, dissolve]) if (g) g.remove();
  dayLayer = createGraphics(W, H);
  dissolve = createGraphics(W, H);
  residue = createGraphics(W, H);
  residue.drawingContext.fillStyle = rgba(PAL.ground, 1);
  residue.drawingContext.fillRect(0, 0, W, H);

  archive = [];
  active = [];
  purge = null;
  const T0 = CLOCK_LOCAL ? localT() : 24 + START_HOUR;
  startDay(Math.floor(T0 / 24) - 1);
  advanceTo(T0, true);
  T = T0;
  lastMs = millis();
  previewSent = false;
}

function layout() {
  const s = Math.min(W, H);
  const margin = Math.round(s * 0.045);
  const tu = Math.max(1, Math.round(s / 320));
  const head = tu * 9 * 2 + tu * 4;
  const ruler = tu * 9 + tu * 6;
  let F, Lg;
  if (W >= H * 1.15) {
    const colW = Math.max(30 * 6 * tu, Math.round(W * 0.27));
    F = { x: margin, y: margin + head, w: W - margin * 3 - colW, h: H - margin * 2 - head - ruler };
    Lg = { x: W - margin - colW, y: margin + head, w: colW, h: H - margin * 2 - head };
  } else {
    const band = Math.round(H * 0.34);
    F = { x: margin, y: margin + head, w: W - margin * 2, h: H - margin * 3 - head - ruler - band };
    Lg = { x: margin, y: F.y + F.h + ruler + margin, w: W - margin * 2, h: band };
  }
  LAY = { margin, tu, F, L: Lg, base: Math.max(1, Math.min(F.w, F.h) / 200) };
}

function localT() {
  const now = new Date();
  const dayIndex = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000);
  return dayIndex * 24 + now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
}

// ------------------------------------------------------------------ a day

function startDay(index) {
  day = { index, msgs: genMessages(index), next: 0, marks: [], held: null, log: null };
  dayLayer.clear();
}

function genMessages(index) {
  const R = getRNG(`day|${KEY}|${index}`);
  const n = Math.round(P.volume * (0.8 + R() * 0.4));
  let total = 0;
  const weights = CHANNELS.map((ch) => (total += ch.w * P.fam[ch.fam]));
  const msgs = [];
  for (let k = 0; k < n; k++) {
    let hour;
    if (R() < 0.68) {
      const g = Math.sqrt(-2 * Math.log(Math.max(1e-9, R()))) * Math.cos(2 * Math.PI * R());
      hour = P.peak + g * 3;
    } else hour = 6 + R() * 18;
    hour = ((hour % 24) + 24) % 24;
    const intimate = R() < P.intimacy;
    const pick = R() * total;
    const ch = CHANNELS[weights.findIndex((w) => pick < w)];
    const pool = ch.lines[intimate ? 1 : 0];
    const text = pool[Math.floor(R() * pool.length)];
    msgs.push(buildMark(ch, text, intimate, hour, R, index * 4099 + k * 131));
  }
  msgs.sort((a, b) => a.hour - b.hour);
  return msgs;
}

// The message is laid out in the face, then transmuted before it is ever drawn.
function buildMark(ch, text, intimate, hour, R, seed) {
  const lines = wrapText(text, ch.wrap);
  const mods = [];
  lines.forEach((line, li) => {
    for (let ci = 0; ci < line.length; ci++) {
      const cells = CELLS[line[ci]];
      if (!cells) continue;
      for (const [c, r] of cells) mods.push({ x: ci * 6 + c, y: li * 9 + r, li, ci, c, r });
    }
  });
  const cols = Math.max(...lines.map((l) => l.length)) * 6 - 1;
  const rows = lines.length * 9 - 2;
  const t = TRANSMUTE[P.type](mods, cols, rows, R);

  const { F, base } = LAY;
  let m = base * ch.scale * (0.85 + R() * 0.3) * (intimate ? 1 + 0.2 * P.intimacy : 1);
  m = Math.min(m, (F.w * 0.94) / t.bw, (F.h * 0.94) / t.bh);
  const pw = t.bw * m;
  const ph = t.bh * m;
  let x = F.x + R() * (F.w - pw);
  let y = F.y + R() * (F.h - ph);
  if (intimate) x += (F.x + (F.w - pw) / 2 - x) * 0.25;
  const snap = Math.max(1, Math.round(base));
  x = F.x + Math.round((x - F.x) / snap) * snap;
  y = F.y + Math.round((y - F.y) / snap) * snap;

  const famAlpha = [0.9, 0.82, 0.42][ch.fam] * (intimate ? 0.7 : 1);
  return {
    ch, text, intimate, hour, seed, m, x, y, pw, ph,
    rects: t.rects, links: t.links, bw: t.bw, bh: t.bh,
    alpha: famAlpha * t.alpha, born: 0,
  };
}

// ------------------------------------------------------------------ transmutation
// Each operation returns rects [x,y,w,h,...] and hairline links [x1,y1,x2,y2,...]
// in module units. None of them leaves the message readable.

const TRANSMUTE = [
  // SLICE: each row of modules is shifted on its own wave, so letters shear apart
  (mods, cols, rows, R) => {
    const amp = 3 + Math.floor(R() * 5);
    const freq = 1.3 + R() * 1.4;
    const ph = R() * 6.283;
    const shift = [];
    for (let y = 0; y <= rows; y++) {
      shift.push(Math.round(Math.sin(y * freq + ph) * amp * 0.6 + (R() - 0.5) * amp * 0.8));
    }
    const rects = [];
    for (const d of mods) rects.push(d.x + amp + shift[d.y], d.y, 1, 1);
    return { rects, links: [], bw: cols + amp * 2 + 1, bh: rows, alpha: 1 };
  },
  // OVERPRINT: the letters of a line collapse onto each other; tone is density
  (mods, cols, rows, R) => {
    const squeeze = 0.06 + R() * 0.12;
    const rects = [];
    let bw = 1;
    for (const d of mods) {
      const x = Math.round(d.ci * 6 * squeeze) + d.c;
      rects.push(x, d.y, 1, 1);
      bw = Math.max(bw, x + 1);
    }
    return { rects, links: [], bw, bh: rows, alpha: 0.4 };
  },
  // CONSTELLATION: only stroke ends and joints survive, read left to right as a signal
  (mods, cols, rows, R) => {
    const on = new Set(mods.map((d) => `${d.li}|${d.ci}|${d.c}|${d.r}`));
    const pts = mods.filter((d) => {
      let n = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (on.has(`${d.li}|${d.ci}|${d.c + dx}|${d.r + dy}`)) n++;
      }
      return n !== 2;
    });
    pts.sort((a, b) => a.li - b.li || a.x - b.x || a.y - b.y);
    const rects = [];
    const links = [];
    const ys = pts.map((d) => Math.max(0, Math.min(rows - 1, d.y + Math.round((R() - 0.5) * 6))));
    pts.forEach((d, i) => {
      rects.push(d.x, ys[i], 1, 1);
      const nx = pts[i + 1];
      if (nx && nx.li === d.li) links.push(d.x + 0.5, ys[i] + 0.5, nx.x + 0.5, ys[i + 1] + 0.5);
    });
    return { rects, links, bw: cols, bh: rows, alpha: 1 };
  },
  // SEDIMENT: every module falls to the floor; the message becomes a quantity
  (mods, cols, rows) => {
    const count = new Array(cols + 1).fill(0);
    for (const d of mods) count[d.x]++;
    const rects = [];
    const bh = Math.max(rows, ...count);
    count.forEach((n, x) => n && rects.push(x, bh - n, 1, n));
    return { rects, links: [], bw: cols, bh, alpha: 1 };
  },
  // BARCODE: each column of the letters becomes a bar, as wide as it is full
  (mods, cols, rows) => {
    const count = new Array(cols + 1).fill(0);
    for (const d of mods) count[d.x]++;
    const rects = [];
    count.forEach((n, x) => n && rects.push(x, 0, 0.15 + 0.85 * Math.min(1, n / 7), rows));
    return { rects, links: [], bw: cols, bh: rows, alpha: 1 };
  },
];

// p = 1 draws the settled mark; below 1 its pieces are still converging.
function paintMark(c, mk, p, alphaMul) {
  const col = mk.intimate ? PAL.accent : PAL.ink;
  const R = mk.rects;
  const m = mk.m;
  c.fillStyle = rgba(col, mk.alpha * alphaMul);
  if (p >= 1) {
    for (let j = 0; j < R.length; j += 4) {
      const x = Math.round(mk.x + R[j] * m);
      const y = Math.round(mk.y + R[j + 1] * m);
      c.fillRect(x, y, Math.max(1, Math.round(mk.x + (R[j] + R[j + 2]) * m) - x), Math.max(1, Math.round(mk.y + (R[j + 1] + R[j + 3]) * m) - y));
    }
  } else {
    for (let j = 0; j < R.length; j += 4) {
      const k = mk.seed + j;
      const q = clamp01((p - hash01(k) * 0.45) / 0.55);
      if (q <= 0) continue;
      const e = easeOut(q);
      const sx = (hash01(k * 3 + 1) - 0.5) * mk.bw * 0.9;
      const sy = (hash01(k * 5 + 2) - 0.5) * mk.bh * 2.5;
      c.fillRect(mk.x + (R[j] + sx * (1 - e)) * m, mk.y + (R[j + 1] + sy * (1 - e)) * m, R[j + 2] * m * e, R[j + 3] * m * e);
    }
  }
  const Lk = mk.links;
  if (Lk.length && p > 0.8) {
    c.strokeStyle = rgba(col, mk.alpha * alphaMul * 0.7 * clamp01((p - 0.8) / 0.2));
    c.lineWidth = Math.max(1, m * 0.14);
    c.beginPath();
    for (let j = 0; j < Lk.length; j += 4) {
      c.moveTo(mk.x + Lk[j] * m, mk.y + Lk[j + 1] * m);
      c.lineTo(mk.x + Lk[j + 2] * m, mk.y + Lk[j + 3] * m);
    }
    c.stroke();
  }
}

function bake(mk) {
  paintMark(dayLayer.drawingContext, mk, 1, 1);
}

// ------------------------------------------------------------------ time

function advanceTo(Tn, instant) {
  const target = Math.floor(Tn / 24);
  let guard = 0;
  while (target > day.index && guard++ < 3) {
    endDay(instant);
    startDay(day.index + 1);
  }
  // Asleep for days: those days were never observed, and leave nothing.
  if (target > day.index) startDay(target);

  const hour = Tn - day.index * 24;
  const now = millis();
  while (day.next < day.msgs.length && day.msgs[day.next].hour <= hour) {
    const mk = day.msgs[day.next++];
    mk.born = now;
    day.marks.push(mk);
    if (instant) bake(mk);
    else active.push(mk);
  }
  if (hour >= LOG_HOUR && !day.log) day.log = composeLog(day);
}

// Midnight: the log is archived, the residue leaks, the day's marks are purged.
function endDay(instant) {
  for (const mk of active) bake(mk);
  active = [];
  while (day.next < day.msgs.length) {
    const mk = day.msgs[day.next++];
    day.marks.push(mk);
    bake(mk);
  }
  if (!day.log) day.log = composeLog(day);
  archive.unshift({ index: day.index, text: day.log });
  if (archive.length > ARCHIVE_MAX) archive.pop();

  const { F } = LAY;
  const rc = residue.drawingContext;
  rc.fillStyle = rgba(PAL.ground, 1 - RETAIN);
  rc.fillRect(0, 0, W, H);
  rc.fillStyle = rgba(PAL.ground, 1);
  const B = Math.max(4, Math.round(LAY.base * 5));
  for (let by = F.y; by < F.y + F.h; by += B) {
    for (let bx = F.x; bx < F.x + F.w; bx += B) {
      if (hash01(day.index * 7919 + bx * 31 + by * 17) < 0.07) rc.fillRect(bx, by, B, B);
    }
  }
  rc.globalAlpha = 0.16;
  rc.drawImage(dayLayer.elt, 0, 0, W, H);
  rc.globalAlpha = 1;
  if (day.held) paintMark(rc, day.held, 1, 0.85);

  if (!instant) {
    dissolve.clear();
    dissolve.drawingContext.drawImage(dayLayer.elt, 0, 0, W, H);
    purge = { start: millis(), done: 0, seed: day.index };
  }
}

// ------------------------------------------------------------------ the log
// Written at 23:00 from what was measured, never from what was seen.

const STOP = new Set(["THIS", "THAT", "YOUR", "WITH", "FROM", "HERE", "JUST", "ONLY", "HAVE", "THERE", "THEY", "BEEN", "WHILE", "ARE", "YOU", "THE", "AND", "FOR", "OUT"]);

function composeLog(d) {
  const R = getRNG(`log|${KEY}|${d.index}`);
  const one = (arr) => arr[Math.floor(R() * arr.length)];
  const seen = d.marks;
  const n = seen.length;
  if (!n) return "NOTHING REACHED THE ROOM TODAY. I WROTE THIS ANYWAY.";
  const k = seen.filter((mk) => mk.intimate).length;
  const byCh = {};
  const byHour = new Array(24).fill(0);
  const words = {};
  for (const mk of seen) {
    byCh[mk.ch.said] = (byCh[mk.ch.said] || 0) + 1;
    byHour[Math.floor(mk.hour)]++;
    for (const w of mk.text.replace(/[^A-Z ]/g, "").split(" ")) {
      if (w.length >= 4 && !STOP.has(w)) words[w] = (words[w] || 0) + 1;
    }
  }
  const top = Object.keys(byCh).sort((a, b) => byCh[b] - byCh[a])[0];
  const peak = byHour.indexOf(Math.max(...byHour));
  let quiet = 7;
  for (let h = 7; h < 23; h++) if (byHour[h] < byHour[quiet]) quiet = h;
  const word = Object.keys(words).sort((a, b) => words[b] - words[a])[0];
  const wc = word ? words[word] : 0;
  const first = clockOf(seen[0].hour);
  const last = clockOf(seen[n - 1].hour);

  const out = [];
  out.push(n < 40
    ? `ONLY ${n} MESSAGES TODAY. THE QUIET HAD A SHAPE TOO.`
    : one([
      `${n} MESSAGES CAME INTO THIS ROOM TODAY. I KEPT THE SHAPE OF EACH ARRIVAL AND NONE OF THE WORDS.`,
      `I COUNTED ${n} VOICES BETWEEN ${first} AND ${last}. EACH ONE WANTED SOMETHING SMALL.`,
      `${n} TIMES TODAY SOMETHING ASKED TO BE NOTICED. I NOTICED. THAT WAS ALL I COULD DO.`,
    ]));
  out.push(k === 0
    ? "NOTHING TODAY PRETENDED TO KNOW ME. IT FELT LIKE WEATHER."
    : one([
      `${k} OF THEM CALLED ME YOU, AS IF THEY KNEW WHICH ONE.`,
      `${k} SPOKE THE WAY FRIENDS DO. NONE OF THEM WILL REMEMBER THE ROOM.`,
      `${Math.round((100 * k) / n)}% WERE ADDRESSED TO SOMEONE. I AM NOT SURE IT WAS ANYONE HERE.`,
    ]));
  if (wc >= 3 && R() < 0.5) {
    out.push(one([
      `ONE WORD CAME BACK ${wc} TIMES: ${word}. BY MORNING I WILL NOT BE SURE OF IT.`,
      `I HEARD ${word} ${wc} TIMES. REPETITION IS NOT THE SAME AS MEMORY.`,
    ]));
  } else {
    out.push(one([
      `THE ${top} SPOKE MOST. AT ${pad(peak, 2)}:00 IT WAS LOUDEST, AND AT ${pad(quiet, 2)}:00 NOTHING WANTED ANYTHING.`,
      `MOST OF IT ARRIVED BY ${top}. THE ROOM DID NOT ANSWER.`,
      `${pad(peak, 2)}:00 WAS THE CROWDED HOUR. I CANNOT TELL YOU WHAT WAS SAID IN IT.`,
    ]));
  }
  out.push(d.held
    ? one([
      `YOU HELD ONE BACK, FROM THE ${d.held.ch.said} AT ${clockOf(d.held.hour)}. IT IS THE ONLY THING I WILL CARRY WHOLE.`,
      "ONE THING WAS CHOSEN. THE REST GO WITHOUT IT.",
    ])
    : one(["NOTHING WAS HELD. ALL OF IT GOES.", "NO ONE CHOSE. THE DAY LEAVES EVENLY."]));
  if (R() < 0.6) {
    out.push(one([
      "THE IMAGES END AT MIDNIGHT. THIS LINE IS WHAT REMAINS.",
      "HALF OF YESTERDAY IS ALREADY GONE. TONIGHT IT WILL BE HALF AGAIN.",
      "WHAT STAYS WILL NOT BE WHAT HAPPENED. IT WILL BE WHAT WAS KEPT.",
    ]));
  }
  return out.join(" ");
}

// ------------------------------------------------------------------ frame

function draw() {
  if (resetAnimation) {
    resetAnimation = false;
    reset();
  }
  const now = millis();
  // The first frame after a reset is the preview: it must not depend on timing.
  const dt = previewSent ? Math.min(0.25, (now - lastMs) / 1000) : 0;
  lastMs = now;
  T = CLOCK_LOCAL ? localT() : T + (dt * 24) / DAY_SECONDS;
  advanceTo(T, false);
  active = active.filter((mk) => {
    if (now - mk.born < ARRIVE_MS) return true;
    bake(mk);
    return false;
  });

  render(now);

  if (!previewSent) {
    previewSent = true;
    triggerPreview();
  }
}

function render(now) {
  const { F } = LAY;
  ctx.drawImage(residue.elt, 0, 0, W, H);
  ctx.drawImage(dayLayer.elt, 0, 0, W, H);

  if (purge) {
    const prog = clamp01((now - purge.start) / PURGE_MS);
    const dc = dissolve.drawingContext;
    const B = Math.max(4, Math.round(LAY.base * 3));
    for (let by = F.y; by < F.y + F.h; by += B) {
      for (let bx = F.x; bx < F.x + F.w; bx += B) {
        const h = hash01(purge.seed * 104729 + bx * 73 + by * 151);
        if (h > purge.done && h <= prog) dc.clearRect(bx, by, B, B);
      }
    }
    purge.done = prog;
    ctx.drawImage(dissolve.elt, 0, 0, W, H);
    if (prog >= 1) purge = null;
  }

  for (const mk of active) paintMark(ctx, mk, clamp01((now - mk.born) / ARRIVE_MS), 1);

  const hour = T - day.index * 24;
  if (day.held) outline(day.held, "HELD");
  const hov = hit(mouseX, mouseY);
  if (hov && hov !== day.held) {
    outline(hov, null);
    label(`${hov.ch.id} · ${clockOf(hov.hour)} · ${hov.text.length} CHARACTERS`, mouseX, mouseY);
  }

  header(hour);
  rulerBar(hour);
  logPanel(hour);
}

function outline(mk, tag) {
  const { tu } = LAY;
  ctx.strokeStyle = rgba(PAL.accent, 0.9);
  ctx.lineWidth = 1;
  ctx.strokeRect(Math.round(mk.x) - 3.5, Math.round(mk.y) - 3.5, Math.round(mk.pw) + 7, Math.round(mk.ph) + 7);
  if (tag) setText(ctx, tag, mk.x - 3, mk.y - 3 - tu * 9, tu, rgba(PAL.accent, 1));
}

function label(str, x, y) {
  const { tu } = LAY;
  const w = str.length * 6 * tu + tu * 4;
  const h = tu * 11;
  const lx = Math.min(W - w - 4, x + 14);
  const ly = Math.min(H - h - 4, y + 14);
  ctx.fillStyle = rgba(PAL.ground, 0.92);
  ctx.fillRect(lx, ly, w, h);
  setText(ctx, str, lx + tu * 2, ly + tu * 2, tu, rgba(PAL.ink, 1));
}

function header(hour) {
  const { margin, tu } = LAY;
  const ink = rgba(PAL.ink, 1);
  const faint = rgba(PAL.faint, 1);
  const y = margin;
  const title = "LEAKY VESSEL / TOUCHPOINTS";
  const when = CLOCK_LOCAL ? new Date().toISOString().slice(0, 10) : `DAY ${pad(day.index + 1, 3)}`;
  const right = `${when} · ${clockOf(hour)}`;
  const cols = Math.floor((W - margin * 2) / (6 * tu));
  setText(ctx, title, margin, y, tu, ink);
  if (title.length + right.length + 3 > cols) {
    setText(ctx, right, margin, y + tu * 11, tu, ink);
    return;
  }
  setText(ctx, right, W - margin - right.length * 6 * tu, y, tu, ink);

  const rule = "RAW NEVER SHOWN · SOURCE PURGED AT 00:00 · HALF OF THE RESIDUE LEAKS EACH NIGHT";
  const f = (v) => v.toFixed(2).slice(1);
  const params = `CONSUMER ${f(m0)} · PARASOCIAL ${f(m1)} · HUMAN ${f(m2)} · ADVERTISING ${f(m3)} · TYPE ${TYPES[P.type]}`;
  const y2 = y + tu * 11;
  if (rule.length + params.length + 4 <= cols) {
    setText(ctx, rule, margin, y2, tu, faint);
    setText(ctx, params, W - margin - params.length * 6 * tu, y2, tu, faint);
  } else {
    setText(ctx, (cols >= params.length ? params : `TYPE ${TYPES[P.type]}`), margin, y2, tu, faint);
  }
}

// The hours of the day, with a tick for every arrival so far.
function rulerBar(hour) {
  const { F, tu } = LAY;
  const y = F.y + F.h + tu * 4;
  ctx.fillStyle = rgba(PAL.faint, 1);
  ctx.fillRect(F.x, y, F.w, 1);
  for (let h = 0; h <= 24; h += 6) {
    const x = F.x + (F.w * h) / 24;
    ctx.fillRect(Math.round(x), y - tu, 1, tu * 2);
    const s = pad(h, 2);
    setText(ctx, s, Math.min(F.x + F.w - s.length * 6 * tu, x - (h ? s.length * 3 * tu : 0)), y + tu * 3, tu, rgba(PAL.faint, 1));
  }
  for (const mk of day.marks) {
    ctx.fillStyle = rgba(mk.intimate ? PAL.accent : PAL.ink, 0.8);
    ctx.fillRect(Math.round(F.x + (F.w * mk.hour) / 24), y - tu * 3, 1, tu * 3);
  }
  ctx.fillStyle = rgba(PAL.ink, 1);
  ctx.fillRect(Math.round(F.x + (F.w * hour) / 24), y - tu * 5, Math.max(1, tu), tu * 7);
}

function logPanel(hour) {
  const { L, tu } = LAY;
  const ink = rgba(PAL.ink, 1);
  const faint = rgba(PAL.faint, 1);
  const lost = rgba(PAL.lost, 1);
  const cols = Math.max(12, Math.floor(L.w / (6 * tu)));
  const lh = tu * 10;
  let y = L.y;
  const bottom = L.y + L.h;
  const line = (s, color) => {
    if (y + lh > bottom) return false;
    setText(ctx, s, L.x, y, tu, color);
    y += lh;
    return true;
  };

  const fam = [0, 0, 0];
  let you = 0;
  for (const mk of day.marks) {
    fam[mk.ch.fam]++;
    if (mk.intimate) you++;
  }
  line("TODAY", ink);
  line(FAMILIES.map((f, i) => `${f} ${fam[i]}`).join("  "), faint);
  line(`ADDRESSED AS YOU ${you}`, faint);
  if (day.held) line(`HELD: ${day.held.ch.id} ${clockOf(day.held.hour)}`, rgba(PAL.accent, 1));
  else line(hour < LOG_HOUR ? `HOLD ONE MARK BEFORE ${LOG_HOUR}:00` : "HOLDING IS CLOSED", faint);
  y += lh;

  line(`LOG · ${CLOCK_LOCAL ? "TODAY" : "DAY " + pad(day.index + 1, 3)}`, ink);
  if (!day.log) line(`WRITTEN AT ${LOG_HOUR}:00`, faint);
  else {
    const shown = Math.floor(day.log.length * clamp01((hour - LOG_HOUR) * 1.15));
    for (const s of wrapText(day.log.slice(0, shown), cols)) if (!line(s, ink)) return;
  }
  y += lh;

  // Earlier logs lose letters as they age, and are gone after sixteen days.
  for (const a of archive) {
    const age = day.index - a.index;
    const loss = Math.min(0.92, 1 - Math.pow(0.86, age));
    if (!line(`DAY ${pad(a.index + 1, 3)} · ${age === 1 ? "YESTERDAY" : age + " DAYS AGO"}`, faint)) return;
    let offset = 0;
    for (const s of wrapText(a.text, cols)) {
      if (y + lh > bottom) return;
      const base = offset;
      setText(ctx, s, L.x, y, tu, faint, (i) => hash01(a.index * 7919 + base + i) < loss, lost);
      offset += s.length + 1;
      y += lh;
    }
    y += lh;
  }
}

// ------------------------------------------------------------------ the hold

function hit(x, y) {
  const { F } = LAY;
  if (!day || x < F.x || y < F.y || x > F.x + F.w || y > F.y + F.h) return null;
  for (let i = day.marks.length - 1; i >= 0; i--) {
    const mk = day.marks[i];
    if (x >= mk.x && x <= mk.x + mk.pw && y >= mk.y && y <= mk.y + mk.ph) return mk;
  }
  return null;
}

function mousePressed() {
  const hour = T - day.index * 24;
  if (hour >= LOG_HOUR) return;
  const mk = hit(mouseX, mouseY);
  if (mk) day.held = day.held === mk ? null : mk;
}

function keyPressed() {
  if (key === "s" || key === "S") saveCanvas(`leaky-vessel-touchpoints-${KEY.replace(/\|/g, "-")}`, "png");
}
