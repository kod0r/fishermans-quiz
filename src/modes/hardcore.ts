import type { ModePolicy, AnswerEffect, AbortEffect, CompleteEffect, ModeSwitchEffect } from './types';
import { canSelectTopic } from '@/utils/topicLocks';
import type { MetaProgression } from '@/types/quiz';

export const HardcorePolicy: ModePolicy = {
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
    return canSelectTopic(topicId, 'hardcore', meta, isActive, loadedTopics);
  },

  canRemoveTopic() {
    return false;
  },

  onAnswer({
    frage,
    isCorrect,
    neueAntworten,
    alleBeantwortet,
    aktiveFragen,
    loadedTopics,
  }): AnswerEffect {
    const topicResults: AnswerEffect['topicResults'] = [];

    if (!isCorrect && loadedTopics.includes(frage.topic)) {
      topicResults.push({ topicId: frage.topic, passed: false });
    }

    if (alleBeantwortet) {
      for (const topicId of loadedTopics) {
        const topicQuestions = aktiveFragen.filter((f) => f.topic === topicId);
        const alleRichtig = topicQuestions.every((f) => neueAntworten[f.id] === f.richtige_antwort);
        topicResults.push({ topicId, passed: alleRichtig });
      }
    }

    return topicResults.length > 0 ? { topicResults } : {};
  },

  onAbort({ loadedTopics, beantwortet }): AbortEffect {
    return {
      topicResults: loadedTopics.map((topicId) => ({ topicId, passed: false })),
      shouldLogHistory: beantwortet > 0,
    };
  },

  onComplete(): CompleteEffect {
    return {};
  },

  onModeSwitch({ loadedTopics, beantwortet }): ModeSwitchEffect {
    return {
      topicResults: loadedTopics.map((topicId) => ({ topicId, passed: false })),
      shouldLogHistory: beantwortet > 0,
      shouldEndRun: true,
    };
  },
};
