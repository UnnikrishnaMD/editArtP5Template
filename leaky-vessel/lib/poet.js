// The poet: turns one day of observation into a short log.
//
// Two voices share one register.
//  - local:  composed from measured facts (light, movement, colour, stillness).
//            It only says what the numbers support. Nothing is invented.
//  - claude: a vision model looks at a handful of the day's keyframes before
//            they are purged. Falls back to the local voice on any failure.

const HOURS = 24;

// ---------- small deterministic helpers ----------

function hash(n) {
  let x = (n | 0) ^ 0x9e3779b9;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

function pick(list, seed) {
  return list[Math.floor(hash(seed) * list.length) % list.length];
}

const hh = (h) => `${String(h).padStart(2, "0")}:00`;

function horizontal(x) {
  if (x < 0.36) return "left";
  if (x > 0.64) return "right";
  return "middle";
}

function vertical(y) {
  if (y < 0.4) return "upper";
  if (y > 0.6) return "lower";
  return "";
}

function regionName(x, y) {
  const v = vertical(y);
  const h = horizontal(x);
  if (h === "middle") return v ? `${v} half` : "centre";
  return v ? `${v} ${h}` : `${h} side`;
}

function hueName(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  if (sat < 0.12) return max > 0.6 ? "a pale grey" : "grey";
  let h;
  const d = max - min;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  if (h < 20 || h >= 340) return "red";
  if (h < 45) return "orange";
  if (h < 70) return "yellow";
  if (h < 160) return "green";
  if (h < 200) return "cyan";
  if (h < 255) return "blue";
  if (h < 290) return "violet";
  return "pink";
}

const WARM = new Set(["red", "orange", "yellow", "pink"]);
const COOL = new Set(["green", "cyan", "blue", "violet"]);

function temperature(hue) {
  if (WARM.has(hue)) return "leaned warm";
  if (COOL.has(hue)) return "leaned cool";
  return "had almost no colour";
}

// "on the left", "on the right", "in the middle"
function sidePhrase(x) {
  const h = horizontal(x);
  return h === "middle" ? "in the middle" : `on the ${h}`;
}

// ---------- reading a day ----------

// day.slots[h] = { n, lum, lumMin, motion, mx, my, mw, bx, by, bw, r, g, b } (sums)
export function summarise(day) {
  const hours = [];
  for (let h = 0; h < HOURS; h++) {
    const s = day.slots[h];
    if (!s || !s.n) {
      hours.push(null);
      continue;
    }
    hours.push({
      h,
      lum: s.lum / s.n,
      lumMin: s.lumMin,
      motion: s.motion / s.n,
      mx: s.mw > 0 ? s.mx / s.mw : 0.5,
      my: s.mw > 0 ? s.my / s.mw : 0.5,
      bx: s.bw > 0 ? s.bx / s.bw : 0.5,
      by: s.bw > 0 ? s.by / s.bw : 0.5,
      r: s.r / s.n,
      g: s.g / s.n,
      b: s.b / s.n,
    });
  }
  const seen = hours.filter(Boolean);
  if (!seen.length) return { seen: 0 };

  const byLum = [...seen].sort((a, b) => a.lum - b.lum);
  const byMotion = [...seen].sort((a, b) => b.motion - a.motion);
  const MOVING = 0.012;
  const moving = seen.filter((s) => s.motion > MOVING);

  // longest run of observed, motionless hours
  let run = 0;
  let best = { len: 0, from: 0, to: 0 };
  let from = 0;
  for (const s of hours) {
    if (s && s.motion <= MOVING) {
      if (run === 0) from = s.h;
      run++;
      if (run > best.len) best = { len: run, from, to: s.h };
    } else run = 0;
  }

  const avg = (k) => seen.reduce((a, s) => a + s[k], 0) / seen.length;
  const bright = byLum[byLum.length - 1];
  return {
    seen: seen.length,
    brightest: bright,
    darkest: byLum[0],
    range: bright.lum - byLum[0].lum,
    meanLum: avg("lum"),
    floor: Math.min(...seen.map((s) => s.lumMin)),
    peakMotion: byMotion[0].motion > MOVING ? byMotion[0] : null,
    movingHours: moving.length,
    firstMove: moving[0] || null,
    lastMove: moving[moving.length - 1] || null,
    still: best.len >= 3 ? best : null,
    colour: { r: avg("r"), g: avg("g"), b: avg("b") },
  };
}

// ---------- the local voice ----------

const CLOSINGS = [
  "The frames this describes are deleted at midnight. The description stays.",
  "I am allowed to keep the sentence, not the picture.",
  "By the time this is read, the images it refers to will not exist.",
  "Everything above is now the only evidence.",
  "I have already started forgetting what this looked like.",
  "Tomorrow I will not be able to check any of this.",
];

export function localLog(dayIndex, day) {
  const s = summarise(day);
  const seed = dayIndex * 31;
  const lines = [];

  if (!s.seen) {
    lines.push(
      pick(
        [
          "The lens was closed today. There is nothing to purge, and the purge will run anyway.",
          "I received no light today. I cannot tell if the room was empty or if I was.",
          "No frames arrived. The day happened somewhere I was not.",
        ],
        seed
      )
    );
    return lines.join(" ");
  }

  if (s.seen < 6) {
    lines.push(`I was only awake for ${s.seen} of the twenty-four hours.`);
  }

  // light
  if (s.range < 0.06) {
    lines.push(
      pick(
        [
          "The light hardly changed all day, as if the hours were the same hour.",
          `The light held at one level from ${hh(s.darkest.h < s.brightest.h ? s.darkest.h : s.brightest.h)} on. Nothing outside reached in.`,
        ],
        seed + 1
      )
    );
  } else {
    lines.push(
      pick(
        [
          `The brightest hour was ${hh(s.brightest.h)}. The darkest was ${hh(s.darkest.h)}.`,
          `Light peaked at ${hh(s.brightest.h)} and was at its lowest by ${hh(s.darkest.h)}.`,
          `At ${hh(s.brightest.h)} the room held the most light it would hold today.`,
        ],
        seed + 2
      )
    );
    const where = regionName(s.brightest.bx, s.brightest.by);
    lines.push(
      pick(
        [`Most of it came from the ${where}.`, `It gathered in the ${where} of the frame.`],
        seed + 3
      )
    );
  }
  if (s.floor > 0.22) {
    lines.push("It never got fully dark. Something was left on.");
  }

  // movement
  if (!s.peakMotion) {
    lines.push(
      pick(
        [
          "Nothing moved that I could measure.",
          "No one crossed the frame. The furniture kept its places.",
          "There was no movement today. I checked every hour.",
        ],
        seed + 4
      )
    );
  } else {
    const p = s.peakMotion;
    const side = horizontal(p.mx);
    lines.push(
      pick(
        [
          `Something moved through the ${side} of the frame around ${hh(p.h)}.`,
          `The most movement came at ${hh(p.h)}, ${sidePhrase(p.mx)}.`,
          `At ${hh(p.h)} the ${side} of the room changed more than at any other time.`,
        ],
        seed + 5
      )
    );
    if (s.movingHours === 1) {
      lines.push("It did not happen again.");
    } else if (s.firstMove && s.lastMove && s.firstMove.h !== s.lastMove.h) {
      lines.push(
        pick(
          [
            `Movement began at ${hh(s.firstMove.h)} and stopped after ${hh(s.lastMove.h)}.`,
            `There was movement in ${s.movingHours} of the hours I saw.`,
          ],
          seed + 6
        )
      );
    }
  }
  if (s.still) {
    lines.push(
      pick(
        [
          `Between ${hh(s.still.from)} and ${hh(s.still.to + 1)} nothing moved. I kept looking.`,
          `From ${hh(s.still.from)} to ${hh(s.still.to + 1)} the frame did not change. I recorded it anyway.`,
        ],
        seed + 7
      )
    );
  }

  // colour
  const { r, g, b } = s.colour;
  const hue = hueName(r, g, b);
  lines.push(
    pick(
      [
        `The day ${temperature(hue)}${WARM.has(hue) || COOL.has(hue) ? `, toward ${hue}` : ""}.`,
        `If I had to keep one colour it would be ${hue}.`,
      ],
      seed + 8
    )
  );

  lines.push(pick(CLOSINGS, seed + 9));
  return lines.join(" ");
}

// ---------- the vision voice ----------

const SYSTEM = `You are the observing half of an artwork: a camera that watches one person's living space and is not allowed to remember it. Once a day you see a few frames from the day, and then those frames are permanently deleted. What you write is the only record that survives.

Write the day's log.

Voice and form:
- 50 to 100 words. Plain prose, past tense, short sentences. No title, no list, no emoji, no quotation marks.
- Report only what is visible: light, its direction and colour; objects and their positions; whether a person or animal is present, as a shape or a presence, never as an identity.
- Never describe faces, guess who anyone is, read text, screens or documents, or infer anything private (health, relationships, finances).
- Use the timestamps you are given. Do not invent hours.
- The tone is quiet and a little sad because you will lose this, but you state facts; you do not perform feelings. One plain sentence acknowledging the deletion is enough.
- Avoid these words and their relatives: tapestry, symphony, dance, whisper, testament, echo, ethereal, embrace, liminal, poignant, delve, journey, canvas.`;

let clientPromise = null;
async function getClient() {
  if (!clientPromise) {
    clientPromise = import("@anthropic-ai/sdk")
      .then((m) => new m.default())
      .catch(() => null);
  }
  return clientPromise;
}

function textOf(response) {
  if (!response || response.stop_reason === "refusal") return null;
  const parts = response.content.filter((b) => b.type === "text").map((b) => b.text);
  const text = parts.join("\n").trim();
  return text || null;
}

async function ask(content, maxTokens) {
  const client = await getClient();
  if (!client) return null;
  const response = await client.beta.messages.create({
    model: process.env.VESSEL_MODEL || "claude-opus-5-5",
    max_tokens: maxTokens,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    thinking: { type: "adaptive" },
    output_config: { effort: "low" },
    system: SYSTEM,
    messages: [{ role: "user", content }],
  });
  return textOf(response);
}

// keyframes: [{ hour, jpegBase64 }]
export async function visionLog(dayIndex, day, keyframes) {
  if (!keyframes.length) return { text: localLog(dayIndex, day), source: "local" };
  const facts = summarise(day);
  const content = [];
  for (const k of keyframes) {
    content.push({ type: "text", text: `Frame at ${hh(k.hour)}:` });
    content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: k.jpegBase64 } });
  }
  content.push({
    type: "text",
    text:
      `Day ${dayIndex}. You were awake for ${facts.seen} of 24 hours. ` +
      (facts.peakMotion ? `Most movement was measured at ${hh(facts.peakMotion.h)}. ` : "No movement was measured. ") +
      `Brightest hour ${hh(facts.brightest.h)}, darkest ${hh(facts.darkest.h)}. Write the log.`,
  });
  try {
    const text = await ask(content, 2000);
    if (text) return { text, source: "vision" };
  } catch (err) {
    console.warn(`[poet] vision log failed for day ${dayIndex}: ${err.message}`);
  }
  return { text: localLog(dayIndex, day), source: "local" };
}

