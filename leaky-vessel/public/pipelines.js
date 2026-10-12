// LEAKY VESSEL — pipelines
//
// The live field is a 48×36 grid of colour sent by the lens. It is never shown
// as it is. Each month of the collector's year isolates one element of it, so
// the year becomes a series of twelve related works made from one source:
//
//   01 LIGHT      luminance only, posterised
//   02 COLOUR     hue without light, by column
//   03 MOTION     only what changed
//   04 CONTOUR    edges as short strokes
//   05 DURATION   a long exposure of the day
//   06 GRAIN      tone as density of points
//   07 INTERVAL   one slit of the room, through time
//   08 STILLNESS  only what did not move
//   09 MASS       the room reduced to weights
//   10 TEXT       the room set in the words written about it
//   11 EROSION    the image losing cells as the month runs out
//   12 AFTERIMAGE the complement of everything seen

const FW = 48;
const FH = 36;
const FN = FW * FH;
const SLIT_W = 240;

const GROUND = [13, 13, 12];
const PAPER = [231, 227, 217];

function hash01(n) {
  let x = (n | 0) ^ 0x9e3779b9;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

function mulberry(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const lumOf = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function decodeField(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ------------------------------------------------------------------ feed

// Everything an element might need, derived from the incoming fields.
class Feed {
  constructor() {
    this.target = new Float32Array(FN * 3);
    this.cur = new Float32Array(FN * 3);
    this.avg = new Float32Array(FN * 3);
    this.lum = new Float32Array(FN);
    this.prevLum = null;
    this.motion = new Float32Array(FN);
    this.still = new Float32Array(FN);
    this.pushes = 0;
    this.has = false;
    this.low = createGraphics(FW, FH);
    this.low.pixelDensity(1);
    this.slit = createGraphics(SLIT_W, FH);
    this.slit.pixelDensity(1);
    this.slit.background(GROUND);
    this.slit.noStroke();
  }

  push(bytes) {
    for (let i = 0; i < FN * 3; i++) this.target[i] = bytes[i] / 255;
    if (!this.has) {
      this.cur.set(this.target);
      this.avg.set(this.target);
      this.has = true;
    }
    const lum = new Float32Array(FN);
    for (let i = 0; i < FN; i++) {
      const L = lumOf(this.target[i * 3], this.target[i * 3 + 1], this.target[i * 3 + 2]);
      lum[i] = L;
      if (this.prevLum) {
        const m = Math.abs(L - this.prevLum[i]);
        this.motion[i] = Math.min(1, Math.max(this.motion[i], m * 5));
        this.still[i] = m < 0.025 ? Math.min(1, this.still[i] + 0.015) : 0;
      }
    }
    this.prevLum = lum;
    for (let i = 0; i < FN * 3; i++) this.avg[i] += (this.target[i] - this.avg[i]) * 0.012;

    // one column of the room, appended to a strip of time
    const s = this.slit;
    s.copy(s, 1, 0, SLIT_W - 1, FH, 0, 0, SLIT_W - 1, FH);
    const cx = FW >> 1;
    for (let y = 0; y < FH; y++) {
      const i = (y * FW + cx) * 3;
      s.fill(this.target[i] * 255, this.target[i + 1] * 255, this.target[i + 2] * 255);
      s.rect(SLIT_W - 1, y, 1, 1);
    }
    this.pushes++;
  }

  step() {
    for (let i = 0; i < FN * 3; i++) this.cur[i] += (this.target[i] - this.cur[i]) * 0.18;
    for (let i = 0; i < FN; i++) {
      this.lum[i] = lumOf(this.cur[i * 3], this.cur[i * 3 + 1], this.cur[i * 3 + 2]);
      this.motion[i] *= 0.975;
    }
  }

  // Fill the 48×36 buffer with a colour per cell, return it for upscaling.
  paint(fn) {
    const g = this.low;
    g.loadPixels();
    const px = g.pixels;
    const c = [0, 0, 0];
    for (let i = 0; i < FN; i++) {
      fn(i, c);
      px[i * 4] = c[0];
      px[i * 4 + 1] = c[1];
      px[i * 4 + 2] = c[2];
      px[i * 4 + 3] = 255;
    }
    g.updatePixels();
    return g;
  }
}

// Some elements draw straight to the 2D context for speed. p5 caches the last
// fill and stroke it set, so after raw drawing the cache must be cleared or
// the next fill() can silently reuse the wrong colour.
function rawDone() {
  const r = p5.instance && p5.instance._renderer;
  if (r) r._cachedFillStyle = r._cachedStrokeStyle = undefined;
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function groundRect(x, y, w, h) {
  noStroke();
  fill(GROUND);
  rect(x, y, w, h);
}

// ------------------------------------------------------------- elements

const ELEMENTS = [
  {
    name: "LIGHT",
    note: "Luminance only, in seven tones. Colour has been withheld.",
    draw(f, x, y, w, h) {
      const g = f.paint((i, c) => {
        const v = Math.round(Math.pow(f.lum[i], 0.9) * 6) / 6;
        c[0] = mix(GROUND[0], PAPER[0], v);
        c[1] = mix(GROUND[1], PAPER[1], v);
        c[2] = mix(GROUND[2], PAPER[2], v);
      });
      image(g, x, y, w, h);
    },
  },
  {
    name: "COLOUR",
    note: "Hue without light. Each column keeps only the colour that passed through it.",
    draw(f, x, y, w, h) {
      groundRect(x, y, w, h);
      const cw = w / FW;
      for (let cx = 0; cx < FW; cx++) {
        let r = 0;
        let g = 0;
        let b = 0;
        for (let cy = 0; cy < FH; cy++) {
          const i = (cy * FW + cx) * 3;
          r += f.cur[i];
          g += f.cur[i + 1];
          b += f.cur[i + 2];
        }
        r /= FH;
        g /= FH;
        b /= FH;
        const mx = Math.max(r, g, b, 1e-4);
        const mn = Math.min(r, g, b);
        const sat = Math.min(1, ((mx - mn) / mx) * 1.8);
        // keep hue, fix brightness, push saturation
        const k = 0.82 / mx;
        const R = mix(0.82, r * k, sat);
        const G = mix(0.82, g * k, sat);
        const B = mix(0.82, b * k, sat);
        noStroke();
        fill(R * 255, G * 255, B * 255);
        rect(x + cx * cw, y, cw + 0.6, h);
      }
    },
  },
  {
    name: "MOTION",
    note: "Only what changed. Anything that holds still disappears.",
    draw(f, x, y, w, h) {
      groundRect(x, y, w, h);
      const cw = w / FW;
      const ch = h / FH;
      const ctx = drawingContext;
      for (let i = 0; i < FN; i++) {
        const m = f.motion[i];
        if (m < 0.03) continue;
        const cx = i % FW;
        const cy = (i / FW) | 0;
        ctx.fillStyle = `rgba(${PAPER[0]},${PAPER[1]},${PAPER[2]},${Math.min(1, m * 1.4)})`;
        const len = cw * (0.3 + m * 2.2);
        ctx.fillRect(x + cx * cw + (cw - len) / 2, y + cy * ch + ch * 0.45, len, Math.max(1, ch * 0.12));
      }
    },
  },
  {
    name: "CONTOUR",
    note: "Edges drawn as strokes along the boundary between light and dark.",
    draw(f, x, y, w, h) {
      groundRect(x, y, w, h);
      const cw = w / FW;
      const ch = h / FH;
      const L = f.lum;
      const ctx = drawingContext;
      ctx.strokeStyle = `rgb(${PAPER[0]},${PAPER[1]},${PAPER[2]})`;
      ctx.lineCap = "round";
      for (let cy = 1; cy < FH - 1; cy++) {
        for (let cx = 1; cx < FW - 1; cx++) {
          const at = (dx, dy) => L[(cy + dy) * FW + cx + dx];
          const gx = at(1, -1) + 2 * at(1, 0) + at(1, 1) - at(-1, -1) - 2 * at(-1, 0) - at(-1, 1);
          const gy = at(-1, 1) + 2 * at(0, 1) + at(1, 1) - at(-1, -1) - 2 * at(0, -1) - at(1, -1);
          const mag = Math.hypot(gx, gy);
          if (mag < 0.18) continue;
          // stroke runs along the edge, perpendicular to the gradient
          const a = Math.atan2(gy, gx) + Math.PI / 2;
          const len = Math.min(cw, ch) * 0.9;
          const px = x + (cx + 0.5) * cw;
          const py = y + (cy + 0.5) * ch;
          ctx.lineWidth = Math.min(3, 0.4 + mag * 1.6);
          ctx.globalAlpha = Math.min(1, mag);
          ctx.beginPath();
          ctx.moveTo(px - Math.cos(a) * len, py - Math.sin(a) * len);
          ctx.lineTo(px + Math.cos(a) * len, py + Math.sin(a) * len);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    },
  },
  {
    name: "DURATION",
    note: "A long exposure. Whatever passed quickly never registered.",
    draw(f, x, y, w, h) {
      const g = f.paint((i, c) => {
        c[0] = f.avg[i * 3] * 255;
        c[1] = f.avg[i * 3 + 1] * 255;
        c[2] = f.avg[i * 3 + 2] * 255;
      });
      image(g, x, y, w, h);
    },
  },
  {
    name: "GRAIN",
    note: "Tone as density. Bright areas are crowded, dark areas almost empty.",
    draw(f, x, y, w, h, o) {
      groundRect(x, y, w, h);
      const rnd = mulberry(f.pushes * 7919 + 17);
      const ctx = drawingContext;
      ctx.fillStyle = `rgb(${PAPER[0]},${PAPER[1]},${PAPER[2]})`;
      const n = Math.round((w * h) / 18);
      const s = Math.max(1, w / 520);
      for (let k = 0; k < n; k++) {
        const u = rnd();
        const v = rnd();
        const L = f.lum[Math.min(FH - 1, (v * FH) | 0) * FW + Math.min(FW - 1, (u * FW) | 0)];
        if (rnd() < Math.pow(L, 1.6)) ctx.fillRect(x + u * w, y + v * h, s, s);
      }
    },
  },
  {
    name: "INTERVAL",
    note: "One vertical slit of the room, recorded again and again. Left is earlier.",
    draw(f, x, y, w, h) {
      image(f.slit, x, y, w, h);
    },
  },
  {
    name: "STILLNESS",
    note: "Only what stayed in place. Anything that moved is left blank.",
    draw(f, x, y, w, h) {
      const g = f.paint((i, c) => {
        const s = f.still[i];
        c[0] = mix(PAPER[0], f.cur[i * 3] * 255, s);
        c[1] = mix(PAPER[1], f.cur[i * 3 + 1] * 255, s);
        c[2] = mix(PAPER[2], f.cur[i * 3 + 2] * 255, s);
      });
      image(g, x, y, w, h);
    },
  },
  {
    name: "MASS",
    note: "The room as twenty-four weights. Darker regions weigh more.",
    draw(f, x, y, w, h) {
      groundRect(x, y, w, h);
      const BX = 6;
      const BY = 4;
      const bw = FW / BX;
      const bh = FH / BY;
      noStroke();
      for (let by = 0; by < BY; by++) {
        for (let bx = 0; bx < BX; bx++) {
          let L = 0;
          let r = 0;
          let g = 0;
          let b = 0;
          let wx = 0;
          let wy = 0;
          let ww = 0;
          for (let cy = by * bh; cy < (by + 1) * bh; cy++) {
            for (let cx = bx * bw; cx < (bx + 1) * bw; cx++) {
              const i = cy * FW + cx;
              const l = f.lum[i];
              L += l;
              r += f.cur[i * 3];
              g += f.cur[i * 3 + 1];
              b += f.cur[i * 3 + 2];
              const d = 1 - l;
              wx += cx * d;
              wy += cy * d;
              ww += d;
            }
          }
          const n = bw * bh;
          L /= n;
          const cx = ww > 0 ? wx / ww + 0.5 : (bx + 0.5) * bw;
          const cy = ww > 0 ? wy / ww + 0.5 : (by + 0.5) * bh;
          const dia = (1 - L) * (w / BX) * 1.05;
          fill((r / n) * 255, (g / n) * 255, (b / n) * 255);
          circle(x + (cx / FW) * w, y + (cy / FH) * h, dia);
        }
      }
    },
  },
  {
    name: "TEXT",
    note: "The room set in the words the machine wrote about it. Size follows light.",
    draw(f, x, y, w, h, o) {
      groundRect(x, y, w, h);
      const text = (o.text || "nothing was written").replace(/\s+/g, " ");
      const COLS = 32;
      const ROWS = 24;
      const cw = w / COLS;
      const ch = h / ROWS;
      const ctx = drawingContext;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const shift = Math.floor(o.t * 1.5);
      for (let ry = 0; ry < ROWS; ry++) {
        for (let rx = 0; rx < COLS; rx++) {
          const fx = Math.floor(((rx + 0.5) / COLS) * FW);
          const fy = Math.floor(((ry + 0.5) / ROWS) * FH);
          const L = f.lum[fy * FW + fx];
          if (L < 0.06) continue;
          const chr = text[(ry * COLS + rx + shift) % text.length];
          if (chr === " ") continue;
          ctx.font = `${L > 0.55 ? 600 : 400} ${Math.max(6, Math.round(ch * (0.4 + L * 0.75)))}px ${o.mono}`;
          ctx.fillStyle = `rgba(${PAPER[0]},${PAPER[1]},${PAPER[2]},${Math.min(1, 0.25 + L)})`;
          ctx.fillText(chr, x + (rx + 0.5) * cw, y + (ry + 0.5) * ch);
        }
      }
    },
  },
  {
    name: "EROSION",
    note: "Cells drop out as the month runs down. By its last day most of the image is gone.",
    draw(f, x, y, w, h, o) {
      const g = f.paint((i, c) => {
        c[0] = f.cur[i * 3] * 255;
        c[1] = f.cur[i * 3 + 1] * 255;
        c[2] = f.cur[i * 3 + 2] * 255;
      });
      image(g, x, y, w, h);
      const lost = 0.05 + (o.progress || 0) * 0.85;
      const cw = w / FW;
      const ch = h / FH;
      noStroke();
      fill(GROUND);
      for (let i = 0; i < FN; i++) {
        if (hash01(i * 31 + (o.seed || 0)) < lost) {
          rect(x + (i % FW) * cw - 0.3, y + ((i / FW) | 0) * ch - 0.3, cw + 0.6, ch + 0.6);
        }
      }
    },
  },
  {
    name: "AFTERIMAGE",
    note: "The complement of the long exposure: what the eye would see after looking away.",
    draw(f, x, y, w, h, o) {
      const breathe = 0.5 + 0.5 * Math.sin(o.t * 0.35);
      const g = f.paint((i, c) => {
        const r = 1 - f.avg[i * 3];
        const gg = 1 - f.avg[i * 3 + 1];
        const b = 1 - f.avg[i * 3 + 2];
        // pull toward the ground so the complement reads as a residue, not a negative
        const k = 0.35 + 0.4 * breathe;
        c[0] = mix(GROUND[0], r * 255, k);
        c[1] = mix(GROUND[1], gg * 255, k);
        c[2] = mix(GROUND[2], b * 255, k);
      });
      image(g, x, y, w, h);
    },
  },
];

for (const E of ELEMENTS) {
  const draw = E.draw;
  E.draw = function (...args) {
    rawDone();
    draw.apply(this, args);
    drawingContext.globalAlpha = 1;
    rawDone();
  };
}

// Months that went unanswered stay as dead bands across every later image.
function drawScars(n, x, y, w, h) {
  const ch = h / FH;
  noStroke();
  for (let s = 0; s < n; s++) {
    const row = Math.floor(hash01(s * 7 + 3) * (FH - 3));
    const rows = 1 + Math.floor(hash01(s * 13 + 1) * 3);
    fill(GROUND);
    rect(x, y + row * ch, w, rows * ch);
    fill(PAPER[0], PAPER[1], PAPER[2], 70);
    rect(x, y + row * ch, w, 1);
    rect(x, y + (row + rows) * ch - 1, w, 1);
  }
}
