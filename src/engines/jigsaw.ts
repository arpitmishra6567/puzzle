/**
 * GAME 3: JIGSAW (Visual & Spatial Tile Assembly)
 * Rules:
 * - An artwork scene is divided into rows × cols interlocking jigsaw tiles.
 * - Tiles begin in a deterministic shuffled arrangement (with optional 90° rotations).
 * - Players swap two tiles (via tap-to-select/tap-to-place or drag-and-drop) and can rotate tiles.
 * - Solved when every slot i contains piece i at 0° rotation.
 */

import { PuzzleDefinition, PuzzleEngine, ValidationResult } from '../types/puzzle';

export interface JigsawData {
  rows: number;
  cols: number;
  artTheme: 'aurora' | 'coral' | 'bauhaus';
  initialOrder: number[];      // permutation of 0..(rows*cols - 1)
  initialRotations: number[];  // 0, 90, 180, 270 for each piece ID
}

export interface JigsawState {
  slots: number[];             // slots[slotIdx] = pieceId
  rotations: number[];         // rotations[pieceId] = 0 | 90 | 180 | 270
  selectedSlot: number | null;
  highlightedHintSlot: number | null;
}

export type JigsawAction =
  | { type: 'SELECT_OR_SWAP_SLOT'; slotIndex: number }
  | { type: 'SWAP_SLOTS'; slotA: number; slotB: number }
  | { type: 'ROTATE_SLOT'; slotIndex: number };

export const JigsawEngine: PuzzleEngine<JigsawData, JigsawState, JigsawAction> = {
  categoryId: 'jigsaw',

  createInitialState(puzzle: PuzzleDefinition<JigsawData>): JigsawState {
    return {
      slots: [...puzzle.data.initialOrder],
      rotations: [...puzzle.data.initialRotations],
      selectedSlot: null,
      highlightedHintSlot: null
    };
  },

  applyAction(puzzle: PuzzleDefinition<JigsawData>, state: JigsawState, action: JigsawAction): JigsawState {
    const total = puzzle.data.rows * puzzle.data.cols;
    const nextSlots = [...state.slots];
    const nextRotations = [...state.rotations];

    if (action.type === 'ROTATE_SLOT') {
      const idx = action.slotIndex;
      if (idx < 0 || idx >= total) return state;
      const pieceId = nextSlots[idx];
      nextRotations[pieceId] = (nextRotations[pieceId] + 90) % 360;
      return {
        ...state,
        rotations: nextRotations,
        highlightedHintSlot: null
      };
    }

    if (action.type === 'SWAP_SLOTS') {
      const { slotA, slotB } = action;
      if (slotA < 0 || slotA >= total || slotB < 0 || slotB >= total || slotA === slotB) return state;
      const tmp = nextSlots[slotA];
      nextSlots[slotA] = nextSlots[slotB];
      nextSlots[slotB] = tmp;
      return {
        ...state,
        slots: nextSlots,
        selectedSlot: null,
        highlightedHintSlot: null
      };
    }

    if (action.type === 'SELECT_OR_SWAP_SLOT') {
      const idx = action.slotIndex;
      if (idx < 0 || idx >= total) return state;
      if (state.selectedSlot === null) {
        return { ...state, selectedSlot: idx, highlightedHintSlot: null };
      }
      if (state.selectedSlot === idx) {
        return { ...state, selectedSlot: null };
      }
      const tmp = nextSlots[state.selectedSlot];
      nextSlots[state.selectedSlot] = nextSlots[idx];
      nextSlots[idx] = tmp;
      return {
        ...state,
        slots: nextSlots,
        selectedSlot: null,
        highlightedHintSlot: null
      };
    }

    return state;
  },

  validate(puzzle: PuzzleDefinition<JigsawData>, state: JigsawState): ValidationResult {
    const total = puzzle.data.rows * puzzle.data.cols;
    let correctCount = 0;
    const misplaced: string[] = [];

    for (let i = 0; i < total; i++) {
      const pieceId = state.slots[i];
      const rot = state.rotations[pieceId] % 360;
      if (pieceId === i && rot === 0) {
        correctCount++;
      } else if (pieceId === i && rot !== 0) {
        misplaced.push(`slot-${i}`);
      }
    }

    const isSolved = correctCount === total;
    const progressPercent = Math.round((correctCount / total) * 100);

    let message = `${correctCount} of ${total} pieces locked in place.`;
    if (misplaced.length > 0) {
      message = `${correctCount} of ${total} locked (${misplaced.length} in right spot but needs rotation).`;
    }
    if (isSolved) {
      message = 'Artwork seamlessly assembled!';
    }

    return {
      valid: true,
      isSolved,
      conflicts: misplaced,
      progressPercent,
      message
    };
  },

  applyHint(puzzle: PuzzleDefinition<JigsawData>, state: JigsawState): JigsawState {
    const total = puzzle.data.rows * puzzle.data.cols;
    const nextSlots = [...state.slots];
    const nextRotations = [...state.rotations];

    for (let targetSlot = 0; targetSlot < total; targetSlot++) {
      const currentPiece = nextSlots[targetSlot];
      if (currentPiece !== targetSlot || nextRotations[targetSlot] !== 0) {
        const currentIndex = nextSlots.indexOf(targetSlot);
        if (currentIndex !== -1) {
          nextSlots[currentIndex] = currentPiece;
          nextSlots[targetSlot] = targetSlot;
          nextRotations[targetSlot] = 0;
          return {
            ...state,
            slots: nextSlots,
            rotations: nextRotations,
            selectedSlot: null,
            highlightedHintSlot: targetSlot
          };
        }
      }
    }
    return state;
  },

  serialize(state: JigsawState): string {
    return JSON.stringify(state);
  },

  deserialize(puzzle: PuzzleDefinition<JigsawData>, raw: string): JigsawState | null {
    try {
      const parsed = JSON.parse(raw);
      const total = puzzle.data.rows * puzzle.data.cols;
      if (
        !parsed ||
        !Array.isArray(parsed.slots) ||
        parsed.slots.length !== total ||
        !Array.isArray(parsed.rotations) ||
        parsed.rotations.length !== total
      ) {
        return null;
      }
      return {
        slots: parsed.slots,
        rotations: parsed.rotations,
        selectedSlot: typeof parsed.selectedSlot === 'number' ? parsed.selectedSlot : null,
        highlightedHintSlot: null
      };
    } catch {
      return null;
    }
  }
};
