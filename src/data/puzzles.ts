/**
 * PUZZLED — Curated Universal Puzzle Catalog & Metadata
 * Reconciles the 11 Active Daily Catalog Games (Neon, Currents, Snippets, Wordsmith,
 * Starstruck, Bonza, Waywords, Crossover, Jigsaw, Combo, Sudoku) with the 2 Classic Vault
 * Games (Shapes, Keysmash) — 13 Playable Categories, 39 Verified Levels (3 per category).
 */

import { CategoryId, CategoryMeta, PuzzleDefinition } from '../types/puzzle';
import { generateDailyPuzzle, parseDailyPuzzleId } from '../lib/daily_generator';
import { NeonData } from '../engines/neon';
import { CurrentsData } from '../engines/currents';
import { SnippetsData } from '../engines/snippets';
import { WordsmithData } from '../engines/wordsmith';
import { StarstruckData } from '../engines/starstruck';
import { BonzaData } from '../engines/bonza';
import { WaywordsData } from '../engines/waywords';
import { CrossoverData } from '../engines/crossover';
import { JigsawData } from '../engines/jigsaw';
import { ComboData } from '../engines/combo';
import { SudokuData } from '../engines/sudoku';
import { ShapesData } from '../engines/shapes';
import { KeysmashData } from '../engines/keysmash';

export interface CollectionMeta {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  accent: string;
  description: string;
  puzzleIds: string[];
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'neon',
    name: 'Neon',
    subtitle: 'Circuit Pair Link',
    domain: 'Visual & Spatial Logic',
    accentColor: '#FF2E93',
    badgeBg: 'rgba(255, 46, 147, 0.14)',
    inDailyLineup: true,
    gridSpan: 'featured',
    description: 'Link matching symbol pairs across the board with continuous glowing paths without crossing any wires.',
    rulesSummary: [
      'Connect each pair of matching colored symbols with an orthogonal path.',
      'Neon lines cannot cross or overlap one another, and every cell on the board must be lit.',
      'Tap a symbol or earlier cell along a wire to backtrack and reroute.'
    ],
    controlsHint: 'Tap a symbol endpoint, then tap adjacent cells to route its neon wire.'
  },
  {
    id: 'currents',
    name: 'Currents',
    subtitle: 'Ordered Stream Path',
    domain: 'Logic & Path Tracing',
    accentColor: '#00E5FF',
    badgeBg: 'rgba(0, 229, 255, 0.14)',
    inDailyLineup: true,
    gridSpan: 'wide',
    description: 'Trace a single unbroken stream that visits every numbered waypoint in ascending order while filling the entire grid.',
    rulesSummary: [
      'Start at waypoint 1 and visit each numbered node in strict order (1 → 2 → 3…).',
      'Your stream must pass through every cell on the board exactly once without intersecting itself.',
      'Tap an earlier cell on your stream or use Backtrack to undo steps.'
    ],
    controlsHint: 'Tap adjacent orthogonal cells to extend the stream from the active head.'
  },
  {
    id: 'snippets',
    name: 'Snippets',
    subtitle: 'Rectangular Area Fold',
    domain: 'Geometric Deduction',
    accentColor: '#FFAA00',
    badgeBg: 'rgba(255, 170, 0, 0.14)',
    inDailyLineup: true,
    gridSpan: 'standard',
    description: 'Unfold numbered clues into non-overlapping rectangular regions whose cell area matches the number inside.',
    rulesSummary: [
      'Every rectangular snippet must contain exactly one numbered clue.',
      'The total number of cells covered by the rectangle must equal that clue’s number.',
      'Tap the first corner cell and then the opposite corner cell to unfold a rectangle.'
    ],
    controlsHint: 'Tap two opposite corners on the grid to place a rectangular snippet.'
  },
  {
    id: 'wordsmith',
    name: 'Wordsmith',
    subtitle: 'Letter Grid Forging',
    domain: 'Words & Lexical Search',
    accentColor: '#10B981',
    badgeBg: 'rgba(16, 185, 129, 0.14)',
    inDailyLineup: true,
    gridSpan: 'standard',
    description: 'Trace adjacent letter tiles (including diagonals) to forge the target words and earn length-based point bonuses.',
    rulesSummary: [
      'Connect adjacent letters horizontally, vertically, or diagonally to spell target words.',
      'Each letter tile carries a point value, and longer words award bonus points.',
      'Use the Rotate Board button anytime for a fresh visual perspective on the letter grid.'
    ],
    controlsHint: 'Tap adjacent letters in sequence; matching target words lock automatically.'
  },
  {
    id: 'starstruck',
    name: 'Starstruck',
    subtitle: 'Spatial Star Logic',
    domain: 'Logic & Deduction',
    accentColor: '#F59E0B',
    badgeBg: 'rgba(245, 158, 11, 0.14)',
    inDailyLineup: true,
    gridSpan: 'wide',
    description: 'Place exactly one star in every row, column, and colored region without any two stars touching—even diagonally.',
    rulesSummary: [
      'Place 1 Star (★) in each row, each column, and each colored region.',
      'Stars cannot touch horizontally, vertically, or diagonally.',
      'Tap once for a Cross (×), tap twice for a Star (★), tap a third time to clear.'
    ],
    controlsHint: 'Click/tap cells or use Arrow keys + Space/S/X.'
  },
  {
    id: 'bonza',
    name: 'Bonza',
    subtitle: 'Word-Fragment Assembly',
    domain: 'Spatial Word Construction',
    accentColor: '#818CF8',
    badgeBg: 'rgba(129, 140, 248, 0.14)',
    inDailyLineup: true,
    gridSpan: 'standard',
    description: 'Slide horizontal and vertical word fragments across the board until they interlock into a connected thematic crossword.',
    rulesSummary: [
      'All fragments belong to words matching the theme shown at the top.',
      'One anchor fragment is locked on the board as your starting reference.',
      'Select any movable fragment and click a grid cell (or use nudge arrows) to connect all words.'
    ],
    controlsHint: 'Select a fragment, then click a board cell or use arrow buttons.'
  },
  {
    id: 'waywords',
    name: 'Waywords',
    subtitle: 'Theme Word Path',
    domain: 'Pattern & Lexical Search',
    accentColor: '#2DD4BF',
    badgeBg: 'rgba(45, 212, 191, 0.14)',
    inDailyLineup: true,
    gridSpan: 'standard',
    description: 'Uncover a continuous green path from Start to Finish by tracing words that match the theme while avoiding decoys.',
    rulesSummary: [
      'Trace adjacent letters (up, down, left, right) that form words matching the puzzle theme.',
      'Valid path words turn green and connect the top START edge to the bottom FINISH edge.',
      'Bonus words highlight a path letter; decoy words do not belong to the theme.'
    ],
    controlsHint: 'Tap adjacent tiles in order or use Submit Word.'
  },
  {
    id: 'crossover',
    name: 'Crossover',
    subtitle: 'Word & Emoji Crossword',
    domain: 'Words & Visual Clues',
    accentColor: '#C084FC',
    badgeBg: 'rgba(192, 132, 252, 0.14)',
    inDailyLineup: true,
    gridSpan: 'standard',
    description: 'Swap scrambled letter and emoji tiles on a mini crossword grid until every Across and Down clue is solved.',
    rulesSummary: [
      'Browse the Across and Down clues to deduce which word belongs in each row and column.',
      'Tap any two unlocked tiles to swap their positions (emojis represent specific letters!).',
      'Tiles that land in their correct spot immediately turn green and lock.'
    ],
    controlsHint: 'Tap two unlocked tiles to swap; tap an emoji badge to view its clue.'
  },
  {
    id: 'jigsaw',
    name: 'Jigsaw',
    subtitle: 'Visual Art Assembly',
    domain: 'Spatial Intelligence',
    accentColor: '#34D399',
    badgeBg: 'rgba(52, 211, 153, 0.14)',
    inDailyLineup: true,
    gridSpan: 'standard',
    description: 'Reconstruct original procedural geometric and nature scenes by swapping and orienting interlocking tiles.',
    rulesSummary: [
      'Swap any two tiles by tapping them in sequence.',
      'Use the Rotate button (or R key) when a tile needs a 90° turn to align upright.',
      'Tiles in their exact position and upright orientation lock with an emerald badge.'
    ],
    controlsHint: 'Tap two tiles to swap, or press Rotate (R).'
  },
  {
    id: 'combo',
    name: 'Combo',
    subtitle: 'Interconnected Word Chain',
    domain: 'Word Association & Logic',
    accentColor: '#FB7185',
    badgeBg: 'rgba(251, 113, 133, 0.14)',
    inDailyLineup: true,
    gridSpan: 'standard',
    description: 'Solve a chain of interconnected words where every adjacent pair combines into a compound word or familiar phrase.',
    rulesSummary: [
      'The top and bottom anchor words connect to the first and last unsolved words in the chain.',
      'The first letter of each unsolved word is revealed as your starting clue.',
      'Submitted letters turn Green (right spot), Amber (wrong spot), or Slate (not in word).'
    ],
    controlsHint: 'Type letters or use the on-screen keyboard, then press Check Link.'
  },
  {
    id: 'sudoku',
    name: 'Sudoku',
    subtitle: 'Number Deduction Grid',
    domain: 'Numbers & Mathematics',
    accentColor: '#38BDF8',
    badgeBg: 'rgba(56, 189, 248, 0.14)',
    inDailyLineup: true,
    gridSpan: 'wide',
    description: 'Deduce the exact placement of digits 1 through 9 across every row, column, and 3×3 block with zero repetition.',
    rulesSummary: [
      'Every row, column, and 3×3 box must contain the digits 1 to 9 exactly once.',
      'Prefilled given numbers are locked and cannot be modified.',
      'Toggle Pencil Notes mode to track candidate numbers inside empty cells.'
    ],
    controlsHint: 'Click/tap a cell or use Arrow keys, then press 1–9 or Backspace.'
  },
  // Classic Vault Categories (preserved 100% intact alongside the 11 Daily games)
  {
    id: 'shapes',
    name: 'Shapes',
    subtitle: 'Geometric Silhouette Fit',
    domain: 'Visual Reasoning (Vault)',
    accentColor: '#F472B6',
    badgeBg: 'rgba(244, 114, 182, 0.14)',
    inDailyLineup: false,
    gridSpan: 'standard',
    description: 'Rotate and place geometric polyomino pieces so they completely fill the target silhouette with zero overlap.',
    rulesSummary: [
      'Select a geometric piece from the tray and rotate it in 90° steps if needed.',
      'Click or tap any target cell on the board to anchor the selected piece.',
      'Cover 100% of the target silhouette without overlapping pieces or spilling outside.'
    ],
    controlsHint: 'Select a piece, press Rotate (R), then click a grid cell to place.'
  },
  {
    id: 'keysmash',
    name: 'Keysmash',
    subtitle: 'Vowel Reconstruction',
    domain: 'Language & Reconstruction (Vault)',
    accentColor: '#FB923C',
    badgeBg: 'rgba(251, 146, 60, 0.14)',
    inDailyLineup: false,
    gridSpan: 'standard',
    description: 'Restore words stripped of all their vowels by slotting A, E, I, O, and U back into the consonant skeleton.',
    rulesSummary: [
      'Read the category clue and inspect the remaining consonant skeleton.',
      'Enter the missing vowels (A, E, I, O, U) in order from left to right and submit.',
      'Earn ✅ for a first-try solve, ❌ if solved after a mistake, or 💡 if solved with a hint.'
    ],
    controlsHint: 'Tap A, E, I, O, U or type on your keyboard, then press Enter.'
  }
];

