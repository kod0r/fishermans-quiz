import { useCallback } from 'react';
import type { HistoryEntry, GameMode } from '@/types/quiz';
import { usePersistentState } from '@/hooks/usePersistentState';
import { createHistoryAdapter } from '@/utils/persistence/historyAdapter';
import type { PersistenceAdapter } from '@/utils/persistence';

const STORAGE_KEY = 'fmq:history:v1';
const MAX_ENTRIES = 500;
const defaultAdapter = createHistoryAdapter();

export function useHistory(adapter: PersistenceAdapter<HistoryEntry[]> = defaultAdapter) {
  const [entries, setEntries] = usePersistentState<HistoryEntry[]>(
    STORAGE_KEY,
    [],
    adapter,
  );

  const addEntry = useCallback((params: {
    topics: string[];
    score: number;
    total: number;
    duration: number;
    mode: GameMode;
  }) => {
    const entry: HistoryEntry = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
      timestamp: new Date().toISOString(),
      ...params,
    };
    setEntries(prev => [entry, ...prev].slice(0, MAX_ENTRIES));
  }, [setEntries]);

  const clearHistory = useCallback(() => {
    setEntries([]);
  }, [setEntries]);

  const importHistory = useCallback((data: HistoryEntry[]) => {
    setEntries(data.slice(0, MAX_ENTRIES));
  }, [setEntries]);

  return {
    entries,
    addEntry,
    clearHistory,
    importHistory,
  };
}
