// SPDX-License-Identifier: MIT
// Pasar Perbedaan — hand-in program (Node 22, standard library only).
//
// The game itself is the static site under game/: two near-identical SVG
// pictures side by side, ten hidden differences per scene, clicked finds
// ringed on both panels. This program does no game logic; it hands the
// entry in. It copies game/ and screenshots/ from beside this file into
// the output directory and writes dossier.json there with buildDossier
// from the vendored make.fun library, byte for byte as the gate rebuilds
// it. Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for
// /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Play the game locally with `node serve.ts`, then open
// http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate's own caps, passed to buildDossier so an entry the scorer
// would refuse (a fifth screenshot, an oversized one, too many game
// files) fails here first instead of at grading time.
const DOSSIER_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function handIn(): void {
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
  const shotsDir = join(repoRoot, 'screenshots');
  if (existsSync(shotsDir)) {
    cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
  }
  const dossier = buildDossier(outputDir, DOSSIER_LIMITS);
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

handIn();
