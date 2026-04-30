import type { PersistenceAdapter } from './types';

export const localStorageAdapter: PersistenceAdapter = {
  load: (key) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore parse errors
    }
    return null;
  },
  save: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  clear: (key) => {
    localStorage.removeItem(key);
  },
};
