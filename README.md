# Puzzle — Daily Logic, Word, Number & Spatial Puzzle Platform

**Puzzle** (`Puzzle — Daily Puzzles`) is a responsive, standalone daily puzzle and brain-training web application featuring **13 playable puzzle engines**: **11 Active Daily Catalog Games** (`Neon`, `Currents`, `Snippets`, `Wordsmith`, `Starstruck`, `Bonza`, `Waywords`, `Crossover`, `Jigsaw`, `Combo`, and `Sudoku`) plus **2 Classic Vault Games** (`Shapes` and `Keysmash`).

Every game includes:
- **Genuinely Changing Date-Seeded Daily Challenges** (`src/lib/daily_generator.ts` & `src/lib/daily.ts`): Every calendar date (`YYYY-MM-DD`) deterministically generates a fresh, validated, 100% solvable daily puzzle (`daily-YYYY-MM-DD-<categoryId>`) across all 11 active daily categories using mathematical board symmetries, digit/symbol/color permutations, derangements, and expanded thematic banks.
- **Progressive Casual Difficulty Tiers (`Easy`, `Medium`, `Hard`)**: Switch freely between today's **Daily** challenge and **Easy**, **Medium**, and **Hard** modes inside any game without overwriting or corrupting your daily progress.
- **Unified Pointer-Drag, Double-Click, & Keyboard Controls**: Trace paths or swap tiles by dragging across cells, double-click to clear/rotate/place stars, or navigate with directed arrow keys.
- **Backward-Compatible Local Persistence (`src/lib/storage.ts`)**: Saves progress under `puzzle_state_v1` while automatically migrating any existing player history, preferences, active sessions, and streaks from `puzzled_state_v1`.
- **Production Website & Mobile Readiness**: Includes PWA manifest (`manifest.webmanifest`), offline Service Worker (`sw.js`), custom SVG app icon (`icon.svg`), `vercel.json`, `capacitor.config.json`, and in-app **About & How to Play**, **Privacy Policy**, **Contact**, and **404 Not Found** routes.

## Quick Start

```bash
# 1. Compile TypeScript and run the 10-suite automated unit & daily-generator test suite
npm test

# 2. Build the production web bundle (dist/index.html + PWA assets)
npm run build

# 3. Run the Headless Chromium E2E & 5-Viewport layout verification suite
npm run test:e2e
```

## Pre-Publication Naming & Trademark Notice

Before publishing publicly under the generic name **Puzzle**, verify custom domain availability, Apple App Store / Google Play Store naming availability, and applicable trademark registrations in your target jurisdictions.
