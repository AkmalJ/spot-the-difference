[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/AkmalJ/spot-the-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/AkmalJ/spot-the-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

# Pasar Perbedaan — Spot the Difference

An original spot-the-difference game built for make.fun's
["Make the best spot the difference game"](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
bounty ($50). Two near-identical pictures side by side, drawn in the
browser as inline SVG from one scene definition — the right panel applies
ten quiet changes. Click a difference on either picture and both are
ringed with a gold marker.

## The scenes

1. **Night Market** — a pasar malam under string lights: a sate stall
   whose sign gets repainted, a rooftop cat, a lantern that changes colour.
2. **Harbor at Dawn** — fishing boats, a lighthouse whose beam goes dark,
   a rope coil that becomes a bucket.
3. **Mountain Village** — laundry day under the peaks: a wandering goat,
   picked apples, a chimney that stops smoking.

Every scene hides exactly 10 differences: things missing, things added,
colours changed, sizes changed, a swapped detail, a repainted sign.

## How to play

- Click a difference on **either** picture; both panels get the ring.
- The HUD counter reads `3 / 10 found · 7 to go`, with a progress bar and
  a running clock.
- A wrong click shakes the panel, flashes a red X and adds **+5 seconds**.
- **Hint** (3 per scene) pulses an unfound difference. Keys: **H** hint,
  **R** restart.
- Find all 10 for the win card: time, mistakes, hints used and a score
  out of 1000.
- Sounds are synthesized with the Web Audio API — no audio files.

Demo states (also used for the entry screenshots):
`?demo=mid` (scene 1, three found), `?demo=scene2` (scene 2, fresh),
`?demo=win` (scene 1 win card). No parameter shows the title screen.

## Run it locally

```sh
node serve.ts            # serves game/ at http://localhost:8080
```

No build step, no network: every file the game loads lives under `game/`.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory and
writes `dossier.json` with `buildDossier` from `vendor/makefun-game.ts`
(the kit's library, vendored unchanged).

## Layout

- `game/index.html` — the page frame: HUD, twin panels, title and win overlays
- `game/css/style.css` — layout, markers, animations
- `game/js/scenes.js` — the three scenes and their SVG builders
- `game/js/differences.js` — the difference tables and click hit-testing
- `game/js/game.js` — state, input, HUD, timer, scoring, demo states
- `game/js/audio.js` — WebAudio sound effects
- `main.ts` — the hand-in program · `serve.ts` — local static server

MIT licensed — see `LICENSE`.
