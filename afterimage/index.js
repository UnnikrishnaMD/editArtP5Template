// LEAKY VESSEL / AFTERIMAGE — ten editions, 1920 × 1080
//
// A day of customer communication is laid over a room. The messages (push,
// inbox, chat, banner, billboard) are set as flat printed modules in the
// series' 5×7 face and taken apart by one typographic operation. Over them,
// people are drawn in fluorescent cotton thread, as organic contours with no
// gender: scrolling, taking a selfie, tapping a card, opening a box, pushing
// a trolley, queueing. Each person runs a thread towards a message, a stage
// of the purchase funnel, or towards YOU, the viewer. No thread arrives, and
// the funnel always breaks between CHECKOUT and PAID.
//
// At 23:00 a vision loop draws boxes around what it saw and publishes one
// notification: a headline, body copy and a call to action, written only from
// counts. At midnight the source is purged. What survives is an afterimage:
// the day's figures as needle holes in the complementary colour, and one
// figure kept by the system (the one closest to converting), unless the
// viewer clicked another.
//
// Five sliders, one element each, in the order of the chain:
//   m0 CONSUMER CULTURE   how many people and messages, and where people stand
//   m1 PARASOCIAL         how many speak and look as if they know YOU
//   m2 COMMON HUMAN       the busiest hour of the day, and the ground it is lived on
//   m3 ADVERTISING        the channel the messages arrive through, and what people do
//   m4 TYPOGRAPHY         the operation that takes the 5×7 face apart
//
// The composition is fixed at 1920 × 1080 art units and drawn as vectors, so
// it renders at any scale. Options go in the URL hash, never the query (the
// EditART query must hold only m0..m4):
//   #ed=1..10     load one of the ten editions
//   #still        no animation: hold the published moment of day 2
//   #print=4      export a PNG at 4× (7680 × 4320, tagged 300 dpi), then show it
// Keys: S saves 1920 × 1080, P saves the print size (default 4×).

const AW = 1920;
const AH = 1080;
const OPT = Object.fromEntries(
  window.location.hash
    .replace(/^#/, "")
    .split("&")
    .filter(Boolean)
    .map((kv) => {
      const [k, v] = kv.split("=");
      return [k, v === undefined ? "1" : decodeURIComponent(v)];
    })
);

// Each edition moves exactly one slider away from the edition before it,
// walking the chain twice from the midpoint: consumer culture, parasocial,
// common human, advertising, typography, and again.
const EDITIONS = [
  { m: [0.215, 0.5, 0.5, 0.5, 0.5], el: "CONSUMER CULTURE" },
  { m: [0.215, 0.88, 0.5, 0.5, 0.5], el: "PARASOCIAL" },
  { m: [0.215, 0.88, 0.07, 0.5, 0.5], el: "COMMON HUMAN" },
  { m: [0.215, 0.88, 0.07, 0.11, 0.5], el: "ADVERTISING" },
  { m: [0.215, 0.88, 0.07, 0.11, 0.07], el: "TYPOGRAPHY" },
  { m: [0.78, 0.88, 0.07, 0.11, 0.07], el: "CONSUMER CULTURE" },
  { m: [0.78, 0.24, 0.07, 0.11, 0.07], el: "PARASOCIAL" },
  { m: [0.78, 0.24, 0.93, 0.11, 0.07], el: "COMMON HUMAN" },
  { m: [0.78, 0.24, 0.93, 0.87, 0.07], el: "ADVERTISING" },
  { m: [0.78, 0.24, 0.93, 0.87, 0.71], el: "TYPOGRAPHY" },
];

if (OPT.ed && EDITIONS[+OPT.ed - 1]) {
  [m0, m1, m2, m3, m4] = EDITIONS[+OPT.ed - 1].m;
  seedRandomness();
}

// ------------------------------------------------------------------ type
// The 5×7 face shared by the whole Leaky Vessel series, with brackets added
// for the [FIRST NAME] merge field.

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
FACE["["] = [".###.", ".#...", ".#...", ".#...", ".#...", ".#...", ".###."];
FACE["]"] = [".###.", "...#.", "...#.", "...#.", "...#.", "...#.", ".###."];
FACE["#"] = [".#.#.", ".#.#.", "#####", ".#.#.", "#####", ".#.#.", ".#.#."];

const RUNS = {};
for (const ch in FACE) {
  const runs = [];
  FACE[ch].forEach((row, r) => {
    let start = -1;
    for (let c = 0; c <= 5; c++) {
      const on = c < 5 && row[c] === "#";
      if (on && start < 0) start = c;
      if (!on && start >= 0) {
        runs.push([start, r, c - start]);
        start = -1;
      }
    }
  });
  RUNS[ch] = runs;
}
const lit = (ch, c, r) => FACE[ch] && r >= 0 && r < 7 && c >= 0 && c < 5 && FACE[ch][r][c] === "#";

function wrapText(str, cols) {
  const lines = [];
  let line = "";
  for (const word of str.split(" ")) {
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

// Interface text: plain modules. `lost(i)` leaves a letter as one hole.
function setText(g, str, x, y, u, lost) {
  for (let i = 0; i < str.length; i++) {
    const gx = x + i * 6 * u;
    if (lost && lost(i)) {
      g.fillRect(gx + 2 * u, y + 3 * u, u, u);
      continue;
    }
    for (const [c0, r, len] of RUNS[str[i]] || []) g.fillRect(gx + c0 * u, y + r * u, len * u, u);
  }
  return str.length * 6 * u;
}
const textW = (str, u) => str.length * 6 * u - u;

// ------------------------------------------------------------------ typography
// m4: five ways of taking a message apart. Each returns rects [x,y,w,h,...]
// and dots [x,y,r,...] in the message's own coordinates.

const OPS = ["SLICE", "OVERPRINT", "LEAK", "PERFORATE", "DECAY"];

function typeOp(lines, u, op, a, R) {
  const rects = [];
  const dots = [];
  const ph = R() * 6.28;
  const jumps = {};
  lines.forEach((line, li) => {
    const y0 = li * 9 * u;
    let wordStart = 0;
    let inWord = 0;
    for (let ci = 0; ci < line.length; ci++) {
      const ch = line[ci];
      if (ch === " ") {
        wordStart = ci + 1;
        inWord = 0;
        continue;
      }
      let x0 = ci * 6 * u;
      if (op === 1) x0 = wordStart * 6 * u + inWord * 6 * u * (1 - 0.88 * a) + (R() - 0.5) * u * a;
      inWord++;
      const rows = FACE[ch];
      if (!rows) continue;
      if (op === 0 || op === 1) {
        for (const [c0, r, len] of RUNS[ch]) {
          let dx = 0;
          if (op === 0) {
            const row = li * 7 + r;
            if (jumps[row] === undefined) jumps[row] = R() < 0.22 + 0.2 * a ? Math.round((R() < 0.5 ? -1 : 1) * (3 + R() * 9 * a)) : 0;
            dx = Math.round(Math.sin(row * 0.62 + ph) * (1 + 4 * a) + jumps[row]) * u;
          }
          rects.push(x0 + c0 * u + dx, y0 + r * u, len * u, u);
        }
        continue;
      }
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 5; c++) {
          const on = rows[r][c] === "#";
          const x = x0 + c * u;
          const y = y0 + r * u;
          if (op === 2) {
            if (!on) continue;
            rects.push(x, y, u, u);
            if (!lit(ch, c, r + 1) && R() < 0.45 + 0.45 * a) {
              const len = u * (1 + Math.pow(R(), 2.2) * (6 + 26 * a));
              rects.push(x + u * 0.3, y + u, u * 0.4, len);
            }
          } else if (op === 3) {
            if (on) dots.push(x + u / 2, y + u / 2, u * 0.5 * (0.42 + 0.58 * R()));
            else if (R() < 0.18 + 0.4 * a) dots.push(x + u / 2, y + u / 2, u * 0.11);
          } else {
            if (!on || R() < 0.55 * a) continue;
            const dx = Math.sin(y * 0.045 + ph) * a * u * 5 + (R() - 0.5) * a * u * 2;
            const dy = (R() - 0.5) * a * u * 1.5;
            if (R() < 0.3 * a) rects.push(x + dx - u * 0.6, y + dy + u * 0.35, u * 2.2, u * 0.32);
            else rects.push(x + dx, y + dy, u, u);
          }
        }
      }
    }
  });
  return { rects, dots };
}

// ------------------------------------------------------------------ copy
// All copy is original and generic. No brands, no real slogans.

const CHANNELS = ["PUSH", "INBOX", "CHAT", "BANNER", "BILLBOARD"];
const COPY = [
  "YOUR ORDER HAS SHIPPED", "PRICE DROP ON SAVED ITEMS", "FLASH SALE ENDS AT MIDNIGHT", "NEW IN: 214 ITEMS",
  "LOW STOCK ALERT", "RATE YOUR LAST PURCHASE", "YOUR CODE IS 482 019", "DOUBLE POINTS THIS WEEKEND",
  "FREE RETURNS EXTENDED", "OUT FOR DELIVERY", "SUBSCRIPTION RENEWS TOMORROW", "BACK IN STOCK",
  "UP TO 70% OFF", "ONLY 2 LEFT", "LAST CHANCE: 24H", "ORDER #4471 CONFIRMED", "UPDATE YOUR DETAILS",
  "TRACK YOUR PARCEL", "EARLY ACCESS STARTS NOW", "YOUR RECEIPT", "BUY NOW PAY LATER", "TRENDING NEAR YOU",
];
const YOUCOPY = [
  "WE MISSED YOU", "[FIRST NAME], THIS IS FOR YOU", "YOU LEFT SOMETHING BEHIND", "STILL THINKING ABOUT IT?",
  "WE SAVED YOUR CART", "YOU DESERVE THIS", "HEY, IT'S BEEN A WHILE", "PICKED JUST FOR YOU",
  "WE KNOW WHAT YOU LIKE", "COME BACK, [FIRST NAME]", "YOUR FAVOURITES MISS YOU", "ONLY YOU CAN UNLOCK THIS",
  "HAPPY BIRTHDAY [FIRST NAME]", "YOU'RE ON THE LIST",
];
const SENDERS = ["STORE", "REWARDS", "DELIVERY", "MEMBERS", "SUPPORT", "WALLET", "MARKET", "CLUB"];
const HEROES = ["NOW", "TAP", "BUY", "MORE", "OPEN", "SAVE", "LAST", "NEW", "FREE", "SALE"];
const YOUHEROES = ["YOU", "MISS", "STAY", "BACK"];
const STAGES = ["SEEN", "TAPPED", "IN CART", "CHECKOUT", "PAID"];
const FAILS = ["SESSION EXPIRED", "CARD DECLINED", "OUT OF STOCK", "PLEASE TRY AGAIN", "VERIFICATION PENDING", "ADDRESS NOT RECOGNISED"];

// ------------------------------------------------------------------ colour

const FL = {
  pink: [255, 40, 140], cyan: [20, 214, 255], violet: [168, 78, 255], orange: [255, 108, 24],
  yellow: [250, 236, 20], green: [30, 250, 120], lime: [196, 255, 30],
};
const GROUNDS = [
  { name: "COTTON RAG", base: [242, 239, 232], fibre: [196, 188, 172], ink: [38, 36, 34], shadow: [70, 60, 46], dark: false },
  { name: "CALICO", base: [226, 216, 194], fibre: [160, 144, 112], ink: [52, 44, 34], shadow: [80, 64, 40], dark: false },
  { name: "GREY MARL", base: [132, 132, 130], fibre: [96, 96, 96], ink: [28, 28, 30], shadow: [24, 24, 26], dark: false },
  { name: "INDIGO", base: [26, 34, 70], fibre: [62, 80, 132], ink: [180, 192, 222], shadow: [4, 6, 18], dark: true },
  { name: "BLACK COTTON", base: [15, 14, 16], fibre: [48, 46, 52], ink: [200, 198, 192], shadow: [0, 0, 0], dark: true },
];

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const mixc = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const pad = (n, k) => String(n).padStart(k, "0");
const clockOf = (h) => `${pad(Math.floor(h) % 24, 2)}:${pad(Math.floor((h % 1) * 60), 2)}`;

// The afterimage colour: the same lightness, the opposite hue.
function complement(c) {
  const r = c[0] / 255, g = c[1] / 255, b = c[2] / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  if (mx === mn) return c.slice();
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h / 6 + 0.5) % 1;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t) => {
    t = (t + 1) % 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((v) => Math.round(v * 255));
}

