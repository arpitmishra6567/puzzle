/**
 * GAME 7: KEYSMASH (Vowel Reconstruction Challenge)
 * Verified Reference Rules (PCMag & Developer Reddit Q&A):
 * - Reconstruct valid words by inserting the missing vowels (A, E, I, O, U) into consonant skeletons.
 * - Tracks per-word status for the completion recap:
 *   ✅ = Solved on first try with no mistakes or hints
 *   ❌ = Solved after at least one mistake/wrong submission
 *   💡 = Solved after using a hint
 */

import { PuzzleDefinition, PuzzleEngine, ValidationResult } from '../types/puzzle';

export interface KeysmashPrompt {
  id: string;
  clue: string;
  category: string;
  answer: string; // Full uppercase word, e.g. "PLANET"
}

export interface KeysmashData {
  theme: string;
  prompts: KeysmashPrompt[];
}

export type WordBadge = 'pending' | 'perfect' | 'mistake' | 'hinted';

export interface KeysmashWordState {
  vowelInputs: string[]; // One entry per vowel slot in the word
  solved: boolean;
  hadMistake: boolean;
  usedHint: boolean;
  badge: WordBadge;
  feedback: string;
}

export interface KeysmashState {
  activePromptIndex: number;
  words: Record<string, KeysmashWordState>;
}

export type KeysmashAction =
  | { type: 'SELECT_PROMPT'; index: number }
  | { type: 'INPUT_VOWEL'; vowel: string } // 'A' | 'E' | 'I' | 'O' | 'U'
  | { type: 'BACKSPACE_VOWEL' }
  | { type: 'SET_VOWELS_FOR_PROMPT'; promptId: string; vowels: string[] }
  | { type: 'SUBMIT_PROMPT'; promptId?: string };

const VOWEL_SET = new Set(['A', 'E', 'I', 'O', 'U']);

export function getVowelIndices(word: string): number[] {
  const indices: number[] = [];
  for (let i = 0; i < word.length; i++) {
    if (VOWEL_SET.has(word[i].toUpperCase())) {
      indices.push(i);
    }
  }
  return indices;
}

export function reconstructWord(answer: string, vowelInputs: string[]): string {
  const chars = answer.toUpperCase().split('');
  let vIdx = 0;
  return chars
    .map((ch) => {
      if (VOWEL_SET.has(ch)) {
        const v = vowelInputs[vIdx] || '_';
        vIdx++;
        return v;
      }
      return ch;
    })
    .join('');
}

