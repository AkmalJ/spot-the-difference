// game.js — Pasar Perbedaan gameplay: scene state, panel rendering,
// click and keyboard input, the HUD (counter, progress, timer), hints,
// scoring and the win card. The pictures come from scenes.js, the click
// targets from differences.js, the sounds from audio.js.
//
// Demo states, used for the entry's screenshots and reachable in play:
//   ?demo=mid    scene 1 with exactly 3 differences already found
//   ?demo=scene2 scene 2, fresh
//   ?demo=win    scene 1 finished, win card showing
// No parameter: the title screen, with scene 1 visible behind it.

import { SCENES, buildSceneSVG } from './scenes.js';
import { allDifferenceIds, differencesFor, hitTest } from './differences.js';
import { playClick, playFind, playHint, playWin, playWrong } from './audio.js';

const TOTAL_PER_SCENE = 10;
const HINTS_PER_SCENE = 3;
const MISTAKE_PENALTY_SECONDS = 5;

const svgLeft = document.querySelector('#svg-left');
const svgRight = document.querySelector('#svg-right');
const panelA = document.querySelector('#panel-a');
const panelB = document.querySelector('#panel-b');
const sceneNameEl = document.querySelector('#scene-name');
const foundCountEl = document.querySelector('#found-count');
const toGoEl = document.querySelector('#to-go');
const progressFill = document.querySelector('#progress-fill');
const clockEl = document.querySelector('#clock');
const hintsLeftEl = document.querySelector('#hints-left');
const hintBtn = document.querySelector('#hint-btn');
const toastEl = document.querySelector('#toast');
const titleScreen = document.querySelector('#title-screen');
const winOverlay = document.querySelector('#win-overlay');

const state = {
  sceneIndex: 0,
  found: new Set(),
  mistakes: 0,
  hintsLeft: HINTS_PER_SCENE,
  hintsUsed: 0,
  baseSeconds: 0,      // preset seconds (demo states)
  penaltySeconds: 0,   // +5 per wrong click
  startedAt: null,     // Date.now() when the clock started
  frozenSeconds: null, // set when the scene is won
  playing: false,
  won: false,
};

function scene() {
  return SCENES[state.sceneIndex];
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function elapsedSeconds() {
  if (state.frozenSeconds !== null) return state.frozenSeconds;
  if (state.startedAt === null) return state.baseSeconds + state.penaltySeconds;
  return state.baseSeconds + state.penaltySeconds + Math.floor((Date.now() - state.startedAt) / 1000);
}

function toast(message, kind = '') {
  toastEl.textContent = message;
  toastEl.className = kind;
}

// ---------- rendering ----------

function markerMarkup() {
  const parts = [];
  for (const d of differencesFor(scene().id)) {
    if (!state.found.has(d.id)) continue;
    parts.push(
      `<circle class="found-ring" cx="${d.cx}" cy="${d.cy}" r="${d.r + 7}"/>` +
      `<circle class="found-badge" cx="${d.cx + d.r + 1}" cy="${d.cy - d.r - 1}" r="8.5"/>` +
      `<path class="found-check" d="M ${d.cx + d.r - 3.4} ${d.cy - d.r - 1} l 3 3.4 l 5 -6"/>`,
    );
  }
  return parts.join('');
}

function renderPanels() {
  const id = scene().id;
  svgLeft.innerHTML = buildSceneSVG(id, new Set(), 'L') + markerMarkup();
  svgRight.innerHTML = buildSceneSVG(id, allDifferenceIds(id), 'R') + markerMarkup();
}

function updateHud() {
  const found = state.found.size;
  sceneNameEl.textContent = scene().name;
  foundCountEl.textContent = `${found} / ${TOTAL_PER_SCENE}`;
  toGoEl.textContent = String(TOTAL_PER_SCENE - found);
  progressFill.style.width = `${found * 10}%`;
  hintsLeftEl.textContent = String(state.hintsLeft);
  hintBtn.disabled = state.hintsLeft <= 0 || !state.playing || state.won;
  clockEl.textContent = formatTime(elapsedSeconds());
}

// ---------- game flow ----------

function startScene(index, preset = {}) {
  state.sceneIndex = index;
  state.found = new Set(preset.found ?? []);
  state.mistakes = preset.mistakes ?? 0;
  state.hintsUsed = preset.hintsUsed ?? 0;
  state.hintsLeft = HINTS_PER_SCENE - state.hintsUsed;
  state.baseSeconds = preset.seconds ?? 0;
  state.penaltySeconds = 0;
  state.frozenSeconds = null;
  state.won = false;
  state.playing = true;
  state.startedAt = Date.now();
  titleScreen.classList.add('hidden');
  winOverlay.classList.add('hidden');
  renderPanels();
  updateHud();
  toast(preset.message ?? `Find the 10 differences in ${scene().name}.`);
}

function showTitle() {
  state.playing = false;
  state.startedAt = null;
  state.found = new Set();
  state.sceneIndex = 0;
  state.baseSeconds = 0;
  state.penaltySeconds = 0;
  state.frozenSeconds = null;
  renderPanels();
  updateHud();
  titleScreen.classList.remove('hidden');
  winOverlay.classList.add('hidden');
  toast('');
}

function computeScore() {
  const raw = 1000 - elapsedSeconds() * 2 - state.mistakes * 40 - state.hintsUsed * 25;
  return Math.max(100, raw);
}

function showWin() {
  state.won = true;
  state.frozenSeconds = elapsedSeconds();
  document.querySelector('#win-title').textContent = 'All 10 found!';
  document.querySelector('#win-scene').textContent = `${scene().name} complete`;
  document.querySelector('#win-time').textContent = formatTime(state.frozenSeconds);
  document.querySelector('#win-mistakes').textContent = String(state.mistakes);
  document.querySelector('#win-hints').textContent = String(state.hintsUsed);
  document.querySelector('#win-score').textContent = String(computeScore());
  winOverlay.classList.remove('hidden');
  updateHud();
}

// ---------- input ----------

function svgPoint(svg, event) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(svg.getScreenCTM().inverse());
}