// ------------------------------------------------------------------ randomness
// One stream per element, drawn once from the EditART generators, then
// hashed with an id so that moving one slider changes only its element.

let SEEDS;
function seedStreams() {
  SEEDS = { cc: randomM0(), ps: randomM1(), ch: randomM2(), ad: randomM3(), ty: randomM4() };
  SEEDS.all = SEEDS.cc + SEEDS.ps + SEEDS.ch + SEEDS.ad + SEEDS.ty;
}
const rngFor = (k, ...ids) => sfc32(...cyrb128(`${randomSeedEditArt}|${k}|${SEEDS[k]}|${ids.join(":")}`));
const pick = (R, arr) => arr[Math.floor(R() * arr.length)];
const gauss = (R) => Math.sqrt(-2 * Math.log(R() + 1e-9)) * Math.cos(6.2832 * R());

// ------------------------------------------------------------------ people
// Poses in figure units: feet at y = 0, height about 1, facing +x. The body
// is a union of soft capsules; its outline, and one or two echoes inside it,
// are traced as contours and laid as thread. Props are a second field, laid
// in a second colour.

const SIDE = {
  hd: [0, -0.915], nk: [0, -0.82], sL: [-0.03, -0.78], sR: [0.03, -0.78], eL: [-0.07, -0.6], hL: [-0.06, -0.43],
  eR: [0.07, -0.6], hR: [0.07, -0.43], pv: [0, -0.47], kL: [-0.04, -0.245], kR: [0.05, -0.245],
  fL: [-0.05, -0.02], fR: [0.05, -0.02],
};
const FRONT = {
  ...SIDE, sL: [-0.1, -0.78], sR: [0.1, -0.78], eL: [-0.13, -0.6], eR: [0.13, -0.6],
  kL: [-0.06, -0.245], kR: [0.06, -0.245], fL: [-0.08, -0.02], fR: [0.08, -0.02],
};
const STRIDE = { kL: [-0.09, -0.25], fL: [-0.15, -0.02], kR: [0.08, -0.25], fR: [0.13, -0.02] };

const box = (x, y, hw, hh, rot = 0) => ({ t: "b", x, y, hw, hh, rot });
const cap = (ax, ay, bx, by, r) => ({ t: "c", ax, ay, bx, by, ra: r, rb: r });
const ring = (x, y, r) => ({ t: "o", x, y, r });

const ACTS = {
  SCROLLING: { fam: 0, said: "SCROLLING", base: SIDE,
    pose: { hd: [0.045, -0.9], nk: [0.012, -0.815], eL: [-0.02, -0.6], hL: [0.08, -0.66], eR: [0.03, -0.6], hR: [0.1, -0.67] },
    props: [box(0.11, -0.7, 0.028, 0.048, -0.5)], screen: 0 },
  SELFIE: { fam: 0, said: "TAKING A SELFIE", base: SIDE,
    pose: { hd: [-0.02, -0.915], eR: [0.15, -0.86], hR: [0.2, -1.03], eL: [-0.12, -0.62], hL: [-0.04, -0.5] },
    props: [box(0.21, -1.08, 0.03, 0.05, 0.25)], screen: 0 },
  SOFA: { fam: 0, said: "SCROLLING ON THE SOFA", base: SIDE,
    pose: { pv: [-0.02, -0.33], kL: [0.17, -0.34], kR: [0.19, -0.35], fL: [0.17, -0.02], fR: [0.21, -0.02],
      nk: [-0.04, -0.67], hd: [-0.01, -0.76], sL: [-0.06, -0.63], sR: [-0.02, -0.63], eL: [0.03, -0.47],
      hL: [0.12, -0.59], eR: [0.06, -0.48], hR: [0.14, -0.61] },
    props: [box(0.15, -0.64, 0.026, 0.045, 0.2), box(-0.04, -0.15, 0.22, 0.14)], screen: 0 },
  CALLING: { fam: 0, said: "WALKING ON A CALL", base: SIDE,
    pose: { ...STRIDE, eR: [0.1, -0.67], hR: [0.05, -0.85], eL: [-0.08, -0.6], hL: [-0.15, -0.46] },
    props: [box(0.045, -0.88, 0.022, 0.05, 0.1)], screen: 0 },
  SCANNING: { fam: 0, said: "SCANNING A CODE", base: SIDE,
    pose: { eR: [0.18, -0.74], hR: [0.29, -0.8] },
    props: [box(0.31, -0.82, 0.025, 0.045, -0.2), box(0.56, -0.95, 0.1, 0.15), cap(0.56, -0.8, 0.56, 0, 0.012)], screen: 0 },
  TAPPING: { fam: 1, said: "TAPPING A CARD", base: SIDE,
    pose: { eR: [0.2, -0.66], hR: [0.31, -0.69] },
    props: [box(0.34, -0.7, 0.035, 0.022, 0.1), box(0.44, -0.8, 0.045, 0.07), cap(0.44, -0.73, 0.44, 0, 0.015)] },
  BAGS: { fam: 1, said: "CARRYING BAGS", base: SIDE,
    pose: { ...STRIDE, eL: [-0.12, -0.6], hL: [-0.17, -0.43], eR: [0.12, -0.6], hR: [0.17, -0.43] },
    props: [box(0.2, -0.26, 0.075, 0.1, 0.05), cap(0.17, -0.43, 0.15, -0.36, 0.008), cap(0.17, -0.43, 0.25, -0.36, 0.008),
      box(-0.2, -0.27, 0.07, 0.095, -0.05), cap(-0.17, -0.43, -0.25, -0.36, 0.008), cap(-0.17, -0.43, -0.15, -0.36, 0.008)] },
  UNBOXING: { fam: 1, said: "OPENING A BOX", base: SIDE,
    pose: { pv: [-0.04, -0.27], kL: [0.14, -0.3], kR: [0.16, -0.28], fL: [0.02, -0.02], fR: [0.06, -0.02],
      nk: [0.1, -0.6], hd: [0.17, -0.67], sL: [0.07, -0.57], sR: [0.11, -0.57], eL: [0.2, -0.43], hL: [0.29, -0.3],
      eR: [0.23, -0.44], hR: [0.33, -0.31] },
    props: [box(0.41, -0.12, 0.11, 0.11), cap(0.3, -0.23, 0.25, -0.33, 0.01), cap(0.52, -0.23, 0.57, -0.32, 0.01)] },
  TRYING: { fam: 1, said: "TRYING SOMETHING ON", base: FRONT,
    pose: { eL: [-0.2, -0.72], hL: [-0.24, -0.86], eR: [0.2, -0.72], hR: [0.24, -0.86] },
    props: [cap(-0.24, -0.87, 0.24, -0.87, 0.01), box(0, -0.66, 0.15, 0.19), cap(-0.15, -0.82, -0.25, -0.64, 0.03),
      cap(0.15, -0.82, 0.25, -0.64, 0.03)] },
  QUEUEING: { fam: 2, said: "WAITING IN LINE", base: SIDE,
    pose: { eL: [-0.06, -0.6], hL: [0.05, -0.5], eR: [0.08, -0.6], hR: [0.06, -0.5], kR: [0.07, -0.25], fR: [0.1, -0.02] },
    props: [cap(0.06, -0.5, 0.075, -0.37, 0.012), cap(0.3, -0.38, 0.3, 0, 0.014), cap(0.3, -0.36, 0.62, -0.31, 0.008)] },
  TROLLEY: { fam: 2, said: "PUSHING A TROLLEY", base: SIDE,
    pose: { ...STRIDE, nk: [0.06, -0.8], hd: [0.1, -0.89], sL: [0.03, -0.77], sR: [0.08, -0.77], eL: [0.18, -0.63],
      hL: [0.31, -0.63], eR: [0.21, -0.64], hR: [0.34, -0.63] },
    props: [cap(0.34, -0.63, 0.41, -0.52, 0.012), box(0.6, -0.39, 0.18, 0.13), cap(0.47, -0.26, 0.48, -0.06, 0.012),
      cap(0.73, -0.26, 0.72, -0.06, 0.012), ring(0.48, -0.03, 0.03), ring(0.72, -0.03, 0.03)] },
  REACHING: { fam: 2, said: "REACHING FOR A SHELF", base: SIDE,
    pose: { hd: [0.02, -0.93], eR: [0.14, -0.99], hR: [0.19, -1.16], fL: [-0.06, -0.05], fR: [0.07, -0.06],
      eL: [-0.1, -0.6], hL: [-0.08, -0.44] },
    props: [box(0.21, -1.22, 0.04, 0.055, 0.1), cap(-0.02, -1.29, 0.52, -1.29, 0.01), box(0.36, -1.34, 0.045, 0.05)] },
  FACING: { fam: 0, said: "LOOKING AT YOU", base: FRONT,
    pose: { eL: [-0.13, -0.6], hL: [-0.04, -0.62], eR: [0.13, -0.6], hR: [0.04, -0.62] },
    props: [box(0, -0.65, 0.045, 0.075)], screen: 0 },
};
const FAMS = [
  ["SCROLLING", "SELFIE", "SOFA", "CALLING", "SCANNING"],
  ["TAPPING", "BAGS", "UNBOXING", "TRYING"],
  ["QUEUEING", "TROLLEY", "REACHING"],
];

