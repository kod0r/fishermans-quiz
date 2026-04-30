import type { PersistenceAdapter } from './types';
import { localStorageAdapter } from './localStorageAdapter';
import { SRSMetaSchema } from '@/utils/quizLoader';
import type { SRSMeta } from '@/types/quiz';

export function createSRSAdapter(base: PersistenceAdapter<unknown> = localStorageAdapter): PersistenceAdapter<Record<string, SRSMeta>> {
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
          console.warn('[SRSAdapter] Invalid entry for', k, parsed.error.format());
        }
      }
      return result;
    },
    save: (key, value) => base.save(key, value),
    clear: (key) => base.clear(key),
  };
}

export const srsAdapter = createSRSAdapter();
