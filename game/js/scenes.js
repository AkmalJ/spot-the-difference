// scenes.js — the three scenes of Pasar Perbedaan and the SVG builders
// that draw them. Every scene is drawn twice from this same code: the
// left panel with an empty difference set, the right panel with every
// difference applied. A difference is a single branch inside a builder,
// keyed by its id (the ids live in differences.js). Everything is inline
// SVG built from strings: no images, no fonts, no network.
//
// Scene coordinates are a 600 x 600 viewBox shared by both panels.

export const SCENE_WIDTH = 600;
export const SCENE_HEIGHT = 600;

export const SCENES = [
  { id: 'night-market', name: 'Night Market', subtitle: 'Pasar malam under the string lights' },
  { id: 'harbor-dawn', name: 'Harbor at Dawn', subtitle: 'Pelabuhan pagi, first boats out' },
  { id: 'mountain-village', name: 'Mountain Village', subtitle: 'Desa di lereng, laundry day' },
];

// ---------- tiny SVG fragment helpers ----------

const rect = (x, y, w, h, fill, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const circle = (cx, cy, r, fill, extra = '') =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
const ellipse = (cx, cy, rx, ry, fill, extra = '') =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const polygon = (points, fill, extra = '') =>
  `<polygon points="${points}" fill="${fill}" ${extra}/>`;
const path = (d, fill, extra = '') =>
  `<path d="${d}" fill="${fill}" ${extra}/>`;
const line = (x1, y1, x2, y2, stroke, width, extra = '') =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
const text = (x, y, str, size, fill, extra = '') =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-family="Verdana, Geneva, sans-serif" ${extra}>${str}</text>`;

// Deterministic scatter: the same seed gives the same points on both
// panels, so stars and flowers never become accidental differences.
function scatter(seed, count) {
  const points = [];
  let state = seed >>> 0;
  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  for (let i = 0; i < count; i++) points.push([next(), next()]);
  return points;
}

// A standing person silhouette: head, shoulders, body. `hat` is a fill
// colour for a simple cap, or null for bare-headed.
function person(x, y, scale, colour, hat = null) {
  const head = circle(x, y - 34 * scale, 10 * scale, colour);
  const body = path(
    `M ${x - 15 * scale} ${y} L ${x - 11 * scale} ${y - 26 * scale} ` +
    `Q ${x} ${y - 33 * scale} ${x + 11 * scale} ${y - 26 * scale} L ${x + 15 * scale} ${y} Z`,
    colour,
  );
  const cap = hat === null ? '' :
    rect(x - 11 * scale, y - 46 * scale, 22 * scale, 6 * scale, hat, 'rx="3"') +
    rect(x - 7 * scale, y - 56 * scale, 14 * scale, 11 * scale, hat, 'rx="3"');
  return body + head + cap;
}

// A hanging paper lantern with a warm glow.
function lantern(cx, cy, colour) {
  return (
    circle(cx, cy, 25, colour, 'opacity="0.16"') +
    rect(cx - 11, cy - 14, 22, 28, colour, 'rx="9" stroke="#0a0c1e" stroke-width="1.5"') +
    rect(cx - 6, cy - 19, 12, 6, '#0a0c1e') +
    line(cx - 11, cy, cx + 11, cy, '#0a0c1e', 1.2, 'opacity="0.35"')
  );
}

// ---------- Scene 1: Night Market ----------

function buildNightMarket(diffs, p) {
  const s = [];
  s.push(`<defs>
    <linearGradient id="${p}-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#131a3a"/><stop offset="0.55" stop-color="#3b2358"/>
      <stop offset="1" stop-color="#6e3560"/>
    </linearGradient>
  </defs>`);
  s.push(rect(0, 0, 600, 600, `url(#${p}-sky)`));

  // Stars, identical on both panels, spread through the taller sky.
  for (const [i, [a, b]] of scatter(11, 60).entries()) {
    s.push(circle(Math.round(a * 596) + 2, Math.round(b * 215) + 4, 0.9 + (i % 3) * 0.55, '#ffffff', `opacity="${0.5 + (i % 4) * 0.13}"`));
  }
  // Difference: an extra bright star on the right.
  if (diffs.has('extra-star')) {
    s.push(line(150, 47, 150, 65, '#ffffff', 1.6) + line(141, 56, 159, 56, '#ffffff', 1.6) + circle(150, 56, 2.8, '#ffffff'));
  }

  // Difference: crescent moon on the left, full moon on the right.
  if (diffs.has('moon-shape')) {
    s.push(circle(520, 66, 21, '#f7d774') + circle(512, 58, 4, '#e8c55c') + circle(528, 74, 3, '#e8c55c') + circle(522, 52, 2.4, '#e8c55c'));
  } else {
    s.push(path('M 520 45 A 21 21 0 1 0 520 87 A 25 21 0 1 1 520 45 Z', '#f7d774'));
  }

  // String lights across the top of the market.
  s.push(path('M -5 96 Q 150 132 305 102 T 605 94', 'none', 'stroke="#05070f" stroke-width="2" opacity="0.6" fill="none"'));
  const bulbs = [[30, 106], [75, 115], [120, 119], [165, 118], [210, 112], [255, 106], [300, 104], [345, 106], [390, 111], [435, 116], [480, 118], [525, 115], [565, 108]];
  for (const [i, [bx, by]] of bulbs.entries()) {
    // Difference: one bulb is missing on the right.
    if (diffs.has('bulb-missing') && i === 6) continue;
    s.push(line(bx, by - 4, bx, by + 2, '#05070f', 1.5) + circle(bx, by + 6, 8, '#ffd98a', 'opacity="0.22"') + circle(bx, by + 6, 3.8, '#ffd98a'));
  }
  // A second, lower string of smaller bulbs, identical on both panels.
  s.push(path('M -5 168 Q 160 202 320 178 T 605 166', 'none', 'stroke="#05070f" stroke-width="1.6" opacity="0.5" fill="none"'));
  for (const [bx, by] of [[40, 176], [95, 186], [150, 190], [205, 188], [260, 182], [315, 178], [370, 180], [425, 185], [480, 188], [535, 184], [575, 176]]) {
    s.push(line(bx, by - 3, bx, by + 1, '#05070f', 1.2) + circle(bx, by + 4, 5, '#ffd98a', 'opacity="0.2"') + circle(bx, by + 4, 2.6, '#ffd98a'));
  }

  // Rooftop silhouette behind the stalls, with lit windows.
  s.push(polygon('0,300 0,262 70,262 70,244 120,244 120,262 210,262 210,250 300,250 300,268 395,268 395,252 470,252 470,270 600,270 600,300', '#0c1030'));
  s.push(rect(88, 272, 8, 10, '#ffca7a', 'opacity="0.85"') + rect(232, 274, 8, 10, '#ffca7a', 'opacity="0.7"') +
         rect(420, 278, 8, 10, '#ffca7a', 'opacity="0.8"') + rect(505, 280, 8, 10, '#ffca7a', 'opacity="0.65"'));

  // Difference: the cat on the middle roof is gone on the right.
  if (!diffs.has('cat-missing')) {
    s.push(ellipse(312, 241, 13, 7.5, '#05070f') +
      circle(299, 233, 6.5, '#05070f') +
      polygon('294,229 296,220 300,227', '#05070f') + polygon('301,227 306,221 306,230', '#05070f') +
      path('M 324 238 Q 336 230 333 216', 'none', 'stroke="#05070f" stroke-width="3.5" fill="none" stroke-linecap="round"'));
  }

  // Stall A (left): the sate stall.
  s.push(rect(44, 312, 8, 158, '#4a2f1d') + rect(190, 312, 8, 158, '#4a2f1d'));
  s.push(polygon('30,318 212,318 196,278 46,278', '#d6455b'));
  s.push(polygon('78,278 100,278 108,318 82,318', '#f7ead9') + polygon('126,278 148,278 156,318 130,318', '#f7ead9') + polygon('174,278 196,278 204,318 178,318', '#f7ead9'));
  // Difference: the sign reads SATE on the left, SOTO on the right.
  s.push(rect(74, 330, 104, 27, '#20304f', 'rx="4" stroke="#ffd23f" stroke-width="1.5"'));
  s.push(text(126, 349, diffs.has('sign-text') ? 'SOTO' : 'SATE', 17, '#ffd23f', 'text-anchor="middle" font-weight="bold" letter-spacing="3"'));
  // The vendor, hat colour is a difference.
  s.push(person(95, 430, 1.05, '#1d1430', diffs.has('hat-color') ? '#37d67a' : '#ffd23f'));
  s.push(rect(40, 425, 168, 15, '#7a4a2b') + rect(40, 440, 168, 60, '#5d3a22'));
  s.push(line(40, 459, 208, 459, '#4a2c17', 2) + line(40, 479, 208, 479, '#4a2c17', 2));
  s.push(rect(56, 403, 16, 22, '#9fd8e8', 'opacity="0.85" rx="3"') + rect(78, 407, 13, 18, '#ffd98a', 'opacity="0.85" rx="3"'));
  // Difference: the fruit pile is oranges on the left, apples on the right.
  const fruit = diffs.has('fruit-color') ? '#e23b3b' : '#f59e0b';
  s.push(circle(152, 417, 9, fruit) + circle(168, 415, 10, fruit) + circle(160, 404, 9, fruit) + circle(179, 419, 8, fruit) + circle(142, 421, 7, fruit));
  if (diffs.has('fruit-color')) s.push(path('M 160 395 Q 166 387 174 390 Q 168 397 160 395 Z', '#3f9e4d'));

  // The lantern on its pole between stalls A and B; colour is a difference.
  s.push(line(222, 268, 222, 452, '#05070f', 4) + line(222, 268, 222, 246, '#05070f', 2));
  s.push(lantern(222, 262, diffs.has('lantern-color') ? '#2fd4c4' : '#e23b3b'));

  // Stall B (middle): snacks and clay pots.
  s.push(rect(246, 312, 8, 158, '#4a2f1d') + rect(382, 312, 8, 158, '#4a2f1d'));
  s.push(polygon('232,318 404,318 388,278 248,278', '#1f9e8f'));
  s.push(polygon('282,278 304,278 312,318 286,318', '#0f6e62', 'opacity="0.85"') + polygon('330,278 352,278 360,318 334,318', '#0f6e62', 'opacity="0.85"'));
  s.push(path('M 246 336 Q 318 358 390 336', 'none', 'stroke="#05070f" stroke-width="1.6" fill="none"'));
  // Pennant flags; the middle one's colour is a difference.
  const flagColours = ['#ffd23f', '#ff5da2', diffs.has('flag-swap') ? '#39c2ff' : '#e23b3b', '#37d67a', '#ff8c42'];
  [258, 284, 310, 336, 362].forEach((fx, i) => {
    s.push(polygon(`${fx},341 ${fx + 17},343 ${fx + 8},361`, flagColours[i]));
  });
  s.push(person(320, 430, 1.05, '#241536'));
  s.push(rect(242, 425, 152, 15, '#7a4a2b') + rect(242, 440, 152, 60, '#54402a'));
  s.push(ellipse(272, 414, 14, 10, '#b5651d') + ellipse(298, 418, 11, 8, '#a0522d') + ellipse(272, 408, 9, 4, '#8a4a1f'));
  s.push(path('M 332 413 A 13 7 0 0 1 358 413 Z', '#e8e3d5') + path('M 334 405 A 11 6 0 0 1 356 405 Z', '#d6455b') + path('M 336 398 A 9 5 0 0 1 354 398 Z', '#39c2ff'));
  for (let i = 0; i < 4; i++) s.push(ellipse(380, 352 + i * 9, 3.4, 5.5, '#e23b3b'));

  // Stall C (right): toys and balloons.
  s.push(rect(424, 312, 8, 158, '#4a2f1d') + rect(560, 312, 8, 158, '#4a2f1d'));
  s.push(polygon('410,318 582,318 566,278 426,278', '#7c4dff'));
  s.push(polygon('462,278 484,278 492,318 466,318', '#5a34c4') + polygon('510,278 532,278 540,318 514,318', '#5a34c4'));
  s.push(rect(420, 425, 152, 15, '#7a4a2b') + rect(420, 440, 152, 60, '#46323f'));
  // Pinwheels on the counter.
  for (const [px, py, c1, c2] of [[447, 352, '#ffd23f', '#ff5da2'], [540, 346, '#39c2ff', '#37d67a']]) {
    s.push(line(px, py, px + 5, 425, '#0a0c1e', 2.5) +
      polygon(`${px},${py} ${px + 12},${py - 4} ${px + 3},${py + 5}`, c1) +
      polygon(`${px},${py} ${px - 4},${py + 12} ${px + 3},${py + 5}`, c2) +
      polygon(`${px},${py} ${px - 12},${py + 3} ${px + 3},${py + 5}`, c1) +
      polygon(`${px},${py} ${px + 4},${py - 12} ${px + 3},${py + 5}`, c2));
  }
  s.push(circle(470, 414, 9, '#ffd23f') + rect(492, 403, 20, 20, '#ff8c42', 'rx="3"') + polygon('548,425 560,403 572,425', '#2fd4c4'));
  // The child with balloons; the pink balloon is a difference.
  s.push(line(520, 444, 524, 282, '#c9c2ae', 1.4) + line(520, 444, 498, 300, '#c9c2ae', 1.4) + line(520, 444, 548, 304, '#c9c2ae', 1.4));
  if (!diffs.has('balloon-missing')) s.push(ellipse(498, 284, 13, 16, '#ff5da2'));
  s.push(ellipse(524, 268, 12, 15, '#ffd23f') + ellipse(548, 288, 12, 15, '#39c2ff'));
  s.push(person(520, 492, 0.92, '#101736'));

  // Shoppers in front of the stalls.
  s.push(person(250, 520, 1.25, '#0a0c1e'));
  s.push(person(452, 522, 1.18, '#0a0c1e'));

  // Ground and pools of lamplight.
  s.push(rect(0, 512, 600, 88, '#0a0d24'));
  s.push(ellipse(122, 528, 96, 13, '#ffd98a', 'opacity="0.10"') + ellipse(314, 530, 92, 13, '#ffd98a', 'opacity="0.09"') + ellipse(500, 528, 92, 13, '#ffd98a', 'opacity="0.10"'));

  // Foreground dressing along the bottom, identical on both panels:
  // stacked crates, a striped rug, fruit baskets and a second cat.
  s.push(rect(150, 556, 180, 10, '#7c2d4e', 'opacity="0.85"') + rect(150, 570, 180, 6, '#2d4a7c', 'opacity="0.8"'));
  s.push(rect(26, 524, 38, 28, '#6e4525') + line(26, 538, 64, 538, '#4a2c17', 2));
  s.push(rect(16, 552, 46, 42, '#5d3a22') + line(16, 566, 62, 566, '#4a2c17', 2) + line(16, 580, 62, 580, '#4a2c17', 2));
  s.push(ellipse(368, 566, 26, 12, '#b5651d') + ellipse(368, 558, 26, 7, '#8a4a1f') +
         circle(356, 552, 6, '#e23b3b') + circle(368, 549, 6, '#f59e0b') + circle(380, 552, 6, '#e23b3b'));
  s.push(ellipse(410, 578, 20, 9, '#a0522d') + ellipse(410, 572, 20, 5, '#8a4a1f'));
  s.push(ellipse(548, 572, 17, 10, '#05070f') + circle(530, 560, 8, '#05070f') +
    polygon('524,556 525,547 530,554', '#05070f') + polygon('533,554 539,548 539,557', '#05070f') +
    path('M 564 570 Q 578 562 574 548', 'none', 'stroke="#05070f" stroke-width="3.5" fill="none" stroke-linecap="round"'));
  return s.join('\n');
}

// ---------- Scene 2: Harbor at Dawn ----------

function cloud(x, y, scale, opacity) {
  return (
    ellipse(x, y, 34 * scale, 13 * scale, '#ffffff', `opacity="${opacity}"`) +
    ellipse(x - 20 * scale, y + 4 * scale, 20 * scale, 9 * scale, '#ffffff', `opacity="${opacity}"`) +
    ellipse(x + 21 * scale, y + 4 * scale, 22 * scale, 10 * scale, '#ffffff', `opacity="${opacity}"`)
  );
}

function gull(x, y) {
  return path(`M ${x - 11} ${y} Q ${x - 5} ${y - 7} ${x} ${y} Q ${x + 5} ${y - 7} ${x + 11} ${y}`, 'none',
    'stroke="#20344f" stroke-width="2.2" fill="none" stroke-linecap="round"');
}

function buildHarborDawn(diffs, p) {
  const s = [];
  s.push(`<defs>
    <linearGradient id="${p}-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2c4a77"/><stop offset="0.62" stop-color="#b8576b"/>
      <stop offset="1" stop-color="#f7a56b"/>
    </linearGradient>
    <linearGradient id="${p}-sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1d5f7a"/><stop offset="1" stop-color="#0d3550"/>
    </linearGradient>
  </defs>`);
  s.push(rect(0, 0, 600, 330, `url(#${p}-sky)`));
  s.push(rect(0, 328, 600, 272, `url(#${p}-sea)`));

  // Difference: the sun is bigger on the right.
  const sunR = diffs.has('sun-size') ? 37 : 26;
  s.push(circle(470, 312, sunR + 20, '#ffd66e', 'opacity="0.3"') + circle(470, 312, sunR, '#ffd66e') + circle(470, 312, sunR * 0.68, '#ffe9a3'));

  s.push(cloud(120, 64, 1, 0.9) + cloud(300, 120, 0.7, 0.8) + cloud(520, 150, 0.8, 0.65));
  // Difference: the small cloud is gone on the right.
  if (!diffs.has('cloud-missing')) s.push(cloud(420, 74, 0.62, 0.85));

  s.push(gull(96, 100) + gull(214, 112));
  // Difference: the middle gull is gone on the right.
  if (!diffs.has('gull-missing')) s.push(gull(150, 86));

  // A distant boat on the horizon, identical on both panels.
  s.push(path('M 332 322 L 378 322 L 370 330 L 340 330 Z', '#20344f', 'opacity="0.8"') +
    line(355, 322, 355, 296, '#20344f', 2.5) +
    polygon('355,300 355,320 372,320', '#f2ede2', 'opacity="0.85"') +
    polygon('355,306 355,320 342,320', '#f2ede2', 'opacity="0.7"'));

  // The lighthouse on its rocks.
  // Difference: the lamp's beam shines on the left only.
  if (!diffs.has('lighthouse-beam')) s.push(polygon('94,218 300,172 300,232', '#ffe98a', 'opacity="0.30"'));
  s.push(polygon('18,452 60,420 105,426 142,452 138,474 24,474', '#3a3f4a'));
  s.push(polygon('52,438 84,416 118,440 110,458 60,458', '#2e333d'));
  s.push(polygon('66,422 74,238 98,238 106,422', '#f2ede2'));
  s.push(polygon('70,330 102,330 104,352 69,352', '#d6455b') + polygon('72,280 100,280 101,302 71,302', '#d6455b'));
  s.push(rect(68, 212, 36, 26, '#22304a') + circle(86, 225, 8, diffs.has('lighthouse-beam') ? '#c9b458' : '#ffe98a'));
  s.push(polygon('64,212 86,196 108,212', '#d6455b'));

  // Sun glitter on the water.
  [348, 364, 382, 402, 424].forEach((wy, i) => {
    const w = 44 - i * 6;
    s.push(line(470 - w / 2, wy, 470 + w / 2, wy, '#ffd66e', 3, 'opacity="0.45" stroke-linecap="round"'));
  });
  // Reflections of the lighthouse lamp and the two hulls.
  s.push(line(70, 486, 104, 486, '#ffe98a', 3, 'opacity="0.16" stroke-linecap="round"') +
         line(76, 500, 98, 500, '#ffe98a', 3, 'opacity="0.16" stroke-linecap="round"') +
         line(72, 514, 100, 514, '#ffe98a', 3, 'opacity="0.16" stroke-linecap="round"'));
  s.push(ellipse(268, 428, 66, 6, '#7a4a2b', 'opacity="0.25"') + ellipse(475, 440, 70, 6, '#14666b', 'opacity="0.25"'));
  // Wave strokes.
  for (const [wx, wy] of [[150, 372], [330, 392], [520, 378], [90, 428], [430, 448], [210, 478], [540, 492], [120, 512], [360, 540], [250, 562], [480, 556]]) {
    s.push(path(`M ${wx} ${wy} q 12 -6 24 0 t 24 0`, 'none', 'stroke="#bfeaff" stroke-width="2" opacity="0.3" fill="none" stroke-linecap="round"'));
  }

  // Boat 1: the fishing boat with the big sail.
  // Difference: its sail is white on the left, warm cream on the right.
  s.push(line(268, 380, 268, 218, '#3a2a18', 4));
  s.push(polygon('268,228 268,372 332,372', diffs.has('sail-color') ? '#ffe9a3' : '#ffffff'));
  s.push(polygon('268,246 268,372 224,372', '#eef3f6', 'opacity="0.95"'));
  // Difference: the mast flag is gone on the right.
  if (!diffs.has('flag-missing')) s.push(polygon('268,218 293,224 268,231', '#e23b3b'));
  s.push(path('M 196 386 L 340 386 L 322 414 L 214 414 Z', '#7a4a2b') + rect(192, 379, 152, 8, '#5d3a22', 'rx="3"'));
  s.push(person(238, 384, 0.52, '#20344f'));

  // Boat 2: teal hull, striped sail.
  s.push(line(486, 380, 486, 262, '#3a2a18', 4));
  s.push(polygon('486,270 486,374 542,374', '#ffd23f'));
  s.push(polygon('486,296 486,316 518,374 498,374', '#e2703a') + polygon('486,330 486,344 532,374 520,374', '#e2703a'));
  s.push(polygon('486,262 504,267 486,273', '#39c2ff'));
  s.push(rect(452, 382, 44, 20, '#f2ede2') + rect(448, 376, 52, 8, '#d6455b', 'rx="3"'));
  s.push(path('M 402 400 L 548 400 L 530 426 L 420 426 Z', '#14666b') + rect(398, 393, 154, 8, '#0d4a4e', 'rx="3"'));

  // Difference: the jumping fish is gone on the right (ripples stay).
  s.push(ellipse(180, 428, 26, 5, '#dff6ff', 'opacity="0.35"'));
  if (!diffs.has('fish-missing')) {
    s.push(path('M 156 410 Q 180 390 206 408 Q 192 417 180 418 Q 168 417 156 410 Z', '#9fd8e8') +
      polygon('156,410 143,399 146,421', '#7fc4dd') + circle(196, 406, 2.2, '#20344f') +
      path('M 158 426 q 6 -8 12 0 M 184 428 q 6 -8 12 0', 'none', 'stroke="#dff6ff" stroke-width="2" fill="none"'));
  }

  // The buoy; its top band colour is a difference.
  s.push(ellipse(372, 449, 17, 4.5, '#0d3550', 'opacity="0.55"'));
  s.push(rect(360, 420, 24, 27, '#f2ede2', 'rx="6"'));
  s.push(rect(360, 420, 24, 11, diffs.has('buoy-color') ? '#37d67a' : '#e23b3b', 'rx="5"'));
  s.push(line(372, 420, 372, 407, '#22304a', 3) + circle(372, 403, 4, '#ffe98a'));

  // Foreground rowboat.
  s.push(path('M 232 500 L 332 500 L 316 522 L 248 522 Z', '#8a5a33') + rect(262, 502, 40, 5, '#6e4525'));
  s.push(line(298, 508, 340, 488, '#c9a06a', 3, 'stroke-linecap="round"'));

  // The dock, bottom left, with a barrel standing on its planks.
  s.push(rect(12, 494, 10, 106, '#4a2f1d') + rect(160, 494, 10, 106, '#4a2f1d'));
  s.push(rect(0, 506, 186, 10, '#6b4a2f') + rect(0, 520, 186, 10, '#5d3a22') + rect(0, 534, 186, 14, '#6b4a2f'));
  s.push(ellipse(166, 478, 17, 9, '#8a5a33') + rect(149, 478, 34, 30, '#8a5a33') + ellipse(166, 508, 17, 9, '#6e4525') +
         line(149, 488, 183, 488, '#5d3a22', 2) + line(149, 498, 183, 498, '#5d3a22', 2));
  // Difference: an anchor leans on the dock on the right only.
  if (diffs.has('anchor-added')) {
    s.push(circle(56, 490, 6, 'none', 'stroke="#1c2436" stroke-width="5"') +
      line(56, 496, 56, 532, '#1c2436', 5) + line(41, 507, 71, 507, '#1c2436', 5) +
      path('M 38 520 Q 56 544 74 520', 'none', 'stroke="#1c2436" stroke-width="5" fill="none" stroke-linecap="round"'));
  }
  // Difference: a coil of rope on the left, a red bucket on the right.
  if (diffs.has('coil-to-bucket')) {
    s.push(polygon('114,500 146,500 141,530 119,530', '#d6455b') +
      path('M 114 500 Q 130 483 146 500', 'none', 'stroke="#8a2436" stroke-width="3" fill="none"'));
  } else {
    s.push(ellipse(130, 512, 20, 6, 'none', 'stroke="#c9a06a" stroke-width="3"') +
      ellipse(130, 519, 16, 5, 'none', 'stroke="#c9a06a" stroke-width="3"') +
      ellipse(130, 526, 12, 4, 'none', 'stroke="#c9a06a" stroke-width="3"'));
  }
  return s.join('\n');
}

// ---------- Scene 3: Mountain Village ----------

function pine(x, y, scale) {
  return (
    rect(x - 3 * scale, y - 12 * scale, 6 * scale, 12 * scale, '#5d3a22') +
    polygon(`${x - 20 * scale},${y - 10 * scale} ${x + 20 * scale},${y - 10 * scale} ${x},${y - 44 * scale}`, '#2e6b34') +
    polygon(`${x - 15 * scale},${y - 30 * scale} ${x + 15 * scale},${y - 30 * scale} ${x},${y - 58 * scale}`, '#35803c')
  );
}

function bird(x, y) {
  return path(`M ${x - 9} ${y} Q ${x - 4} ${y - 6} ${x} ${y} Q ${x + 4} ${y - 6} ${x + 9} ${y}`, 'none',
    'stroke="#33506b" stroke-width="2" fill="none" stroke-linecap="round"');
}

function shirt(x, y, colour) {
  return path(
    `M ${x} ${y} L ${x + 8} ${y - 5} L ${x + 16} ${y} L ${x + 21} ${y + 7} L ${x + 16} ${y + 11} ` +
    `L ${x + 16} ${y + 27} L ${x} ${y + 27} L ${x} ${y + 11} L ${x - 5} ${y + 7} Z`, colour);
}

function buildMountainVillage(diffs, p) {
  const s = [];
  s.push(`<defs>
    <linearGradient id="${p}-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#79c7e8"/><stop offset="1" stop-color="#e8f7ff"/>
    </linearGradient>
  </defs>`);
  s.push(rect(0, 0, 600, 600, `url(#${p}-sky)`));

  // Sun with rays, top left.
  const rays = [0, 45, 90, 135, 180, 225, 270, 315]
    .map(a => line(66, 25, 66, 33, '#ffd93b', 3, `stroke-linecap="round" transform="rotate(${a} 66 58)"`)).join('');
  s.push(rays + circle(66, 58, 24, '#ffd93b') + circle(66, 58, 19, '#ffe066'));

  // Bird flock; the middle bird is a difference.
  s.push(bird(140, 78) + bird(198, 80));
  if (!diffs.has('bird-missing')) s.push(bird(168, 64));

  // Difference: the kite is gone on the right.
  if (!diffs.has('kite-missing')) {
    s.push(path('M 480 116 Q 466 134 474 154', 'none', 'stroke="#33506b" stroke-width="1.6" fill="none"') +
      polygon('470,128 480,134 468,138', '#ffd23f') + polygon('474,146 484,152 472,156', '#ff5da2') +
      polygon('480,64 502,90 480,116 458,90', '#ff5da2') +
      line(480, 64, 480, 116, '#c22e6e', 1.6) + line(458, 90, 502, 90, '#c22e6e', 1.6));
  }

  // Mountains with snow caps.
  s.push(polygon('0,330 150,110 268,330', '#5b7fa6'));
  s.push(polygon('126,146 150,110 176,146 162,134 150,150 138,134', '#ffffff'));
  s.push(polygon('176,330 348,80 512,330', '#4a6b96'));
  s.push(polygon('318,122 348,80 380,122 364,108 348,128 332,110', '#ffffff'));
  s.push(polygon('392,330 528,130 600,216 600,330', '#5b7fa6'));
  s.push(polygon('512,150 528,130 544,150 534,142 528,154 520,142', '#ffffff'));

  // Rolling hills.
  s.push(path('M 0 348 Q 150 312 320 342 T 600 338 L 600 600 L 0 600 Z', '#69a85f'));
  s.push(path('M 0 452 Q 200 422 600 458 L 600 600 L 0 600 Z', '#558f47'));

  // A tiny house on the far slope, identical on both panels.
  s.push(rect(418, 296, 26, 18, '#f7e3b0') + polygon('414,297 431,284 448,297', '#c94f42') + rect(428, 304, 7, 10, '#7a4a2b'));

  // The apple tree, left foreground; its apples are a difference.
  s.push(path('M 28 482 L 36 402 Q 40 382 48 370 L 56 402 L 60 482 Z', '#6b4a2f'));
  s.push(line(44, 388, 20, 352, '#6b4a2f', 6, 'stroke-linecap="round"') + line(46, 382, 76, 350, '#6b4a2f', 6, 'stroke-linecap="round"'));
  s.push(circle(6, 328, 30, '#357a35') + circle(88, 324, 36, '#357a35') + circle(44, 342, 44, '#3e8f3f') + circle(60, 298, 30, '#3e8f3f'));
  if (!diffs.has('apples-missing')) {
    for (const [ax, ay] of [[30, 320], [58, 302], [84, 334], [44, 360], [96, 310], [14, 344]]) {
      s.push(circle(ax, ay, 5.5, '#e23b3b') + circle(ax - 1.6, ay - 1.6, 1.7, '#ff9d9d'));
    }
  }

  // House 1: cream walls, red roof, smoking chimney, on its terrace.
  // Difference: the chimney smoke is gone on the right.
  if (!diffs.has('smoke-missing')) {
    s.push(circle(168, 250, 8, '#ffffff', 'opacity="0.75"') + circle(177, 228, 11, '#ffffff', 'opacity="0.7"') + circle(189, 204, 14, '#ffffff', 'opacity="0.62"'));
  }
  s.push(rect(60, 398, 140, 10, '#8f979e'));
  s.push(rect(158, 268, 20, 36, '#8a5a4a') + rect(154, 262, 28, 9, '#6e4525'));
  s.push(rect(66, 314, 130, 84, '#f7e3b0') + polygon('54,316 131,256 208,316', '#c94f42'));
  s.push(rect(86, 346, 30, 52, '#7a4a2b') + circle(110, 373, 2.6, '#ffd23f'));
  s.push(rect(140, 332, 38, 32, '#bfe8ff', 'stroke="#8a5a4a" stroke-width="2"') + line(159, 332, 159, 364, '#8a5a4a', 2));
  // Difference: the window shutters change colour.
  const shutter = diffs.has('shutter-color') ? '#3b6fd4' : '#3f9e4d';
  s.push(rect(124, 332, 14, 32, shutter) + rect(180, 332, 14, 32, shutter));
  // Difference: a flower pot by the door appears on the right only.
  if (diffs.has('pot-added')) {
    s.push(line(193, 376, 191, 364, '#3f9e4d', 2) + line(199, 376, 201, 364, '#3f9e4d', 2) +
      circle(190, 362, 5, '#ff5da2') + circle(198, 358, 6, '#ffd23f') + circle(205, 363, 5, '#ff8c42') +
      polygon('186,374 206,374 202,396 190,396', '#c96f3b'));
  }

  // House 2: peach walls, brown roof, on the middle terrace.
  s.push(rect(250, 442, 142, 10, '#8f979e'));
  s.push(rect(256, 372, 130, 70, '#f2d5c4') + polygon('244,374 321,322 398,374', '#8a5a33'));
  s.push(rect(302, 402, 28, 40, '#5d3a22') + circle(356, 398, 13, '#bfe8ff', 'stroke="#8a5a4a" stroke-width="2"'));
  s.push(line(343, 398, 369, 398, '#8a5a4a', 2) + line(356, 385, 356, 411, '#8a5a4a', 2));

  // The laundry line from house 2 to its pole; the middle shirt is a difference.
  s.push(line(472, 344, 472, 440, '#6e4525', 4) + line(392, 352, 472, 344, '#33506b', 2));
  s.push(shirt(400, 355, '#f5f2ea'));
  s.push(shirt(427, 357, diffs.has('laundry-color') ? '#ffd23f' : '#e23b3b'));
  s.push(shirt(454, 355, '#2fd4c4'));

  // House 3: pale blue walls on the lower terrace; its roof colour is a difference.
  s.push(rect(440, 428, 132, 10, '#8f979e'));
  s.push(rect(446, 358, 120, 70, '#dceef7'));
  s.push(polygon('434,360 506,308 578,360', diffs.has('roof-color') ? '#8e44ad' : '#3b6fd4'));
  s.push(rect(492, 388, 26, 40, '#4a3a5e') + rect(458, 380, 26, 24, '#bfe8ff', 'stroke="#8a5a4a" stroke-width="2"'));

  s.push(pine(224, 420, 0.8) + pine(566, 430, 0.9) + pine(410, 452, 0.62));

  // The goat in the field; gone on the right. Drawn before the fence so
  // the rails cross its legs.
  if (!diffs.has('goat-missing')) {
    s.push(line(284, 498, 284, 514, '#e8e2d2', 4) + line(316, 498, 316, 514, '#e8e2d2', 4) +
      ellipse(300, 486, 24, 15, '#f5f2ea') + ellipse(292, 482, 8, 6, '#d8cfc0') +
      circle(330, 474, 9.5, '#f5f2ea') +
      path('M 324 466 Q 320 458 326 456', 'none', 'stroke="#8a7a5f" stroke-width="2.4" fill="none"') +
      polygon('336,468 344,472 336,475', '#e8e2d2') + circle(332, 473, 1.8, '#20344f') +
      line(277, 480, 268, 472, '#e8e2d2', 3.4, 'stroke-linecap="round"'));
  }
  // The fence.
  s.push(rect(232, 468, 190, 6, '#8a6a44') + rect(232, 484, 190, 6, '#8a6a44'));
  for (const fx of [240, 290, 340, 390, 415]) s.push(rect(fx, 460, 7, 42, '#7a5c38'));

  // Stepping-stone path winding down from the houses; one stone is a difference.
  s.push(ellipse(500, 452, 11, 4.5, '#b9c0c7', 'stroke="#8f979e"') + ellipse(492, 532, 12, 4.5, '#b9c0c7', 'stroke="#8f979e"') +
         ellipse(470, 570, 16, 6, '#b9c0c7', 'stroke="#8f979e"'));
  if (!diffs.has('stone-missing')) s.push(ellipse(478, 492, 14, 5, '#b9c0c7', 'stroke="#8f979e"'));

  // A foreground laundry line between two poles, identical on both panels.
  s.push(line(60, 520, 60, 592, '#6e4525', 4) + line(210, 520, 210, 592, '#6e4525', 4) + line(60, 526, 210, 526, '#33506b', 2));
  s.push(rect(78, 526, 26, 30, '#ff8c42') + rect(118, 526, 30, 24, '#f5f2ea') + rect(162, 526, 24, 34, '#39c2ff'));

  // Bushes at the house bases and a scatter of foreground flowers.
  s.push(ellipse(150, 472, 24, 9, '#3e7a37') + ellipse(404, 450, 24, 9, '#3e7a37') + ellipse(566, 436, 26, 10, '#3e7a37'));
  const flowerColours = ['#ff5da2', '#ffd23f', '#ffffff', '#ff8c42'];
  for (const [i, [a, b]] of scatter(23, 26).entries()) {
    s.push(circle(Math.round(a * 592) + 4, Math.round(540 + b * 52), 2.3, flowerColours[i % 4]));
  }
  return s.join('\n');
}

// ---------- dispatcher ----------

const BUILDERS = {
  'night-market': buildNightMarket,
  'harbor-dawn': buildHarborDawn,
  'mountain-village': buildMountainVillage,
};

// Draw one panel of a scene. `diffs` is the set of difference ids to
// apply (empty for the left panel, all of them for the right) and
// `prefix` keeps gradient ids unique between the two panels.
export function buildSceneSVG(sceneId, diffs, prefix) {
  const build = BUILDERS[sceneId];
  if (build === undefined) throw new Error(`unknown scene: ${sceneId}`);
  return build(diffs, prefix);
}
