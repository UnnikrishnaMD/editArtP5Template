// LEAKY VESSEL — lens
// Runs on the artist's machine, in the living space. Turns the camera into a
// 48×36 field and sends only that.

const FW = 48;
const FH = 36;
const KEY = new URLSearchParams(location.search).get("key") || "";
const SEND_EVERY = 500; // ms

let cam;
let half; // 96×72 intermediate, for a cleaner average when shrinking
let field; // 48×36
let jpegCanvas;
let last = 0;
let sending = false;
let lastField = null;
let ended = false;

function setup() {
  const holder = document.getElementById("holder");
  const c = createCanvas(10, 10);
  c.parent(holder);
  pixelDensity(1);
  noSmooth();
  cam = createCapture({ video: { width: 320, height: 240 }, audio: false }, () => status("Camera open."));
  cam.size(320, 240);
  cam.hide();
  half = createGraphics(FW * 2, FH * 2);
  half.pixelDensity(1);
  field = createGraphics(FW, FH);
  field.pixelDensity(1);
  jpegCanvas = document.createElement("canvas");
  jpegCanvas.width = 320;
  jpegCanvas.height = 240;
  fit();
}

function fit() {
  const holder = document.getElementById("holder");
  const w = holder.clientWidth;
  const h = holder.clientHeight;
  const s = Math.min(w / 4, h / 3);
  resizeCanvas(Math.floor(s * 4), Math.floor(s * 3));
}

function windowResized() {
  fit();
}

function status(text) {
  document.getElementById("lens-status").textContent = text;
}

function toBase64(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(s);
}

function grabField() {
  half.image(cam, 0, 0, FW * 2, FH * 2);
  field.image(half, 0, 0, FW, FH);
  field.loadPixels();
  const out = new Uint8Array(FW * FH * 3);
  for (let i = 0; i < FW * FH; i++) {
    out[i * 3] = field.pixels[i * 4];
    out[i * 3 + 1] = field.pixels[i * 4 + 1];
    out[i * 3 + 2] = field.pixels[i * 4 + 2];
  }
  return out;
}

async function post(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json", "x-vessel-key": KEY },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

async function sendField() {
  if (sending || ended) return;
  sending = true;
  try {
    const bytes = grabField();
    lastField = bytes;
    const r = await post("/api/lens/field", { rgb: toBase64(bytes) });
    if (r.status === 401) status("Wrong lens key. Use the lens link printed by the server.");
    else if (r.status === 410) {
      ended = true;
      status("The feed has ended. This lens is no longer needed.");
    } else if (r.status === 200) {
      status(`Sending. Hour ${String(r.body.slot).padStart(2, "0")}. Phase: ${r.body.phase}.`);
      if (r.body.keyframe !== null && r.body.keyframe !== undefined) {
        const ctx = jpegCanvas.getContext("2d");
        ctx.drawImage(cam.elt, 0, 0, 320, 240);
        await post("/api/lens/keyframe", { slot: r.body.keyframe, jpeg: jpegCanvas.toDataURL("image/jpeg", 0.7) });
      }
    }
  } catch (err) {
    status(`Server unreachable (${err.message}). Retrying.`);
  } finally {
    sending = false;
  }
}

function draw() {
  background(13, 13, 12);
  if (cam.loadedmetadata && millis() - last > SEND_EVERY) {
    last = millis();
    sendField();
  }
  // The artist sees the same grid the server receives, nothing more.
  if (lastField) {
    const cw = width / FW;
    const ch = height / FH;
    noStroke();
    for (let i = 0; i < FW * FH; i++) {
      fill(lastField[i * 3], lastField[i * 3 + 1], lastField[i * 3 + 2]);
      rect((i % FW) * cw, Math.floor(i / FW) * ch, cw + 0.5, ch + 0.5);
    }
  }
}
