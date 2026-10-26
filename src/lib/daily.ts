/**
 * Puzzle — Deterministic Daily Challenge & Streak System
 * - Maps any local calendar date `YYYY-MM-DD` deterministically to:
 *   1. A featured spotlight puzzle of the day (from the 11 Active Daily Categories)
 *   2. A full 11-category daily puzzle lineup with date-seeded generated challenges (`daily-YYYY-MM-DD-<categoryId>`)
 * - Computes consecutive daily streaks, handles missed days and duplicate completions safely.
 */

import { CATEGORIES, DAILY_CATEGORIES } from '../data/puzzles';
import { CategoryId, PersistedProfileV1, PuzzleDefinition } from '../types/puzzle';
import { daySerialFromDateStr, generateDailyPuzzle } from './daily_generator';

export interface DailySchedule {
  dateStr: string;
  humanDate: string;
  spotlightPuzzle: PuzzleDefinition<any>;
  dailyLineup: PuzzleDefinition<any>[]; // Exactly 11 daily challenges
  lineup: Record<CategoryId, PuzzleDefinition<any>>;
}

/**
 * Formats a Date object as local `YYYY-MM-DD`.
 */
export function formatLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a `YYYY-MM-DD` date string into an editorial human-readable date, e.g. "Monday, October 26, 2026".
 */
export function formatHumanDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${days[dt.getDay()]}, ${months[dt.getMonth()]} ${d}, ${y}`;
}

/**
 * Pure deterministic hash of a YYYY-MM-DD string.
 */
export function hashDateString(dateStr: string): number {
  let h = 2166136261;
  for (let i = 0; i < dateStr.length; i++) {
    h ^= dateStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

/**
 * Returns the deterministic 11-game daily puzzle lineup and featured spotlight for `dateStr` (YYYY-MM-DD).
 * Uses `generateDailyPuzzle(dateStr, cat.id)` so every day produces a genuinely fresh, deterministic daily challenge.
 */
export function getDailySchedule(dateStr: string): DailySchedule {
  const daySerial = Math.abs(daySerialFromDateStr(dateStr));
  const lineup = {} as Record<CategoryId, PuzzleDefinition<any>>;

  CATEGORIES.forEach((cat) => {
    lineup[cat.id] = generateDailyPuzzle(dateStr, cat.id);
  });

  const dailyLineup = DAILY_CATEGORIES.map((cat) => lineup[cat.id]);
  const spotlightCategory = DAILY_CATEGORIES[daySerial % DAILY_CATEGORIES.length].id;

  return {
    dateStr,
    humanDate: formatHumanDate(dateStr),
    spotlightPuzzle: lineup[spotlightCategory],
    dailyLineup,
    lineup
  };
}

/**
 * Computes the calendar day difference `dateB - dateA` in whole days for `YYYY-MM-DD` strings.
 */
export function diffCalendarDays(dateA: string, dateB: string): number {
  const [yA, mA, dA] = dateA.split('-').map(Number);
  const [yB, mB, dB] = dateB.split('-').map(Number);
  const utcA = Date.UTC(yA, mA - 1, dA);
  const utcB = Date.UTC(yB, mB - 1, dB);
  return Math.round((utcB - utcA) / (1000 * 60 * 60 * 24));
}

/**
 * Updates streak state when a puzzle is completed on `dateStr` (YYYY-MM-DD).
 * - Completing multiple puzzles on the same `dateStr` only increments the streak once.
 * - Completing on `lastCompletedDate + 1 day` increments `current`.
 * - Completing after a gap (> 1 day) resets `current` to 1.
 */
export function recordDailyCompletion(
  profile: PersistedProfileV1,
  puzzleId: string,
  dateStr: string
): PersistedProfileV1 {
  const nextDaily = { ...profile.dailyCompletions };
  const existingForDay = nextDaily[dateStr] ? [...nextDaily[dateStr]] : [];
  if (!existingForDay.includes(puzzleId)) {
    existingForDay.push(puzzleId);
  }
  nextDaily[dateStr] = existingForDay;

  let { current, best, lastCompletedDate } = profile.streak;

  if (!lastCompletedDate) {
    current = 1;
    best = Math.max(best, 1);
    lastCompletedDate = dateStr;
  } else {
    const diff = diffCalendarDays(lastCompletedDate, dateStr);
    if (diff === 0) {
      // Idempotent guard: already incremented today
    } else if (diff === 1) {
      current += 1;
      best = Math.max(best, current);
      lastCompletedDate = dateStr;
    } else if (diff > 1) {
      current = 1;
      best = Math.max(best, 1);
      lastCompletedDate = dateStr;
    }
  }

  return {
    ...profile,
    dailyCompletions: nextDaily,
    streak: {
      current,
      best,
      lastCompletedDate
    }
  };
}

/**
 * Generates the 7-day weekly view ending on `referenceDateStr` (YYYY-MM-DD).
 */
export function getWeeklyTracker(
  profile: PersistedProfileV1,
  referenceDateStr: string
): { dateStr: string; dayLabel: string; completedCount: number; isToday: boolean }[] {
  const [y, m, d] = referenceDateStr.split('-').map(Number);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result: { dateStr: string; dayLabel: string; completedCount: number; isToday: boolean }[] = [];

  for (let offset = -6; offset <= 0; offset++) {
    const dt = new Date(y, m - 1, d + offset);
    const ds = formatLocalDate(dt);
    const completed = profile.dailyCompletions[ds] || [];
    result.push({
      dateStr: ds,
      dayLabel: dayNames[dt.getDay()],
      completedCount: completed.length,
      isToday: offset === 0
    });
  }
  return result;
}
