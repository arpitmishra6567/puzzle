/**
 * Puzzle — Schema-Versioned LocalStorage Persistence, Migration & Recovery
 * Handles saving, loading, backward-compatible migration from `puzzled_state_v1` to `puzzle_state_v1`,
 * corrupt data recovery, star rating calculation, and emoji share summaries.
 * Includes an automatic in-memory fallback store for sandboxed iframes or data: URI origins.
 */

import {
  ActiveSessionRecord,
  CategoryId,
  CompletedRecord,
  PersistedProfileV1,
  UserPreferences
} from '../types/puzzle';
import { recordDailyCompletion } from './daily';

export const PRIMARY_STORAGE_KEY = 'puzzle_state_v1';
export const LEGACY_STORAGE_KEY = 'puzzled_state_v1';
export const STORAGE_KEY = PRIMARY_STORAGE_KEY;

export type PlayerProfile = PersistedProfileV1;
export type PlayerPreferences = UserPreferences;

const memoryStoreData: Record<string, string> = {};
export const memoryStorageFallback = {
  getItem(k: string): string | null {
    return Object.prototype.hasOwnProperty.call(memoryStoreData, k) ? memoryStoreData[k] : null;
  },
  setItem(k: string, v: string): void {
    memoryStoreData[k] = String(v);
  },
  removeItem(k: string): void {
    delete memoryStoreData[k];
  }
};

function getSafeBrowserStorage(): {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
} {
  if (typeof window === 'undefined') return memoryStorageFallback;
  try {
    const ls = window.localStorage;
    const testKey = '__puzzle_probe__';
    ls.setItem(testKey, '1');
    ls.removeItem(testKey);
    return ls;
  } catch {
    return memoryStorageFallback;
  }
}

export function createDefaultPreferences(): UserPreferences {
  return {
    theme: 'dark',
    accentTheme: 'cosmic',
    soundEnabled: true,
    reducedMotion: false,
    starstruckAutoCross: true
  };
}

export function createDefaultProfile(): PersistedProfileV1 {
  return {
    schemaVersion: 1,
    completedPuzzles: {},
    dailyCompletions: {},
    streak: {
      current: 0,
      best: 0,
      lastCompletedDate: null
    },
    activeSessions: {},
    recentPuzzleIds: [],
    preferences: createDefaultPreferences()
  };
}

export function sanitizeProfile(raw: any): PersistedProfileV1 {
  const fallback = createDefaultProfile();
  if (!raw || typeof raw !== 'object' || raw.schemaVersion !== 1) {
    return fallback;
  }

  const completedPuzzles =
    raw.completedPuzzles && typeof raw.completedPuzzles === 'object' && !Array.isArray(raw.completedPuzzles)
      ? raw.completedPuzzles
      : {};

  const dailyCompletions =
    raw.dailyCompletions && typeof raw.dailyCompletions === 'object' && !Array.isArray(raw.dailyCompletions)
      ? raw.dailyCompletions
      : {};

  const streak =
    raw.streak && typeof raw.streak === 'object'
      ? {
          current: typeof raw.streak.current === 'number' && raw.streak.current >= 0 ? raw.streak.current : 0,
          best: typeof raw.streak.best === 'number' && raw.streak.best >= 0 ? raw.streak.best : 0,
          lastCompletedDate: typeof raw.streak.lastCompletedDate === 'string' ? raw.streak.lastCompletedDate : null
        }
      : fallback.streak;

  const activeSessions =
    raw.activeSessions && typeof raw.activeSessions === 'object' && !Array.isArray(raw.activeSessions)
      ? raw.activeSessions
      : {};

  const recentPuzzleIds = Array.isArray(raw.recentPuzzleIds)
    ? raw.recentPuzzleIds.filter((id: any) => typeof id === 'string').slice(0, 12)
    : [];

  const prefs = raw.preferences && typeof raw.preferences === 'object' ? raw.preferences : {};
  const preferences: UserPreferences = {
    theme: prefs.theme === 'light' ? 'light' : 'dark',
    accentTheme:
      prefs.accentTheme === 'emerald' || prefs.accentTheme === 'amber' ? prefs.accentTheme : 'cosmic',
    soundEnabled: typeof prefs.soundEnabled === 'boolean' ? prefs.soundEnabled : true,
    reducedMotion: typeof prefs.reducedMotion === 'boolean' ? prefs.reducedMotion : false,
    starstruckAutoCross: typeof prefs.starstruckAutoCross === 'boolean' ? prefs.starstruckAutoCross : true
  };

  return {
    schemaVersion: 1,
    completedPuzzles,
    dailyCompletions,
    streak,
    activeSessions,
    recentPuzzleIds,
    preferences
  };
}

/**
 * Loads player profile from `puzzle_state_v1`, or transparently migrates existing data
 * from `puzzled_state_v1` if present so no player progress, history, preferences, or streaks are lost.
 */
export function loadProfile(
  storage?: Pick<Storage, 'getItem'> & Partial<Pick<Storage, 'setItem'>>
): PersistedProfileV1 {
  try {
    const store = storage ?? getSafeBrowserStorage();
    const primaryRaw = store.getItem(PRIMARY_STORAGE_KEY);
    if (primaryRaw) {
      const parsed = JSON.parse(primaryRaw);
      if (parsed && typeof parsed === 'object' && parsed.schemaVersion === 1) {
        return sanitizeProfile(parsed);
      }
    }

    const legacyRaw = store.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const parsedLegacy = JSON.parse(legacyRaw);
      if (parsedLegacy && typeof parsedLegacy === 'object' && parsedLegacy.schemaVersion === 1) {
        const migrated = sanitizeProfile(parsedLegacy);
        try {
          if (typeof store.setItem === 'function') {
            store.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(migrated));
          }
        } catch {
          // Ignore write errors during read-time migration
        }
        return migrated;
      }
    }

    return createDefaultProfile();
  } catch {
    return createDefaultProfile();
  }
}

