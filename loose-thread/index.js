// LEAKY VESSEL / LOOSE THREAD — platform edition
//
// A drawing laid in fluorescent cotton thread. People arrive through the day
// and are couched onto the cloth as single continuous lines: scrolling,
// tapping a card, carrying something home, waiting in line, reaching for a
// shelf. Each one runs a thread towards a touchpoint of consumer
// communication: a push, a feed, a receipt, a billboard. No thread ever
// arrives. The system is built so that a transaction cannot complete.
//
// At 23:00 the copywriter looks at what was stitched and publishes one push
// notification: a headline, body copy and a call to action, written only
// from counts. One figure is kept: the one the viewer pushed, or, if nobody
// did, the one the system judged closest to converting. At midnight every
// stitch is unpicked. What stays is the needle holes, the kept figure at half
// strength, and the day's headline perforated large across the cloth.
//
// The five sliders follow one chain, each a single element to explore:
//   m0 CONSUMER CULTURE   how many people pass through in a day
//   m1 PARASOCIAL         how many of them run their thread towards YOU
//   m2 COMMON HUMAN       the rhythm of the day, and the cloth it is lived on
//   m3 ADVERTISING        which touchpoints the room is built from, and the
//                         activities that follow from them
//   m4 TYPOGRAPHY         the stitch that turns the 5×7 face into thread
//
// Everything depends only on m0..m4, except what the viewer pushes. Add
// ?clock=local to run on real local time (one day is one day).

const DAY_SECONDS = 96; // compressed day: one hour every 4 s
const START_HOUR = 16; // a fresh run, and the preview, begin here on day 2
const LOG_HOUR = 23; // the push is written here; pushing closes here
const PURGE_MS = 3600;
const CLOCK_LOCAL = new URLSearchParams(window.location.search).get("clock") === "local";
const DAY_REAL = CLOCK_LOCAL ? 86400 : DAY_SECONDS; // seconds in one day
const FIG_S = CLOCK_LOCAL ? 80 : 3.2; // time to couch one figure
const PAY_S = CLOCK_LOCAL ? 120 : 4.5; // time to run its thread out
const CARD_S = CLOCK_LOCAL ? 420 : 7; // time to stitch the push
const RETAIN_RESIDUE = 0.5;
const RETAIN_HOLES = 0.6;
const ARCHIVE_MAX = 6;

// ------------------------------------------------------------------ type
// The 5×7 face shared by the whole Leaky Vessel series.

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
const lit = (ch, c, r) => FACE[ch] && r >= 0 && r < 7 && c >= 0 && c < 5 && FACE[ch][r][c] === "#";

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

// Printed text, for the interface only. Letters that `lost(i)` has taken are
// left as a single needle hole.
function setText(g, str, x, y, u, color, lost, holeColor) {
  x = Math.round(x);
  y = Math.round(y);
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const gx = x + i * 6 * u;
    if (ch === " ") continue;
    if (lost && lost(i)) {
      g.fillStyle = holeColor;
      g.fillRect(gx + 2 * u, y + 3 * u, u, u);
      continue;
    }
    const runs = RUNS[ch];
    if (!runs) continue;
    g.fillStyle = color;
    for (const [c0, r, len] of runs) g.fillRect(gx + c0 * u, y + r * u, len * u, u);
  }
  return str.length * 6 * u;
}

// ------------------------------------------------------------------ stitches
// The typography element. The same face, five ways of putting it into cloth.
// Each returns stitches: lines {a:[x1,y1,x2,y2]} or knots {k:[x,y,r]}.

const STITCHES = ["CROSS STITCH", "RUNNING STITCH", "BACKSTITCH", "SATIN STITCH", "FRENCH KNOT"];

function stitchGlyph(ch, gx, y, u, type, out) {
  const cells = CELLS[ch];
  if (!cells) return;
  const m = u * 0.12;
  if (type === 0) {
    for (const [c, r] of cells) {
      const x0 = gx + c * u + m, y0 = y + r * u + m, s = u - 2 * m;
      out.push({ a: [x0, y0, x0 + s, y0 + s] }, { a: [x0 + s, y0, x0, y0 + s] });
    }
  } else if (type === 1) {
    for (const [c, r] of cells) {
      const yy = y + r * u + u * 0.5;
      out.push({ a: [gx + c * u + u * 0.08, yy, gx + c * u + u * 0.72, yy] });
    }
  } else if (type === 2) {
    // Join each module to its lit neighbours, as a continuous stroke would.
    for (const [c, r] of cells) {
      const x0 = gx + c * u + u / 2, y0 = y + r * u + u / 2;
      const right = lit(ch, c + 1, r), down = lit(ch, c, r + 1);
      if (right) out.push({ a: [x0, y0, x0 + u, y0] });
      if (down) out.push({ a: [x0, y0, x0, y0 + u] });
      if (lit(ch, c + 1, r + 1) && !right && !down) out.push({ a: [x0, y0, x0 + u, y0 + u] });
      if (lit(ch, c - 1, r + 1) && !lit(ch, c - 1, r) && !down) out.push({ a: [x0, y0, x0 - u, y0 + u] });
      if (!right && !down && !lit(ch, c - 1, r) && !lit(ch, c, r - 1)) out.push({ k: [x0, y0, u * 0.22] });
    }
  } else if (type === 3) {
    for (const [c, r] of cells) {
      for (let i = 0; i < 3; i++) {
        const x0 = gx + c * u + (i + 0.2) * (u / 3);
        out.push({ a: [x0, y + r * u + u * 0.95, x0 + u * 0.38, y + r * u + u * 0.05] });
      }
    }
  } else {
    for (const [c, r] of cells) out.push({ k: [gx + c * u + u / 2, y + r * u + u / 2, u * 0.36] });
  }
}

function stitchText(str, x, y, u, type, out) {
  for (let i = 0; i < str.length; i++) if (str[i] !== " ") stitchGlyph(str[i], x + i * 6 * u, y, u, type, out);
  return str.length * 6 * u;
}

// Where the needle went through the cloth for a set of stitches.
function holesOf(ops, out) {
  for (const op of ops) {
    if (op.a) out.push(op.a[0], op.a[1], op.a[2], op.a[3]);
    else {
      const [x, y, r] = op.k;
      out.push(x, y, x + r * 0.6, y - r * 0.3);
    }
  }
  return out;
}

// ------------------------------------------------------------------ people
// Poses in figure units: feet at y = 0, a standing head near y = -1, facing +x.
// Props are traced from the right hand and return to it, so each person is
// one continuous thread.

const BASE = {
  hd: [0, -0.92], r: 0.068, nk: [0, -0.83], sL: [-0.11, -0.79], sR: [0.11, -0.79],
  eL: [-0.13, -0.6], hL: [-0.12, -0.44], eR: [0.13, -0.6], hR: [0.12, -0.44], pv: [0, -0.5],
  kL: [-0.06, -0.26], kR: [0.06, -0.26], fL: [-0.08, 0], fR: [0.08, 0],
};

