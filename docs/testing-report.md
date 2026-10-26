# Puzzle — Verification & Automated Testing Report

## 1. Automated Unit & Integration Tests (`tests/unit/engines.test.mjs`)

Executed via `npm test` (`node scripts/compile-ts.cjs && node tests/unit/engines.test.mjs`):
- **Suite 1 — Catalog & Difficulty Tier Verification**: Confirms 11 Active Daily categories + 2 Classic Vault categories (13 total) and 39 curated casual levels (`Easy`, `Medium`, `Hard` for every category).
- **Suite 2 — 100% Hint Solvability Proof (All 39 Casual Levels)**: Confirms every level in `ALL_PUZZLES` starts unsolved (`isSolved: false`) and reaches `isSolved: true, valid: true, progressPercent: 100` via its engine's `applyHint` loop.
- **Suite 3 — Deterministic Date-Seeded Daily Generator Proof (`2026-10-26`, `2026-10-27`, `2026-10-28`)**:
  - Verifies same-date determinism across repeated calls.
  - Verifies consecutive dates generate distinct puzzle IDs (`daily-YYYY-MM-DD-<categoryId>`) and distinct board layouts (`JSON.stringify(p26.data) !== JSON.stringify(p27.data)`).
  - Verifies all 33 generated daily challenges across the 3 consecutive dates start unsolved and solve to 100% completion via `applyHint`.
- **Suites 4–9 — Engine Mechanics & Conflict Detection**: Tests wire routing and backtracking (`Neon`), ordered stream waypoints (`Currents`), rectangular area folds (`Snippets`), letter tracing and rotation (`Wordsmith`), compound word chains (`Combo`), star placement (`Starstruck`), 9×9 deduction (`Sudoku`), polyomino placement (`Shapes`), vowel reconstruction (`Keysmash`), and word-fragment assembly (`Bonza`).
- **Suite 10 — Backward-Compatible Storage Migration & Recovery**: Verifies transparent migration from `puzzled_state_v1` to `puzzle_state_v1`, `Puzzle •` share badge formatting, and corrupt JSON recovery.

## 2. Headless Chromium E2E & Multi-Viewport Inspection (`tests/e2e/browser_e2e.py`)

Executed via `npm run test:e2e`:
- Verifies `document.title === "Puzzle — Daily Puzzles"` and header `.brand-text === "Puzzle"`.
- Verifies all level pills use `Easy`, `Medium`, `Hard` terminology (zero `Basics`, `Core`, or `Pro` strings).
- Verifies in-game `Daily`, `Easy`, `Medium`, and `Hard` mode switching (`#btn-mode-daily`, `#btn-mode-easy`, `#btn-mode-medium`, `#btn-mode-hard`).
- Verifies real interactive gameplay, win modal celebration, and `Puzzle •` share summary output.
- Verifies `#/about`, `#/privacy`, and `#/404` routes.
- Verifies **zero horizontal overflow** (`scrollWidth <= clientWidth`) and **zero SEVERE browser console errors** across all 5 required viewports:
  1. `1440×900` (Desktop Hub & Gameplay)
  2. `1280×720` (Laptop Gameplay)
  3. `768×1024` (Tablet Gameplay)
  4. `390×844` (Mobile Hub)
  5. `320×700` (Narrow Mobile Sudoku Gameplay)