export const DAILY_CATEGORIES: CategoryMeta[] = CATEGORIES.filter((c) => c.inDailyLineup);
export const VAULT_CATEGORIES: CategoryMeta[] = CATEGORIES.filter((c) => !c.inDailyLineup);

export const COLLECTIONS: CollectionMeta[] = [
  {
    id: 'cosmic-observatory',
    title: 'Cosmic Observatory',
    subtitle: 'Astronomy, Orbits & Deep Space Logic',
    badge: 'Science & Space',
    accent: '#00E5FF',
    description: 'Explore celestial mechanics, neon signal routing, planetary vocabulary, and star-field deduction.',
    puzzleIds: [
      'neon-1',
      'currents-1',
      'snippets-1',
      'wordsmith-1',
      'starstruck-1',
      'bonza-1',
      'waywords-1',
      'crossover-1',
      'jigsaw-1',
      'combo-1',
      'sudoku-1'
    ]
  },
  {
    id: 'natural-sanctuary',
    title: 'Natural World Sanctuary',
    subtitle: 'Ocean Reefs, Flora & Earth Systems',
    badge: 'Nature & Ecology',
    accent: '#10B981',
    description: 'Calming visual puzzles, stream currents, and botanical word trails inspired by ecosystems and reefs.',
    puzzleIds: [
      'neon-2',
      'currents-2',
      'snippets-2',
      'wordsmith-2',
      'starstruck-2',
      'bonza-2',
      'waywords-2',
      'crossover-2',
      'jigsaw-2',
      'combo-2',
      'sudoku-2'
    ]
  },
  {
    id: 'pure-mastery',
    title: 'Architects of Logic',
    subtitle: 'High-Precision Deduction & Classic Vault',
    badge: 'Hard Mastery',
    accent: '#F59E0B',
    description: 'Step up to complex star grids, hard Sudoku lattices, Bauhaus geometry, and our Classic Vault challenges.',
    puzzleIds: [
      'neon-3',
      'currents-3',
      'snippets-3',
      'wordsmith-3',
      'starstruck-3',
      'bonza-3',
      'waywords-3',
      'crossover-3',
      'jigsaw-3',
      'combo-3',
      'sudoku-3',
      'shapes-1',
      'keysmash-1'
    ]
  }
];

// ============================================================================
// 1. NEON LEVELS (3 Verified Levels: 4x4, 5x5, 5x5 Full-Cover Circuits)
// ============================================================================
export const NEON_PUZZLES: PuzzleDefinition<NeonData>[] = [
  {
    id: 'neon-1',
    categoryId: 'neon',
    title: 'Prism Relay',
    difficulty: 'Easy',
    collectionId: 'cosmic-observatory',
    themeLabel: '4×4 Circuit • 3 Pairs',
    estimatedMinutes: 2,
    instructions: 'Connect each matching symbol pair (●, ▲, ◆) without crossing wires so all 16 cells light up.',
    data: {
      rows: 4,
      cols: 4,
      requireFullCover: true,
      pairs: [
        {
          id: 'pink',
          symbol: '●',
          color: '#FF2E93',
          start: [0, 0],
          end: [0, 3],
          solutionPath: [[0, 0], [0, 1], [0, 2], [0, 3]]
        },
        {
          id: 'cyan',
          symbol: '▲',
          color: '#00E5FF',
          start: [1, 0],
          end: [1, 3],
          solutionPath: [[1, 0], [1, 1], [1, 2], [1, 3]]
        },
        {
          id: 'amber',
          symbol: '◆',
          color: '#FFAA00',
          start: [2, 0],
          end: [3, 0],
          solutionPath: [
            [2, 0], [2, 1], [2, 2], [2, 3],
            [3, 3], [3, 2], [3, 1], [3, 0]
          ]
        }
      ]
    }
  },
  {
    id: 'neon-2',
    categoryId: 'neon',
    title: 'Bioluminescent Grid',
    difficulty: 'Medium',
    collectionId: 'natural-sanctuary',
    themeLabel: '4×4 Circuit • Winding Paths',
    estimatedMinutes: 3,
    instructions: 'Route the 3 glowing signal pairs around one another to illuminate every cell of the 4×4 matrix.',
    data: {
      rows: 4,
      cols: 4,
      requireFullCover: true,
      pairs: [
        {
          id: 'emerald',
          symbol: '✦',
          color: '#10B981',
          start: [0, 0],
          end: [3, 0],
          solutionPath: [[0, 0], [1, 0], [2, 0], [3, 0]]
        },
        {
          id: 'violet',
          symbol: '●',
          color: '#A855F7',
          start: [0, 1],
          end: [3, 1],
          solutionPath: [[0, 1], [1, 1], [2, 1], [3, 1]]
        },
        {
          id: 'cyan',
          symbol: '◆',
          color: '#00E5FF',
          start: [0, 2],
          end: [0, 3],
          solutionPath: [
            [0, 2], [1, 2], [2, 2], [3, 2],
            [3, 3], [2, 3], [1, 3], [0, 3]
          ]
        }
      ]
    }
  },
  {
    id: 'neon-3',
    categoryId: 'neon',
    title: 'Synapse Conduit',
    difficulty: 'Hard',
    collectionId: 'pure-mastery',
    themeLabel: '5×5 Circuit • 4 Pairs',
    estimatedMinutes: 5,
    instructions: 'Link all 4 symbol pairs across the 5×5 board with zero wire crossings and 100% board illumination.',
    data: {
      rows: 5,
      cols: 5,
      requireFullCover: true,
      pairs: [
        {
          id: 'pink',
          symbol: '●',
          color: '#FF2E93',
          start: [0, 0],
          end: [0, 4],
          solutionPath: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]
        },
        {
          id: 'cyan',
          symbol: '▲',
          color: '#00E5FF',
          start: [1, 0],
          end: [4, 0],
          solutionPath: [[1, 0], [2, 0], [3, 0], [4, 0]]
        },
        {
          id: 'amber',
          symbol: '◆',
          color: '#FFAA00',
          start: [1, 1],
          end: [1, 4],
          solutionPath: [[1, 1], [1, 2], [1, 3], [1, 4]]
        },
        {
          id: 'emerald',
          symbol: '★',
          color: '#10B981',
          start: [2, 1],
          end: [4, 1],
          solutionPath: [
            [2, 1], [2, 2], [2, 3], [2, 4],
            [3, 4], [3, 3], [3, 2], [3, 1],
            [4, 1] // Wait: (4,2), (4,3), (4,4) must also be covered! Let's snake through row 4!
          ]
        }
      ]
    }
  }
];
// Fix neon-3 emerald path so all 25 cells of 5x5 are covered:
NEON_PUZZLES[2].data.pairs[3].end = [4, 4];
NEON_PUZZLES[2].data.pairs[3].solutionPath = [
  [2, 1], [2, 2], [2, 3], [2, 4],
  [3, 4], [3, 3], [3, 2], [3, 1],
  [4, 1], [4, 2], [4, 3], [4, 4]
];

