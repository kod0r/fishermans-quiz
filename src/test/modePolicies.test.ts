import { describe, it, expect } from 'vitest';
import { ArcadePolicy, HardcorePolicy, ExamPolicy } from '@/modes';
import type { Frage, MetaProgression } from '@/types/quiz';

const fragen: Frage[] = [
  { id: '1', topic: 'Biologie', frage: 'F1', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'A' },
  { id: '2', topic: 'Biologie', frage: 'F2', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'B' },
  { id: '3', topic: 'Chemie', frage: 'F3', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'C' },
];

const meta: MetaProgression = {
  fragen: {},
  stats: {
    totalRuns: 0,
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    bestStreak: 0,
    currentStreak: 0,
  },
  topics: {},
};

describe('ArcadePolicy', () => {
  it('returns no immediate topic results for a single wrong answer', () => {
    const effect = ArcadePolicy.onAnswer({
      frage: fragen[0],
      isCorrect: false,
      neueAntworten: { '1': 'B' },
      alleBeantwortet: false,
      aktiveFragen: fragen,
      loadedTopics: ['Biologie', 'Chemie'],
    });
    expect(effect.topicResults).toBeUndefined();
    expect(effect.arcadeCompletions).toBeUndefined();
  });

  it('returns per-topic arcade completions when all answered', () => {
    const neueAntworten = { '1': 'A', '2': 'B', '3': 'X' };
    const effect = ArcadePolicy.onAnswer({
      frage: fragen[2],
      isCorrect: false,
      neueAntworten,
      alleBeantwortet: true,
      aktiveFragen: fragen,
      loadedTopics: ['Biologie', 'Chemie'],
    });
    expect(effect.arcadeCompletions).toHaveLength(2);
    expect(effect.arcadeCompletions).toContainEqual({ topicId: 'Biologie', scorePct: 100 });
    expect(effect.arcadeCompletions).toContainEqual({ topicId: 'Chemie', scorePct: 0 });
  });

  it('allows removing topics', () => {
    expect(ArcadePolicy.canRemoveTopic('Biologie')).toBe(true);
  });

  it('allows starting any topic', () => {
    expect(ArcadePolicy.canStartTopic('Biologie', meta, false, [])).toBe(true);
  });

  it('returns user limit unchanged', () => {
    expect(ArcadePolicy.getStartLimit(20)).toBe(20);
    expect(ArcadePolicy.getStartLimit()).toBeUndefined();
  });

  it('has no duration limit', () => {
    expect(ArcadePolicy.getDurationSeconds()).toBeUndefined();
  });

  it('does not hide feedback and allows pending retry', () => {
    expect(ArcadePolicy.hideFeedback).toBe(false);
    expect(ArcadePolicy.allowsPendingRetry).toBe(true);
  });

  it('onAbort logs history only when beantwortet > 0', () => {
    expect(ArcadePolicy.onAbort({ loadedTopics: ['Biologie'], beantwortet: 0 }).shouldLogHistory).toBe(false);
    expect(ArcadePolicy.onAbort({ loadedTopics: ['Biologie'], beantwortet: 2 }).shouldLogHistory).toBe(true);
  });
});

