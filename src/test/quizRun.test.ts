import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuizRun } from '@/store/quizRun';
import type { QuizData } from '@/types/quiz';

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

describe('useQuizRun', () => {
  it('sollte initial inaktiv sein', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    expect(result.current.isActive).toBe(false);
    expect(result.current.aktiveFragen).toEqual([]);
    expect(result.current.aktuellerIndex).toBe(0);
  });

  it('sollte einen neuen Run starten', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie']);
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.aktiveFragen.length).toBe(3);
    expect(result.current.loadedTopics).toContain('Biologie');
    expect(result.current.statistiken.gesamt).toBe(3);
  });

  it('sollte Fragen mischen (Shuffle)', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie', 'Recht']);
    });

    // Alle 6 Fragen sollten enthalten sein, aber in anderer Reihenfolge
    expect(result.current.aktiveFragen.length).toBe(6);
    const ids = result.current.aktiveFragen.map(f => f.id);
    expect(ids).toContain('1');
    expect(ids).toContain('2');
    expect(ids).toContain('3');
    expect(ids).toContain('4');
    expect(ids).toContain('5');
    expect(ids).toContain('6');
  });

  it('sollte eine Antwort speichern', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie']);
    });

    const frageId = result.current.aktiveFragen[0].id;

    act(() => {
      result.current.beantworteFrage(frageId, 'A');
    });

    expect(result.current.antworten[frageId]).toBe('A');
    expect(result.current.statistiken.beantwortet).toBe(1);
  });

  it('sollte keine Antwort überschreiben', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie']);
    });

    const frageId = result.current.aktiveFragen[0].id;

    act(() => {
      result.current.beantworteFrage(frageId, 'A');
      result.current.beantworteFrage(frageId, 'B'); // sollte ignoriert werden
    });

    expect(result.current.antworten[frageId]).toBe('A');
  });

  it('sollte zur nächsten Frage navigieren', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie', 'Recht']);
    });

    expect(result.current.aktuellerIndex).toBe(0);

    act(() => {
      result.current.naechsteFrage();
    });

    expect(result.current.aktuellerIndex).toBe(1);
  });

  it('sollte nicht über die letzte Frage hinaus navigieren', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie']);
    });

    act(() => {
      result.current.naechsteFrage();
      result.current.naechsteFrage();
      result.current.naechsteFrage(); // Letzte Frage
    });

    expect(result.current.aktuellerIndex).toBe(2);

    act(() => {
      result.current.naechsteFrage(); // Sollte nicht weitergehen
    });

    expect(result.current.aktuellerIndex).toBe(2);
  });

  it('sollte zur vorherigen Frage navigieren', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie', 'Recht']);
    });

    act(() => {
      result.current.naechsteFrage();
      result.current.naechsteFrage();
    });

    expect(result.current.aktuellerIndex).toBe(2);

    act(() => {
      result.current.vorherigeFrage();
    });

    expect(result.current.aktuellerIndex).toBe(1);
  });

  it('sollte nicht vor die erste Frage navigieren', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie']);
    });

    act(() => {
      result.current.vorherigeFrage();
    });

    expect(result.current.aktuellerIndex).toBe(0);
  });

  it('sollte zu einer bestimmten Frage springen', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie', 'Recht']);
    });

    act(() => {
      result.current.springeZuFrage(4);
    });

    expect(result.current.aktuellerIndex).toBe(4);
  });

  it('sollte einen Run unterbrechen', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie']);
    });

    expect(result.current.isActive).toBe(true);

    act(() => {
      result.current.unterbrecheRun();
    });

    expect(result.current.isActive).toBe(false);
  });

  it('sollte Statistiken korrekt berechnen', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie']);
    });

    const frage1 = result.current.aktiveFragen[0];
    const frage2 = result.current.aktiveFragen[1];

    act(() => {
      result.current.beantworteFrage(frage1.id, frage1.richtige_antwort);
      result.current.beantworteFrage(frage2.id, 'X'); // Falsch
    });

    expect(result.current.statistiken.korrekt).toBe(1);
    expect(result.current.statistiken.falsch).toBe(1);
    expect(result.current.statistiken.beantwortet).toBe(2);
  });

  it('sollte Topics erweitern', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie']);
    });

    expect(result.current.aktiveFragen.length).toBe(3);

    act(() => {
      result.current.starteRun(['Recht']);
    });

    expect(result.current.aktiveFragen.length).toBe(6);
    expect(result.current.loadedTopics).toContain('Biologie');
    expect(result.current.loadedTopics).toContain('Recht');
  });

  it('sollte startedAt beim Erweitern zurücksetzen', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie']);
    });

    const oldStartedAt = result.current.rawRun?.startedAt;
    expect(oldStartedAt).toBeDefined();

    vi.advanceTimersByTime(1000);

    act(() => {
      result.current.starteRun(['Recht']);
    });

    const newStartedAt = result.current.rawRun?.startedAt;
    expect(newStartedAt).toBeDefined();
    expect(newStartedAt).not.toBe(oldStartedAt);

    vi.useRealTimers();
  });

  it('sollte Runs pro Modus getrennt speichern', () => {
    const { result: arcade } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));
    const { result: hardcore } = renderHook(() => useQuizRun(mockQuizData, 'hardcore'));

    act(() => {
      arcade.current.starteRun(['Biologie']);
    });

    expect(arcade.current.isActive).toBe(true);
    expect(hardcore.current.isActive).toBe(false);
  });

  it('sollte fehlende Fragen aus dem Run bereinigen (Issue #17)', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie']);
    });

    expect(result.current.aktiveFragen.length).toBe(3);

    // Simuliere: Frage wurde aus QuizData entfernt
    const reducedQuizData = {
      ...mockQuizData,
      fragen: mockQuizData.fragen.filter(f => f.id !== '1'),
    };

    const { result: result2 } = renderHook(() => useQuizRun(reducedQuizData, 'arcade'));

    // Nach Bereinigung sollten nur noch 2 Fragen aktiv sein
    expect(result2.current.aktiveFragen.length).toBe(2);
    expect(result2.current.statistiken.gesamt).toBe(2);
  });

  it('sollte aktuellen Index anpassen wenn Fragen entfernt werden (Issue #17)', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie']);
    });

    // Zu letzter Frage navigieren (Index 2)
    act(() => {
      result.current.naechsteFrage();
      result.current.naechsteFrage();
    });

    expect(result.current.aktuellerIndex).toBe(2);

    // Simuliere: Alle Fragen außer der ersten entfernt
    const reducedQuizData = {
      ...mockQuizData,
      fragen: mockQuizData.fragen.filter(f => f.id === '1'),
    };

    const { result: result2 } = renderHook(() => useQuizRun(reducedQuizData, 'arcade'));

    // Index sollte auf 0 zurückgesetzt werden (letzter verbleibender Index)
    expect(result2.current.aktuellerIndex).toBe(0);
    expect(result2.current.aktiveFragen.length).toBe(1);
  });

  it('sollte einen Topic chirurgisch aus dem Run entfernen', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie', 'Recht']);
    });

    expect(result.current.aktiveFragen.length).toBe(6);
    expect(result.current.loadedTopics).toContain('Biologie');
    expect(result.current.loadedTopics).toContain('Recht');

    act(() => {
      result.current.removeTopic('Biologie');
    });

    expect(result.current.aktiveFragen.length).toBe(3);
    expect(result.current.loadedTopics).not.toContain('Biologie');
    expect(result.current.loadedTopics).toContain('Recht');
    expect(result.current.isActive).toBe(true);
  });

  it('sollte Antworten entfernter Fragen aus dem Run löschen', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie', 'Recht']);
    });

    const bioId = result.current.aktiveFragen.find(f => f.topic === 'Biologie')!.id;

    act(() => {
      result.current.beantworteFrage(bioId, 'A');
    });

    expect(result.current.antworten[bioId]).toBe('A');

    act(() => {
      result.current.removeTopic('Biologie');
    });

    expect(result.current.antworten[bioId]).toBeUndefined();
  });

  it('sollte den Index anpassen wenn der aktuelle Topic entfernt wird', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie', 'Recht']);
    });

    const active = result.current.aktiveFragen;
    expect(active.length).toBe(6);

    // Navigiere zur ersten Recht-Frage im gemischten Run
    const rechtIndex = active.findIndex(f => f.topic === 'Recht');
    expect(rechtIndex).toBeGreaterThanOrEqual(0);

    act(() => {
      result.current.springeZuFrage(rechtIndex);
    });

    expect(result.current.aktuellerIndex).toBe(rechtIndex);

    act(() => {
      result.current.removeTopic('Biologie');
    });

    // Nur Recht-Fragen sollten übrig bleiben
    expect(result.current.aktiveFragen.length).toBe(3);
    expect(result.current.aktiveFragen.every(f => f.topic === 'Recht')).toBe(true);

    // Der Index muss innerhalb der neuen Grenzen liegen
    expect(result.current.aktuellerIndex).toBeGreaterThanOrEqual(0);
    expect(result.current.aktuellerIndex).toBeLessThan(result.current.aktiveFragen.length);
  });

  it('sollte den Run beenden wenn der letzte Topic entfernt wird', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie']);
    });

    expect(result.current.isActive).toBe(true);

    act(() => {
      result.current.removeTopic('Biologie');
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.aktiveFragen.length).toBe(0);
  });

  it('sollte nichts tun wenn ein unbekannter Topic entfernt werden soll', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie']);
    });

    expect(result.current.aktiveFragen.length).toBe(3);

    act(() => {
      result.current.removeTopic('Unbekannt');
    });

    expect(result.current.aktiveFragen.length).toBe(3);
    expect(result.current.isActive).toBe(true);
  });

  it('sollte answerShuffle für jede Frage generieren wenn Shuffle aktiviert', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie'], undefined, undefined, undefined, undefined, true);
    });

    expect(result.current.rawRun?.answerShuffle).toBeDefined();
    const shuffleMap = result.current.rawRun!.answerShuffle!;
    for (const frage of result.current.aktiveFragen) {
      expect(shuffleMap[frage.id]).toBeDefined();
      expect(shuffleMap[frage.id]).toHaveLength(3);
    }
  });

  it('sollte aktiveFragen in gemischter Reihenfolge anzeigen wenn Shuffle aktiv', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie'], undefined, undefined, undefined, undefined, true);
    });

    const frage = result.current.aktiveFragen[0];
    const shuffleMap = result.current.rawRun!.answerShuffle!;
    const order = shuffleMap[frage.id];
    const original = mockQuizData.fragen.find(f => f.id === frage.id)!;
    expect(frage.antworten.A).toBe(original.antworten[order[0]]);
    expect(frage.antworten.B).toBe(original.antworten[order[1]]);
    expect(frage.antworten.C).toBe(original.antworten[order[2]]);
  });

  it('sollte bei restarteRun eine neue answerShuffle generieren', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie'], undefined, undefined, undefined, undefined, true);
    });

    const oldShuffle = result.current.rawRun!.answerShuffle;

    act(() => {
      result.current.restarteRun();
    });

    const newShuffle = result.current.rawRun!.answerShuffle;
    expect(newShuffle).toBeDefined();
    expect(newShuffle).not.toBe(oldShuffle);
  });

  it('sollte Shuffle-Einträge beim Entfernen eines Topics löschen', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie', 'Recht'], undefined, undefined, undefined, undefined, true);
    });

    const bioIds = mockQuizData.fragen.filter(f => f.topic === 'Biologie').map(f => f.id);
    for (const id of bioIds) {
      expect(result.current.rawRun!.answerShuffle![id]).toBeDefined();
    }

    act(() => {
      result.current.removeTopic('Biologie');
    });

    for (const id of bioIds) {
      expect(result.current.rawRun!.answerShuffle![id]).toBeUndefined();
    }
    for (const f of mockQuizData.fragen.filter(f => f.topic === 'Recht')) {
      expect(result.current.rawRun!.answerShuffle![f.id]).toBeDefined();
    }
  });

  it('sollte Antworten nach Shuffle korrekt bewerten', () => {
    const { result } = renderHook(() => useQuizRun(mockQuizData, 'arcade'));

    act(() => {
      result.current.starteRun(['Biologie'], undefined, undefined, undefined, undefined, true);
    });

    const frage = result.current.aktiveFragen[0];
    const correctKey = frage.richtige_antwort;

    act(() => {
      result.current.beantworteFrage(frage.id, correctKey);
    });

    expect(result.current.antworten[frage.id]).toBe(correctKey);
    expect(result.current.statistiken.korrekt).toBe(1);
    expect(result.current.statistiken.falsch).toBe(0);

    const frage2 = result.current.aktiveFragen[1];
    const wrongKey2 = (['A', 'B', 'C'] as const).find(k => k !== frage2.richtige_antwort)!;
    act(() => {
      result.current.beantworteFrage(frage2.id, wrongKey2);
    });

    expect(result.current.antworten[frage2.id]).toBe(wrongKey2);
    expect(result.current.statistiken.falsch).toBe(1);
  });
});
