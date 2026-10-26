/**
 * GAME 5: CROSSOVER (Word & Emoji Mini-Crossword Tile Swapper)
 * Verified Reference Rules (FAQ #1853):
 * - A mini crossword grid has Across and Down clues.
 * - Some tiles display emojis representing a letter/word concept (tap emoji for helper info).
 * - Players swap two unlocked tiles to arrange valid words in every row and column.
 * - Correctly placed tiles immediately turn green and lock (no longer movable).
 */

import { PuzzleDefinition, PuzzleEngine, ValidationResult } from '../types/puzzle';

export interface CrossoverClue {
  direction: 'across' | 'down';
  index: number; // row or col index
  label: string;
  clue: string;
  answer: string;
}

export interface CrossoverData {
  rows: number;
  cols: number;
  solutionGrid: (string | null)[][]; // null for black/void block, uppercase letter for active cell
  initialGrid: (string | null)[][];  // scrambled starting letters
  emojiMap: Record<string, { emoji: string; hint: string }>; // key "r,c" -> emoji display for that target cell's tile
  clues: CrossoverClue[];
}

export interface CrossoverTile {
  id: string;
  char: string;
  emoji?: string;
  emojiHint?: string;
}

export interface CrossoverState {
  board: (CrossoverTile | null)[][];
  selectedCell: [number, number] | null;
  activeClueIndex: number;
}

export type CrossoverAction =
  | { type: 'SELECT_OR_SWAP'; row: number; col: number }
  | { type: 'SWAP_CELLS'; r1: number; c1: number; r2: number; c2: number }
  | { type: 'SELECT_CLUE'; index: number };

function isTileLocked(puzzle: PuzzleDefinition<CrossoverData>, board: (CrossoverTile | null)[][], r: number, c: number): boolean {
  const target = puzzle.data.solutionGrid[r]?.[c];
  const tile = board[r]?.[c];
  if (!target || !tile) return true;
  return tile.char === target;
}

export const CrossoverEngine: PuzzleEngine<CrossoverData, CrossoverState, CrossoverAction> = {
  categoryId: 'crossover',

  createInitialState(puzzle: PuzzleDefinition<CrossoverData>): CrossoverState {
    const { rows, cols, initialGrid, solutionGrid, emojiMap } = puzzle.data;
    // Build pool of emoji metadata keyed by target character occurrence
    const emojiList = Object.entries(emojiMap).map(([coord, meta]) => {
      const [sr, sc] = coord.split(',').map(Number);
      return { char: solutionGrid[sr][sc]!, emoji: meta.emoji, hint: meta.hint, used: false };
    });

    const board: (CrossoverTile | null)[][] = [];
    let idCounter = 0;
    for (let r = 0; r < rows; r++) {
      const rowArr: (CrossoverTile | null)[] = [];
      for (let c = 0; c < cols; c++) {
        const ch = initialGrid[r][c];
        if (!ch) {
          rowArr.push(null);
        } else {
          const em = emojiList.find((e) => !e.used && e.char === ch);
          if (em) em.used = true;
          rowArr.push({
            id: `tile-${idCounter++}`,
            char: ch,
            emoji: em?.emoji,
            emojiHint: em?.hint
          });
        }
      }
      board.push(rowArr);
    }

    return {
      board,
      selectedCell: null,
      activeClueIndex: 0
    };
  },

  applyAction(puzzle: PuzzleDefinition<CrossoverData>, state: CrossoverState, action: CrossoverAction): CrossoverState {
    if (action.type === 'SELECT_CLUE') {
      const totalClues = puzzle.data.clues.length;
      const idx = ((action.index % totalClues) + totalClues) % totalClues;
      return { ...state, activeClueIndex: idx };
    }

    const nextBoard = state.board.map((r) => r.map((cell) => (cell ? { ...cell } : null)));

    if (action.type === 'SWAP_CELLS') {
      const { r1, c1, r2, c2 } = action;
      if (isTileLocked(puzzle, nextBoard, r1, c1) || isTileLocked(puzzle, nextBoard, r2, c2)) {
        return state;
      }
      const tmp = nextBoard[r1][c1];
      nextBoard[r1][c1] = nextBoard[r2][c2];
      nextBoard[r2][c2] = tmp;
      return { ...state, board: nextBoard, selectedCell: null };
    }

    if (action.type === 'SELECT_OR_SWAP') {
      const { row, col } = action;
      if (isTileLocked(puzzle, nextBoard, row, col)) {
        return state;
      }
      if (!state.selectedCell) {
        return { ...state, selectedCell: [row, col] };
      }
      const [sr, sc] = state.selectedCell;
      if (sr === row && sc === col) {
        return { ...state, selectedCell: null };
      }
      if (isTileLocked(puzzle, nextBoard, sr, sc)) {
        return { ...state, selectedCell: [row, col] };
      }
      const tmp = nextBoard[sr][sc];
      nextBoard[sr][sc] = nextBoard[row][col];
      nextBoard[row][col] = tmp;
      return {
        ...state,
        board: nextBoard,
        selectedCell: null
      };
    }

    return state;
  },

  validate(puzzle: PuzzleDefinition<CrossoverData>, state: CrossoverState): ValidationResult {
    const { rows, cols, solutionGrid } = puzzle.data;
    let totalCells = 0;
    let lockedGreenCells = 0;
    const unlockedCoords: string[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const target = solutionGrid[r][c];
        if (!target) continue;
        totalCells++;
        if (state.board[r][c]?.char === target) {
          lockedGreenCells++;
        } else {
          unlockedCoords.push(`${r},${c}`);
        }
      }
    }

    const isSolved = lockedGreenCells === totalCells && totalCells > 0;
    const progressPercent = totalCells > 0 ? Math.round((lockedGreenCells / totalCells) * 100) : 100;

    return {
      valid: true,
      isSolved,
      conflicts: [],
      progressPercent,
      message: isSolved
        ? 'All crossword rows and columns unlocked!'
        : `${lockedGreenCells} of ${totalCells} tiles locked green.`
    };
  },

  applyHint(puzzle: PuzzleDefinition<CrossoverData>, state: CrossoverState): CrossoverState {
    const { rows, cols, solutionGrid } = puzzle.data;
    const nextBoard = state.board.map((r) => r.map((cell) => (cell ? { ...cell } : null)));

    // Find first unlocked cell [r, c]
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const target = solutionGrid[r][c];
        if (!target) continue;
        if (nextBoard[r][c]?.char !== target) {
          // Find another unlocked cell holding `target`
          for (let rr = 0; rr < rows; rr++) {
            for (let cc = 0; cc < cols; cc++) {
              if ((rr !== r || cc !== c) && !isTileLocked(puzzle, nextBoard, rr, cc) && nextBoard[rr][cc]?.char === target) {
                const tmp = nextBoard[r][c];
                nextBoard[r][c] = nextBoard[rr][cc];
                nextBoard[rr][cc] = tmp;
                return { ...state, board: nextBoard, selectedCell: null };
              }
            }
          }
        }
      }
    }
    return state;
  },

  serialize(state: CrossoverState): string {
    return JSON.stringify(state);
  },

  deserialize(puzzle: PuzzleDefinition<CrossoverData>, raw: string): CrossoverState | null {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.board) || parsed.board.length !== puzzle.data.rows) {
        return null;
      }
      return {
        board: parsed.board,
        selectedCell: parsed.selectedCell ?? null,
        activeClueIndex: typeof parsed.activeClueIndex === 'number' ? parsed.activeClueIndex : 0
      };
    } catch {
      return null;
    }
  }
};