const circ = (cx, cy, r, turns = 1.1, n = 14) => {
  const out = [];
  for (let i = 0; i <= n * turns; i++) {
    const a = Math.PI / 2 + (i / n) * Math.PI * 2;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return out;
};

const ACTS = {
  SCROLLING: { fam: 0, said: "SCROLLING",
    pose: { hd: [0.035, -0.885], eL: [-0.12, -0.6], hL: [-0.02, -0.68], eR: [0.12, -0.6], hR: [0.03, -0.69] },
    prop: [[0.0, -0.66], [0.07, -0.7], [0.05, -0.8], [-0.02, -0.76], [0.0, -0.66], [0.03, -0.69]] },
  TAPPING: { fam: 0, said: "TAPPING A CARD",
    pose: { eR: [0.2, -0.7], hR: [0.33, -0.73] },
    prop: [[0.34, -0.75], [0.41, -0.77], [0.42, -0.72], [0.35, -0.7], [0.33, -0.73]] },
  SIPPING: { fam: 1, said: "HOLDING A CUP",
    pose: { hd: [-0.01, -0.93], eR: [0.15, -0.64], hR: [0.06, -0.83] },
    prop: [[0.05, -0.81], [0.11, -0.81], [0.1, -0.72], [0.06, -0.72], [0.05, -0.81], [0.06, -0.83]] },
  CARRYING: { fam: 1, said: "CARRYING SOMETHING HOME",
    pose: { kL: [-0.1, -0.27], fL: [-0.18, 0], kR: [0.07, -0.26], fR: [0.15, -0.01],
      eL: [-0.15, -0.63], hL: [-0.2, -0.5], eR: [0.14, -0.63], hR: [0.16, -0.47] },
    prop: [[0.11, -0.39], [0.09, -0.17], [0.3, -0.17], [0.27, -0.39], [0.16, -0.47]] },
  UNBOXING: { fam: 1, said: "OPENING A BOX",
    pose: { pv: [0, -0.3], kL: [0.12, -0.03], kR: [0.16, -0.04], fL: [-0.16, 0], fR: [-0.12, -0.01],
      nk: [0.08, -0.6], sL: [-0.02, -0.57], sR: [0.16, -0.57], hd: [0.13, -0.68],
      eL: [0.12, -0.4], hL: [0.26, -0.22], eR: [0.26, -0.42], hR: [0.36, -0.22] },
    prop: [[0.43, -0.2], [0.51, -0.3], [0.43, -0.2], [0.43, 0], [0.2, 0], [0.2, -0.2], [0.12, -0.29],
      [0.2, -0.2], [0.43, -0.2], [0.36, -0.22]] },
  QUEUEING: { fam: 2, said: "WAITING IN LINE",
    pose: { kL: [-0.05, -0.26], fL: [-0.09, 0], kR: [0.08, -0.27], fR: [0.12, -0.01], pv: [0.02, -0.5],
      eL: [-0.13, -0.62], hL: [-0.02, -0.55], eR: [0.13, -0.62], hR: [0.03, -0.56], hd: [0, -0.93] },
    prop: [[0.05, -0.52], [0.04, -0.43], [0.07, -0.36], [0.05, -0.45], [0.03, -0.56]] },
  REACHING: { fam: 2, said: "REACHING FOR A SHELF",
    pose: { hd: [0.02, -0.94], eR: [0.15, -0.98], hR: [0.18, -1.15], fL: [-0.07, -0.02], fR: [0.08, -0.03] },
    prop: [[0.14, -1.17], [0.14, -1.26], [0.25, -1.26], [0.25, -1.17], [0.18, -1.15]] },
  TROLLEY: { fam: 2, said: "PUSHING A TROLLEY",
    pose: { nk: [0.07, -0.8], hd: [0.12, -0.88], sL: [-0.03, -0.77], sR: [0.17, -0.77], kL: [-0.04, -0.26],
      fL: [-0.13, 0], kR: [0.08, -0.27], fR: [0.1, 0], eL: [0.14, -0.62], hL: [0.3, -0.62],
      eR: [0.26, -0.64], hR: [0.33, -0.62] },
    prop: [[0.37, -0.62], [0.42, -0.52], [0.78, -0.52], [0.72, -0.24], [0.44, -0.24], [0.42, -0.52],
      [0.44, -0.24], [0.47, -0.07], ...circ(0.47, -0.04, 0.03), [0.7, -0.07], ...circ(0.7, -0.04, 0.03),
      [0.72, -0.24], [0.42, -0.52], [0.33, -0.62]] },
};
const ACT_KEYS = Object.keys(ACTS);

// Touchpoints the room is built from. Generic words; no brands.
const FAMILIES = ["SCREEN", "HAND", "STREET"];
const TOUCH = [
  ["PUSH", "FEED", "INBOX", "APP", "STORY", "CART"],
  ["RECEIPT", "PACKAGE", "RADIO", "TILL", "LABEL", "COUPON"],
  ["POSTER", "BILLBOARD", "SHOPFRONT", "SHELTER", "SIGN", "BANNER"],
];

// ------------------------------------------------------------------ colour

const FLUO = [[255, 46, 136], [226, 255, 40], [255, 106, 26], [57, 255, 106], [40, 212, 255], [176, 80, 255]];
const PINK = 0;

const CLOTHS = [
  { name: "CALICO", base: [234, 226, 206], weave: [150, 132, 100], hole: [88, 74, 54], ink: [70, 60, 46], shadow: [90, 70, 40], dark: false },
  { name: "LINEN", base: [178, 174, 162], weave: [112, 108, 98], hole: [58, 54, 48], ink: [44, 42, 38], shadow: [40, 36, 30], dark: false },
  { name: "DENIM", base: [30, 42, 78], weave: [72, 92, 142], hole: [6, 10, 24], ink: [176, 188, 216], shadow: [4, 6, 16], dark: true },
  { name: "BLACK COTTON", base: [16, 15, 17], weave: [50, 48, 54], hole: [0, 0, 0], ink: [196, 194, 188], shadow: [0, 0, 0], dark: true },
];

function hash01(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const pad = (n, k) => String(n).padStart(k, "0");
const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const mixc = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];

function clockOf(hour) {
  const h = Math.floor(hour) % 24;
  const m = Math.floor((hour - Math.floor(hour)) * 60);
  return `${pad(h, 2)}:${pad(m, 2)}`;
}

// ------------------------------------------------------------------ state

let W, H, S, ctx;
let P, CLOTH, LAY, KEY;
let groundC, holesC, residueC, railC, dayC, glowC, payC, cardC, scratchC;
let rail, you;
let day = null;
let archive = [];
let unpick = null;
let T = 0;
let lastMs = 0;
let previewSent = false;

function layer() {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  return c;
}
const g2 = (c) => c.getContext("2d");

function setup() {
  pixelDensity(1);
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
  S = Math.min(W, H) / 1000;
  KEY = [m0, m1, m2, m3, m4].map((v) => v.toFixed(3)).join("|");
  const fam = [Math.max(0.08, 1 - 2 * m3), Math.max(0.08, 1 - Math.abs(2 * m3 - 1)), Math.max(0.08, 2 * m3 - 1)];
  const fs = fam[0] + fam[1] + fam[2];
  P = {
    people: Math.round(12 + 84 * Math.pow(m0, 1.25)),
    intimacy: 0.03 + 0.9 * m1,
    peak: 7 + 16 * m2,
    fam: fam.map((v) => v / fs),
    stitch: Math.min(4, Math.floor(m4 * 5)),
  };
  CLOTH = CLOTHS[Math.min(3, Math.floor(m2 * 4))];
  layout();

  groundC = layer();
  holesC = layer();
  residueC = layer();
  railC = layer();
  dayC = layer();
  glowC = layer();
  payC = layer();
  cardC = layer();
  scratchC = layer();
  paintGround();
  buildRail();

  archive = [];
  unpick = null;
  const T0 = CLOCK_LOCAL ? 1 + localFraction() : 1 + START_HOUR / 24;
  startDay(0);
  advanceTo(T0, true);
  lastMs = millis();
  previewSent = false;
}

function layout() {
  const margin = Math.round(Math.min(W, H) * 0.035);
  const tu = Math.max(1, Math.round(Math.min(W, H) / 520));
  const narrow = (W - margin * 2) / (6 * tu) < 64;
  const railY = Math.round(margin + tu * (narrow ? 42 : 22) + H * 0.085);
  const ringR = Math.max(6, 11 * S);
  const youY = Math.round(H - margin - tu * 4 - ringR * 2.4);
  LAY = {
    margin, tu, railY, ringR, youY,
    floorTop: railY + H * 0.25,
    floorBottom: youY - ringR * 3,
    figMin: Math.min(H, W * 1.1) * 0.11,
    figMax: Math.min(H, W * 1.1) * 0.22,
  };
}

function localFraction() {
  const now = new Date();
  return (now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600) / 24;
}

// ------------------------------------------------------------------ cloth

function paintGround() {
  const g = g2(groundC);
  const R = getRNG(`cloth|${m2}|${W}x${H}`);
  g.fillStyle = rgb(CLOTH.base);
  g.fillRect(0, 0, W, H);
  const n = Math.round((W * H) / 260);
  g.lineCap = "round";
  for (let i = 0; i < n; i++) {
    const x = R() * W, y = R() * H, len = 4 + R() * 34;
    const lighter = R() < 0.4;
    g.strokeStyle = rgba(lighter ? mixc(CLOTH.base, WHITE, 0.35) : CLOTH.weave, 0.035 + R() * 0.06);
    g.lineWidth = R() < 0.06 ? 1.8 : 0.8;
    g.beginPath();
    if (R() < 0.5) {
      g.moveTo(x, y);
      g.lineTo(x + (R() - 0.5) * 1.5, y + len);
    } else {
      g.moveTo(x, y);
      g.lineTo(x + len, y + (R() - 0.5) * 1.5);
    }
    g.stroke();
  }
  if (CLOTH.name === "DENIM") {
    g.strokeStyle = rgba(CLOTH.weave, 0.07);
    g.lineWidth = 1;
    g.beginPath();
    for (let x = -H; x < W; x += 3) {
      g.moveTo(x, H);
      g.lineTo(x + H * 0.6, 0);
    }
    g.stroke();
  }
  const grad = g.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.2, W / 2, H / 2, Math.max(W, H) * 0.75);
  grad.addColorStop(0, rgba(CLOTH.shadow, 0));
  grad.addColorStop(1, rgba(CLOTH.shadow, CLOTH.dark ? 0.45 : 0.16));
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
}

