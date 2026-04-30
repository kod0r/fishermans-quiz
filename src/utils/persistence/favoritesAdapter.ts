import type { PersistenceAdapter } from './types';
import { localStorageAdapter } from './localStorageAdapter';
import { z } from 'zod';

const FavoritesSchema = z.array(z.string());

export function createFavoritesAdapter(base: PersistenceAdapter<unknown> = localStorageAdapter): PersistenceAdapter<string[]> {
  return {
    load: (key) => {
      const raw = base.load(key);
      const parsed = FavoritesSchema.safeParse(raw);
      if (!parsed.success) {
        if (raw !== null) {
          console.warn('[FavoritesAdapter] Invalid favorites data, resetting:', parsed.error.format());
        }
        return [];
      }
      return parsed.data;
    },
    save: (key, value) => base.save(key, value),
    clear: (key) => base.clear(key),
  };
}

export const favoritesAdapter = createFavoritesAdapter();