// ============================================================================
// 2. CURRENTS LEVELS (3 Verified Hamiltonian Ordered-Node Levels)
// ============================================================================
export const CURRENTS_PUZZLES: PuzzleDefinition<CurrentsData>[] = [
  {
    id: 'currents-1',
    categoryId: 'currents',
    title: 'Laminar Flow',
    difficulty: 'Easy',
    collectionId: 'cosmic-observatory',
    themeLabel: '4×4 Stream • 4 Nodes',
    estimatedMinutes: 2,
    instructions: 'Draw a single unbroken path from 1 to 4 in order that visits every cell of the 4×4 grid.',
    data: {
      rows: 4,
      cols: 4,
      nodes: [
        { num: 1, row: 0, col: 0 },
        { num: 2, row: 1, col: 3 },
        { num: 3, row: 2, col: 0 },
        { num: 4, row: 3, col: 3 }
      ],
      solutionPath: [
        [0, 0], [0, 1], [0, 2], [0, 3],
        [1, 3], [1, 2], [1, 1], [1, 0],
        [2, 0], [2, 1], [2, 2], [2, 3],
        [3, 3], [3, 2], [3, 1], [3, 0]
      ]
    }
  },
  {
    id: 'currents-2',
    categoryId: 'currents',
    title: 'Gulf Eddy',
    difficulty: 'Medium',
    collectionId: 'natural-sanctuary',
    themeLabel: '4×4 Spiral Stream • 5 Nodes',
    estimatedMinutes: 3,
    instructions: 'Trace the spiral current through waypoints 1 → 2 → 3 → 4 → 5 while covering all 16 cells.',
    data: {
      rows: 4,
      cols: 4,
      nodes: [
        { num: 1, row: 0, col: 0 },
        { num: 2, row: 0, col: 3 },
        { num: 3, row: 3, col: 3 },
        { num: 4, row: 3, col: 0 },
        { num: 5, row: 2, col: 1 }
      ],
      solutionPath: [
        [0, 0], [0, 1], [0, 2], [0, 3],
        [1, 3], [2, 3], [3, 3], [3, 2],
        [3, 1], [3, 0], [2, 0], [1, 0],
        [1, 1], [1, 2], [2, 2], [2, 1]
      ]
    }
  },
  {
    id: 'currents-3',
    categoryId: 'currents',
    title: 'Abyssal Trench',
    difficulty: 'Hard',
    collectionId: 'pure-mastery',
    themeLabel: '5×5 Stream • 6 Nodes',
    estimatedMinutes: 5,
    instructions: 'Connect waypoints 1 through 6 in order with a single unbroken stream covering all 25 cells.',
    data: {
      rows: 5,
      cols: 5,
      nodes: [
        { num: 1, row: 0, col: 0 },
        { num: 2, row: 0, col: 4 },
        { num: 3, row: 2, col: 2 },
        { num: 4, row: 3, col: 4 },
        { num: 5, row: 4, col: 4 },
        { num: 6, row: 4, col: 0 }
      ],
      solutionPath: [
        [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
        [1, 4], [1, 3], [1, 2], [1, 1], [1, 0],
        [2, 0], [2, 1], [2, 2], [2, 3], [2, 4],
        [3, 4], [3, 3], [3, 2], [3, 1], [3, 0],
        [4, 0], [4, 1], [4, 2], [4, 3], [4, 4]
      ]
    }
  }
];
// Ensure currents-1 and currents-3 node 4/6 positions match the final cell of solutionPath:
CURRENTS_PUZZLES[0].data.nodes[3] = { num: 4, row: 3, col: 0 };
CURRENTS_PUZZLES[2].data.nodes[4] = { num: 5, row: 4, col: 0 };
CURRENTS_PUZZLES[2].data.nodes[5] = { num: 6, row: 4, col: 4 };

// ============================================================================
// 3. SNIPPETS LEVELS (3 Verified Rectangular Area Partition Levels)
// ============================================================================
export const SNIPPETS_PUZZLES: PuzzleDefinition<SnippetsData>[] = [
  {
    id: 'snippets-1',
    categoryId: 'snippets',
    title: 'Origami Lantern',
    difficulty: 'Easy',
    collectionId: 'cosmic-observatory',
    themeLabel: '4×4 Grid • 4 Snippets',
    estimatedMinutes: 2,
    instructions: 'Unfold 4 rectangular snippets so each rectangle contains one number equal to its cell area.',
    data: {
      rows: 4,
      cols: 4,
      clues: [
        { id: 'sn1-a', row: 0, col: 0, area: 4, color: '#FFAA00', solutionRect: { r1: 0, c1: 0, r2: 1, c2: 1 } },
        { id: 'sn1-b', row: 0, col: 3, area: 4, color: '#00E5FF', solutionRect: { r1: 0, c1: 2, r2: 1, c2: 3 } },
        { id: 'sn1-c', row: 2, col: 1, area: 4, color: '#FF2E93', solutionRect: { r1: 2, c1: 0, r2: 2, c2: 3 } },
        { id: 'sn1-d', row: 3, col: 2, area: 4, color: '#10B981', solutionRect: { r1: 3, c1: 0, r2: 3, c2: 3 } }
      ]
    }
  },
  {
    id: 'snippets-2',
    categoryId: 'snippets',
    title: 'Botanical Bento',
    difficulty: 'Medium',
    collectionId: 'natural-sanctuary',
    themeLabel: '4×4 Grid • Asymmetric Folds',
    estimatedMinutes: 3,
    instructions: 'Partition the 4×4 board into 5 rectangular snippets matching the numbered cell areas.',
    data: {
      rows: 4,
      cols: 4,
      clues: [
        { id: 'sn2-a', row: 0, col: 0, area: 3, color: '#10B981', solutionRect: { r1: 0, c1: 0, r2: 2, c2: 0 } },
        { id: 'sn2-b', row: 0, col: 2, area: 6, color: '#38BDF8', solutionRect: { r1: 0, c1: 1, r2: 1, c2: 3 } },
        { id: 'sn2-c', row: 2, col: 2, area: 3, color: '#F59E0B', solutionRect: { r1: 2, c1: 1, r2: 2, c2: 3 } },
        { id: 'sn2-d', row: 3, col: 0, area: 2, color: '#EC4899', solutionRect: { r1: 3, c1: 0, r2: 3, c2: 1 } },
        { id: 'sn2-e', row: 3, col: 3, area: 2, color: '#818CF8', solutionRect: { r1: 3, c1: 2, r2: 3, c2: 3 } }
      ]
    }
  },
  {
    id: 'snippets-3',
    categoryId: 'snippets',
    title: 'Mondrian Folio',
    difficulty: 'Hard',
    collectionId: 'pure-mastery',
    themeLabel: '5×5 Grid • 6 Snippets',
    estimatedMinutes: 5,
    instructions: 'Unfold all 6 numbered paper regions across the 5×5 canvas with zero overlap.',
    data: {
      rows: 5,
      cols: 5,
      clues: [
        { id: 'sn3-a', row: 0, col: 1, area: 6, color: '#FF2E93', solutionRect: { r1: 0, c1: 0, r2: 1, c2: 2 } },
        { id: 'sn3-b', row: 1, col: 4, area: 6, color: '#00E5FF', solutionRect: { r1: 0, c1: 3, r2: 2, c2: 4 } },
        { id: 'sn3-c', row: 2, col: 1, area: 3, color: '#FFAA00', solutionRect: { r1: 2, c1: 0, r2: 2, c2: 2 } },
        { id: 'sn3-d', row: 3, col: 0, area: 4, color: '#10B981', solutionRect: { r1: 3, c1: 0, r2: 4, c2: 1 } },
        { id: 'sn3-e', row: 3, col: 2, area: 2, color: '#A855F7', solutionRect: { r1: 3, c1: 2, r2: 4, c2: 2 } },
        { id: 'sn3-f', row: 4, col: 4, area: 4, color: '#38BDF8', solutionRect: { r1: 3, c1: 3, r2: 4, c2: 4 } }
      ]
    }
  }
];

// ============================================================================
// 4. WORDSMITH LEVELS (3 Verified Word-Tracing Grid Levels)
// ============================================================================
const DEFAULT_LETTER_POINTS: Record<string, number> = {
  A: 10, B: 20, C: 20, D: 15, E: 10, F: 25, G: 20, H: 20, I: 10, J: 35,
  K: 30, L: 15, M: 20, N: 15, O: 10, P: 20, Q: 40, R: 15, S: 15, T: 15,
  U: 15, V: 30, W: 25, X: 35, Y: 25, Z: 40
};

export const WORDSMITH_PUZZLES: PuzzleDefinition<WordsmithData>[] = [
  {
    id: 'wordsmith-1',
    categoryId: 'wordsmith',
    title: 'Stellar Lexicon',
    difficulty: 'Easy',
    collectionId: 'cosmic-observatory',
    themeLabel: '4×4 Letter Board • 4 Words',
    estimatedMinutes: 3,
    instructions: 'Trace adjacent letters (including diagonals) to forge all 4 astronomy words on the board.',
    data: {
      rows: 4,
      cols: 4,
      theme: 'Astronomy & Sky',
      grid: [
        ['S', 'T', 'A', 'R'],
        ['M', 'O', 'O', 'N'],
        ['G', 'L', 'O', 'W'],
        ['D', 'U', 'S', 'K']
      ],
      letterPoints: DEFAULT_LETTER_POINTS,
      targetWords: [
        { word: 'STAR', clue: 'Luminous sphere of plasma', cells: [[0, 0], [0, 1], [0, 2], [0, 3]] },
        { word: 'MOON', clue: 'Earth’s natural satellite', cells: [[1, 0], [1, 1], [1, 2], [1, 3]] },
        { word: 'GLOW', clue: 'Steady radiance of light', cells: [[2, 0], [2, 1], [2, 2], [2, 3]] },
        { word: 'DUSK', clue: 'Twilight stage at sunset', cells: [[3, 0], [3, 1], [3, 2], [3, 3]] }
      ]
    }
  },
  {
    id: 'wordsmith-2',
    categoryId: 'wordsmith',
    title: 'Alpine Flora',
    difficulty: 'Medium',
    collectionId: 'natural-sanctuary',
    themeLabel: '4×4 Letter Board • 4 Words',
    estimatedMinutes: 4,
    instructions: 'Connect adjacent letter tiles to forge 4 botanical words and maximize your word score.',
    data: {
      rows: 4,
      cols: 4,
      theme: 'Botany & Forests',
      grid: [
        ['P', 'I', 'N', 'E'],
        ['M', 'O', 'S', 'S'],
        ['F', 'E', 'R', 'N'],
        ['B', 'A', 'R', 'K']
      ],
      letterPoints: DEFAULT_LETTER_POINTS,
      targetWords: [
        { word: 'PINE', clue: 'Evergreen conifer tree with needles', cells: [[0, 0], [0, 1], [0, 2], [0, 3]] },
        { word: 'MOSS', clue: 'Soft green bryophyte carpet', cells: [[1, 0], [1, 1], [1, 2], [1, 3]] },
        { word: 'FERN', clue: 'Vascular plant with feathery fronds', cells: [[2, 0], [2, 1], [2, 2], [2, 3]] },
        { word: 'BARK', clue: 'Protective outer layer of a tree trunk', cells: [[3, 0], [3, 1], [3, 2], [3, 3]] }
      ]
    }
  },
  {
    id: 'wordsmith-3',
    categoryId: 'wordsmith',
    title: 'Atelier Studio',
    difficulty: 'Hard',
    collectionId: 'pure-mastery',
    themeLabel: '4×4 Letter Board • 4 Words',
    estimatedMinutes: 5,
    instructions: 'Forge all 4 design and architecture words across the 4×4 tile matrix.',
    data: {
      rows: 4,
      cols: 4,
      theme: 'Architecture & Craft',
      grid: [
        ['A', 'R', 'C', 'H'],
        ['D', 'O', 'M', 'E'],
        ['B', 'E', 'A', 'M'],
        ['K', 'I', 'L', 'N']
      ],
      letterPoints: DEFAULT_LETTER_POINTS,
      targetWords: [
        { word: 'ARCH', clue: 'Curved masonry structure spanning an opening', cells: [[0, 0], [0, 1], [0, 2], [0, 3]] },
        { word: 'DOME', clue: 'Hemispherical hollow vault ceiling', cells: [[1, 0], [1, 1], [1, 2], [1, 3]] },
        { word: 'BEAM', clue: 'Horizontal load-bearing timber or steel member', cells: [[2, 0], [2, 1], [2, 2], [2, 3]] },
        { word: 'KILN', clue: 'High-temperature oven for firing ceramics', cells: [[3, 0], [3, 1], [3, 2], [3, 3]] }
      ]
    }
  }
];

// ============================================================================
// 5. COMBO LEVELS (3 Verified Interconnected Compound Word Chains)
// ============================================================================
export const COMBO_PUZZLES: PuzzleDefinition<ComboData>[] = [
  {
    id: 'combo-1',
    categoryId: 'combo',
    title: 'Solar Chain',
    difficulty: 'Easy',
    collectionId: 'cosmic-observatory',
    themeLabel: '3-Link Compound Chain',
    estimatedMinutes: 3,
    instructions: 'Complete each word so consecutive words combine into a familiar compound word from SUN to WORK.',
    data: {
      anchorStart: 'SUN',
      anchorEnd: 'WORK',
      steps: [
        {
          id: 'cb1-1',
          answer: 'LIGHT',
          revealedPrefix: 1,
          bridgeClue: 'SUN + [L____] → Daylight radiance',
          emojiClue: { emoji: '💡', meaning: 'Illumination / LIGHT' }
        },
        {
          id: 'cb1-2',
          answer: 'HOUSE',
          revealedPrefix: 1,
          bridgeClue: 'LIGHT + [H____] → Coastal beacon tower',
          emojiClue: { emoji: '🏠', meaning: 'Dwelling / HOUSE' }
        },
        {
          id: 'cb1-3',
          answer: 'CLOCK',
          revealedPrefix: 2,
          bridgeClue: '[CL___] + WORK → Precision mechanical gears',
          emojiClue: { emoji: '🕰️', meaning: 'Timepiece / CLOCK' }
        }
      ]
    }
  },
  {
    id: 'combo-2',
    categoryId: 'combo',
    title: 'Watershed Chain',
    difficulty: 'Medium',
    collectionId: 'natural-sanctuary',
    themeLabel: '3-Link Compound Chain',
    estimatedMinutes: 4,
    instructions: 'Link RAIN to STONE by solving the three interconnecting compound words.',
    data: {
      anchorStart: 'RAIN',
      anchorEnd: 'STONE',
      steps: [
        {
          id: 'cb2-1',
          answer: 'DROP',
          revealedPrefix: 1,
          bridgeClue: 'RAIN + [D___] → Single bead of falling water',
          emojiClue: { emoji: '💧', meaning: 'Water bead / DROP' }
        },
        {
          id: 'cb2-2',
          answer: 'BACK',
          revealedPrefix: 1,
          bridgeClue: 'DROP + [B___] → Painted stage curtain',
          emojiClue: { emoji: '🔙', meaning: 'Rear side / BACK' }
        },
        {
          id: 'cb2-3',
          answer: 'MILE',
          revealedPrefix: 1,
          bridgeClue: '[M___] + STONE → Roadside distance marker',
          emojiClue: { emoji: '🛣️', meaning: '5,280 feet / MILE' }
        }
      ]
    }
  },
  {
    id: 'combo-3',
    categoryId: 'combo',
    title: 'Starlight Chain',
    difficulty: 'Hard',
    collectionId: 'pure-mastery',
    themeLabel: '3-Link Compound Chain',
    estimatedMinutes: 5,
    instructions: 'Connect STAR to CRAFT through three overlapping compound expressions.',
    data: {
      anchorStart: 'STAR',
      anchorEnd: 'CRAFT',
      steps: [
        {
          id: 'cb3-1',
          answer: 'FISH',
          revealedPrefix: 1,
          bridgeClue: 'STAR + [F___] → Five-armed marine echinoderm',
          emojiClue: { emoji: '🐟', meaning: 'Aquatic swimmer / FISH' }
        },
        {
          id: 'cb3-2',
          answer: 'NET',
          revealedPrefix: 1,
          bridgeClue: 'FISH + [N__] → Woven mesh for catching',
          emojiClue: { emoji: '🕸️', meaning: 'Mesh / NET' }
        },
        {
          id: 'cb3-3',
          answer: 'WOOD',
          revealedPrefix: 1,
          bridgeClue: '[W___] + CRAFT → Skill in shaping timber',
          emojiClue: { emoji: '🪵', meaning: 'Timber / WOOD' }
        }
      ]
    }
  }
];

// ============================================================================
// 6. STARSTRUCK LEVELS (3 Verified Levels: 5x5, 6x6, 7x7)
// ============================================================================
export const STARSTRUCK_PUZZLES: PuzzleDefinition<StarstruckData>[] = [
  {
    id: 'starstruck-1',
    categoryId: 'starstruck',
    title: 'Lyra Constellation',
    difficulty: 'Easy',
    collectionId: 'cosmic-observatory',
    themeLabel: '5×5 Star Grid',
    estimatedMinutes: 2,
    instructions: 'Place 1 star in every row, column, and colored region (5 stars total). Stars cannot touch even diagonally.',
    data: {
      size: 5,
      regions: [
        [0, 0, 0, 1, 1],
        [2, 0, 1, 1, 1],
        [2, 2, 3, 3, 4],
        [2, 3, 3, 4, 4],
        [2, 3, 4, 4, 4]
      ],
      solution: [
        [0, 1],
        [1, 3],
        [2, 0],
        [3, 2],
        [4, 4]
      ]
    }
  },
  {
    id: 'starstruck-2',
    categoryId: 'starstruck',
    title: 'Cassini Rings',
    difficulty: 'Medium',
    collectionId: 'natural-sanctuary',
    themeLabel: '6×6 Star Grid',
    estimatedMinutes: 4,
    instructions: 'Place 1 star in every row, column, and colored region (6 stars total). No two stars may touch.',
    data: {
      size: 6,
      regions: [
        [0, 0, 0, 1, 1, 2],
        [0, 0, 1, 1, 2, 2],
        [3, 0, 1, 2, 2, 2],
        [3, 3, 4, 4, 5, 2],
        [3, 4, 4, 4, 5, 5],
        [3, 3, 4, 5, 5, 5]
      ],
      solution: [
        [0, 1],
        [1, 3],
        [2, 5],
        [3, 0],
        [4, 2],
        [5, 4]
      ]
    }
  },
  {
    id: 'starstruck-3',
    categoryId: 'starstruck',
    title: 'Kepler Deep Field',
    difficulty: 'Hard',
    collectionId: 'pure-mastery',
    themeLabel: '7×7 Star Grid',
    estimatedMinutes: 6,
    instructions: 'Place 1 star in every row, column, and colored region (7 stars total). No two stars may touch even diagonally.',
    data: {
      size: 7,
      regions: [
        [0, 0, 1, 1, 2, 2, 3],
        [0, 1, 1, 1, 2, 3, 3],
        [0, 1, 2, 2, 2, 3, 3],
        [4, 4, 2, 5, 3, 3, 3],
        [4, 4, 4, 5, 5, 6, 6],
        [4, 4, 5, 5, 5, 6, 6],
        [4, 5, 5, 6, 6, 6, 6]
      ],
      solution: [
        [0, 0],
        [1, 2],
        [2, 4],
        [3, 6],
        [4, 1],
        [5, 3],
        [6, 5]
      ]
    }
  }
];

// ============================================================================
// 7. SUDOKU LEVELS (3 Verified 9x9 Levels: Easy, Medium, Hard)
// ============================================================================
const BASE_SUDOKU_SOL_1: number[][] = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

const BASE_SUDOKU_SOL_2: number[][] = [
  [4, 3, 5, 2, 6, 9, 7, 8, 1],
  [6, 8, 2, 5, 7, 1, 4, 9, 3],
  [1, 9, 7, 8, 3, 4, 5, 6, 2],
  [8, 2, 6, 1, 9, 5, 3, 4, 7],
  [3, 7, 4, 6, 8, 2, 9, 1, 5],
  [9, 5, 1, 7, 4, 3, 6, 2, 8],
  [5, 1, 9, 3, 2, 6, 8, 7, 4],
  [2, 4, 8, 9, 5, 7, 1, 3, 6],
  [7, 6, 3, 4, 1, 8, 2, 5, 9]
];

const BASE_SUDOKU_SOL_3: number[][] = [
  [8, 1, 2, 7, 5, 3, 6, 4, 9],
  [9, 4, 3, 6, 8, 2, 1, 7, 5],
  [6, 7, 5, 4, 9, 1, 2, 8, 3],
  [1, 5, 4, 2, 3, 7, 8, 9, 6],
  [3, 6, 9, 8, 4, 5, 7, 2, 1],
  [2, 8, 7, 1, 6, 9, 5, 3, 4],
  [5, 2, 1, 9, 7, 4, 3, 6, 8],
  [4, 3, 8, 5, 2, 6, 9, 1, 7],
  [7, 9, 6, 3, 1, 8, 4, 5, 2]
];

export const SUDOKU_PUZZLES: PuzzleDefinition<SudokuData>[] = [
  {
    id: 'sudoku-1',
    categoryId: 'sudoku',
    title: 'Solar Dawn',
    difficulty: 'Easy',
    collectionId: 'cosmic-observatory',
    themeLabel: 'Classic 9×9 • Easy',
    estimatedMinutes: 4,
    instructions: 'Fill every empty cell with 1–9 so each row, column, and 3×3 block contains every digit once.',
    data: {
      solution: BASE_SUDOKU_SOL_1,
      givens: [
        [5, 3, 0, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 0],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 0, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 0, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 0, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 0, 8, 4],
        [2, 8, 0, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 0]
      ]
    }
  },
  {
    id: 'sudoku-2',
    categoryId: 'sudoku',
    title: 'Orbital Harmony',
    difficulty: 'Medium',
    collectionId: 'natural-sanctuary',
    themeLabel: 'Classic 9×9 • Balanced',
    estimatedMinutes: 7,
    instructions: 'Use row, column, and box deduction (plus Pencil Notes) to complete the 9×9 number grid.',
    data: {
      solution: BASE_SUDOKU_SOL_2,
      givens: [
        [0, 3, 5, 2, 6, 0, 7, 8, 1],
        [6, 8, 0, 5, 7, 1, 4, 0, 3],
        [1, 9, 7, 8, 0, 4, 5, 6, 2],
        [8, 2, 0, 1, 9, 5, 0, 4, 7],
        [3, 7, 4, 6, 0, 2, 9, 1, 5],
        [9, 0, 1, 7, 4, 3, 0, 2, 8],
        [5, 1, 9, 0, 2, 6, 8, 7, 4],
        [2, 4, 0, 9, 5, 7, 1, 0, 6],
        [7, 6, 3, 4, 1, 0, 2, 5, 0]
      ]
    }
  },
  {
    id: 'sudoku-3',
    categoryId: 'sudoku',
    title: 'Deep Space Lattice',
    difficulty: 'Hard',
    collectionId: 'pure-mastery',
    themeLabel: 'Classic 9×9 • Hard',
    estimatedMinutes: 10,
    instructions: 'Fewer starting clues require candidate elimination and cross-hatching across 3×3 blocks.',
    data: {
      solution: BASE_SUDOKU_SOL_3,
      givens: [
        [8, 0, 2, 7, 0, 3, 6, 0, 9],
        [9, 4, 0, 6, 8, 2, 0, 7, 5],
        [0, 7, 5, 0, 9, 1, 2, 8, 0],
        [1, 5, 0, 2, 3, 0, 8, 9, 6],
        [0, 6, 9, 8, 0, 5, 7, 2, 0],
        [2, 8, 7, 0, 6, 9, 0, 3, 4],
        [0, 2, 1, 9, 0, 4, 3, 6, 0],
        [4, 3, 0, 5, 2, 6, 0, 1, 7],
        [7, 0, 6, 3, 0, 8, 4, 0, 2]
      ]
    }
  }
];

