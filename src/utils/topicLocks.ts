import type { GameMode, MetaProgression } from '@/types/quiz';
import type { QuizMeta } from '@/utils/quizLoader';

/**
 * Determines whether a specific topic (topic) is locked in the given mode.
 *
 * Hardcore lock rule: a topic is locked if it was attempted and failed
 * (passed === false && mastered === false && lastAttempt !== null).
 */
export function isTopicLocked(
  topicId: string,
  mode: GameMode,
  meta: MetaProgression
): boolean {
  if (mode !== 'hardcore') {
    return false;
  }

  const tMeta = meta.topics[topicId];
  if (!tMeta) {
    return false;
  }

  return tMeta.lastAttempt !== null && tMeta.passed === false && tMeta.mastered === false;
}

/**
 * Determines whether a specific topic (topic) can be selected for a quiz run
 * in the given game mode.
 *
 * Rules:
 * - Arcade: always selectable.
 * - Exam: always selectable (exam uses all topics).
 * - Hardcore: locked if the topic is locked per isTopicLocked.
 *   Mastered and never-attempted topics remain selectable.
 * - Already-active topics are always selectable so the user can deselect them.
 */
export function canSelectTopic(
  topicId: string,
  mode: GameMode,
  meta: MetaProgression,
  _quizMeta: QuizMeta,
  isActive: boolean,
  loadedTopics: string[]
): boolean {
  // Topics that are already part of the active run must remain selectable
  // so the user can deselect / remove them.
  if (isActive && loadedTopics.includes(topicId)) {
    return true;
  }

  if (mode === 'arcade' || mode === 'exam') {
    return true;
  }

  if (mode === 'hardcore') {
    return !isTopicLocked(topicId, mode, meta);
  }

  return true;
}
