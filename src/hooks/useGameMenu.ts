import { useState, useCallback, useEffect } from 'react';

export type MenuPageId = 'root' | 'settings' | 'navigation' | 'run-actions';

interface GameMenuState {
  isOpen: boolean;
  stack: MenuPageId[];
  direction: 'forward' | 'back';
  focusedIndex: number;
}

export function useGameMenu() {
  const [state, setState] = useState<GameMenuState>({
    isOpen: false,
    stack: ['root'],
    direction: 'forward',
    focusedIndex: 0,
  });

  const open = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      stack: ['root'],
      direction: 'forward',
      focusedIndex: 0,
    }));
  }, []);

  const close = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      stack: ['root'],
      direction: 'back',
      focusedIndex: 0,
    }));
  }, []);

  const push = useCallback((page: MenuPageId) => {
    setState(prev => ({
      ...prev,
      stack: [...prev.stack, page],
      direction: 'forward',
      focusedIndex: 0,
    }));
  }, []);

  const pop = useCallback(() => {
    setState(prev => {
      if (prev.stack.length <= 1) {
        return { ...prev, isOpen: false, direction: 'back', focusedIndex: 0 };
      }
      return {
        ...prev,
        stack: prev.stack.slice(0, -1),
        direction: 'back',
        focusedIndex: 0,
      };
    });
  }, []);

  const currentPage = state.stack[state.stack.length - 1];

  // Keyboard navigation
  useEffect(() => {
    if (!state.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        pop();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isOpen, pop]);

  return {
    ...state,
    currentPage,
    open,
    close,
    push,
    pop,
  };
}
