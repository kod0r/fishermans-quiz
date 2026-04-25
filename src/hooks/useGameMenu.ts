import { useState, useCallback, useEffect, useRef } from 'react';
import type { MenuPageId } from '@/components/game-menu/menuConfig';

export type { MenuPageId } from '@/components/game-menu/menuConfig';

interface GameMenuState {
  isOpen: boolean;
  stack: MenuPageId[];
  direction: 'forward' | 'back';
  focusedIndex: number;
  itemCount: number;
}

export function useGameMenu() {
  const [state, setState] = useState<GameMenuState>({
    isOpen: false,
    stack: ['root'],
    direction: 'forward',
    focusedIndex: 0,
    itemCount: 0,
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

  const openTo = useCallback((page: MenuPageId) => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      stack: [page],
      direction: 'forward',
      focusedIndex: 0,
    }));
  }, []);

  const resetFocus = useCallback(() => {
    setState(prev => ({ ...prev, focusedIndex: 0 }));
  }, []);

  const setFocusedIndex = useCallback((index: number) => {
    setState(prev => ({ ...prev, focusedIndex: index }));
  }, []);

  const registerItemCount = useCallback((count: number) => {
    setState(prev => ({
      ...prev,
      itemCount: count,
      focusedIndex: Math.min(prev.focusedIndex, Math.max(0, count - 1)),
    }));
  }, []);

  const currentPage = state.stack[state.stack.length - 1];

  // Refs to avoid stale closures in the global keydown listener
  const focusedIndexRef = useRef(state.focusedIndex);
  useEffect(() => {
    focusedIndexRef.current = state.focusedIndex;
  }, [state.focusedIndex]);

  const onActivateRef = useRef<((index: number) => void) | null>(null);
  const registerOnActivate = useCallback((cb: ((index: number) => void) | null) => {
    onActivateRef.current = cb;
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!state.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setState(prev => ({
            ...prev,
            focusedIndex: Math.min(prev.focusedIndex + 1, Math.max(0, prev.itemCount - 1)),
          }));
          return;
        case 'ArrowUp':
          e.preventDefault();
          setState(prev => ({
            ...prev,
            focusedIndex: Math.max(prev.focusedIndex - 1, 0),
          }));
          return;
        case 'Home':
          e.preventDefault();
          setState(prev => ({ ...prev, focusedIndex: 0 }));
          return;
        case 'End':
          e.preventDefault();
          setState(prev => ({
            ...prev,
            focusedIndex: Math.max(0, prev.itemCount - 1),
          }));
          return;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onActivateRef.current?.(focusedIndexRef.current);
          return;
        case 'Escape':
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
    openTo,
    push,
    pop,
    resetFocus,
    setFocusedIndex,
    registerItemCount,
    registerOnActivate,
  };
}
