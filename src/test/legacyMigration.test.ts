import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('migrateLegacyStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sollte Legacy-Run in Arcade-Slot migrieren', async () => {
    vi.resetModules();
    const legacyRun = {
      frageIds: ['1', '2'],
      antworten: {},
      topics: ['Biologie'],
      aktuellerIndex: 0,
      isActive: true,
    };
    localStorage.setItem('fmq:run:v2', JSON.stringify(legacyRun));

    const { migrateLegacyStorage } = await import('@/utils/persistence/legacyMigration');
    migrateLegacyStorage();

    const migrated = localStorage.getItem('fmq:run:arcade:v2');
    expect(migrated).toBeTruthy();
    expect(JSON.parse(migrated!).frageIds).toEqual(['1', '2']);
    expect(localStorage.getItem('fmq:run:v2')).toBeNull();
  });

  it('sollte Legacy-Meta in Arcade-Slot migrieren', async () => {
    vi.resetModules();
    const legacyMeta = { fragen: {}, stats: { totalRuns: 5 } };
    localStorage.setItem('fmq:meta:v2', JSON.stringify(legacyMeta));

    const { migrateLegacyStorage } = await import('@/utils/persistence/legacyMigration');
    migrateLegacyStorage();

    const migrated = localStorage.getItem('fmq:meta:arcade:v2');
    expect(migrated).toBeTruthy();
    expect(JSON.parse(migrated!).stats.totalRuns).toBe(5);
    expect(localStorage.getItem('fmq:meta:v2')).toBeNull();
  });

  it('sollte Migration nur einmal ausführen', async () => {
    vi.resetModules();
    localStorage.setItem('fmq:run:v2', JSON.stringify({ test: true }));

    const { migrateLegacyStorage } = await import('@/utils/persistence/legacyMigration');
    migrateLegacyStorage();
    migrateLegacyStorage(); // Zweiter Aufruf sollte nichts tun

    expect(console.log).toHaveBeenCalledTimes(1);
  });
});
