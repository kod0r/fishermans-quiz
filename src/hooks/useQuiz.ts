import { useState, useCallback, useEffect, useMemo } from 'react';
import type { QuizData, AppView, QuizStartOptions, SelfAssessmentGrade, GameMode } from '@/types/quiz';
import type { QuizMeta } from '@/utils/quizLoader';
import { loadQuizMeta, buildQuizData, loadAllQuizData, AppBackupSchema } from '@/utils/quizLoader';
import { MetaStorage, RunStorage, SettingsStorage, FavoritesStorage, NotesStorage, HistoryStorage, SRSStorage } from '@/utils/storage';
import { useQuizRun } from '@/store/quizRun';
import { useMetaProgress } from '@/store/metaProgress';
import { useSettings } from '@/store/settings';
import { useFavorites } from '@/store/favorites';
import { useNotes } from '@/store/notes';
import { useHistory } from '@/store/history';
import { useSRS } from '@/store/srs';
import { isMastered } from '@/utils/srs';
import { canSelectTopic } from '@/utils/topicLocks';
import { filterQuizDataByFavorites, filterQuizDataByWeakness, filterQuizDataBySRSDue } from '@/utils/filter';

const EXAM_DURATION_SECONDS = 60 * 60;

export function useQuiz() {
  const [quizMeta, setQuizMeta] = useState<QuizMeta | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [view, setView] = useState<AppView>('start');
  const [istGeladen, setIstGeladen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const settings = useSettings();
  const { gameMode, setGameMode, backupReminderEnabled, lastBackupPrompt, setLastBackupPrompt } = settings;
  const run = useQuizRun(quizData, gameMode);
  const meta = useMetaProgress(gameMode);
  const srs = useSRS();
  const fav = useFavorites();
  const notes = useNotes();
  const history = useHistory();

  // Vollständiger Backup-Export
  const exportFullBackup = useCallback(() => {
    const backup = {
      version: '1' as const,
      exportedAt: new Date().toISOString(),
      settings: settings.settings,
      metaArcade: MetaStorage.load('arcade'),
      metaHardcore: MetaStorage.load('hardcore'),
      metaExam: MetaStorage.load('exam'),
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
    MetaStorage.save('arcade', backup.metaArcade);
    MetaStorage.save('hardcore', backup.metaHardcore);
    MetaStorage.save('exam', backup.metaExam);
    SettingsStorage.save(backup.settings);
    FavoritesStorage.save(backup.favorites);
    NotesStorage.save(backup.notes);
    HistoryStorage.save(backup.history);
    SRSStorage.save(backup.srs);
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
    run.unterbrecheRun();
  }, [run]);

  // Alle Modi zurücksetzen
  const resetAllMetaProgression = useCallback(() => {
    MetaStorage.clear('arcade');
    MetaStorage.clear('hardcore');
    MetaStorage.clear('exam');
    meta.reset();
  }, [meta]);

  const clearAllRuns = useCallback(() => {
    RunStorage.clear('arcade');
    RunStorage.clear('hardcore');
    RunStorage.clear('exam');
    run.unterbrecheRun();
  }, [run]);

  // Hilfsfunktion: Session als abgeschlossen loggen
  const logRunIfComplete = useCallback((finalAntworten: Record<string, string>) => {
    if (!run.isActive || !run.rawRun) return;
    const alleBeantwortet = run.aktiveFragen.every(f => finalAntworten[f.id] !== undefined);
    if (!alleBeantwortet) return;

    const korrekt = run.aktiveFragen.filter(f => finalAntworten[f.id] === f.richtige_antwort).length;
    const duration = run.rawRun.startedAt
      ? Math.round((Date.now() - new Date(run.rawRun.startedAt).getTime()) / 1000)
      : 0;

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

    // Hardcore: Sofortiges Fail bei falscher Antwort + End-Prüfung
    if (gameMode === 'hardcore' && run.isActive) {
      if (!isCorrect) {
        const topicId = frage.topic;
        if (run.loadedTopics.includes(topicId)) {
          meta.recordTopicResult(topicId, false);
        }
      }

      if (alleBeantwortet) {
        for (const topicId of run.loadedTopics) {
          const topicQuestions = run.aktiveFragen.filter(f => f.topic === topicId);
          const alleRichtig = topicQuestions.every(f => neueAntworten[f.id] === f.richtige_antwort);
          meta.recordTopicResult(topicId, alleRichtig);
        }
      }
    }

    // Arcade: Sterne + Highscore pro Topic bei Run-Abschluss
    if (gameMode === 'arcade' && alleBeantwortet) {
      for (const topicId of run.loadedTopics) {
        const topicQuestions = run.aktiveFragen.filter(f => f.topic === topicId);
        const korrekt = topicQuestions.filter(f => neueAntworten[f.id] === f.richtige_antwort).length;
        const pct = topicQuestions.length > 0 ? Math.round((korrekt / topicQuestions.length) * 100) : 0;
        meta.recordArcadeRunComplete(topicId, pct);
      }
    }

    logRunIfComplete(neueAntworten);
  }, [run, meta, gameMode, logRunIfComplete, srs]);

  // Starten: Lazy Loading der Bereichs-Fragen
  const starteQuiz = useCallback(async (topics: string[], options: QuizStartOptions = {}) => {
    if (!quizMeta) return;

    // Guard: validate all requested topics can be selected in current mode
    const locked = topics.filter(id => !canSelectTopic(id, gameMode, meta.meta, quizMeta, run.isActive, run.loadedTopics));
    if (locked.length > 0) {
      console.error('[useQuiz] Cannot start quiz — locked topics:', locked);
      return;
    }

    const { nurFavoriten = false, filter = 'all' } = options;
    let { limit } = options;

    // Exam mode: fixed 60 questions, 60 minutes
    if (gameMode === 'exam' && !limit) {
      limit = 60;
    }

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
    const durationSeconds = gameMode === 'exam' ? EXAM_DURATION_SECONDS : undefined;
    const sessionType = options.sessionType ?? 'quiz';
    run.starteRun(topics, filteredData, limit, durationSeconds, sessionType);
    if (isNewRun) meta.recordRunStart();
    setView('quiz');
  }, [run, meta, quizData, quizMeta, fav.favorites, gameMode, srs.dueFrageIds]);

  const goToView = useCallback((v: AppView) => setView(v), []);

  const removeTopicFromRun = useCallback((topicId: string) => {
    run.removeTopic(topicId);
  }, [run]);

  const logCurrentRun = useCallback((finalDuration?: number) => {
    if (!run.isActive) return;
    const duration = finalDuration ?? (run.rawRun?.startedAt
      ? Math.round((Date.now() - new Date(run.rawRun.startedAt).getTime()) / 1000)
      : 0);
    history.addEntry({
      topics: [...run.loadedTopics],
      score: run.statistiken.korrekt,
      total: run.aktiveFragen.length,
      duration,
      mode: gameMode,
    });
  }, [run, history, gameMode]);

  const handleUnterbrecheRun = useCallback(() => {
    if (gameMode === 'hardcore') {
      for (const topicId of run.loadedTopics) {
        meta.recordTopicResult(topicId, false);
      }
    }

    // Logge abgebrochene Session nur wenn mindestens eine Frage beantwortet wurde
    if (run.isActive && run.statistiken.beantwortet > 0) {
      logCurrentRun();
    }

    run.unterbrecheRun();
  }, [run, meta, gameMode, logCurrentRun]);

  const beendeExam = useCallback(() => {
    if (!run.isActive || gameMode !== 'exam') return;
    logCurrentRun();

    const total = run.aktiveFragen.length;
    const korrekt = run.statistiken.korrekt;
    const scorePct = total > 0 ? Math.round((korrekt / total) * 100) : 0;
    const passed = scorePct >= 60;
    meta.recordExamResult(scorePct, passed);

    run.beendeRun();
    setView('progress');
  }, [run, gameMode, logCurrentRun, meta]);

  // Zentraler Moduswechsel — beendet aktive Runs gemäß Modus-Regeln
  const switchGameMode = useCallback((newMode: GameMode) => {
    if (run.isActive) {
      if (gameMode === 'hardcore') {
        // Hardcore: alle Themen im Run als nicht bestanden markieren
        for (const topicId of run.loadedTopics) {
          meta.recordTopicResult(topicId, false);
        }
        if (run.statistiken.beantwortet > 0) {
          logCurrentRun();
        }
        run.unterbrecheRun();
      } else if (gameMode === 'exam') {
        // Exam: Ergebnis loggen und beenden
        logCurrentRun();
        const total = run.aktiveFragen.length;
        const korrekt = run.statistiken.korrekt;
        const scorePct = total > 0 ? Math.round((korrekt / total) * 100) : 0;
        const passed = scorePct >= 60;
        meta.recordExamResult(scorePct, passed);
        run.beendeRun();
        if (view === 'quiz') {
          setView('progress');
        }
      }
      // Arcade: Run bleibt modus-spezifisch erhalten, kein Eingriff nötig
    }
    setGameMode(newMode);
  }, [run, meta, gameMode, logCurrentRun, setGameMode, view]);

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
      return gameMode === 'arcade';
    },
    [run, gameMode]
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
    if (!quizMeta || gameMode !== 'arcade') return 0;
    const allTopics = Object.keys(quizMeta.meta.topics);
    return allTopics.filter(topicId => {
      const fragenIds = Object.entries(quizMeta.fragenIndex)
        .filter(([, b]) => b === topicId)
        .map(([id]) => id);
      return fragenIds.length > 0 && fragenIds.every(id => isMastered(meta.meta.fragen[id], srs.srsMap[id]));
    }).length;
  }, [quizMeta, meta.meta.fragen, srs.srsMap, gameMode]);

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
