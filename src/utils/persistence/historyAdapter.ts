import type { PersistenceAdapter } from './types';
import { localStorageAdapter } from './localStorageAdapter';
// HistoryEntry type used implicitly via mapped entries

const MAX_ENTRIES = 500;

export function createHistoryAdapter(base: PersistenceAdapter = localStorageAdapter): PersistenceAdapter {
  return {
    load: (key) => {
      const raw = base.load(key);
      if (!Array.isArray(raw)) return [];
      const migrated = raw.map((entry: unknown) => {
        const e = entry as Record<string, unknown>;
        return {
          ...e,
          topics: ((e.topics ?? e.bereiche ?? []) as string[]),
        };
      });
      return migrated.slice(0, MAX_ENTRIES);
    },
    save: base.save,
    clear: base.clear,
  };
}

export const historyAdapter = createHistoryAdapter();
