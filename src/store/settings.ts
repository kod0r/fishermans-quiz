import { useState, useCallback, useEffect } from 'react';
import type { AppSettings, GameMode } from '@/types/quiz';
import { SettingsStorage, migrateLegacyStorage } from '@/utils/storage';

export function useSettings() {
  // Einmalig beim App-Start: Legacy-Storage migrieren
  useEffect(() => {
    migrateLegacyStorage();
  }, []);

  const [settings, setSettings] = useState<AppSettings>(() => SettingsStorage.load());

  const setGameMode = useCallback((mode: GameMode) => {
    setSettings(prev => ({ ...prev, gameMode: mode }));
  }, []);

  const setBackupReminderEnabled = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, backupReminderEnabled: enabled }));
  }, []);

  const setLastBackupPrompt = useCallback((date: string) => {
    setSettings(prev => ({ ...prev, lastBackupPrompt: date }));
  }, []);

  const setShuffleAnswers = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, shuffleAnswers: enabled }));
  }, []);

  const importSettings = useCallback((data: AppSettings) => {
    setSettings(data);
  }, []);

  // Persistiere Settings bei Änderungen
  useEffect(() => {
    try {
      SettingsStorage.save(settings);
    } catch {
      // Silently ignore storage errors to avoid blocking UI updates
    }
  }, [settings]);

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
