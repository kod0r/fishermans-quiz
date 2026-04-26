import type { GameMode, MetaProgression } from '@/types/quiz';
import type { QuizMeta } from '@/utils/quizLoader';

/**
 * Determines whether a specific bereich (topic) can be selected for a quiz run
 * in the given game mode.
 *
 * Rules:
 * - Arcade: always selectable.
 * - Exam: always selectable (exam uses all bereiche).
 * - Hardcore: locked if the bereich was attempted and failed (lastAttempt set,
 *   but not passed). Mastered and never-attempted bereiche remain selectable.
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
    const bMeta = meta.bereiche[bereichId];
    // Locked: attempted but failed (not passed, not mastered)
    if (bMeta?.lastAttempt && !bMeta.passed) {
      return false;
    }
    return true;
  }

  return true;
}