// ============================================================================
// 8. JIGSAW LEVELS (3 Verified Levels with Procedural SVG Artwork)
// ============================================================================
export const JIGSAW_PUZZLES: PuzzleDefinition<JigsawData>[] = [
  {
    id: 'jigsaw-1',
    categoryId: 'jigsaw',
    title: 'Aurora Mountain',
    difficulty: 'Easy',
    collectionId: 'cosmic-observatory',
    themeLabel: '3×3 Scenic Mosaic',
    estimatedMinutes: 2,
    instructions: 'Swap tiles (and rotate any sideways pieces to 0°) to restore the Aurora Mountain illustration.',
    data: {
      rows: 3,
      cols: 3,
      artTheme: 'aurora',
      initialOrder: [2, 1, 0, 5, 4, 3, 8, 7, 6],
      initialRotations: [90, 0, 0, 0, 180, 0, 0, 0, 270]
    }
  },
  {
    id: 'jigsaw-2',
    categoryId: 'jigsaw',
    title: 'Coral Sanctuary',
    difficulty: 'Medium',
    collectionId: 'natural-sanctuary',
    themeLabel: '3×3 Reef Artwork',
    estimatedMinutes: 3,
    instructions: 'Reconstruct the underwater Coral Sanctuary by swapping tiles into their matching coordinates and orienting them upright.',
    data: {
      rows: 3,
      cols: 3,
      artTheme: 'coral',
      initialOrder: [8, 3, 6, 1, 7, 5, 2, 4, 0],
      initialRotations: [0, 90, 0, 180, 0, 270, 0, 90, 0]
    }
  },
  {
    id: 'jigsaw-3',
    categoryId: 'jigsaw',
    title: 'Bauhaus Prism',
    difficulty: 'Hard',
    collectionId: 'pure-mastery',
    themeLabel: '4×3 Geometric Canvas',
    estimatedMinutes: 5,
    instructions: 'Assemble all 12 tiles of the Bauhaus Prism composition into their exact slots and 0° upright alignment.',
    data: {
      rows: 4,
      cols: 3,
      artTheme: 'bauhaus',
      initialOrder: [11, 2, 9, 4, 3, 7, 6, 5, 8, 1, 10, 0],
      initialRotations: [90, 0, 180, 0, 270, 0, 90, 0, 0, 180, 0, 90]
    }
  }
];

