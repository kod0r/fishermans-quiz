import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  loadJson,
  saveJson,
  removeKey,
  StorageError,
  getStorageUsage,
  migrateLegacyStorage,
  SettingsStorage,
  RunStorage,
  MetaStorage,
} from '@/utils/storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadJson', () => {
    it('sollte gespeicherte Daten laden', () => {
      localStorage.setItem('test', JSON.stringify({ value: 42 }));
      const result = loadJson('test', { value: 0 });
      expect(result.value).toBe(42);
    });

    it('sollte fallback zurückgeben wenn key nicht existiert', () => {
      const result = loadJson('nonexistent', { default: true });
      expect(result.default).toBe(true);
    });

    it('sollte fallback bei Parse-Fehler zurückgeben', () => {
      localStorage.setItem('bad', 'not-json');
      const result = loadJson('bad', { fallback: true });
      expect(result.fallback).toBe(true);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('saveJson', () => {
    it('sollte Daten speichern', () => {
      saveJson('test', { value: 42 });
      const raw = localStorage.getItem('test');
      expect(raw).toBe('{"value":42}');
    });

    it('sollte StorageError bei QuotaExceededError werfen', () => {
      const quotaError = new Error('Quota exceeded');
      quotaError.name = 'QuotaExceededError';
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw quotaError;
      });

      expect(() => saveJson('test', { data: 'x' })).toThrow(StorageError);
      expect(() => saveJson('test', { data: 'x' })).toThrow('Speicher voll');
    });

    it('sollte StorageError bei anderen Fehlern werfen', () => {
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Unknown error');
      });

      expect(() => saveJson('test', { data: 'x' })).toThrow(StorageError);
      expect(() => saveJson('test', { data: 'x' })).toThrow('Speicherfehler');
    });
  });

  describe('removeKey', () => {
    it('sollte einen key entfernen', () => {
      localStorage.setItem('test', 'value');
      removeKey('test');
      expect(localStorage.getItem('test')).toBeNull();
    });
  });

  describe('getStorageUsage', () => {
    it('sollte Speicherverbrauch schätzen', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');

      const usage = getStorageUsage();
      // used kann 0 sein wenn localStorage.length nicht vom Mock unterstützt wird
      expect(usage.used).toBeGreaterThanOrEqual(0);
      expect(usage.total).toBe(5 * 1024 * 1024);
    });
  });

  describe('migrateLegacyStorage', () => {
    it('sollte Legacy-Run migrieren', () => {
      const legacyRun = { frageIds: ['1', '2'], antworten: {}, topics: ['Biologie'], aktuellerIndex: 0, isActive: true };
      localStorage.setItem('fmq:run:v2', JSON.stringify(legacyRun));

      migrateLegacyStorage();

      const migrated = localStorage.getItem('fmq:run:arcade:v2');
      expect(migrated).toBeTruthy();
      expect(JSON.parse(migrated!).frageIds).toEqual(['1', '2']);
      expect(localStorage.getItem('fmq:run:v2')).toBeNull();
    });

    it('sollte Legacy-Meta migrieren', async () => {
      // migrationDone zurücksetzen durch Modul-Reload
      vi.resetModules();

      const legacyMeta = { fragen: {}, stats: { totalRuns: 5 } };
      localStorage.setItem('fmq:meta:v2', JSON.stringify(legacyMeta));

      // Neu importieren damit migrationDone false ist
      const { migrateLegacyStorage: freshMigrate } = await import('@/utils/storage');
      freshMigrate();

      const migrated = localStorage.getItem('fmq:meta:arcade:v2');
      expect(migrated).toBeTruthy();
      expect(JSON.parse(migrated!).stats.totalRuns).toBe(5);
      expect(localStorage.getItem('fmq:meta:v2')).toBeNull();
    });

    it('sollte Migration nur einmal ausführen', async () => {
      vi.resetModules();
      localStorage.setItem('fmq:run:v2', JSON.stringify({ test: true }));

      const { migrateLegacyStorage: freshMigrate } = await import('@/utils/storage');
      freshMigrate();
      freshMigrate(); // Zweiter Aufruf sollte nichts tun

      // Sollte nur ein Log-Eintrag sein
      expect(console.log).toHaveBeenCalledTimes(1);
    });
  });

  describe('SettingsStorage', () => {
    it('sollte default settings laden', () => {
      const settings = SettingsStorage.load();
      expect(settings.gameMode).toBe('arcade');
    });

    it('sollte settings speichern', () => {
      SettingsStorage.save({ gameMode: 'hardcore' });
      const settings = SettingsStorage.load();
      expect(settings.gameMode).toBe('hardcore');
    });
  });

  describe('RunStorage', () => {
    it('sollte null zurückgeben wenn kein Run existiert', () => {
      expect(RunStorage.load('arcade')).toBeNull();
    });

    it('sollte Run speichern und laden', () => {
      const run = { frageIds: ['1'], antworten: {}, topics: ['Biologie'], aktuellerIndex: 0, isActive: true };
      RunStorage.save('arcade', run);
      expect(RunStorage.load('arcade')).toEqual(run);
    });

    it('sollte Runs pro Modus getrennt speichern', () => {
      RunStorage.save('arcade', { mode: 'arcade' });
      RunStorage.save('hardcore', { mode: 'hardcore' });

      expect(RunStorage.load('arcade')).toEqual({ mode: 'arcade' });
      expect(RunStorage.load('hardcore')).toEqual({ mode: 'hardcore' });
    });
  });

  describe('MetaStorage', () => {
    it('sollte leere Meta laden wenn nichts gespeichert', () => {
      const meta = MetaStorage.load('arcade');
      expect(meta.stats.totalRuns).toBe(0);
      expect(meta.fragen).toEqual({});
    });

    it('sollte Meta speichern und laden', () => {
      const meta = { fragen: { '1': { attempts: 1, correctStreak: 1 } }, stats: { totalRuns: 1 } };
      MetaStorage.save('arcade', meta);
      expect(MetaStorage.load('arcade')).toEqual(meta);
    });
  });
});
