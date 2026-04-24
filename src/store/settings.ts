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
  };
}
