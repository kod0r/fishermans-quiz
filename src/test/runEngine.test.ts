import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { QuizData, QuizRun } from '@/types/quiz';
import * as RunEngine from '@/engine/runEngine';
import { selectActiveQuestions, selectStatistics } from '@/engine/runSelectors';

const mockQuizData: QuizData = {
  meta: {
    titel: 'Test',
    anzahl_fragen: 6,
    topics: { Biologie: 3, Recht: 3 },
  },
  fragen: [
    { id: '1', topic: 'Biologie', frage: 'F1', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'A' },
    { id: '2', topic: 'Biologie', frage: 'F2', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'B' },
    { id: '3', topic: 'Biologie', frage: 'F3', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'C' },
    { id: '4', topic: 'Recht', frage: 'F4', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'A' },
    { id: '5', topic: 'Recht', frage: 'F5', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'B' },
    { id: '6', topic: 'Recht', frage: 'F6', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'C' },
  ],
};

describe('RunEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createRun', () => {
    it('creates an active run with shuffled question IDs for given topics', () => {
      const run = RunEngine.createRun(mockQuizData, ['Biologie'], 'arcade');
      expect(run.isActive).toBe(true);
      expect(run.frageIds).toHaveLength(3);
      expect(run.topics).toEqual(['Biologie']);
      expect(run.aktuellerIndex).toBe(0);
      expect(run.antworten).toEqual({});
      expect(run.startedAt).toBe('2026-01-01T00:00:00.000Z');
      expect(run.gameMode).toBe('arcade');
    });

    it('respects limit option', () => {
      const run = RunEngine.createRun(mockQuizData, ['Biologie', 'Recht'], 'arcade', { limit: 2 });
      expect(run.frageIds).toHaveLength(2);
    });

    it('sets durationSeconds and sessionType', () => {
      const run = RunEngine.createRun(mockQuizData, ['Biologie'], 'hardcore', { durationSeconds: 3600, sessionType: 'flashcard' });
      expect(run.durationSeconds).toBe(3600);
      expect(run.sessionType).toBe('flashcard');
      expect(run.gameMode).toBe('hardcore');
    });

    it('defaults sessionType to quiz', () => {
      const run = RunEngine.createRun(mockQuizData, ['Biologie'], 'arcade');
      expect(run.sessionType).toBe('quiz');
    });

    it('generates answerShuffle when enableShuffle is true', () => {
      const run = RunEngine.createRun(mockQuizData, ['Biologie'], 'arcade', { enableShuffle: true });
      expect(run.answerShuffle).toBeDefined();
      for (const id of run.frageIds) {
        expect(run.answerShuffle![id]).toHaveLength(3);
      }
    });

    it('does not generate answerShuffle when enableShuffle is false', () => {
      const run = RunEngine.createRun(mockQuizData, ['Biologie'], 'arcade', { enableShuffle: false });
      expect(run.answerShuffle).toBeUndefined();
    });

    it('handles empty question array gracefully', () => {
      const run = RunEngine.createRun(mockQuizData, ['Unbekannt'], 'arcade');
      expect(run.frageIds).toEqual([]);
      expect(run.isActive).toBe(true);
      expect(run.aktuellerIndex).toBe(0);
      expect(run.antworten).toEqual({});
      expect(run.gameMode).toBe('arcade');
    });
  });

  describe('extendRun', () => {
    it('appends new topic questions and preserves existing answers', () => {
      const run: QuizRun = {
        frageIds: ['1', '2', '3'],
        antworten: { '1': 'A' },
        topics: ['Biologie'],
        aktuellerIndex: 1,
        isActive: true,
        startedAt: '2025-01-01T00:00:00.000Z',
      };
      const extended = RunEngine.extendRun(run, mockQuizData, ['Recht']);
      expect(extended).not.toBeNull();
      expect(extended!.topics).toContain('Biologie');
      expect(extended!.topics).toContain('Recht');
      expect(extended!.frageIds).toHaveLength(6);
      expect(extended!.antworten).toEqual({ '1': 'A' });
      expect(extended!.startedAt).toBe('2026-01-01T00:00:00.000Z');
      expect(extended!.completedAt).toBeUndefined();
    });

    it('returns null when there are no new questions', () => {
      const run: QuizRun = {
        frageIds: ['1', '2', '3'],
        antworten: {},
        topics: ['Biologie'],
        aktuellerIndex: 0,
        isActive: true,
      };
      expect(RunEngine.extendRun(run, mockQuizData, ['Biologie'])).toBeNull();
    });

    it('returns null for timed runs', () => {
      const run: QuizRun = {
        frageIds: ['1', '2', '3'],
        antworten: {},
        topics: ['Biologie'],
        aktuellerIndex: 0,
        isActive: true,
        durationSeconds: 3600,
      };
      expect(RunEngine.extendRun(run, mockQuizData, ['Recht'])).toBeNull();
    });

    it('generates answerShuffle for new questions when enabled', () => {
      const run: QuizRun = {
        frageIds: ['1', '2', '3'],
        antworten: {},
        topics: ['Biologie'],
        aktuellerIndex: 0,
        isActive: true,
        answerShuffle: { '1': ['B', 'A', 'C'], '2': ['A', 'C', 'B'], '3': ['C', 'A', 'B'] },
      };
      const extended = RunEngine.extendRun(run, mockQuizData, ['Recht'], true);
      expect(extended).not.toBeNull();
      expect(extended!.answerShuffle!['1']).toEqual(['B', 'A', 'C']);
      for (const id of extended!.frageIds) {
        expect(extended!.answerShuffle![id]).toHaveLength(3);
      }
    });
  });

  describe('answerQuestion', () => {
    it('stores an answer immutably', () => {
      const run: QuizRun = {
        frageIds: ['1', '2'],
        antworten: {},
        topics: ['Biologie'],
        aktuellerIndex: 0,
        isActive: true,
      };
      const next = RunEngine.answerQuestion(run, '1', 'A');
      expect(next.antworten['1']).toBe('A');
      expect(run.antworten['1']).toBeUndefined();
    });

    it('ignores second answer for same question', () => {
      const run: QuizRun = {
        frageIds: ['1', '2'],
        antworten: { '1': 'A' },
        topics: ['Biologie'],
        aktuellerIndex: 0,
        isActive: true,
      };
      const next = RunEngine.answerQuestion(run, '1', 'B');
      expect(next.antworten['1']).toBe('A');
      expect(next).toEqual(run);
    });
  });

  describe('selfAssess', () => {
    it('stores self-assessment grade', () => {
      const run: QuizRun = {
        frageIds: ['1'],
        antworten: {},
        topics: ['Biologie'],
        aktuellerIndex: 0,
        isActive: true,
      };
      const next = RunEngine.selfAssess(run, '1', 'good');
      expect(next.selfAssessments).toEqual({ '1': 'good' });
    });
  });

  describe('navigation', () => {
    const baseRun: QuizRun = {
      frageIds: ['1', '2', '3'],
      antworten: {},
      topics: ['Biologie'],
      aktuellerIndex: 1,
      isActive: true,
    };

    it('nextQuestion increments index', () => {
      const next = RunEngine.nextQuestion(baseRun);
      expect(next.aktuellerIndex).toBe(2);
    });

    it('nextQuestion clamps at end', () => {
      const run = { ...baseRun, aktuellerIndex: 2 };
      expect(RunEngine.nextQuestion(run)).toEqual(run);
    });

    it('prevQuestion decrements index', () => {
      const next = RunEngine.prevQuestion(baseRun);
      expect(next.aktuellerIndex).toBe(0);
    });

    it('prevQuestion clamps at start', () => {
      const run = { ...baseRun, aktuellerIndex: 0 };
      expect(RunEngine.prevQuestion(run)).toEqual(run);
    });

    it('jumpToQuestion sets index', () => {
      const next = RunEngine.jumpToQuestion(baseRun, 2);
      expect(next.aktuellerIndex).toBe(2);
    });

    it('jumpToQuestion clamps out of bounds', () => {
      expect(RunEngine.jumpToQuestion(baseRun, -1)).toEqual(baseRun);
      expect(RunEngine.jumpToQuestion(baseRun, 3)).toEqual(baseRun);
    });
  });

  describe('removeTopicFromRun', () => {
    it('removes topic questions and updates index', () => {
      const run: QuizRun = {
        frageIds: ['1', '4', '2', '5', '3', '6'],
        antworten: { '1': 'A', '4': 'B' },
        topics: ['Biologie', 'Recht'],
        aktuellerIndex: 3,
        isActive: true,
      };
      const next = RunEngine.removeTopicFromRun(run, mockQuizData, 'Biologie');
      expect(next).not.toBeNull();
      expect(next!.frageIds).toEqual(['4', '5', '6']);
      expect(next!.topics).toEqual(['Recht']);
      expect(next!.antworten).toEqual({ '4': 'B' });
      expect(next!.aktuellerIndex).toBeGreaterThanOrEqual(0);
      expect(next!.aktuellerIndex).toBeLessThan(next!.frageIds.length);
    });

    it('returns null when run becomes empty', () => {
      const run: QuizRun = {
        frageIds: ['1', '2', '3'],
        antworten: {},
        topics: ['Biologie'],
        aktuellerIndex: 0,
        isActive: true,
      };
      expect(RunEngine.removeTopicFromRun(run, mockQuizData, 'Biologie')).toBeNull();
    });

    it('returns same run when topic is unknown', () => {
      const run: QuizRun = {
        frageIds: ['1', '2', '3'],
        antworten: {},
        topics: ['Biologie'],
        aktuellerIndex: 0,
        isActive: true,
      };
      expect(RunEngine.removeTopicFromRun(run, mockQuizData, 'Unbekannt')).toBe(run);
    });

    it('clears answerShuffle entries for removed questions', () => {
      const run: QuizRun = {
        frageIds: ['1', '2', '4'],
        antworten: {},
        topics: ['Biologie', 'Recht'],
        aktuellerIndex: 0,
        isActive: true,
        answerShuffle: { '1': ['A', 'B', 'C'], '2': ['B', 'A', 'C'], '4': ['C', 'A', 'B'] },
      };
      const next = RunEngine.removeTopicFromRun(run, mockQuizData, 'Biologie');
      expect(next).not.toBeNull();
      expect(next!.answerShuffle).toEqual({ '4': ['C', 'A', 'B'] });
    });

    it('removes answerShuffle entirely when all entries removed', () => {
      const run: QuizRun = {
        frageIds: ['1', '2', '3'],
        antworten: {},
        topics: ['Biologie'],
        aktuellerIndex: 0,
        isActive: true,
        answerShuffle: { '1': ['A', 'B', 'C'] },
      };
      const next = RunEngine.removeTopicFromRun(run, mockQuizData, 'Biologie');
      expect(next).toBeNull();
    });
  });

  describe('restartRun', () => {
    it('reshuffles question IDs and clears answers', () => {
      const run: QuizRun = {
        frageIds: ['1', '2', '3'],
        antworten: { '1': 'A' },
        topics: ['Biologie'],
        aktuellerIndex: 2,
        isActive: true,
        selfAssessments: { '1': 'good' },
        completedAt: '2025-01-01T00:00:00.000Z',
        startedAt: '2025-01-01T00:00:00.000Z',
      };
      const next = RunEngine.restartRun(run, mockQuizData);
      expect(next.frageIds).toHaveLength(3);
      expect(next.antworten).toEqual({});
      expect(next.selfAssessments).toEqual({});
      expect(next.aktuellerIndex).toBe(0);
      expect(next.completedAt).toBeUndefined();
      expect(next.startedAt).toBe('2026-01-01T00:00:00.000Z');
    });

    it('regenerates answerShuffle when present', () => {
      const run: QuizRun = {
        frageIds: ['1', '2'],
        antworten: {},
        topics: ['Biologie'],
        aktuellerIndex: 0,
        isActive: true,
        answerShuffle: { '1': ['A', 'B', 'C'], '2': ['B', 'A', 'C'] },
      };
      const next = RunEngine.restartRun(run, mockQuizData);
      expect(next.answerShuffle).toBeDefined();
      expect(Object.keys(next.answerShuffle!)).toHaveLength(2);
    });
  });

  describe('detectInconsistency', () => {
    it('returns missing IDs', () => {
      const run: QuizRun = {
        frageIds: ['1', '99'],
        antworten: {},
        topics: ['Biologie'],
        aktuellerIndex: 0,
        isActive: true,
      };
      expect(RunEngine.detectInconsistency(run, mockQuizData)).toEqual(['99']);
    });

    it('returns empty array when consistent', () => {
      const run: QuizRun = {
        frageIds: ['1', '2', '3'],
        antworten: {},
        topics: ['Biologie'],
        aktuellerIndex: 0,
        isActive: true,
      };
      expect(RunEngine.detectInconsistency(run, mockQuizData)).toEqual([]);
    });
  });

  describe('purgeMissingQuestions', () => {
    it('returns same run when no missing questions', () => {
      const run: QuizRun = {
        frageIds: ['1', '2'],
        antworten: { '1': 'A' },
        topics: ['Biologie'],
        aktuellerIndex: 1,
        isActive: true,
      };
      expect(RunEngine.purgeMissingQuestions(run, mockQuizData)).toEqual(run);
    });

    it('removes missing questions and adjusts index', () => {
      const run: QuizRun = {
        frageIds: ['1', '99', '2'],
        antworten: { '1': 'A', '99': 'B' },
        topics: ['Biologie'],
        aktuellerIndex: 2,
        isActive: true,
      };
      const next = RunEngine.purgeMissingQuestions(run, mockQuizData);
      expect(next).not.toBeNull();
      expect(next!.frageIds).toEqual(['1', '2']);
      expect(next!.antworten).toEqual({ '1': 'A' });
      expect(next!.aktuellerIndex).toBe(1);
    });

    it('returns null when all questions are missing', () => {
      const run: QuizRun = {
        frageIds: ['99', '100'],
        antworten: {},
        topics: ['Biologie'],
        aktuellerIndex: 0,
        isActive: true,
      };
      expect(RunEngine.purgeMissingQuestions(run, mockQuizData)).toBeNull();
    });
  });

  describe('interruptRun / completeRun', () => {
    it('interruptRun sets isActive false', () => {
      const run: QuizRun = {
        frageIds: ['1'],
        antworten: {},
        topics: ['Biologie'],
        aktuellerIndex: 0,
        isActive: true,
      };
      expect(RunEngine.interruptRun(run).isActive).toBe(false);
    });

    it('completeRun sets completedAt', () => {
      const run: QuizRun = {
        frageIds: ['1'],
        antworten: {},
        topics: ['Biologie'],
        aktuellerIndex: 0,
        isActive: true,
      };
      const next = RunEngine.completeRun(run);
      expect(next.completedAt).toBe('2026-01-01T00:00:00.000Z');
    });
  });

  describe('isRunExpired', () => {
    it('returns false when run has no durationSeconds', () => {
      const run: QuizRun = {
        frageIds: ['1'],
        antworten: {},
        topics: ['Biologie'],
        aktuellerIndex: 0,
        isActive: true,
        startedAt: new Date().toISOString(),
      };
      expect(RunEngine.isRunExpired(run)).toBe(false);
    });

    it('returns false when elapsed time is within limit', () => {
      const run: QuizRun = {
        frageIds: ['1'],
        antworten: {},
        topics: ['Biologie'],
        aktuellerIndex: 0,
        isActive: true,
        startedAt: '2026-01-01T00:00:00.000Z',
        durationSeconds: 3600,
      };
      vi.setSystemTime(new Date('2026-01-01T00:30:00.000Z'));
      expect(RunEngine.isRunExpired(run)).toBe(false);
    });

    it('returns true when elapsed time meets or exceeds durationSeconds', () => {
      const run: QuizRun = {
        frageIds: ['1'],
        antworten: {},
        topics: ['Biologie'],
        aktuellerIndex: 0,
        isActive: true,
        startedAt: '2026-01-01T00:00:00.000Z',
        durationSeconds: 3600,
      };
      vi.setSystemTime(new Date('2026-01-01T01:00:00.000Z'));
      expect(RunEngine.isRunExpired(run)).toBe(true);

      vi.setSystemTime(new Date('2026-01-01T01:01:00.000Z'));
      expect(RunEngine.isRunExpired(run)).toBe(true);
    });
  });
});

