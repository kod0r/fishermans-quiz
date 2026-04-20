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
    setSettings(prev => {
      const next = { ...prev, gameMode: mode };
      SettingsStorage.save(next);
      return next;
    });
  }, []);

  return {
    settings,
    gameMode: settings.gameMode,
    setGameMode,
  };
}