function sdPrim(p, x, y) {
  if (p.t === "c") {
    const bax = p.bx - p.ax, bay = p.by - p.ay;
    const h = clamp01(((x - p.ax) * bax + (y - p.ay) * bay) / (bax * bax + bay * bay || 1e-9));
    return Math.hypot(x - p.ax - bax * h, y - p.ay - bay * h) - (p.ra + (p.rb - p.ra) * h);
  }
  if (p.t === "o") return Math.abs(Math.hypot(x - p.x, y - p.y) - p.r) - 0.006;
  const cs = Math.cos(-p.rot), sn = Math.sin(-p.rot);
  const dx = x - p.x, dy = y - p.y;
  const qx = Math.abs(dx * cs - dy * sn) - p.hw, qy = Math.abs(dx * sn + dy * cs) - p.hh;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - 0.004;
}

function smin(a, b, k) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

function bodyPrims(J, front) {
  const C = (a, b, ra, rb) => ({ t: "c", ax: J[a][0], ay: J[a][1], bx: J[b][0], by: J[b][1], ra, rb });
  const hipL = [J.pv[0] - (front ? 0.06 : 0.035), J.pv[1]];
  const hipR = [J.pv[0] + (front ? 0.06 : 0.035), J.pv[1]];
  J.hipL = hipL;
  J.hipR = hipR;
  const footDir = (k) => (front ? (k === "fL" ? -1 : 1) : 1);
  const foot = (k) => ({ t: "c", ax: J[k][0], ay: J[k][1], bx: J[k][0] + 0.055 * footDir(k), by: J[k][1] + 0.005, ra: 0.024, rb: 0.02 });
  return [
    { t: "o", x: J.hd[0], y: J.hd[1], r: 0 }, // replaced below by a solid head
    C("nk", "hd", 0.03, 0.03),
    { t: "c", ax: J.nk[0], ay: J.nk[1] + 0.03, bx: J.pv[0], by: J.pv[1], ra: front ? 0.085 : 0.075, rb: front ? 0.075 : 0.07 },
    C("sL", "sR", 0.045, 0.045),
    C("hipL", "hipR", 0.062, 0.062),
    C("sL", "eL", 0.036, 0.03), C("eL", "hL", 0.03, 0.023),
    C("sR", "eR", 0.036, 0.03), C("eR", "hR", 0.03, 0.023),
    C("hipL", "kL", 0.054, 0.04), C("kL", "fL", 0.04, 0.028),
    C("hipR", "kR", 0.054, 0.04), C("kR", "fR", 0.04, 0.028),
    foot("fL"), foot("fR"),
  ];
}

// Marching squares, chained into polylines.
const MS = [[], [[3, 0]], [[0, 1]], [[3, 1]], [[1, 2]], [[3, 0], [1, 2]], [[0, 2]], [[3, 2]],
  [[2, 3]], [[0, 2]], [[0, 1], [2, 3]], [[1, 2]], [[3, 1]], [[0, 1]], [[3, 0]], []];

function contours(F, nx, ny, iso) {
  const adj = new Map();
  const pos = new Map();
  const link = (a, b) => {
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a).push(b);
    adj.get(b).push(a);
  };
  const edgePt = (key, i0, j0, i1, j1) => {
    if (pos.has(key)) return;
    const f0 = F[j0 * nx + i0], f1 = F[j1 * nx + i1];
    const t = (iso - f0) / (f1 - f0 || 1e-9);
    pos.set(key, [i0 + (i1 - i0) * t, j0 + (j1 - j0) * t]);
  };
  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const a = F[j * nx + i] < iso, b = F[j * nx + i + 1] < iso;
      const c = F[(j + 1) * nx + i + 1] < iso, d = F[(j + 1) * nx + i] < iso;
      const code = (a ? 1 : 0) | (b ? 2 : 0) | (c ? 4 : 0) | (d ? 8 : 0);
      if (!code || code === 15) continue;
      const keys = [(j * nx + i) * 2, (j * nx + i + 1) * 2 + 1, ((j + 1) * nx + i) * 2, (j * nx + i) * 2 + 1];
      const ends = [[i, j, i + 1, j], [i + 1, j, i + 1, j + 1], [i, j + 1, i + 1, j + 1], [i, j, i, j + 1]];
      for (const [e0, e1] of MS[code]) {
        edgePt(keys[e0], ...ends[e0]);
        edgePt(keys[e1], ...ends[e1]);
        link(keys[e0], keys[e1]);
      }
    }
  }
  const seen = new Set();
  const out = [];
  for (const start of adj.keys()) {
    if (seen.has(start)) continue;
    const chain = [start];
    seen.add(start);
    for (let dir = 0; dir < 2; dir++) {
      let cur = dir === 0 ? start : chain[0];
      for (;;) {
        const nxt = adj.get(cur).find((k) => !seen.has(k));
        if (nxt === undefined) break;
        seen.add(nxt);
        if (dir === 0) chain.push(nxt);
        else chain.unshift(nxt);
        cur = nxt;
      }
    }
    if (chain.length > 6) out.push(chain.map((k) => pos.get(k)));
  }
  return out;
}

function chaikin(pts) {
  const out = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    out.push([ax * 0.75 + bx * 0.25, ay * 0.75 + by * 0.25], [ax * 0.25 + bx * 0.75, ay * 0.25 + by * 0.75]);
  }
  out.push(pts[pts.length - 1]);
  return out;
}

