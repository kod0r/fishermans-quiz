import { useState, useCallback, useEffect, useMemo } from 'react';
import type { FrageMeta, TopicMeta, MetaProgression, GameMode } from '@/types/quiz';
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
    arcadeRunsCompleted: 0,
  }),
  topics: {},
  arcadeStars: {},
  bestArcadeScore: {},
});

export function useMetaProgress(gameMode: GameMode) {
  const [meta, setMeta] = useState<MetaProgression>(() => {
    const loaded = MetaStorage.load(gameMode);
    return { ...loaded, topics: loaded.topics ?? {} };
  });

  // Wenn sich der Modus ändert → neu laden
  useEffect(() => {
    const loaded = MetaStorage.load(gameMode);
    setMeta({ ...loaded, topics: loaded.topics ?? {} });
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

  // Topic-Result speichern (Hardcore)
  const recordTopicResult = useCallback((topicId: string, passed: boolean) => {
    setMeta(prev => {
      const existing = prev.topics[topicId];
      const consecutivePasses = passed ? (existing?.consecutivePasses || 0) + 1 : 0;
      const topicMeta: TopicMeta = {
        passed,
        consecutivePasses,
        mastered: consecutivePasses >= 3,
        lastAttempt: new Date().toISOString(),
      };
      return {
        ...prev,
        topics: { ...prev.topics, [topicId]: topicMeta },
      };
    });
  }, []);

  // Exam abschließen
  const recordExamResult = useCallback((scorePct: number, passed: boolean) => {
    setMeta(prev => {
      const prevExam = prev.examMeta;
      return {
        ...prev,
        examMeta: {
          attempts: (prevExam?.attempts || 0) + 1,
          passedCount: (prevExam?.passedCount || 0) + (passed ? 1 : 0),
          bestScore: Math.max(prevExam?.bestScore || 0, scorePct),
          lastScore: scorePct,
        },
      };
    });
  }, []);

  // Arcade-Run abschließen — Sterne + Highscore pro Topic
  const recordArcadeRunComplete = useCallback((topicId: string, scorePct: number) => {
    setMeta(prev => {
      const stars: 1 | 2 | 3 = scorePct >= 100 ? 3 : scorePct >= 75 ? 2 : 1;
      const currentStars = prev.arcadeStars?.[topicId] ?? 0;
      const currentBest = prev.bestArcadeScore?.[topicId] ?? 0;

      return {
        ...prev,
        stats: {
          ...prev.stats,
          arcadeRunsCompleted: (prev.stats.arcadeRunsCompleted || 0) + 1,
        },
        arcadeStars: {
          ...prev.arcadeStars,
          [topicId]: Math.max(currentStars, stars) as 1 | 2 | 3,
        },
        bestArcadeScore: {
          ...prev.bestArcadeScore,
          [topicId]: Math.max(currentBest, scorePct),
        },
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

  const passedTopicsHardcore = useMemo(() =>
    Object.values(meta.topics ?? {}).filter(b => b.passed).length,
    [meta.topics]
  );
  const masteredTopicsHardcore = useMemo(() =>
    Object.values(meta.topics ?? {}).filter(b => b.mastered).length,
    [meta.topics]
  );

  const getFrageMeta = useCallback((frageId: string): FrageMeta | undefined => {
    return meta.fragen[frageId];
  }, [meta]);

  return {
    meta,
    passedTopicsHardcore,
    masteredTopicsHardcore,
    recordAnswer,
    recordRunStart,
    recordTopicResult,
    recordArcadeRunComplete,
    recordExamResult,
    reset,
    getFrageMeta,
    importData,
  };
}
