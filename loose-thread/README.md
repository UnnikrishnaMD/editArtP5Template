# Leaky Vessel / Loose Thread

The next work in the *Leaky Vessel* series, after [Touchpoints](../README.md). It keeps the same day, purge and 5×7 face. What changes is the material: everything is laid in fluorescent cotton thread on cloth. It is a self-contained p5.js sketch for EditART, other online generative-art platforms and gallery screens. It uses no server, camera, network or external font.

Throughout the day, people are couched onto the cloth as single continuous threads. They scroll, tap a card, hold a cup, carry something home, open a box, wait in line, reach for a shelf or push a trolley. Each person runs a sagging thread towards a touchpoint of consumer communication along the top (PUSH, FEED, RECEIPT, BILLBOARD…), or, if they speak as if they know you, towards **YOU** at the bottom. No thread arrives. The counter always reads `0 ARRIVED`.

At 23:00 the copywriter looks at what was stitched and publishes one push notification, an appliquéd patch with a **headline**, **body copy** and a **call to action**. It is written only from counts: how many came, what most of them were doing, the busiest and quietest hours, how many threads ran towards you, and how many stitches short the closest one stopped. One figure is kept: the one you pushed, or, if you pushed none, the one the system judged closest to converting. The patch says which.

At midnight every stitch is unpicked. What stays:

- the **needle holes** where the couching tacks went through,
- the **kept figure** at 60%,
- the day's **headline perforated large** across the cloth, using the holes of that slider's stitch.

Each night the holes keep 60% and the residue keeps 50%. Older pushes are listed bottom-left and lose letters each day (`1 − 0.86^age`, capped at 92%). A lost letter is left as a single hole.

Run it by serving the repository root (`python3 -m http.server`) and opening `/loose-thread/`. `./pack.sh` builds `dist/` and `loose-thread.zip` with p5 and `editartParams.js` copied in, ready to upload.

## The chain: one element per slider

| Slider | Element | What it controls |
|---|---|---|
| `m0` | Consumer culture | How many people pass through in a day (about 12–96) |
| `m1` | Parasocial connection | The share who run their thread to **YOU** instead of to a touchpoint. Their thread is always pink |
| `m2` | Common human | The busiest hour (07:00 → 23:00) and the cloth: calico, linen, denim, black cotton |
| `m3` | Advertising / communication | Which touchpoints the room is built from (screen, hand, street), and so which activities happen |
| `m4` | Typography | The stitch that puts the 5×7 face into cloth: cross, running, backstitch, satin, French knot. It is used for the touchpoints, YOU, the push and the perforated headline |

[`../docs/loose-thread-series.png`](../docs/loose-thread-series.png) holds four sliders at `0.500` and moves one per row to `0.100`, `0.500` and `0.900`. Each element has its own random stream, so moving one slider changes only that element. In the typography row the figures stay the same and only the stitch changes. Most of that change shows at 23:00 and in the holes after midnight.

## Designed to fail

- A transaction thread stops between 50% and 97% of the way, and never closer than six thread-widths.
- **Click or tap a figure to push it.** Each push halves the remaining distance. When the gap falls below 2.5 thread-widths, the thread snaps back to 22–42% and the loose end grows longer. The push log counts pushes and snaps.
- Pushing closes at 23:00.

## Rules

- **Time.** A day lasts 96 s. A fresh run, and the preview, start on day 2 at 16:00, after one simulated day, so holes, a residue and an archived push already exist. Add `?clock=local` to run on the viewer's clock (one day is one day, and stitching slows to match). Nothing is stored, so a reload starts again.
- **Determinism.** Everything depends only on `m0`–`m4` and the seed in `index.html`, except what the viewer pushes. The preview frame does not depend on timing: two loads give identical pixels (checked headless).
- `S` saves a PNG. Hovering over a figure shows its activity, time, completion and target.

All copy is original and generic. No real brands or slogans are used.

## Relation to the installation

In the installation version ([`../leaky-vessel/`](../leaky-vessel/README.md)), a camera watches the artist's room and a vision model writes the daily log before the source images are deleted. This edition simulates that loop inside the sketch, so it can run on a platform with no network. The copywriter here sees only its own stitched figures.