// A traced figure in art units: polylines as flat arrays, each with a length.
function traceFigure(act, flip, x, y, h, R, echoes, halo) {
  const A = ACTS[act];
  const J = JSON.parse(JSON.stringify({ ...A.base, ...A.pose }));
  const body = bodyPrims(J, A.base === FRONT);
  body[0] = { t: "c", ax: J.hd[0], ay: J.hd[1] - 0.005, bx: J.hd[0], by: J.hd[1] + 0.005, ra: 0.068, rb: 0.068 };
  const props = A.props;
  let x0 = 1, x1 = -1, y0 = 1, y1 = -1;
  for (const p of [...body, ...props]) {
    const xs = p.t === "c" ? [p.ax, p.bx] : [p.x];
    const ys = p.t === "c" ? [p.ay, p.by] : [p.y];
    const r = p.t === "c" ? Math.max(p.ra, p.rb) : p.t === "o" ? p.r : Math.hypot(p.hw, p.hh);
    for (const v of xs) (x0 = Math.min(x0, v - r)), (x1 = Math.max(x1, v + r));
    for (const v of ys) (y0 = Math.min(y0, v - r)), (y1 = Math.max(y1, v + r));
  }
  x0 -= 0.06; x1 += 0.06; y0 -= 0.06; y1 += 0.06;
  const step = 0.0105;
  const nx = Math.ceil((x1 - x0) / step) + 1;
  const ny = Math.ceil((y1 - y0) / step) + 1;
  const FB = new Float32Array(nx * ny);
  const FP = new Float32Array(nx * ny);
  const p1 = R() * 6.28, p2 = R() * 6.28;
  for (let j = 0; j < ny; j++) {
    const py = y0 + j * step;
    for (let i = 0; i < nx; i++) {
      const px = x0 + i * step;
      let d = 9;
      for (const p of body) d = smin(d, sdPrim(p, px, py), 0.032);
      FB[j * nx + i] = d + 0.0045 * Math.sin(px * 41 + p1) * Math.sin(py * 33 + p2);
      let e = 9;
      for (const p of props) e = Math.min(e, sdPrim(p, px, py));
      FP[j * nx + i] = e;
    }
  }
  const toWorld = (poly) => {
    const sm = chaikin(chaikin(poly));
    const out = new Float32Array(sm.length * 2);
    let len = 0;
    for (let k = 0; k < sm.length; k++) {
      const fx = x0 + sm[k][0] * step, fy = y0 + sm[k][1] * step;
      out[k * 2] = x + (flip ? -fx : fx) * h;
      out[k * 2 + 1] = y + fy * h;
      if (k) len += Math.hypot(out[k * 2] - out[k * 2 - 2], out[k * 2 + 1] - out[k * 2 - 1]);
    }
    return { pts: out, len };
  };
  const polys = [];
  const levels = [[0, 1]];
  if (halo) levels.push([0.016, 0.55]);
  if (echoes > 0) levels.push([-0.018, 0.6]);
  if (echoes > 1) levels.push([-0.034, 0.45]);
  for (const [iso, w] of levels) for (const c of contours(FB, nx, ny, iso)) polys.push({ ...toWorld(c), w, prop: false, lvl: iso });
  for (const c of contours(FP, nx, ny, 0)) polys.push({ ...toWorld(c), w: 0.75, prop: true, lvl: 0 });
  const hand = [x + (flip ? -J.hR[0] : J.hR[0]) * h, y + J.hR[1] * h];
  let bx0 = 1e9, bx1 = -1e9, by0 = 1e9, by1 = -1e9;
  for (const p of polys) {
    for (let k = 0; k < p.pts.length; k += 2) {
      bx0 = Math.min(bx0, p.pts[k]); bx1 = Math.max(bx1, p.pts[k]);
      by0 = Math.min(by0, p.pts[k + 1]); by1 = Math.max(by1, p.pts[k + 1]);
    }
  }
  let screen = null;
  if (A.screen !== undefined) {
    const s = props[A.screen];
    screen = { x: x + (flip ? -s.x : s.x) * h, y: y + s.y * h, hw: s.hw * h * 0.8, hh: s.hh * h * 0.8, rot: flip ? -s.rot : s.rot };
  }
  return { polys, hand, bbox: [bx0, by0, bx1, by1], screen };
}

// ------------------------------------------------------------------ the day

let G, MODE, OPI, OPA, PEAK, CARD, FUNNEL, PAL;
const scenes = new Map();
const kept = new Map(); // day -> figure index chosen by the viewer

function configure() {
  seedStreams();
  G = GROUNDS[Math.min(4, Math.floor(m2 * 5))];
  PEAK = 6 + 17 * m2;
  MODE = Math.min(4, Math.floor(m3 * 5));
  OPI = Math.min(4, Math.floor(m4 * 5));
  OPA = 0.3 + 0.7 * clamp01(m4 * 5 - OPI);
  PAL = G.dark
    ? [[FL.cyan, FL.violet], [FL.orange, FL.yellow], [FL.green, FL.lime]]
    : [[FL.cyan, FL.violet], [FL.orange, [255, 170, 0]], [FL.green, [120, 200, 0]]];
  const R = rngFor("ad", "layout");
  const left = MODE === 0 ? true : MODE === 4 ? false : R() < 0.5;
  CARD = { x: left ? 56 : AW - 56 - 650, y: AH - 56 - 262, w: 650, h: 262, left };
  // The funnel: where the system's stages hang depends on the channel.
  const n = STAGES.length;
  FUNNEL = [];
  for (let k = 0; k < n; k++) {
    const t = k / (n - 1);
    let fx, fy;
    if (MODE === 0) (fx = AW - 150), (fy = 190 + t * 520);
    else if (MODE === 4) (fx = 150), (fy = 190 + t * 520);
    else if (MODE === 2) (fx = 180 + t * 980), (fy = 150 + t * t * 210);
    else (fx = 300 + t * 1320), (fy = MODE === 3 ? 300 + Math.sin(t * 3.1) * 40 : 136);
    FUNNEL.push({ x: fx, y: fy, w: 156, h: 50 });
  }
}

function sceneFor(d) {
  if (!scenes.has(d)) scenes.set(d, compose(d));
  return scenes.get(d);
}

