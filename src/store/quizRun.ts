import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Frage, QuizRun, QuizData, GameMode, SessionType, SelfAssessmentGrade } from '@/types/quiz';
import { shuffleAnswers as computeShuffle } from '@/utils/quizShuffle';
import { RunStorage } from '@/utils/storage';

export function useQuizRun(quizData: QuizData | null, gameMode: GameMode) {
  const [run, setRun] = useState<QuizRun | null>(() => RunStorage.load(gameMode));

  // Wenn sich der Modus ändert → neu laden
  useEffect(() => {
    setRun(RunStorage.load(gameMode));
  }, [gameMode]);

  // Persistiere Run bei Änderungen
  const persistRun = useCallback((next: QuizRun | null) => {
    setRun(next);
  }, []);

  // Starte neuen Run oder erweitere bestehenden
  const starteRun = useCallback((topics: string[], overrideData?: QuizData, limit?: number, durationSeconds?: number, sessionType?: SessionType, enableShuffle?: boolean) => {
    const qd = overrideData || quizData;
    if (!qd) return;

    if (run?.isActive) {
      // Zeitbegrenzte Runs können nicht erweitert werden
      if (run.durationSeconds) return;

      // Erweitere bestehenden Run
      const combinedTopics = [...new Set([...run.topics, ...topics])];
      const existingIds = new Set(run.frageIds);
      const neueFragen = qd.fragen.filter(
        f => topics.includes(f.topic) && !existingIds.has(f.id)
      );
      if (neueFragen.length === 0) return;

      // Fisher-Yates Shuffle
      const gemischt = [...neueFragen];
      for (let i = gemischt.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gemischt[i], gemischt[j]] = [gemischt[j], gemischt[i]];
      }

      const newAnswerShuffle = run.answerShuffle ? { ...run.answerShuffle } : undefined;
      if (newAnswerShuffle && enableShuffle) {
        for (const f of gemischt) {
          const { order } = computeShuffle(f);
          newAnswerShuffle[f.id] = order;
        }
      }

      persistRun({
        ...run,
        frageIds: [...run.frageIds, ...gemischt.map(f => f.id)],
        topics: combinedTopics,
        startedAt: new Date().toISOString(),
        completedAt: undefined,
        answerShuffle: newAnswerShuffle,
        gameMode: run.gameMode ?? gameMode,
      });
    } else {
      // Neuer Run
      const gefiltert = qd.fragen.filter(f => topics.includes(f.topic));
      const gemischt = [...gefiltert];
      for (let i = gemischt.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gemischt[i], gemischt[j]] = [gemischt[j], gemischt[i]];
      }

      // Limit erst nach dem Shuffle anwenden, damit die Subset-Auswahl zufällig ist
      const finalPool = limit && limit > 0 ? gemischt.slice(0, limit) : gemischt;

      let answerShuffle: Record<string, ('A' | 'B' | 'C')[]> | undefined;
      if (enableShuffle) {
        answerShuffle = {};
        for (const f of finalPool) {
          const { order } = computeShuffle(f);
          answerShuffle[f.id] = order;
        }
      }

      persistRun({
        frageIds: finalPool.map(f => f.id),
        antworten: {},
        topics,
        aktuellerIndex: 0,
        isActive: true,
        startedAt: new Date().toISOString(),
        durationSeconds,
        sessionType: sessionType ?? 'quiz',
        answerShuffle,
        gameMode,
      });
    }
  }, [quizData, run, persistRun, gameMode]);

  // Antwort speichern (nur wenn noch nicht beantwortet)
  const beantworteFrage = useCallback((frageId: string, antwort: string) => {
    setRun(prev => {
      if (!prev || prev.antworten[frageId]) return prev;
      return { ...prev, antworten: { ...prev.antworten, [frageId]: antwort } };
    });
  }, []);

  // Selbstbewertung speichern (Flashcard Mode)
  const bewerteSelbst = useCallback((frageId: string, grade: SelfAssessmentGrade) => {
    setRun(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        selfAssessments: { ...(prev.selfAssessments ?? {}), [frageId]: grade },
      };
    });
  }, []);

  const naechsteFrage = useCallback(() => {
    setRun(prev => {
      if (!prev || prev.aktuellerIndex >= prev.frageIds.length - 1) return prev;
      return { ...prev, aktuellerIndex: prev.aktuellerIndex + 1 };
    });
  }, []);

  const vorherigeFrage = useCallback(() => {
    setRun(prev => {
      if (!prev || prev.aktuellerIndex <= 0) return prev;
      return { ...prev, aktuellerIndex: prev.aktuellerIndex - 1 };
    });
  }, []);

  const springeZuFrage = useCallback((index: number) => {
    setRun(prev => {
      if (!prev || index < 0 || index >= prev.frageIds.length) return prev;
      return { ...prev, aktuellerIndex: index };
    });
  }, []);

  const removeTopic = useCallback((topicId: string) => {
    if (!run || !quizData) return;

    const idsToRemove = new Set(
      quizData.fragen.filter(f => f.topic === topicId).map(f => f.id)
    );

    const neueFrageIds = run.frageIds.filter(id => !idsToRemove.has(id));
    const newTopics = run.topics.filter(b => b !== topicId);

    if (neueFrageIds.length === run.frageIds.length && newTopics.length === run.topics.length) {
      return;
    }

    if (neueFrageIds.length === 0) {
      persistRun(null);
      return;
    }

    const neueAntworten: Record<string, string> = {};
    for (const id of neueFrageIds) {
      if (run.antworten[id] !== undefined) {
        neueAntworten[id] = run.antworten[id];
      }
    }

    const removedBeforeIndex = run.frageIds
      .slice(0, run.aktuellerIndex + 1)
      .filter(id => idsToRemove.has(id)).length;

    const neuerIndex = Math.max(0, run.aktuellerIndex - removedBeforeIndex);
    const finalIndex = Math.min(neuerIndex, neueFrageIds.length - 1);

    let neueAnswerShuffle = run.answerShuffle ? { ...run.answerShuffle } : undefined;
    if (neueAnswerShuffle) {
      for (const id of Array.from(idsToRemove)) {
        delete neueAnswerShuffle[id];
      }
      if (Object.keys(neueAnswerShuffle).length === 0) {
        neueAnswerShuffle = undefined;
      }
    }

    persistRun({
      ...run,
      frageIds: neueFrageIds,
      antworten: neueAntworten,
      topics: newTopics,
      aktuellerIndex: finalIndex,
      answerShuffle: neueAnswerShuffle,
      gameMode: run.gameMode ?? gameMode,
    });
  }, [run, quizData, persistRun, gameMode]);

  const unterbrecheRun = useCallback(() => {
    // Strategy: mark inactive instead of wiping so answerShuffle survives for review.
    setRun(prev => {
      if (!prev) return prev;
      return { ...prev, isActive: false };
    });
  }, []);

  const wipeRun = useCallback(() => {
    persistRun(null);
  }, [persistRun]);

  const beendeRun = useCallback(() => {
    setRun(prev => {
      if (!prev) return prev;
      return { ...prev, isActive: false };
    });
  }, []);

  const markCompleted = useCallback(() => {
    setRun(prev => {
      if (!prev) return prev;
      return { ...prev, completedAt: new Date().toISOString() };
    });
  }, []);

  const restarteRun = useCallback(() => {
    if (!run || !quizData) return;
    const gemischt = [...run.frageIds];
    for (let i = gemischt.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gemischt[i], gemischt[j]] = [gemischt[j], gemischt[i]];
    }

    let newAnswerShuffle: Record<string, ('A' | 'B' | 'C')[]> | undefined;
    if (run.answerShuffle) {
      newAnswerShuffle = {};
      for (const id of gemischt) {
        const f = quizData.fragen.find(q => q.id === id);
        if (f) {
          const { order } = computeShuffle(f);
          newAnswerShuffle[id] = order;
        }
      }
    }

    persistRun({
      ...run,
      frageIds: gemischt,
      antworten: {},
      aktuellerIndex: 0,
      startedAt: new Date().toISOString(),
      selfAssessments: {},
      completedAt: undefined,
      answerShuffle: newAnswerShuffle,
      gameMode: run.gameMode ?? gameMode,
    });
  }, [run, quizData, persistRun, gameMode]);

  // Persistiere Run bei Änderungen
  useEffect(() => {
    if (run) {
      // Verhindert Speichern eines Runs unter dem falschen Modus-Key
      if (run.gameMode && run.gameMode !== gameMode) return;
      try {
        RunStorage.save(gameMode, run);
      } catch {
        // Silently ignore storage errors to avoid blocking UI updates
      }
    } else {
      try {
        RunStorage.clear(gameMode);
      } catch {
        // Silently ignore storage errors
      }
    }
  }, [run, gameMode]);

  // Daten-Inkonsistenz erkennen und bereinigen (Issue #17)
  useEffect(() => {
    if (!run || !quizData) return;

    const vorhandeneIds = new Set(quizData.fragen.map(f => f.id));
    const fehlendeIds = run.frageIds.filter(id => !vorhandeneIds.has(id));

    if (fehlendeIds.length > 0) {
      console.warn(`[quizRun] ${fehlendeIds.length} Frage(n) aus dem Run nicht mehr im Katalog vorhanden. Bereinige...`, fehlendeIds);
      const bereinigteIds = run.frageIds.filter(id => vorhandeneIds.has(id));
      if (bereinigteIds.length === 0) {
        persistRun(null);
        return;
      }
      const bereinigteAntworten: Record<string, string> = {};
      for (const id of bereinigteIds) {
        if (run.antworten[id] !== undefined) {
          bereinigteAntworten[id] = run.antworten[id];
        }
      }
      const bereinigterIndex = Math.min(run.aktuellerIndex, bereinigteIds.length - 1);
      persistRun({
        ...run,
        frageIds: bereinigteIds,
        antworten: bereinigteAntworten,
        aktuellerIndex: bereinigterIndex,
        gameMode: run.gameMode ?? gameMode,
      });
    }
  }, [run, quizData, persistRun, gameMode]);

  // Abgeleitete Daten
  const aktiveFragen = useMemo<Frage[]>(() => {
    if (!run || !quizData) return [];
    return run.frageIds
      .map(id => {
        const f = quizData.fragen.find(q => q.id === id);
        if (!f) return undefined;
        const shuffle = run.answerShuffle?.[f.id];
        if (shuffle) {
          const keys: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
          const antworten = {
            A: f.antworten[shuffle[0]],
            B: f.antworten[shuffle[1]],
            C: f.antworten[shuffle[2]],
          };
          const richtige_antwort = keys[shuffle.indexOf(f.richtige_antwort)];
          return { ...f, antworten, richtige_antwort };
        }
        return f;
      })
      .filter((f): f is Frage => f !== undefined);
  }, [run, quizData]);

  const aktuelleFrage = aktiveFragen[run?.aktuellerIndex ?? 0] || null;

  const statistiken = useMemo(() => ({
    beantwortet: run ? Object.keys(run.antworten).length : 0,
    korrekt: aktiveFragen.filter(f => run && run.antworten[f.id] === f.richtige_antwort).length,
    falsch: aktiveFragen.filter(f => run && f.id in run.antworten && run.antworten[f.id] !== f.richtige_antwort).length,
    gesamt: aktiveFragen.length,
  }), [aktiveFragen, run]);

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