function markFound(diff) {
  state.found.add(diff.id);
  renderPanels();
  updateHud();
  playFind();
  if (state.found.size >= TOTAL_PER_SCENE) {
    playWin();
    toast('Every difference found!', 'good');
    showWin();
  } else {
    toast(`Found: ${diff.label}. ${TOTAL_PER_SCENE - state.found.size} to go.`, 'good');
  }
}

function registerMistake(svg, panel, point) {
  state.mistakes += 1;
  state.penaltySeconds += MISTAKE_PENALTY_SECONDS;
  playWrong();
  clockEl.classList.add('penalized');
  setTimeout(() => clockEl.classList.remove('penalized'), 900);
  panel.classList.remove('shake');
  void panel.offsetWidth; // restart the shake animation
  panel.classList.add('shake');
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.setAttribute('class', 'wrong-x');
  group.innerHTML =
    `<line x1="${point.x - 10}" y1="${point.y - 10}" x2="${point.x + 10}" y2="${point.y + 10}"/>` +
    `<line x1="${point.x + 10}" y1="${point.y - 10}" x2="${point.x - 10}" y2="${point.y + 10}"/>`;
  svg.appendChild(group);
  setTimeout(() => group.remove(), 650);
  toast(`Not there — +${MISTAKE_PENALTY_SECONDS} seconds.`, 'bad');
  updateHud();
}

function onPanelClick(svg, panel) {
  return (event) => {
    if (!state.playing || state.won) return;
    const point = svgPoint(svg, event);
    const diff = hitTest(scene().id, point.x, point.y, state.found);
    if (diff === null) registerMistake(svg, panel, point);
    else markFound(diff);
  };
}

svgLeft.addEventListener('click', onPanelClick(svgLeft, panelA));
svgRight.addEventListener('click', onPanelClick(svgRight, panelB));

function useHint() {
  if (!state.playing || state.won || state.hintsLeft <= 0) return;
  const remaining = differencesFor(scene().id).filter(d => !state.found.has(d.id));
  if (remaining.length === 0) return;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintsLeft -= 1;
  state.hintsUsed += 1;
  playHint();
  for (const svg of [svgLeft, svgRight]) {
    const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pulse.setAttribute('class', 'hint-pulse');
    pulse.setAttribute('cx', String(pick.cx));
    pulse.setAttribute('cy', String(pick.cy));
    pulse.setAttribute('r', String(pick.r + 8));
    svg.appendChild(pulse);
    setTimeout(() => pulse.remove(), 1300);
  }
  toast('Something glints over there…', '');
  updateHud();
}

hintBtn.addEventListener('click', useHint);
document.querySelector('#restart-btn').addEventListener('click', () => {
  playClick();
  startScene(state.sceneIndex, { message: `${scene().name} restarted. 10 differences, fresh eyes.` });
});
document.querySelector('#menu-btn').addEventListener('click', () => { playClick(); showTitle(); });
document.querySelectorAll('.scene-choice').forEach((button) => {
  button.addEventListener('click', () => {
    playClick();
    startScene(Number(button.dataset.scene));
  });
});
document.querySelector('#next-btn').addEventListener('click', () => {
  playClick();
  startScene((state.sceneIndex + 1) % SCENES.length);
});
document.querySelector('#again-btn').addEventListener('click', () => { playClick(); startScene(state.sceneIndex); });
document.querySelector('#win-menu-btn').addEventListener('click', () => { playClick(); showTitle(); });

document.addEventListener('keydown', (event) => {
  if (event.key === 'h' || event.key === 'H') useHint();
  if (event.key === 'r' || event.key === 'R') {
    if (state.playing) startScene(state.sceneIndex, { message: `${scene().name} restarted.` });
  }
});

// ---------- clock ----------

setInterval(() => {
  if (state.playing && !state.won) clockEl.textContent = formatTime(elapsedSeconds());
}, 250);

// ---------- boot: title screen, or a demo state from the URL ----------

function boot() {
  const demo = new URLSearchParams(window.location.search).get('demo');
  if (demo === 'mid') {
    const firstThree = differencesFor('night-market').slice(0, 3).map(d => d.id);
    startScene(0, { found: firstThree, seconds: 47, message: 'Three down, seven to go.' });
  } else if (demo === 'scene2') {
    startScene(1);
  } else if (demo === 'win') {
    startScene(0, { mistakes: 2, hintsUsed: 1 });
    state.found = new Set(differencesFor('night-market').map(d => d.id));
    state.baseSeconds = 155;
    renderPanels();
    showWin();
  } else {
    showTitle();
  }
}

boot();