function compose(d) {
  const S = { d, figs: [], msgs: [] };
  const nPeople = Math.round(10 + 52 * Math.pow(m0, 1.15));
  const nMsgs = Math.round(9 + 30 * Math.pow(m0, 1.1));
  const share = 0.04 + 0.86 * m1;

  // Messages: the channel builds the slots, culture decides how many fill.
  const slots = layoutSlots(rngFor("ad", d, "slots"));
  const order = slots.map((_, i) => i);
  const RO = rngFor("cc", d, "order");
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(RO() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  for (let j = 0; j < Math.min(nMsgs, slots.length); j++) {
    const slot = slots[order[j]];
    const you = rngFor("ps", d, "m", j)() < share;
    const RT = rngFor("ad", d, "t", j);
    const text = you ? pick(RT, YOUCOPY) : pick(RT, COPY);
    const RH = rngFor("ch", d, "m", j);
    const hour = clampHour(PEAK + gauss(RH) * 4.2);
    S.msgs.push(buildMessage(slot, text, you, hour, rngFor("ty", d, "m", j), RT));
  }
  S.msgs.sort((a, b) => a.hour - b.hour);
  const RHero = rngFor("ad", d, "hero");
  const heroYou = rngFor("ps", d, "hero")() < share;
  S.hero = buildHero(heroYou ? pick(RHero, YOUHEROES) : pick(RHero, HEROES), heroYou, RHero, rngFor("ty", d, "hero"));

  // People.
  const fam = [Math.max(0.06, 1 - 2 * m3), Math.max(0.06, 1 - Math.abs(2 * m3 - 1)), Math.max(0.06, 2 * m3 - 1)];
  const fs = fam[0] + fam[1] + fam[2];
  for (let i = 0; i < nPeople; i++) {
    const RC = rngFor("cc", d, "f", i);
    const RA = rngFor("ad", d, "f", i);
    const RP = rngFor("ps", d, "f", i);
    const RH = rngFor("ch", d, "f", i);
    const you = RP() < share;
    let act;
    if (you) act = RP() < 0.55 ? "FACING" : "SELFIE";
    else {
      const v = RA() * fs;
      const fi = v < fam[0] ? 0 : v < fam[0] + fam[1] ? 1 : 2;
      act = pick(RA, FAMS[fi]);
    }
    let fx, fy, hpx;
    for (let tries = 0; tries < 12; tries++) {
      fy = 430 + Math.pow(RC(), 0.8) * 575;
      hpx = 118 + ((fy - 430) / 575) * 235;
      fx = 50 + RC() * (AW - 100);
      const inCard = fx + hpx * 0.45 > CARD.x && fx - hpx * 0.45 < CARD.x + CARD.w && fy > CARD.y - 10;
      if (!inCard) break;
    }
    const flip = you ? false : RC() < 0.5;
    const famI = ACTS[act].fam;
    const col = you ? FL.pink : pick(RA, PAL[famI]);
    const pcol = you ? FL.cyan : pick(RA, PAL[(famI + 1 + Math.floor(RA() * 2)) % 3]);
    const fig = traceFigure(act, flip, fx, fy, hpx, RC, Math.floor(RC() * 3), you);
    fig.i = i;
    fig.act = act;
    fig.you = you;
    fig.col = col;
    fig.pcol = pcol;
    fig.y = fy;
    fig.hour = clampHour(PEAK + gauss(RH) * 3.6);
    fig.conf = 0.62 + RC() * 0.37;
    // The transaction thread, which never arrives.
    let target;
    const RT = rngFor("ad", d, "thread", i);
    if (you) target = { x: AW / 2 + (RP() - 0.5) * 520, y: AH + 140, name: "YOU" };
    else if (RT() < 0.55 || !S.msgs.length) {
      const k = Math.min(4, Math.floor(Math.pow(RT(), 0.8) * 5));
      target = { x: FUNNEL[k].x, y: FUNNEL[k].y + FUNNEL[k].h / 2, name: STAGES[k], stage: k };
    } else {
      const m = pick(RT, S.msgs);
      target = { x: m.cx, y: m.cy, name: CHANNELS[MODE] };
    }
    const frac = Math.min(0.5 + 0.47 * Math.pow(RT(), 0.6), 0.975);
    fig.target = target;
    fig.frac = frac;
    fig.thread = threadPath(fig.hand, target, frac, RT);
    S.figs.push(fig);
  }
  S.figs.sort((a, b) => a.y - b.y);
  S.fail = pick(rngFor("ad", d, "fail"), FAILS);
  observe(S);
  return S;
}

const clampHour = (h) => Math.max(6.05, Math.min(22.9, h));

function threadPath(a, b, frac, R) {
  const dist = Math.hypot(b.x - a[0], b.y - a[1]);
  const cx = (a[0] + b.x) / 2 + (R() - 0.5) * 120;
  const cy = (a[1] + b.y) / 2 + 40 + dist * 0.16;
  const n = Math.max(8, Math.round((dist * frac) / 9));
  const pts = new Float32Array((n + 1) * 2);
  const ph = R() * 6.28;
  let len = 0;
  for (let k = 0; k <= n; k++) {
    const t = (k / n) * frac;
    const u = 1 - t;
    pts[k * 2] = u * u * a[0] + 2 * u * t * cx + t * t * b.x + Math.sin(t * 19 + ph) * 1.6;
    pts[k * 2 + 1] = u * u * a[1] + 2 * u * t * cy + t * t * b.y + Math.cos(t * 23 + ph) * 1.6;
    if (k) len += Math.hypot(pts[k * 2] - pts[k * 2 - 2], pts[k * 2 + 1] - pts[k * 2 - 1]);
  }
  // A frayed end: three loose fibres.
  const ex = pts[n * 2], ey = pts[n * 2 + 1];
  const ang = Math.atan2(ey - pts[n * 2 - 1], ex - pts[n * 2 - 2]);
  const fray = [];
  for (let f = 0; f < 3; f++) {
    const aa = ang + (f - 1) * 0.6 + (R() - 0.5) * 0.4;
    const L = 8 + R() * 12;
    fray.push([ex, ey, ex + Math.cos(aa) * L * 0.5, ey + Math.sin(aa) * L * 0.5 + 3, ex + Math.cos(aa) * L, ey + Math.sin(aa) * L + 5]);
  }
  return { pts, len, fray };
}

// ------------------------------------------------------------------ messages
// m3 builds the architecture the copy arrives in.

function layoutSlots(R) {
  const s = [];
  if (MODE === 0) {
    // PUSH: cascades of notification cards.
    const stacks = 4 + Math.floor(R() * 3);
    for (let k = 0; k < stacks; k++) {
      let x = -80 + R() * (AW - 300), y = -40 + R() * 520;
      const w = 420 + R() * 300, rot = (R() - 0.5) * 0.14;
      const u = 3 + Math.floor(R() * 4);
      const n = 3 + Math.floor(R() * 5);
      for (let i = 0; i < n; i++) {
        s.push({ kind: "card", x, y, w, u, rot });
        y += u * 18 + 46;
        x += (R() - 0.3) * 30;
      }
    }
  } else if (MODE === 1) {
    // INBOX: full-width rows of subject lines.
    let y = 96;
    while (y < AH - 20) {
      const u = 2 + Math.floor(R() * R() * 8);
      s.push({ kind: "row", x: 0, y, w: AW, u, rot: 0 });
      y += u * 7 + 30 + R() * 22;
    }
  } else if (MODE === 2) {
    // CHAT: three columns of bubbles.
    for (let col = 0; col < 3; col++) {
      let y = 40 + R() * 80;
      const cx = 60 + col * 620;
      while (y < AH - 60) {
        const u = 3 + Math.floor(R() * 3);
        const right = R() < 0.5;
        s.push({ kind: "bubble", x: cx + (right ? 120 : 0), y, w: 460, u, rot: 0, right });
        y += u * 16 + 40 + R() * 30;
      }
    }
  } else if (MODE === 3) {
    // BANNER: wide bands, cropped by the frame.
    let y = 30 + R() * 40;
    while (y < AH - 60) {
      const u = 6 + Math.floor(R() * 14);
      s.push({ kind: "band", x: -40 + R() * 260, y, w: AW + 200, u, rot: (R() - 0.5) * 0.05 });
      y += u * 7 + 46 + R() * 50;
    }
  } else {
    // BILLBOARD: boards of different sizes, overlapping like a street.
    for (let k = 0; k < 22; k++) {
      const u = 6 + Math.floor(R() * 12);
      const w = 300 + R() * 760;
      s.push({ kind: "board", x: -100 + R() * (AW - 200), y: -60 + R() * 640, w, u, rot: (R() - 0.5) * 0.06 });
    }
  }
  return s;
}

function buildMessage(slot, text, you, hour, RT, RC) {
  const m = { ...slot, text, you, hour };
  const u = slot.u;
  const inner = slot.kind === "card" ? slot.w - u * 14 - 40 : slot.kind === "row" ? slot.w - 520 : slot.kind === "bubble" ? slot.w - 40 : slot.w - 40;
  const cols = Math.max(4, Math.floor(inner / (6 * u)));
  m.lines = slot.kind === "band" || slot.kind === "row" ? [text] : wrapText(text, cols);
  m.prims = typeOp(m.lines, u, OPI, OPA, RT);
  m.tw = Math.max(...m.lines.map((l) => textW(l, u)));
  m.th = m.lines.length * 9 * u - 2 * u;
  m.sender = pick(RC, SENDERS);
  m.time = clockOf(hour);
  if (slot.kind === "card") {
    m.h = m.th + 40 + u * 2;
    m.tx = u * 9 + 32;
    m.ty = 22 + u * 2;
  } else if (slot.kind === "row") {
    m.h = u * 7 + 20;
    m.tx = 360;
    m.ty = 10;
  } else if (slot.kind === "bubble") {
    m.w = Math.min(slot.w, m.tw + 44);
    if (slot.right) m.x = slot.x + slot.w - m.w;
    m.h = m.th + 36;
    m.tx = 22;
    m.ty = 18;
  } else if (slot.kind === "band") {
    m.h = u * 7 + 40;
    m.tx = 30;
    m.ty = 20;
  } else {
    m.h = Math.max(m.th + 60, 160);
    m.w = Math.min(slot.w, m.tw + 60);
    m.tx = 30;
    m.ty = 30;
  }
  m.cx = m.x + Math.min(m.w, AW) / 2;
  m.cy = m.y + m.h / 2;
  return m;
}

function buildHero(word, you, RA, RT) {
  const u = 46 + Math.floor(RA() * 34);
  const w = textW(word, u);
  return {
    word, you, u,
    x: -w * 0.12 + RA() * (AW - w * 0.76),
    y: 140 + RA() * (AH - 7 * u - 200),
    prims: typeOp([word], u, OPI, OPA, RT),
  };
}

// ------------------------------------------------------------------ the log
// What the vision loop publishes at 23:00, from counts only.

const ACT_SHORT = { SCROLLING: "SCROLLING", SELFIE: "SELFIES", SOFA: "SOFA SCROLLING", CALLING: "CALLS", SCANNING: "SCANNING",
  TAPPING: "TAPPING", BAGS: "CARRYING", UNBOXING: "UNBOXING", TRYING: "TRYING ON", QUEUEING: "QUEUEING",
  TROLLEY: "TROLLEYS", REACHING: "REACHING", FACING: "LOOKING AT YOU" };

function observe(S) {
  const R = rngFor("all", S.d, "log");
  const n = S.figs.length;
  const tally = {};
  const hours = new Array(24).fill(0);
  let you = 0;
  let best = S.figs[0];
  for (const f of S.figs) {
    tally[f.act] = (tally[f.act] || 0) + 1;
    hours[Math.floor(f.hour)]++;
    if (f.you) you++;
    if (f.frac > best.frac) best = f;
  }
  const top = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0];
  let busy = 6, quiet = 6;
  for (let h = 6; h < 23; h++) {
    if (hours[h] > hours[busy]) busy = h;
    if (hours[h] < hours[quiet]) quiet = h;
  }
  const gap = Math.max(1, Math.round((best.thread.len * (1 / best.frac - 1)) / 12));
  const stitches = `${gap} STITCH${gap === 1 ? "" : "ES"}`;
  const st = { n, you, top, busy, quiet, gap, best, msgs: S.msgs.length };
  const heads = [
    `${n} OF YOU ALMOST DID IT`,
    "STILL THINKING ABOUT IT?",
    `YOU WERE ${stitches} AWAY`,
    `WE SAW ${n} OF YOU TODAY`,
    `${ACT_SHORT[top]} PEAKED AT ${pad(busy, 2)}:00`,
    you > n / 2 ? "IT WAS ALL ABOUT YOU" : "SOMEONE WAS WATCHING",
  ];
  const ctas = ["FINISH WHAT YOU STARTED", "COME BACK TOMORROW", "TAP TO REMEMBER", "KEEP THIS FOR ME", "TRY AGAIN"];
  st.head = pick(R, heads);
  st.body =
    `${n} PEOPLE PASSED. ${st.msgs} MESSAGES REACHED THEM. MOST WERE ${ACT_SHORT[top]}. ` +
    `${you} THREADS RAN TOWARDS YOU. NONE ARRIVED. ` +
    `THE CLOSEST STOPPED ${stitches} SHORT. ${S.fail}.`;
  st.cta = pick(R, ctas);
  S.log = st;
}

// ------------------------------------------------------------------ drawing

