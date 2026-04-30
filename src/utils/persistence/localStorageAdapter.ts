import type { PersistenceAdapter } from './types';

export const localStorageAdapter: PersistenceAdapter<unknown> = {
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
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        console.warn('[localStorageAdapter] Quota exceeded, write dropped');
      } else {
        throw err;
      }
    }
  },
  clear: (key) => {
    localStorage.removeItem(key);
  },
};
