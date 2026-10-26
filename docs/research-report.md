# PUZZLED — Reverse-Engineering & Catalog Reconciliation Report

## 1. Executive Summary & Catalog Reconciliation

Using the REA (Reverse Engineer Anything) methodology alongside public documentation and official help specifications for **Netflix Puzzled** (accessible on iOS, Android, and web at `tudum.com/puzzled`), we analyzed both the original launch lineup and the current 11-game daily catalog shown in the product reference screenshot.

### Reconciled 13-Game Catalog Mapping

| Game Title | Catalog Status | Engine Module | Primary Cognitive Domain | Core Mechanic Summary |
| :--- | :--- | :--- | :--- | :--- |
| **Neon** | **Active Daily (Featured)** | `src/engines/neon.ts` | Spatial Flow & Topology | Connect matching colored symbol pairs on a grid with continuous neon wires without crossing paths. |
| **Currents** | **Active Daily (Wide)** | `src/engines/currents.ts` | Hamiltonian Pathfinding | Trace a single continuous stream through every grid cell, visiting numbered nodes `1..K` in ascending order. |
| **Snippets** | **Active Daily** | `src/engines/snippets.ts` | Geometric Area Partition | Unfold numbered clues into non-overlapping rectangles whose cell areas match their numbers (Shikaku logic). |
| **Wordsmith** | **Active Daily** | `src/engines/wordsmith.ts` | 8-Way Lexical Search | Trace adjacent letter tiles (including diagonals) to forge target words and earn tile + length points; includes board rotation. |
| **Starstruck** | **Active Daily (Wide)** | `src/engines/starstruck.ts` | Deductive Constraint Logic | Place 1 star per row, column, and colored region with no two stars adjacent (even diagonally). |
| **Bonza** | **Active Daily** | `src/engines/bonza.ts` | Lexical Chunk Assembly | Slide and snap multi-letter fragments on an open grid until all crossing words interlock around the theme clue. |
| **Waywords** | **Active Daily** | `src/engines/waywords.ts` | Spatial Word Pathfinding | Connect adjacent letters to form a continuous path of valid theme words from the bottom launchpad to the top goal row. |
| **Crossover** | **Active Daily** | `src/engines/crossover.ts` | Crossword Deduction | Solve interlocking Across and Down clues on a compact mini-crossword grid. |
| **Jigsaw** | **Active Daily** | `src/engines/jigsaw.ts` | Visual-Spatial Assembly | Place interconnected polyomino image tiles into their exact coordinates on the target frame. |
| **Combo** | **Active Daily (Wide)** | `src/engines/combo.ts` | Compound Word Chaining | Complete a chain of two-word phrases where each second word starts the next phrase, with Green/Amber/Slate feedback. |
| **Sudoku** | **Active Daily** | `src/engines/sudoku.ts` | Latin Square Deduction | Fill every row, column, and sub-box with unique digits `1..N`, supported by candidate pencil marks. |
| **Shapes** | **Classic Vault** | `src/engines/shapes.ts` | Polyomino Packing | Rotate and place geometric polyomino blocks to tile the target silhouette without overlap. |
| **Keysmash** | **Classic Vault** | `src/engines/keysmash.ts` | Lexical Reconstruction | Restore missing vowels (`A, E, I, O, U`) into consonant skeletons to reveal themed words. |

---

## 2. Verified Primary Source Mechanics for New Daily Titles

1. **Neon** ([Official Netflix Puzzled Neon FAQ](https://games-netflix.helpshift.com/hc/en/8-netflix-puzzled/faq/2083-how-to-play-neon/)):
   - Each pair of matching colored symbols on the grid must be linked by a continuous orthogonal wire.
   - Wires cannot cross or overlap other wires or symbol terminals.
   - Tapping an earlier cell along a wire backtracks the wire to that point; the Lightbulb hint connects or corrects a full wire pair.
2. **Currents** ([Official Netflix Puzzled Currents FAQ](https://games-netflix.helpshift.com/hc/en/8-netflix-puzzled/faq/2080-how-to-play-currents/?p=ios)):
   - Start at node `1` and trace an unbroken orthogonal path visiting numbered waypoints `1, 2, ..., K` in strict ascending order.
   - Every cell in the grid must be visited exactly once (Hamiltonian path).
3. **Snippets** ([Official Netflix Puzzled Snippets FAQ](https://games-netflix.helpshift.com/hc/en/8-netflix-puzzled/faq/2067-how-to-play-snippets/)):
   - Each numbered cell represents a folded rectangular snippet whose total area (`width × height`) equals the number.
   - All grid cells must be covered by non-overlapping rectangles, each containing its corresponding numbered clue.
4. **Wordsmith** ([Official Netflix Puzzled Wordsmith FAQ](https://games-netflix.helpshift.com/hc/en/8-netflix-puzzled/faq/2122-how-to-play-wordsmith/)):
   - Players trace adjacent letter tiles in 8 directions (horizontal, vertical, diagonal) without reusing the same tile in a single word.
   - Each letter tile carries a point value (`10–30 pts`), combined with a length bonus; includes a **Rotate Board** action to inspect the letter matrix from fresh angles.
5. **Combo** ([Official Netflix Puzzled Combo FAQ](https://games-netflix.helpshift.com/hc/en/8-netflix-puzzled/faq/1847-how-to-play-combo/)):
   - Players solve an interconnected chain of compound words or two-word phrases linking the top anchor word to the bottom anchor word.
   - Each step reveals its starting letter and an emoji clue; submitted guesses receive color-coded letter feedback (Green = exact spot, Amber = wrong spot in word, Slate = not in word).

---

## 3. Separation of Inspiration vs. Standalone Product Identity

- **Reusable Mechanics**: Deterministic grid validation, progressive hints, undo/reset stacks, daily rotation, streak persistence, and spoiler-free emoji share grids.
- **Art-Directed Studio Identity**: Deep obsidian-charcoal surface hierarchy (`#090A0F` / `#12141D` / `#1A1D2B`), bespoke geometric inline SVG emblems for all 13 games, and an asymmetric Bento grid on the Daily Hub.
- **Universal Content**: Zero dependency on film/TV trivia or copyrighted IP. All 39 puzzles use universal astronomy, geometry, nature, architecture, and everyday vocabulary themes.
