# Puzzle — Architecture, Daily Generator & Storage Migration

## 1. System Overview

- **`src/types/puzzle.ts`**: Core TypeScript interfaces for all 13 categories (`CategoryId`), `Difficulty` (`'Easy' | 'Medium' | 'Hard'`), `PuzzleDefinition`, `PuzzleEngine`, and `PersistedProfileV1`.
- **`src/engines/*.ts`**: 13 pure, deterministic state-machine engines (`neon`, `currents`, `snippets`, `wordsmith`, `starstruck`, `bonza`, `waywords`, `crossover`, `jigsaw`, `combo`, `sudoku`, `shapes`, `keysmash`) with full validation, conflict detection, smart hints, and JSON serialization.
- **`src/lib/daily_generator.ts` & `src/lib/daily.ts`**: Deterministic date-seeded daily challenge generator (`generateDailyPuzzle(dateStr, categoryId)`). Uses `daySerialFromDateStr(dateStr)` and a Mulberry32 PRNG (`createSeededRng`) to apply mathematical board transformations (dihedral symmetries, row/column band/stack permutations, digit relabeling, path reversals, and non-trivial tile derangements) so every calendar date produces a fresh, 100% solvable daily lineup (`id: "daily-YYYY-MM-DD-<categoryId>"`).
- **`src/lib/storage.ts`**: Schema-versioned local storage manager (`PRIMARY_STORAGE_KEY = 'puzzle_state_v1'`) with automatic read-time migration and mirroring from `LEGACY_STORAGE_KEY = 'puzzled_state_v1'`, corrupt JSON recovery, and in-memory fallback for restricted iframes.
- **`src/lib/audio.ts`**: Zero-dependency Web Audio API harmonic synthesizer paired with optional Web Vibration API (`navigator.vibrate`) haptics.
- **`src/lib/app_main.ts`**: Custom DOM renderer, hash router (`#/home`, `#/categories`, `#/collections`, `#/daily`, `#/about`, `#/privacy`, `#/contact`, `#/404`, `#/play/<id>`), unified pointer-drag / double-click / keyboard controller, and midnight date-rollover guard.
- **`scripts/compile-ts.cjs` & `scripts/build-app.cjs`**: Portable build pipeline that resolves `@babel/core` and `webpack` from local `node_modules` first with system Node path fallback, outputting `dist/index.html`, `dist/404.html`, `dist/manifest.webmanifest`, `dist/icon.svg`, `dist/sw.js`, `dist/robots.txt`, and `dist/sitemap.xml`.
