# Leaky Vessel / Touchpoints

**Platform edition** of *Leaky Vessel*: a self-contained p5.js work for EditART and other online generative-art platforms and gallery screens. No server, camera, network or external font is used. The installation version, which watches a real room and runs for one year, is in [`leaky-vessel/`](leaky-vessel/README.md). The next work in the series, in fluorescent thread, is [`loose-thread/`](loose-thread/README.md).

A day of consumer communication reaches a room: push notifications, feeds, receipts, packaging, radio, posters, billboards and shop signs. None of it is shown as written. Each message arrives already transmuted into an abstraction made from its own letterforms. At 23:00 the system writes one log about what it measured. At midnight the day's marks are purged, half of the accumulated residue leaks away, and only a faint trace survives, plus the one mark the viewer chose to hold. Older logs lose letters each day and are gone after sixteen days.

Run it: serve this folder (for example `python3 -m http.server`) and open `index.html`. EditART passes the sliders as `?m0=0.500&m1=…&m4=0.500`.

## The chain: one element per slider

| Slider | Element | What it controls |
|---|---|---|
| `m0` | Consumer culture | How many messages reach the room in a day (about 16–200) |
| `m1` | Parasocial connection | The share of messages that talk as if they know you. These are set in the accent colour, slightly larger and nearer the centre |
| `m2` | Common human | The person's daily rhythm (the busiest hour runs from 07:00 to 23:00) and the light they live in (four grounds, from paper to night screen) |
| `m3` | Advertising / communication | Which touchpoints dominate: screen, hand (receipts, packaging, radio) or street (posters, billboards, signs). Street messages are set at up to 4.5× size |
| `m4` | Typography | The transmutation: SLICE, OVERPRINT, CONSTELLATION, SEDIMENT or BARCODE |

The final work is the composite.

## The face and the five operations

Every mark and every log is set in a 5×7 face drawn for this work, so the abstraction and the text describing it share one letterform. Before anything is drawn, each message is laid out in that face and then:

- **SLICE**: each row of modules shifts on a wave plus a per-row jump of at least 3 modules, so letters shear apart.
- **OVERPRINT**: the letters of a line collapse onto each other. Tone becomes density.
- **CONSTELLATION**: only stroke ends and junctions are kept, displaced vertically and joined left to right like a signal.
- **SEDIMENT**: every module falls to the floor, so the message becomes a quantity per column.
- **BARCODE**: each column of the letters becomes a bar, as wide as the column is full.

The raw message text is never drawn. Hovering over a mark shows only metadata: the channel, the time and the character count.

## Rules

- **Time.** A day lasts 96 s. A fresh run, and the platform preview, start on day 2 at 16:00, after one simulated day, so an archived log and residue already exist. With `?clock=local`, the work runs on the viewer's local clock (one day is one day) for gallery screens. Nothing is stored, so a reload starts from that day's state.
- **Hold.** Before 23:00 the viewer can click or tap one mark to hold it. Clicking it again releases it, and clicking another mark replaces it. The held mark goes into the residue at full strength, and the log notes the choice without saying what was held.
- **Log.** Written at 23:00 from counts: messages, how many addressed "you", busiest and quietest hour, the dominant channel, a repeated word, and whether anything was held. Messages after 23:00 are not counted.
- **Purge.** At midnight the day's marks dissolve block by block. The residue keeps 50% of what it held, loses about 7% of its blocks completely, then takes 16% of the day plus the held mark.
- **Erosion.** An archived log loses `1 − 0.86^age` of its letters (14% after one day, 84% after twelve, capped at 92%). Lost letters show as hairlines.
- **Determinism.** Everything shown depends only on `m0`–`m4` and the seed in `index.html`. The only exception is the viewer's hold. The preview frame does not depend on timing: two loads produce the same pixels.
- `S` saves a PNG.

## A series, one element at a time

[`docs/series-sheet.png`](docs/series-sheet.png) holds every slider at `0.500` and moves one element per row to `0.100`, `0.500` and `0.900`: consumer culture, then parasocial, common human, advertising and typography. To build an edition the same way, fix four sliders and move only the fifth. For example:

```
?m0=0.100&m1=0.500&m2=0.500&m3=0.500&m4=0.500   I   consumer culture, sparse
?m0=0.900&m1=0.500&m2=0.500&m3=0.500&m4=0.500   I   consumer culture, saturated
?m0=0.500&m1=0.900&m2=0.500&m3=0.500&m4=0.500   II  parasocial, almost all "you"
?m0=0.500&m1=0.500&m2=0.900&m3=0.500&m4=0.500   III common human, a night life
?m0=0.500&m1=0.500&m2=0.500&m3=0.900&m4=0.500   IV  advertising, the street
?m0=0.500&m1=0.500&m2=0.500&m3=0.500&m4=0.900   V   typography, barcode
```

All advertising copy in the work is original and generic. No real brands or slogans are used.

---

# EditART p5.js template notes

This is a template for p5.js for creating projects on EditART.

## Create your art

-   Use the variables `m0`, `m1`, `m2`, `m3`, `m4` which are tha values of the 5 sliders.
    > **_IMPORTANT:_** Every single part of the output must ONLY depend on the values `m0`..`m4`. Otherwise the pieces will change after minting.
-   The entrypoint is the `draw()` function which will be triggered automatically everytime the sliders change. Everything necessary for the sketch to render properly should be initialized in `draw()`. Find an example in `index.js`.
-   Call `triggerPreview()` at the point in time when the preview image should be renderd.
-   To handle window resizing please do everything necessary in `windowResizedUser()`. Do not overwrite `windowResized()` unless you know exactly what you are doing.
-   If your project is animated, please restart the animation when the sliders change. You can do this as follows:

    ```
    function draw() {
        if(resetAnimation) {
            // Do necessary steps to reset the animation
            resetAnimation = false;
        }
        // Rest of the draw() function
    }
    ```

-   If you use any libraries, include all source files in the project. Do not load any dependencies from the internet.

-   Make a sketch that **renders fast** for the best user experience.

## Randomness

If you need randomness, you can use the functions `randomM0()`..`randomM4()`
these functions provide randomness seeded by the respective values `m0`..`m4`.

> **_NOTE:_** You can set the `randomSeedEditArt` variable in `index.html` to any string you like in order to distinguish your randomness from the one of other projects.

> **_IMPORTANT:_** Don't use any source of randomness other than the one described above. 

## Sliderless Mode

If you want to use the sliderless feature as can be seen in [this example](https://www.editart.xyz/series/KT1VwpEbuWsxevM9JGF9dG5JXT4bmpNDYp3h), you can simply use `randomFull()` as your randomness function and test in the [sliderless sandbox](https://www.editart.xyz/sandbox?sliderLess=true).

## Testing

In order to test your project with the EditART platform, start a local development server of your project and paste its address in [the sandbox](https://www.editart.xyz/sandbox) and you can start playing around with the sliders.

## Project ready or questions?

Is you have a finished project or any questions, send me a DM on twitter [@pifragile](https://twitter.com/pifragile). Looking forward to hearing from you!

## License

[MIT License](./LICENSE)