function paintGround(g) {
  const R = rngFor("ch", "ground");
  g.fillStyle = rgb(G.base);
  g.fillRect(0, 0, AW, AH);
  // Weave, or for the rag paper only fibres.
  if (G.name !== "COTTON RAG") {
    g.lineWidth = 0.55;
    for (let y = 0; y < AH; y += 2.6) {
      g.strokeStyle = rgba(G.fibre, 0.08 + R() * 0.16);
      g.beginPath();
      g.moveTo(0, y + R());
      g.lineTo(AW, y + R());
      g.stroke();
    }
    for (let x = 0; x < AW; x += 2.6) {
      g.strokeStyle = rgba(G.fibre, 0.05 + R() * 0.12);
      g.beginPath();
      g.moveTo(x + R(), 0);
      g.lineTo(x + R(), AH);
      g.stroke();
    }
  }
  g.lineWidth = 0.6;
  for (let k = 0; k < 2600; k++) {
    const x = R() * AW, y = R() * AH, a = R() * 6.28, L = 4 + R() * 16;
    g.strokeStyle = rgba(G.fibre, 0.12 + R() * 0.25);
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a) * L * 0.5 + (R() - 0.5) * 6, y + Math.sin(a) * L * 0.5 + (R() - 0.5) * 6, x + Math.cos(a) * L, y + Math.sin(a) * L);
    g.stroke();
  }
  // The light at the busiest hour falls from one side.
  const lx = ((PEAK - 6) / 17) * AW;
  const grad = g.createRadialGradient(lx, -200, 100, lx, -200, AW * 1.25);
  grad.addColorStop(0, G.dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.18)");
  grad.addColorStop(1, G.dark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.12)");
  g.fillStyle = grad;
  g.fillRect(0, 0, AW, AH);
}

function strokePts(g, pts, n) {
  g.beginPath();
  g.moveTo(pts[0], pts[1]);
  for (let k = 1; k < n; k++) g.lineTo(pts[k * 2], pts[k * 2 + 1]);
  g.stroke();
}

// Fluorescent cotton: a soft bloom on dark cloth, a shadow, the thread, and
// a broken highlight for the twist of the ply.
function lay(g, pts, n, col, w, alpha = 1) {
  if (n < 2) return;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.globalAlpha = alpha;
  if (G.dark) {
    g.strokeStyle = rgba(col, 0.13);
    g.lineWidth = w * 4.5;
    strokePts(g, pts, n);
  }
  g.save();
  g.translate(0.8, 1.2);
  g.strokeStyle = rgba(G.shadow, G.dark ? 0.7 : 0.3);
  g.lineWidth = w * 1.2;
  strokePts(g, pts, n);
  g.restore();
  g.strokeStyle = rgb(col);
  g.lineWidth = w;
  strokePts(g, pts, n);
  g.setLineDash([w * 1.1, w * 1.7]);
  g.strokeStyle = rgba(mixc(col, [255, 255, 255], 0.62), 0.7);
  g.lineWidth = w * 0.36;
  strokePts(g, pts, n);
  g.setLineDash([]);
  g.globalAlpha = 1;
}

// Needle holes along a polyline, for what has been unpicked.
function holes(g, pts, spacing, r) {
  let acc = 0;
  for (let k = 1; k < pts.length / 2; k++) {
    const x0 = pts[k * 2 - 2], y0 = pts[k * 2 - 1], x1 = pts[k * 2], y1 = pts[k * 2 + 1];
    const L = Math.hypot(x1 - x0, y1 - y0);
    while (acc <= L) {
      const t = L ? acc / L : 0;
      g.fillRect(x0 + (x1 - x0) * t - r, y0 + (y1 - y0) * t - r, r * 2, r * 2);
      acc += spacing;
    }
    acc -= L;
  }
}

function drawMessages(g, S, hour, fade) {
  const inkA = G.dark ? 0.3 : 0.26;
  // The hero word, under everything.
  const H = S.hero;
  g.fillStyle = H.you ? rgba(FL.pink, (G.dark ? 0.16 : 0.13) * fade) : rgba(G.ink, (G.dark ? 0.09 : 0.075) * fade);
  drawPrims(g, H.prims, H.x, H.y);
  for (const m of S.msgs) {
    if (m.hour > hour) continue;
    const a = fade * clamp01((hour - m.hour) * 2 + 0.2);
    g.save();
    g.translate(m.x, m.y);
    g.rotate(m.rot);
    const ink = m.you ? FL.pink : G.ink;
    g.strokeStyle = rgba(G.ink, inkA * 0.9 * a);
    g.fillStyle = rgba(G.ink, inkA * a);
    g.lineWidth = 1.2;
    container(g, m, inkA * a);
    g.fillStyle = rgba(ink, (m.you ? 0.62 : inkA * 1.5) * a);
    drawPrims(g, m.prims, m.tx, m.ty);
    g.restore();
  }
}

function container(g, m, a) {
  const u = m.u;
  if (m.kind === "card") {
    g.beginPath();
    g.roundRect(0, 0, m.w, m.h, 18);
    g.stroke();
    g.beginPath();
    g.roundRect(16, 18, u * 9, u * 9, u * 2);
    g.stroke();
    g.fillStyle = rgba(G.ink, a * 1.2);
    setText(g, `${m.sender} · ${m.time}`, m.tx, 8, 1.4);
  } else if (m.kind === "row") {
    g.beginPath();
    g.moveTo(0, m.h + 8);
    g.lineTo(AW, m.h + 8);
    g.stroke();
    if (m.you || m.hour > PEAK) {
      g.beginPath();
      g.arc(40, m.h / 2 + 2, 6, 0, 6.283);
      g.fill();
    }
    setText(g, m.sender, 76, m.h / 2 - 5, 1.6);
    setText(g, m.time, AW - 120, m.h / 2 - 5, 1.6);
  } else if (m.kind === "bubble") {
    g.beginPath();
    g.roundRect(0, 0, m.w, m.h, 22);
    g.stroke();
    const tx = m.right ? m.w - 30 : 30;
    g.beginPath();
    g.moveTo(tx - 10, m.h);
    g.lineTo(tx + (m.right ? 18 : -18), m.h + 16);
    g.lineTo(tx + 10, m.h);
    g.stroke();
  } else if (m.kind === "band") {
    g.fillStyle = rgba(G.ink, a * 0.18);
    g.fillRect(-200, 0, m.w + 400, m.h);
    g.beginPath();
    g.moveTo(-200, 0);
    g.lineTo(m.w + 200, 0);
    g.moveTo(-200, m.h);
    g.lineTo(m.w + 200, m.h);
    g.stroke();
  } else {
    g.lineWidth = 2.4;
    g.strokeRect(0, 0, m.w, m.h);
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(m.w * 0.25, m.h);
    g.lineTo(m.w * 0.25, m.h + 90);
    g.moveTo(m.w * 0.75, m.h);
    g.lineTo(m.w * 0.75, m.h + 90);
    g.stroke();
  }
}

function drawPrims(g, P, ox, oy) {
  const r = P.rects;
  for (let k = 0; k < r.length; k += 4) g.fillRect(ox + r[k], oy + r[k + 1], r[k + 2], r[k + 3]);
  const d = P.dots;
  if (d.length) {
    g.beginPath();
    for (let k = 0; k < d.length; k += 3) {
      g.moveTo(ox + d[k] + d[k + 2], oy + d[k + 1]);
      g.arc(ox + d[k], oy + d[k + 1], d[k + 2], 0, 6.283);
    }
    g.fill();
  }
}

// The purchase funnel. The link into PAID always breaks.
function drawFunnel(g, S, hour, fade) {
  const seen = S.figs.filter((f) => f.hour <= hour).length;
  const counts = [seen, Math.round(seen * 0.52), Math.round(seen * 0.23), Math.max(seen ? 1 : 0, Math.round(seen * 0.08)), 0];
  g.globalAlpha = fade;
  g.strokeStyle = rgba(G.ink, 0.75);
  g.lineWidth = 1.4;
  g.setLineDash([7, 5]);
  for (let k = 0; k < FUNNEL.length - 1; k++) {
    const a = FUNNEL[k], b = FUNNEL[k + 1];
    const ax = a.x + (MODE === 0 || MODE === 4 ? 0 : a.w / 2), ay = a.y + (MODE === 0 || MODE === 4 ? a.h : a.h / 2);
    const bx = b.x - (MODE === 0 || MODE === 4 ? 0 : b.w / 2), by = b.y + (MODE === 0 || MODE === 4 ? 0 : b.h / 2);
    g.beginPath();
    if (k === FUNNEL.length - 2) {
      // The break: two frayed ends that do not meet.
      g.moveTo(ax, ay);
      g.lineTo(ax + (bx - ax) * 0.36, ay + (by - ay) * 0.36);
      g.moveTo(ax + (bx - ax) * 0.66, ay + (by - ay) * 0.66);
      g.lineTo(bx, by);
      g.stroke();
      g.setLineDash([]);
      for (const [t, s] of [[0.36, 1], [0.66, -1]]) {
        const ex = ax + (bx - ax) * t, ey = ay + (by - ay) * t;
        g.beginPath();
        for (let f = -1; f <= 1; f++) {
          g.moveTo(ex, ey);
          g.lineTo(ex + s * 9, ey + f * 6 + 4);
        }
        g.stroke();
      }
      g.fillStyle = rgb(FL.pink);
      const mx = ax + (bx - ax) * 0.51, my = ay + (by - ay) * 0.51;
      setText(g, S.fail, mx - textW(S.fail, 1.6) / 2, my + 14, 1.6);
      g.setLineDash([7, 5]);
    } else {
      g.moveTo(ax, ay);
      g.lineTo(bx, by);
      g.stroke();
    }
  }
  g.setLineDash([]);
  FUNNEL.forEach((n, k) => {
    g.fillStyle = rgba(G.base, 0.82);
    g.beginPath();
    g.roundRect(n.x - n.w / 2, n.y, n.w, n.h, 10);
    g.fill();
    g.setLineDash(k === 4 ? [3, 4] : []);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = k === 4 ? rgb(FL.pink) : rgb(G.ink);
    setText(g, STAGES[k], n.x - n.w / 2 + 12, n.y + 10, 1.8);
    setText(g, pad(counts[k], 3), n.x - n.w / 2 + 12, n.y + 30, 1.4);
  });
  g.globalAlpha = 1;
}