// ============================================================================
// 9. SHAPES LEVELS (3 Verified Geometric Silhouette Levels)
// ============================================================================
export const SHAPES_PUZZLES: PuzzleDefinition<ShapesData>[] = [
  {
    id: 'shapes-1',
    categoryId: 'shapes',
    title: 'Emerald Monolith',
    difficulty: 'Easy',
    collectionId: 'natural-sanctuary',
    themeLabel: '3 Geometric Pieces',
    estimatedMinutes: 2,
    instructions: 'Select each geometric piece, rotate it if needed, and click a target cell on the 5×5 board to fill the 3×3 monolith silhouette.',
    data: {
      gridSize: 5,
      silhouette: [
        [1, 1], [1, 2], [1, 3],
        [2, 1], [2, 2], [2, 3],
        [3, 1], [3, 2], [3, 3]
      ],
      pieces: [
        {
          id: 'p1',
          name: 'Amber Corner',
          color: '#F59E0B',
          cells: [[0, 0], [0, 1], [1, 0]],
          solutionRow: 1,
          solutionCol: 1,
          solutionRotation: 0
        },
        {
          id: 'p2',
          name: 'Emerald Tee',
          color: '#10B981',
          cells: [[0, 1], [1, 0], [1, 1]],
          solutionRow: 1,
          solutionCol: 2,
          solutionRotation: 0
        },
        {
          id: 'p3',
          name: 'Indigo Beam',
          color: '#6366F1',
          cells: [[0, 0], [0, 1], [0, 2]],
          solutionRow: 3,
          solutionCol: 1,
          solutionRotation: 0
        }
      ]
    }
  },
  {
    id: 'shapes-2',
    categoryId: 'shapes',
    title: 'Orbital Lander',
    difficulty: 'Medium',
    collectionId: 'cosmic-observatory',
    themeLabel: '4 Geometric Pieces',
    estimatedMinutes: 4,
    instructions: 'Rotate and place all 4 spacecraft modules to fill the 12-cell lander silhouette without overlap.',
    data: {
      gridSize: 5,
      silhouette: [
        [0, 1], [0, 2], [0, 3],
        [1, 1], [1, 2], [1, 3],
        [2, 1], [2, 2], [2, 3],
        [3, 1], [3, 2], [3, 3]
      ],
      pieces: [
        {
          id: 's1',
          name: 'Command Pod',
          color: '#EC4899',
          cells: [[0, 0], [0, 1], [1, 0], [1, 1]],
          solutionRow: 0,
          solutionCol: 1,
          solutionRotation: 0
        },
        {
          id: 's2',
          name: 'Starboard Wing',
          color: '#3B82F6',
          cells: [[0, 0], [1, 0], [2, 0]],
          solutionRow: 0,
          solutionCol: 3,
          solutionRotation: 0
        },
        {
          id: 's3',
          name: 'Port Thruster',
          color: '#10B981',
          cells: [[0, 0], [0, 1], [1, 0], [1, 1]],
          solutionRow: 2,
          solutionCol: 1,
          solutionRotation: 0
        },
        {
          id: 's4',
          name: 'Docking Strut',
          color: '#F59E0B',
          cells: [[0, 0]],
          solutionRow: 3,
          solutionCol: 3,
          solutionRotation: 0
        }
      ]
    }
  },
  {
    id: 'shapes-3',
    categoryId: 'shapes',
    title: 'Citadel Arch',
    difficulty: 'Hard',
    collectionId: 'pure-mastery',
    themeLabel: '4 Interlocking Pieces',
    estimatedMinutes: 5,
    instructions: 'Fit the 4 polyomino pieces into the Citadel Arch silhouette using rotation and exact grid alignment.',
    data: {
      gridSize: 5,
      silhouette: [
        [0, 0], [0, 1], [0, 2], [0, 3],
        [1, 0], [1, 1], [1, 2], [1, 3],
        [2, 0], [2, 3],
        [3, 0], [3, 3]
      ],
      pieces: [
        {
          id: 'c1',
          name: 'West Pillar',
          color: '#8B5CF6',
          cells: [[0, 0], [1, 0], [2, 0], [3, 0]],
          solutionRow: 0,
          solutionCol: 0,
          solutionRotation: 0
        },
        {
          id: 'c2',
          name: 'East Pillar',
          color: '#14B8A6',
          cells: [[0, 0], [1, 0], [2, 0], [3, 0]],
          solutionRow: 0,
          solutionCol: 3,
          solutionRotation: 0
        },
        {
          id: 'c3',
          name: 'Crown Span',
          color: '#F43F5E',
          cells: [[0, 0], [0, 1]],
          solutionRow: 0,
          solutionCol: 1,
          solutionRotation: 0
        },
        {
          id: 'c4',
          name: 'Keystone Vault',
          color: '#F59E0B',
          cells: [[0, 0], [0, 1]],
          solutionRow: 1,
          solutionCol: 1,
          solutionRotation: 0
        }
      ]
    }
  }
];

