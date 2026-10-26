/**
 * GAME 4: SHAPES (Tangram & Geometric Silhouette Assembly)
 * Rules:
 * - Given a target silhouette on a gridSize × gridSize board and a set of geometric pieces.
 * - Each piece is defined by relative cell coordinates [dr, dc][] and can be rotated in 90° steps.
 * - Players select a piece, rotate it if needed, and place it at a board anchor [row, col].
 * - Solved when every target silhouette cell is covered by exactly one piece with zero overlap or out-of-bounds.
 */

import { PuzzleDefinition, PuzzleEngine, ValidationResult } from '../types/puzzle';

export interface ShapePieceDef {
  id: string;
  name: string;
  color: string;
  cells: [number, number][]; // relative [dr, dc] at 0° rotation
  solutionRow: number;
  solutionCol: number;
  solutionRotation: number;  // 0 | 90 | 180 | 270
}

export interface ShapesData {
  gridSize: number;
  silhouette: [number, number][]; // list of [r, c] cells that form the target silhouette
  pieces: ShapePieceDef[];
}

export interface ShapePlacement {
  row: number | null; // null if in tray
  col: number | null;
  rotation: number;   // 0, 90, 180, 270
}

export interface ShapesState {
  placements: Record<string, ShapePlacement>;
  selectedPieceId: string | null;
}

export type ShapesAction =
  | { type: 'SELECT_PIECE'; pieceId: string }
  | { type: 'ROTATE_PIECE'; pieceId?: string }
  | { type: 'PLACE_PIECE'; pieceId?: string; row: number; col: number }
  | { type: 'RETURN_TO_TRAY'; pieceId: string };

/**
 * Rotate relative cells [dr, dc] clockwise by `rotation` (0, 90, 180, 270)
 * and normalize so the minimum dr and minimum dc are 0.
 */
export function getRotatedCells(cells: [number, number][], rotation: number): [number, number][] {
  const normRot = ((rotation % 360) + 360) % 360;
  const transformed: [number, number][] = cells.map(([r, c]) => {
    if (normRot === 90) return [c, -r];
    if (normRot === 180) return [-r, -c];
    if (normRot === 270) return [-c, r];
    return [r, c];
  });
  const minR = Math.min(...transformed.map(([r]) => r));
  const minC = Math.min(...transformed.map(([, c]) => c));
  return transformed.map(([r, c]) => [r - minR, c - minC]);
}

