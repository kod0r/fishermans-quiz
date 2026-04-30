import type { PersistenceAdapter } from './types';
import { localStorageAdapter } from './localStorageAdapter';
import type { QuizRun, GameMode } from '@/types/quiz';

export function createRunAdapter(base: PersistenceAdapter = localStorageAdapter, currentMode?: GameMode): PersistenceAdapter {
  return {
    load: base.load,
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
    clear: base.clear,
  };
}

export const runAdapter = createRunAdapter();
