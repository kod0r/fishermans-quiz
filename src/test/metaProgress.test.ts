import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMetaProgress } from '@/store/metaProgress';
import { memoryAdapter } from '@/utils/persistence/memoryAdapter';
import { createMetaAdapter } from '@/utils/persistence/metaAdapter';

describe('useMetaProgress', () => {
  beforeEach(() => {
    memoryAdapter.clear('fmq:meta:arcade:v2');
    memoryAdapter.clear('fmq:meta:hardcore:v2');
    memoryAdapter.clear('fmq:meta:exam:v2');
  });

  it('sollte initial leere Meta-Daten haben', () => {
    const { result } = renderHook(() => useMetaProgress('arcade', createMetaAdapter(memoryAdapter)));

    expect(result.current.meta.stats.totalRuns).toBe(0);
    expect(result.current.meta.stats.totalQuestionsAnswered).toBe(0);
    expect(result.current.meta.stats.totalCorrect).toBe(0);
  });

  it('sollte correctStreak bei richtiger Antwort erhöhen', () => {
    const { result } = renderHook(() => useMetaProgress('arcade', createMetaAdapter(memoryAdapter)));

    act(() => {
      result.current.recordAnswer('q1', true);
    });

    expect(result.current.meta.fragen['q1'].correctStreak).toBe(1);
    expect(result.current.meta.fragen['q1'].attempts).toBe(1);
    expect(result.current.meta.stats.totalCorrect).toBe(1);
    expect(result.current.meta.stats.totalQuestionsAnswered).toBe(1);
  });

  it('sollte correctStreak bei 3 richtigen Antworten zu Meister machen', () => {
    const { result } = renderHook(() => useMetaProgress('arcade', createMetaAdapter(memoryAdapter)));

    act(() => {
      result.current.recordAnswer('q1', true);
      result.current.recordAnswer('q1', true);
      result.current.recordAnswer('q1', true);
    });

    expect(result.current.meta.fragen['q1'].correctStreak).toBe(3);
  });

  it('sollte correctStreak bei falscher Antwort zurücksetzen', () => {
    const { result } = renderHook(() => useMetaProgress('arcade', createMetaAdapter(memoryAdapter)));

    act(() => {
      result.current.recordAnswer('q1', true);
      result.current.recordAnswer('q1', true);
      result.current.recordAnswer('q1', false);
    });

    expect(result.current.meta.fragen['q1'].correctStreak).toBe(0);
  });

  it('sollte beste Serie (bestStreak) tracken', () => {
    const { result } = renderHook(() => useMetaProgress('arcade', createMetaAdapter(memoryAdapter)));

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
    const { result } = renderHook(() => useMetaProgress('arcade', createMetaAdapter(memoryAdapter)));

    act(() => {
      result.current.recordRunStart();
    });

    expect(result.current.meta.stats.totalRuns).toBe(1);
  });

  it('sollte alles zurücksetzen', () => {
    const { result } = renderHook(() => useMetaProgress('arcade', createMetaAdapter(memoryAdapter)));

    act(() => {
      result.current.recordAnswer('q1', true);
      result.current.recordAnswer('q1', true);
      result.current.recordAnswer('q1', true);
      result.current.recordAnswer('q2', true);
      result.current.recordRunStart();
    });

    expect(result.current.meta.stats.totalRuns).toBe(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.meta.stats.totalRuns).toBe(0);
  });

  it('sollte getFrageMeta für bekannte Fragen zurückgeben', () => {
    const { result } = renderHook(() => useMetaProgress('arcade', createMetaAdapter(memoryAdapter)));

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
    const { result: arcade } = renderHook(() => useMetaProgress('arcade', createMetaAdapter(memoryAdapter)));
    const { result: hardcore } = renderHook(() => useMetaProgress('hardcore', createMetaAdapter(memoryAdapter)));

    act(() => {
      arcade.current.recordAnswer('q1', true);
      hardcore.current.recordAnswer('q1', false);
    });

    expect(arcade.current.meta.fragen['q1'].correctStreak).toBe(1);
    expect(hardcore.current.meta.fragen['q1'].correctStreak).toBe(0);
  });

  it('sollte Topic-Result als passed speichern', () => {
    const { result } = renderHook(() => useMetaProgress('hardcore', createMetaAdapter(memoryAdapter)));

    act(() => {
      result.current.recordTopicResult('Biologie', true);
    });

    expect(result.current.meta.topics['Biologie'].passed).toBe(true);
    expect(result.current.meta.topics['Biologie'].consecutivePasses).toBe(1);
    expect(result.current.meta.topics['Biologie'].mastered).toBe(false);
    expect(result.current.passedTopicsHardcore).toBe(1);
    expect(result.current.masteredTopicsHardcore).toBe(0);
  });

  it('sollte consecutivePasses bei passed erhöhen', () => {
    const { result } = renderHook(() => useMetaProgress('hardcore', createMetaAdapter(memoryAdapter)));

    act(() => {
      result.current.recordTopicResult('Biologie', true);
      result.current.recordTopicResult('Biologie', true);
    });

    expect(result.current.meta.topics['Biologie'].consecutivePasses).toBe(2);
    expect(result.current.meta.topics['Biologie'].mastered).toBe(false);
  });

  it('sollte mastered nach 3 konsekutiven Passe setzen', () => {
    const { result } = renderHook(() => useMetaProgress('hardcore', createMetaAdapter(memoryAdapter)));

    act(() => {
      result.current.recordTopicResult('Biologie', true);
      result.current.recordTopicResult('Biologie', true);
      result.current.recordTopicResult('Biologie', true);
    });

    expect(result.current.meta.topics['Biologie'].mastered).toBe(true);
    expect(result.current.meta.topics['Biologie'].consecutivePasses).toBe(3);
    expect(result.current.masteredTopicsHardcore).toBe(1);
  });

  it('sollte consecutivePasses bei failed zurücksetzen', () => {
    const { result } = renderHook(() => useMetaProgress('hardcore', createMetaAdapter(memoryAdapter)));

    act(() => {
      result.current.recordTopicResult('Biologie', true);
      result.current.recordTopicResult('Biologie', true);
      result.current.recordTopicResult('Biologie', false);
    });

    expect(result.current.meta.topics['Biologie'].passed).toBe(false);
    expect(result.current.meta.topics['Biologie'].consecutivePasses).toBe(0);
    expect(result.current.meta.topics['Biologie'].mastered).toBe(false);
  });

  it('sollte Topic-Results beim Reset löschen', () => {
    const { result } = renderHook(() => useMetaProgress('hardcore', createMetaAdapter(memoryAdapter)));

    act(() => {
      result.current.recordTopicResult('Biologie', true);
    });

    expect(result.current.passedTopicsHardcore).toBe(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.passedTopicsHardcore).toBe(0);
    expect(result.current.masteredTopicsHardcore).toBe(0);
  });
});
