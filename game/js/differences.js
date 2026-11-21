// differences.js — what differs between the two pictures, per scene.
// Each entry names the difference id the scene builders branch on (in
// scenes.js), the point a player must click (in the shared 600 x 440
// scene coordinates), a generous click radius around it, and a short
// label the game shows when the difference is found. The right panel is
// drawn with every one of these applied; the left with none.

export const DIFFERENCES = {
  'night-market': [
    { id: 'moon-shape', cx: 520, cy: 58, r: 30, label: 'The crescent moon turned full' },
    { id: 'extra-star', cx: 150, cy: 50, r: 18, label: 'A new star blinked on' },
    { id: 'cat-missing', cx: 306, cy: 122, r: 22, label: 'The rooftop cat slipped away' },
    { id: 'bulb-missing', cx: 300, cy: 94, r: 16, label: 'One string light went out' },
    { id: 'lantern-color', cx: 222, cy: 196, r: 26, label: 'The lantern changed colour' },
    { id: 'sign-text', cx: 126, cy: 266, r: 30, label: 'The stall sign was repainted' },
    { id: 'hat-color', cx: 95, cy: 264, r: 18, label: 'The vendor swapped hats' },
    { id: 'fruit-color', cx: 160, cy: 306, r: 24, label: 'Oranges became apples' },
    { id: 'flag-swap', cx: 318, cy: 272, r: 20, label: 'A pennant flag changed colour' },
    { id: 'balloon-missing', cx: 498, cy: 206, r: 22, label: 'The pink balloon floated off' },
  ],
  'harbor-dawn': [
    { id: 'sun-size', cx: 470, cy: 238, r: 36, label: 'The sun swelled as it rose' },
    { id: 'cloud-missing', cx: 420, cy: 66, r: 26, label: 'A small cloud drifted away' },
    { id: 'gull-missing', cx: 150, cy: 78, r: 18, label: 'One gull left the flock' },
    { id: 'lighthouse-beam', cx: 86, cy: 145, r: 22, label: 'The lighthouse beam went dark' },
    { id: 'flag-missing', cx: 278, cy: 154, r: 18, label: 'The mast flag vanished' },
    { id: 'sail-color', cx: 295, cy: 240, r: 32, label: 'The big sail changed colour' },
    { id: 'fish-missing', cx: 180, cy: 314, r: 22, label: 'The jumping fish dived away' },
    { id: 'buoy-color', cx: 372, cy: 330, r: 20, label: 'The buoy changed colour' },
    { id: 'anchor-added', cx: 56, cy: 404, r: 24, label: 'An anchor appeared on the dock' },
    { id: 'coil-to-bucket', cx: 130, cy: 407, r: 22, label: 'The rope coil became a bucket' },
  ],
  'mountain-village': [
    { id: 'bird-missing', cx: 168, cy: 60, r: 16, label: 'One bird left the flock' },
    { id: 'kite-missing', cx: 480, cy: 84, r: 26, label: 'The kite blew away' },
    { id: 'smoke-missing', cx: 179, cy: 164, r: 24, label: 'The chimney stopped smoking' },
    { id: 'apples-missing', cx: 50, cy: 208, r: 32, label: 'The apples were picked' },
    { id: 'roof-color', cx: 506, cy: 236, r: 28, label: 'A roof was repainted' },
    { id: 'shutter-color', cx: 187, cy: 286, r: 16, label: 'The shutters changed colour' },
    { id: 'pot-added', cx: 196, cy: 316, r: 17, label: 'A flower pot appeared by the door' },
    { id: 'laundry-color', cx: 437, cy: 258, r: 18, label: 'A shirt changed colour' },
    { id: 'goat-missing', cx: 303, cy: 370, r: 26, label: 'The goat wandered off' },
    { id: 'stone-missing', cx: 306, cy: 408, r: 16, label: 'A stepping stone went missing' },
  ],
};

// The full set of difference ids for a scene: what the right panel draws.
export function allDifferenceIds(sceneId) {
  return new Set(differencesFor(sceneId).map(d => d.id));
}

export function differencesFor(sceneId) {
  const list = DIFFERENCES[sceneId];
  if (list === undefined) throw new Error(`unknown scene: ${sceneId}`);
  return list;
}

// The difference a click at (x, y) hits, or null. Found differences are
// skipped, and every target gets a minimum radius so small details (a
// shutter, a stepping stone) stay clickable.
export function hitTest(sceneId, x, y, found) {
  for (const d of differencesFor(sceneId)) {
    if (found.has(d.id)) continue;
    const radius = Math.max(d.r, 16);
    const dx = x - d.cx;
    const dy = y - d.cy;
    if (dx * dx + dy * dy <= radius * radius) return d;
  }
  return null;
}
