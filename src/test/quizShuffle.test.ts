import { describe, it, expect } from 'vitest';
import { shuffleAnswers } from '@/utils/quizShuffle';
import type { Frage } from '@/types/quiz';

const mockFrage: Frage = {
  id: '1',
  topic: 'Biologie',
  frage: 'F1',
  antworten: { A: 'Alpha', B: 'Beta', C: 'Gamma' },
  richtige_antwort: 'B',
};

describe('shuffleAnswers', () => {
  it('returns a new Frage object without mutating input', () => {
    const original = { ...mockFrage, antworten: { ...mockFrage.antworten } };
    const { shuffled } = shuffleAnswers(original);
    expect(shuffled).not.toBe(original);
    expect(original.antworten).toEqual({ A: 'Alpha', B: 'Beta', C: 'Gamma' });
    expect(original.richtige_antwort).toBe('B');
  });

  it('maps richtige_antwort to the key that now holds the originally correct text', () => {
    const { shuffled, order } = shuffleAnswers(mockFrage);
    const originalCorrectText = mockFrage.antworten[mockFrage.richtige_antwort];
    const newCorrectKey = shuffled.richtige_antwort;
    expect(shuffled.antworten[newCorrectKey]).toBe(originalCorrectText);
    expect(order.length).toBe(3);
    expect(new Set(order)).toEqual(new Set(['A', 'B', 'C']));
  });

  it('includes all three answer keys in output', () => {
    const { shuffled } = shuffleAnswers(mockFrage);
    expect(shuffled.antworten).toHaveProperty('A');
    expect(shuffled.antworten).toHaveProperty('B');
    expect(shuffled.antworten).toHaveProperty('C');
    const values = Object.values(shuffled.antworten);
    expect(values).toContain('Alpha');
    expect(values).toContain('Beta');
    expect(values).toContain('Gamma');
  });

  it('produces different permutations on consecutive calls', () => {
    const results: string[] = [];
    for (let i = 0; i < 20; i++) {
      const { order } = shuffleAnswers(mockFrage);
      results.push(order.join(''));
    }
    const unique = new Set(results);
    expect(unique.size).toBeGreaterThan(1);
  });
});
