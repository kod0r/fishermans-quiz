import { useState, useCallback, useEffect } from 'react';
import type { QuizData, AppView } from '@/types/quiz';
import type { QuizMeta } from '@/utils/quizLoader';
import { loadQuizMeta, buildQuizData, loadAllQuizData } from '@/utils/quizLoader';
import { useQuizRun } from '@/store/quizRun';
import { useMetaProgress } from '@/store/metaProgress';
import { useSettings } from '@/store/settings';
import { useFavorites } from '@/store/favorites';

export function useQuiz() {
  const [quizMeta, setQuizMeta] = useState<QuizMeta | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [view, setView] = useState<AppView>('start');
  const [istGeladen, setIstGeladen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { gameMode, setGameMode } = useSettings();
  const run = useQuizRun(quizData, gameMode);
  const meta = useMetaProgress(gameMode);
  const fav = useFavorites();

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
        setLoadError(err instanceof Error ? err.message : 'Laden fehlgeschlagen');
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
  const starteQuiz = useCallback(async (bereiche: string[], nurFavoriten = false, limit?: number) => {
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

    // Optional: Nur Favoriten filtern
    let filteredData = data;
    if (nurFavoriten) {
      const favIds = new Set(fav.favorites);
      filteredData = {
        ...data,
        fragen: data.fragen.filter(f => favIds.has(f.id)),
      };
      if (filteredData.fragen.length === 0) {
        console.warn('[useQuiz] Keine Favoriten in den gewählten Bereichen.');
        return;
      }
    }

    const isNewRun = !run.isActive;
    run.starteRun(bereiche, filteredData, limit);
    if (isNewRun) meta.recordRunStart();
    setView('quiz');
  }, [run, meta, quizData, quizMeta, fav.favorites]);

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
    loadError,
    view,

    // Settings
    gameMode,
    setGameMode,

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
    importMetaProgression: meta.importData,

    // Navigation
    goToView,
    kannBereichEntfernen,

    // Favoriten
    favorites: fav.favorites,
    toggleFavorite: fav.toggleFavorite,
    isFavorite: fav.isFavorite,
    resetFavorites: fav.resetFavorites,
  };
}

export type QuizContext = ReturnType<typeof useQuiz>;
