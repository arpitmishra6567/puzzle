/**
 * GAME 1: STARSTRUCK (Spatial & Deductive Star Placement)
 * Rules:
 * - Place exactly 1 star (2) in each row, column, and colored region on an N×N board.
 * - No two stars may touch horizontally, vertically, or diagonally (8-neighbor exclusion).
 * - Cell values: 0 = Empty, 1 = Cross (×), 2 = Star (★), 3 = Auto-Cross (× placed automatically).
 */

import { PuzzleDefinition, PuzzleEngine, ValidationResult } from '../types/puzzle';

export interface StarstruckData {
  size: number;
  regions: number[][]; // N×N region IDs (0..N-1)
  solution: [number, number][]; // [row, col] for each row
}

export interface StarstruckState {
  grid: number[][]; // 0=empty, 1=manual cross, 2=star, 3=auto cross
  starOrder: number[]; // region IDs in order stars were placed (for share emoji)
  autoCross: boolean;
}

export type StarstruckAction =
  | { type: 'CYCLE_CELL'; row: number; col: number }
  | { type: 'SET_CELL'; row: number; col: number; value: 0 | 1 | 2 }
  | { type: 'TOGGLE_AUTO_CROSS'; enabled: boolean };

function cloneGrid(grid: number[][]): number[][] {
  return grid.map((r) => [...r]);
}

function recomputeAutoCrosses(data: StarstruckData, grid: number[][], autoCross: boolean): number[][] {
  const next = cloneGrid(grid);
  const N = data.size;
  // Clear previous auto-crosses (value 3) first
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (next[r][c] === 3) next[r][c] = 0;
    }
  }
  if (!autoCross) return next;

  const stars: [number, number][] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (next[r][c] === 2) stars.push([r, c]);
    }
  }

  for (const [sr, sc] of stars) {
    const reg = data.regions[sr][sc];
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (r === sr && c === sc) continue;
        const sameRowColReg = r === sr || c === sc || data.regions[r][c] === reg;
        const adjacent = Math.abs(r - sr) <= 1 && Math.abs(c - sc) <= 1;
        if ((sameRowColReg || adjacent) && next[r][c] === 0) {
          next[r][c] = 3;
        }
      }
    }
  }
  return next;
}

export const StarstruckEngine: PuzzleEngine<StarstruckData, StarstruckState, StarstruckAction> = {
  categoryId: 'starstruck',

  createInitialState(puzzle: PuzzleDefinition<StarstruckData>): StarstruckState {
    const N = puzzle.data.size;
    const grid = Array.from({ length: N }, () => Array(N).fill(0));
    return {
      grid,
      starOrder: [],
      autoCross: true
    };
  },

  applyAction(puzzle: PuzzleDefinition<StarstruckData>, state: StarstruckState, action: StarstruckAction): StarstruckState {
    const N = puzzle.data.size;
    if (action.type === 'TOGGLE_AUTO_CROSS') {
      const nextGrid = recomputeAutoCrosses(puzzle.data, state.grid, action.enabled);
      return { ...state, autoCross: action.enabled, grid: nextGrid };
    }

    const { row, col } = action;
    if (row < 0 || row >= N || col < 0 || col >= N) return state;

    const nextGrid = cloneGrid(state.grid);
    const current = nextGrid[row][col];
    let targetVal: 0 | 1 | 2;
    if (action.type === 'CYCLE_CELL') {
      // Reference rule: Tap once -> Cross (1), Tap twice -> Star (2), Tap third time -> Clear (0)
      if (current === 0 || current === 3) targetVal = 1;
      else if (current === 1) targetVal = 2;
      else targetVal = 0;
    } else {
      targetVal = action.value;
    }

    nextGrid[row][col] = targetVal;
    const regId = puzzle.data.regions[row][col];
    let nextStarOrder = [...state.starOrder];
    if (targetVal === 2 && !nextStarOrder.includes(regId)) {
      nextStarOrder.push(regId);
    } else if (targetVal !== 2) {
      // Check if any star remains in that region
      let hasStarInReg = false;
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (nextGrid[r][c] === 2 && puzzle.data.regions[r][c] === regId) {
            hasStarInReg = true;
          }
        }
      }
      if (!hasStarInReg) {
        nextStarOrder = nextStarOrder.filter((id) => id !== regId);
      }
    }

    const updatedGrid = recomputeAutoCrosses(puzzle.data, nextGrid, state.autoCross);
    return {
      ...state,
      grid: updatedGrid,
      starOrder: nextStarOrder
    };
  },

  validate(puzzle: PuzzleDefinition<StarstruckData>, state: StarstruckState): ValidationResult {
    const N = puzzle.data.size;
    const conflicts = new Set<string>();
    const stars: [number, number][] = [];

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (state.grid[r][c] === 2) {
          stars.push([r, c]);
        }
      }
    }

    // Check pairwise star constraints
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const [r1, c1] = stars[i];
        const [r2, c2] = stars[j];
        const sameRow = r1 === r2;
        const sameCol = c1 === c2;
        const sameRegion = puzzle.data.regions[r1][c1] === puzzle.data.regions[r2][c2];
        const touching = Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;

        if (sameRow || sameCol || sameRegion || touching) {
          conflicts.add(`${r1},${c1}`);
          conflicts.add(`${r2},${c2}`);
        }
      }
    }

    const conflictList = Array.from(conflicts);
    const valid = conflictList.length === 0;
    const isSolved = valid && stars.length === N;
    const progressPercent = Math.min(100, Math.round((stars.length / N) * 100));

    let message = `Placed ${stars.length} of ${N} stars.`;
    if (!valid) {
      message = 'Conflict detected: Stars cannot share a row, column, region, or touch diagonally.';
    } else if (isSolved) {
      message = 'All stars aligned in harmony!';
    }

    return {
      valid,
      isSolved,
      conflicts: conflictList,
      progressPercent,
      message
    };
  },

  applyHint(puzzle: PuzzleDefinition<StarstruckData>, state: StarstruckState): StarstruckState {
    const N = puzzle.data.size;
    const nextGrid = cloneGrid(state.grid);
    const solSet = new Set(puzzle.data.solution.map(([r, c]) => `${r},${c}`));

    // 1. First remove any wrongly placed star
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (nextGrid[r][c] === 2 && !solSet.has(`${r},${c}`)) {
          nextGrid[r][c] = 1;
          return {
            ...state,
            grid: recomputeAutoCrosses(puzzle.data, nextGrid, state.autoCross)
          };
        }
      }
    }

    // 2. Place the next missing star from the solution
    for (const [sr, sc] of puzzle.data.solution) {
      if (nextGrid[sr][sc] !== 2) {
        return this.applyAction(puzzle, state, { type: 'SET_CELL', row: sr, col: sc, value: 2 });
      }
    }
    return state;
  },

  serialize(state: StarstruckState): string {
    return JSON.stringify(state);
  },

  deserialize(puzzle: PuzzleDefinition<StarstruckData>, raw: string): StarstruckState | null {
    try {
      const parsed = JSON.parse(raw);
      const N = puzzle.data.size;
      if (
        !parsed ||
        !Array.isArray(parsed.grid) ||
        parsed.grid.length !== N ||
        !parsed.grid.every((row: any) => Array.isArray(row) && row.length === N)
      ) {
        return null;
      }
      return {
        grid: parsed.grid,
        starOrder: Array.isArray(parsed.starOrder) ? parsed.starOrder : [],
        autoCross: typeof parsed.autoCross === 'boolean' ? parsed.autoCross : true
      };
    } catch {
      return null;
    }
  }
};
