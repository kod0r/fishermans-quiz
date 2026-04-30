import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings } from '@/store/settings';
import { AppBackupSchema } from '@/utils/quizLoader';
import { memoryAdapter } from '@/utils/persistence/memoryAdapter';
import { createSettingsAdapter } from '@/utils/persistence/settingsAdapter';

const TEST_KEY = 'fmq:settings:v1';

describe('Backup / Settings', () => {
  beforeEach(() => {
    memoryAdapter.clear(TEST_KEY);
  });

  it('sollte backupReminderEnabled default false haben', () => {
    const { result } = renderHook(() => useSettings(createSettingsAdapter(memoryAdapter)));
    expect(result.current.backupReminderEnabled).toBe(false);
    expect(result.current.lastBackupPrompt).toBeUndefined();
  });

  it('sollte backupReminderEnabled aktivieren', () => {
    const { result } = renderHook(() => useSettings(createSettingsAdapter(memoryAdapter)));
    act(() => {
      result.current.setBackupReminderEnabled(true);
    });
    expect(result.current.backupReminderEnabled).toBe(true);
    expect((memoryAdapter.load(TEST_KEY) as { backupReminderEnabled?: boolean }).backupReminderEnabled).toBe(true);
  });

  it('sollte lastBackupPrompt setzen', () => {
    const { result } = renderHook(() => useSettings(createSettingsAdapter(memoryAdapter)));
    const now = new Date().toISOString();
    act(() => {
      result.current.setLastBackupPrompt(now);
    });
    expect(result.current.lastBackupPrompt).toBe(now);
  });

  it('sollte korrupte Settings mit Defaults ersetzen', () => {
    memoryAdapter.save(TEST_KEY, { backupReminderEnabled: 'ja' });
    const { result } = renderHook(() => useSettings(createSettingsAdapter(memoryAdapter)));
    expect(result.current.backupReminderEnabled).toBe(false);
  });
});

describe('AppBackupSchema', () => {
  it('sollte ein gültiges Backup akzeptieren', () => {
    const backup = {
      version: '1',
      exportedAt: new Date().toISOString(),
      settings: { gameMode: 'arcade', backupReminderEnabled: true },
      metaArcade: {
        fragen: {},
        stats: { totalRuns: 0, totalQuestionsAnswered: 0, totalCorrect: 0, totalIncorrect: 0, bestStreak: 0, currentStreak: 0 },
        topics: {},
      },
      metaHardcore: {
        fragen: {},
        stats: { totalRuns: 0, totalQuestionsAnswered: 0, totalCorrect: 0, totalIncorrect: 0, bestStreak: 0, currentStreak: 0 },
        topics: {},
      },
      topicFiles: { 'Biologie': 'biologie.json' },
      favorites: ['f1', 'f2'],
      notes: { f1: 'Notiz' },
      history: [
        { id: 'h1', timestamp: new Date().toISOString(), topics: ['Biologie'], score: 5, total: 10, duration: 60, mode: 'arcade' },
      ],
    };
    const parsed = AppBackupSchema.safeParse(backup);
    expect(parsed.success).toBe(true);
  });

  it('sollte ein ungültiges Backup ablehnen', () => {
    const backup = {
      version: '2',
      exportedAt: 'now',
      settings: { gameMode: 'invalid' },
      metaArcade: {},
      metaHardcore: {},
      favorites: [],
      notes: {},
      srs: {},
      history: [],
    };
    const parsed = AppBackupSchema.safeParse(backup);
    expect(parsed.success).toBe(false);
  });

  it('sollte optionale settings-Felder akzeptieren', () => {
    const backup = {
      version: '1',
      exportedAt: new Date().toISOString(),
      settings: { gameMode: 'hardcore' },
      metaArcade: {
        fragen: {},
        stats: { totalRuns: 0, totalQuestionsAnswered: 0, totalCorrect: 0, totalIncorrect: 0, bestStreak: 0, currentStreak: 0 },
        topics: {},
      },
      metaHardcore: {
        fragen: {},
        stats: { totalRuns: 0, totalQuestionsAnswered: 0, totalCorrect: 0, totalIncorrect: 0, bestStreak: 0, currentStreak: 0 },
        topics: {},
      },
      topicFiles: {},
      favorites: [],
      notes: {},
      srs: {},
      history: [],
    };
    const parsed = AppBackupSchema.safeParse(backup);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.settings.backupReminderEnabled).toBeUndefined();
    }
  });
});
