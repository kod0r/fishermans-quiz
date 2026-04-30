import { useState, useEffect, useCallback, useRef } from 'react';
import type { PersistenceAdapter } from '@/utils/persistence';
import { localStorageAdapter } from '@/utils/persistence';

export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  adapter: PersistenceAdapter<T> = localStorageAdapter as PersistenceAdapter<T>,
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  const [state, setState] = useState<T>(() => {
    const loaded = adapter.load(key);
    return loaded !== null ? loaded : defaultValue;
  });
  const clearedRef = useRef(false);

  useEffect(() => {
    if (clearedRef.current) {
      clearedRef.current = false;
      return;
    }
    adapter.save(key, state);
  }, [key, state, adapter]);

  const clear = useCallback(() => {
    clearedRef.current = true;
    setState(defaultValue);
    adapter.clear(key);
  }, [key, adapter, defaultValue]);

  return [state, setState, clear];
}

export function usePersistentStatePerMode<T>(
  key: string,
  defaultValue: T,
  adapter: PersistenceAdapter<T> = localStorageAdapter as PersistenceAdapter<T>,
  shouldSave?: (state: T) => boolean,
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  const [state, setState] = useState<T>(() => {
    const loaded = adapter.load(key);
    return loaded !== null ? loaded : defaultValue;
  });
  const clearedRef = useRef(false);
  const adapterRef = useRef(adapter);

  useEffect(() => {
    adapterRef.current = adapter;
  });

  useEffect(() => {
    const loaded = adapterRef.current.load(key);
    setState(loaded !== null ? loaded : defaultValue);
    clearedRef.current = false;
  }, [key, defaultValue]);

  useEffect(() => {
    if (clearedRef.current) {
      clearedRef.current = false;
      return;
    }
    if (shouldSave && !shouldSave(state)) {
      return;
    }
    adapterRef.current.save(key, state);
  }, [key, state, shouldSave]);

  const clear = useCallback(() => {
    clearedRef.current = true;
    setState(defaultValue);
    adapterRef.current.clear(key);
  }, [key, defaultValue]);

  return [state, setState, clear];
}