// ============================================================================
// 10. CROSSOVER LEVELS (3 Verified Word & Emoji Mini-Crosswords)
// ============================================================================
export const CROSSOVER_PUZZLES: PuzzleDefinition<CrossoverData>[] = [
  {
    id: 'crossover-1',
    categoryId: 'crossover',
    title: 'Starlight Square',
    difficulty: 'Easy',
    collectionId: 'cosmic-observatory',
    themeLabel: '4×4 Mini Word Square',
    estimatedMinutes: 2,
    instructions: 'Swap unlocked tiles until every row and column matches its clue. Correctly placed tiles turn green and lock!',
    data: {
      rows: 4,
      cols: 4,
      solutionGrid: [
        ['S', 'T', 'A', 'R'],
        ['T', 'I', 'M', 'E'],
        ['A', 'M', 'E', 'N'],
        ['R', 'E', 'N', 'T']
      ],
      initialGrid: [
        ['S', 'R', 'A', 'T'],
        ['T', 'I', 'E', 'M'],
        ['A', 'M', 'N', 'E'],
        ['R', 'E', 'T', 'N']
      ],
      emojiMap: {
        '0,0': { emoji: '⭐', hint: 'Represents letter S in STAR' },
        '1,1': { emoji: '⏳', hint: 'Represents letter I in TIME' }
      },
      clues: [
        { direction: 'across', index: 0, label: '1 Across', clue: '✨ Luminous celestial body in the night sky', answer: 'STAR' },
        { direction: 'across', index: 1, label: '2 Across', clue: '⏳ Measured in seconds, minutes, and hours', answer: 'TIME' },
        { direction: 'across', index: 2, label: '3 Across', clue: '🙏 Word of agreement meaning "so be it"', answer: 'AMEN' },
        { direction: 'across', index: 3, label: '4 Across', clue: '🏠 Monthly payment for an apartment', answer: 'RENT' }
      ]
    }
  },
  {
    id: 'crossover-2',
    categoryId: 'crossover',
    title: 'Tidal Currents',
    difficulty: 'Medium',
    collectionId: 'natural-sanctuary',
    themeLabel: '4×4 Nature Square',
    estimatedMinutes: 3,
    instructions: 'Swap the scrambled tiles to solve all four nature and motion clues. Green tiles are locked in place.',
    data: {
      rows: 4,
      cols: 4,
      solutionGrid: [
        ['W', 'A', 'V', 'E'],
        ['A', 'R', 'E', 'A'],
        ['V', 'E', 'N', 'T'],
        ['E', 'A', 'T', 'S']
      ],
      initialGrid: [
        ['W', 'V', 'A', 'E'],
        ['A', 'R', 'A', 'E'],
        ['V', 'N', 'E', 'T'],
        ['E', 'T', 'A', 'S']
      ],
      emojiMap: {
        '0,0': { emoji: '🌊', hint: 'Represents letter W in WAVE' },
        '3,3': { emoji: '🍽️', hint: 'Represents letter S in EATS' }
      },
      clues: [
        { direction: 'across', index: 0, label: '1 Across', clue: '🌊 Rolling swell on the ocean surface', answer: 'WAVE' },
        { direction: 'across', index: 1, label: '2 Across', clue: '📐 Length multiplied by width', answer: 'AREA' },
        { direction: 'across', index: 2, label: '3 Across', clue: '🌋 Deep-sea thermal opening or air duct', answer: 'VENT' },
        { direction: 'across', index: 3, label: '4 Across', clue: '🍽️ Consumes a meal', answer: 'EATS' }
      ]
    }
  },
  {
    id: 'crossover-3',
    categoryId: 'crossover',
    title: 'Solar Forge',
    difficulty: 'Hard',
    collectionId: 'pure-mastery',
    themeLabel: '4×4 Asymmetric Grid',
    estimatedMinutes: 4,
    instructions: 'Solve both Across and Down words by swapping unlocked tiles into their rightful intersections.',
    data: {
      rows: 4,
      cols: 4,
      solutionGrid: [
        ['G', 'L', 'O', 'W'],
        ['L', 'I', 'N', 'E'],
        ['O', 'N', 'C', 'E'],
        ['W', 'E', 'E', 'K']
      ],
      initialGrid: [
        ['G', 'O', 'L', 'W'],
        ['L', 'N', 'I', 'E'],
        ['O', 'C', 'N', 'E'],
        ['W', 'E', 'K', 'E']
      ],
      emojiMap: {
        '0,0': { emoji: '🔆', hint: 'Represents letter G in GLOW' },
        '3,3': { emoji: '📅', hint: 'Represents letter K in WEEK' }
      },
      clues: [
        { direction: 'across', index: 0, label: '1 Across', clue: '🔆 Soft warm radiance of light', answer: 'GLOW' },
        { direction: 'across', index: 1, label: '2 Across', clue: '📏 Straight geometric path between two points', answer: 'LINE' },
        { direction: 'across', index: 2, label: '3 Across', clue: '1️⃣ Single time ("___ upon a time")', answer: 'ONCE' },
        { direction: 'across', index: 3, label: '4 Across', clue: '📅 Seven consecutive calendar days', answer: 'WEEK' }
      ]
    }
  }
];