export const KeysmashEngine: PuzzleEngine<KeysmashData, KeysmashState, KeysmashAction> = {
  categoryId: 'keysmash',

  createInitialState(puzzle: PuzzleDefinition<KeysmashData>): KeysmashState {
    const words: Record<string, KeysmashWordState> = {};
    for (const p of puzzle.data.prompts) {
      const vCount = getVowelIndices(p.answer).length;
      words[p.id] = {
        vowelInputs: Array(vCount).fill(''),
        solved: false,
        hadMistake: false,
        usedHint: false,
        badge: 'pending',
        feedback: ''
      };
    }
    return {
      activePromptIndex: 0,
      words
    };
  },

  applyAction(puzzle: PuzzleDefinition<KeysmashData>, state: KeysmashState, action: KeysmashAction): KeysmashState {
    const prompts = puzzle.data.prompts;
    const nextWords: Record<string, KeysmashWordState> = {};
    for (const k of Object.keys(state.words)) {
      nextWords[k] = {
        ...state.words[k],
        vowelInputs: [...state.words[k].vowelInputs]
      };
    }

    if (action.type === 'SELECT_PROMPT') {
      const idx = Math.max(0, Math.min(prompts.length - 1, action.index));
      return { ...state, activePromptIndex: idx };
    }

    const activePrompt = prompts[state.activePromptIndex];
    if (!activePrompt) return state;

    if (action.type === 'SET_VOWELS_FOR_PROMPT') {
      const target = nextWords[action.promptId];
      if (!target || target.solved) return state;
      target.vowelInputs = [...action.vowels];
      return { ...state, words: nextWords };
    }

    if (action.type === 'INPUT_VOWEL') {
      const v = action.vowel.toUpperCase();
      if (!VOWEL_SET.has(v)) return state;
      const ws = nextWords[activePrompt.id];
      if (ws.solved) return state;

      const emptyIdx = ws.vowelInputs.findIndex((x) => x === '');
      if (emptyIdx === -1) return state;
      ws.vowelInputs[emptyIdx] = v;
      ws.feedback = '';
      return { ...state, words: nextWords };
    }

    if (action.type === 'BACKSPACE_VOWEL') {
      const ws = nextWords[activePrompt.id];
      if (ws.solved) return state;
      for (let i = ws.vowelInputs.length - 1; i >= 0; i--) {
        if (ws.vowelInputs[i] !== '') {
          ws.vowelInputs[i] = '';
          ws.feedback = '';
          break;
        }
      }
      return { ...state, words: nextWords };
    }

    if (action.type === 'SUBMIT_PROMPT') {
      const pId = action.promptId ?? activePrompt.id;
      const promptDef = prompts.find((p) => p.id === pId);
      if (!promptDef) return state;
      const ws = nextWords[pId];
      if (ws.solved) return state;

      if (ws.vowelInputs.some((x) => x === '')) {
        ws.feedback = 'Fill in all missing vowel slots before submitting.';
        return { ...state, words: nextWords };
      }

      const candidate = reconstructWord(promptDef.answer, ws.vowelInputs);
      if (candidate === promptDef.answer.toUpperCase()) {
        ws.solved = true;
        ws.badge = ws.usedHint ? 'hinted' : ws.hadMistake ? 'mistake' : 'perfect';
        ws.feedback = `Correct! "${promptDef.answer}" reconstructed.`;

        // Advance active prompt to next unsolved word
        const nextUnsolvedIdx = prompts.findIndex((p) => !nextWords[p.id].solved);
        return {
          ...state,
          words: nextWords,
          activePromptIndex: nextUnsolvedIdx !== -1 ? nextUnsolvedIdx : state.activePromptIndex
        };
      } else {
        ws.hadMistake = true;
        const targetVowels = getVowelIndices(promptDef.answer).map((i) => promptDef.answer[i]);
        let matchingSlots = 0;
        ws.vowelInputs.forEach((v, i) => {
          if (v === targetVowels[i]) matchingSlots++;
        });
        ws.feedback = `Not quite (${matchingSlots}/${targetVowels.length} vowels in the right slot). Keep trying!`;
        return { ...state, words: nextWords };
      }
    }

    return state;
  },

  validate(puzzle: PuzzleDefinition<KeysmashData>, state: KeysmashState): ValidationResult {
    const prompts = puzzle.data.prompts;
    let solvedCount = 0;
    const conflicts: string[] = [];

    for (const p of prompts) {
      const ws = state.words[p.id];
      if (ws?.solved) {
        solvedCount++;
      } else if (ws?.hadMistake && ws.feedback.startsWith('Not quite')) {
        conflicts.push(p.id);
      }
    }

    const isSolved = solvedCount === prompts.length && prompts.length > 0;
    const progressPercent = prompts.length > 0 ? Math.round((solvedCount / prompts.length) * 100) : 100;
    const activePrompt = prompts[state.activePromptIndex];
    const activeFeedback = activePrompt ? state.words[activePrompt.id]?.feedback : '';

    return {
      valid: conflicts.length === 0,
      isSolved,
      conflicts,
      progressPercent,
      message: isSolved
        ? 'All Keysmash words reconstructed!'
        : activeFeedback || `${solvedCount} of ${prompts.length} words solved.`
    };
  },

  applyHint(puzzle: PuzzleDefinition<KeysmashData>, state: KeysmashState): KeysmashState {
    const prompts = puzzle.data.prompts;
    const nextWords: Record<string, KeysmashWordState> = {};
    for (const k of Object.keys(state.words)) {
      nextWords[k] = {
        ...state.words[k],
        vowelInputs: [...state.words[k].vowelInputs]
      };
    }

    const targetPrompt =
      prompts[state.activePromptIndex] && !nextWords[prompts[state.activePromptIndex].id].solved
        ? prompts[state.activePromptIndex]
        : prompts.find((p) => !nextWords[p.id].solved);

    if (!targetPrompt) return state;

    const ws = nextWords[targetPrompt.id];
    ws.usedHint = true;
    const targetVowels = getVowelIndices(targetPrompt.answer).map((i) => targetPrompt.answer[i]);

    // Reveal the first incorrect or empty vowel slot; if all filled after reveal, mark solved
    for (let i = 0; i < targetVowels.length; i++) {
      if (ws.vowelInputs[i] !== targetVowels[i]) {
        ws.vowelInputs[i] = targetVowels[i];
        break;
      }
    }

    if (ws.vowelInputs.every((v, i) => v === targetVowels[i])) {
      ws.solved = true;
      ws.badge = 'hinted';
      ws.feedback = `Solved "${targetPrompt.answer}" with hint 💡`;
    } else {
      ws.feedback = 'Hint placed a correct vowel 💡';
    }

    return { ...state, words: nextWords };
  },

  serialize(state: KeysmashState): string {
    return JSON.stringify(state);
  },

  deserialize(puzzle: PuzzleDefinition<KeysmashData>, raw: string): KeysmashState | null {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.words !== 'object') return null;
      for (const p of puzzle.data.prompts) {
        if (!parsed.words[p.id]) return null;
      }
      return {
        activePromptIndex: typeof parsed.activePromptIndex === 'number' ? parsed.activePromptIndex : 0,
        words: parsed.words
      };
    } catch {
      return null;
    }
  }
};