// One figure, stitched to fraction p (0..1), unpicked to fraction q.
function drawFigure(g, f, p, q, alpha = 1) {
  const keep = 1 - q;
  if (p <= 0 || keep <= 0) return;
  const pBody = clamp01(p / 0.7);
  const pThread = clamp01((p - 0.7) / 0.3);
  if (f.screen && pBody > 0.9) {
    g.save();
    g.translate(f.screen.x, f.screen.y);
    g.rotate(f.screen.rot);
    g.fillStyle = rgba(f.pcol, (G.dark ? 0.55 : 0.4) * alpha * keep);
    g.fillRect(-f.screen.hw, -f.screen.hh, f.screen.hw * 2, f.screen.hh * 2);
    g.restore();
  }
  const scale = f.bbox[3] - f.bbox[1];
  const w = Math.max(1.6, scale / 120);
  for (const poly of f.polys) {
    const n = Math.floor((poly.pts.length / 2) * Math.min(pBody, keep));
    lay(g, poly.pts, n, poly.prop ? f.pcol : f.col, w * poly.w * (poly.prop ? 1.3 : 1), alpha);
  }
  if (pThread > 0) {
    const th = f.thread;
    const n = Math.floor((th.pts.length / 2) * Math.min(pThread, keep));
    lay(g, th.pts, n, f.col, Math.max(1.3, w * 0.62), alpha * 0.92);
    if (pThread >= 1 && keep >= 1) {
      g.strokeStyle = rgba(f.col, 0.85 * alpha);
      g.lineWidth = 0.8;
      for (const [x0, y0, cx, cy, x1, y1] of th.fray) {
        g.beginPath();
        g.moveTo(x0, y0);
        g.quadraticCurveTo(cx, cy, x1, y1);
        g.stroke();
      }
    }
  }
}

// What survives the purge: every figure as complementary needle holes, one
// figure kept at reduced strength.
function drawGhost(g, S, alpha) {
  if (!S || alpha <= 0) return;
  const keptI = keptIndex(S);
  for (const f of S.figs) {
    if (f.i === keptI) continue;
    g.fillStyle = rgba(complement(f.col), (G.dark ? 0.5 : 0.42) * alpha);
    g.save();
    g.translate(14, -9);
    for (const p of f.polys) if (p.lvl === 0 && !p.prop) holes(g, p.pts, 7.5, 0.95);
    g.restore();
  }
  const k = S.figs.find((f) => f.i === keptI);
  if (k) {
    drawFigure(g, { ...k, col: complement(k.col), pcol: complement(k.pcol), screen: null }, 0.7, 0, 0.55 * alpha);
    g.fillStyle = rgba(G.ink, 0.6 * alpha);
    const label = kept.has(S.d) ? "KEPT BY YOU" : `KEPT BY THE SYSTEM · ${Math.round(k.frac * 100)}% CONVERTED`;
    setText(g, label, Math.min(k.bbox[0], AW - 40 - textW(label, 1.3)), k.bbox[3] + 10, 1.3);
  }
}

function keptIndex(S) {
  if (kept.has(S.d)) return kept.get(S.d);
  return S.log.best.i;
}

