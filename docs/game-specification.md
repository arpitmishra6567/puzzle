# PUZZLED — Complete Game Specification (13 Playable Engines • 39 Levels)

## 1. Overview
PUZZLED implements **13 distinct, deterministic puzzle engines** across **39 handcrafted, verified levels** (3 difficulty tiers per game: **Basics** / `Easy`, **Core** / `Medium`, and **Pro** / `Hard`).
- **11 Active Daily Games**: `Neon`, `Currents`, `Snippets`, `Wordsmith`, `Starstruck`, `Bonza`, `Waywords`, `Crossover`, `Jigsaw`, `Combo`, and `Sudoku`.
- **2 Classic Vault Games**: `Shapes` and `Keysmash`.

---

## 2. Engine Specifications & Mathematical Rules

### 2.1 Neon (`src/engines/neon.ts`)
- **State**: `paths: Record<string, [number, number][]>` mapping each pair ID to an ordered orthogonal path of `[row, col]` coordinates, plus `activePairId: string | null`.
- **Rules**:
  1. Every pair `p` must have a continuous 4-connected path starting and ending at its two terminal coordinates `endpoints[0]` and `endpoints[1]`.
  2. No cell may appear in more than one path or twice within the same path.
- **Levels**: `neon-1` (*Prism Circuit*, 5×5, 4 pairs), `neon-2` (*Cyber Junction*, 5×5, 5 pairs), `neon-3` (*Synthwave Matrix*, 6×6, 6 pairs).

### 2.2 Currents (`src/engines/currents.ts`)
- **State**: `path: [number, number][]` representing the ordered stream from waypoint `1`.
- **Rules**:
  1. Path must start at waypoint `1`, move orthogonally to adjacent cells without self-intersection, and visit all `rows × cols` non-blocked cells.
  2. Waypoints `1, 2, ..., K` must appear along `path` in strict ascending index order.
- **Levels**: `currents-1` (*Tidal Stream*, 4×4, 4 waypoints), `currents-2` (*Eddy Rapid*, 5×5, 5 waypoints), `currents-3` (*Abyssal Trench*, 5×5, 6 waypoints).

### 2.3 Snippets (`src/engines/snippets.ts`)
- **State**: `rects: Record<string, { r1: number; c1: number; r2: number; c2: number }>` per clue ID, `selectedClueId`, and `anchorCell`.
- **Rules**:
  1. Each rectangle must have area `(r2 - r1 + 1) × (c2 - c1 + 1) === clue.value`.
  2. Each rectangle must contain its own clue coordinate `(clue.r, clue.c)` and no other clue's coordinate.
  3. Rectangles must be pairwise disjoint and cover 100% of the grid.
- **Levels**: `snippets-1` (*Origami Lantern*, 4×4, 4 clues), `snippets-2` (*Bento Partition*, 5×5, 5 clues), `snippets-3` (*Mosaic Tessellation*, 6×6, 6 clues).

### 2.4 Wordsmith (`src/engines/wordsmith.ts`)
- **State**: `foundWords: string[]`, `selectedCells: [number, number][]`, `score: number`, `rotation: 0 | 90 | 180 | 270`.
- **Rules**:
  1. Consecutive cells in `selectedCells` must be 8-way adjacent (`|dr| <= 1, |dc| <= 1`) and distinct.
  2. Submitting a traced word matching an unfound target word adds it to `foundWords` and awards `sum(tilePoints) + word.length * 10`.
- **Levels**: `wordsmith-1` (*Stellar Lexicon*, 4×4), `wordsmith-2` (*Botanical Garden*, 4×4), `wordsmith-3` (*Quantum Atelier*, 4×4).