export function saveProfile(
  profile: PersistedProfileV1,
  storage?: Pick<Storage, 'setItem'>
): boolean {
  try {
    const store = storage ?? getSafeBrowserStorage();
    const serialized = JSON.stringify(profile);
    store.setItem(PRIMARY_STORAGE_KEY, serialized);
    try {
      store.setItem(LEGACY_STORAGE_KEY, serialized);
    } catch {
      // Ignore secondary mirror errors
    }
    return true;
  } catch {
    return false;
  }
}

export function resetProfile(storage?: Pick<Storage, 'removeItem' | 'setItem'>): PersistedProfileV1 {
  const fresh = createDefaultProfile();
  try {
    const store = storage ?? getSafeBrowserStorage();
    store.removeItem(PRIMARY_STORAGE_KEY);
    store.removeItem(LEGACY_STORAGE_KEY);
    store.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(fresh));
  } catch {
    // Ignore storage restriction errors in sandboxed iframes
  }
  return fresh;
}

export function computeStars(mistakes: number, hintsUsed: number): 1 | 2 | 3 {
  const penalty = mistakes + hintsUsed;
  if (penalty === 0) return 3;
  if (penalty <= 2) return 2;
  return 1;
}

export function buildShareEmoji(
  categoryId: CategoryId,
  puzzleTitle: string,
  stars: 1 | 2 | 3,
  moves: number,
  hintsUsed: number,
  extraState?: any
): string {
  const starBadges = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  if (categoryId === 'starstruck' && extraState?.starOrder) {
    const regionEmojis = ['🟧', '🟦', '🟩', '🟪', '🟨', '🟥', '🟫'];
    const firstThree = (extraState.starOrder as number[])
      .slice(0, 3)
      .map((r) => regionEmojis[r % regionEmojis.length])
      .join('');
    return `Puzzle • Starstruck (${puzzleTitle})\n⭐️${firstThree || '🟧🟦🟩'} | ${starBadges} | ${moves} moves`;
  }
  if (categoryId === 'keysmash' && extraState?.words) {
    const badges = Object.values(extraState.words as Record<string, any>)
      .map((w) => (w.badge === 'perfect' ? '✅' : w.badge === 'hinted' ? '💡' : '❌'))
      .join('');
    return `Puzzle • Keysmash (${puzzleTitle})\n${badges} | ${starBadges}`;
  }
  const catIcons: Record<CategoryId, string> = {
    neon: '⚡',
    currents: '🌊',
    snippets: '📐',
    wordsmith: '🔤',
    starstruck: '⭐️',
    bonza: '🧱',
    waywords: '🧭',
    crossover: '🔀',
    jigsaw: '🧩',
    combo: '🔗',
    sudoku: '🔢',
    shapes: '💠',
    keysmash: '⌨️'
  };
  return `Puzzle • ${puzzleTitle}\n${catIcons[categoryId]} ${starBadges} | ${moves} moves | ${hintsUsed} hints`;
}

export function recordPuzzleWin(
  profile: PersistedProfileV1,
  params: {
    puzzleId: string;
    categoryId: CategoryId;
    puzzleTitle: string;
    moves: number;
    mistakes: number;
    hintsUsed: number;
    elapsedSeconds: number;
    dateStr: string;
    extraState?: any;
  }
): PersistedProfileV1 {
  const stars = computeStars(params.mistakes, params.hintsUsed);
  const shareEmoji = buildShareEmoji(
    params.categoryId,
    params.puzzleTitle,
    stars,
    params.moves,
    params.hintsUsed,
    params.extraState
  );

  const existing = profile.completedPuzzles[params.puzzleId];
  const record: CompletedRecord = {
    puzzleId: params.puzzleId,
    categoryId: params.categoryId,
    completedAt: new Date().toISOString(),
    moves: existing ? Math.min(existing.moves, params.moves) : params.moves,
    mistakes: existing ? Math.min(existing.mistakes, params.mistakes) : params.mistakes,
    hintsUsed: existing ? Math.min(existing.hintsUsed, params.hintsUsed) : params.hintsUsed,
    elapsedSeconds: existing ? Math.min(existing.elapsedSeconds, params.elapsedSeconds) : params.elapsedSeconds,
    stars: existing ? (Math.max(existing.stars, stars) as 1 | 2 | 3) : stars,
    shareEmoji
  };

  const nextActive = { ...profile.activeSessions };
  delete nextActive[params.puzzleId];

  const recent = [
    params.puzzleId,
    ...profile.recentPuzzleIds.filter((id) => id !== params.puzzleId)
  ].slice(0, 10);

  const withStreak = recordDailyCompletion(profile, params.puzzleId, params.dateStr);

  return {
    ...withStreak,
    completedPuzzles: {
      ...withStreak.completedPuzzles,
      [params.puzzleId]: record
    },
    activeSessions: nextActive,
    recentPuzzleIds: recent
  };
}

export function saveActiveSession(
  profile: PersistedProfileV1,
  session: ActiveSessionRecord
): PersistedProfileV1 {
  const recent = [
    session.puzzleId,
    ...profile.recentPuzzleIds.filter((id) => id !== session.puzzleId)
  ].slice(0, 10);

  return {
    ...profile,
    activeSessions: {
      ...profile.activeSessions,
      [session.puzzleId]: session
    },
    recentPuzzleIds: recent
  };
}