describe('HardcorePolicy', () => {
  it('returns immediate fail on wrong answer', () => {
    const effect = HardcorePolicy.onAnswer({
      frage: fragen[0],
      isCorrect: false,
      neueAntworten: { '1': 'X' },
      alleBeantwortet: false,
      aktiveFragen: fragen,
      loadedTopics: ['Biologie', 'Chemie'],
    });
    expect(effect.topicResults).toEqual([{ topicId: 'Biologie', passed: false }]);
  });

  it('returns passed=true at run end only when all topic questions correct', () => {
    const neueAntworten = { '1': 'A', '2': 'B', '3': 'C' };
    const effect = HardcorePolicy.onAnswer({
      frage: fragen[2],
      isCorrect: true,
      neueAntworten,
      alleBeantwortet: true,
      aktiveFragen: fragen,
      loadedTopics: ['Biologie', 'Chemie'],
    });
    expect(effect.topicResults).toContainEqual({ topicId: 'Biologie', passed: true });
    expect(effect.topicResults).toContainEqual({ topicId: 'Chemie', passed: true });
  });

  it('returns passed=false at run end when any topic question wrong', () => {
    const neueAntworten = { '1': 'A', '2': 'X', '3': 'C' };
    const effect = HardcorePolicy.onAnswer({
      frage: fragen[2],
      isCorrect: true,
      neueAntworten,
      alleBeantwortet: true,
      aktiveFragen: fragen,
      loadedTopics: ['Biologie', 'Chemie'],
    });
    expect(effect.topicResults).toContainEqual({ topicId: 'Biologie', passed: false });
    expect(effect.topicResults).toContainEqual({ topicId: 'Chemie', passed: true });
  });

  it('onAbort fails all loaded topics and logs history when answered', () => {
    const effect = HardcorePolicy.onAbort({ loadedTopics: ['Biologie', 'Chemie'], beantwortet: 1 });
    expect(effect.topicResults).toEqual([
      { topicId: 'Biologie', passed: false },
      { topicId: 'Chemie', passed: false },
    ]);
    expect(effect.shouldLogHistory).toBe(true);
  });

  it('onAbort does not log history when nothing answered', () => {
    const effect = HardcorePolicy.onAbort({ loadedTopics: ['Biologie'], beantwortet: 0 });
    expect(effect.shouldLogHistory).toBe(false);
  });

  it('does not allow removing topics', () => {
    expect(HardcorePolicy.canRemoveTopic('Biologie')).toBe(false);
  });

  it('respects topic locks when starting topics', () => {
    const lockedMeta: MetaProgression = {
      ...meta,
      topics: {
        Biologie: { passed: false, consecutivePasses: 0, mastered: false, lastAttempt: new Date().toISOString() },
      },
    };
    expect(HardcorePolicy.canStartTopic('Biologie', lockedMeta, false, [])).toBe(false);
    expect(HardcorePolicy.canStartTopic('Chemie', lockedMeta, false, [])).toBe(true);
  });

  it('mode switch fails all topics and ends run', () => {
    const effect = HardcorePolicy.onModeSwitch({
      rawRun: null,
      aktiveFragen: fragen,
      loadedTopics: ['Biologie'],
      beantwortet: 1,
      korrekt: 1,
    });
    expect(effect.topicResults).toEqual([{ topicId: 'Biologie', passed: false }]);
    expect(effect.shouldLogHistory).toBe(true);
    expect(effect.shouldEndRun).toBe(true);
    expect(effect.shouldSaveEndedRun).toBeUndefined();
  });
});

describe('ExamPolicy', () => {
  it('getStartLimit returns 60 when user limit undefined', () => {
    expect(ExamPolicy.getStartLimit()).toBe(60);
    expect(ExamPolicy.getStartLimit(30)).toBe(30);
  });

  it('getDurationSeconds returns 3600', () => {
    expect(ExamPolicy.getDurationSeconds()).toBe(3600);
  });

  it('onComplete returns passed=true when score >= 60', () => {
    const effect = ExamPolicy.onComplete({
      aktiveFragen: fragen,
      korrekt: 2,
    });
    expect(effect.examResult?.scorePct).toBe(67);
    expect(effect.examResult?.passed).toBe(true);
  });

  it('onComplete returns passed=false when score < 60', () => {
    const effect = ExamPolicy.onComplete({
      aktiveFragen: fragen,
      korrekt: 1,
    });
    expect(effect.examResult?.scorePct).toBe(33);
    expect(effect.examResult?.passed).toBe(false);
  });

  it('onComplete handles empty question list', () => {
    const effect = ExamPolicy.onComplete({ aktiveFragen: [], korrekt: 0 });
    expect(effect.examResult?.scorePct).toBe(0);
    expect(effect.examResult?.passed).toBe(false);
  });

  it('hides feedback and disallows pending retry', () => {
    expect(ExamPolicy.hideFeedback).toBe(true);
    expect(ExamPolicy.allowsPendingRetry).toBe(false);
  });

  it('mode switch returns exam result and navigates to progress', () => {
    const effect = ExamPolicy.onModeSwitch({
      rawRun: null,
      aktiveFragen: fragen,
      loadedTopics: ['Biologie', 'Chemie'],
      beantwortet: 3,
      korrekt: 2,
    });
    expect(effect.examResult).toEqual({ scorePct: 67, passed: true });
    expect(effect.shouldLogHistory).toBe(true);
    expect(effect.shouldEndRun).toBe(true);
    expect(effect.shouldSaveEndedRun).toBe(true);
    expect(effect.navigateTo).toBe('progress');
  });

  it('allows starting any topic', () => {
    expect(ExamPolicy.canStartTopic('Biologie', meta, false, [])).toBe(true);
  });

  it('does not allow removing topics', () => {
    expect(ExamPolicy.canRemoveTopic('Biologie')).toBe(false);
  });
});
