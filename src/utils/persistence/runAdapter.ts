import type { PersistenceAdapter } from './types';
import { localStorageAdapter } from './localStorageAdapter';
import { QuizRunSchema } from '@/utils/quizLoader';
import type { QuizRun, GameMode } from '@/types/quiz';

export function createRunAdapter(base: PersistenceAdapter<unknown> = localStorageAdapter, currentMode?: GameMode): PersistenceAdapter<QuizRun | null> {
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
      const run = value as QuizRun | null;
      if (run && currentMode) {
        if (run.gameMode && run.gameMode !== currentMode) {
          return;
        }
        base.save(key, { ...run, gameMode: currentMode });
        return;
      }
      base.save(key, value);
    },
    clear: (key) => base.clear(key),
  };
}