function drawHoles(g, pts, r, strength) {
  g.fillStyle = rgba(CLOTH.hole, (CLOTH.dark ? 0.8 : 0.32) * strength);
  g.beginPath();
  for (let i = 0; i < pts.length; i += 2) {
    g.moveTo(pts[i] + r, pts[i + 1]);
    g.arc(pts[i], pts[i + 1], r, 0, Math.PI * 2);
  }
  g.fill();
  // Disturbed fibres around each hole.
  g.strokeStyle = rgba(mixc(CLOTH.weave, WHITE, CLOTH.dark ? 0.15 : 0.4), (CLOTH.dark ? 0.24 : 0.14) * strength);
  g.lineWidth = Math.max(0.6, r * 0.5);
  g.beginPath();
  for (let i = 0; i < pts.length; i += 2) {
    g.moveTo(pts[i] + r * 1.9, pts[i + 1]);
    g.arc(pts[i], pts[i + 1], r * 1.9, 0, Math.PI * 2);
  }
  g.stroke();
}

// ------------------------------------------------------------------ thread
// A path is resampled every couple of pixels and carries its own normals,
// tack positions and fibre seed, so it can be laid down in any number of
// pieces and come out the same.

function chaikin(pts, iter) {
  for (let k = 0; k < iter; k++) {
    const out = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      out.push([ax * 0.75 + bx * 0.25, ay * 0.75 + by * 0.25], [ax * 0.25 + bx * 0.75, ay * 0.25 + by * 0.75]);
    }
    out.push(pts[pts.length - 1]);
    pts = out;
  }
  return pts;
}

function makePath(poly, spacing, amp, wav, seed, tackEvery) {
  const xs = [], ys = [];
  let acc = 0;
  xs.push(poly[0][0]);
  ys.push(poly[0][1]);
  for (let i = 1; i < poly.length; i++) {
    const [ax, ay] = poly[i - 1], [bx, by] = poly[i];
    const d = Math.hypot(bx - ax, by - ay);
    let t = spacing - acc;
    while (t <= d) {
      xs.push(ax + ((bx - ax) * t) / d);
      ys.push(ay + ((by - ay) * t) / d);
      t += spacing;
    }
    acc = d - (t - spacing);
  }
  const n = xs.length;
  const normals = (X, Y) => {
    const nx = new Float32Array(n), ny = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1);
      const dx = X[b] - X[a], dy = Y[b] - Y[a];
      const l = Math.hypot(dx, dy) || 1;
      nx[i] = -dy / l;
      ny[i] = dx / l;
    }
    return [nx, ny];
  };
  let [nx, ny] = normals(xs, ys);
  const p1 = hash01(seed) * 6.28, p2 = hash01(seed + 1) * 6.28;
  for (let i = 0; i < n; i++) {
    const s = i * spacing;
    const d = amp * (0.65 * Math.sin((s / wav) * 6.28 + p1) + 0.35 * Math.sin((s / (wav * 0.29)) * 6.28 + p2));
    xs[i] += nx[i] * d;
    ys[i] += ny[i] * d;
  }
  [nx, ny] = normals(xs, ys);
  const tacks = [];
  const step = Math.max(2, Math.round(tackEvery / spacing));
  for (let i = Math.floor(step / 2); i < n; i += step) tacks.push(i);
  return { xs, ys, nx, ny, n, tacks, seed, spacing };
}