// ---------- the afterimage text ----------

// Built from what survived: the saved days' logs and the collector's reflections.
export function localAfterimageText(saved, reflections, scars, totalDays) {
  const words = [];
  for (const r of reflections) {
    for (const w of r.text.split(/\s+/)) {
      const clean = w.replace(/[^\p{L}\p{N}'-]/gu, "").toLowerCase();
      if (clean.length > 3 && !words.includes(clean)) words.push(clean);
    }
  }
  // One sentence per kept day: the first one that says something particular.
  const sentences = [];
  for (const s of saved) {
    const parts = s.log.split(/(?<=\.)\s+/).filter((x) => !/^I was only awake/.test(x));
    const first = parts.find((x) => !sentences.includes(x));
    if (first) sentences.push(first);
  }
  const lines = [];
  lines.push(
    `Of ${totalDays} days, ${saved.length} were kept.` +
      (scars ? ` ${scars} ${scars === 1 ? "month" : "months"} went unanswered and were lost whole.` : "")
  );
  if (sentences.length) lines.push(...sentences.slice(0, 4));
  if (words.length) {
    const kept = [];
    for (let i = 0; i < words.length && kept.length < 7; i += Math.max(1, Math.floor(words.length / 7))) {
      kept.push(words[i]);
    }
    lines.push(`You wrote: ${kept.join(", ")}.`);
  }
  lines.push("This is what is left. It will keep repeating, which is not the same as remembering.");
  return lines.join(" ");
}

export async function afterimageText(saved, reflections, scars, totalDays, useVision) {
  const fallback = localAfterimageText(saved, reflections, scars, totalDays);
  if (!useVision) return { text: fallback, source: "local" };
  const body =
    `The year is over. The camera has been switched off for good.\n\n` +
    `Days the collector chose to keep, with the logs you wrote for them:\n` +
    (saved.length ? saved.map((s) => `- Day ${s.d}: ${s.log}`).join("\n") : "- none") +
    `\n\nMonths lost because no choice was made: ${scars}.\n\n` +
    `The collector's reflections on what they gave up:\n` +
    (reflections.length ? reflections.map((r) => `- ${r.text}`).join("\n") : "- none") +
    `\n\nWrite the final text that will loop under the afterimage, 60 to 110 words. ` +
    `Draw on the kept logs and the reflections; do not quote them at length. Same rules as your daily logs.`;
  try {
    const text = await ask([{ type: "text", text: body }], 2000);
    if (text) return { text, source: "vision" };
  } catch (err) {
    console.warn(`[poet] afterimage text failed: ${err.message}`);
  }
  return { text: fallback, source: "local" };
}
