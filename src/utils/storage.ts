import type { GameMode } from '@/types/quiz';

// ── Legacy Keys (v2, pre-mode-split) ──
const LEGACY_KEY_RUN = 'fmq:run:v2';
const LEGACY_KEY_META = 'fmq:meta:v2';

// ── Settings ──
const STORAGE_KEY_SETTINGS = 'fmq:settings:v1';

// ── Mode-specific Keys ──
const runKey = (mode: GameMode) => `fmq:run:${mode}:v2`;
const metaKey = (mode: GameMode) => `fmq:meta:${mode}:v2`;

// ── Storage Error ──
export class StorageError extends Error {
  readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'StorageError';
    this.cause = cause;
  }
}

// ── Generic helpers ──
export function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[Storage] Failed to load ${key}:`, err);
  }
  return fallback;
}

export function saveJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    if (err instanceof Error && err.name === 'QuotaExceededError') {
      throw new StorageError(
        `Speicher voll (${key}): Fortschritt konnte nicht gespeichert werden.`,
        err,
      );
    }
    throw new StorageError(
      `Speicherfehler (${key}): Daten konnten nicht gespeichert werden.`,
      err instanceof Error ? err : undefined,
    );
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/**
 * Schätzt den belegten localStorage-Speicher in Bytes.
 * Achtung: Nicht alle Browser geben exakte Werte zurück.
 */
export function getStorageUsage(): { used: number; total: number | null } {
  let used = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key) ?? '';
      used += key.length + value.length;
    }
  }
  // 5 MB ist die typische Grenze, aber Browser-spezifisch
  return { used, total: 5 * 1024 * 1024 };
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

// ── Favorites (global, nicht modus-spezifisch) ──
const FAVORITES_KEY = 'fmq:favorites:v1';

export const FavoritesStorage = {
  load: (): string[] => loadJson(FAVORITES_KEY, []),
  save: (favorites: string[]) => saveJson(FAVORITES_KEY, favorites),
  clear: () => removeKey(FAVORITES_KEY),
};
