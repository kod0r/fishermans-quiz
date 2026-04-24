import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from '@/store/history';

describe('useHistory', () => {
  it('sollte mit leerem Verlauf starten', () => {
    const { result } = renderHook(() => useHistory());
    expect(result.current.entries).toEqual([]);
  });

  it('sollte einen Eintrag hinzufügen', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      result.current.addEntry({
        bereiche: ['Biologie'],
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
    const { result } = renderHook(() => useHistory());
    act(() => {
      result.current.addEntry({
        bereiche: ['Biologie'],
        score: 5,
        total: 10,
        duration: 60,
        mode: 'arcade',
      });
      result.current.addEntry({
        bereiche: ['Recht'],
        score: 9,
        total: 10,
        duration: 90,
        mode: 'hardcore',
      });
    });
    expect(result.current.entries[0].bereiche).toEqual(['Recht']);
    expect(result.current.entries[1].bereiche).toEqual(['Biologie']);
  });

  it('sollte maximal 500 Einträge halten', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      for (let i = 0; i < 502; i++) {
        result.current.addEntry({
          bereiche: ['Biologie'],
          score: 1,
          total: 1,
          duration: 1,
          mode: 'arcade',
        });
      }
    });
    expect(result.current.entries).toHaveLength(500);
  });

  it('sollte Einträge aus localStorage laden', () => {
    const existing = [
      {
        id: 'test-1',
        timestamp: new Date().toISOString(),
        bereiche: ['Recht'],
        score: 7,
        total: 10,
        duration: 100,
        mode: 'arcade',
      },
    ];
    localStorage.setItem('fmq:history:v1', JSON.stringify(existing));
    const { result } = renderHook(() => useHistory());
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].id).toBe('test-1');
  });

  it('sollte den Verlauf löschen', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      result.current.addEntry({
        bereiche: ['Biologie'],
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
    const { result } = renderHook(() => useHistory());
    act(() => {
      result.current.importHistory([
        {
          id: 'imp-1',
          timestamp: new Date().toISOString(),
          bereiche: ['Bilderkennung'],
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
    const { result } = renderHook(() => useHistory());
    act(() => {
      result.current.addEntry({
        bereiche: ['Biologie'],
        score: 1,
        total: 1,
        duration: 1,
        mode: 'arcade',
      });
      result.current.addEntry({
        bereiche: ['Recht'],
        score: 2,
        total: 2,
        duration: 2,
        mode: 'arcade',
      });
    });
    expect(result.current.entries[0].id).not.toBe(result.current.entries[1].id);
  });
});
