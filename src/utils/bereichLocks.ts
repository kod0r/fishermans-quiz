import type { GameMode, MetaProgression } from '@/types/quiz';
import type { QuizMeta } from '@/utils/quizLoader';

/**
 * Determines whether a specific bereich (topic) is locked in the given mode.
 *
 * Hardcore lock rule: a bereich is locked if it was attempted and failed
 * (passed === false && mastered === false && lastAttempt !== null).
 */
export function isBereichLocked(
  bereichId: string,
  mode: GameMode,
  meta: MetaProgression
): boolean {
  if (mode !== 'hardcore') {
    return false;
  }

  const bMeta = meta.bereiche[bereichId];
  if (!bMeta) {
    return false;
  }

  return bMeta.lastAttempt !== null && bMeta.passed === false && bMeta.mastered === false;
}

/**
 * Determines whether a specific bereich (topic) can be selected for a quiz run
 * in the given game mode.
 *
 * Rules:
 * - Arcade: always selectable.
 * - Exam: always selectable (exam uses all bereiche).
 * - Hardcore: locked if the bereich is locked per isBereichLocked.
 *   Mastered and never-attempted bereiche remain selectable.
 * - Already-active bereiche are always selectable so the user can deselect them.
 */
export function canSelectBereich(
  bereichId: string,
  mode: GameMode,
  meta: MetaProgression,
  _quizMeta: QuizMeta,
  isActive: boolean,
  geladeneBereiche: string[]
): boolean {
  // Bereiche that are already part of the active run must remain selectable
  // so the user can deselect / remove them.
  if (isActive && geladeneBereiche.includes(bereichId)) {
    return true;
  }

  if (mode === 'arcade' || mode === 'exam') {
    return true;
  }

  if (mode === 'hardcore') {
    return !isBereichLocked(bereichId, mode, meta);
  }

  return true;
}