### 2.5 Combo (`src/engines/combo.ts`)
- **State**: `guesses: string[][]`, `locked: boolean[]`, `activeStep: number`, `currentDraft: string`.
- **Rules**:
  1. A chain of `N` steps links `startWord` to consecutive target words (`prevWord + targetWord` forms a compound word or two-word phrase).
  2. The first letter `target[0]` is pre-revealed; submitting a guess evaluates per-letter feedback (`correct` = green, `present` = amber, `absent` = slate) and locks the step when exact.
- **Levels**: `combo-1` (*Solar Cascade*, 3 steps: `SUN -> LIGHT -> HOUSE -> WORK`), `combo-2` (*Oceanic Chain*, 4 steps: `SEA -> SHELL -> FISH -> NET -> WORK`), `combo-3` (*Chronos Loop*, 4 steps: `TIME -> TABLE -> TOP -> SOIL -> BANK`).

### 2.6 Starstruck (`src/engines/starstruck.ts`)
- **Rules**: Place exactly 1 star (`2`) per row, column, and colored region (`0..N-1`) on an `N×N` grid such that no two stars are 8-way adjacent. Supports auto-cross (`1`) assistive marking.
- **Levels**: `starstruck-1` (*Crown Meadow*, 5×5), `starstruck-2` (*Royal Conservatory*, 6×6), `starstruck-3` (*Obsidian Sovereign*, 7×7).

### 2.7 Bonza (`src/engines/bonza.ts`)
- **Rules**: Move rotatable/translatable word chunks by `(dr, dc)` offsets so every chunk reaches its target coordinates `(targetRow, targetCol)`, interlocking all crossing words.
- **Levels**: `bonza-1` (*Morning Ritual*), `bonza-2` (*Solar System*), `bonza-3` (*Symphony Hall*).

### 2.8 Waywords (`src/engines/waywords.ts`)
- **Rules**: Trace contiguous paths of adjacent letters matching every theme word so the combined path bridges the bottom launchpad row to the top goal row.
- **Levels**: `waywords-1` (*Mountain Trail*), `waywords-2` (*Ocean Voyage*), `waywords-3` (*Cosmic Odyssey*).

### 2.9 Crossover (`src/engines/crossover.ts`)
- **Rules**: Fill all non-blocked (`#`) cells on a 5×5 mini-crossword grid with letters `A–Z` matching every Across and Down clue.
- **Levels**: `crossover-1` (*Coffee Break*), `crossover-2` (*Starlight Grid*), `crossover-3` (*Artisan Studio*).

### 2.10 Jigsaw (`src/engines/jigsaw.ts`)
- **Rules**: Select unplaced polyomino picture pieces from the tray and place them onto their matching `(targetRow, targetCol)` board coordinates.
- **Levels**: `jigsaw-1` (*Sunrise Geometry*), `jigsaw-2` (*Alpine Reflections*), `jigsaw-3` (*Celestial Observatory*).

### 2.11 Sudoku (`src/engines/sudoku.ts`)
- **Rules**: Fill empty cells with digits `1..size` so every row, column, and `boxRows × boxCols` sub-box contains each digit once. Supports candidate pencil notes.
- **Levels**: `sudoku-1` (*amber-quartet*, 4×4), `sudoku-2` (*hexa-lattice*, 6×6), `sudoku-3` (*enigma-nine*, 9×9).

### 2.12 Shapes — Classic Vault (`src/engines/shapes.ts`)
- **Rules**: Rotate (`0..3`) and place polyomino pieces onto a target board mask so every `1` cell is covered exactly once.
- **Levels**: `shapes-1` (*Prism Square*), `shapes-2` (*Emerald Citadel*), `shapes-3` (*Labyrinth Monolith*).

### 2.13 Keysmash — Classic Vault (`src/engines/keysmash.ts`)
- **Rules**: Restore stripped vowels (`A, E, I, O, U`) into consonant skeletons to reconstruct each themed target word.
- **Levels**: `keysmash-1` (*Culinary Classics*), `keysmash-2` (*World Capitals*), `keysmash-3` (*Scientific Pioneers*).
