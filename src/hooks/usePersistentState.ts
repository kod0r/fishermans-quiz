import { useState, useEffect, useCallback, useRef } from 'react';
import type { PersistenceAdapter } from '@/utils/persistence';
import { localStorageAdapter } from '@/utils/persistence';

export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  adapter: PersistenceAdapter = localStorageAdapter,
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  const [state, setState] = useState<T>(() => {
    const loaded = adapter.load(key);
    return loaded !== null ? (loaded as T) : defaultValue;
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
