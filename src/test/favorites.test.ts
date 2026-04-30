import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '@/store/favorites';
import { memoryAdapter } from '@/utils/persistence/memoryAdapter';

const TEST_KEY = 'fmq:favorites:v1';

describe('useFavorites', () => {
  beforeEach(() => {
    memoryAdapter.clear(TEST_KEY);
  });

  it('sollte initial leere Favoriten haben', () => {
    const { result } = renderHook(() => useFavorites(memoryAdapter));
    expect(result.current.favorites).toEqual([]);
    expect(result.current.isFavorite('1')).toBe(false);
  });

  it('sollte einen Favoriten hinzufügen', () => {
    const { result } = renderHook(() => useFavorites(memoryAdapter));

    act(() => {
      result.current.toggleFavorite('1');
    });

    expect(result.current.favorites).toContain('1');
    expect(result.current.isFavorite('1')).toBe(true);
  });

  it('sollte einen Favoriten entfernen', () => {
    const { result } = renderHook(() => useFavorites(memoryAdapter));

    act(() => {
      result.current.toggleFavorite('1');
      result.current.toggleFavorite('1');
    });

    expect(result.current.favorites).not.toContain('1');
    expect(result.current.isFavorite('1')).toBe(false);
  });

  it('sollte Favoriten zurücksetzen', () => {
    const { result } = renderHook(() => useFavorites(memoryAdapter));

    act(() => {
      result.current.toggleFavorite('1');
      result.current.toggleFavorite('2');
    });

    expect(result.current.favorites).toHaveLength(2);

    act(() => {
      result.current.resetFavorites();
    });

    expect(result.current.favorites).toEqual([]);
  });

  it('sollte Favoriten importieren', () => {
    const { result } = renderHook(() => useFavorites(memoryAdapter));

    act(() => {
      result.current.importFavorites(['3', '4']);
    });

    expect(result.current.favorites).toEqual(['3', '4']);
    expect(result.current.isFavorite('3')).toBe(true);
    expect(result.current.isFavorite('1')).toBe(false);
  });

  it('sollte Favoriten im Adapter persistieren', () => {
    const { result } = renderHook(() => useFavorites(memoryAdapter));

    act(() => {
      result.current.toggleFavorite('1');
    });

    const stored = memoryAdapter.load(TEST_KEY);
    expect(stored).toEqual(['1']);
  });

  it('sollte Favoriten aus Adapter laden', () => {
    memoryAdapter.save(TEST_KEY, ['5', '6']);

    const { result } = renderHook(() => useFavorites(memoryAdapter));

    expect(result.current.favorites).toEqual(['5', '6']);
    expect(result.current.isFavorite('5')).toBe(true);
  });
});
