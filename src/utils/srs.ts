import type { FrageMeta, SRSMeta } from '@/types/quiz';

export interface SRSState {
  interval: number; // days
  repetitions: number;
  efactor: number;
}

export const DEFAULT_SRS_STATE: SRSState = {
  interval: 0,
  repetitions: 0,
  efactor: 2.5,
};

export const DEFAULT_SRS_META: SRSMeta = {
  ...DEFAULT_SRS_STATE,
  nextReview: new Date().toISOString(),
};

/**
 * SM-2 spaced repetition algorithm.
 *
 * @param quality Response quality: 0=again, 3=hard, 4=good, 5=easy
 * @param state Current SRS state
 * @returns Updated SRS state with new interval (in days)
 */
export function sm2(quality: number, state: SRSState): SRSState {
  let { interval, repetitions, efactor } = state;

  // Clamp quality to valid range
  const q = Math.max(0, Math.min(5, quality));

  if (q < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * efactor);
    }
    repetitions += 1;
  }

  // Update ease factor
  efactor = efactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (efactor < 1.3) {
    efactor = 1.3;
  }

  return { interval, repetitions, efactor };
}

/**
 * Calculate next review date based on interval.
 *
 * @param intervalDays Days until next review
 * @param from Optional base date (defaults to now)
 * @returns ISO date string for next review
 */
export function calculateNextReview(
  intervalDays: number,
  from: Date = new Date()
): string {
  const next = new Date(from);
  next.setDate(next.getDate() + intervalDays);
  next.setHours(0, 0, 0, 0);
  return next.toISOString();
}

/**
 * Map flashcard self-assessment grades to SM-2 quality values.
 */
export const SELF_ASSESSMENT_QUALITY: Record<string, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
};

/**
 * Determine if a question is mastered via SRS or legacy correctStreak.
 */
export function isMastered(
  frageMeta: FrageMeta | undefined,
  srsMeta: SRSMeta | undefined
): boolean {
  if (!frageMeta) return false;
  if (srsMeta && srsMeta.repetitions >= 3 && srsMeta.interval >= 21) return true;
  return frageMeta.correctStreak >= 3;
}

/**
 * Determine if a question is currently in learning (attempted but not mastered).
 */
export function isLearning(
  frageMeta: FrageMeta | undefined,
  srsMeta: SRSMeta | undefined
): boolean {
  if (!frageMeta || frageMeta.attempts === 0) return false;
  return !isMastered(frageMeta, srsMeta);
}
