import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMetaProgress } from '@/store/metaProgress';

describe('useMetaProgress', () => {
  it('sollte initial leere Meta-Daten haben', () => {
    const { result } = renderHook(() => useMetaProgress('arcade'));

    expect(result.current.meta.stats.totalRuns).toBe(0);
    expect(result.current.meta.stats.totalQuestionsAnswered).toBe(0);
    expect(result.current.meta.stats.totalCorrect).toBe(0);
    expect(result.current.meisterCount).toBe(0);
    expect(result.current.lernCount).toBe(0);
  });

  it('sollte correctStreak bei richtiger Antwort erhöhen', () => {
    const { result } = renderHook(() => useMetaProgress('arcade'));

    act(() => {
      result.current.recordAnswer('q1', true);
    });

    expect(result.current.meta.fragen['q1'].correctStreak).toBe(1);
    expect(result.current.meta.fragen['q1'].attempts).toBe(1);
    expect(result.current.meta.stats.totalCorrect).toBe(1);
    expect(result.current.meta.stats.totalQuestionsAnswered).toBe(1);
  });

  it('sollte correctStreak bei 3 richtigen Antworten zu Meister machen', () => {
    const { result } = renderHook(() => useMetaProgress('arcade'));

    act(() => {
      result.current.recordAnswer('q1', true);
      result.current.recordAnswer('q1', true);
      result.current.recordAnswer('q1', true);
    });

    expect(result.current.meta.fragen['q1'].correctStreak).toBe(3);
    expect(result.current.meisterCount).toBe(1);
  });

  it('sollte correctStreak bei falscher Antwort zurücksetzen', () => {
    const { result } = renderHook(() => useMetaProgress('arcade'));

    act(() => {
      result.current.recordAnswer('q1', true);
      result.current.recordAnswer('q1', true);
      result.current.recordAnswer('q1', false);
    });

    expect(result.current.meta.fragen['q1'].correctStreak).toBe(0);
    expect(result.current.meisterCount).toBe(0);
    expect(result.current.lernCount).toBe(1);
  });

  it('sollte beste Serie (bestStreak) tracken', () => {
    const { result } = renderHook(() => useMetaProgress('arcade'));

    act(() => {
      result.current.recordAnswer('q1', true);
      result.current.recordAnswer('q2', true);
      result.current.recordAnswer('q3', true);
    });

    expect(result.current.meta.stats.bestStreak).toBe(3);
    expect(result.current.meta.stats.currentStreak).toBe(3);

    act(() => {
      result.current.recordAnswer('q4', false);
    });

    expect(result.current.meta.stats.bestStreak).toBe(3); // bleibt erhalten
    expect(result.current.meta.stats.currentStreak).toBe(0);
  });

  it('sollte totalRuns erhöhen', () => {
    const { result } = renderHook(() => useMetaProgress('arcade'));

    act(() => {
      result.current.recordRunStart();
    });

    expect(result.current.meta.stats.totalRuns).toBe(1);
  });

  it('sollte alles zurücksetzen', () => {
    const { result } = renderHook(() => useMetaProgress('arcade'));

    act(() => {
      result.current.recordAnswer('q1', true);
      result.current.recordAnswer('q1', true);
      result.current.recordAnswer('q1', true);
      result.current.recordAnswer('q2', true);
      result.current.recordRunStart();
    });

    expect(result.current.meisterCount).toBe(1);
    expect(result.current.meta.stats.totalRuns).toBe(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.meta.stats.totalRuns).toBe(0);
    expect(result.current.meisterCount).toBe(0);
    expect(result.current.lernCount).toBe(0);
  });

  it('sollte getFrageMeta für bekannte Fragen zurückgeben', () => {
    const { result } = renderHook(() => useMetaProgress('arcade'));

    act(() => {
      result.current.recordAnswer('q1', true);
    });

    const meta = result.current.getFrageMeta('q1');
    expect(meta).toBeDefined();
    expect(meta?.correctStreak).toBe(1);

    const unknown = result.current.getFrageMeta('unknown');
    expect(unknown).toBeUndefined();
  });

  it('sollte Meta-Daten pro Modus getrennt speichern', () => {
    const { result: arcade } = renderHook(() => useMetaProgress('arcade'));
    const { result: hardcore } = renderHook(() => useMetaProgress('hardcore'));

    act(() => {
      arcade.current.recordAnswer('q1', true);
      hardcore.current.recordAnswer('q1', false);
    });

    expect(arcade.current.meta.fragen['q1'].correctStreak).toBe(1);
    expect(hardcore.current.meta.fragen['q1'].correctStreak).toBe(0);
  });

  it('sollte Bereich-Result als passed speichern', () => {
    const { result } = renderHook(() => useMetaProgress('hardcore'));

    act(() => {
      result.current.recordBereichResult('Biologie', true);
    });

    expect(result.current.meta.bereiche['Biologie'].passed).toBe(true);
    expect(result.current.meta.bereiche['Biologie'].consecutivePasses).toBe(1);
    expect(result.current.meta.bereiche['Biologie'].mastered).toBe(false);
    expect(result.current.bestandeneBereicheHardcore).toBe(1);
    expect(result.current.gemeisterteBereicheHardcore).toBe(0);
  });

  it('sollte consecutivePasses bei passed erhöhen', () => {
    const { result } = renderHook(() => useMetaProgress('hardcore'));

    act(() => {
      result.current.recordBereichResult('Biologie', true);
      result.current.recordBereichResult('Biologie', true);
    });

    expect(result.current.meta.bereiche['Biologie'].consecutivePasses).toBe(2);
    expect(result.current.meta.bereiche['Biologie'].mastered).toBe(false);
  });

  it('sollte mastered nach 3 konsekutiven Passe setzen', () => {
    const { result } = renderHook(() => useMetaProgress('hardcore'));

    act(() => {
      result.current.recordBereichResult('Biologie', true);
      result.current.recordBereichResult('Biologie', true);
      result.current.recordBereichResult('Biologie', true);
    });

    expect(result.current.meta.bereiche['Biologie'].mastered).toBe(true);
    expect(result.current.meta.bereiche['Biologie'].consecutivePasses).toBe(3);
    expect(result.current.gemeisterteBereicheHardcore).toBe(1);
  });

  it('sollte consecutivePasses bei failed zurücksetzen', () => {
    const { result } = renderHook(() => useMetaProgress('hardcore'));

    act(() => {
      result.current.recordBereichResult('Biologie', true);
      result.current.recordBereichResult('Biologie', true);
      result.current.recordBereichResult('Biologie', false);
    });

    expect(result.current.meta.bereiche['Biologie'].passed).toBe(false);
    expect(result.current.meta.bereiche['Biologie'].consecutivePasses).toBe(0);
    expect(result.current.meta.bereiche['Biologie'].mastered).toBe(false);
  });

  it('sollte Bereich-Results beim Reset löschen', () => {
    const { result } = renderHook(() => useMetaProgress('hardcore'));

    act(() => {
      result.current.recordBereichResult('Biologie', true);
    });

    expect(result.current.bestandeneBereicheHardcore).toBe(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.bestandeneBereicheHardcore).toBe(0);
    expect(result.current.gemeisterteBereicheHardcore).toBe(0);
  });
});
