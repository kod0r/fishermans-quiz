import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings } from '@/store/settings';
import { memoryAdapter } from '@/utils/persistence/memoryAdapter';
import { createSettingsAdapter } from '@/utils/persistence/settingsAdapter';

const TEST_KEY = 'fmq:settings:v1';

describe('useSettings', () => {
  beforeEach(() => {
    memoryAdapter.clear(TEST_KEY);
  });

  it('sollte initial Arcade als Default haben', () => {
    const { result } = renderHook(() => useSettings(createSettingsAdapter(memoryAdapter)));
    expect(result.current.gameMode).toBe('arcade');
  });

  it('sollte den Spielmodus wechseln', () => {
    const { result } = renderHook(() => useSettings(createSettingsAdapter(memoryAdapter)));
    expect(result.current.gameMode).toBe('arcade');

    act(() => {
      result.current.setGameMode('hardcore');
    });

    expect(result.current.gameMode).toBe('hardcore');
    expect(result.current.settings.gameMode).toBe('hardcore');
  });

  it('sollte Settings in Adapter persistieren', () => {
    const { result } = renderHook(() => useSettings(createSettingsAdapter(memoryAdapter)));

    act(() => {
      result.current.setGameMode('hardcore');
    });

    const stored = memoryAdapter.load(TEST_KEY);
    expect(stored).toBeTruthy();
    expect((stored as { gameMode: string }).gameMode).toBe('hardcore');
  });

  it('sollte Settings aus Adapter laden', () => {
    memoryAdapter.save(TEST_KEY, { gameMode: 'hardcore' });

    const { result } = renderHook(() => useSettings(createSettingsAdapter(memoryAdapter)));

    expect(result.current.gameMode).toBe('hardcore');
  });

  it('sollte bei korruptem Adapter-Daten auf Defaults zurückfallen', () => {
    memoryAdapter.save(TEST_KEY, { gameMode: 'invalid_mode' });

    const { result } = renderHook(() => useSettings(createSettingsAdapter(memoryAdapter)));

    expect(result.current.gameMode).toBe('arcade');
  });
});
