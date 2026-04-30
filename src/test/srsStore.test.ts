import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSRS } from '@/store/srs';
import { memoryAdapter } from '@/utils/persistence/memoryAdapter';
import { createSRSAdapter } from '@/utils/persistence/srsAdapter';

const TEST_KEY = 'fmq:meta:srs:v1';

describe('useSRS', () => {
  beforeEach(() => {
    memoryAdapter.clear(TEST_KEY);
  });

  it('sollte initial leere SRS-Daten haben', () => {
    const { result } = renderHook(() => useSRS(createSRSAdapter(memoryAdapter)));

    expect(result.current.dueCount).toBe(0);
    expect(result.current.dueFrageIds).toEqual([]);
    expect(result.current.srsMap).toEqual({});
  });

  it('sollte eine Antwort mit quality 4 aufnehmen', () => {
    const { result } = renderHook(() => useSRS(createSRSAdapter(memoryAdapter)));

    act(() => {
      result.current.recordAnswer('q1', 4);
    });

    const meta = result.current.getSRSMeta('q1');
    expect(meta).toBeDefined();
    expect(meta!.repetitions).toBe(1);
    expect(meta!.interval).toBe(1);
    expect(meta!.efactor).toBeGreaterThanOrEqual(2.5);
  });

  it('sollte eine Selbstbewertung (again) als quality 0 aufnehmen', () => {
    const { result } = renderHook(() => useSRS(createSRSAdapter(memoryAdapter)));

    act(() => {
      result.current.recordSelfAssessment('q1', 'again');
    });

    const meta = result.current.getSRSMeta('q1');
    expect(meta).toBeDefined();
    expect(meta!.repetitions).toBe(0);
    expect(meta!.interval).toBe(1);
  });

  it('sollte nach 3 erfolgreichen Wiederholungen repetitions >= 3 haben', () => {
    const { result } = renderHook(() => useSRS(createSRSAdapter(memoryAdapter)));

    act(() => {
      result.current.recordAnswer('q1', 4); // interval 1
    });
    act(() => {
      result.current.recordAnswer('q1', 4); // interval 6
    });
    act(() => {
      result.current.recordAnswer('q1', 4); // interval >= 6*efactor
    });

    const meta = result.current.getSRSMeta('q1');
    expect(meta!.repetitions).toBeGreaterThanOrEqual(3);
  });

  it('sollte dueCount für fällige Wiederholungen erhöhen', () => {
    const { result } = renderHook(() => useSRS(createSRSAdapter(memoryAdapter)));

    act(() => {
      result.current.recordAnswer('q1', 4);
    });
    const meta = result.current.getSRSMeta('q1');
    expect(meta).toBeDefined();

    // Überschreibe nextReview auf gestern, um Überfälligkeit zu simulieren
    memoryAdapter.save(TEST_KEY, {
      q1: { ...meta!, nextReview: new Date(Date.now() - 86400000).toISOString() },
    });

    const { result: result2 } = renderHook(() => useSRS(createSRSAdapter(memoryAdapter)));
    expect(result2.current.dueCount).toBe(1);
  });

  it('sollte alles zurücksetzen', () => {
    const { result } = renderHook(() => useSRS(createSRSAdapter(memoryAdapter)));

    act(() => {
      result.current.recordAnswer('q1', 4);
      result.current.recordAnswer('q2', 4);
    });

    expect(Object.keys(result.current.srsMap)).toHaveLength(2);

    act(() => {
      result.current.reset();
    });

    expect(result.current.dueCount).toBe(0);
    expect(result.current.srsMap).toEqual({});
  });

  it('sollte SRS-Daten in Adapter persistieren', () => {
    const { result } = renderHook(() => useSRS(createSRSAdapter(memoryAdapter)));

    act(() => {
      result.current.recordAnswer('q1', 4);
    });

    const raw = memoryAdapter.load(TEST_KEY);
    expect(raw).not.toBeNull();
    expect((raw as Record<string, unknown>).q1).toBeDefined();
    expect(((raw as Record<string, unknown>).q1 as { repetitions: number }).repetitions).toBe(1);
  });

  it('sollte beim Laden aus Adapter vorhandene Daten übernehmen', () => {
    memoryAdapter.save(TEST_KEY, {
      q1: { interval: 6, repetitions: 2, efactor: 2.5, nextReview: new Date().toISOString() },
    });

    const { result } = renderHook(() => useSRS(createSRSAdapter(memoryAdapter)));

    const meta = result.current.getSRSMeta('q1');
    expect(meta).toBeDefined();
    expect(meta!.repetitions).toBe(2);
    expect(meta!.interval).toBe(6);
  });
});
