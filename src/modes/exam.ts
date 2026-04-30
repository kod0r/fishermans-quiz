import type { ModePolicy, AnswerEffect, AbortEffect, CompleteEffect, ModeSwitchEffect } from './types';
import { canSelectTopic } from '@/utils/topicLocks';
import type { MetaProgression } from '@/types/quiz';

const EXAM_LIMIT = 60;
const EXAM_DURATION_SECONDS = 60 * 60;
const PASS_THRESHOLD = 60;

export const ExamPolicy: ModePolicy = {
  hideFeedback: true,
  allowsPendingRetry: false,

  getStartLimit(userLimit?: number) {
    return userLimit ?? EXAM_LIMIT;
  },

  getDurationSeconds() {
    return EXAM_DURATION_SECONDS;
  },

  canStartTopic(
    topicId: string,
    meta: MetaProgression,
    isActive: boolean,
    loadedTopics: string[]
  ) {
    return canSelectTopic(topicId, 'exam', meta, undefined, isActive, loadedTopics);
  },

  canRemoveTopic() {
    return false;
  },

  onAnswer(): AnswerEffect {
    return {};
  },

  onAbort({ beantwortet }): AbortEffect {
    return { shouldLogHistory: beantwortet > 0 };
  },

  onComplete({ aktiveFragen, korrekt }): CompleteEffect {
    const total = aktiveFragen.length;
    const scorePct = total > 0 ? Math.round((korrekt / total) * 100) : 0;
    const passed = scorePct >= PASS_THRESHOLD;
    return { examResult: { scorePct, passed } };
  },

  onModeSwitch({ aktiveFragen, korrekt }): ModeSwitchEffect {
    const total = aktiveFragen.length;
    const scorePct = total > 0 ? Math.round((korrekt / total) * 100) : 0;
    const passed = scorePct >= PASS_THRESHOLD;

    return {
      examResult: { scorePct, passed },
      shouldLogHistory: true,
      shouldEndRun: true,
      shouldSaveEndedRun: true,
      navigateTo: 'progress',
    };
  },
};
