import type { PersistenceAdapter } from './types';
import { localStorageAdapter } from './localStorageAdapter';
import { MetaProgressionSchema } from '@/utils/quizLoader';
import type { MetaProgression } from '@/types/quiz';

const EMPTY_META: MetaProgression = Object.freeze({
  fragen: Object.freeze({}),
  stats: Object.freeze({
    totalRuns: 0,
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    bestStreak: 0,
    currentStreak: 0,
    arcadeRunsCompleted: 0,
  }),
  topics: Object.freeze({}),
  arcadeStars: Object.freeze({}),
  bestArcadeScore: Object.freeze({}),
});

export function createMetaAdapter(base: PersistenceAdapter<unknown> = localStorageAdapter): PersistenceAdapter<MetaProgression> {
  return {
    load: (key) => {
      const raw = base.load(key);
      const parsed = MetaProgressionSchema.safeParse(raw);
      if (!parsed.success) {
        if (raw !== null) {
          console.warn('[MetaAdapter] Invalid meta data, using defaults:', parsed.error.format());
        }
        return { ...EMPTY_META };
      }
      return parsed.data;
    },
    save: (key, value) => base.save(key, value),
    clear: (key) => base.clear(key),
  };
}

export const metaAdapter = createMetaAdapter();
