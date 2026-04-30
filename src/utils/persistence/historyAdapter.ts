import type { PersistenceAdapter } from './types';
import { localStorageAdapter } from './localStorageAdapter';
import { HistoryEntrySchema } from '@/utils/quizLoader';
import type { HistoryEntry } from '@/types/quiz';

const MAX_ENTRIES = 500;

export function createHistoryAdapter(base: PersistenceAdapter<unknown> = localStorageAdapter): PersistenceAdapter<HistoryEntry[]> {
  return {
    load: (key) => {
      const raw = base.load(key);
      if (!Array.isArray(raw)) return [];
      const valid: HistoryEntry[] = [];
      for (const entry of raw) {
        const parsed = HistoryEntrySchema.safeParse(entry);
        if (parsed.success) {
          valid.push(parsed.data);
        } else {
          console.warn('[HistoryAdapter] Invalid entry skipped:', parsed.error.format());
        }
      }
      return valid.slice(0, MAX_ENTRIES);
    },
    save: (key, value) => base.save(key, value),
    clear: (key) => base.clear(key),
  };
}

export const historyAdapter = createHistoryAdapter();
