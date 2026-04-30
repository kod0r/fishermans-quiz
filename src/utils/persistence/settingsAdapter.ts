import type { PersistenceAdapter } from './types';
import { localStorageAdapter } from './localStorageAdapter';
import { AppSettingsSchema } from '@/utils/quizLoader';
import type { AppSettings } from '@/types/quiz';

const DEFAULT_SETTINGS: AppSettings = { gameMode: 'arcade' };

export function createSettingsAdapter(base: PersistenceAdapter = localStorageAdapter): PersistenceAdapter {
  return {
    load: (key) => {
      const raw = base.load(key);
      const parsed = AppSettingsSchema.safeParse(raw);
      if (!parsed.success) {
        console.warn('[Storage] Invalid settings, using defaults:', parsed.error.format());
        return DEFAULT_SETTINGS;
      }
      return parsed.data;
    },
    save: base.save,
    clear: base.clear,
  };
}

export const settingsAdapter = createSettingsAdapter();
