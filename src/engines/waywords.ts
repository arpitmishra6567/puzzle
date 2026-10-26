/**
 * GAME 6: WAYWORDS (Theme Word Path Finder)
 * Verified Reference Rules (FAQ #1856):
 * - Uncover a continuous green path from START (top) to FINISH (bottom) by finding theme-related words.
 * - Grid contains Path Words (which connect Start to Finish), Bonus Words (highlight a path letter), and Decoy Words.
 * - Lightbulb hint marks an unfound path word's starting letter in yellow.
 */

import { PuzzleDefinition, PuzzleEngine, ValidationResult } from '../types/puzzle';

export interface WaywordsWordDef {
  word: string;
  cells: [number, number][]; // ordered coordinates forming the word
  kind: 'path' | 'bonus' | 'decoy';
  clue: string;
}

export interface WaywordsData {
  rows: number;
  cols: number;
  theme: string;
  grid: string[][]; // uppercase letters
  emojiCells?: Record<string, { emoji: string; letter: string; meaning: string }>;
  words: WaywordsWordDef[];
}

export interface WaywordsState {
  foundPathWords: string[];
  foundBonusWords: string[];
  attemptedDecoys: string[];
  selectedPath: [number, number][];
  hintCells: string[]; // "r,c" marked yellow by hints or bonus words
  lastFeedback: { text: string; tone: 'neutral' | 'success' | 'bonus' | 'error' };
}

export type WaywordsAction =
  | { type: 'TOGGLE_CELL'; row: number; col: number }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SUBMIT_SELECTION' }
  | { type: 'SUBMIT_WORD_DIRECT'; word: string };

function isAdjacent(a: [number, number], b: [number, number]): boolean {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
}

