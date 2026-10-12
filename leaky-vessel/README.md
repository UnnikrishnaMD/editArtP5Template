# Leaky Vessel

A durational system built to fail at perfect preservation.

A lens watches the artist's living space and never shows what it sees. A server turns each day into a short written log and then deletes that day's source images. The collector who acquires the system gets one year. At the end of each month they must keep a single day, choosing only from the logs, and every other day of that month is deleted. If they don't choose, the whole month is lost and leaves a permanent scar across the image. When the year ends, the lens shuts off for good, and the kept days plus the collector's written reflections are combined into one looping afterimage.

## How the parts fit

```
 living space                         server (artist's machine or a VPS)                  anyone
┌──────────────┐  48×36 field, 2/s  ┌──────────────────────────────────────┐  SSE    ┌─────────────────┐
│ lens.html    │ ─────────────────▶ │ clock · day aggregates               │ ──────▶ │ index.html      │
│ camera → grid│  hourly JPEG only  │ end of day: log → residue → PURGE    │         │ live element    │
│ (raw never   │  if voice=vision   │ end of month: open the ultimatum     │ ◀────── │ logs · the year │
│  leaves)     │ ─────────────────▶ │ end of year: lens off → afterimage   │ collector│ choose · reflect│
└──────────────┘                    └──────────────────────────────────────┘  key    └─────────────────┘
```

| File | Role |
|---|---|
| `server.js` | Clock, lifecycle, daily purge, monthly verdicts, the afterimage. Only uses Node's built-ins. |
| `lib/poet.js` | The daily logs. `local` writes them from measured light, movement, stillness and colour. `vision` sends a few keyframes to Claude, and falls back to `local` if that fails. |
| `public/lens.js` | p5.js. Runs on the artist's machine, reduces the camera to a 48×36 colour grid and sends only that. |
| `public/pipelines.js` | p5.js. The twelve elements, scars and the shared `Feed` that every view uses. |
| `public/series.html` | p5.js. All twelve elements side by side from the same feed. If no lens is sending, it uses a synthetic study room. |
| `public/vessel.js` | p5.js. The collector/public interface: live element, logs, the year grid, the ultimatum, relics and the afterimage. |

p5.js comes from `../p5.min.js` (v1.6.0, already in this repo). Nothing loads from the internet.

## Run it

Requires Node 20 or later.

```bash
cd leaky-vessel
npm start                 # real time: one day is one day
npm run demo              # SPEED=8640: one day lasts 10 s and the year about an hour
```

The server prints three links:

- **public view** `/`: anyone can watch, but can't act.
- **collector view** `/?key=…`: can acquire, choose and reflect.
- **lens** `/lens.html?key=…`: open this on the machine with the camera and leave it running.
- **series** `/series.html`: the twelve elements as one sheet, for studying the body of work.

Keys are generated on first run and saved in `data/keys.json`. You can also set them yourself with `COLLECTOR_KEY` and `LENS_KEY`.

### Settings (environment variables)

| Variable | Default | Meaning |
|---|---|---|
| `SPEED` | `1` | Virtual seconds per real second. Changing it between runs does not make the clock jump. |
| `GRACE_DAYS` | `7` | How long a month's choice stays open after the month ends. The next month runs meanwhile. |
| `COLLAPSE_LIMIT` | `3` | Consecutive unanswered months before the whole system fails early. |
| `POET` | `vision` if `ANTHROPIC_API_KEY` is set, else `local` | Which voice writes the logs. |
| `VESSEL_MODEL` | `claude-opus-5-5` | Model used by the vision voice. |
| `DATA_DIR` | `./data` | Where state, the day in progress, residues and the afterimage are kept. |
| `PORT` | `8080` | |

To use the vision voice, run `npm install` (it installs the optional `@anthropic-ai/sdk`) and set `ANTHROPIC_API_KEY`. Requests use the server-side refusal fallback (`fallbacks: "default"`). If a request still fails, that day's log comes from the local voice. **Privacy:** with `vision`, up to six 320×240 keyframes per day are sent to the Anthropic API. With `local`, no image ever leaves the machine. The camera grid goes only to the server.

## The rules, as implemented

**The inaccessible past.** The system starts watching before anyone owns it (phase `pre`). Those days are written and purged like any other, but no residue is kept. Their logs then lose letters on disk, about 1% per day, up to 92%. The erased letters are overwritten in `state.json` and cannot be recovered. The browser draws them as hairlines.

**Every day.** The lens sends a 48×36 field twice a second. The server records light, movement, the position of the light and the movement, colour, and the first field of each hour. When the day ends, it writes the log, keeps the 24 hourly fields as that day's *residue* (only during the collector's year), and deletes the day's source folder.

**Every month.** Months follow the calendar from the day of acquisition. When a month ends, the collector sees only that month's logs and keeps one day. That day's residue stays. The others are deleted from disk at once, and their logs begin to erode 30 days later. A kept day can be replayed, as 24 frames, through the element of the month it came from. Residues of days that weren't kept are never served, not even to the collector.

**Inaction.** If the grace period runs out, every day of the month is deleted and a scar is added: a dead band drawn across every later image, including the afterimage. If `COLLAPSE_LIMIT` months in a row go unanswered, the system **collapses**: the lens stops at once and all unresolved months are lost.

**The end.** The lifecycle is fixed when the system is acquired: twelve calendar months, and `acquire` refuses a second call. When the year ends, the server deletes all source data and rejects the lens. The last month's choice stays open for its grace period. After that, the server builds `afterimage.json` from the kept residues, the logs of kept days, the scars and the collector's reflections. Writing that file *absorbs* the reflections: they are removed from the state and exist only inside the afterimage. The afterimage text is written by the selected voice. The interface then loops the result forever.

## The twelve elements

Each month of the year isolates one element of the same source, so the year forms a series of twelve related works with one grid, one ground colour and one ink colour.

| Month | Element | What remains |
|---|---|---|
| 01 | LIGHT | Luminance only, in seven tones |
| 02 | COLOUR | Hue without light, column by column |
| 03 | MOTION | Only what changed |
| 04 | CONTOUR | Edges as strokes along light/dark boundaries |
| 05 | DURATION | A long exposure: anything brief never registers |
| 06 | GRAIN | Tone as the density of points |
| 07 | INTERVAL | One vertical slit of the room, through time |
| 08 | STILLNESS | Only what did not move |
| 09 | MASS | Twenty-four weighted circles |
| 10 | TEXT | The room set in the letters of the latest log, sized by light |
| 11 | EROSION | Cells drop out as the month runs down |
| 12 | AFTERIMAGE | The complement of the long exposure |

The afterimage replays each kept day through its own month's element, over the screen-blended complement of every kept frame, with the reflections drifting across in italic. Scars from lost months cut through all of it.

## Limits

- The lens only observes while `lens.html` is open and the camera is available. Days without any frames get a log saying so, and those days can still be chosen.
- Day boundaries are the server's local midnight. Daylight-saving changes are not handled.
- This is one server for one collector. A marketplace or token sale would sit in front of `/api/acquire`. It isn't included here.
