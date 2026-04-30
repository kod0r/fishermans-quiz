import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTutorialRun } from '@/hooks/useTutorialRun';
import type { QuizData } from '@/types/quiz';

const mockQuizData: QuizData = {
  meta: {
    titel: 'Test',
    anzahl_fragen: 3,
    topics: { Biologie: 3 },
  },
  fragen: [
    { id: '1', topic: 'Biologie', frage: 'F1', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'A' },
    { id: '2', topic: 'Biologie', frage: 'F2', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'B' },
    { id: '3', topic: 'Biologie', frage: 'F3', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'C' },
  ],
};

vi.mock('@/utils/quizLoader', () => ({
  loadAllQuizData: vi.fn(() => Promise.resolve(mockQuizData)),
}));

describe('useTutorialRun', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initial state is inactive with empty data', () => {
    const { result } = renderHook(() => useTutorialRun('arcade', []));

    expect(result.current.isActive).toBe(false);
    expect(result.current.aktiveFragen).toEqual([]);
    expect(result.current.aktuellerIndex).toBe(0);
    expect(result.current.aktuelleFrage).toBeNull();
    expect(result.current.hasAnswered).toBe(false);
  });

  it('loads questions and activates run', async () => {
    const { result } = renderHook(() => useTutorialRun('arcade', ['1', '2']));

    await waitFor(() => {
      expect(result.current.isActive).toBe(true);
    });

    expect(result.current.aktiveFragen).toHaveLength(2);
    expect(result.current.aktuelleFrage?.id).toBe('1');
    expect(result.current.statistiken.gesamt).toBe(2);
  });

  it('answers a question and updates state', async () => {
    const { result } = renderHook(() => useTutorialRun('arcade', ['1']));

    await waitFor(() => {
      expect(result.current.isActive).toBe(true);
    });

    act(() => {
      result.current.beantworteFrage('1', 'A');
    });

    expect(result.current.antworten['1']).toBe('A');
    expect(result.current.hasAnswered).toBe(true);
    expect(result.current.statistiken.beantwortet).toBe(1);
    expect(result.current.statistiken.korrekt).toBe(1);
  });

  it('ignores duplicate answers', async () => {
    const { result } = renderHook(() => useTutorialRun('arcade', ['1']));

    await waitFor(() => {
      expect(result.current.isActive).toBe(true);
    });

    act(() => {
      result.current.beantworteFrage('1', 'A');
    });
    act(() => {
      result.current.beantworteFrage('1', 'B');
    });

    expect(result.current.antworten['1']).toBe('A');
  });

  it('navigates next and previous', async () => {
    const { result } = renderHook(() => useTutorialRun('arcade', ['1', '2']));

    await waitFor(() => {
      expect(result.current.isActive).toBe(true);
    });

    expect(result.current.aktuellerIndex).toBe(0);

    act(() => {
      result.current.naechsteFrage();
    });

    expect(result.current.aktuellerIndex).toBe(1);
    expect(result.current.aktuelleFrage?.id).toBe('2');

    act(() => {
      result.current.vorherigeFrage();
    });

    expect(result.current.aktuellerIndex).toBe(0);
  });

  it('next does not exceed last question', async () => {
    const { result } = renderHook(() => useTutorialRun('arcade', ['1']));

    await waitFor(() => {
      expect(result.current.isActive).toBe(true);
    });

    act(() => {
      result.current.naechsteFrage();
    });

    expect(result.current.aktuellerIndex).toBe(0);
  });

  it('prev does not go below first question', async () => {
    const { result } = renderHook(() => useTutorialRun('arcade', ['1']));

    await waitFor(() => {
      expect(result.current.isActive).toBe(true);
    });

    act(() => {
      result.current.vorherigeFrage();
    });

    expect(result.current.aktuellerIndex).toBe(0);
  });

  it('ends run and sets completedAt', async () => {
    const { result } = renderHook(() => useTutorialRun('arcade', ['1']));

    await waitFor(() => {
      expect(result.current.isActive).toBe(true);
    });

    act(() => {
      result.current.beendeRun();
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.rawRun?.completedAt).toBeDefined();
  });

  it('calculates stats correctly with wrong answers', async () => {
    const { result } = renderHook(() => useTutorialRun('arcade', ['1', '2']));

    await waitFor(() => {
      expect(result.current.isActive).toBe(true);
    });

    act(() => {
      result.current.beantworteFrage('1', 'A');
    });
    act(() => {
      result.current.beantworteFrage('2', 'X');
    });

    expect(result.current.statistiken.korrekt).toBe(1);
    expect(result.current.statistiken.falsch).toBe(1);
  });

  it('sets durationSeconds in exam mode', async () => {
    const { result } = renderHook(() => useTutorialRun('exam', ['1']));

    await waitFor(() => {
      expect(result.current.isActive).toBe(true);
    });

    expect(result.current.rawRun?.durationSeconds).toBe(10 * 60);
  });

  it('handles empty questionIds gracefully', async () => {
    const { result } = renderHook(() => useTutorialRun('arcade', []));

    await waitFor(() => {
      expect(result.current.isActive).toBe(false);
    });

    expect(result.current.aktiveFragen).toHaveLength(0);
  });

  it('handles unknown questionIds gracefully', async () => {
    const { result } = renderHook(() => useTutorialRun('arcade', ['999']));

    await waitFor(() => {
      expect(result.current.isActive).toBe(false);
    });

    expect(result.current.aktiveFragen).toHaveLength(0);
  });
});
