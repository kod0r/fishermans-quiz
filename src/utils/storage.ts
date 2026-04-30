import type { GameMode, HistoryEntry } from '@/types/quiz';
import { AppSettingsSchema, QuizRunSchema, MetaProgressionSchema, HistoryEntrySchema, SRSMetaSchema } from '@/utils/quizLoader';
import type { SRSMeta } from '@/types/quiz';
import { z } from 'zod';

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
      const storageErr = new StorageError(
        `Speicher voll (${key}): Fortschritt konnte nicht gespeichert werden.`,
        err,
      );
      window.dispatchEvent(new CustomEvent('storage:error', { detail: { key, error: err.message } }));
      throw storageErr;
    }
    window.dispatchEvent(new CustomEvent('storage:error', { detail: { key, error: err instanceof Error ? err.message : String(err) } }));
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
  load: () => {
    const raw = loadJson<unknown>(STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS);
    const parsed = AppSettingsSchema.safeParse(raw);
    if (!parsed.success) {
      console.warn('[Storage] Ungültige Settings im localStorage, verwende Defaults:', parsed.error.format());
      return DEFAULT_SETTINGS;
    }
    return parsed.data;
  },
  save: (settings: unknown) => saveJson(STORAGE_KEY_SETTINGS, settings),
  clear: () => removeKey(STORAGE_KEY_SETTINGS),
};

// ── QuizRun (mode-specific) ──
export const RunStorage = {
  load: (mode: GameMode) => {
    const raw = loadJson<unknown>(runKey(mode), null);
    const parsed = QuizRunSchema.safeParse(raw);
    if (!parsed.success) {
      if (raw !== null) console.warn('[Storage] Invalid run data, resetting:', parsed.error.format());
      return null;
    }
    return parsed.data;
  },
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
    arcadeRunsCompleted: 0,
  },
  topics: {},
  arcadeStars: {},
  bestArcadeScore: {},
};

export const MetaStorage = {
  load: (mode: GameMode) => {
    const raw = loadJson<unknown>(metaKey(mode), EMPTY_META);
    const parsed = MetaProgressionSchema.safeParse(raw);
    if (!parsed.success) {
      if (raw !== null) console.warn('[Storage] Invalid meta data, using defaults:', parsed.error.format());
      return EMPTY_META;
    }
    return parsed.data;
  },
  save: (mode: GameMode, meta: unknown) => saveJson(metaKey(mode), meta),
  clear: (mode: GameMode) => removeKey(metaKey(mode)),
};

// ── Favorites (global, nicht modus-spezifisch) ──
const FAVORITES_KEY = 'fmq:favorites:v1';
const FavoritesSchema = z.array(z.string());

export const FavoritesStorage = {
  load: (): string[] => {
    const raw = loadJson<unknown>(FAVORITES_KEY, []);
    const parsed = FavoritesSchema.safeParse(raw);
    if (!parsed.success) {
      if (raw !== null) console.warn('[Storage] Invalid favorites data, resetting:', parsed.error.format());
      return [];
    }
    return parsed.data;
  },
  save: (favorites: string[]) => saveJson(FAVORITES_KEY, favorites),
  clear: () => removeKey(FAVORITES_KEY),
};

// ── Notes (global, nicht modus-spezifisch) ──
const NOTES_KEY = 'fmq:notes:v1';
const NotesSchema = z.record(z.string(), z.string());

export const NotesStorage = {
  load: (): Record<string, string> => {
    const raw = loadJson<unknown>(NOTES_KEY, {});
    const parsed = NotesSchema.safeParse(raw);
    if (!parsed.success) {
      if (raw !== null) console.warn('[Storage] Invalid notes data, resetting:', parsed.error.format());
      return {};
    }
    return parsed.data;
  },
  save: (notes: Record<string, string>) => saveJson(NOTES_KEY, notes),
  clear: () => removeKey(NOTES_KEY),
};

// ── History (global, nicht modus-spezifisch) ──
const HISTORY_KEY = 'fmq:history:v1';

export const HistoryStorage = {
  load: (): HistoryEntry[] => {
    const raw = loadJson<unknown>(HISTORY_KEY, []);
    if (!Array.isArray(raw)) {
      if (raw !== null) console.warn('[Storage] Invalid history data (not an array), resetting');
      return [];
    }
    const valid: HistoryEntry[] = [];
    for (const entry of raw) {
      const parsed = HistoryEntrySchema.safeParse(entry);
      if (parsed.success) {
        valid.push(parsed.data);
      } else {
        console.warn('[Storage] Invalid history entry skipped:', parsed.error.format());
      }
    }
    return valid;
  },
  save: (entries: HistoryEntry[]) => saveJson(HISTORY_KEY, entries),
  clear: () => removeKey(HISTORY_KEY),
};

// ── SRS (global, nicht modus-spezifisch) ──
const SRS_KEY = 'fmq:meta:srs:v1';

export const SRSStorage = {
  load: (): Record<string, SRSMeta> => {
    const raw = loadJson<unknown>(SRS_KEY, {});
    if (typeof raw !== 'object' || raw === null) {
      if (raw !== null) console.warn('[Storage] Invalid SRS data, resetting');
      return {};
    }
    const result: Record<string, SRSMeta> = {};
    for (const [k, value] of Object.entries(raw)) {
      const parsed = SRSMetaSchema.safeParse(value);
      if (parsed.success) {
        result[k] = parsed.data;
      } else {
        console.warn('[Storage] Invalid SRS entry skipped for', k, parsed.error.format());
      }
    }
    return result;
  },
  save: (data: Record<string, SRSMeta>) => saveJson(SRS_KEY, data),
  clear: () => removeKey(SRS_KEY),
};
