import { useState, useCallback, useEffect } from 'react';
import type { HistoryEntry, GameMode } from '@/types/quiz';
import { HistoryStorage } from '@/utils/storage';

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => HistoryStorage.load());

  const addEntry = useCallback((params: {
    bereiche: string[];
    score: number;
    total: number;
    duration: number;
    mode: GameMode;
  }) => {
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...params,
    };
    setEntries(prev => [entry, ...prev].slice(0, 500));
  }, []);

  const clearHistory = useCallback(() => {
    setEntries([]);
  }, []);

  const importHistory = useCallback((data: HistoryEntry[]) => {
    setEntries(data);
  }, []);

  // Persistiere History bei Änderungen
  useEffect(() => {
    try {
      HistoryStorage.save(entries);
    } catch {
      // Silently ignore storage errors to avoid blocking UI updates
    }
  }, [entries]);

  return {
    entries,
    addEntry,
    clearHistory,
    importHistory,
  };
}
