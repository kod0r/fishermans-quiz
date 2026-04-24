import { useState, useCallback, useEffect } from 'react';
import type { FrageMeta, MetaProgression, GameMode } from '@/types/quiz';
import { MetaStorage } from '@/utils/storage';

const EMPTY: MetaProgression = {
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

export function useMetaProgress(gameMode: GameMode) {
  const [meta, setMeta] = useState<MetaProgression>(() => MetaStorage.load(gameMode));

  // Wenn sich der Modus ändert → neu laden
  useEffect(() => {
    setMeta(MetaStorage.load(gameMode));
  }, [gameMode]);

  const persist = useCallback((next: MetaProgression) => {
    setMeta(next);
  }, []);

  // Einzelne Antwort verarbeiten
  const recordAnswer = useCallback((frageId: string, isCorrect: boolean) => {
    setMeta(prev => {
      const now = new Date().toISOString();
      const existing = prev.fragen[frageId];

      const frageMeta: FrageMeta = {
        attempts: (existing?.attempts || 0) + 1,
        correctStreak: isCorrect ? (existing?.correctStreak || 0) + 1 : 0,
        lastResult: isCorrect ? 'correct' : 'incorrect',
        firstSeen: existing?.firstSeen || now,
        lastAttempt: now,
      };

      const stats = { ...prev.stats };
      stats.totalQuestionsAnswered += 1;
      if (isCorrect) {
        stats.totalCorrect += 1;
        stats.currentStreak += 1;
        if (stats.currentStreak > stats.bestStreak) stats.bestStreak = stats.currentStreak;
      } else {
        stats.totalIncorrect += 1;
        stats.currentStreak = 0;
      }

      return { fragen: { ...prev.fragen, [frageId]: frageMeta }, stats };
    });
  }, []);

  // Neuer Durchlauf gestartet
  const recordRunStart = useCallback(() => {
    setMeta(prev => {
      return { ...prev, stats: { ...prev.stats, totalRuns: prev.stats.totalRuns + 1 } };
    });
  }, []);

  // Komplett zurücksetzen
  const reset = useCallback(() => {
    persist(EMPTY);
  }, [persist]);

  // Importieren
  const importData = useCallback((data: MetaProgression) => {
    persist(data);
  }, [persist]);

  // Persistiere Meta bei Änderungen
  useEffect(() => {
    try {
      MetaStorage.save(gameMode, meta);
    } catch {
      // Silently ignore storage errors to avoid blocking UI updates
    }
  }, [meta, gameMode]);

  // Abgeleitete Werte
  const meisterCount = Object.values(meta.fragen).filter(m => m.correctStreak >= 3).length;
  const lernCount = Object.values(meta.fragen).filter(m => m.attempts > 0 && m.correctStreak < 3).length;

  const getFrageMeta = useCallback((frageId: string): FrageMeta | undefined => {
    return meta.fragen[frageId];
  }, [meta]);

  return {
    meta,
    meisterCount,
    lernCount,
    recordAnswer,
    recordRunStart,
    reset,
    getFrageMeta,
    importData,
  };
}
