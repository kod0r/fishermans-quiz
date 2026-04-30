import { useState, useCallback, useEffect, useMemo } from 'react';
import type { QuizData, AppView, QuizStartOptions, SelfAssessmentGrade, GameMode } from '@/types/quiz';
import type { QuizMeta } from '@/utils/quizLoader';
import { loadQuizMeta, buildQuizData, loadAllQuizData, AppBackupSchema } from '@/utils/quizLoader';
import { metaAdapter, localStorageAdapter, createRunAdapter } from '@/utils/persistence';
import { useQuizRun } from '@/store/quizRun';
import { useMetaProgress } from '@/store/metaProgress';
import { useSettings } from '@/store/settings';
import { useFavorites } from '@/store/favorites';
import { useNotes } from '@/store/notes';
import { useHistory } from '@/store/history';
import { useSRS } from '@/store/srs';
import { isMastered } from '@/utils/srs';
import { filterQuizDataByFavorites, filterQuizDataByWeakness, filterQuizDataBySRSDue } from '@/utils/filter';
import { MODE_POLICIES } from '@/modes';

export function useQuiz() {
  const [quizMeta, setQuizMeta] = useState<QuizMeta | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [view, setView] = useState<AppView>('start');
  const [istGeladen, setIstGeladen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isTutorialDemoActive, setIsTutorialDemoActive] = useState(false);

  const settings = useSettings();
  const { gameMode, setGameMode, backupReminderEnabled, lastBackupPrompt, setLastBackupPrompt, shuffleAnswers, setShuffleAnswers } = settings;
  const run = useQuizRun(quizData, gameMode);
  const meta = useMetaProgress(gameMode);
  const srs = useSRS();
  const fav = useFavorites();
  const notes = useNotes();
  const history = useHistory();
  const policy = MODE_POLICIES[gameMode];

  // Vollständiger Backup-Export
  const exportFullBackup = useCallback(() => {
    const backup = {
      version: '1' as const,
      exportedAt: new Date().toISOString(),
      settings: settings.settings,
      metaArcade: metaAdapter.load('fmq:meta:arcade:v2'),
      metaHardcore: metaAdapter.load('fmq:meta:hardcore:v2'),
      metaExam: metaAdapter.load('fmq:meta:exam:v2'),
      favorites: fav.favorites,
      notes: notes.notes,
      history: history.entries,
      srs: srs.srsMap,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fishermans-quiz-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    settings.setLastBackupPrompt(new Date().toISOString());
  }, [settings, fav, notes, history, srs.srsMap]);

  // Vollständiger Backup-Import
  const importFullBackup = useCallback((data: unknown) => {
    const parsed = AppBackupSchema.safeParse(data);
    if (!parsed.success) {
      console.error('[Import] Validierung fehlgeschlagen:', parsed.error.format());
      return false;
    }
    const backup = parsed.data;
    metaAdapter.save('fmq:meta:arcade:v2', backup.metaArcade);
    metaAdapter.save('fmq:meta:hardcore:v2', backup.metaHardcore);
    metaAdapter.save('fmq:meta:exam:v2', backup.metaExam);
    localStorageAdapter.save('fmq:settings:v1', backup.settings);
    localStorageAdapter.save('fmq:favorites:v1', backup.favorites);
    localStorageAdapter.save('fmq:notes:v1', backup.notes);
    localStorageAdapter.save('fmq:history:v1', backup.history);
    localStorageAdapter.save('fmq:meta:srs:v1', backup.srs);
    window.location.reload();
    return true;
  }, []);

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

  // Periodisches Backup-Prompt
  const [showBackupPrompt, setShowBackupPrompt] = useState(false);

  useEffect(() => {
    if (!backupReminderEnabled) return;
    const daysSince = lastBackupPrompt
      ? (Date.now() - new Date(lastBackupPrompt).getTime()) / (1000 * 60 * 60 * 24)
      : Infinity;
    if (daysSince >= 7) {
      const timer = setTimeout(() => {
        setShowBackupPrompt(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [backupReminderEnabled, lastBackupPrompt]);

  const handleBackupConfirm = useCallback(() => {
    exportFullBackup();
    setShowBackupPrompt(false);
  }, [exportFullBackup]);

  const handleBackupCancel = useCallback(() => {
    setLastBackupPrompt(new Date().toISOString());
    setShowBackupPrompt(false);
  }, [setLastBackupPrompt]);

  // Nur aktuellen Run löschen (ohne Hardcore-Logging)
  const clearCurrentRun = useCallback(() => {
    run.wipeRun?.();
  }, [run]);

  // Alle Modi zurücksetzen
  const resetAllMetaProgression = useCallback(() => {
    metaAdapter.clear('fmq:meta:arcade:v2');
    metaAdapter.clear('fmq:meta:hardcore:v2');
    metaAdapter.clear('fmq:meta:exam:v2');
    meta.reset();
  }, [meta]);

  const clearAllRuns = useCallback(() => {
    localStorageAdapter.clear('fmq:run:arcade:v2');
    localStorageAdapter.clear('fmq:run:hardcore:v2');
    localStorageAdapter.clear('fmq:run:exam:v2');
    run.wipeRun?.();
  }, [run]);

  // Hilfsfunktion: Session als abgeschlossen loggen
  const logRunIfComplete = useCallback((finalAntworten: Record<string, string>) => {
    if (!run.isActive || !run.rawRun) return;
    if (run.rawRun.completedAt) return; // doppeltes Loggen verhindern
    const alleBeantwortet = run.aktiveFragen.every(f => finalAntworten[f.id] !== undefined);
    if (!alleBeantwortet) return;

    const isFlashcard = run.rawRun.sessionType === 'flashcard';
    const korrekt = run.aktiveFragen.filter(f => {
      if (isFlashcard) {
        return run.rawRun?.selfAssessments?.[f.id] !== 'again';
      }
      return finalAntworten[f.id] === f.richtige_antwort;
    }).length;
    const started = run.rawRun.startedAt
      ? new Date(run.rawRun.startedAt).getTime()
      : NaN;
    const duration = Number.isNaN(started) ? 0 : Math.round((Date.now() - started) / 1000);

    run.markCompleted?.();
    history.addEntry({
      topics: [...run.loadedTopics],
      score: korrekt,
      total: run.aktiveFragen.length,
      duration,
      mode: gameMode,
    });
  }, [run, history, gameMode]);

  // Beantworten: Run + Meta synchron
  const beantworteFrage = useCallback((frageId: string, antwort: string) => {
    const frage = run.aktiveFragen.find(f => f.id === frageId);
    if (!frage) return;

    const isCorrect = antwort === frage.richtige_antwort;
    run.beantworteFrage(frageId, antwort);
    meta.recordAnswer(frageId, isCorrect);
    srs.recordAnswer(frageId, isCorrect ? 4 : 0);

    const neueAntworten = { ...run.antworten, [frageId]: antwort };
    const alleBeantwortet = run.aktiveFragen.every(f => neueAntworten[f.id] !== undefined);

    const effect = policy.onAnswer({
      frage,
      isCorrect,
      neueAntworten,
      alleBeantwortet,
      aktiveFragen: run.aktiveFragen,
      loadedTopics: run.loadedTopics,
    });

    for (const tr of effect.topicResults ?? []) {
      meta.recordTopicResult(tr.topicId, tr.passed);
    }
    for (const ac of effect.arcadeCompletions ?? []) {
      meta.recordArcadeRunComplete(ac.topicId, ac.scorePct);
    }

    logRunIfComplete(neueAntworten);
  }, [run, meta, policy, logRunIfComplete, srs]);

  // Starten: Lazy Loading der Bereichs-Fragen
  const starteQuiz = useCallback(async (topics: string[], options: QuizStartOptions = {}) => {
    if (!quizMeta) return;

    // Guard: validate all requested topics can be selected in current mode
    const locked = topics.filter(id => !policy.canStartTopic(id, meta.meta, run.isActive, run.loadedTopics));
    if (locked.length > 0) {
      console.error('[useQuiz] Cannot start quiz — locked topics:', locked);
      return;
    }

    const { nurFavoriten = false, filter = 'all' } = options;
    let { limit } = options;

    limit = policy.getStartLimit(limit);

    let data = quizData;

    // Falls Hintergrund-Load noch nicht fertig → on-demand laden
    if (!data) {
      try {
        data = await buildQuizData(topics);
        setQuizData(data);
      } catch (err) {
        console.error('Fehler beim Laden der Quiz-Daten:', err);
        return;
      }
    }

    let filteredData = data;

    // Optional: Nur Favoriten filtern
    if (nurFavoriten) {
      const result = filterQuizDataByFavorites(filteredData, fav.favorites);
      if (!result) {
        console.warn('[useQuiz] No favorites found in selected topics.');
        return;
      }
      filteredData = result;
    }

    // Optional: Schwächentrainer-Filter
    if (filter === 'weak') {
      const result = filterQuizDataByWeakness(filteredData, meta.meta.fragen);
      if (!result) {
        console.warn('[useQuiz] No weaknesses found in selected topics.');
        return;
      }
      filteredData = result;
    }

    // Optional: SRS Due-Filter
    if (filter === 'srs-due') {
      const result = filterQuizDataBySRSDue(filteredData, srs.dueFrageIds);
      if (!result) {
        console.warn('[useQuiz] Keine SRS-Wiederholungen fällig.');
        return;
      }
      filteredData = result;
    }

    const isNewRun = !run.isActive;
    const durationSeconds = policy.getDurationSeconds();
    const sessionType = options.sessionType ?? 'quiz';
    run.starteRun(topics, filteredData, limit, durationSeconds, sessionType, shuffleAnswers);
    if (isNewRun) meta.recordRunStart();
    setView('quiz');
  }, [run, meta, quizData, quizMeta, fav.favorites, policy, srs.dueFrageIds, shuffleAnswers]);

  const goToView = useCallback((v: AppView) => {
    setView(v);
    setIsTutorialDemoActive(false);
  }, []);

  const removeTopicFromRun = useCallback((topicId: string) => {
    run.removeTopic(topicId);
  }, [run]);

  const logCurrentRun = useCallback((finalDuration?: number) => {
    if (!run.isActive) return;
    const started = run.rawRun?.startedAt
      ? new Date(run.rawRun.startedAt).getTime()
      : NaN;
    const duration = finalDuration ?? (Number.isNaN(started) ? 0 : Math.round((Date.now() - started) / 1000));
    history.addEntry({
      topics: [...run.loadedTopics],
      score: run.statistiken.korrekt,
      total: run.aktiveFragen.length,
      duration,
      mode: gameMode,
    });
  }, [run, history, gameMode]);

  const handleUnterbrecheRun = useCallback(() => {
    const effect = policy.onAbort({
      loadedTopics: run.loadedTopics,
      beantwortet: run.statistiken.beantwortet,
    });

    for (const tr of effect.topicResults ?? []) {
      meta.recordTopicResult(tr.topicId, tr.passed);
    }

    if (effect.shouldLogHistory && run.isActive && run.statistiken.beantwortet > 0) {
      logCurrentRun();
    }

    run.unterbrecheRun();
  }, [run, meta, policy, logCurrentRun]);

  const beendeExam = useCallback(() => {
    if (!run.isActive) return;
    const effect = policy.onComplete({
      aktiveFragen: run.aktiveFragen,
      korrekt: run.statistiken.korrekt,
    });
    if (!effect.examResult) return;

    logCurrentRun();
    meta.recordExamResult(effect.examResult.scorePct, effect.examResult.passed);

    run.beendeRun();
    setView('progress');
  }, [run, policy, logCurrentRun, meta]);

  // Zentraler Moduswechsel — beendet aktive Runs gemäß Modus-Regeln
  const switchGameMode = useCallback((newMode: GameMode) => {
    if (run.isActive) {
      const effect = policy.onModeSwitch({
        rawRun: run.rawRun,
        aktiveFragen: run.aktiveFragen,
        loadedTopics: run.loadedTopics,
        beantwortet: run.statistiken.beantwortet,
        korrekt: run.statistiken.korrekt,
      });

      for (const tr of effect.topicResults ?? []) {
        meta.recordTopicResult(tr.topicId, tr.passed);
      }

      if (effect.shouldLogHistory && run.isActive) {
        logCurrentRun();
      }

      if (effect.examResult) {
        meta.recordExamResult(effect.examResult.scorePct, effect.examResult.passed);
      }

      if (effect.shouldEndRun) {
        if (effect.shouldSaveEndedRun && run.rawRun) {
          const endedRun = { ...run.rawRun, isActive: false, gameMode };
          run.beendeRun();
          // Persistenz-Effekt läuft nach gameMode-Wechsel mit falscher Key → manuell sicherstellen
          const safeAdapter = createRunAdapter(localStorageAdapter, gameMode);
          try { safeAdapter.save(`fmq:run:${gameMode}:v2`, endedRun); } catch { /* ignore */ }
        } else {
          run.unterbrecheRun();
          // Persistenz-Effekt läuft nach gameMode-Wechsel mit falscher Key → manuell sicherstellen
          const safeAdapter = createRunAdapter(localStorageAdapter, gameMode);
          try { safeAdapter.clear(`fmq:run:${gameMode}:v2`); } catch { /* ignore */ }
        }
      }

      if (effect.navigateTo && view === 'quiz') {
        setView(effect.navigateTo);
      }
    }
    setGameMode(newMode);
  }, [run, meta, policy, logCurrentRun, setGameMode, view, gameMode]);

  // Flashcard: Selbstbewertung verarbeiten
  const beantworteFlashcard = useCallback((frageId: string, grade: SelfAssessmentGrade) => {
    const frage = run.aktiveFragen.find(f => f.id === frageId);
    if (!frage) return;

    const isCorrect = grade !== 'again';

    // Speichere die korrekte Antwort im Run
    run.beantworteFrage(frageId, frage.richtige_antwort);
    // Speichere die Selbstbewertung
    run.bewerteSelbst?.(frageId, grade);
    // Aktualisiere Meta-Fortschritt und SRS
    meta.recordAnswer(frageId, isCorrect);
    srs.recordSelfAssessment(frageId, grade);

    const neueAntworten = { ...run.antworten, [frageId]: frage.richtige_antwort };
    logRunIfComplete(neueAntworten);
  }, [run, meta, logRunIfComplete, srs]);

  const canRemoveTopic = useCallback(
    (id: string) => {
      if (!run.isActive || !run.loadedTopics.includes(id)) return true;
      return policy.canRemoveTopic(id);
    },
    [run, policy]
  );

  // SRS-aware mastery counts
  const meisterCount = useMemo(() =>
    Object.keys(meta.meta.fragen).filter(id => isMastered(meta.meta.fragen[id], srs.srsMap[id])).length,
    [meta.meta.fragen, srs.srsMap]
  );

  const lernCount = useMemo(() => {
    let count = 0;
    for (const [id, m] of Object.entries(meta.meta.fragen)) {
      if (m.attempts > 0 && !isMastered(m, srs.srsMap[id])) count += 1;
    }
    return count;
  }, [meta.meta.fragen, srs.srsMap]);

  // Arcade: Topics die vollständig gemeistert sind (SRS oder legacy)
  const passedTopicsArcade = useMemo(() => {
    if (!quizMeta) return 0;
    const allTopics = Object.keys(quizMeta.meta.topics);
    return allTopics.filter(topicId => {
      const fragenIds = Object.entries(quizMeta.fragenIndex)
        .filter(([, b]) => b === topicId)
        .map(([id]) => id);
      return fragenIds.length > 0 && fragenIds.every(id => isMastered(meta.meta.fragen[id], srs.srsMap[id]));
    }).length;
  }, [quizMeta, meta.meta.fragen, srs.srsMap]);

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
    shuffleAnswers,
    setShuffleAnswers,

    // Run (Session)
    ...run,
    starteQuiz,
    beantworteFrage,

    // Meta (Persistent)
    metaProgress: meta.meta,
    meisterCount,
    lernCount,
    passedTopicsArcade,
    passedTopicsHardcore: meta.passedTopicsHardcore,
    masteredTopicsHardcore: meta.masteredTopicsHardcore,
    examMeta: meta.meta.examMeta,
    getFrageMeta: meta.getFrageMeta,
    resetMetaProgression: meta.reset,
    resetAllMetaProgression,
    importMetaProgression: meta.importData,
    clearCurrentRun,
    clearAllRuns,

    // SRS
    srsMap: srs.srsMap,
    srsDueCount: srs.dueCount,
    srsDueFrageIds: srs.dueFrageIds,
    getSRSMeta: srs.getSRSMeta,
    resetSRS: srs.reset,

    // Navigation
    goToView,
    canRemoveTopic,
    removeTopicFromRun,
    unterbrecheRun: handleUnterbrecheRun,
    beendeExam,
    switchGameMode,
    beantworteFlashcard,

    // Favoriten
    favorites: fav.favorites,
    toggleFavorite: fav.toggleFavorite,
    isFavorite: fav.isFavorite,
    resetFavorites: fav.resetFavorites,

    // Notizen
    notes: notes.notes,
    setNote: notes.setNote,
    getNote: notes.getNote,
    resetNotes: notes.resetNotes,

    // History
    historyEntries: history.entries,
    clearHistory: history.clearHistory,
    importHistory: history.importHistory,

    // Tutorial Demo
    isTutorialDemoActive,
    setIsTutorialDemoActive,

    // Backup
    exportFullBackup,
    importFullBackup,
    backupReminderEnabled: settings.backupReminderEnabled,
    lastBackupPrompt: settings.lastBackupPrompt,
    setBackupReminderEnabled: settings.setBackupReminderEnabled,
    showBackupPrompt,
    setShowBackupPrompt,
    handleBackupConfirm,
    handleBackupCancel,
  };
}

export type QuizContext = ReturnType<typeof useQuiz>;