function trace(g, P, i0, i1, off, twist, phase, dx, dy) {
  const { xs, ys, nx, ny } = P;
  g.beginPath();
  for (let i = i0; i <= i1; i++) {
    const o = off + (twist ? twist * Math.sin(i * 1.15 + phase) : 0);
    const x = xs[i] + nx[i] * o + dx, y = ys[i] + ny[i] * o + dy;
    if (i === i0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
}

// Lay a stretch of cotton cord: shadow, body, two twisting plies, the couching
// tacks that hold it down, and a few loose fibres.
function lay(g, P, i0, i1, col, w, glowG, alpha = 1) {
  i0 = Math.max(0, i0);
  i1 = Math.min(P.n - 1, i1);
  if (i1 <= i0) return;
  g.lineCap = "round";
  g.lineJoin = "round";
  if (glowG) {
    const op = glowG.globalCompositeOperation;
    glowG.globalCompositeOperation = "lighter";
    glowG.lineCap = glowG.lineJoin = "round";
    glowG.strokeStyle = rgba(col, 0.04 * alpha);
    glowG.lineWidth = w * 7;
    trace(glowG, P, i0, i1, 0, 0, 0, 0, 0);
    glowG.stroke();
    glowG.strokeStyle = rgba(col, 0.08 * alpha);
    glowG.lineWidth = w * 2.6;
    glowG.stroke();
    glowG.globalCompositeOperation = op;
  }
  g.strokeStyle = rgba(CLOTH.shadow, (CLOTH.dark ? 0.6 : 0.3) * alpha);
  g.lineWidth = w * 1.15;
  trace(g, P, i0, i1, 0, 0, 0, w * 0.35, w * 0.55);
  g.stroke();
  g.strokeStyle = rgba(mixc(col, BLACK, 0.2), alpha);
  g.lineWidth = w;
  trace(g, P, i0, i1, 0, 0, 0, 0, 0);
  g.stroke();
  for (let s = 0; s < 2; s++) {
    g.strokeStyle = rgba(mixc(col, WHITE, s ? 0.42 : 0.1), alpha);
    g.lineWidth = w * (s ? 0.28 : 0.42);
    trace(g, P, i0, i1, 0, w * 0.24, s * Math.PI, 0, 0);
    g.stroke();
  }
  // Couching tacks: a finer thread crossing the cord.
  g.strokeStyle = rgba(mixc(col, BLACK, 0.5), 0.8 * alpha);
  g.lineWidth = Math.max(0.5, w * 0.24);
  g.beginPath();
  const { xs, ys, nx, ny } = P;
  for (const i of P.tacks) {
    if (i < i0 || i > i1) continue;
    const e = w * 0.85;
    g.moveTo(xs[i] - nx[i] * e - ny[i] * w * 0.25, ys[i] - ny[i] * e + nx[i] * w * 0.25);
    g.lineTo(xs[i] + nx[i] * e + ny[i] * w * 0.25, ys[i] + ny[i] * e - nx[i] * w * 0.25);
  }
  g.stroke();
  g.strokeStyle = rgba(mixc(col, WHITE, 0.55), 0.45 * alpha);
  g.lineWidth = 0.6;
  g.beginPath();
  for (let i = i0; i <= i1; i++) {
    const h = hash01(P.seed * 0.37 + i * 1.71);
    if (h > 0.07) continue;
    const side = h < 0.035 ? 1 : -1;
    const len = w * (1.2 + h * 30);
    const bx = xs[i] + nx[i] * side * w * 0.4, by = ys[i] + ny[i] * side * w * 0.4;
    g.moveTo(bx, by);
    g.quadraticCurveTo(bx + nx[i] * side * len * 0.6 + ny[i] * len * 0.4, by + ny[i] * side * len * 0.6 - nx[i] * len * 0.4,
      bx + nx[i] * side * len + ny[i] * len * 0.1, by + ny[i] * side * len - nx[i] * len * 0.1);
  }
  g.stroke();
}

function tackHoles(P, upto, w, out) {
  const { xs, ys, nx, ny } = P;
  for (const i of P.tacks) {
    if (i > upto) break;
    const e = w * 0.95;
    out.push(xs[i] - nx[i] * e, ys[i] - ny[i] * e, xs[i] + nx[i] * e, ys[i] + ny[i] * e);
  }
  return out;
}

// Stitches for type: thinner, two plies, drawn one by one.
function drawStitch(g, op, col, w, alpha = 1) {
  g.lineCap = "round";
  if (op.a) {
    const [x1, y1, x2, y2] = op.a;
    g.strokeStyle = rgba(CLOTH.shadow, 0.35 * alpha);
    g.lineWidth = w * 1.2;
    g.beginPath();
    g.moveTo(x1 + w * 0.3, y1 + w * 0.5);
    g.lineTo(x2 + w * 0.3, y2 + w * 0.5);
    g.stroke();
    g.strokeStyle = rgba(mixc(col, BLACK, 0.15), alpha);
    g.lineWidth = w;
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.stroke();
    g.strokeStyle = rgba(mixc(col, WHITE, 0.4), alpha);
    g.lineWidth = w * 0.35;
    const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1;
    const ox = (-dy / l) * w * 0.18, oy = (dx / l) * w * 0.18;
    g.beginPath();
    g.moveTo(x1 + ox, y1 + oy);
    g.lineTo(x2 + ox, y2 + oy);
    g.stroke();
  } else {
    const [x, y, r] = op.k;
    g.fillStyle = rgba(CLOTH.shadow, 0.35 * alpha);
    g.beginPath();
    g.arc(x + r * 0.2, y + r * 0.3, r * 1.05, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = rgba(mixc(col, BLACK, 0.15), alpha);
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = rgba(mixc(col, WHITE, 0.4), alpha);
    g.lineWidth = Math.max(0.5, r * 0.3);
    g.beginPath();
    g.arc(x, y, r * 0.55, 0.4, 0.4 + Math.PI * 1.5);
    g.stroke();
  }
}

// ------------------------------------------------------------------ the room
// Touchpoints along the top, and YOU at the bottom, are the architecture.
// They are never unpicked.

function buildRail() {
  const R = getRNG(`rail|${m3}|${W}`);
  const K = Math.max(4, Math.min(7, Math.floor(W / 170)));
  const counts = P.fam.map((f) => Math.max(1, Math.round(f * (K - 3)) + (f > 0.2 ? 1 : 0)));
  while (counts.reduce((a, b) => a + b) > K) counts[counts.indexOf(Math.max(...counts))]--;
  while (counts.reduce((a, b) => a + b) < K) counts[P.fam.indexOf(Math.max(...P.fam))]++;
  const items = [];
  counts.forEach((c, f) => {
    const pool = TOUCH[f].slice();
    for (let i = 0; i < c; i++) items.push({ fam: f, word: pool.splice(Math.floor(R() * pool.length), 1)[0] });
  });
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(R() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  const { margin, railY, ringR } = LAY;
  const span = W - margin * 2;
  const u = Math.max(1.4, 2.3 * S);
  const g = g2(railC);
  const holes = [];
  rail = items.map((it, i) => {
    const x = margin + span * ((i + 0.5) / items.length);
    const col = FLUO[[2, 4, 5][it.fam]];
    const ops = [];
    const tw = it.word.length * 6 * u - u;
    stitchText(it.word, x - tw / 2, railY - ringR - 11 * u, u, P.stitch, ops);
    for (const op of ops) drawStitch(g, op, col, Math.max(0.8, u * 0.32));
    const ring = makePath(circ(x, railY, ringR, 1.15, 28), 1.6, ringR * 0.04, ringR * 2, i * 13.7 + 5, 7);
    lay(g, ring, 0, ring.n - 1, col, Math.max(1.1, 2.2 * S), null);
    tackHoles(ring, ring.n, 2 * S, holes);
    return { ...it, x, y: railY, col, count: 0 };
  });
  const yu = Math.max(2, 3.4 * S);
  const ops = [];
  const tw = 3 * 6 * yu - yu;
  stitchText("YOU", W / 2 - tw / 2, LAY.youY + ringR * 1.5, yu, P.stitch, ops);
  for (const op of ops) drawStitch(g, op, FLUO[PINK], Math.max(0.9, yu * 0.32));
  const ring = makePath(circ(W / 2, LAY.youY, ringR, 1.15, 28), 1.6, ringR * 0.04, ringR * 2, 99, 7);
  lay(g, ring, 0, ring.n - 1, FLUO[PINK], Math.max(1.1, 2.2 * S), null);
  you = { word: "YOU", x: W / 2, y: LAY.youY, col: FLUO[PINK], count: 0, fam: -1 };
}

// ------------------------------------------------------------------ a day

function startDay(index) {
  day = { index, figs: genPeople(index), held: null, taps: 0, snaps: 0, card: null, cardT: 0, cardDrawn: 0, settled: 0, payDirty: false };
  for (const c of [dayC, glowC, payC, cardC]) g2(c).clearRect(0, 0, W, H);
}

function gauss(R) {
  return (R() + R() + R() - 1.5) * 1.6;
}

function genPeople(index) {
  const R0 = getRNG(`people|${m0}|${index}`);
  const R1 = getRNG(`you|${m1}|${index}`);
  const R2 = getRNG(`rhythm|${m2}|${index}`);
  const R3 = getRNG(`touch|${m3}|${index}`);
  const n = Math.round(P.people * (0.85 + R0() * 0.3));
  const { margin, floorTop, floorBottom, figMin, figMax } = LAY;
  const placed = [];
  const figs = [];
  for (let i = 0; i < n; i++) {
    let hour = R2() < 0.3 ? 6 + R2() * 18 : P.peak + gauss(R2) * 2.6;
    while (hour < 6) hour += 18;
    while (hour >= 24) hour -= 18;

    let r = R3(), fam = 0;
    while (fam < 2 && r > P.fam[fam]) r -= P.fam[fam++];
    const famActs = ACT_KEYS.filter((k) => ACTS[k].fam === fam);
    const act = famActs[Math.floor(R3() * famActs.length)];
    const fail = 0.5 + 0.47 * Math.pow(R3(), 0.55);
    const intimate = R1() < P.intimacy;

    // Best of a few candidates, so the crowd spreads over the floor.
    let best = null, bestD = -1;
    for (let k = 0; k < 7; k++) {
      const x = margin * 2 + R0() * (W - margin * 4), d = R0();
      let dmin = 1e9;
      for (const p of placed) dmin = Math.min(dmin, Math.hypot((x - p[0]) / W, (d - p[1]) * 0.6));
      if (dmin > bestD) {
        bestD = dmin;
        best = [x, d];
      }
    }
    placed.push(best);
    const depth = best[1];
    const color = intimate ? PINK : Math.floor(R0() * FLUO.length);
    const seed = R0() * 1e4;
    let target;
    if (intimate) target = you;
    else {
      const options = rail.filter((t) => t.fam === fam);
      const pool = options.length ? options : rail;
      target = pool[Math.floor(R3() * pool.length)];
    }
    figs.push({
      i, hour, act, fam, intimate, color, seed, target, fail,
      x: best[0], yg: floorTop + depth * (floorBottom - floorTop),
      h: figMin + depth * (figMax - figMin),
      ta: index + hour / 24, drawn: -1, snapped: 0, pushes: 0,
    });
  }
  figs.sort((a, b) => a.ta - b.ta);
  for (const f of figs) buildFigure(f);
  return figs;
}

function buildFigure(f) {
  const A = ACTS[f.act];
  const J = getRNG(`pose|${f.seed}`);
  const p = {};
  for (const k in BASE) {
    const v = A.pose[k] || BASE[k];
    p[k] = Array.isArray(v) ? [v[0] + (J() - 0.5) * 0.03, v[1] + (J() - 0.5) * 0.02] : v;
  }
  const hipL = [p.pv[0] - 0.055, p.pv[1]], hipR = [p.pv[0] + 0.055, p.pv[1]];
  const o = (a) => [a[0] + 0.014, a[1] - 0.004];
  const head = [];
  for (let i = 0; i <= 30; i++) {
    const a = Math.PI / 2 + (i / 25) * Math.PI * 2;
    const rr = p.r * (1 + 0.07 * Math.sin(a * 3 + f.seed));
    head.push([p.hd[0] + Math.cos(a) * rr * 0.84, p.hd[1] + Math.sin(a) * rr]);
  }
  const seq = [
    p.fL, p.kL, hipL, hipR, p.kR, p.fR, o(p.fR), o(p.kR), o(hipR),
    p.sR, p.eR, p.hR, ...A.prop, o(p.eR), o(p.sR),
    p.nk, ...head, o(p.nk),
    p.sL, p.eL, p.hL, o(p.eL), o(p.sL), o(hipL),
  ];
  // Face the touchpoint the thread will run to.
  f.flip = f.target === you ? hash01(f.seed) < 0.5 : f.target.x < f.x;
  const sx = f.flip ? -1 : 1;
  const px = (q) => [f.x + sx * q[0] * f.h, f.yg + q[1] * f.h];
  const poly = chaikin(seq.map(px), 2);
  f.w = Math.max(1.2, Math.min(3.8, f.h * 0.015));
  f.path = makePath(poly, 2.2, f.h * 0.006, f.h * 0.4, f.seed, f.w * 4.2);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (let i = 0; i < f.path.n; i++) {
    x0 = Math.min(x0, f.path.xs[i]);
    x1 = Math.max(x1, f.path.xs[i]);
    y0 = Math.min(y0, f.path.ys[i]);
    y1 = Math.max(y1, f.path.ys[i]);
  }
  f.box = [x0, y0, x1, y1];
  f.hand = px(p.hR);
  f.head = px(p.hd);

  // The transaction: a sagging thread from the hand to the touchpoint's ring.
  const tx = f.target.x, ty = f.target.y + (f.target === you ? -LAY.ringR : LAY.ringR);
  const dist = Math.hypot(tx - f.hand[0], ty - f.hand[1]);
  const sag = 0.16 * dist + 12 * S;
  const cx = (f.hand[0] + tx) / 2, cy = (f.hand[1] + ty) / 2 + sag;
  const bez = [];
  const m = Math.max(12, Math.ceil(dist / 10));
  for (let i = 0; i <= m; i++) {
    const t = i / m;
    bez.push([(1 - t) ** 2 * f.hand[0] + 2 * (1 - t) * t * cx + t * t * tx, (1 - t) ** 2 * f.hand[1] + 2 * (1 - t) * t * cy + t * t * ty]);
  }
  f.pay = makePath(bez, 3, Math.min(6, dist * 0.008), dist * 0.3, f.seed + 7, f.w * 5);
  f.payW = f.w * 0.75;
  // Never closer than a few stitches.
  f.fail = Math.min(f.fail, 1 - (f.w * 6) / Math.max(1, dist));
}

const figStart = (f) => f.ta;
const payStart = (f) => f.ta + FIG_S / DAY_REAL;
function payProgress(f, t) {
  return f.fail * easeInOut(clamp01(((t - payStart(f)) * DAY_REAL) / PAY_S));
}
const gapPx = (f) => (1 - f.fail) * f.pay.n * f.pay.spacing;
const stitchesShort = (f) => Math.max(1, Math.round(gapPx(f) / (f.w * 5)));

// Couch everyone in up to time t onto the day layer.
function stitchDayTo(t) {
  const g = g2(dayC), gg = CLOTH.dark ? g2(glowC) : null;
  for (const f of day.figs) {
    if (f.ta > t) break;
    const prog = clamp01(((t - figStart(f)) * DAY_REAL) / FIG_S);
    const upto = Math.floor(prog * (f.path.n - 1));
    if (upto > f.drawn) {
      lay(g, f.path, Math.max(0, f.drawn), upto, FLUO[f.color], f.w, gg);
      f.drawn = upto;
    }
  }
  if (day.card) {
    const c = day.card;
    const k = Math.floor(clamp01(((t - day.cardT) * DAY_REAL) / CARD_S) * c.ops.length);
    const cg = g2(cardC);
    for (let i = day.cardDrawn; i < k; i++) drawStitch(cg, c.ops[i], c.ops[i].col, c.ops[i].w);
    day.cardDrawn = Math.max(day.cardDrawn, k);
  }
}

function advanceTo(Tn, instant) {
  while (Math.floor(Tn) > day.index) {
    const end = day.index + 1 - 1e-7;
    if (!day.card) composeCard(day.index + LOG_HOUR / 24);
    stitchDayTo(end);
    endDay(instant, end);
    startDay(day.index + 1);
  }
  const hour = (Tn - day.index) * 24;
  if (hour >= LOG_HOUR && !day.card) composeCard(day.index + LOG_HOUR / 24);
  stitchDayTo(Tn);
  T = Tn;
}

const payEnd = (f) => payStart(f) + PAY_S / DAY_REAL;

// The transaction thread. Threads still running are drawn live; settled ones
// are kept on their own layer, which is redrawn whenever a push changes one.
function drawPayLine(g, f, t, glow, alpha = 1) {
  if (t < payStart(f)) return;
  const k = Math.max(1, Math.floor(payProgress(f, t) * (f.pay.n - 1)));
  lay(g, f.pay, 0, k, FLUO[f.color], f.payW, glow ? g : null, alpha);
}

function settlePay(t) {
  let n = 0;
  while (n < day.figs.length && t >= payEnd(day.figs[n])) n++;
  const g = g2(payC);
  if (day.payDirty) {
    g.clearRect(0, 0, W, H);
    day.settled = 0;
    day.payDirty = false;
  }
  for (let i = day.settled; i < n; i++) drawPayLine(g, day.figs[i], t, CLOTH.dark);
  day.settled = Math.max(day.settled, n);
}

// The loose end hangs, sways a little, and frays.
function drawTail(g, f, t, glow, alpha = 1) {
  if (t < payStart(f)) return;
  const prog = payProgress(f, t);
  const P = f.pay;
  const k = Math.max(1, Math.floor(prog * (P.n - 1)));
  const col = FLUO[f.color];
  const ex = P.xs[k], ey = P.ys[k];
  const len = (10 + (1 - prog) * 26 + f.snapped * 18) * S * 2;
  const sway = Math.sin(t * DAY_REAL * 0.8 + f.seed) * 0.35;
  const tail = [[ex, ey]];
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    const u = i / steps;
    tail.push([ex + Math.sin(u * 2.4 + f.seed) * len * 0.18 + sway * u * u * len * 0.4, ey + u * len]);
  }
  const TP = makePath(tail, 2, 0, 50, f.seed + 3, 1e9);
  lay(g, TP, 0, TP.n - 1, col, f.payW * 0.9, glow ? g : null, alpha);
  const tx = TP.xs[TP.n - 1], ty = TP.ys[TP.n - 1];
  g.strokeStyle = rgba(mixc(col, WHITE, 0.3), 0.85 * alpha);
  g.lineWidth = Math.max(0.5, f.payW * 0.3);
  g.beginPath();
  for (let s = -1; s <= 1; s++) {
    g.moveTo(tx, ty);
    g.quadraticCurveTo(tx + s * f.payW * 1.5, ty + f.payW * 2, tx + s * f.payW * 3 + sway * 3, ty + f.payW * 4.5);
  }
  g.stroke();
}

// ------------------------------------------------------------------ the push
// Written at 23:00 from counts alone. Original, generic copy.

const HEADLINES = [
  (o) => `ALMOST YOURS. ${o.n} TIMES.`,
  (o) => `${o.n} REACHED. NONE ARRIVED.`,
  () => `STILL IN THE BASKET.`,
  (o) => `WE SAW YOU AT ${o.busy}.`,
  (o) => `${o.bestPct}% THERE. FOR GOOD.`,
  () => `TODAY EXPIRES AT MIDNIGHT.`,
  () => `NOTHING CHECKED OUT.`,
  () => `LOW MEMORY. ACT NOW.`,
  () => `THE THREAD RAN OUT FIRST.`,
  (o) => (o.you ? `YOU WERE NEARLY HERE.` : `NOBODY ASKED FOR YOU.`),
];

const ENDINGS = [
  "BY MORNING ONLY THE NEEDLE HOLES WILL REMAIN.",
  "THE STITCHES COME OUT AT MIDNIGHT. THE HOLES DO NOT.",
  "AFTER MIDNIGHT THE CLOTH KEEPS ONLY WHERE THE NEEDLE WENT.",
  "WHAT IS NOT PUSHED TONIGHT WILL NOT BE HERE TOMORROW.",
];

const CTAS = ["TAP TO KEEP ONE", "REMIND ME TOMORROW", "TURN ON NOTIFICATIONS TO REMEMBER", "SAVE 1 AFTERIMAGE", "HOLD BEFORE MIDNIGHT"];

function observe() {
  const figs = day.figs.filter((f) => f.hour < LOG_HOUR);
  const byHour = new Array(24).fill(0);
  const byAct = {};
  const byTarget = {};
  for (const f of figs) {
    byHour[Math.floor(f.hour)]++;
    byAct[f.act] = (byAct[f.act] || 0) + 1;
    byTarget[f.target.word] = (byTarget[f.target.word] || 0) + 1;
  }
  let busy = 7, quiet = 7;
  for (let h = 7; h < 23; h++) {
    if (byHour[h] > byHour[busy]) busy = h;
    if (byHour[h] < byHour[quiet]) quiet = h;
  }
  const live = figs.filter((f) => !f.snapped);
  const best = (live.length ? live : figs).reduce((a, b) => (b.fail > a.fail ? b : a), figs[0]);
  const topAct = Object.keys(byAct).sort((a, b) => byAct[b] - byAct[a])[0];
  const topTarget = Object.keys(byTarget).sort((a, b) => byTarget[b] - byTarget[a])[0];
  return {
    figs, n: figs.length, you: figs.filter((f) => f.intimate).length,
    busy: `${pad(busy, 2)}:00`, quiet: `${pad(quiet, 2)}:00`, quietCount: byHour[quiet],
    best, bestPct: best ? Math.floor(best.fail * 100) : 0,
    topAct, topActN: topAct ? byAct[topAct] : 0, topTarget,
    taps: day.taps, snaps: day.snaps,
  };
}

function composeCard(tCard) {
  const o = observe();
  const R = getRNG(`copy|${m3}|${day.index}`);
  const pick = (a) => a[Math.floor(R() * a.length)];
  const kept = day.held || o.best;
  const by = day.held ? "YOU" : "THE SYSTEM";
  let head, body, cta;
  if (!o.n) {
    head = "NOBODY CAME TODAY.";
    body = `THE ROOM WAS OPEN FROM 06:00. EVERY TOUCHPOINT WAITED. ${pick(ENDINGS)}`;
    cta = pick(CTAS);
  } else {
    head = pick(HEADLINES)(o);
    const lines = [];
    lines.push(`${o.n} ${o.n === 1 ? "PERSON" : "PEOPLE"} CAME THROUGH. ${o.topActN} WERE ${ACTS[o.topAct].said}.`);
    const pool = [
      `THE BUSIEST HOUR WAS ${o.busy}. THE QUIETEST WAS ${o.quiet}.`,
      o.you ? `${o.you} ${o.you === 1 ? "THREAD" : "THREADS"} RAN TOWARDS YOU. NONE OF THEM ARRIVED.` : `NOBODY RAN A THREAD TOWARDS YOU.`,
      `${o.topTarget} WAS ASKED FOR MOST.`,
    ];
    if (o.taps) pool.push(`YOU PUSHED ${o.taps} ${o.taps === 1 ? "TIME" : "TIMES"}. EACH PUSH HALVED THE DISTANCE.${o.snaps ? ` ${o.snaps} SNAPPED.` : ""}`);
    lines.push(o.taps ? pool[pool.length - 1] : pick(pool));
    if (o.best) lines.push(`THE CLOSEST, ${ACTS[o.best.act].said} AT ${clockOf(o.best.hour)}, STOPPED ${stitchesShort(o.best)} ${stitchesShort(o.best) === 1 ? "STITCH" : "STITCHES"} SHORT OF ${o.best.target.word}.`);
    lines.push(pick(ENDINGS));
    body = lines.join(" ");
    cta = pick(CTAS);
  }
  const keptLine = kept ? `KEPT: ${kept.act} ${clockOf(kept.hour)}. CHOSEN BY ${by}.` : "KEPT: NOTHING.";
  day.card = layoutCard(head, body, cta, keptLine);
  day.card.kept = kept;
  day.card.by = by;
  day.cardT = tCard;
  day.cardDrawn = 0;
}

function layoutCard(head, body, cta, keptLine) {
  const patch = CLOTH.dark ? CLOTHS[0] : CLOTHS[3];
  const cols = patch.dark ? [FLUO[0], FLUO[1], FLUO[3]] : [FLUO[0], FLUO[5], FLUO[2]];
  let u = Math.max(1.6, 2.9 * S);
  let L;
  for (let tries = 0; tries < 6; tries++) {
    const uH = u * 1.7, padd = u * 8;
    const cw = Math.min(W - LAY.margin * 2, W * 0.72, 46 * 6 * u + padd * 2);
    const inner = cw - padd * 2;
    const hl = wrapText(head, Math.max(4, Math.floor(inner / (6 * uH))));
    const bl = wrapText(body, Math.max(8, Math.floor(inner / (6 * u))));
    const cl = wrapText(cta, Math.max(8, Math.floor((inner - 4 * u) / (6 * u))));
    const lu = LAY.tu;
    const ch = padd + 9 * lu + 4 * u + hl.length * 9 * uH + 3 * u + bl.length * 9 * u + 5 * u + cl.length * 9 * u + 6 * u + 6 * u + 9 * lu + padd;
    L = { u, uH, padd, cw, hl, bl, cl, ch };
    if (ch < H * 0.56) break;
    u *= 0.86;
  }
  const { uH, padd, cw, hl, bl, cl, ch } = L;
  const cx = Math.round((W - cw) / 2);
  const cy = Math.round(Math.min(LAY.railY + LAY.ringR * 3 + H * 0.06, H - ch - LAY.margin * 3));
  const ops = [];
  const add = (from, col, w) => {
    for (let i = from; i < ops.length; i++) {
      ops[i].col = col;
      ops[i].w = w;
    }
  };
  let y = cy + padd + 9 * LAY.tu + 4 * u;
  for (const line of hl) {
    const n = ops.length;
    stitchText(line, cx + padd, y, uH, P.stitch, ops);
    add(n, cols[0], Math.max(0.9, uH * 0.3));
    y += 9 * uH;
  }
  y += 3 * u;
  for (const line of bl) {
    const n = ops.length;
    stitchText(line, cx + padd, y, u, P.stitch, ops);
    add(n, cols[1], Math.max(0.8, u * 0.3));
    y += 9 * u;
  }
  y += 5 * u;
  const bw = Math.max(...cl.map((s) => s.length)) * 6 * u + 5 * u;
  const by0 = y - 3 * u;
  for (const line of cl) {
    const n = ops.length;
    stitchText(line, cx + padd + 3 * u, y, u, P.stitch, ops);
    add(n, cols[2], Math.max(0.8, u * 0.3));
    y += 9 * u;
  }
  // The button: a running-stitch outline.
  const bh = y - by0 + u;
  const n0 = ops.length;
  const dash = u * 1.6;
  const perim = [[cx + padd, by0], [cx + padd + bw, by0], [cx + padd + bw, by0 + bh], [cx + padd, by0 + bh], [cx + padd, by0]];
  for (let i = 0; i < 4; i++) {
    const [ax, ay] = perim[i], [bx, bby] = perim[i + 1];
    const d = Math.hypot(bx - ax, bby - ay);
    for (let s = 0; s + dash < d; s += dash * 2) {
      ops.push({ a: [ax + ((bx - ax) * s) / d, ay + ((bby - ay) * s) / d, ax + ((bx - ax) * (s + dash)) / d, ay + ((bby - ay) * (s + dash)) / d] });
    }
  }
  add(n0, cols[2], Math.max(0.8, u * 0.3));

  // The patch is appliquéd straight away; the type is stitched over time.
  const g = g2(cardC);
  g.clearRect(0, 0, W, H);
  const R = getRNG(`patch|${m2}|${day.index}`);
  const edge = [];
  const corners = [[cx, cy], [cx + cw, cy], [cx + cw, cy + ch], [cx, cy + ch]];
  for (let i = 0; i < 4; i++) {
    const [ax, ay] = corners[i], [bx, bby] = corners[(i + 1) % 4];
    for (let s = 0; s < 12; s++) edge.push([ax + ((bx - ax) * s) / 12 + (R() - 0.5) * 2.5 * S, ay + ((bby - ay) * s) / 12 + (R() - 0.5) * 2.5 * S]);
  }
  g.fillStyle = rgba(CLOTH.shadow, CLOTH.dark ? 0.5 : 0.22);
  g.beginPath();
  edge.forEach(([x, yy], i) => (i ? g.lineTo(x + 4 * S, yy + 6 * S) : g.moveTo(x + 4 * S, yy + 6 * S)));
  g.fill();
  g.fillStyle = rgb(patch.base);
  g.beginPath();
  edge.forEach(([x, yy], i) => (i ? g.lineTo(x, yy) : g.moveTo(x, yy)));
  g.fill();
  g.save();
  g.clip();
  g.lineWidth = 0.8;
  for (let i = 0; i < (cw * ch) / 200; i++) {
    const x = cx + R() * cw, yy = cy + R() * ch, len = 4 + R() * 24;
    g.strokeStyle = rgba(patch.weave, 0.05 + R() * 0.06);
    g.beginPath();
    g.moveTo(x, yy);
    if (R() < 0.5) g.lineTo(x + len, yy);
    else g.lineTo(x, yy + len);
    g.stroke();
  }
  g.restore();
  // Blanket stitch around the edge, in the cloth's own ink.
  const border = makePath([...edge, edge[0]].map(([x, yy]) => [x + (x < cx + cw / 2 ? 1 : -1) * u * 2, yy + (yy < cy + ch / 2 ? 1 : -1) * u * 2]), 2, 0.4, 60, day.index + 0.5, 1e9);
  g.strokeStyle = rgba(mixc(patch.ink, patch.base, 0.25), 0.8);
  g.lineWidth = Math.max(0.6, u * 0.22);
  g.setLineDash([u * 1.4, u * 1.2]);
  trace(g, border, 0, border.n - 1, 0, 0, 0, 0, 0);
  g.stroke();
  g.setLineDash([]);
  const lu = LAY.tu;
  const ink = rgba(mixc(patch.ink, patch.base, 0.1), 0.9);
  setText(g, "LOOSE THREAD", cx + padd, cy + padd, lu, ink);
  const now = `DAY ${pad(day.index + 1, 3)} · 23:00`;
  setText(g, now, cx + cw - padd - now.length * 6 * lu, cy + padd, lu, rgba(mixc(patch.ink, patch.base, 0.4), 0.9));
  setText(g, keptLine, cx + padd, cy + ch - padd - 7 * lu, lu, rgba(mixc(patch.ink, patch.base, 0.3), 0.9));

  return { head, body, cta, ops, x: cx, y: cy, w: cw, h: ch };
}

// ------------------------------------------------------------------ midnight

function endDay(instant, tEnd) {
  const holes = [];
  for (const f of day.figs) {
    if (f.drawn < 0) continue;
    tackHoles(f.path, f.drawn, f.w, holes);
    if (tEnd >= payStart(f)) tackHoles(f.pay, Math.floor(payProgress(f, tEnd) * (f.pay.n - 1)), f.payW, holes);
  }

  if (!instant) {
    const snap = layer();
    const sg = g2(snap);
    if (CLOTH.dark) {
      sg.globalCompositeOperation = "lighter";
      sg.drawImage(glowC, 0, 0);
      sg.globalCompositeOperation = "source-over";
    }
    sg.drawImage(dayC, 0, 0);
    sg.drawImage(payC, 0, 0);
    for (let i = 0; i < day.figs.length; i++) {
      const f = day.figs[i];
      if (i >= day.settled) drawPayLine(sg, f, tEnd, CLOTH.dark);
      drawTail(sg, f, tEnd, CLOTH.dark);
    }
    sg.drawImage(cardC, 0, 0);
    unpick = { t0: millis(), img: snap };
  }

  // What was here leaks.
  const fade = (c, keep) => {
    const sg = g2(scratchC);
    sg.clearRect(0, 0, W, H);
    sg.drawImage(c, 0, 0);
    const g = g2(c);
    g.clearRect(0, 0, W, H);
    g.globalAlpha = keep;
    g.drawImage(scratchC, 0, 0);
    g.globalAlpha = 1;
  };
  fade(holesC, RETAIN_HOLES);
  fade(residueC, RETAIN_RESIDUE);

  const hg = g2(holesC);
  drawHoles(hg, holes, Math.max(0.5, 0.75 * S), 0.5);

  // The headline survives only as the holes it would leave, set large.
  if (day.card) {
    const lines = wrapText(day.card.head, 12);
    const cols = Math.max(...lines.map((l) => l.length));
    const u = Math.min((W * 0.9) / (cols * 6), (H * 0.4) / (lines.length * 9));
    const big = [];
    lines.forEach((line, i) => {
      const x = (W - line.length * 6 * u) / 2;
      stitchText(line, x, H * 0.56 - (lines.length * 9 * u) / 2 + i * 9 * u, u, P.stitch, big);
    });
    drawHoles(hg, holesOf(big, []), Math.max(1, u * 0.07), 1);
  }

  // The one kept figure goes into the residue.
  const kept = day.card && day.card.kept;
  if (kept) {
    const sg = g2(scratchC);
    sg.clearRect(0, 0, W, H);
    lay(sg, kept.path, 0, kept.path.n - 1, FLUO[kept.color], kept.w, null);
    const k = Math.max(1, Math.floor(payProgress(kept, Math.max(tEnd, payStart(kept) + PAY_S / DAY_REAL)) * (kept.pay.n - 1)));
    lay(sg, kept.pay, 0, k, FLUO[kept.color], kept.payW, null);
    const g = g2(residueC);
    g.globalAlpha = 0.6;
    g.drawImage(scratchC, 0, 0);
    g.globalAlpha = 1;
  }

  if (day.card) {
    archive.unshift({ index: day.index, head: day.card.head, cta: day.card.cta, by: day.card.by });
    archive = archive.slice(0, ARCHIVE_MAX);
  }
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
  let Tn = T + dt / DAY_SECONDS;
  if (CLOCK_LOCAL) {
    const frac = localFraction();
    Tn = Math.floor(T) + frac + (frac + 0.5 < T % 1 ? 1 : 0);
  }
  advanceTo(Tn, false);
  render(now);
  if (!previewSent) {
    previewSent = true;
    triggerPreview();
  }
}

function render(now) {
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.drawImage(groundC, 0, 0);
  ctx.drawImage(holesC, 0, 0);
  ctx.drawImage(residueC, 0, 0);
  ctx.drawImage(railC, 0, 0);
  if (unpick) {
    const e = (now - unpick.t0) / PURGE_MS;
    if (e >= 1) unpick = null;
    else {
      ctx.globalAlpha = 1 - easeOut(e);
      ctx.drawImage(unpick.img, 0, -e * e * H * 0.02);
      ctx.globalAlpha = 1;
    }
  }
  if (CLOTH.dark) {
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(glowC, 0, 0);
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.drawImage(dayC, 0, 0);
  settlePay(T);
  ctx.drawImage(payC, 0, 0);
  for (let i = 0; i < day.figs.length; i++) {
    const f = day.figs[i];
    if (f.ta > T) break;
    if (i >= day.settled) drawPayLine(ctx, f, T, CLOTH.dark);
    drawTail(ctx, f, T, CLOTH.dark);
  }
  const hour = (T - day.index) * 24;
  const kept = day.held || (day.card && day.card.kept);
  if (kept) needle(kept);
  if (day.card) ctx.drawImage(cardC, 0, 0);
  const hov = hit(mouseX, mouseY);
  if (hov) {
    const pct = Math.floor(payProgress(hov, T) * 100);
    label(`${hov.act} · ${clockOf(hov.hour)} · ${pct}% TO ${hov.target.word}`, mouseX, mouseY);
  }
  header(hour);
}

// A needle left in the pushed figure.
function needle(f) {
  const [hx, hy] = f.head;
  const L = f.h * 0.34;
  const a = -Math.PI / 3 + (f.flip ? -0.5 : 0.5);
  const x0 = hx + Math.cos(a) * f.h * 0.03, y0 = hy + Math.sin(a) * f.h * 0.03;
  const x1 = x0 + Math.cos(a) * L, y1 = y0 + Math.sin(a) * L;
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(CLOTH.shadow, 0.45);
  ctx.lineWidth = Math.max(1, f.w * 0.7);
  ctx.beginPath();
  ctx.moveTo(x0 + 2, y0 + 3);
  ctx.lineTo(x1 + 2, y1 + 3);
  ctx.stroke();
  ctx.strokeStyle = "rgb(214,218,224)";
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.strokeStyle = "rgb(120,124,132)";
  ctx.lineWidth = Math.max(0.6, f.w * 0.3);
  ctx.beginPath();
  ctx.ellipse(x1 - Math.cos(a) * L * 0.07, y1 - Math.sin(a) * L * 0.07, L * 0.045, f.w * 0.5, a, 0, Math.PI * 2);
  ctx.stroke();
}

function hit(x, y) {
  if (!day) return null;
  for (let i = day.figs.length - 1; i >= 0; i--) {
    const f = day.figs[i];
    if (f.ta > T || f.drawn < f.path.n * 0.3) continue;
    const [x0, y0, x1, y1] = f.box;
    if (x >= x0 - 4 && x <= x1 + 4 && y >= y0 - 4 && y <= y1 + 4) return f;
  }
  return null;
}

function label(str, x, y) {
  const tu = LAY.tu;
  const w = str.length * 6 * tu + tu * 4;
  const h = tu * 11;
  const lx = Math.max(4, Math.min(W - w - 4, x + 14));
  const ly = Math.min(H - h - 4, y + 14);
  ctx.fillStyle = rgba(CLOTH.base, 0.94);
  ctx.fillRect(lx, ly, w, h);
  setText(ctx, str, lx + tu * 2, ly + tu * 2, tu, rgba(CLOTH.ink, 1));
}

function header(hour) {
  const { margin, tu } = LAY;
  const ink = rgba(CLOTH.ink, 0.9);
  const faint = rgba(CLOTH.ink, 0.5);
  const hole = rgba(CLOTH.hole, 0.6);
  const cols = Math.floor((W - margin * 2) / (6 * tu));
  const started = day.figs.filter((f) => f.ta <= T && T >= payStart(f));
  const closest = started.filter((f) => !f.snapped).reduce((a, b) => (!a || gapPx(b) < gapPx(a) ? b : a), null);
  const right = [`${started.length} REACHED · 0 ARRIVED`, closest ? `CLOSEST: ${stitchesShort(closest)} ${stitchesShort(closest) === 1 ? "STITCH" : "STITCHES"} SHORT` : "NOTHING REACHING YET"];
  const left = ["LEAKY VESSEL / LOOSE THREAD", `DAY ${pad(day.index + 1, 3)} · ${clockOf(hour)} · ${CLOTH.name} · ${STITCHES[P.stitch]}`];
  // On a narrow screen the right-hand status moves under the left.
  const stack = left.some((l, i) => l.length + right[i].length + 3 > cols);
  if (stack) left[1] = `DAY ${pad(day.index + 1, 3)} · ${clockOf(hour)}`;
  left.forEach((s, i) => setText(ctx, s, margin, margin + i * 10 * tu, tu, i ? faint : ink));
  right.forEach((s, i) => {
    if (stack) setText(ctx, s, margin, margin + (i + 2) * 10 * tu, tu, faint);
    else setText(ctx, s, W - margin - s.length * 6 * tu, margin + i * 10 * tu, tu, i ? faint : ink);
  });

  // Earlier pushes, losing letters a little more each day.
  const by = H - margin - 7 * tu;
  const room = Math.floor((W / 2 - LAY.ringR * 3 - margin) / (6 * tu));
  archive.forEach((a, i) => {
    const age = day.index - a.index;
    const loss = Math.min(0.92, 1 - Math.pow(0.86, age));
    const s = `${pad(a.index + 1, 3)} ${a.head}`.slice(0, room);
    setText(ctx, s, margin, by - i * 10 * tu, tu, rgba(CLOTH.ink, Math.max(0.2, 0.55 - i * 0.06)), (k) => k > 3 && hash01(a.index * 977 + k * 31) < loss, hole);
  });
  const hint = hour >= LOG_HOUR ? `PUSHING CLOSED · UNPICKED AT 00:00` : `TAP A FIGURE TO PUSH IT CLOSER`;
  if (hint.length <= room) setText(ctx, hint, W - margin - hint.length * 6 * tu, by, tu, faint);
}

// Pushing halves what is left of the distance. Push too close and it snaps.
function mousePressed() {
  if (!day) return;
  const hour = (T - day.index) * 24;
  if (hour >= LOG_HOUR) return;
  const f = hit(mouseX, mouseY);
  if (!f) return;
  day.held = f;
  day.taps++;
  f.pushes++;
  f.fail = 1 - (1 - f.fail) / 2;
  day.payDirty = true;
  if (gapPx(f) < f.w * 2.5) {
    f.snapped++;
    day.snaps++;
    f.fail = 0.22 + 0.2 * hash01(f.seed + f.snapped);
  }
  return false;
}

function keyPressed() {
  if (key === "s" || key === "S") saveCanvas(`leaky-vessel-loose-thread-${KEY.replace(/\|/g, "-")}`, "png");
}
