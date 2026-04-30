import type { ModePolicy, AnswerEffect, AbortEffect, CompleteEffect, ModeSwitchEffect } from './types';
import { canSelectTopic } from '@/utils/topicLocks';
import type { MetaProgression } from '@/types/quiz';

export const ArcadePolicy: ModePolicy = {
  hideFeedback: false,
  allowsPendingRetry: true,

  getStartLimit(userLimit?: number) {
    return userLimit;
  },

  getDurationSeconds() {
    return undefined;
  },

  canStartTopic(
    topicId: string,
    meta: MetaProgression,
    isActive: boolean,
    loadedTopics: string[]
  ) {
    return canSelectTopic(topicId, 'arcade', meta, isActive, loadedTopics);
  },

  canRemoveTopic() {
    return true;
  },

  onAnswer({
    neueAntworten,
    alleBeantwortet,
    aktiveFragen,
    loadedTopics,
  }): AnswerEffect {
    if (!alleBeantwortet) {
      return {};
    }

    const arcadeCompletions = loadedTopics.map((topicId) => {
      const topicQuestions = aktiveFragen.filter((f) => f.topic === topicId);
      const korrekt = topicQuestions.filter((f) => neueAntworten[f.id] === f.richtige_antwort).length;
      const pct = topicQuestions.length > 0 ? Math.round((korrekt / topicQuestions.length) * 100) : 0;
      return { topicId, scorePct: pct };
    });

    return { arcadeCompletions };
  },

  onAbort({ beantwortet }): AbortEffect {
    return { shouldLogHistory: beantwortet > 0 };
  },

  onComplete(): CompleteEffect {
    return {};
  },

  onModeSwitch(): ModeSwitchEffect {
    return { shouldLogHistory: false, shouldEndRun: false };
  },
};
