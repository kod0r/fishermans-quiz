import type { PersistenceAdapter } from './types';
import { localStorageAdapter } from './localStorageAdapter';
import { z } from 'zod';

const NotesSchema = z.record(z.string(), z.string());

export function createNotesAdapter(base: PersistenceAdapter<unknown> = localStorageAdapter): PersistenceAdapter<Record<string, string>> {
  return {
    load: (key) => {
      const raw = base.load(key);
      const parsed = NotesSchema.safeParse(raw);
      if (!parsed.success) {
        if (raw !== null) {
          console.warn('[NotesAdapter] Invalid notes data, resetting:', parsed.error.format());
        }
        return {};
      }
      return parsed.data;
    },
    save: (key, value) => base.save(key, value),
    clear: (key) => base.clear(key),
  };
}

export const notesAdapter = createNotesAdapter();
