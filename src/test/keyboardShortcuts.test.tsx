import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import React from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure no lingering event listeners
    window.removeEventListener('keydown', () => {});
  });

  it('should call onAnswer with A when "1" is pressed', () => {
    const onAnswer = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onAnswer }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    });

    expect(onAnswer).toHaveBeenCalledWith('A');
    expect(onAnswer).toHaveBeenCalledOnce();
  });

  it('should call onAnswer with B when "2" is pressed', () => {
    const onAnswer = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onAnswer }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '2' }));
    });

    expect(onAnswer).toHaveBeenCalledWith('B');
  });

  it('should call onAnswer with C when "3" is pressed', () => {
    const onAnswer = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onAnswer }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '3' }));
    });

    expect(onAnswer).toHaveBeenCalledWith('C');
  });

  it('should call onPrev when ArrowLeft is pressed', () => {
    const onPrev = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onPrev }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    });

    expect(onPrev).toHaveBeenCalledOnce();
  });

  it('should call onNext when ArrowRight is pressed', () => {
    const onNext = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onNext }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    });

    expect(onNext).toHaveBeenCalledOnce();
  });

  it('should call onSpace when Space is pressed', () => {
    const onSpace = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onSpace }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    });

    expect(onSpace).toHaveBeenCalledOnce();
  });

  it('should call onToggleFavorite when F is pressed', () => {
    const onToggleFavorite = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onToggleFavorite }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }));
    });

    expect(onToggleFavorite).toHaveBeenCalledOnce();

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F' }));
    });

    expect(onToggleFavorite).toHaveBeenCalledTimes(2);
  });

  it('should call onOpenCheatSheet when ? is pressed', () => {
    const onOpenCheatSheet = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onOpenCheatSheet }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '?', shiftKey: true }));
    });

    expect(onOpenCheatSheet).toHaveBeenCalledOnce();
  });

  it('should call onEscape when Escape is pressed', () => {
    const onEscape = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onEscape }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(onEscape).toHaveBeenCalledOnce();
  });

  it('should ignore shortcuts when an input element is focused', () => {
    const onAnswer = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onAnswer }));

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    });

    expect(onAnswer).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('should ignore shortcuts when a textarea is focused', () => {
    const onPrev = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onPrev }));

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();

    act(() => {
      textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    });

    expect(onPrev).not.toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it('should ignore shortcuts when a contenteditable element is focused', () => {
    const onNext = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onNext }));

    const div = document.createElement('div');
    div.setAttribute('contenteditable', 'true');
    document.body.appendChild(div);
    div.focus();

    act(() => {
      div.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    });

    expect(onNext).not.toHaveBeenCalled();

    document.body.removeChild(div);
  });

  it('should not call handlers when disabled', () => {
    const onAnswer = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onAnswer, enabled: false }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    });

    expect(onAnswer).not.toHaveBeenCalled();
  });

  it('should prevent default for ArrowLeft and ArrowRight', () => {
    const preventDefault = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onPrev: () => {}, onNext: () => {} }));

    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    vi.spyOn(event, 'preventDefault').mockImplementation(preventDefault);

    act(() => {
      window.dispatchEvent(event);
    });

    expect(preventDefault).toHaveBeenCalled();
  });

  it('should NOT prevent default for Space when onSpace is not provided', () => {
    const preventDefault = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onAnswer: () => {} }));

    const event = new KeyboardEvent('keydown', { key: ' ' });
    vi.spyOn(event, 'preventDefault').mockImplementation(preventDefault);

    act(() => {
      window.dispatchEvent(event);
    });

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('should NOT prevent default for ArrowLeft when onPrev is not provided', () => {
    const preventDefault = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onAnswer: () => {} }));

    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    vi.spyOn(event, 'preventDefault').mockImplementation(preventDefault);

    act(() => {
      window.dispatchEvent(event);
    });

    expect(preventDefault).not.toHaveBeenCalled();
  });
});

/* ── Integration Tests ── */

function createTestComponent(overrides: Partial<Parameters<typeof useKeyboardShortcuts>[0]> = {}) {
  return function TestComponent() {
    const [answer, setAnswer] = useState<string | null>(null);
    const [prevCount, setPrevCount] = useState(0);
    const [nextCount, setNextCount] = useState(0);
    const [favCount, setFavCount] = useState(0);
    const [spaceCount, setSpaceCount] = useState(0);
    const [escapeCount, setEscapeCount] = useState(0);

    useKeyboardShortcuts({
      onAnswer: (l) => {
        setAnswer(l);
        overrides.onAnswer?.(l);
      },
      onPrev: () => {
        setPrevCount((c) => c + 1);
        overrides.onPrev?.();
      },
      onNext: () => {
        setNextCount((c) => c + 1);
        overrides.onNext?.();
      },
      onToggleFavorite: () => {
        setFavCount((c) => c + 1);
        overrides.onToggleFavorite?.();
      },
      onSpace: () => {
        setSpaceCount((c) => c + 1);
        overrides.onSpace?.();
      },
      onEscape: () => {
        setEscapeCount((c) => c + 1);
        overrides.onEscape?.();
      },
      enabled: overrides.enabled,
    });

    return (
      <div>
        <div data-testid="answer">{answer ?? 'none'}</div>
        <div data-testid="prev">{prevCount}</div>
        <div data-testid="next">{nextCount}</div>
        <div data-testid="fav">{favCount}</div>
        <div data-testid="space">{spaceCount}</div>
        <div data-testid="escape">{escapeCount}</div>
      </div>
    );
  };
}

describe('Keyboard shortcuts — integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.removeEventListener('keydown', () => {});
  });

  it('updates answer state when 1 is pressed', () => {
    const Test = createTestComponent();
    render(<Test />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    });

    expect(screen.getByTestId('answer')).toHaveTextContent('A');
  });

  it('increments prev count when ArrowLeft is pressed', () => {
    const Test = createTestComponent();
    render(<Test />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    });

    expect(screen.getByTestId('prev')).toHaveTextContent('1');
  });

  it('increments next count when ArrowRight is pressed', () => {
    const Test = createTestComponent();
    render(<Test />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    });

    expect(screen.getByTestId('next')).toHaveTextContent('1');
  });

  it('increments fav count when F is pressed', () => {
    const Test = createTestComponent();
    render(<Test />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }));
    });

    expect(screen.getByTestId('fav')).toHaveTextContent('1');
  });

  it('increments space count when Space is pressed', () => {
    const Test = createTestComponent();
    render(<Test />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    });

    expect(screen.getByTestId('space')).toHaveTextContent('1');
  });

  it('increments escape count when Escape is pressed', () => {
    const Test = createTestComponent();
    render(<Test />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(screen.getByTestId('escape')).toHaveTextContent('1');
  });

  it('does not trigger shortcuts when an input is focused', () => {
    const Test = createTestComponent();
    render(<Test />);

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    });

    expect(screen.getByTestId('answer')).toHaveTextContent('none');
    document.body.removeChild(input);
  });

  it('respects the enabled flag when disabled', () => {
    const Test = createTestComponent({ enabled: false });
    render(<Test />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    });

    expect(screen.getByTestId('answer')).toHaveTextContent('none');
  });
});
