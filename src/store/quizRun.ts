import { useState, useCallback, useEffect } from 'react';
import type { Frage, QuizRun, QuizData, GameMode } from '@/types/quiz';
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
    if (next) RunStorage.save(gameMode, next);
    else RunStorage.clear(gameMode);
  }, [gameMode]);

  // Starte neuen Run oder erweitere bestehenden
  const starteRun = useCallback((bereiche: string[], overrideData?: QuizData) => {
    const qd = overrideData || quizData;
    if (!qd) return;

    if (run?.isActive) {
      // Erweitere bestehenden Run
      const combinedBereiche = [...new Set([...run.bereiche, ...bereiche])];
      const existingIds = new Set(run.frageIds);
      const neueFragen = qd.fragen.filter(
        f => bereiche.includes(f.bereich) && !existingIds.has(f.id)
      );
      if (neueFragen.length === 0) return;

      // Fisher-Yates Shuffle
      const gemischt = [...neueFragen];
      for (let i = gemischt.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gemischt[i], gemischt[j]] = [gemischt[j], gemischt[i]];
      }

      persistRun({
        ...run,
        frageIds: [...run.frageIds, ...gemischt.map(f => f.id)],
        bereiche: combinedBereiche,
      });
    } else {
      // Neuer Run
      const gefiltert = qd.fragen.filter(f => bereiche.includes(f.bereich));
      const gemischt = [...gefiltert];
      for (let i = gemischt.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gemischt[i], gemischt[j]] = [gemischt[j], gemischt[i]];
      }

      persistRun({
        frageIds: gemischt.map(f => f.id),
        antworten: {},
        bereiche,
        aktuellerIndex: 0,
        isActive: true,
      });
    }
  }, [quizData, run, persistRun]);

  // Antwort speichern (nur wenn noch nicht beantwortet)
  const beantworteFrage = useCallback((frageId: string, antwort: string) => {
    setRun(prev => {
      if (!prev || prev.antworten[frageId]) return prev;
      const next = { ...prev, antworten: { ...prev.antworten, [frageId]: antwort } };
      RunStorage.save(gameMode, next);
      return next;
    });
  }, [gameMode]);

  const naechsteFrage = useCallback(() => {
    setRun(prev => {
      if (!prev || prev.aktuellerIndex >= prev.frageIds.length - 1) return prev;
      const next = { ...prev, aktuellerIndex: prev.aktuellerIndex + 1 };
      RunStorage.save(gameMode, next);
      return next;
    });
  }, [gameMode]);

  const vorherigeFrage = useCallback(() => {
    setRun(prev => {
      if (!prev || prev.aktuellerIndex <= 0) return prev;
      const next = { ...prev, aktuellerIndex: prev.aktuellerIndex - 1 };
      RunStorage.save(gameMode, next);
      return next;
    });
  }, [gameMode]);

  const springeZuFrage = useCallback((index: number) => {
    setRun(prev => {
      if (!prev || index < 0 || index >= prev.frageIds.length) return prev;
      const next = { ...prev, aktuellerIndex: index };
      RunStorage.save(gameMode, next);
      return next;
    });
  }, [gameMode]);

  const unterbrecheRun = useCallback(() => {
    persistRun(null);
  }, [persistRun]);

  // Abgeleitete Daten
  const aktiveFragen: Frage[] = run && quizData
    ? run.frageIds.map(id => quizData.fragen.find(f => f.id === id)).filter(Boolean) as Frage[]
    : [];

  const aktuelleFrage = aktiveFragen[run?.aktuellerIndex ?? 0] || null;

  const statistiken = {
    beantwortet: run ? Object.keys(run.antworten).length : 0,
    korrekt: aktiveFragen.filter(f => run && run.antworten[f.id] === f.richtige_antwort).length,
    falsch: aktiveFragen.filter(f => run && run.antworten[f.id] && run.antworten[f.id] !== f.richtige_antwort).length,
    gesamt: aktiveFragen.length,
  };

  return {
    run,
    aktiveFragen,
    aktuelleFrage,
    aktuellerIndex: run?.aktuellerIndex ?? 0,
    antworten: run?.antworten ?? {},
    geladeneBereiche: run?.bereiche ?? [],
    isActive: run?.isActive ?? false,
    statistiken,
    starteRun,
    beantworteFrage,
    naechsteFrage,
    vorherigeFrage,
    springeZuFrage,
    unterbrecheRun,
  };
}
