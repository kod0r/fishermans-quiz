import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Frage, GameMode } from '@/types/quiz';
import { loadAllQuizData } from '@/utils/quizLoader';

interface TutorialRunState {
  aktiveFragen: Frage[];
  aktuellerIndex: number;
  antworten: Record<string, string>;
  isActive: boolean;
  startedAt: string;
  durationSeconds?: number;
  completedAt?: string;
}

export function useTutorialRun(mode: GameMode, questionIds: string[]) {
  const [run, setRun] = useState<TutorialRunState | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadAllQuizData()
      .then((data) => {
        if (cancelled) return;
        const fragen = questionIds
          .map((id) => data.fragen.find((f) => f.id === id))
          .filter((f): f is Frage => f !== undefined);

        if (fragen.length === 0) return;

        const durationSeconds = mode === 'exam' ? 10 * 60 : undefined;
        setRun({
          aktiveFragen: fragen,
          aktuellerIndex: 0,
          antworten: {},
          isActive: true,
          startedAt: new Date().toISOString(),
          durationSeconds,
        });
      })
      .catch(console.error);

    return () => { cancelled = true; };
  }, [questionIds, mode]);

  const beantworteFrage = useCallback((frageId: string, antwort: string) => {
    setRun((prev) => {
      if (!prev || prev.antworten[frageId]) return prev;
      return { ...prev, antworten: { ...prev.antworten, [frageId]: antwort } };
    });
  }, []);

  const naechsteFrage = useCallback(() => {
    setRun((prev) => {
      if (!prev || prev.aktuellerIndex >= prev.aktiveFragen.length - 1) return prev;
      return { ...prev, aktuellerIndex: prev.aktuellerIndex + 1 };
    });
  }, []);

  const vorherigeFrage = useCallback(() => {
    setRun((prev) => {
      if (!prev || prev.aktuellerIndex <= 0) return prev;
      return { ...prev, aktuellerIndex: prev.aktuellerIndex - 1 };
    });
  }, []);

  const beendeRun = useCallback(() => {
    setRun((prev) => {
      if (!prev) return prev;
      return { ...prev, isActive: false, completedAt: new Date().toISOString() };
    });
  }, []);

  const statistiken = useMemo(() => {
    if (!run) return { beantwortet: 0, korrekt: 0, falsch: 0, gesamt: 0 };
    const beantwortet = Object.keys(run.antworten).length;
    const korrekt = run.aktiveFragen.filter(
      (f) => run.antworten[f.id] === f.richtige_antwort
    ).length;
    const falsch = beantwortet - korrekt;
    return { beantwortet, korrekt, falsch, gesamt: run.aktiveFragen.length };
  }, [run]);

  const aktuelleFrage = run?.aktiveFragen[run.aktuellerIndex] ?? null;
  const userAntwort = aktuelleFrage ? run?.antworten[aktuelleFrage.id] : undefined;
  const hasAnswered = userAntwort !== undefined;

  return {
    rawRun: run,
    aktiveFragen: run?.aktiveFragen ?? [],
    aktuelleFrage,
    aktuellerIndex: run?.aktuellerIndex ?? 0,
    antworten: run?.antworten ?? {},
    isActive: run?.isActive ?? false,
    statistiken,
    beantworteFrage,
    naechsteFrage,
    vorherigeFrage,
    beendeRun,
    hasAnswered,
    userAntwort,
  };
}
