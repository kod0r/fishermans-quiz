import { describe, it, expect } from 'vitest';
import { canSelectBereich, isBereichLocked } from '@/utils/bereichLocks';
import type { MetaProgression } from '@/types/quiz';
import type { QuizMeta } from '@/utils/quizLoader';

const mockQuizMeta: QuizMeta = {
  meta: { titel: 'Test', anzahl_fragen: 6, bereiche: { Biologie: 3, Recht: 3 } },
  bereiche: ['Biologie', 'Recht'],
  bereichFiles: { Biologie: 'bio.json', Recht: 'recht.json' },
  fragenIndex: { '1': 'Biologie', '2': 'Biologie', '3': 'Biologie', '4': 'Recht', '5': 'Recht', '6': 'Recht' },
};

function createMeta(overrides: Partial<MetaProgression> = {}): MetaProgression {
  return {
    fragen: {},
    stats: {
      totalRuns: 0,
      totalQuestionsAnswered: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      bestStreak: 0,
      currentStreak: 0,
    },
    bereiche: {},
    ...overrides,
  };
}

describe('isBereichLocked', () => {
  it('should return false for arcade mode', () => {
    const meta = createMeta({
      bereiche: {
        Biologie: { passed: false, consecutivePasses: 0, mastered: false, lastAttempt: '2026-01-01' },
      },
    });
    expect(isBereichLocked('Biologie', 'arcade', meta)).toBe(false);
  });

  it('should return false for exam mode', () => {
    const meta = createMeta({
      bereiche: {
        Biologie: { passed: false, consecutivePasses: 0, mastered: false, lastAttempt: '2026-01-01' },
      },
    });
    expect(isBereichLocked('Biologie', 'exam', meta)).toBe(false);
  });

  it('should return false for unattempted bereich in hardcore', () => {
    const meta = createMeta();
    expect(isBereichLocked('Biologie', 'hardcore', meta)).toBe(false);
  });

  it('should return false for passed bereich in hardcore', () => {
    const meta = createMeta({
      bereiche: {
        Biologie: { passed: true, consecutivePasses: 1, mastered: false, lastAttempt: '2026-01-01' },
      },
    });
    expect(isBereichLocked('Biologie', 'hardcore', meta)).toBe(false);
  });

  it('should return false for mastered bereich in hardcore', () => {
    const meta = createMeta({
      bereiche: {
        Biologie: { passed: true, consecutivePasses: 3, mastered: true, lastAttempt: '2026-01-01' },
      },
    });
    expect(isBereichLocked('Biologie', 'hardcore', meta)).toBe(false);
  });

  it('should return true for failed bereich in hardcore', () => {
    const meta = createMeta({
      bereiche: {
        Biologie: { passed: false, consecutivePasses: 0, mastered: false, lastAttempt: '2026-01-01' },
      },
    });
    expect(isBereichLocked('Biologie', 'hardcore', meta)).toBe(true);
  });
});

describe('canSelectBereich', () => {
  it('should always return true for arcade mode', () => {
    const meta = createMeta();
    expect(canSelectBereich('Biologie', 'arcade', meta, mockQuizMeta, false, [])).toBe(true);
  });

  it('should always return true for exam mode', () => {
    const meta = createMeta();
    expect(canSelectBereich('Biologie', 'exam', meta, mockQuizMeta, false, [])).toBe(true);
  });

  it('should return true for hardcore mode when bereich was never attempted', () => {
    const meta = createMeta();
    expect(canSelectBereich('Biologie', 'hardcore', meta, mockQuizMeta, false, [])).toBe(true);
  });

  it('should return true for hardcore mode when bereich is passed', () => {
    const meta = createMeta({
      bereiche: {
        Biologie: { passed: true, consecutivePasses: 1, mastered: false, lastAttempt: '2026-01-01' },
      },
    });
    expect(canSelectBereich('Biologie', 'hardcore', meta, mockQuizMeta, false, [])).toBe(true);
  });

  it('should return true for hardcore mode when bereich is mastered', () => {
    const meta = createMeta({
      bereiche: {
        Biologie: { passed: true, consecutivePasses: 3, mastered: true, lastAttempt: '2026-01-01' },
      },
    });
    expect(canSelectBereich('Biologie', 'hardcore', meta, mockQuizMeta, false, [])).toBe(true);
  });

  it('should return false for hardcore mode when bereich was attempted and failed', () => {
    const meta = createMeta({
      bereiche: {
        Biologie: { passed: false, consecutivePasses: 0, mastered: false, lastAttempt: '2026-01-01' },
      },
    });
    expect(canSelectBereich('Biologie', 'hardcore', meta, mockQuizMeta, false, [])).toBe(false);
  });

  it('should always return true for active bereiche even if failed', () => {
    const meta = createMeta({
      bereiche: {
        Biologie: { passed: false, consecutivePasses: 0, mastered: false, lastAttempt: '2026-01-01' },
      },
    });
    expect(canSelectBereich('Biologie', 'hardcore', meta, mockQuizMeta, true, ['Biologie'])).toBe(true);
  });

  it('should return true for other bereiche when one is failed', () => {
    const meta = createMeta({
      bereiche: {
        Biologie: { passed: false, consecutivePasses: 0, mastered: false, lastAttempt: '2026-01-01' },
      },
    });
    expect(canSelectBereich('Recht', 'hardcore', meta, mockQuizMeta, false, [])).toBe(true);
  });
});