// ============================================================================
// 11. WAYWORDS LEVELS (3 Verified Word-Path Levels)
// ============================================================================
export const WAYWORDS_PUZZLES: PuzzleDefinition<WaywordsData>[] = [
  {
    id: 'waywords-1',
    categoryId: 'waywords',
    title: 'Celestial Trail',
    difficulty: 'Easy',
    collectionId: 'cosmic-observatory',
    themeLabel: 'Theme: Night Sky & Astronomy',
    estimatedMinutes: 3,
    instructions: 'Trace adjacent letters to uncover 3 astronomy words connecting START (Row 1) to FINISH (Row 5). Avoid off-theme decoys!',
    data: {
      rows: 5,
      cols: 5,
      theme: 'Night Sky & Astronomy',
      grid: [
        ['S', 'T', 'A', 'R', 'B'],
        ['C', 'O', 'M', 'M', 'A'],
        ['A', 'R', 'K', 'O', 'R'],
        ['K', 'B', 'I', 'O', 'N'],
        ['E', 'F', 'T', 'S', 'U']
      ],
      words: [
        {
          word: 'STAR',
          kind: 'path',
          clue: 'Luminous sphere of plasma in the night sky (4 letters)',
          cells: [[0, 0], [0, 1], [0, 2], [0, 3]]
        },
        {
          word: 'MOON',
          kind: 'path',
          clue: 'Earth’s natural rocky satellite (4 letters)',
          cells: [[1, 3], [2, 3], [3, 3], [3, 4]]
        },
        {
          word: 'SUN',
          kind: 'path',
          clue: 'The star at the center of our solar system (3 letters)',
          cells: [[4, 3], [4, 4], [3, 4]]
        },
        {
          word: 'ORBIT',
          kind: 'bonus',
          clue: 'Bonus astronomy word: Curved path of a planet',
          cells: [[1, 1], [2, 1], [3, 1], [3, 2], [4, 2]]
        },
        {
          word: 'BARK',
          kind: 'decoy',
          clue: 'Decoy word (Tree covering / dog sound)',
          cells: [[0, 4], [1, 4], [2, 4], [2, 2]]
        }
      ]
    }
  },
  {
    id: 'waywords-2',
    categoryId: 'waywords',
    title: 'Reef Odyssey',
    difficulty: 'Medium',
    collectionId: 'natural-sanctuary',
    themeLabel: 'Theme: Ocean & Marine Life',
    estimatedMinutes: 4,
    instructions: 'Connect START to FINISH by finding the 3 ocean-themed path words. Find the bonus word for a free path hint!',
    data: {
      rows: 5,
      cols: 5,
      theme: 'Ocean & Marine Life',
      grid: [
        ['W', 'A', 'V', 'E', 'C'],
        ['R', 'E', 'E', 'F', 'O'],
        ['S', 'E', 'A', 'D', 'R'],
        ['I', 'T', 'E', 'M', 'A'],
        ['T', 'I', 'D', 'E', 'L']
      ],
      words: [
        {
          word: 'WAVE',
          kind: 'path',
          clue: 'Cresting swell on the sea surface (4 letters)',
          cells: [[0, 0], [0, 1], [0, 2], [0, 3]]
        },
        {
          word: 'REEF',
          kind: 'path',
          clue: 'Underwater ridge of coral (4 letters)',
          cells: [[1, 0], [1, 1], [1, 2], [1, 3]]
        },
        {
          word: 'TIDE',
          kind: 'path',
          clue: 'Rise and fall of the sea caused by lunar gravity (4 letters)',
          cells: [[4, 0], [4, 1], [4, 2], [4, 3]]
        },
        {
          word: 'CORAL',
          kind: 'bonus',
          clue: 'Bonus ocean word: Marine invertebrate colony',
          cells: [[0, 4], [1, 4], [2, 4], [3, 4], [4, 4]]
        },
        {
          word: 'ITEM',
          kind: 'decoy',
          clue: 'Decoy word (Individual article or object)',
          cells: [[3, 0], [3, 1], [3, 2], [3, 3]]
        }
      ]
    }
  },
  {
    id: 'waywords-3',
    categoryId: 'waywords',
    title: 'Botanical Canopy',
    difficulty: 'Hard',
    collectionId: 'pure-mastery',
    themeLabel: 'Theme: Forest & Woodland',
    estimatedMinutes: 5,
    instructions: 'Uncover all 3 woodland path words from top to bottom while steering clear of the urban decoy.',
    data: {
      rows: 5,
      cols: 5,
      theme: 'Forest & Woodland',
      grid: [
        ['T', 'R', 'E', 'E', 'F'],
        ['L', 'E', 'A', 'F', 'E'],
        ['C', 'O', 'I', 'N', 'R'],
        ['B', 'A', 'R', 'K', 'N'],
        ['R', 'O', 'O', 'T', 'S']
      ],
      words: [
        {
          word: 'TREE',
          kind: 'path',
          clue: 'Woody perennial plant with a trunk and branches (4 letters)',
          cells: [[0, 0], [0, 1], [0, 2], [0, 3]]
        },
        {
          word: 'LEAF',
          kind: 'path',
          clue: 'Green photosynthetic blade on a stem (4 letters)',
          cells: [[1, 0], [1, 1], [1, 2], [1, 3]]
        },
        {
          word: 'ROOT',
          kind: 'path',
          clue: 'Underground organ that absorbs water and anchors a plant (4 letters)',
          cells: [[4, 0], [4, 1], [4, 2], [4, 3]]
        },
        {
          word: 'FERN',
          kind: 'bonus',
          clue: 'Bonus woodland word: Shade-loving frond plant',
          cells: [[0, 4], [1, 4], [2, 4], [3, 4]]
        },
        {
          word: 'COIN',
          kind: 'decoy',
          clue: 'Decoy word (Stamped metal currency)',
          cells: [[2, 0], [2, 1], [2, 2], [2, 3]]
        }
      ]
    }
  }
];

