import type { PersistenceAdapter } from './types';
import { localStorageAdapter } from './localStorageAdapter';
import type { MetaProgression } from '@/types/quiz';

export function createMetaAdapter(base: PersistenceAdapter = localStorageAdapter): PersistenceAdapter {
  return {
    load: (key) => {
      const raw = base.load(key);
      if (typeof raw !== 'object' || raw === null) return null;
      return { ...(raw as MetaProgression), topics: (raw as MetaProgression).topics ?? {} };
    },
    save: base.save,
    clear: base.clear,
  };
}

export const metaAdapter = createMetaAdapter();
