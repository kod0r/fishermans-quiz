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

const mockBereichResponse = { bereich: 'Biologie', fragen: mockQuizData.fragen };

function createFetchMock() {
  return vi.fn((url: string) => {
    if (url.includes('quiz_meta.json')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockMeta) } as Response);
    }
    if (url.includes('biologie.json')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockBereichResponse) } as Response);
    }
    return Promise.resolve({ ok: false, status: 404 } as Response);
  });
}

describe('useQuiz', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('sollte initial den Start-View anzeigen', async () => {
    vi.stubGlobal('fetch', createFetchMock());

    const { result } = renderHook(() => useQuiz());

    expect(result.current.view).toBe('start');
    expect(result.current.isActive).toBe(false);
    expect(result.current.istGeladen).toBe(false);

    await waitFor(() => {
      expect(result.current.istGeladen).toBe(true);
    });
  });

  it('sollte Quiz-Meta laden', async () => {
    vi.stubGlobal('fetch', createFetchMock());

    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.istGeladen).toBe(true);
    });

    expect(result.current.quizMeta).not.toBeNull();
    expect(result.current.quizMeta?.meta.titel).toBe('Test');
  });

  it('sollte ein Quiz starten', async () => {
    vi.stubGlobal('fetch', createFetchMock());

    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.istGeladen).toBe(true);
    });

    await act(async () => {
      await result.current.starteQuiz(['Biologie']);
    });

    await waitFor(() => {
      expect(result.current.isActive).toBe(true);
    });

    expect(result.current.view).toBe('quiz');
    expect(result.current.aktiveFragen.length).toBe(3);
    expect(result.current.metaProgress.stats.totalRuns).toBe(1);
  });

  it('sollte eine Frage beantworten und in Meta speichern', async () => {
    vi.stubGlobal('fetch', createFetchMock());

    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.istGeladen).toBe(true);
    });

    await act(async () => {
      await result.current.starteQuiz(['Biologie']);
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
    vi.stubGlobal('fetch', createFetchMock());

    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.istGeladen).toBe(true);
    });

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
    vi.stubGlobal('fetch', createFetchMock());

    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.istGeladen).toBe(true);
    });

    expect(result.current.gameMode).toBe('arcade');

    act(() => {
      result.current.setGameMode('hardcore');
    });

    expect(result.current.gameMode).toBe('hardcore');
  });

  it('sollte bereichEntfernbar korrekt berechnen', async () => {
    vi.stubGlobal('fetch', createFetchMock());

    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.istGeladen).toBe(true);
    });

    // Ohne aktiven Run: Bereich kann entfernt werden
    expect(result.current.kannBereichEntfernen('Biologie')).toBe(true);

    await act(async () => {
      await result.current.starteQuiz(['Biologie']);
    });

    await waitFor(() => {
      expect(result.current.isActive).toBe(true);
    });

    // Arcade: Bereich kann entfernt werden (chirurgisch)
    expect(result.current.kannBereichEntfernen('Biologie')).toBe(true);

    // Hardcore: Bereich kann NICHT entfernt werden (all-or-nothing)
    act(() => {
      result.current.setGameMode('hardcore');
    });

    // Starte neuen Run im Hardcore-Modus
    await act(async () => {
      await result.current.starteQuiz(['Biologie']);
    });

    await waitFor(() => {
      expect(result.current.isActive).toBe(true);
    });

    expect(result.current.kannBereichEntfernen('Biologie')).toBe(false);
  });

  it('sollte Hardcore-Bereich als passed markieren wenn alle Fragen richtig beantwortet wurden', async () => {
    vi.stubGlobal('fetch', createFetchMock());

    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.istGeladen).toBe(true);
    });

    act(() => {
      result.current.setGameMode('hardcore');
    });

    await act(async () => {
      await result.current.starteQuiz(['Biologie']);
    });

    await waitFor(() => {
      expect(result.current.isActive).toBe(true);
    });

    // Alle Fragen richtig beantworten
    for (const frage of result.current.aktiveFragen) {
      act(() => {
        result.current.beantworteFrage(frage.id, frage.richtige_antwort);
      });
    }

    expect(result.current.metaProgress.bereiche['Biologie']?.passed).toBe(true);
    expect(result.current.metaProgress.bereiche['Biologie']?.consecutivePasses).toBe(1);
  });

  it('sollte Hardcore-Bereich als failed markieren wenn eine Frage falsch war', async () => {
    vi.stubGlobal('fetch', createFetchMock());

    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.istGeladen).toBe(true);
    });

    act(() => {
      result.current.setGameMode('hardcore');
    });

    await act(async () => {
      await result.current.starteQuiz(['Biologie']);
    });

    await waitFor(() => {
      expect(result.current.isActive).toBe(true);
    });

    const fragen = result.current.aktiveFragen;

    // Erste Frage richtig, zweite falsch, dritte richtig
    act(() => {
      result.current.beantworteFrage(fragen[0].id, fragen[0].richtige_antwort);
    });
    act(() => {
      result.current.beantworteFrage(fragen[1].id, 'X'); // Falsch
    });
    act(() => {
      result.current.beantworteFrage(fragen[2].id, fragen[2].richtige_antwort);
    });

    expect(result.current.metaProgress.bereiche['Biologie']?.passed).toBe(false);
    expect(result.current.metaProgress.bereiche['Biologie']?.consecutivePasses).toBe(0);
  });

  it('sollte Hardcore-Bereich als failed markieren wenn der Run unterbrochen wird', async () => {
    vi.stubGlobal('fetch', createFetchMock());

    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.istGeladen).toBe(true);
    });

    act(() => {
      result.current.setGameMode('hardcore');
    });

    await act(async () => {
      await result.current.starteQuiz(['Biologie']);
    });

    await waitFor(() => {
      expect(result.current.isActive).toBe(true);
    });

    // Eine Frage beantworten, dann unterbrechen
    act(() => {
      result.current.beantworteFrage(result.current.aktiveFragen[0].id, result.current.aktiveFragen[0].richtige_antwort);
    });

    act(() => {
      result.current.unterbrecheRun();
    });

    await waitFor(() => {
      expect(result.current.isActive).toBe(false);
    });

    expect(result.current.metaProgress.bereiche['Biologie']?.passed).toBe(false);
    expect(result.current.metaProgress.bereiche['Biologie']?.consecutivePasses).toBe(0);
  });
});
