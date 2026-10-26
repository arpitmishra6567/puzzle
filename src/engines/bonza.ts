/**
 * GAME 8: BONZA (Interlocking Word-Fragment Assembly)
 * Verified Reference Rules (FAQ #1849 & bonzapuzzles.com):
 * - A theme clue is displayed at the top.
 * - Words related to the theme are broken into horizontal and vertical fragments.
 * - One starter fragment is anchored on the board; players position the remaining fragments
 *   so that all horizontal and vertical words interlock into the valid crossword layout.
 */

import { PuzzleDefinition, PuzzleEngine, ValidationResult } from '../types/puzzle';

export interface BonzaFragmentDef {
  id: string;
  letters: string;                   // e.g. "PLA" or "NET"
  direction: 'horizontal' | 'vertical';
  solutionRow: number;
  solutionCol: number;
  lockedAnchor?: boolean;            // Starter fragment fixed on the board
  initialRow: number;
  initialCol: number;
}

export interface BonzaData {
  gridRows: number;
  gridCols: number;
  theme: string;
  targetWords: string[];
  fragments: BonzaFragmentDef[];
}

export interface BonzaFragmentPos {
  row: number;
  col: number;
}

export interface BonzaState {
  positions: Record<string, BonzaFragmentPos>;
  selectedFragmentId: string | null;
}

export type BonzaAction =
  | { type: 'SELECT_FRAGMENT'; fragmentId: string }
  | { type: 'MOVE_FRAGMENT'; fragmentId?: string; row: number; col: number }
  | { type: 'NUDGE_FRAGMENT'; fragmentId?: string; dRow: number; dCol: number };

export function getFragmentCells(frag: BonzaFragmentDef, pos: BonzaFragmentPos): { r: number; c: number; ch: string }[] {
  const cells: { r: number; c: number; ch: string }[] = [];
  for (let i = 0; i < frag.letters.length; i++) {
    const r = frag.direction === 'vertical' ? pos.row + i : pos.row;
    const c = frag.direction === 'horizontal' ? pos.col + i : pos.col;
    cells.push({ r, c, ch: frag.letters[i] });
  }
  return cells;
}

export const BonzaEngine: PuzzleEngine<BonzaData, BonzaState, BonzaAction> = {
  categoryId: 'bonza',

  createInitialState(puzzle: PuzzleDefinition<BonzaData>): BonzaState {
    const positions: Record<string, BonzaFragmentPos> = {};
    for (const f of puzzle.data.fragments) {
      positions[f.id] = {
        row: f.lockedAnchor ? f.solutionRow : f.initialRow,
        col: f.lockedAnchor ? f.solutionCol : f.initialCol
      };
    }
    const firstMovable = puzzle.data.fragments.find((f) => !f.lockedAnchor);
    return {
      positions,
      selectedFragmentId: firstMovable?.id ?? null
    };
  },

  applyAction(puzzle: PuzzleDefinition<BonzaData>, state: BonzaState, action: BonzaAction): BonzaState {
    const nextPositions: Record<string, BonzaFragmentPos> = {};
    for (const k of Object.keys(state.positions)) {
      nextPositions[k] = { ...state.positions[k] };
    }

    if (action.type === 'SELECT_FRAGMENT') {
      const frag = puzzle.data.fragments.find((f) => f.id === action.fragmentId);
      if (!frag || frag.lockedAnchor) return state;
      return { ...state, selectedFragmentId: action.fragmentId };
    }

    const targetId = action.fragmentId ?? state.selectedFragmentId;
    if (!targetId) return state;
    const frag = puzzle.data.fragments.find((f) => f.id === targetId);
    if (!frag || frag.lockedAnchor) return state;

    const maxR = frag.direction === 'vertical'
      ? puzzle.data.gridRows - frag.letters.length
      : puzzle.data.gridRows - 1;
    const maxC = frag.direction === 'horizontal'
      ? puzzle.data.gridCols - frag.letters.length
      : puzzle.data.gridCols - 1;

    if (action.type === 'MOVE_FRAGMENT') {
      nextPositions[targetId] = {
        row: Math.max(0, Math.min(maxR, action.row)),
        col: Math.max(0, Math.min(maxC, action.col))
      };
      return { ...state, positions: nextPositions, selectedFragmentId: targetId };
    }

    if (action.type === 'NUDGE_FRAGMENT') {
      const cur = nextPositions[targetId];
      nextPositions[targetId] = {
        row: Math.max(0, Math.min(maxR, cur.row + action.dRow)),
        col: Math.max(0, Math.min(maxC, cur.col + action.dCol))
      };
      return { ...state, positions: nextPositions, selectedFragmentId: targetId };
    }

    return state;
  },

  validate(puzzle: PuzzleDefinition<BonzaData>, state: BonzaState): ValidationResult {
    const cellChars: Record<string, string[]> = {};
    const conflicts = new Set<string>();
    let alignedCount = 0;

    for (const frag of puzzle.data.fragments) {
      const pos = state.positions[frag.id];
      if (!pos) continue;
      if (pos.row === frag.solutionRow && pos.col === frag.solutionCol) {
        alignedCount++;
      }
      const fCells = getFragmentCells(frag, pos);
      for (const { r, c, ch } of fCells) {
        const key = `${r},${c}`;
        if (!cellChars[key]) cellChars[key] = [];
        cellChars[key].push(ch);
      }
    }

    // Check for conflicting overlapping letters
    for (const [key, chars] of Object.entries(cellChars)) {
      const unique = new Set(chars);
      if (unique.size > 1) {
        conflicts.add(key);
      }
    }

    const total = puzzle.data.fragments.length;
    const conflictList = Array.from(conflicts);
    const valid = conflictList.length === 0;
    const isSolved = valid && alignedCount === total;
    const progressPercent = Math.round((alignedCount / total) * 100);

    let message = `${alignedCount} of ${total} word fragments connected.`;
    if (!valid) {
      message = 'Overlapping fragments have mismatched letters!';
    } else if (isSolved) {
      message = `All "${puzzle.data.theme}" words connected!`;
    }

    return {
      valid,
      isSolved,
      conflicts: conflictList,
      progressPercent,
      message
    };
  },

  applyHint(puzzle: PuzzleDefinition<BonzaData>, state: BonzaState): BonzaState {
    const nextPositions: Record<string, BonzaFragmentPos> = {};
    for (const k of Object.keys(state.positions)) {
      nextPositions[k] = { ...state.positions[k] };
    }

    for (const frag of puzzle.data.fragments) {
      if (frag.lockedAnchor) continue;
      const pos = nextPositions[frag.id];
      if (pos.row !== frag.solutionRow || pos.col !== frag.solutionCol) {
        nextPositions[frag.id] = {
          row: frag.solutionRow,
          col: frag.solutionCol
        };
        return {
          ...state,
          positions: nextPositions,
          selectedFragmentId: frag.id
        };
      }
    }
    return state;
  },

  serialize(state: BonzaState): string {
    return JSON.stringify(state);
  },

  deserialize(puzzle: PuzzleDefinition<BonzaData>, raw: string): BonzaState | null {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.positions !== 'object') return null;
      for (const f of puzzle.data.fragments) {
        if (!parsed.positions[f.id]) return null;
      }
      return {
        positions: parsed.positions,
        selectedFragmentId: parsed.selectedFragmentId ?? null
      };
    } catch {
      return null;
    }
  }
};
