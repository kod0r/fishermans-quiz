import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadQuizMeta, loadTopicQuestions, buildQuizData, clearQuizCache } from '@/utils/quizLoader';

describe('quizLoader', () => {
  beforeEach(() => {
    clearQuizCache();
    vi.clearAllMocks();
  });

  it('sollte Meta-Daten laden', async () => {
    const mockMeta = {
      meta: { titel: 'Test', anzahl_fragen: 10, topics: { Biologie: 10 } },
      topics: ['Biologie'],
      topicFiles: { 'Biologie': 'biologie.json' },
      fragenIndex: { '1': 'Biologie' },
    };

    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockMeta),
      } as Response)
    ));

    const meta = await loadQuizMeta();

    expect(meta.meta.anzahl_fragen).toBe(10);
    expect(meta.topics).toContain('Biologie');
  });

  it('sollte Bereichs-Fragen laden', async () => {
    const mockMeta = {
      meta: { titel: 'Test', anzahl_fragen: 1, topics: { Biologie: 1 } },
      topics: ['Biologie'],
      topicFiles: { 'Biologie': 'biologie.json' },
      fragenIndex: { '1': 'Biologie' },
    };
    const mockFragen = {
      topic: 'Biologie',
      fragen: [
        { id: '1', topic: 'Biologie', frage: 'F1', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'A' },
      ],
    };

    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('quiz_meta.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockMeta) } as Response);
      }
      if (url.includes('biologie.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockFragen),
        } as Response);
      }
      return Promise.resolve({ ok: false, status: 404 } as Response);
    }));

    const fragen = await loadTopicQuestions(['Biologie']);

    expect(fragen.length).toBe(1);
    expect(fragen[0].id).toBe('1');
  });

  it('sollte geladene Topics cachen', async () => {
    const mockMeta = {
      meta: { titel: 'Test', anzahl_fragen: 1, topics: { Biologie: 1 } },
      topics: ['Biologie'],
      topicFiles: { 'Biologie': 'biologie.json' },
      fragenIndex: { '1': 'Biologie' },
    };
    const mockFragen = {
      topic: 'Biologie',
      fragen: [
        { id: '1', topic: 'Biologie', frage: 'F1', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'A' },
      ],
    };

    const fetchMock = vi.fn((url: string) => {
      if (url.includes('quiz_meta.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockMeta) } as Response);
      }
      if (url.includes('biologie.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockFragen),
        } as Response);
      }
      return Promise.resolve({ ok: false, status: 404 } as Response);
    });

    vi.stubGlobal('fetch', fetchMock);

    // Erster Aufruf
    await loadTopicQuestions(['Biologie']);
    // Zweiter Aufruf (sollte aus Cache kommen)
    await loadTopicQuestions(['Biologie']);

    // Fetch sollte 2x aufgerufen (1x meta, 1x biologie.json)
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('sollte build QuizData from topics', async () => {
    const mockMeta = {
      meta: { titel: 'Test', anzahl_fragen: 1, topics: { Biologie: 1 } },
      topics: ['Biologie'],
      topicFiles: { 'Biologie': 'biologie.json' },
      fragenIndex: { '1': 'Biologie' },
    };

    const mockFragen = {
      topic: 'Biologie',
      fragen: [
        { id: '1', topic: 'Biologie', frage: 'F1', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'A' },
      ],
    };

    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('quiz_meta.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockMeta) } as Response);
      }
      if (url.includes('biologie.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockFragen) } as Response);
      }
      return Promise.resolve({ ok: false, status: 404 } as Response);
    }));

    const quizData = await buildQuizData(['Biologie']);

    expect(quizData.fragen.length).toBe(1);
    expect(quizData.meta.anzahl_fragen).toBe(1);
  });

  it('sollte Fehler bei unbekanntem Topic werfen', async () => {
    const mockMeta = {
      meta: { titel: 'Test', anzahl_fragen: 0, topics: {} },
      topics: [],
      topicFiles: {},
      fragenIndex: {},
    };

    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('quiz_meta.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockMeta) } as Response);
      }
      return Promise.resolve({ ok: false, status: 404 } as Response);
    }));

    await expect(loadTopicQuestions(['Unbekannt'])).rejects.toThrow('Unbekanntes Thema');
  });
});