// The vision loop's boxes, drawn at 23:00.
function drawBoxes(g, S, a) {
  if (a <= 0) return;
  g.strokeStyle = rgba(G.ink, 0.55 * a);
  g.fillStyle = rgba(G.ink, 0.62 * a);
  g.lineWidth = 1;
  const named = new Set([...S.figs].sort((a, b) => b.conf - a.conf).slice(0, 16).map((f) => f.i));
  for (const f of S.figs) {
    const [x0, y0, x1, y1] = f.bbox;
    const c = Math.min(14, (x1 - x0) / 4);
    g.beginPath();
    for (const [x, y, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
      g.moveTo(x + sx * c, y);
      g.lineTo(x, y);
      g.lineTo(x, y + sy * c);
    }
    g.stroke();
    if (named.has(f.i)) setText(g, `${f.conf.toFixed(2)} ${ACTS[f.act].said}`, x0, y0 - 11, 1.15);
  }
}

// The published notification, as an appliqué patch.
function drawCard(g, S, typed, fade) {
  if (typed <= 0 || fade <= 0) return;
  const C = CARD;
  const L = S.log;
  const dark = !G.dark;
  const bg = dark ? [22, 21, 24] : [238, 234, 226];
  const fg = dark ? [236, 232, 224] : [24, 22, 26];
  g.globalAlpha = fade;
  g.fillStyle = rgba(G.shadow, 0.35);
  g.beginPath();
  g.roundRect(C.x + 5, C.y + 7, C.w, C.h, 26);
  g.fill();
  g.fillStyle = rgba(bg, 0.96);
  g.beginPath();
  g.roundRect(C.x, C.y, C.w, C.h, 26);
  g.fill();
  g.strokeStyle = rgb(FL.pink);
  g.lineWidth = 1.6;
  g.setLineDash([6, 5]);
  g.beginPath();
  g.roundRect(C.x + 8, C.y + 8, C.w - 16, C.h - 16, 20);
  g.stroke();
  g.setLineDash([]);
  const x = C.x + 32;
  let y = C.y + 30;
  const chars = Math.floor(typed * (L.head.length + L.body.length + L.cta.length));
  g.fillStyle = rgb(FL.pink);
  setText(g, `AFTERIMAGE · DAY ${pad(S.d, 3)} · 23:00 · PUBLISHED FROM WHAT WAS SEEN`, x, y, 1.4);
  y += 26;
  g.fillStyle = rgb(fg);
  const head = L.head.slice(0, chars);
  setText(g, head, x, y, 3.4);
  y += 42;
  const bodyLines = wrapText(L.body, 48);
  let left = Math.max(0, chars - L.head.length);
  g.fillStyle = rgba(fg, 0.82);
  for (const line of bodyLines) {
    if (left <= 0) break;
    setText(g, line.slice(0, left), x, y, 1.9);
    left -= line.length + 1;
    y += 19;
  }
  const ctaLeft = chars - L.head.length - L.body.length;
  if (ctaLeft > 0) {
    const t = L.cta.slice(0, ctaLeft);
    const bw = textW(L.cta, 2.2) + 44;
    const by = C.y + C.h - 60;
    g.fillStyle = rgb(FL.pink);
    g.beginPath();
    g.roundRect(x, by, bw, 38, 19);
    g.fill();
    g.fillStyle = rgb(bg);
    setText(g, t, x + 22, by + 12, 2.2);
    g.fillStyle = rgba(fg, 0.5);
    setText(g, "SOURCE PURGES AT 00:00", x + bw + 22, by + 15, 1.4);
  }
  g.globalAlpha = 1;
}

// Older pushes, losing a letter in seven each day.
function drawArchive(g, d) {
  const lines = [];
  for (let k = d - 1; k >= Math.max(1, d - 4); k--) lines.push([k, sceneFor(k).log.head]);
  if (!lines.length) return;
  let y = CARD.y - 22 - lines.length * 16;
  g.fillStyle = rgba(G.ink, 0.55);
  setText(g, "PREVIOUSLY", CARD.x + 6, y - 18, 1.3);
  for (const [k, head] of lines) {
    const age = d - k;
    const loss = Math.min(0.92, 1 - Math.pow(0.86, age));
    const R = rngFor("all", "erode", k);
    const gone = head.split("").map(() => R() < loss);
    setText(g, `${pad(k, 3)}  ${head}`, CARD.x + 6, y, 1.5, (i) => i > 4 && gone[i - 5]);
    y += 16;
  }
}

function drawHeader(g, S, hour, ed) {
  g.fillStyle = rgba(G.ink, 0.85);
  setText(g, "LEAKY VESSEL / AFTERIMAGE", 56, 34, 2);
  g.fillStyle = rgba(G.ink, 0.6);
  const sub = `${ed ? `ED. ${pad(ed.n, 2)}/10 · ${ed.el} · ` : ""}${CHANNELS[MODE]} · ${OPS[OPI]} · ${G.name}`;
  setText(g, sub, 56, 58, 1.4);
  const seen = S.figs.filter((f) => f.hour <= hour).length;
  const you = S.figs.filter((f) => f.hour <= hour && f.you).length;
  const right1 = `DAY ${pad(S.d, 3)} · ${clockOf(Math.min(hour, 23))}`;
  const right2 = `${seen} SEEN · ${you} TOWARDS YOU · 0 CONVERTED`;
  g.fillStyle = rgba(G.ink, 0.85);
  setText(g, right1, AW - 56 - textW(right1, 2), 34, 2);
  g.fillStyle = rgba(G.ink, 0.6);
  setText(g, right2, AW - 56 - textW(right2, 1.4), 58, 1.4);
}

// A full frame in art units. v = { d, hour, scan, typed, purge, ghost }
function renderFrame(g, v, groundCanvas) {
  const S = sceneFor(v.d);
  const prev = v.d > 1 ? sceneFor(v.d - 1) : null;
  const q = v.purge || 0;
  if (groundCanvas) g.drawImage(groundCanvas, 0, 0, AW, AH);
  else paintGround(g);
  drawMessages(g, S, v.hour, 1 - q);
  drawGhost(g, prev, (v.ghost === undefined ? 1 : v.ghost) * (1 - q));
  if (q > 0) drawGhost(g, S, clamp01((q - 0.5) * 2));
  const stitchS = 17 / 160; // hours for one figure to be stitched
  for (const f of S.figs) {
    const p = clamp01((v.hour - f.hour) / stitchS / 1.4);
    const qq = clamp01(q * 1.6 - hash(f.i + v.d * 977) * 0.6);
    drawFigure(g, f, p, qq);
  }
  drawFunnel(g, S, v.hour, 1 - q);
  drawBoxes(g, S, (v.scan || 0) * (1 - q));
  drawArchive(g, v.d);
  drawCard(g, S, v.typed || 0, 1 - q);
  drawHeader(g, S, v.hour, edition());
}

const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function edition() {
  const key = [m0, m1, m2, m3, m4].map((v) => v.toFixed(3)).join(",");
  const i = EDITIONS.findIndex((e) => e.m.map((v) => v.toFixed(3)).join(",") === key);
  return i < 0 ? null : { n: i + 1, el: EDITIONS[i].el };
}

const STILL = { d: 2, hour: 24, scan: 1, typed: 1, purge: 0 };

// ------------------------------------------------------------------ export
// PNG with a pHYs chunk, so print software reads the intended resolution.

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(bytes) {
  let c = 0xffffffff;
  for (const b of bytes) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function withDpi(buf, dpi) {
  const src = new Uint8Array(buf);
  const ppm = Math.round(dpi / 0.0254);
  const chunk = new Uint8Array(21);
  const dv = new DataView(chunk.buffer);
  dv.setUint32(0, 9);
  chunk.set([0x70, 0x48, 0x59, 0x73], 4); // pHYs
  dv.setUint32(8, ppm);
  dv.setUint32(12, ppm);
  chunk[16] = 1;
  dv.setUint32(17, crc32(chunk.subarray(4, 17)));
  const at = 8 + 25; // after the signature and IHDR
  const out = new Uint8Array(src.length + 21);
  out.set(src.subarray(0, at), 0);
  out.set(chunk, at);
  out.set(src.subarray(at), at + 21);
  return out;
}

function renderStill(scale) {
  const c = document.createElement("canvas");
  c.width = AW * scale;
  c.height = AH * scale;
  const g = c.getContext("2d");
  g.setTransform(scale, 0, 0, scale, 0, 0);
  renderFrame(g, STILL, null);
  return c;
}

async function stillPNG(scale, dpi) {
  const c = renderStill(scale);
  const blob = await new Promise((res) => c.toBlob(res, "image/png"));
  return withDpi(await blob.arrayBuffer(), dpi);
}

function fileName(scale) {
  const ed = edition();
  return `afterimage-${ed ? `ed${pad(ed.n, 2)}` : [m0, m1, m2, m3, m4].map((v) => v.toFixed(3)).join("-")}-${AW * scale}x${AH * scale}.png`;
}

async function download(scale) {
  const bytes = await stillPNG(scale, scale === 1 ? 72 : 300);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([bytes], { type: "image/png" }));
  a.download = fileName(scale);
  a.click();
}

// For the headless renderer in tools/render-afterimage.mjs.
window.AFTERIMAGE = {
  async png(scale = 1, dpi = 300) {
    const bytes = await stillPNG(scale, dpi);
    let s = "";
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(s);
  },
  editions: EDITIONS,
};

// ------------------------------------------------------------------ p5

let groundC = null, frameC = null, K = 1, OX = 0, OY = 0, PD = 1;
let phase, phaseT0, dayN;
let previewSent = false;
let mouseArt = null;

const T_HOLD = 16, T_PURGE = 6, T_STITCH = 30, T_SCAN = 2.5, T_TYPE = 3.5;

function setup() {
  createCanvas(windowWidth, windowHeight);
  PD = pixelDensity();
  frameRate(30);
  reset();
  if (OPT.print) download(Math.max(1, Math.min(8, +OPT.print || 4)));
}

function windowResizedUser() {
  resizeCanvas(windowWidth, windowHeight);
  fit();
}

function fit() {
  K = Math.min(width / AW, height / AH);
  OX = (width - AW * K) / 2;
  OY = (height - AH * K) / 2;
  groundC = document.createElement("canvas");
  groundC.width = Math.ceil(AW * K * PD);
  groundC.height = Math.ceil(AH * K * PD);
  const g = groundC.getContext("2d");
  g.setTransform(K * PD, 0, 0, K * PD, 0, 0);
  paintGround(g);
  frameC = null;
}

function reset() {
  configure();
  scenes.clear();
  kept.clear();
  fit();
  dayN = 2;
  phase = "hold";
  phaseT0 = millis() / 1000;
  previewSent = false;
}

function view(now) {
  const t = now - phaseT0;
  if (phase === "hold") return { d: dayN, hour: 24, scan: 1, typed: 1 };
  if (phase === "purge") return { d: dayN, hour: 24, scan: 1, typed: 1, purge: clamp01(t / T_PURGE) };
  const stitchEnd = T_STITCH;
  const hour = 6 + 17 * Math.min(1, t / stitchEnd) + (t > stitchEnd ? 1 : 0);
  return {
    d: dayN, hour,
    scan: clamp01((t - stitchEnd) / T_SCAN),
    typed: clamp01((t - stitchEnd - T_SCAN) / T_TYPE),
  };
}

function step(now) {
  if (OPT.still !== undefined) return;
  const t = now - phaseT0;
  if (phase === "hold" && t > T_HOLD) (phase = "purge"), (phaseT0 = now), (frameC = null);
  else if (phase === "purge" && t > T_PURGE) {
    dayN++;
    for (const k of scenes.keys()) if (k < dayN - 5) scenes.delete(k);
    phase = "stitch";
    phaseT0 = now;
  } else if (phase === "stitch" && t > T_STITCH + T_SCAN + T_TYPE) (phase = "hold"), (phaseT0 = now), (frameC = null);
}

function draw() {
  if (resetAnimation) {
    resetAnimation = false;
    reset();
  }
  const now = millis() / 1000;
  step(now);
  const g = drawingContext;
  g.setTransform(PD, 0, 0, PD, 0, 0);
  g.fillStyle = "#0c0c0d";
  g.fillRect(0, 0, width, height);
  g.setTransform(K * PD, 0, 0, K * PD, OX * PD, OY * PD);
  if (phase === "hold") {
    // The published moment is static: render it once.
    if (!frameC) {
      frameC = document.createElement("canvas");
      frameC.width = groundC.width;
      frameC.height = groundC.height;
      const f = frameC.getContext("2d");
      f.setTransform(K * PD, 0, 0, K * PD, 0, 0);
      renderFrame(f, view(now), groundC);
    }
    g.drawImage(frameC, 0, 0, AW, AH);
  } else renderFrame(g, view(now), groundC);
  if (mouseArt) tooltip(g, now);
  if (!previewSent) {
    previewSent = true;
    triggerPreview();
  }
}

function figureAt(x, y) {
  const S = sceneFor(dayN);
  const hour = view(millis() / 1000).hour;
  for (let k = S.figs.length - 1; k >= 0; k--) {
    const f = S.figs[k];
    const [x0, y0, x1, y1] = f.bbox;
    if (f.hour <= hour && x >= x0 && x <= x1 && y >= y0 && y <= y1) return f;
  }
  return null;
}

function tooltip(g) {
  const f = figureAt(mouseArt[0], mouseArt[1]);
  if (!f) return;
  const lines = [`${ACTS[f.act].said} · ${clockOf(f.hour)}`, `${Math.round(f.frac * 100)}% TOWARDS ${f.target.name}`, "CLICK TO KEEP"];
  const w = Math.max(...lines.map((l) => textW(l, 1.6))) + 24;
  const x = Math.min(mouseArt[0] + 16, AW - w - 8), y = mouseArt[1] + 16;
  g.fillStyle = "rgba(12,12,13,0.88)";
  g.fillRect(x, y, w, lines.length * 18 + 14);
  g.fillStyle = rgb(f.col);
  lines.forEach((l, i) => setText(g, l, x + 12, y + 10 + i * 18, 1.6));
}

function mouseMoved() {
  mouseArt = [(mouseX - OX) / K, (mouseY - OY) / K];
}

function mousePressed() {
  mouseMoved();
  const f = figureAt(mouseArt[0], mouseArt[1]);
  if (f && phase !== "purge") {
    kept.set(dayN, f.i);
    frameC = null;
  }
}

function keyPressed() {
  if (key === "s" || key === "S") download(1);
  if (key === "p" || key === "P") download(Math.max(2, Math.min(8, +OPT.print || 4)));
}
