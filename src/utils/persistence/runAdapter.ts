import type { PersistenceAdapter } from './types';
import { localStorageAdapter } from './localStorageAdapter';
import { QuizRunSchema } from '@/utils/quizLoader';
import type { QuizRun } from '@/types/quiz';

export function createRunAdapter(base: PersistenceAdapter<unknown> = localStorageAdapter): PersistenceAdapter<QuizRun | null> {
  return {
    load: (key) => {
      const raw = base.load(key);
      const parsed = QuizRunSchema.safeParse(raw);
      if (!parsed.success) {
        if (raw !== null) {
          console.warn('[RunAdapter] Invalid run data, resetting:', parsed.error.format());
        }
        return null;
      }
      return parsed.data;
    },
    save: (key, value) => {
      base.save(key, value);
    },
    clear: (key) => base.clear(key),
  };
}