describe('runSelectors', () => {
  describe('selectActiveQuestions', () => {
    it('maps frageIds to Frage objects', () => {
      const run: QuizRun = {
        frageIds: ['1', '4'],
        antworten: {},
        topics: ['Biologie', 'Recht'],
        aktuellerIndex: 0,
        isActive: true,
      };
      const active = selectActiveQuestions(run, mockQuizData);
      expect(active).toHaveLength(2);
      expect(active[0].id).toBe('1');
      expect(active[1].id).toBe('4');
    });

    it('applies answerShuffle to answers and correct key', () => {
      const run: QuizRun = {
        frageIds: ['1'],
        antworten: {},
        topics: ['Biologie'],
        aktuellerIndex: 0,
        isActive: true,
        answerShuffle: { '1': ['B', 'C', 'A'] }, // original A->keys[2], B->keys[0], C->keys[1]
      };
      const active = selectActiveQuestions(run, mockQuizData);
      expect(active).toHaveLength(1);
      expect(active[0].antworten).toEqual({ A: 'b', B: 'c', C: 'a' });
      expect(active[0].richtige_antwort).toBe('C'); // original A is now at index 2 -> key C
    });
  });

  describe('selectStatistics', () => {
    it('calculates stats correctly', () => {
      const run: QuizRun = {
        frageIds: ['1', '2', '3'],
        antworten: { '1': 'A', '2': 'X' },
        topics: ['Biologie'],
        aktuellerIndex: 0,
        isActive: true,
      };
      const active = selectActiveQuestions(run, mockQuizData);
      const stats = selectStatistics(run, active);
      expect(stats.beantwortet).toBe(2);
      expect(stats.korrekt).toBe(1); // 1 is correct
      expect(stats.falsch).toBe(1); // 2 is wrong
      expect(stats.gesamt).toBe(3);
    });

    it('returns zeros for empty run', () => {
      const run: QuizRun = {
        frageIds: [],
        antworten: {},
        topics: [],
        aktuellerIndex: 0,
        isActive: true,
      };
      const stats = selectStatistics(run, []);
      expect(stats).toEqual({ beantwortet: 0, korrekt: 0, falsch: 0, gesamt: 0 });
    });
  });
});
