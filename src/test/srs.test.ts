import { describe, it, expect } from 'vitest';
import { sm2, calculateNextReview, DEFAULT_SRS_STATE, SELF_ASSESSMENT_QUALITY } from '@/utils/srs';

describe('sm2', () => {
  it('should initialize first successful review with interval 1', () => {
    const result = sm2(4, DEFAULT_SRS_STATE);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(1);
    expect(result.efactor).toBeGreaterThanOrEqual(2.5);
  });

  it('should set interval to 6 on second successful review', () => {
    const state = { interval: 1, repetitions: 1, efactor: 2.5 };
    const result = sm2(4, state);
    expect(result.interval).toBe(6);
    expect(result.repetitions).toBe(2);
  });

  it('should multiply interval by efactor on third+ successful review', () => {
    const state = { interval: 6, repetitions: 2, efactor: 2.5 };
    const result = sm2(4, state);
    expect(result.interval).toBe(15); // round(6 * 2.5)
    expect(result.repetitions).toBe(3);
  });

  it('should reset on failed review (quality < 3)', () => {
    const state = { interval: 15, repetitions: 3, efactor: 2.5 };
    const result = sm2(0, state);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(0);
  });

  it('should not let efactor drop below 1.3', () => {
    const state = { interval: 6, repetitions: 2, efactor: 1.3 };
    const result = sm2(0, state);
    expect(result.efactor).toBe(1.3);
  });

  it('should handle easy answers with higher efactor', () => {
    const state = { interval: 6, repetitions: 2, efactor: 2.5 };
    const easy = sm2(5, state);
    const good = sm2(4, state);
    expect(easy.efactor).toBeGreaterThan(good.efactor);
  });

  it('should handle hard answers with lower efactor', () => {
    const state = { interval: 6, repetitions: 2, efactor: 2.5 };
    const hard = sm2(3, state);
    const good = sm2(4, state);
    expect(hard.efactor).toBeLessThan(good.efactor);
  });

  it('should clamp quality above 5 to 5', () => {
    const result = sm2(10, DEFAULT_SRS_STATE);
    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
  });

  it('should clamp quality below 0 to 0', () => {
    const result = sm2(-1, DEFAULT_SRS_STATE);
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
  });
});

describe('calculateNextReview', () => {
  it('should add interval days to base date', () => {
    const base = new Date('2026-04-24T12:00:00Z');
    const next = calculateNextReview(3, base);
    expect(next).toBe('2026-04-27T00:00:00.000Z');
  });

  it('should default to current date when base is omitted', () => {
    const before = new Date();
    before.setHours(0, 0, 0, 0);
    const next = new Date(calculateNextReview(1));
    const after = new Date();
    after.setHours(0, 0, 0, 0);
    after.setDate(after.getDate() + 1);
    expect(next.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(next.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});

describe('SELF_ASSESSMENT_QUALITY', () => {
  it('should map flashcard grades correctly', () => {
    expect(SELF_ASSESSMENT_QUALITY.again).toBe(0);
    expect(SELF_ASSESSMENT_QUALITY.hard).toBe(3);
    expect(SELF_ASSESSMENT_QUALITY.good).toBe(4);
    expect(SELF_ASSESSMENT_QUALITY.easy).toBe(5);
  });
});
