import type { PersistenceAdapter } from './types';
import { localStorageAdapter } from './localStorageAdapter';
import { SRSMetaSchema } from '@/utils/quizLoader';
import type { SRSMeta } from '@/types/quiz';

export function createSRSAdapter(base: PersistenceAdapter = localStorageAdapter): PersistenceAdapter {
  return {
    load: (key) => {
      const raw = base.load(key);
      if (typeof raw !== 'object' || raw === null) return {};
      const result: Record<string, SRSMeta> = {};
      for (const [k, value] of Object.entries(raw)) {
        const parsed = SRSMetaSchema.safeParse(value);
        if (parsed.success) {
          result[k] = parsed.data;
        } else {
          console.warn('[SRS] Invalid entry for', k, parsed.error.format());
        }
      }
      return result;
    },
    save: base.save,
    clear: base.clear,
  };
}

export const srsAdapter = createSRSAdapter();
