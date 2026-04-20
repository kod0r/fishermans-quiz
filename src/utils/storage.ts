const STORAGE_KEY_RUN = 'fmq:run:v2';
const STORAGE_KEY_META = 'fmq:meta:v2';

export function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    console.warn(`[Storage] Failed to load ${key}`);
  }
  return fallback;
}

export function saveJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`[Storage] Failed to save ${key}`);
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// ── QuizRun ──
export const RunStorage = {
  load: () => loadJson(STORAGE_KEY_RUN, null),
  save: (run: unknown) => saveJson(STORAGE_KEY_RUN, run),
  clear: () => removeKey(STORAGE_KEY_RUN),
};

// ── MetaProgression ──
const EMPTY_META = {
  fragen: {},
  stats: {
    totalRuns: 0,
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    bestStreak: 0,
    currentStreak: 0,
  },
};

export const MetaStorage = {
  load: () => loadJson(STORAGE_KEY_META, EMPTY_META),
  save: (meta: unknown) => saveJson(STORAGE_KEY_META, meta),
  clear: () => removeKey(STORAGE_KEY_META),
};
