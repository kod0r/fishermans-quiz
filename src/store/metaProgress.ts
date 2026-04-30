import { useCallback, useMemo } from 'react';
import type { FrageMeta, TopicMeta, MetaProgression, GameMode } from '@/types/quiz';
import { usePersistentStatePerMode } from '@/hooks/usePersistentState';
import { createMetaAdapter } from '@/utils/persistence/metaAdapter';
import type { PersistenceAdapter } from '@/utils/persistence';

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

const metaKey = (mode: GameMode) => `fmq:meta:${mode}:v2`;
const defaultAdapter = createMetaAdapter();

export function useMetaProgress(gameMode: GameMode, adapter: PersistenceAdapter = defaultAdapter) {
  const [meta, setMeta] = usePersistentStatePerMode<MetaProgression>(
    metaKey(gameMode),
    EMPTY,
    adapter,
  );

  const persist = useCallback((next: MetaProgression) => {
    setMeta(next);
  }, [setMeta]);

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
  }, [setMeta]);

  const recordRunStart = useCallback(() => {
    setMeta(prev => {
      return { ...prev, stats: { ...prev.stats, totalRuns: prev.stats.totalRuns + 1 } };
    });
  }, [setMeta]);

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

      const nextTopics: Record<string, TopicMeta> = {
        ...prev.topics,
        [topicId]: topicMeta,
      };

      if (passed) {
        for (const [id, tMeta] of Object.entries(nextTopics)) {
          if (
            id !== topicId &&
            tMeta.lastAttempt !== null &&
            tMeta.passed === false &&
            tMeta.mastered === false
          ) {
            nextTopics[id] = { ...tMeta, lastAttempt: null };
          }
        }
      }

      return {
        ...prev,
        topics: nextTopics,
      };
    });
  }, [setMeta]);

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
  }, [setMeta]);

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
  }, [setMeta]);

  const reset = useCallback(() => {
    persist(EMPTY);
  }, [persist]);

  const importData = useCallback((data: MetaProgression) => {
    persist(data);
  }, [persist]);

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
