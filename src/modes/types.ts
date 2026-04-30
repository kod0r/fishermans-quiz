import type { Frage, QuizRun, MetaProgression, AppView } from '@/types/quiz';

export interface TopicResult {
  topicId: string;
  passed: boolean;
}

export interface ArcadeCompletion {
  topicId: string;
  scorePct: number;
}

export interface ExamResult {
  scorePct: number;
  passed: boolean;
}

export interface AnswerEffect {
  topicResults?: TopicResult[];
  arcadeCompletions?: ArcadeCompletion[];
}

export interface AbortEffect {
  topicResults?: TopicResult[];
  shouldLogHistory: boolean;
}

export interface CompleteEffect {
  examResult?: ExamResult;
}

export interface ModeSwitchEffect {
  topicResults?: TopicResult[];
  examResult?: ExamResult;
  shouldLogHistory: boolean;
  shouldEndRun: boolean;
  shouldSaveEndedRun?: boolean;
  navigateTo?: AppView;
}

export interface ModePolicy {
  readonly hideFeedback: boolean;
  readonly allowsPendingRetry: boolean;

  getStartLimit(userLimit?: number): number | undefined;
  getDurationSeconds(): number | undefined;

  canStartTopic(
    topicId: string,
    meta: MetaProgression,
    isActive: boolean,
    loadedTopics: string[]
  ): boolean;

  canRemoveTopic(topicId: string): boolean;

  onAnswer(params: {
    frage: Frage;
    isCorrect: boolean;
    neueAntworten: Record<string, string>;
    alleBeantwortet: boolean;
    aktiveFragen: Frage[];
    loadedTopics: string[];
  }): AnswerEffect;

  onAbort(params: {
    loadedTopics: string[];
    beantwortet: number;
  }): AbortEffect;

  onComplete(params: {
    aktiveFragen: Frage[];
    korrekt: number;
  }): CompleteEffect;

  onModeSwitch(params: {
    rawRun: QuizRun | null;
    aktiveFragen: Frage[];
    loadedTopics: string[];
    beantwortet: number;
    korrekt: number;
  }): ModeSwitchEffect;
}
