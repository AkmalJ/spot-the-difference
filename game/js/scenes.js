// scenes.js — the three scenes of Pasar Perbedaan and the SVG builders
// that draw them. Every scene is drawn twice from this same code: the
// left panel with an empty difference set, the right panel with every
// difference applied. A difference is a single branch inside a builder,
// keyed by its id (the ids live in differences.js). Everything is inline
// SVG built from strings: no images, no fonts, no network.
//
// Scene coordinates are a 600 x 440 viewBox shared by both panels.

export const SCENE_WIDTH = 600;
export const SCENE_HEIGHT = 440;

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
  s.push(rect(0, 0, 600, 440, `url(#${p}-sky)`));

  // Stars, identical on both panels.
  for (const [i, [a, b]] of scatter(11, 44).entries()) {
    s.push(circle(Math.round(a * 596) + 2, Math.round(b * 168) + 6, 0.9 + (i % 3) * 0.55, '#ffffff', `opacity="${0.5 + (i % 4) * 0.13}"`));
  }
  // Difference: an extra bright star on the right.
  if (diffs.has('extra-star')) {
    s.push(line(150, 41, 150, 59, '#ffffff', 1.6) + line(141, 50, 159, 50, '#ffffff', 1.6) + circle(150, 50, 2.8, '#ffffff'));
  }

  // Difference: crescent moon on the left, full moon on the right.
  if (diffs.has('moon-shape')) {
    s.push(circle(520, 58, 21, '#f7d774') + circle(512, 50, 4, '#e8c55c') + circle(528, 66, 3, '#e8c55c') + circle(522, 44, 2.4, '#e8c55c'));
  } else {
    s.push(path('M 520 37 A 21 21 0 1 0 520 79 A 25 21 0 1 1 520 37 Z', '#f7d774'));
  }

  // Rooftop silhouette behind the stalls, with lit windows.
  s.push(polygon('0,196 0,150 70,150 70,132 120,132 120,150 210,150 210,138 300,138 300,156 395,156 395,140 470,140 470,158 600,158 600,196', '#0c1030'));
  s.push(rect(88, 158, 8, 10, '#ffca7a', 'opacity="0.85"') + rect(232, 160, 8, 10, '#ffca7a', 'opacity="0.7"') +
         rect(420, 164, 8, 10, '#ffca7a', 'opacity="0.8"') + rect(505, 166, 8, 10, '#ffca7a', 'opacity="0.65"'));

  // Difference: the cat on the middle roof is gone on the right.
  if (!diffs.has('cat-missing')) {
    s.push(ellipse(312, 129, 13, 7.5, '#05070f') +
      circle(299, 121, 6.5, '#05070f') +
      polygon('294,117 296,108 300,115', '#05070f') + polygon('301,115 306,109 306,118', '#05070f') +
      path('M 324 126 Q 336 118 333 104', 'none', 'stroke="#05070f" stroke-width="3.5" fill="none" stroke-linecap="round"'));
  }

  // String lights across the top of the market.
  s.push(path('M -5 80 Q 150 116 305 86 T 605 78', 'none', 'stroke="#05070f" stroke-width="2" opacity="0.6" fill="none"'));
  const bulbs = [[30, 90], [75, 99], [120, 103], [165, 102], [210, 96], [255, 90], [300, 88], [345, 90], [390, 95], [435, 100], [480, 102], [525, 99], [565, 92]];
  for (const [i, [bx, by]] of bulbs.entries()) {
    // Difference: one bulb is missing on the right.
    if (diffs.has('bulb-missing') && i === 6) continue;
    s.push(line(bx, by - 4, bx, by + 2, '#05070f', 1.5) + circle(bx, by + 6, 8, '#ffd98a', 'opacity="0.22"') + circle(bx, by + 6, 3.8, '#ffd98a'));
  }

  // Stall A (left): the sate stall.
  s.push(rect(44, 238, 8, 122, '#4a2f1d') + rect(190, 238, 8, 122, '#4a2f1d'));
  s.push(polygon('30,244 212,244 196,206 46,206', '#d6455b'));
  s.push(polygon('78,206 100,206 108,244 82,244', '#f7ead9') + polygon('126,206 148,206 156,244 130,244', '#f7ead9') + polygon('174,206 196,206 204,244 178,244', '#f7ead9'));
  // Difference: the sign reads SATE on the left, SOTO on the right.
  s.push(rect(74, 252, 104, 27, '#20304f', 'rx="4" stroke="#ffd23f" stroke-width="1.5"'));
  s.push(text(126, 271, diffs.has('sign-text') ? 'SOTO' : 'SATE', 17, '#ffd23f', 'text-anchor="middle" font-weight="bold" letter-spacing="3"'));
  // The vendor, hat colour is a difference.
  s.push(person(95, 322, 1.05, '#1d1430', diffs.has('hat-color') ? '#37d67a' : '#ffd23f'));
  s.push(rect(40, 318, 168, 15, '#7a4a2b') + rect(40, 333, 168, 59, '#5d3a22'));
  s.push(line(40, 352, 208, 352, '#4a2c17', 2) + line(40, 372, 208, 372, '#4a2c17', 2));
  s.push(rect(56, 296, 16, 22, '#9fd8e8', 'opacity="0.85" rx="3"') + rect(78, 300, 13, 18, '#ffd98a', 'opacity="0.85" rx="3"'));
  // Difference: the fruit pile is oranges on the left, apples on the right.
  const fruit = diffs.has('fruit-color') ? '#e23b3b' : '#f59e0b';
  s.push(circle(152, 310, 9, fruit) + circle(168, 308, 10, fruit) + circle(160, 297, 9, fruit) + circle(179, 312, 8, fruit) + circle(142, 314, 7, fruit));
  if (diffs.has('fruit-color')) s.push(path('M 160 288 Q 166 280 174 283 Q 168 290 160 288 Z', '#3f9e4d'));

  // The lantern on its pole between stalls A and B; colour is a difference.
  s.push(line(222, 200, 222, 336, '#05070f', 4) + line(222, 200, 222, 178, '#05070f', 2));
  s.push(lantern(222, 196, diffs.has('lantern-color') ? '#2fd4c4' : '#e23b3b'));

  // Stall B (middle): snacks and clay pots.
  s.push(rect(246, 238, 8, 122, '#4a2f1d') + rect(382, 238, 8, 122, '#4a2f1d'));
  s.push(polygon('232,244 404,244 388,206 248,206', '#1f9e8f'));
  s.push(polygon('282,206 304,206 312,244 286,244', '#0f6e62', 'opacity="0.85"') + polygon('330,206 352,206 360,244 334,244', '#0f6e62', 'opacity="0.85"'));
  s.push(path('M 246 258 Q 318 280 390 258', 'none', 'stroke="#05070f" stroke-width="1.6" fill="none"'));
  // Pennant flags; the middle one's colour is a difference.
  const flagColours = ['#ffd23f', '#ff5da2', diffs.has('flag-swap') ? '#39c2ff' : '#e23b3b', '#37d67a', '#ff8c42'];
  [258, 284, 310, 336, 362].forEach((fx, i) => {
    s.push(polygon(`${fx},263 ${fx + 17},265 ${fx + 8},283`, flagColours[i]));
  });
  s.push(person(320, 322, 1.05, '#241536'));
  s.push(rect(242, 318, 152, 15, '#7a4a2b') + rect(242, 333, 152, 59, '#54402a'));
  s.push(ellipse(272, 307, 14, 10, '#b5651d') + ellipse(298, 311, 11, 8, '#a0522d') + ellipse(272, 301, 9, 4, '#8a4a1f'));
  s.push(path('M 332 306 A 13 7 0 0 1 358 306 Z', '#e8e3d5') + path('M 334 298 A 11 6 0 0 1 356 298 Z', '#d6455b') + path('M 336 291 A 9 5 0 0 1 354 291 Z', '#39c2ff'));
  for (let i = 0; i < 4; i++) s.push(ellipse(380, 272 + i * 9, 3.4, 5.5, '#e23b3b'));

  // Stall C (right): toys and balloons.
  s.push(rect(424, 238, 8, 122, '#4a2f1d') + rect(560, 238, 8, 122, '#4a2f1d'));
  s.push(polygon('410,244 582,244 566,206 426,206', '#7c4dff'));
  s.push(polygon('462,206 484,206 492,244 466,244', '#5a34c4') + polygon('510,206 532,206 540,244 514,244', '#5a34c4'));
  s.push(rect(420, 318, 152, 15, '#7a4a2b') + rect(420, 333, 152, 59, '#46323f'));
  // Pinwheels on the counter.
  for (const [px, py, c1, c2] of [[447, 268, '#ffd23f', '#ff5da2'], [540, 262, '#39c2ff', '#37d67a']]) {
    s.push(line(px, py, px + 5, 318, '#0a0c1e', 2.5) +
      polygon(`${px},${py} ${px + 12},${py - 4} ${px + 3},${py + 5}`, c1) +
      polygon(`${px},${py} ${px - 4},${py + 12} ${px + 3},${py + 5}`, c2) +
      polygon(`${px},${py} ${px - 12},${py + 3} ${px + 3},${py + 5}`, c1) +
      polygon(`${px},${py} ${px + 4},${py - 12} ${px + 3},${py + 5}`, c2));
  }
  s.push(circle(470, 307, 9, '#ffd23f') + rect(492, 296, 20, 20, '#ff8c42', 'rx="3"') + polygon('548,318 560,296 572,318', '#2fd4c4'));
  // The child with balloons; the pink balloon is a difference.
  s.push(line(520, 336, 524, 206, '#c9c2ae', 1.4) + line(520, 336, 498, 222, '#c9c2ae', 1.4) + line(520, 336, 548, 226, '#c9c2ae', 1.4));
  if (!diffs.has('balloon-missing')) s.push(ellipse(498, 206, 13, 16, '#ff5da2'));
  s.push(ellipse(524, 190, 12, 15, '#ffd23f') + ellipse(548, 210, 12, 15, '#39c2ff'));
  s.push(person(520, 384, 0.92, '#101736'));

  // Shoppers in front of the stalls.
  s.push(person(250, 402, 1.25, '#0a0c1e'));
  s.push(person(452, 404, 1.18, '#0a0c1e'));

  // Ground and pools of lamplight.
  s.push(rect(0, 398, 600, 42, '#0a0d24'));
  s.push(ellipse(122, 410, 96, 13, '#ffd98a', 'opacity="0.10"') + ellipse(314, 412, 92, 13, '#ffd98a', 'opacity="0.09"') + ellipse(500, 410, 92, 13, '#ffd98a', 'opacity="0.10"'));
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
  s.push(rect(0, 0, 600, 252, `url(#${p}-sky)`));
  s.push(rect(0, 250, 600, 190, `url(#${p}-sea)`));

  // Difference: the sun is bigger on the right.
  const sunR = diffs.has('sun-size') ? 37 : 26;
  s.push(circle(470, 238, sunR + 20, '#ffd66e', 'opacity="0.3"') + circle(470, 238, sunR, '#ffd66e') + circle(470, 238, sunR * 0.68, '#ffe9a3'));

  s.push(cloud(120, 58, 1, 0.9) + cloud(300, 108, 0.7, 0.8));
  // Difference: the small cloud is gone on the right.
  if (!diffs.has('cloud-missing')) s.push(cloud(420, 66, 0.62, 0.85));

  s.push(gull(96, 92) + gull(214, 104));
  // Difference: the middle gull is gone on the right.
  if (!diffs.has('gull-missing')) s.push(gull(150, 78));

  // The lighthouse on its rocks.
  // Difference: the lamp's beam shines on the left only.
  if (!diffs.has('lighthouse-beam')) s.push(polygon('94,138 272,98 272,158', '#ffe98a', 'opacity="0.30"'));
  s.push(polygon('18,332 60,300 105,306 142,332 138,354 24,354', '#3a3f4a'));
  s.push(polygon('52,318 84,296 118,320 110,338 60,338', '#2e333d'));
  s.push(polygon('66,302 74,158 98,158 106,302', '#f2ede2'));
  s.push(polygon('70,250 102,250 104,272 69,272', '#d6455b') + polygon('72,200 100,200 101,222 71,222', '#d6455b'));
  s.push(rect(68, 132, 36, 26, '#22304a') + circle(86, 145, 8, diffs.has('lighthouse-beam') ? '#c9b458' : '#ffe98a'));
  s.push(polygon('64,132 86,116 108,132', '#d6455b'));

  // Sun glitter on the water.
  [264, 278, 294, 312, 332].forEach((wy, i) => {
    const w = 44 - i * 6;
    s.push(line(470 - w / 2, wy, 470 + w / 2, wy, '#ffd66e', 3, 'opacity="0.45" stroke-linecap="round"'));
  });
  // Wave strokes.
  for (const [wx, wy] of [[150, 288], [330, 306], [520, 292], [90, 336], [430, 352], [210, 372], [540, 386], [120, 402]]) {
    s.push(path(`M ${wx} ${wy} q 12 -6 24 0 t 24 0`, 'none', 'stroke="#bfeaff" stroke-width="2" opacity="0.3" fill="none" stroke-linecap="round"'));
  }

  // Boat 1: the fishing boat with the big sail.
  // Difference: its sail is white on the left, warm cream on the right.
  s.push(line(268, 296, 268, 148, '#3a2a18', 4));
  s.push(polygon('268,158 268,290 332,290', diffs.has('sail-color') ? '#ffe9a3' : '#ffffff'));
  s.push(polygon('268,176 268,290 224,290', '#eef3f6', 'opacity="0.95"'));
  // Difference: the mast flag is gone on the right.
  if (!diffs.has('flag-missing')) s.push(polygon('268,148 293,154 268,161', '#e23b3b'));
  s.push(path('M 196 302 L 340 302 L 322 330 L 214 330 Z', '#7a4a2b') + rect(192, 295, 152, 8, '#5d3a22', 'rx="3"'));
  s.push(person(238, 300, 0.52, '#20344f'));

  // Boat 2: teal hull, striped sail.
  s.push(line(486, 296, 486, 190, '#3a2a18', 4));
  s.push(polygon('486,198 486,292 542,292', '#ffd23f'));
  s.push(polygon('486,224 486,244 518,292 498,292', '#e2703a') + polygon('486,258 486,272 532,292 520,292', '#e2703a'));
  s.push(polygon('486,190 504,195 486,201', '#39c2ff'));
  s.push(rect(452, 296, 44, 20, '#f2ede2') + rect(448, 290, 52, 8, '#d6455b', 'rx="3"'));
  s.push(path('M 402 318 L 548 318 L 530 344 L 420 344 Z', '#14666b') + rect(398, 311, 154, 8, '#0d4a4e', 'rx="3"'));

  // Difference: the jumping fish is gone on the right (ripples stay).
  s.push(ellipse(180, 334, 26, 5, '#dff6ff', 'opacity="0.35"'));
  if (!diffs.has('fish-missing')) {
    s.push(path('M 156 316 Q 180 296 206 314 Q 192 323 180 324 Q 168 323 156 316 Z', '#9fd8e8') +
      polygon('156,316 143,305 146,327', '#7fc4dd') + circle(196, 312, 2.2, '#20344f') +
      path('M 158 332 q 6 -8 12 0 M 184 334 q 6 -8 12 0', 'none', 'stroke="#dff6ff" stroke-width="2" fill="none"'));
  }

  // The buoy; its top band colour is a difference.
  s.push(ellipse(372, 347, 17, 4.5, '#0d3550', 'opacity="0.55"'));
  s.push(rect(360, 318, 24, 27, '#f2ede2', 'rx="6"'));
  s.push(rect(360, 318, 24, 11, diffs.has('buoy-color') ? '#37d67a' : '#e23b3b', 'rx="5"'));
  s.push(line(372, 318, 372, 305, '#22304a', 3) + circle(372, 301, 4, '#ffe98a'));

  // Foreground rowboat.
  s.push(path('M 232 392 L 332 392 L 316 414 L 248 414 Z', '#8a5a33') + rect(262, 394, 40, 5, '#6e4525'));
  s.push(line(298, 400, 340, 380, '#c9a06a', 3, 'stroke-linecap="round"'));

  // The dock, bottom left.
  s.push(rect(12, 386, 10, 54, '#4a2f1d') + rect(160, 386, 10, 54, '#4a2f1d'));
  s.push(rect(0, 398, 186, 10, '#6b4a2f') + rect(0, 412, 186, 10, '#5d3a22') + rect(0, 426, 186, 14, '#6b4a2f'));
  // Difference: an anchor leans on the dock on the right only.
  if (diffs.has('anchor-added')) {
    s.push(circle(56, 382, 6, 'none', 'stroke="#1c2436" stroke-width="5"') +
      line(56, 388, 56, 424, '#1c2436', 5) + line(41, 399, 71, 399, '#1c2436', 5) +
      path('M 38 412 Q 56 436 74 412', 'none', 'stroke="#1c2436" stroke-width="5" fill="none" stroke-linecap="round"'));
  }
  // Difference: a coil of rope on the left, a red bucket on the right.
  if (diffs.has('coil-to-bucket')) {
    s.push(polygon('114,392 146,392 141,422 119,422', '#d6455b') +
      path('M 114 392 Q 130 375 146 392', 'none', 'stroke="#8a2436" stroke-width="3" fill="none"'));
  } else {
    s.push(ellipse(130, 404, 20, 6, 'none', 'stroke="#c9a06a" stroke-width="3"') +
      ellipse(130, 411, 16, 5, 'none', 'stroke="#c9a06a" stroke-width="3"') +
      ellipse(130, 418, 12, 4, 'none', 'stroke="#c9a06a" stroke-width="3"'));
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
  s.push(rect(0, 0, 600, 440, `url(#${p}-sky)`));

  // Sun with rays, top left.
  const rays = [0, 45, 90, 135, 180, 225, 270, 315]
    .map(a => line(66, 25, 66, 33, '#ffd93b', 3, `stroke-linecap="round" transform="rotate(${a} 66 58)"`)).join('');
  s.push(rays + circle(66, 58, 24, '#ffd93b') + circle(66, 58, 19, '#ffe066'));

  // Bird flock; the middle bird is a difference.
  s.push(bird(140, 72) + bird(198, 74));
  if (!diffs.has('bird-missing')) s.push(bird(168, 58));

  // Difference: the kite is gone on the right.
  if (!diffs.has('kite-missing')) {
    s.push(path('M 480 110 Q 466 128 474 148', 'none', 'stroke="#33506b" stroke-width="1.6" fill="none"') +
      polygon('470,122 480,128 468,132', '#ffd23f') + polygon('474,140 484,146 472,150', '#ff5da2') +
      polygon('480,58 502,84 480,110 458,84', '#ff5da2') +
      line(480, 58, 480, 110, '#c22e6e', 1.6) + line(458, 84, 502, 84, '#c22e6e', 1.6));
  }

  // Mountains with snow caps.
  s.push(polygon('0,252 150,84 268,252', '#5b7fa6'));
  s.push(polygon('126,120 150,84 176,120 162,108 150,124 138,108', '#ffffff'));
  s.push(polygon('176,252 348,54 512,252', '#4a6b96'));
  s.push(polygon('318,96 348,54 380,96 364,82 348,102 332,84', '#ffffff'));
  s.push(polygon('392,252 528,104 600,190 600,252', '#5b7fa6'));
  s.push(polygon('512,124 528,104 544,124 534,116 528,128 520,116', '#ffffff'));

  // Rolling hills.
  s.push(path('M 0 268 Q 150 232 320 262 T 600 258 L 600 440 L 0 440 Z', '#69a85f'));
  s.push(path('M 0 332 Q 200 302 600 338 L 600 440 L 0 440 Z', '#558f47'));

  // Stepping-stone path up to the houses; one stone is a difference.
  s.push(ellipse(322, 430, 17, 6, '#b9c0c7', 'stroke="#8f979e"') + ellipse(324, 388, 13, 5, '#b9c0c7', 'stroke="#8f979e"') +
         ellipse(302, 368, 11, 4.5, '#b9c0c7', 'stroke="#8f979e"') + ellipse(318, 350, 10, 4, '#b9c0c7', 'stroke="#8f979e"'));
  if (!diffs.has('stone-missing')) s.push(ellipse(306, 408, 14, 5, '#b9c0c7', 'stroke="#8f979e"'));

  // The apple tree, left foreground; its apples are a difference.
  s.push(path('M 28 362 L 36 282 Q 40 262 48 250 L 56 282 L 60 362 Z', '#6b4a2f'));
  s.push(line(44, 268, 20, 232, '#6b4a2f', 6, 'stroke-linecap="round"') + line(46, 262, 76, 230, '#6b4a2f', 6, 'stroke-linecap="round"'));
  s.push(circle(6, 208, 30, '#357a35') + circle(88, 204, 36, '#357a35') + circle(44, 222, 44, '#3e8f3f') + circle(60, 178, 30, '#3e8f3f'));
  if (!diffs.has('apples-missing')) {
    for (const [ax, ay] of [[30, 200], [58, 182], [84, 214], [44, 240], [96, 190], [14, 224]]) {
      s.push(circle(ax, ay, 5.5, '#e23b3b') + circle(ax - 1.6, ay - 1.6, 1.7, '#ff9d9d'));
    }
  }

  // House 1: cream walls, red roof, smoking chimney.
  // Difference: the chimney smoke is gone on the right.
  if (!diffs.has('smoke-missing')) {
    s.push(circle(168, 188, 8, '#ffffff', 'opacity="0.75"') + circle(177, 166, 11, '#ffffff', 'opacity="0.7"') + circle(189, 142, 14, '#ffffff', 'opacity="0.62"'));
  }
  s.push(rect(158, 206, 20, 36, '#8a5a4a') + rect(154, 200, 28, 9, '#6e4525'));
  s.push(rect(66, 252, 130, 84, '#f7e3b0') + polygon('54,254 131,194 208,254', '#c94f42'));
  s.push(rect(86, 284, 30, 52, '#7a4a2b') + circle(110, 311, 2.6, '#ffd23f'));
  s.push(rect(140, 270, 38, 32, '#bfe8ff', 'stroke="#8a5a4a" stroke-width="2"') + line(159, 270, 159, 302, '#8a5a4a', 2));
  // Difference: the window shutters change colour.
  const shutter = diffs.has('shutter-color') ? '#3b6fd4' : '#3f9e4d';
  s.push(rect(124, 270, 14, 32, shutter) + rect(180, 270, 14, 32, shutter));
  // Difference: a flower pot by the door appears on the right only.
  if (diffs.has('pot-added')) {
    s.push(line(193, 314, 191, 302, '#3f9e4d', 2) + line(199, 314, 201, 302, '#3f9e4d', 2) +
      circle(190, 300, 5, '#ff5da2') + circle(198, 296, 6, '#ffd23f') + circle(205, 301, 5, '#ff8c42') +
      polygon('186,312 206,312 202,334 190,334', '#c96f3b'));
  }

  // House 2: peach walls, brown roof.
  s.push(rect(256, 258, 130, 70, '#f2d5c4') + polygon('244,260 321,208 398,260', '#8a5a33'));
  s.push(rect(302, 288, 28, 40, '#5d3a22') + circle(356, 284, 13, '#bfe8ff', 'stroke="#8a5a4a" stroke-width="2"'));
  s.push(line(343, 284, 369, 284, '#8a5a4a', 2) + line(356, 271, 356, 297, '#8a5a4a', 2));

  // The laundry line from house 2 to its pole; the middle shirt is a difference.
  s.push(line(472, 232, 472, 328, '#6e4525', 4) + line(392, 240, 472, 232, '#33506b', 2));
  s.push(shirt(400, 243, '#f5f2ea'));
  s.push(shirt(427, 245, diffs.has('laundry-color') ? '#ffd23f' : '#e23b3b'));
  s.push(shirt(454, 243, '#2fd4c4'));

  // House 3: pale blue walls; its roof colour is a difference.
  s.push(rect(446, 262, 120, 70, '#dceef7'));
  s.push(polygon('434,264 506,212 578,264', diffs.has('roof-color') ? '#8e44ad' : '#3b6fd4'));
  s.push(rect(492, 292, 26, 40, '#4a3a5e') + rect(458, 284, 26, 24, '#bfe8ff', 'stroke="#8a5a4a" stroke-width="2"'));

  s.push(pine(224, 322, 0.8) + pine(566, 322, 0.9) + pine(410, 334, 0.62));

  // The goat in the field; gone on the right. Drawn before the fence so
  // the rails cross its legs.
  if (!diffs.has('goat-missing')) {
    s.push(line(284, 382, 284, 398, '#e8e2d2', 4) + line(316, 382, 316, 398, '#e8e2d2', 4) +
      ellipse(300, 370, 24, 15, '#f5f2ea') + ellipse(292, 366, 8, 6, '#d8cfc0') +
      circle(330, 358, 9.5, '#f5f2ea') +
      path('M 324 350 Q 320 342 326 340', 'none', 'stroke="#8a7a5f" stroke-width="2.4" fill="none"') +
      polygon('336,352 344,356 336,359', '#e8e2d2') + circle(332, 357, 1.8, '#20344f') +
      line(277, 364, 268, 356, '#e8e2d2', 3.4, 'stroke-linecap="round"'));
  }
  // The fence.
  s.push(rect(232, 352, 190, 6, '#8a6a44') + rect(232, 368, 190, 6, '#8a6a44'));
  for (const fx of [240, 290, 340, 390, 415]) s.push(rect(fx, 344, 7, 42, '#7a5c38'));

  // Bushes at the house bases and a scatter of foreground flowers.
  s.push(ellipse(70, 338, 26, 10, '#3e7a37') + ellipse(398, 330, 24, 9, '#3e7a37') + ellipse(560, 334, 28, 10, '#3e7a37'));
  const flowerColours = ['#ff5da2', '#ffd23f', '#ffffff', '#ff8c42'];
  for (const [i, [a, b]] of scatter(23, 26).entries()) {
    s.push(circle(Math.round(a * 592) + 4, Math.round(416 + b * 18), 2.3, flowerColours[i % 4]));
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