export const WaywordsEngine: PuzzleEngine<WaywordsData, WaywordsState, WaywordsAction> = {
  categoryId: 'waywords',

  createInitialState(_puzzle: PuzzleDefinition<WaywordsData>): WaywordsState {
    return {
      foundPathWords: [],
      foundBonusWords: [],
      attemptedDecoys: [],
      selectedPath: [],
      hintCells: [],
      lastFeedback: {
        text: 'Select adjacent letters to trace a theme word from Start to Finish.',
        tone: 'neutral'
      }
    };
  },

  applyAction(puzzle: PuzzleDefinition<WaywordsData>, state: WaywordsState, action: WaywordsAction): WaywordsState {
    if (action.type === 'CLEAR_SELECTION') {
      return { ...state, selectedPath: [] };
    }

    if (action.type === 'TOGGLE_CELL') {
      const { row, col } = action;
      if (row < 0 || row >= puzzle.data.rows || col < 0 || col >= puzzle.data.cols) return state;

      const existingIdx = state.selectedPath.findIndex(([r, c]) => r === row && c === col);
      if (existingIdx !== -1) {
        // Clicking the last cell pops it; clicking an earlier cell truncates back to it
        const trimmed = existingIdx === state.selectedPath.length - 1
          ? state.selectedPath.slice(0, -1)
          : state.selectedPath.slice(0, existingIdx + 1);
        return { ...state, selectedPath: trimmed };
      }

      if (state.selectedPath.length > 0) {
        const last = state.selectedPath[state.selectedPath.length - 1];
        if (!isAdjacent(last, [row, col])) {
          // Start a fresh selection at the clicked cell if non-adjacent
          return { ...state, selectedPath: [[row, col]] };
        }
      }

      const nextSelected: [number, number][] = [...state.selectedPath, [row, col]];
      // Auto-check if the traced coordinates exactly match a known path or bonus word
      const tracedWord = nextSelected.map(([r, c]) => puzzle.data.grid[r][c]).join('');
      const exactMatch = puzzle.data.words.find(
        (w) =>
          w.word === tracedWord &&
          w.cells.length === nextSelected.length &&
          w.cells.every(([wr, wc], idx) => wr === nextSelected[idx][0] && wc === nextSelected[idx][1])
      );

      if (exactMatch && exactMatch.kind === 'path' && !state.foundPathWords.includes(exactMatch.word)) {
        return {
          ...state,
          foundPathWords: [...state.foundPathWords, exactMatch.word],
          selectedPath: [],
          lastFeedback: {
            text: `Path word "${exactMatch.word}" unlocked!`,
            tone: 'success'
          }
        };
      }

      return { ...state, selectedPath: nextSelected };
    }

    let candidateWord = '';
    if (action.type === 'SUBMIT_WORD_DIRECT') {
      candidateWord = action.word.trim().toUpperCase();
    } else if (action.type === 'SUBMIT_SELECTION') {
      candidateWord = state.selectedPath.map(([r, c]) => puzzle.data.grid[r][c]).join('');
    }

    if (!candidateWord) return state;

    const matched = puzzle.data.words.find((w) => w.word === candidateWord);
    if (!matched) {
      return {
        ...state,
        selectedPath: [],
        lastFeedback: {
          text: `"${candidateWord}" is not a theme path word.`,
          tone: 'error'
        }
      };
    }

    if (matched.kind === 'path') {
      if (state.foundPathWords.includes(matched.word)) {
        return {
          ...state,
          selectedPath: [],
          lastFeedback: { text: `"${matched.word}" is already on your green path.`, tone: 'neutral' }
        };
      }
      return {
        ...state,
        foundPathWords: [...state.foundPathWords, matched.word],
        selectedPath: [],
        lastFeedback: { text: `Path word "${matched.word}" connected!`, tone: 'success' }
      };
    }

    if (matched.kind === 'bonus') {
      const nextBonus = state.foundBonusWords.includes(matched.word)
        ? state.foundBonusWords
        : [...state.foundBonusWords, matched.word];
      // Highlight a letter of an unfound path word
      const unfoundPath = puzzle.data.words.find(
        (w) => w.kind === 'path' && !state.foundPathWords.includes(w.word)
      );
      const nextHints = [...state.hintCells];
      if (unfoundPath && unfoundPath.cells.length > 0) {
        const key = `${unfoundPath.cells[0][0]},${unfoundPath.cells[0][1]}`;
        if (!nextHints.includes(key)) nextHints.push(key);
      }
      return {
        ...state,
        foundBonusWords: nextBonus,
        hintCells: nextHints,
        selectedPath: [],
        lastFeedback: {
          text: `Bonus word "${matched.word}" found! Highlighted a path letter.`,
          tone: 'bonus'
        }
      };
    }

    // Decoy word
    const nextDecoys = state.attemptedDecoys.includes(matched.word)
      ? state.attemptedDecoys
      : [...state.attemptedDecoys, matched.word];
    return {
      ...state,
      attemptedDecoys: nextDecoys,
      selectedPath: [],
      lastFeedback: {
        text: `"${matched.word}" is a decoy! Steer clear of off-theme words.`,
        tone: 'error'
      }
    };
  },

  validate(puzzle: PuzzleDefinition<WaywordsData>, state: WaywordsState): ValidationResult {
    const pathWords = puzzle.data.words.filter((w) => w.kind === 'path');
    const foundCount = pathWords.filter((w) => state.foundPathWords.includes(w.word)).length;
    const isSolved = foundCount === pathWords.length && pathWords.length > 0;
    const progressPercent = pathWords.length > 0 ? Math.round((foundCount / pathWords.length) * 100) : 100;

    return {
      valid: state.lastFeedback.tone !== 'error',
      isSolved,
      conflicts: [],
      progressPercent,
      message: isSolved
        ? 'Path connected from Start to Finish!'
        : state.lastFeedback.text || `${foundCount} of ${pathWords.length} path words found.`
    };
  },

  applyHint(puzzle: PuzzleDefinition<WaywordsData>, state: WaywordsState): WaywordsState {
    const unfound = puzzle.data.words.find(
      (w) => w.kind === 'path' && !state.foundPathWords.includes(w.word)
    );
    if (!unfound) return state;

    const firstCellKey = `${unfound.cells[0][0]},${unfound.cells[0][1]}`;
    // If first cell already hinted, reveal the word directly so player never gets stuck
    if (state.hintCells.includes(firstCellKey)) {
      return {
        ...state,
        foundPathWords: [...state.foundPathWords, unfound.word],
        selectedPath: [],
        lastFeedback: {
          text: `Hint revealed path word "${unfound.word}" (${unfound.clue}).`,
          tone: 'success'
        }
      };
    }

    return {
      ...state,
      hintCells: [...state.hintCells, firstCellKey],
      lastFeedback: {
        text: `Hint: Highlighted starting letter "${unfound.word[0]}" in yellow (${unfound.clue}).`,
        tone: 'neutral'
      }
    };
  },

  serialize(state: WaywordsState): string {
    return JSON.stringify(state);
  },

  deserialize(_puzzle: PuzzleDefinition<WaywordsData>, raw: string): WaywordsState | null {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.foundPathWords)) return null;
      return {
        foundPathWords: parsed.foundPathWords,
        foundBonusWords: Array.isArray(parsed.foundBonusWords) ? parsed.foundBonusWords : [],
        attemptedDecoys: Array.isArray(parsed.attemptedDecoys) ? parsed.attemptedDecoys : [],
        selectedPath: Array.isArray(parsed.selectedPath) ? parsed.selectedPath : [],
        hintCells: Array.isArray(parsed.hintCells) ? parsed.hintCells : [],
        lastFeedback: parsed.lastFeedback ?? { text: '', tone: 'neutral' }
      };
    } catch {
      return null;
    }
  }
};
