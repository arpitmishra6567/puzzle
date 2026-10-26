/**
 * GAME 2: SUDOKU (9×9 Deductive Number Grid)
 * Rules:
 * - Fill 9×9 grid with numbers 1–9 so each row, column, and 3×3 block has 1–9 without repetition.
 * - Supports Pencil Notes, Selected/Related Highlighting, Conflict Detection, and Hints.
 */

import { PuzzleDefinition, PuzzleEngine, ValidationResult } from '../types/puzzle';

export interface SudokuData {
  givens: number[][];   // 9×9 (0 for empty)
  solution: number[][]; // 9×9 (1..9)
}

export interface SudokuState {
  board: number[][];          // 9×9 current values (0..9)
  notes: number[][][];        // 9×9 array of candidate numbers
  notesMode: boolean;
  selectedCell: [number, number] | null;
}

export type SudokuAction =
  | { type: 'SELECT_CELL'; row: number; col: number }
  | { type: 'INPUT_NUMBER'; value: number } // 1..9, or 0 to clear
  | { type: 'SET_CELL_VALUE'; row: number; col: number; value: number }
  | { type: 'TOGGLE_NOTES_MODE' };

function cloneBoard(b: number[][]): number[][] {
  return b.map((r) => [...r]);
}

function cloneNotes(n: number[][][]): number[][][] {
  return n.map((r) => r.map((c) => [...c]));
}

