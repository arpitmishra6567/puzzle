/**
 * PUZZLED — Core TypeScript Definitions
 * Supports the 11 Active Daily Catalog Categories (Neon, Currents, Snippets, Wordsmith,
 * Starstruck, Bonza, Waywords, Crossover, Jigsaw, Combo, Sudoku) plus the 2 Classic Vault
 * Categories (Shapes, Keysmash) — 13 genuine playable engines in total.
 */

export type CategoryId =
  | 'neon'
  | 'currents'
  | 'snippets'
  | 'wordsmith'
  | 'starstruck'
  | 'bonza'
  | 'waywords'
  | 'crossover'
  | 'jigsaw'
  | 'combo'
  | 'sudoku'
  | 'shapes'
  | 'keysmash';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  subtitle: string;
  domain: string;
  accentColor: string;
  badgeBg: string;
  inDailyLineup: boolean; // True for the 11 active daily games, false for Classic Vault games
  gridSpan?: 'featured' | 'wide' | 'standard';
  description: string;
  rulesSummary: string[];
  controlsHint: string;
}

export interface PuzzleDefinition<TData = any> {
  id: string;
  categoryId: CategoryId;
  title: string;
  difficulty: Difficulty;
  collectionId: string;
  themeLabel: string;
  estimatedMinutes: number;
  instructions: string;
  data: TData;
}

export interface ValidationResult {
  valid: boolean;
  isSolved: boolean;
  conflicts: string[];
  progressPercent: number;
  message: string;
}

export interface PuzzleEngine<TData = any, TState = any, TAction = any> {
  categoryId: CategoryId;
  createInitialState(puzzle: PuzzleDefinition<TData>): TState;
  applyAction(puzzle: PuzzleDefinition<TData>, state: TState, action: TAction): TState;
  validate(puzzle: PuzzleDefinition<TData>, state: TState): ValidationResult;
  applyHint(puzzle: PuzzleDefinition<TData>, state: TState): TState;
  serialize(state: TState): string;
  deserialize(puzzle: PuzzleDefinition<TData>, raw: string): TState | null;
}

export interface CompletedRecord {
  puzzleId: string;
  categoryId: CategoryId;
  completedAt: string;
  moves: number;
  mistakes: number;
  hintsUsed: number;
  elapsedSeconds: number;
  stars: 1 | 2 | 3;
  shareEmoji: string;
}

export interface ActiveSessionRecord {
  puzzleId: string;
  categoryId: CategoryId;
  serializedState: string;
  moves: number;
  mistakes: number;
  hintsUsed: number;
  elapsedSeconds: number;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  accentTheme: 'cosmic' | 'emerald' | 'amber';
  soundEnabled: boolean;
  reducedMotion: boolean;
  starstruckAutoCross: boolean;
}

export interface PersistedProfileV1 {
  schemaVersion: 1;
  completedPuzzles: Record<string, CompletedRecord>;
  dailyCompletions: Record<string, string[]>;
  streak: {
    current: number;
    best: number;
    lastCompletedDate: string | null;
  };
  activeSessions: Record<string, ActiveSessionRecord>;
  recentPuzzleIds: string[];
  preferences: UserPreferences;
}
