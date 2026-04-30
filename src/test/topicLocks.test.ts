import { describe, it, expect } from 'vitest';
import { canSelectTopic, isTopicLocked } from '@/utils/topicLocks';
import type { MetaProgression } from '@/types/quiz';
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
    topics: {},
    ...overrides,
  };
}

describe('isTopicLocked', () => {
  it('should return false for arcade mode', () => {
    const meta = createMeta({
      topics: {
        Biologie: { passed: false, consecutivePasses: 0, mastered: false, lastAttempt: '2026-01-01' },
      },
    });
    expect(isTopicLocked('Biologie', 'arcade', meta)).toBe(false);
  });

  it('should return false for exam mode', () => {
    const meta = createMeta({
      topics: {
        Biologie: { passed: false, consecutivePasses: 0, mastered: false, lastAttempt: '2026-01-01' },
      },
    });
    expect(isTopicLocked('Biologie', 'exam', meta)).toBe(false);
  });

  it('should return false for unattempted topic in hardcore', () => {
    const meta = createMeta();
    expect(isTopicLocked('Biologie', 'hardcore', meta)).toBe(false);
  });

  it('should return false for passed topic in hardcore', () => {
    const meta = createMeta({
      topics: {
        Biologie: { passed: true, consecutivePasses: 1, mastered: false, lastAttempt: '2026-01-01' },
      },
    });
    expect(isTopicLocked('Biologie', 'hardcore', meta)).toBe(false);
  });

  it('should return false for mastered topic in hardcore', () => {
    const meta = createMeta({
      topics: {
        Biologie: { passed: true, consecutivePasses: 3, mastered: true, lastAttempt: '2026-01-01' },
      },
    });
    expect(isTopicLocked('Biologie', 'hardcore', meta)).toBe(false);
  });

  it('should return true for failed topic in hardcore', () => {
    const meta = createMeta({
      topics: {
        Biologie: { passed: false, consecutivePasses: 0, mastered: false, lastAttempt: '2026-01-01' },
      },
    });
    expect(isTopicLocked('Biologie', 'hardcore', meta)).toBe(true);
  });
});

describe('canSelectTopic', () => {
  it('should always return true for arcade mode', () => {
    const meta = createMeta();
    expect(canSelectTopic('Biologie', 'arcade', meta, false, [])).toBe(true);
  });

  it('should always return true for exam mode', () => {
    const meta = createMeta();
    expect(canSelectTopic('Biologie', 'exam', meta, false, [])).toBe(true);
  });

  it('should return true for hardcore mode when topic was never attempted', () => {
    const meta = createMeta();
    expect(canSelectTopic('Biologie', 'hardcore', meta, false, [])).toBe(true);
  });

  it('should return true for hardcore mode when topic is passed', () => {
    const meta = createMeta({
      topics: {
        Biologie: { passed: true, consecutivePasses: 1, mastered: false, lastAttempt: '2026-01-01' },
      },
    });
    expect(canSelectTopic('Biologie', 'hardcore', meta, false, [])).toBe(true);
  });

  it('should return true for hardcore mode when topic is mastered', () => {
    const meta = createMeta({
      topics: {
        Biologie: { passed: true, consecutivePasses: 3, mastered: true, lastAttempt: '2026-01-01' },
      },
    });
    expect(canSelectTopic('Biologie', 'hardcore', meta, false, [])).toBe(true);
  });

  it('should return false for hardcore mode when topic was attempted and failed', () => {
    const meta = createMeta({
      topics: {
        Biologie: { passed: false, consecutivePasses: 0, mastered: false, lastAttempt: '2026-01-01' },
      },
    });
    expect(canSelectTopic('Biologie', 'hardcore', meta, false, [])).toBe(false);
  });

  it('should always return true for active topics even if failed', () => {
    const meta = createMeta({
      topics: {
        Biologie: { passed: false, consecutivePasses: 0, mastered: false, lastAttempt: '2026-01-01' },
      },
    });
    expect(canSelectTopic('Biologie', 'hardcore', meta, true, ['Biologie'])).toBe(true);
  });

  it('should return true for other topics when one is failed', () => {
    const meta = createMeta({
      topics: {
        Biologie: { passed: false, consecutivePasses: 0, mastered: false, lastAttempt: '2026-01-01' },
      },
    });
    expect(canSelectTopic('Recht', 'hardcore', meta, false, [])).toBe(true);
  });
});