export const SudokuEngine: PuzzleEngine<SudokuData, SudokuState, SudokuAction> = {
  categoryId: 'sudoku',

  createInitialState(puzzle: PuzzleDefinition<SudokuData>): SudokuState {
    return {
      board: cloneBoard(puzzle.data.givens),
      notes: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])),
      notesMode: false,
      selectedCell: [0, 0]
    };
  },

  applyAction(puzzle: PuzzleDefinition<SudokuData>, state: SudokuState, action: SudokuAction): SudokuState {
    if (action.type === 'SELECT_CELL') {
      const r = Math.max(0, Math.min(8, action.row));
      const c = Math.max(0, Math.min(8, action.col));
      return { ...state, selectedCell: [r, c] };
    }

    if (action.type === 'TOGGLE_NOTES_MODE') {
      return { ...state, notesMode: !state.notesMode };
    }

    let r = 0;
    let c = 0;
    let value = 0;

    if (action.type === 'SET_CELL_VALUE') {
      r = action.row;
      c = action.col;
      value = action.value;
    } else if (action.type === 'INPUT_NUMBER') {
      if (!state.selectedCell) return state;
      [r, c] = state.selectedCell;
      value = action.value;
    }

    if (r < 0 || r >= 9 || c < 0 || c >= 9) return state;
    // Givens are immutable
    if (puzzle.data.givens[r][c] !== 0) return state;

    const nextBoard = cloneBoard(state.board);
    const nextNotes = cloneNotes(state.notes);

    if (value === 0) {
      nextBoard[r][c] = 0;
      nextNotes[r][c] = [];
      return { ...state, board: nextBoard, notes: nextNotes };
    }

    if (value < 1 || value > 9) return state;

    if (state.notesMode && action.type === 'INPUT_NUMBER') {
      nextBoard[r][c] = 0;
      const cellNotes = nextNotes[r][c];
      if (cellNotes.includes(value)) {
        nextNotes[r][c] = cellNotes.filter((n) => n !== value);
      } else {
        nextNotes[r][c] = [...cellNotes, value].sort((a, b) => a - b);
      }
      return { ...state, board: nextBoard, notes: nextNotes };
    }

    // SET_CELL_VALUE sets exact value; INPUT_NUMBER toggles off if same value tapped twice
    if (action.type === 'SET_CELL_VALUE') {
      nextBoard[r][c] = value;
    } else {
      nextBoard[r][c] = nextBoard[r][c] === value ? 0 : value;
    }

    if (nextBoard[r][c] !== 0) {
      nextNotes[r][c] = [];
      // Automatically prune matching candidate notes in same row, col, and 3x3 box
      const br = Math.floor(r / 3) * 3;
      const bc = Math.floor(c / 3) * 3;
      for (let i = 0; i < 9; i++) {
        nextNotes[r][i] = nextNotes[r][i].filter((n) => n !== value);
        nextNotes[i][c] = nextNotes[i][c].filter((n) => n !== value);
      }
      for (let dr = 0; dr < 3; dr++) {
        for (let dc = 0; dc < 3; dc++) {
          nextNotes[br + dr][bc + dc] = nextNotes[br + dr][bc + dc].filter((n) => n !== value);
        }
      }
    }

    return {
      ...state,
      board: nextBoard,
      notes: nextNotes,
      selectedCell: [r, c]
    };
  },

  validate(puzzle: PuzzleDefinition<SudokuData>, state: SudokuState): ValidationResult {
    const conflicts = new Set<string>();
    let filledCount = 0;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = state.board[r][c];
        if (val === 0) continue;
        filledCount++;

        // Row check
        for (let cc = 0; cc < 9; cc++) {
          if (cc !== c && state.board[r][cc] === val) {
            conflicts.add(`${r},${c}`);
            conflicts.add(`${r},${cc}`);
          }
        }
        // Col check
        for (let rr = 0; rr < 9; rr++) {
          if (rr !== r && state.board[rr][c] === val) {
            conflicts.add(`${r},${c}`);
            conflicts.add(`${rr},${c}`);
          }
        }
        // 3x3 box check
        const br = Math.floor(r / 3) * 3;
        const bc = Math.floor(c / 3) * 3;
        for (let dr = 0; dr < 3; dr++) {
          for (let dc = 0; dc < 3; dc++) {
            const nr = br + dr;
            const nc = bc + dc;
            if ((nr !== r || nc !== c) && state.board[nr][nc] === val) {
              conflicts.add(`${r},${c}`);
              conflicts.add(`${nr},${nc}`);
            }
          }
        }
      }
    }

    const conflictList = Array.from(conflicts);
    const valid = conflictList.length === 0;
    const isSolved = valid && filledCount === 81;
    const progressPercent = Math.round((filledCount / 81) * 100);

    let message = `${filledCount} / 81 cells filled.`;
    if (!valid) {
      message = 'Duplicate number conflict in row, column, or 3×3 block.';
    } else if (isSolved) {
      message = 'Sudoku solved with zero conflicts!';
    }

    return {
      valid,
      isSolved,
      conflicts: conflictList,
      progressPercent,
      message
    };
  },

  applyHint(puzzle: PuzzleDefinition<SudokuData>, state: SudokuState): SudokuState {
    const nextBoard = cloneBoard(state.board);
    const nextNotes = cloneNotes(state.notes);

    // Prefer filling the currently selected cell if it is editable and wrong/empty
    if (state.selectedCell) {
      const [sr, sc] = state.selectedCell;
      if (puzzle.data.givens[sr][sc] === 0 && nextBoard[sr][sc] !== puzzle.data.solution[sr][sc]) {
        nextBoard[sr][sc] = puzzle.data.solution[sr][sc];
        nextNotes[sr][sc] = [];
        return { ...state, board: nextBoard, notes: nextNotes };
      }
    }

    // Otherwise fill the first empty or incorrect cell
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle.data.givens[r][c] === 0 && nextBoard[r][c] !== puzzle.data.solution[r][c]) {
          nextBoard[r][c] = puzzle.data.solution[r][c];
          nextNotes[r][c] = [];
          return { ...state, board: nextBoard, notes: nextNotes, selectedCell: [r, c] };
        }
      }
    }
    return state;
  },

  serialize(state: SudokuState): string {
    return JSON.stringify(state);
  },

  deserialize(puzzle: PuzzleDefinition<SudokuData>, raw: string): SudokuState | null {
    try {
      const parsed = JSON.parse(raw);
      if (
        !parsed ||
        !Array.isArray(parsed.board) ||
        parsed.board.length !== 9 ||
        !parsed.board.every((r: any) => Array.isArray(r) && r.length === 9)
      ) {
        return null;
      }
      return {
        board: parsed.board,
        notes: Array.isArray(parsed.notes) && parsed.notes.length === 9
          ? parsed.notes
          : Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])),
        notesMode: Boolean(parsed.notesMode),
        selectedCell: Array.isArray(parsed.selectedCell) ? parsed.selectedCell : [0, 0]
      };
    } catch {
      return null;
    }
  }
};
