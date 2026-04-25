import { useState, useCallback, useEffect, useMemo } from 'react';
import type { FrageMeta, BereichMeta, MetaProgression, GameMode } from '@/types/quiz';
import { MetaStorage } from '@/utils/storage';

const EMPTY: MetaProgression = Object.freeze({
  fragen: {},
  stats: Object.freeze({
    totalRuns: 0,
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    bestStreak: 0,
    currentStreak: 0,
  }),
  bereiche: {},
});

export function useMetaProgress(gameMode: GameMode) {
  const [meta, setMeta] = useState<MetaProgression>(() => {
    const loaded = MetaStorage.load(gameMode);
    return { ...loaded, bereiche: loaded.bereiche ?? {} };
  });

  // Wenn sich der Modus ändert → neu laden
  useEffect(() => {
    const loaded = MetaStorage.load(gameMode);
    setMeta({ ...loaded, bereiche: loaded.bereiche ?? {} });
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

      return { ...prev, fragen: { ...prev.fragen, [frageId]: frageMeta }, stats };
    });
  }, []);

  // Neuer Durchlauf gestartet
  const recordRunStart = useCallback(() => {
    setMeta(prev => {
      return { ...prev, stats: { ...prev.stats, totalRuns: prev.stats.totalRuns + 1 } };
    });
  }, []);

  // Bereich-Result speichern (Hardcore)
  const recordBereichResult = useCallback((bereichId: string, passed: boolean) => {
    setMeta(prev => {
      const existing = prev.bereiche[bereichId];
      const consecutivePasses = passed ? (existing?.consecutivePasses || 0) + 1 : 0;
      const bereichMeta: BereichMeta = {
        passed,
        consecutivePasses,
        mastered: consecutivePasses >= 3,
        lastAttempt: new Date().toISOString(),
      };
      return {
        ...prev,
        bereiche: { ...prev.bereiche, [bereichId]: bereichMeta },
      };
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

  const bestandeneBereicheHardcore = useMemo(() =>
    Object.values(meta.bereiche ?? {}).filter(b => b.passed).length,
    [meta.bereiche]
  );
  const gemeisterteBereicheHardcore = useMemo(() =>
    Object.values(meta.bereiche ?? {}).filter(b => b.mastered).length,
    [meta.bereiche]
  );

  const getFrageMeta = useCallback((frageId: string): FrageMeta | undefined => {
    return meta.fragen[frageId];
  }, [meta]);

  return {
    meta,
    bestandeneBereicheHardcore,
    gemeisterteBereicheHardcore,
    recordAnswer,
    recordRunStart,
    recordBereichResult,
    reset,
    getFrageMeta,
    importData,
  };
}
