import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useQuiz } from '@/hooks/useQuiz';
import type { QuizData } from '@/types/quiz';

const mockQuizData: QuizData = {
  meta: {
    titel: 'Test',
    anzahl_fragen: 3,
    bereiche: { Biologie: 3 },
  },
  fragen: [
    { id: '1', bereich: 'Biologie', frage: 'F1', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'A' },
    { id: '2', bereich: 'Biologie', frage: 'F2', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'B' },
    { id: '3', bereich: 'Biologie', frage: 'F3', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'C' },
  ],
};

const mockMeta = {
  meta: { titel: 'Test', anzahl_fragen: 3, bereiche: { Biologie: 3 } },
  bereiche: ['Biologie'],
  fragenIndex: { '1': 'Biologie', '2': 'Biologie', '3': 'Biologie' },
};

describe('useQuiz', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('sollte initial den Start-View anzeigen', () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockMeta) } as Response)
    ));

    const { result } = renderHook(() => useQuiz());

    expect(result.current.view).toBe('start');
    expect(result.current.isActive).toBe(false);
    expect(result.current.istGeladen).toBe(false);
  });

  it('sollte Quiz-Meta laden', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('quiz_meta.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockMeta) } as Response);
      }
      return Promise.resolve({ ok: false, status: 404 } as Response);
    }));

    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.istGeladen).toBe(true);
    });

    expect(result.current.quizMeta).not.toBeNull();
    expect(result.current.quizMeta?.meta.titel).toBe('Test');
  });

  it('sollte ein Quiz starten', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('quiz_meta.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockMeta) } as Response);
      }
      if (url.includes('biologie.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ bereich: 'Biologie', fragen: mockQuizData.fragen }) } as Response);
      }
      return Promise.resolve({ ok: false, status: 404 } as Response);
    }));

    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.istGeladen).toBe(true);
    });

    act(() => {
      result.current.starteQuiz(['Biologie']);
    });

    await waitFor(() => {
      expect(result.current.isActive).toBe(true);
    });

    expect(result.current.view).toBe('quiz');
    expect(result.current.aktiveFragen.length).toBe(3);
    expect(result.current.metaProgress.stats.totalRuns).toBe(1);
  });

  it('sollte eine Frage beantworten und in Meta speichern', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('quiz_meta.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockMeta) } as Response);
      }
      if (url.includes('biologie.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ bereich: 'Biologie', fragen: mockQuizData.fragen }) } as Response);
      }
      return Promise.resolve({ ok: false, status: 404 } as Response);
    }));

    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.istGeladen).toBe(true);
    });

    act(() => {
      result.current.starteQuiz(['Biologie']);
    });

    await waitFor(() => {
      expect(result.current.isActive).toBe(true);
    });

    const frageId = result.current.aktiveFragen[0].id;
    const richtigeAntwort = result.current.aktiveFragen[0].richtige_antwort;

    act(() => {
      result.current.beantworteFrage(frageId, richtigeAntwort);
    });

    expect(result.current.antworten[frageId]).toBe(richtigeAntwort);
  });

  it('sollte zwischen Views wechseln', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockMeta) } as Response)
    ));

    const { result } = renderHook(() => useQuiz());

    act(() => {
      result.current.goToView('progress');
    });

    expect(result.current.view).toBe('progress');

    act(() => {
      result.current.goToView('start');
    });

    expect(result.current.view).toBe('start');
  });

  it('sollte GameMode wechseln', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(mockMeta) } as Response)
    ));

    const { result } = renderHook(() => useQuiz());

    expect(result.current.gameMode).toBe('arcade');

    act(() => {
      result.current.setGameMode('hardcore');
    });

    expect(result.current.gameMode).toBe('hardcore');
  });

  it('sollte bereichEntfernbar korrekt berechnen', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('quiz_meta.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockMeta) } as Response);
      }
      if (url.includes('biologie.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ bereich: 'Biologie', fragen: mockQuizData.fragen }) } as Response);
      }
      return Promise.resolve({ ok: false, status: 404 } as Response);
    }));

    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.istGeladen).toBe(true);
    });

    // Ohne aktiven Run: Bereich kann entfernt werden
    expect(result.current.kannBereichEntfernen('Biologie')).toBe(true);

    act(() => {
      result.current.starteQuiz(['Biologie']);
    });

    await waitFor(() => {
      expect(result.current.isActive).toBe(true);
    });

    // Mit aktivem Run: Bereich kann NICHT entfernt werden
    expect(result.current.kannBereichEntfernen('Biologie')).toBe(false);
  });
});
