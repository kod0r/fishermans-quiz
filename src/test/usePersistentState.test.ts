import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { memoryAdapter } from '@/utils/persistence/memoryAdapter';
import type { PersistenceAdapter } from '@/utils/persistence';

describe('usePersistentState', () => {
  beforeEach(() => {
    memoryAdapter.clear('demo-key');
  });

  it('returns default value on first render', () => {
    const { result } = renderHook(() =>
      usePersistentState('demo-key', 'default', memoryAdapter as PersistenceAdapter<string>),
    );
    expect(result.current[0]).toBe('default');
  });

  it('updates state via setter', () => {
    const { result } = renderHook(() =>
      usePersistentState('demo-key', 'default', memoryAdapter as PersistenceAdapter<string>),
    );
    act(() => {
      result.current[1]('updated');
    });
    expect(result.current[0]).toBe('updated');
  });

  it('persists to adapter after change', () => {
    const { result } = renderHook(() =>
      usePersistentState('demo-key', { count: 0 }, memoryAdapter as PersistenceAdapter<{ count: number }>),
    );
    act(() => {
      result.current[1]({ count: 5 });
    });
    const stored = memoryAdapter.load('demo-key');
    expect(stored).toEqual({ count: 5 });
  });

  it('loads existing value from adapter on mount', () => {
    memoryAdapter.save('demo-key', { count: 99 });
    const { result } = renderHook(() =>
      usePersistentState('demo-key', { count: 0 }, memoryAdapter as PersistenceAdapter<{ count: number }>),
    );
    expect(result.current[0]).toEqual({ count: 99 });
  });

  it('clears value via clear fn', () => {
    const { result } = renderHook(() =>
      usePersistentState('demo-key', 'default', memoryAdapter as PersistenceAdapter<string>),
    );
    act(() => {
      result.current[1]('changed');
    });
    act(() => {
      result.current[2]();
    });
    expect(result.current[0]).toBe('default');
    expect(memoryAdapter.load('demo-key')).toBeNull();
  });
});