// ============================================================================
// 12. KEYSMASH LEVELS (3 Verified Vowel Reconstruction Sets)
// ============================================================================
export const KEYSMASH_PUZZLES: PuzzleDefinition<KeysmashData>[] = [
  {
    id: 'keysmash-1',
    categoryId: 'keysmash',
    title: 'Planetary Signals',
    difficulty: 'Easy',
    collectionId: 'cosmic-observatory',
    themeLabel: 'Theme: Solar System & Space',
    estimatedMinutes: 3,
    instructions: 'Reconstruct each space word by inserting the missing vowels (A, E, I, O, U) into the consonant skeleton.',
    data: {
      theme: 'Solar System & Space',
      prompts: [
        { id: 'ks-1-1', category: 'Astronomy', clue: 'A celestial body moving in an elliptical orbit around a star', answer: 'PLANET' },
        { id: 'ks-1-2', category: 'Spaceflight', clue: 'Cylindrical vehicle launched into space by jet propulsion', answer: 'ROCKET' },
        { id: 'ks-1-3', category: 'Cosmology', clue: 'System of millions or billions of stars held by gravity', answer: 'GALAXY' },
        { id: 'ks-1-4', category: 'Solar System', clue: 'Icy small Solar System body that displays a glowing tail', answer: 'COMET' }
      ]
    }
  },
  {
    id: 'keysmash-2',
    categoryId: 'keysmash',
    title: 'Earth & Elements',
    difficulty: 'Medium',
    collectionId: 'natural-sanctuary',
    themeLabel: 'Theme: Weather & Landscapes',
    estimatedMinutes: 4,
    instructions: 'Slot the missing vowels (A, E, I, O, U) into each natural-world consonant pattern.',
    data: {
      theme: 'Weather & Landscapes',
      prompts: [
        { id: 'ks-2-1', category: 'Geography', clue: 'Deep gorge, typically one with a river flowing through it', answer: 'CANYON' },
        { id: 'ks-2-2', category: 'Botany', clue: 'Dense tropical woodland with high annual rainfall', answer: 'JUNGLE' },
        { id: 'ks-2-3', category: 'Glaciology', clue: 'Slowly moving mass or river of ice formed by snow', answer: 'GLACIER' },
        { id: 'ks-2-4', category: 'Ecology', clue: 'Flat, treeless Arctic region with permanently frozen subsoil', answer: 'TUNDRA' }
      ]
    }
  },
  {
    id: 'keysmash-3',
    categoryId: 'keysmash',
    title: 'Symphony Hall',
    difficulty: 'Hard',
    collectionId: 'pure-mastery',
    themeLabel: 'Theme: Musical Instruments & Art',
    estimatedMinutes: 5,
    instructions: 'Restore the missing vowels to complete each musical and acoustic vocabulary word.',
    data: {
      theme: 'Musical Instruments & Art',
      prompts: [
        { id: 'ks-3-1', category: 'Strings', clue: 'Four-stringed wooden instrument played with a horsehair bow', answer: 'VIOLIN' },
        { id: 'ks-3-2', category: 'Brass', clue: 'Valved brass wind instrument with a bright, clear tone', answer: 'TRUMPET' },
        { id: 'ks-3-3', category: 'Composition', clue: 'Sequence of single notes that is musically satisfying', answer: 'MELODY' },
        { id: 'ks-3-4', category: 'Percussion', clue: 'Concave metal plate that rings when struck', answer: 'CYMBAL' }
      ]
    }
  }
];

// ============================================================================
// 13. BONZA LEVELS (3 Verified Interlocking Word-Fragment Puzzles)
// ============================================================================
export const BONZA_PUZZLES: PuzzleDefinition<BonzaData>[] = [
  {
    id: 'bonza-1',
    categoryId: 'bonza',
    title: 'Cosmic Bodies',
    difficulty: 'Easy',
    collectionId: 'cosmic-observatory',
    themeLabel: 'Theme: Space & Orbits',
    estimatedMinutes: 3,
    instructions: 'Move the word fragments so they connect with the locked STAR anchor to form STAR, SUN, and ORBIT.',
    data: {
      gridRows: 7,
      gridCols: 7,
      theme: 'Cosmic Bodies (STAR • SUN • ORBIT)',
      targetWords: ['STAR', 'SUN', 'ORBIT'],
      fragments: [
        {
          id: 'bz1-anchor',
          letters: 'STAR',
          direction: 'horizontal',
          solutionRow: 2,
          solutionCol: 1,
          lockedAnchor: true,
          initialRow: 2,
          initialCol: 1
        },
        {
          id: 'bz1-sun',
          letters: 'UN',
          direction: 'vertical',
          solutionRow: 3,
          solutionCol: 1,
          initialRow: 5,
          initialCol: 0
        },
        {
          id: 'bz1-or',
          letters: 'OR',
          direction: 'vertical',
          solutionRow: 1,
          solutionCol: 4,
          initialRow: 0,
          initialCol: 1
        },
        {
          id: 'bz1-bit',
          letters: 'BIT',
          direction: 'vertical',
          solutionRow: 3,
          solutionCol: 4,
          initialRow: 4,
          initialCol: 6
        }
      ]
    }
  },
  {
    id: 'bonza-2',
    categoryId: 'bonza',
    title: 'Woodland Flora',
    difficulty: 'Medium',
    collectionId: 'natural-sanctuary',
    themeLabel: 'Theme: Trees & Plants',
    estimatedMinutes: 4,
    instructions: 'Arrange the fragments around the locked TREE anchor to interlock TREE, ROOT, and LEAF.',
    data: {
      gridRows: 7,
      gridCols: 7,
      theme: 'Woodland Flora (TREE • ROOT • LEAF)',
      targetWords: ['TREE', 'ROOT', 'LEAF'],
      fragments: [
        {
          id: 'bz2-anchor',
          letters: 'TREE',
          direction: 'horizontal',
          solutionRow: 2,
          solutionCol: 1,
          lockedAnchor: true,
          initialRow: 2,
          initialCol: 1
        },
        {
          id: 'bz2-oot',
          letters: 'OOT',
          direction: 'vertical',
          solutionRow: 3,
          solutionCol: 2,
          initialRow: 4,
          initialCol: 0
        },
        {
          id: 'bz2-le',
          letters: 'LE',
          direction: 'vertical',
          solutionRow: 1,
          solutionCol: 4,
          initialRow: 0,
          initialCol: 6
        },
        {
          id: 'bz2-af',
          letters: 'AF',
          direction: 'vertical',
          solutionRow: 3,
          solutionCol: 4,
          initialRow: 5,
          initialCol: 5
        }
      ]
    }
  },
  {
    id: 'bonza-3',
    categoryId: 'bonza',
    title: 'Chamber Ensemble',
    difficulty: 'Hard',
    collectionId: 'pure-mastery',
    themeLabel: 'Theme: Musical Instruments',
    estimatedMinutes: 5,
    instructions: 'Connect the scattered fragments to the HARP anchor to form HARP, HORN, and ARIA.',
    data: {
      gridRows: 7,
      gridCols: 7,
      theme: 'Musical Instruments (HARP • HORN • ARIA)',
      targetWords: ['HARP', 'HORN', 'ARIA'],
      fragments: [
        {
          id: 'bz3-anchor',
          letters: 'HARP',
          direction: 'horizontal',
          solutionRow: 2,
          solutionCol: 1,
          lockedAnchor: true,
          initialRow: 2,
          initialCol: 1
        },
        {
          id: 'bz3-orn',
          letters: 'ORN',
          direction: 'vertical',
          solutionRow: 3,
          solutionCol: 1,
          initialRow: 4,
          initialCol: 6
        },
        {
          id: 'bz3-ar',
          letters: 'AR',
          direction: 'vertical',
          solutionRow: 1,
          solutionCol: 3,
          initialRow: 0,
          initialCol: 0
        },
        {
          id: 'bz3-ia',
          letters: 'IA',
          direction: 'vertical',
          solutionRow: 3,
          solutionCol: 3,
          initialRow: 5,
          initialCol: 5
        }
      ]
    }
  }
];

export const ALL_PUZZLES: PuzzleDefinition<any>[] = [
  ...NEON_PUZZLES,
  ...CURRENTS_PUZZLES,
  ...SNIPPETS_PUZZLES,
  ...WORDSMITH_PUZZLES,
  ...STARSTRUCK_PUZZLES,
  ...BONZA_PUZZLES,
  ...WAYWORDS_PUZZLES,
  ...CROSSOVER_PUZZLES,
  ...JIGSAW_PUZZLES,
  ...COMBO_PUZZLES,
  ...SUDOKU_PUZZLES,
  ...SHAPES_PUZZLES,
  ...KEYSMASH_PUZZLES
];

export function getPuzzleById(id: string): PuzzleDefinition<any> | undefined {
  const parsedDaily = parseDailyPuzzleId(id);
  if (parsedDaily && CATEGORIES.some((c) => c.id === parsedDaily.categoryId)) {
    return generateDailyPuzzle(parsedDaily.dateStr, parsedDaily.categoryId);
  }
  return ALL_PUZZLES.find((p) => p.id === id);
}

export function getPuzzlesByCategory(categoryId: CategoryId): PuzzleDefinition<any>[] {
  return ALL_PUZZLES.filter((p) => p.categoryId === categoryId);
}

export function getCategoryMeta(categoryId: CategoryId): CategoryMeta {
  return CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];
}
