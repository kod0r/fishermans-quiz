import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameMenu } from '@/hooks/useGameMenu';

describe('useGameMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with closed state and root page', () => {
    const { result } = renderHook(() => useGameMenu());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.stack).toEqual(['root']);
    expect(result.current.currentPage).toBe('root');
    expect(result.current.direction).toBe('forward');
    expect(result.current.focusedIndex).toBe(0);
  });

  it('open() sets isOpen to true and resets stack to root', () => {
    const { result } = renderHook(() => useGameMenu());

    act(() => {
      result.current.push('settings');
    });
    act(() => {
      result.current.close();
    });
    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.stack).toEqual(['root']);
    expect(result.current.direction).toBe('forward');
    expect(result.current.focusedIndex).toBe(0);
  });

  it('close() sets isOpen to false and resets stack', () => {
    const { result } = renderHook(() => useGameMenu());

    act(() => {
      result.current.open();
    });
    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.stack).toEqual(['root']);
    expect(result.current.direction).toBe('back');
  });

  it('push() adds a page to the stack with forward direction', () => {
    const { result } = renderHook(() => useGameMenu());

    act(() => {
      result.current.open();
    });
    act(() => {
      result.current.push('settings');
    });

    expect(result.current.stack).toEqual(['root', 'settings']);
    expect(result.current.currentPage).toBe('settings');
    expect(result.current.direction).toBe('forward');
  });

  it('pop() removes the last page from the stack with back direction', () => {
    const { result } = renderHook(() => useGameMenu());

    act(() => {
      result.current.open();
    });
    act(() => {
      result.current.push('settings');
    });
    act(() => {
      result.current.pop();
    });

    expect(result.current.stack).toEqual(['root']);
    expect(result.current.currentPage).toBe('root');
    expect(result.current.direction).toBe('back');
  });

  it('pop() on single-page stack closes the menu', () => {
    const { result } = renderHook(() => useGameMenu());

    act(() => {
      result.current.open();
    });
    act(() => {
      result.current.pop();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.stack).toEqual(['root']);
  });

  it('openTo() opens directly to a specific page', () => {
    const { result } = renderHook(() => useGameMenu());

    act(() => {
      result.current.openTo('run-actions');
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.stack).toEqual(['run-actions']);
    expect(result.current.currentPage).toBe('run-actions');
    expect(result.current.direction).toBe('forward');
  });

  it('stack behavior: multiple pushes and pops', () => {
    const { result } = renderHook(() => useGameMenu());

    act(() => result.current.open());
    act(() => result.current.push('settings'));
    act(() => result.current.push('data'));
    act(() => result.current.push('navigation'));

    expect(result.current.stack).toEqual(['root', 'settings', 'data', 'navigation']);
    expect(result.current.currentPage).toBe('navigation');

    act(() => result.current.pop());
    expect(result.current.stack).toEqual(['root', 'settings', 'data']);

    act(() => result.current.pop());
    expect(result.current.stack).toEqual(['root', 'settings']);

    act(() => result.current.pop());
    expect(result.current.stack).toEqual(['root']);
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.pop());
    expect(result.current.isOpen).toBe(false);
  });

  /* ── Keyboard navigation ── */

  it('ArrowDown increments focusedIndex', () => {
    const { result } = renderHook(() => useGameMenu());

    act(() => {
      result.current.registerItemCount(5);
    });
    act(() => {
      result.current.open();
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });

    expect(result.current.focusedIndex).toBe(1);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });

    expect(result.current.focusedIndex).toBe(2);
  });

  it('ArrowUp decrements focusedIndex', () => {
    const { result } = renderHook(() => useGameMenu());

    act(() => {
      result.current.registerItemCount(5);
    });
    act(() => {
      result.current.open();
    });
    act(() => {
      result.current.setFocusedIndex(3);
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    });

    expect(result.current.focusedIndex).toBe(2);
  });

  it('ArrowUp does not go below 0', () => {
    const { result } = renderHook(() => useGameMenu());

    act(() => {
      result.current.registerItemCount(5);
    });
    act(() => {
      result.current.open();
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    });

    expect(result.current.focusedIndex).toBe(0);
  });

  it('ArrowDown does not exceed itemCount - 1', () => {
    const { result } = renderHook(() => useGameMenu());

    act(() => {
      result.current.registerItemCount(3);
    });
    act(() => {
      result.current.open();
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });

    expect(result.current.focusedIndex).toBe(2);
  });

  it('Escape calls pop when menu is open', () => {
    const { result } = renderHook(() => useGameMenu());

    act(() => {
      result.current.open();
    });
    act(() => {
      result.current.push('settings');
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(result.current.stack).toEqual(['root']);
  });

  it('Enter fires registered onActivate callback with focusedIndex', () => {
    const onActivate = vi.fn();
    const { result } = renderHook(() => useGameMenu());

    act(() => {
      result.current.registerItemCount(5);
    });
    act(() => {
      result.current.open();
    });
    act(() => {
      result.current.setFocusedIndex(2);
    });
    act(() => {
      result.current.registerOnActivate(onActivate);
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    expect(onActivate).toHaveBeenCalledWith(2);
    expect(result.current.isOpen).toBe(true);
  });

  it('Space fires registered onActivate callback with focusedIndex', () => {
    const onActivate = vi.fn();
    const { result } = renderHook(() => useGameMenu());

    act(() => {
      result.current.open();
    });
    act(() => {
      result.current.registerOnActivate(onActivate);
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    });

    expect(onActivate).toHaveBeenCalledWith(0);
    expect(result.current.isOpen).toBe(true);
  });

  it('unregistering onActivate stops Enter from firing', () => {
    const onActivate = vi.fn();
    const { result } = renderHook(() => useGameMenu());

    act(() => {
      result.current.open();
    });
    act(() => {
      result.current.registerOnActivate(onActivate);
    });
    act(() => {
      result.current.registerOnActivate(null);
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    expect(onActivate).not.toHaveBeenCalled();
  });
});
