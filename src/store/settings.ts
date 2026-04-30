import { useCallback, useEffect } from 'react';
import type { AppSettings, GameMode } from '@/types/quiz';
import { usePersistentState } from '@/hooks/usePersistentState';
import { createSettingsAdapter } from '@/utils/persistence/settingsAdapter';
import type { PersistenceAdapter } from '@/utils/persistence';
import { migrateLegacyStorage } from '@/utils/storage';

const STORAGE_KEY_SETTINGS = 'fmq:settings:v1';
const DEFAULT_SETTINGS: AppSettings = { gameMode: 'arcade' };
const defaultAdapter = createSettingsAdapter();

export function useSettings(adapter: PersistenceAdapter<AppSettings> = defaultAdapter) {
  // Einmalig beim App-Start: Legacy-Storage migrieren
  useEffect(() => {
    migrateLegacyStorage();
  }, []);

  const [settings, setSettings] = usePersistentState(STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS, adapter);

  const setGameMode = useCallback((mode: GameMode) => {
    setSettings(prev => ({ ...prev, gameMode: mode }));
  }, [setSettings]);

  const setBackupReminderEnabled = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, backupReminderEnabled: enabled }));
  }, [setSettings]);

  const setLastBackupPrompt = useCallback((date: string) => {
    setSettings(prev => ({ ...prev, lastBackupPrompt: date }));
  }, [setSettings]);

  const setShuffleAnswers = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, shuffleAnswers: enabled }));
  }, [setSettings]);

  const importSettings = useCallback((data: AppSettings) => {
    setSettings(data);
  }, [setSettings]);

  return {
    settings,
    gameMode: settings.gameMode,
    setGameMode,
    backupReminderEnabled: settings.backupReminderEnabled ?? false,
    lastBackupPrompt: settings.lastBackupPrompt,
    setBackupReminderEnabled,
    setLastBackupPrompt,
    setShuffleAnswers,
    importSettings,
    shuffleAnswers: settings.shuffleAnswers ?? false,
  };
}
