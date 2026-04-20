import type { GameMode } from '@/types/quiz';

// ── Legacy Keys (v2, pre-mode-split) ──
const LEGACY_KEY_RUN = 'fmq:run:v2';
const LEGACY_KEY_META = 'fmq:meta:v2';

// ── Settings ──
const STORAGE_KEY_SETTINGS = 'fmq:settings:v1';

// ── Mode-specific Keys ──
const runKey = (mode: GameMode) => `fmq:run:${mode}:v2`;
const metaKey = (mode: GameMode) => `fmq:meta:${mode}:v2`;

// ── Generic helpers ──
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

// ── Migration: Legacy v2 → Arcade mode ──
// Wird einmalig beim App-Start ausgeführt (in useSettings/useQuiz)
let migrationDone = false;
export function migrateLegacyStorage(): void {
  if (migrationDone) return;
  migrationDone = true;

  try {
    const legacyRun = localStorage.getItem(LEGACY_KEY_RUN);
    if (legacyRun) {
      localStorage.setItem(runKey('arcade'), legacyRun);
      localStorage.removeItem(LEGACY_KEY_RUN);
      console.log('[Storage] Migrated legacy run → arcade');
    }

    const legacyMeta = localStorage.getItem(LEGACY_KEY_META);
    if (legacyMeta) {
      localStorage.setItem(metaKey('arcade'), legacyMeta);
      localStorage.removeItem(LEGACY_KEY_META);
      console.log('[Storage] Migrated legacy meta → arcade');
    }
  } catch {
    console.warn('[Storage] Migration failed');
  }
}

// ── Settings ──
const DEFAULT_SETTINGS = {
  gameMode: 'arcade' as GameMode,
};

export const SettingsStorage = {
  load: () => loadJson(STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS),
  save: (settings: unknown) => saveJson(STORAGE_KEY_SETTINGS, settings),
  clear: () => removeKey(STORAGE_KEY_SETTINGS),
};

// ── QuizRun (mode-specific) ──
export const RunStorage = {
  load: (mode: GameMode) => loadJson(runKey(mode), null),
  save: (mode: GameMode, run: unknown) => saveJson(runKey(mode), run),
  clear: (mode: GameMode) => removeKey(runKey(mode)),
};

// ── MetaProgression (mode-specific) ──
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
  load: (mode: GameMode) => loadJson(metaKey(mode), EMPTY_META),
  save: (mode: GameMode, meta: unknown) => saveJson(metaKey(mode), meta),
  clear: (mode: GameMode) => removeKey(metaKey(mode)),
};
