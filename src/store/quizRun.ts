import { useCallback, useEffect, useMemo } from 'react';
import type { Frage, QuizRun, QuizData, GameMode, SessionType, SelfAssessmentGrade } from '@/types/quiz';
import { usePersistentStatePerMode } from '@/hooks/usePersistentState';
import type { PersistenceAdapter } from '@/utils/persistence';
import * as RunEngine from '@/engine/runEngine';
import { selectActiveQuestions, selectStatistics } from '@/engine/runSelectors';

const runKey = (mode: GameMode) => `fmq:run:${mode}:v2`;

export function useQuizRun(quizData: QuizData | null, gameMode: GameMode, adapter?: PersistenceAdapter) {
  const shouldSave = useCallback((run: QuizRun | null) => {
    if (run && run.gameMode && run.gameMode !== gameMode) return false;
    return true;
  }, [gameMode]);

  const [run, setRun] = usePersistentStatePerMode<QuizRun | null>(
    runKey(gameMode),
    null,
    adapter,
    shouldSave,
  );

  const persistRun = useCallback((next: QuizRun | null) => {
    setRun(next);
  }, [setRun]);

  // Daten-Inkonsistenz erkennen und bereinigen (Issue #17)
  useEffect(() => {
    if (!run || !quizData) return;
    const bereinigt = RunEngine.purgeMissingQuestions(run, quizData);
    if (bereinigt !== run) {
      const fehlendeIds = RunEngine.detectInconsistency(run, quizData);
      console.warn(`[quizRun] ${fehlendeIds.length} Frage(n) aus dem Run nicht mehr im Katalog vorhanden. Bereinige...`, fehlendeIds);
      if (bereinigt === null) {
        setRun(null);
      } else {
        setRun({ ...bereinigt, gameMode: bereinigt.gameMode ?? gameMode });
      }
    }
  }, [run, quizData, setRun, gameMode]);

  const starteRun = useCallback((topics: string[], overrideData?: QuizData, limit?: number, durationSeconds?: number, sessionType?: SessionType, enableShuffle?: boolean) => {
    const qd = overrideData || quizData;
    if (!qd) return;

    if (run?.isActive) {
      const extended = RunEngine.extendRun(run, qd, topics, enableShuffle);
      if (!extended) return;
      persistRun({ ...extended, gameMode: extended.gameMode ?? gameMode });
    } else {
      const created = RunEngine.createRun(qd, topics, { limit, durationSeconds, sessionType, enableShuffle });
      persistRun({ ...created, gameMode });
    }
  }, [quizData, run, persistRun, gameMode]);

  const beantworteFrage = useCallback((frageId: string, antwort: string) => {
    setRun(prev => {
      if (!prev) return prev;
      return RunEngine.answerQuestion(prev, frageId, antwort);
    });
  }, [setRun]);

  const bewerteSelbst = useCallback((frageId: string, grade: SelfAssessmentGrade) => {
    setRun(prev => {
      if (!prev) return prev;
      return RunEngine.selfAssess(prev, frageId, grade);
    });
  }, [setRun]);

  const naechsteFrage = useCallback(() => {
    setRun(prev => {
      if (!prev) return prev;
      return RunEngine.nextQuestion(prev);
    });
  }, [setRun]);

  const vorherigeFrage = useCallback(() => {
    setRun(prev => {
      if (!prev) return prev;
      return RunEngine.prevQuestion(prev);
    });
  }, [setRun]);

  const springeZuFrage = useCallback((index: number) => {
    setRun(prev => {
      if (!prev) return prev;
      return RunEngine.jumpToQuestion(prev, index);
    });
  }, [setRun]);

  const removeTopic = useCallback((topicId: string) => {
    if (!run || !quizData) return;
    const next = RunEngine.removeTopicFromRun(run, quizData, topicId);
    if (next === null) {
      persistRun(null);
    } else if (next !== run) {
      persistRun({ ...next, gameMode: next.gameMode ?? gameMode });
    }
  }, [run, quizData, persistRun, gameMode]);

  const unterbrecheRun = useCallback(() => {
    setRun(prev => {
      if (!prev) return prev;
      return RunEngine.interruptRun(prev);
    });
  }, [setRun]);

  const wipeRun = useCallback(() => {
    persistRun(null);
  }, [persistRun]);

  const beendeRun = useCallback(() => {
    setRun(prev => {
      if (!prev) return prev;
      return RunEngine.interruptRun(prev);
    });
  }, [setRun]);

  const markCompleted = useCallback(() => {
    setRun(prev => {
      if (!prev) return prev;
      return RunEngine.completeRun(prev);
    });
  }, [setRun]);

  const restarteRun = useCallback(() => {
    if (!run || !quizData) return;
    const next = RunEngine.restartRun(run, quizData);
    persistRun({ ...next, gameMode: next.gameMode ?? gameMode });
  }, [run, quizData, persistRun, gameMode]);

  const aktiveFragen = useMemo<Frage[]>(() => {
    if (!run || !quizData) return [];
    return selectActiveQuestions(run, quizData);
  }, [run, quizData]);

  const aktuelleFrage = aktiveFragen[run?.aktuellerIndex ?? 0] || null;

  const statistiken = useMemo(() => {
    if (!run) return { beantwortet: 0, korrekt: 0, falsch: 0, gesamt: 0 };
    return selectStatistics(run, aktiveFragen);
  }, [aktiveFragen, run]);

  return {
    run,
    rawRun: run,
    aktiveFragen,
    aktuelleFrage,
    aktuellerIndex: run?.aktuellerIndex ?? 0,
    antworten: run?.antworten ?? {},
    loadedTopics: run?.topics ?? [],
    isActive: run?.isActive ?? false,
    statistiken,
    starteRun,
    restarteRun,
    beantworteFrage,
    bewerteSelbst,
    naechsteFrage,
    vorherigeFrage,
    springeZuFrage,
    removeTopic,
    unterbrecheRun,
    wipeRun,
    beendeRun,
    markCompleted,
  };
}
