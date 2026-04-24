import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings } from '@/store/settings';

describe('useSettings', () => {
  it('sollte initial Arcade als Default haben', () => {
    const { result } = renderHook(() => useSettings());

    expect(result.current.gameMode).toBe('arcade');
  });

  it('sollte den Spielmodus wechseln', () => {
    const { result } = renderHook(() => useSettings());

    expect(result.current.gameMode).toBe('arcade');

    act(() => {
      result.current.setGameMode('hardcore');
    });

    expect(result.current.gameMode).toBe('hardcore');
    expect(result.current.settings.gameMode).toBe('hardcore');
  });

  it('sollte Settings in localStorage persistieren', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.setGameMode('hardcore');
    });

    const stored = localStorage.getItem('fmq:settings:v1');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!).gameMode).toBe('hardcore');
  });

  it('sollte Settings aus localStorage laden', () => {
    localStorage.setItem('fmq:settings:v1', JSON.stringify({ gameMode: 'hardcore' }));

    const { result } = renderHook(() => useSettings());

    expect(result.current.gameMode).toBe('hardcore');
  });

  it('sollte bei korruptem localStorage auf Defaults zurückfallen', () => {
    localStorage.setItem('fmq:settings:v1', JSON.stringify({ gameMode: 'invalid_mode' }));

    const { result } = renderHook(() => useSettings());

    expect(result.current.gameMode).toBe('arcade');
  });
});