export const ShapesEngine: PuzzleEngine<ShapesData, ShapesState, ShapesAction> = {
  categoryId: 'shapes',

  createInitialState(puzzle: PuzzleDefinition<ShapesData>): ShapesState {
    const placements: Record<string, ShapePlacement> = {};
    puzzle.data.pieces.forEach((p, idx) => {
      placements[p.id] = {
        row: null,
        col: null,
        rotation: (idx * 90) % 360
      };
    });
    return {
      placements,
      selectedPieceId: puzzle.data.pieces[0]?.id ?? null
    };
  },

  applyAction(puzzle: PuzzleDefinition<ShapesData>, state: ShapesState, action: ShapesAction): ShapesState {
    const nextPlacements: Record<string, ShapePlacement> = {};
    for (const k of Object.keys(state.placements)) {
      nextPlacements[k] = { ...state.placements[k] };
    }

    if (action.type === 'SELECT_PIECE') {
      if (!nextPlacements[action.pieceId]) return state;
      return { ...state, selectedPieceId: action.pieceId };
    }

    if (action.type === 'ROTATE_PIECE') {
      const targetId = action.pieceId ?? state.selectedPieceId;
      if (!targetId || !nextPlacements[targetId]) return state;
      nextPlacements[targetId].rotation = (nextPlacements[targetId].rotation + 90) % 360;
      return { ...state, placements: nextPlacements, selectedPieceId: targetId };
    }

    if (action.type === 'RETURN_TO_TRAY') {
      if (!nextPlacements[action.pieceId]) return state;
      nextPlacements[action.pieceId].row = null;
      nextPlacements[action.pieceId].col = null;
      return { ...state, placements: nextPlacements, selectedPieceId: action.pieceId };
    }

    if (action.type === 'PLACE_PIECE') {
      const targetId = action.pieceId ?? state.selectedPieceId;
      if (!targetId || !nextPlacements[targetId]) return state;
      const pieceDef = puzzle.data.pieces.find((p) => p.id === targetId);
      if (!pieceDef) return state;

      const rotCells = getRotatedCells(pieceDef.cells, nextPlacements[targetId].rotation);
      const maxDr = Math.max(...rotCells.map(([dr]) => dr));
      const maxDc = Math.max(...rotCells.map(([, dc]) => dc));

      // Clamp anchor so piece stays within grid bounds
      const clampedRow = Math.max(0, Math.min(puzzle.data.gridSize - 1 - maxDr, action.row));
      const clampedCol = Math.max(0, Math.min(puzzle.data.gridSize - 1 - maxDc, action.col));

      nextPlacements[targetId].row = clampedRow;
      nextPlacements[targetId].col = clampedCol;

      // Auto-select next unplaced piece if available
      const nextUnplaced = puzzle.data.pieces.find(
        (p) => nextPlacements[p.id].row === null
      );

      return {
        ...state,
        placements: nextPlacements,
        selectedPieceId: nextUnplaced ? nextUnplaced.id : targetId
      };
    }

    return state;
  },

  validate(puzzle: PuzzleDefinition<ShapesData>, state: ShapesState): ValidationResult {
    const silSet = new Set(puzzle.data.silhouette.map(([r, c]) => `${r},${c}`));
    const cellOwners: Record<string, string[]> = {};
    const conflicts = new Set<string>();

    for (const piece of puzzle.data.pieces) {
      const pl = state.placements[piece.id];
      if (!pl || pl.row === null || pl.col === null) continue;
      const rotCells = getRotatedCells(piece.cells, pl.rotation);
      for (const [dr, dc] of rotCells) {
        const r = pl.row + dr;
        const c = pl.col + dc;
        const key = `${r},${c}`;
        if (!cellOwners[key]) cellOwners[key] = [];
        cellOwners[key].push(piece.id);
        if (!silSet.has(key)) {
          conflicts.add(key);
        }
      }
    }

    // Check overlaps
    for (const [key, owners] of Object.entries(cellOwners)) {
      if (owners.length > 1) {
        conflicts.add(key);
      }
    }

    let coveredTargetCells = 0;
    for (const targetKey of silSet) {
      if (cellOwners[targetKey] && cellOwners[targetKey].length === 1) {
        coveredTargetCells++;
      }
    }

    const conflictList = Array.from(conflicts);
    const valid = conflictList.length === 0;
    const isSolved = valid && coveredTargetCells === silSet.size;
    const progressPercent = Math.round((coveredTargetCells / silSet.size) * 100);

    let message = `${coveredTargetCells} of ${silSet.size} silhouette cells filled.`;
    if (!valid) {
      message = 'Piece overlap or outside target silhouette.';
    } else if (isSolved) {
      message = 'Target silhouette perfectly assembled!';
    }

    return {
      valid,
      isSolved,
      conflicts: conflictList,
      progressPercent,
      message
    };
  },

  applyHint(puzzle: PuzzleDefinition<ShapesData>, state: ShapesState): ShapesState {
    const nextPlacements: Record<string, ShapePlacement> = {};
    for (const k of Object.keys(state.placements)) {
      nextPlacements[k] = { ...state.placements[k] };
    }

    for (const piece of puzzle.data.pieces) {
      const pl = nextPlacements[piece.id];
      if (
        pl.row !== piece.solutionRow ||
        pl.col !== piece.solutionCol ||
        pl.rotation !== piece.solutionRotation
      ) {
        nextPlacements[piece.id] = {
          row: piece.solutionRow,
          col: piece.solutionCol,
          rotation: piece.solutionRotation
        };
        return {
          ...state,
          placements: nextPlacements,
          selectedPieceId: piece.id
        };
      }
    }
    return state;
  },

  serialize(state: ShapesState): string {
    return JSON.stringify(state);
  },

  deserialize(puzzle: PuzzleDefinition<ShapesData>, raw: string): ShapesState | null {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.placements !== 'object') return null;
      for (const piece of puzzle.data.pieces) {
        if (!parsed.placements[piece.id]) return null;
      }
      return {
        placements: parsed.placements,
        selectedPieceId: parsed.selectedPieceId ?? puzzle.data.pieces[0]?.id ?? null
      };
    } catch {
      return null;
    }
  }
};
