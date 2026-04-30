import type { PersistenceAdapter } from './types';

const store = new Map<string, unknown>();

export const memoryAdapter: PersistenceAdapter = {
  load: (key) => store.get(key) ?? null,
  save: (key, value) => store.set(key, value),
  clear: (key) => store.delete(key),
};
