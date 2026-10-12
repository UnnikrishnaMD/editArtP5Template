// Render the ten Afterimage editions headless.
//   node tools/render-afterimage.mjs [scale] [outDir] [editions]
// scale 1 gives 1920 × 1080 (screen); 4 gives 7680 × 4320 tagged 300 dpi
// (25.6 × 14.4 in).
// Needs playwright (npm i playwright, or a global install with NODE_PATH set). editions is a comma list, e.g. 1,5,10 (default: all).
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

// CommonJS require honours NODE_PATH, so a global install also works.
const { chromium } = createRequire(import.meta.url)("playwright");

const root = resolve(new URL("..", import.meta.url).pathname);
const scale = +(process.argv[2] || 1);
const out = resolve(process.argv[3] || join(root, "renders"));
const only = process.argv[4] ? process.argv[4].split(",").map(Number) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const types = { ".html": "text/html", ".js": "text/javascript" };

const server = createServer(async (req, res) => {
  try {
    const p = join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
    res.writeHead(200, { "content-type": types[extname(p)] || "application/octet-stream" });
    res.end(await readFile(p.endsWith("/") ? join(p, "index.html") : p));
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const port = server.address().port;

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
page.on("pageerror", (e) => console.error("page error:", e.message));
for (const n of only) {
  // Only the hash differs between editions, so force a fresh document.
  await page.goto("about:blank");
  await page.goto(`http://localhost:${port}/afterimage/index.html#ed=${n}&still`);
  await page.waitForFunction(() => window.AFTERIMAGE && window.capturePreview);
  const t = Date.now();
  const b64 = await page.evaluate((s) => window.AFTERIMAGE.png(s, s === 1 ? 72 : 300), scale);
  const file = join(out, `afterimage-ed${String(n).padStart(2, "0")}-${1920 * scale}x${1080 * scale}.png`);
  await writeFile(file, Buffer.from(b64, "base64"));
  console.log(file, `${Date.now() - t} ms`);
}
await browser.close();
server.close();
