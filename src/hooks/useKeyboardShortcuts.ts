import { useLayoutEffect, useCallback } from 'react';

export interface KeyboardShortcutsOptions {
  onAnswer?: (letter: 'A' | 'B' | 'C') => void;
  onPrev?: () => void;
  onNext?: () => void;
  onToggleFavorite?: () => void;
  onSpace?: () => void;
  onOpenCheatSheet?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

// Keys considered text input — skip shortcuts when focused
const INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);
const EDITABLE_ATTR = 'contenteditable';

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions) {
  const {
    onAnswer,
    onPrev,
    onNext,
    onToggleFavorite,
    onSpace,
    onOpenCheatSheet,
    onEscape,
    enabled = true,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if focus is on a text input or contenteditable element
      const target = event.target;
      if (target instanceof Element) {
        const tag = target.tagName;
        if (INPUT_TAGS.has(tag) || target.getAttribute(EDITABLE_ATTR) === 'true') {
          return;
        }
      }

      // Prevent browser defaults only when handler is registered
      if (event.key === ' ' && onSpace) {
        event.preventDefault();
      }
      if (event.key === 'ArrowLeft' && onPrev) {
        event.preventDefault();
      }
      if (event.key === 'ArrowRight' && onNext) {
        event.preventDefault();
      }

      switch (event.key) {
        case '1':
          onAnswer?.('A');
          break;
        case '2':
          onAnswer?.('B');
          break;
        case '3':
          onAnswer?.('C');
          break;
        case 'ArrowLeft':
          onPrev?.();
          break;
        case 'ArrowRight':
          onNext?.();
          break;
        case ' ':
          onSpace?.();
          break;
        case 'f':
        case 'F':
          onToggleFavorite?.();
          break;
        case '?':
          onOpenCheatSheet?.();
          break;
        case 'Escape':
          onEscape?.();
          break;
        // no default
      }
    },
    [enabled, onAnswer, onPrev, onNext, onToggleFavorite, onSpace, onOpenCheatSheet, onEscape]
  );

  useLayoutEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
