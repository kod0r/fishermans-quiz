import { useState, useCallback, useEffect } from 'react';
import type { QuizData, AppView } from '@/types/quiz';
import type { QuizMeta } from '@/utils/quizLoader';
import { loadQuizMeta, buildQuizData, loadAllQuizData } from '@/utils/quizLoader';
import { useQuizRun } from '@/store/quizRun';
import { useMetaProgress } from '@/store/metaProgress';

export function useQuiz() {
  const [quizMeta, setQuizMeta] = useState<QuizMeta | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [view, setView] = useState<AppView>('start');
  const [istGeladen, setIstGeladen] = useState(false);

  const run = useQuizRun(quizData);
  const meta = useMetaProgress();

  // Staged Loading:
  // 1. Meta sofort laden (~360 Bytes) → App wird sofort nutzbar
  // 2. Alle Fragen im Hintergrund nachladen (~420KB)
  // 3. Falls User schneller ist als Hintergrund-Load → on-demand laden
  useEffect(() => {
    let cancelled = false;

    loadQuizMeta()
      .then((meta) => {
        if (cancelled) return;
        setQuizMeta(meta);
        setIstGeladen(true);

        // Hintergrund: Alle Fragen vorladen für sofortige Verfügbarkeit
        loadAllQuizData()
          .then((data) => {
            if (!cancelled) setQuizData(data);
          })
          .catch(console.error);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Fehler beim Laden der Quiz-Meta:', err);
        setIstGeladen(true);
      });

    return () => { cancelled = true; };
  }, []);

  // Beantworten: Run + Meta synchron
  const beantworteFrage = useCallback((frageId: string, antwort: string) => {
    const frage = run.aktiveFragen.find(f => f.id === frageId);
    if (!frage) return;

    run.beantworteFrage(frageId, antwort);
    meta.recordAnswer(frageId, antwort === frage.richtige_antwort);
  }, [run, meta]);

  // Starten: Lazy Loading der Bereichs-Fragen
  const starteQuiz = useCallback(async (bereiche: string[]) => {
    if (!quizMeta) return;

    let data = quizData;

    // Falls Hintergrund-Load noch nicht fertig → on-demand laden
    if (!data) {
      try {
        data = await buildQuizData(bereiche);
        setQuizData(data);
      } catch (err) {
        console.error('Fehler beim Laden der Quiz-Daten:', err);
        return;
      }
    }

    const isNewRun = !run.isActive;
    run.starteRun(bereiche, data);
    if (isNewRun) meta.recordRunStart();
    setView('quiz');
  }, [run, meta, quizData, quizMeta]);

  const goToView = useCallback((v: AppView) => setView(v), []);

  const kannBereichEntfernen = useCallback(
    (id: string) => !run.isActive || !run.geladeneBereiche.includes(id),
    [run]
  );

  return {
    // Meta (immer verfügbar)
    quizMeta,

    // Daten (lazy geladen)
    quizData,
    istGeladen,
    view,

    // Run (Session)
    ...run,
    starteQuiz,
    beantworteFrage,

    // Meta (Persistent)
    metaProgress: meta.meta,
    meisterCount: meta.meisterCount,
    lernCount: meta.lernCount,
    getFrageMeta: meta.getFrageMeta,
    resetMetaProgression: meta.reset,

    // Navigation
    goToView,
    kannBereichEntfernen,
  };
}

export type QuizContext = ReturnType<typeof useQuiz>;
