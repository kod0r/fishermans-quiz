import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from '@/store/history';
import { memoryAdapter } from '@/utils/persistence/memoryAdapter';
import { createHistoryAdapter } from '@/utils/persistence/historyAdapter';

const TEST_KEY = 'fmq:history:v1';

describe('useHistory', () => {
  beforeEach(() => {
    memoryAdapter.clear(TEST_KEY);
  });

  it('sollte mit leerem Verlauf starten', () => {
    const { result } = renderHook(() => useHistory(createHistoryAdapter(memoryAdapter)));
    expect(result.current.entries).toEqual([]);
  });

  it('sollte einen Eintrag hinzufügen', () => {
    const { result } = renderHook(() => useHistory(createHistoryAdapter(memoryAdapter)));
    act(() => {
      result.current.addEntry({
        topics: ['Biologie'],
        score: 8,
        total: 10,
        duration: 120,
        mode: 'arcade',
      });
    });
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].score).toBe(8);
    expect(result.current.entries[0].mode).toBe('arcade');
  });

  it('sollte Einträge an den Anfang stellen', () => {
    const { result } = renderHook(() => useHistory(createHistoryAdapter(memoryAdapter)));
    act(() => {
      result.current.addEntry({
        topics: ['Biologie'],
        score: 5,
        total: 10,
        duration: 60,
        mode: 'arcade',
      });
      result.current.addEntry({
        topics: ['Recht'],
        score: 9,
        total: 10,
        duration: 90,
        mode: 'hardcore',
      });
    });
    expect(result.current.entries[0].topics).toEqual(['Recht']);
    expect(result.current.entries[1].topics).toEqual(['Biologie']);
  });

  it('sollte maximal 500 Einträge halten', () => {
    const { result } = renderHook(() => useHistory(createHistoryAdapter(memoryAdapter)));
    act(() => {
      for (let i = 0; i < 502; i++) {
        result.current.addEntry({
          topics: ['Biologie'],
          score: 1,
          total: 1,
          duration: 1,
          mode: 'arcade',
        });
      }
    });
    expect(result.current.entries).toHaveLength(500);
  });

  it('sollte Einträge aus Adapter laden', () => {
    const existing = [
      {
        id: 'test-1',
        timestamp: new Date().toISOString(),
        topics: ['Recht'],
        score: 7,
        total: 10,
        duration: 100,
        mode: 'arcade',
      },
    ];
    memoryAdapter.save(TEST_KEY, existing);
    const { result } = renderHook(() => useHistory(createHistoryAdapter(memoryAdapter)));
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].id).toBe('test-1');
  });

  it('sollte den Verlauf löschen', () => {
    const { result } = renderHook(() => useHistory(createHistoryAdapter(memoryAdapter)));
    act(() => {
      result.current.addEntry({
        topics: ['Biologie'],
        score: 5,
        total: 10,
        duration: 60,
        mode: 'arcade',
      });
    });
    act(() => {
      result.current.clearHistory();
    });
    expect(result.current.entries).toEqual([]);
  });

  it('sollte Einträge importieren', () => {
    const { result } = renderHook(() => useHistory(createHistoryAdapter(memoryAdapter)));
    act(() => {
      result.current.importHistory([
        {
          id: 'imp-1',
          timestamp: new Date().toISOString(),
          topics: ['Bilderkennung'],
          score: 10,
          total: 10,
          duration: 30,
          mode: 'hardcore',
        },
      ]);
    });
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].id).toBe('imp-1');
  });

  it('sollte jeder Eintrag eine eindeutige ID haben', () => {
    const { result } = renderHook(() => useHistory(createHistoryAdapter(memoryAdapter)));
    act(() => {
      result.current.addEntry({
        topics: ['Biologie'],
        score: 1,
        total: 1,
        duration: 1,
        mode: 'arcade',
      });
      result.current.addEntry({
        topics: ['Recht'],
        score: 2,
        total: 2,
        duration: 2,
        mode: 'arcade',
      });
    });
    expect(result.current.entries[0].id).not.toBe(result.current.entries[1].id);
  });

  it('sollte legacy bereiche-Feld zu topics migrieren', () => {
    const legacy = [
      {
        id: 'legacy-1',
        timestamp: new Date().toISOString(),
        bereiche: ['Recht', 'Biologie'],
        score: 5,
        total: 10,
        duration: 60,
        mode: 'arcade',
      },
    ];
    memoryAdapter.save(TEST_KEY, legacy);
    const { result } = renderHook(() => useHistory(createHistoryAdapter(memoryAdapter)));
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].topics).toEqual(['Recht', 'Biologie']);
  });
});
