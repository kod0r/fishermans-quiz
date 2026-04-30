import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Fish,
  BookOpen,
  Trophy,
  Target,
  Flame,
  RotateCcw,
  BarChart3,
  CheckCircle,
  Star,
  Crosshair,
  Layers,
  Repeat,
  Timer,
} from "lucide-react";
import type { QuizContext } from "@/hooks/useQuiz";
import type { GameMode } from "@/types/quiz";
import { isMastered } from "@/utils/srs";
import { canSelectTopic } from "@/utils/topicLocks";
import { TOPICS } from "./start/topics";
import { StatBox } from "./start/StatBox";
import { ModeSelector } from "./start/ModeSelector";
import { TopicGrid } from "./start/TopicGrid";
import { StartViewDialogs, type DialogState } from "./start/StartViewDialogs";

interface Props {
  quiz: QuizContext;
}

export default function StartView({ quiz }: Props) {
  const [ausgewaehlt, setAusgewaehlt] = useState<string[]>([]);
  const [fehler, setFehler] = useState("");
  const [nurFavoriten, setNurFavoriten] = useState(false);
  const [flashcardMode, setFlashcardMode] = useState(false);

  const [dialog, setDialog] = useState<DialogState>(null);

  const handleSwitchMode = (targetMode: GameMode) => {
    if (targetMode === quiz.gameMode) return;
    if (
      quiz.isActive &&
      (quiz.gameMode === "exam" || quiz.gameMode === "hardcore")
    ) {
      setDialog({ type: "confirm-mode-switch", targetMode });
      return;
    }
    quiz.switchGameMode(targetMode);
  };

  const {
    metaProgress,
    lernCount,
    isActive,
    loadedTopics,
    statistiken,
    gameMode,
  } = quiz;
  const totalTopics = TOPICS.length;

  const effektivAusgewaehlt = useMemo(
    () =>
      isActive ? [...new Set([...loadedTopics, ...ausgewaehlt])] : ausgewaehlt,
    [isActive, loadedTopics, ausgewaehlt]
  );

  const toggle = (id: string) => {
    setFehler("");
    if (isActive && loadedTopics.includes(id)) {
      if (quiz.gameMode === "hardcore") {
        setDialog({ type: "end-hardcore", topicId: id });
        return;
      }
      const count = quiz.aktiveFragen.filter((f) => f.topic === id).length;
      if (count === 0) {
        quiz.removeTopicFromRun(id);
        setAusgewaehlt((p) => p.filter((x) => x !== id));
        return;
      }
      setDialog({ type: "remove-arcade", topicId: id, fragenCount: count });
      return;
    }
    if (!ausgewaehlt.includes(id)) {
      if (
        quiz.quizMeta &&
        !canSelectTopic(
          id,
          gameMode,
          metaProgress,
          isActive,
          loadedTopics
        )
      ) {
        setFehler(
          "Dieses Thema ist im Hardcore-Modus gesperrt. Beende den aktuellen Run oder wähle ein anderes Thema."
        );
        return;
      }
    }
    setAusgewaehlt((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );
  };

  const handleKeyToggle = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle(id);
    }
  };

  const handleStart = useCallback(() => {
    if (effektivAusgewaehlt.length === 0) {
      setFehler("Bitte wähle mindestens ein Thema aus.");
      return;
    }
    if (nurFavoriten && quiz.favorites.length === 0) {
      setFehler("Noch keine Favoriten vorhanden.");
      return;
    }
    quiz.starteQuiz(effektivAusgewaehlt, {
      nurFavoriten,
      sessionType: flashcardMode ? "flashcard" : "quiz",
    });
  }, [effektivAusgewaehlt, nurFavoriten, quiz, flashcardMode]);

  const handleExamStart = useCallback(() => {
    quiz.starteQuiz(
      TOPICS.map((b) => b.id),
      {
        sessionType: "quiz",
      }
    );
  }, [quiz]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        const target = e.target as HTMLElement;
        if (target.isContentEditable) return;
        if (target instanceof Element) {
          const tag = target.tagName;
          if (
            tag === "BUTTON" ||
            tag === "A" ||
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT"
          ) {
            return;
          }
        }
        if (gameMode === "exam" && !isActive) {
          handleExamStart();
        } else if (effektivAusgewaehlt.length > 0) {
          handleStart();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [effektivAusgewaehlt, handleStart, gameMode, isActive, handleExamStart]);

  const handleWeaknessTrainer = () => {
    const allTopics = TOPICS.map((b) => b.id);
    quiz.starteQuiz(allTopics, {
      filter: "weak",
      sessionType: flashcardMode ? "flashcard" : "quiz",
    });
  };

  const handleSRSReview = () => {
    const allTopics = TOPICS.map((b) => b.id);
    quiz.starteQuiz(allTopics, {
      filter: "srs-due",
      sessionType: flashcardMode ? "flashcard" : "quiz",
    });
  };

  const gesamtFragen = effektivAusgewaehlt.reduce((sum, topicId) => {
    return sum + (quiz.quizMeta?.meta.topics[topicId] ?? 0);
  }, 0);

  return (
    <TooltipProvider delayDuration={800}>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-blue-950 dark:via-slate-900 dark:to-teal-950">
        <div className="container mx-auto px-3 sm:px-4 py-1 sm:py-2 pb-20 sm:pb-24 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-2 sm:mb-3 pt-0 sm:pt-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Fish
                className="w-7 h-7 sm:w-8 sm:h-8 text-teal-400"
                aria-hidden="true"
              />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                Fisherman's Quiz
              </h1>
            </div>
          </div>

          {/* Aktiver Run Info */}
          {isActive && (
            <Card className="mb-1.5 py-1 bg-teal-50 border-teal-300/50 dark:bg-teal-900/30 dark:border-teal-500/30">
              <CardContent className="py-1 px-3">
                <div className="text-center">
                  <p className="text-teal-700 font-medium text-sm dark:text-teal-300">
                    Aktiver Quiz-Run
                  </p>
                  <p className="text-slate-500 text-xs dark:text-slate-400">
                    {gameMode === "exam"
                      ? "Alle Themen"
                      : loadedTopics.join(", ")}{" "}
                    — {statistiken.beantwortet}/{statistiken.gesamt} beantwortet
                  </p>
                  {gameMode !== "exam" && (
                    <p className="text-slate-400 text-[10px] mt-0.5 dark:text-slate-500">
                      Weitere Themen können hinzugefügt werden.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Meta-Progress */}
          <Card className="mb-1.5 py-1 bg-white/80 border-slate-200/50 dark:bg-slate-800/50 dark:border-slate-700/50">
            <CardContent className="py-1 px-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3
                    className="w-4 h-4 text-teal-400 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-slate-900 font-medium text-sm dark:text-white">
                      Gesamtfortschritt
                    </p>
                    <p className="text-slate-500 text-xs dark:text-slate-400">
                      {gameMode === "arcade"
                        ? quiz.passedTopicsArcade > 0
                          ? `${quiz.passedTopicsArcade} von ${totalTopics} Themen gemeistert • ${metaProgress.stats.totalQuestionsAnswered} beantwortete Fragen`
                          : "Noch keine Fragen beantwortet"
                        : gameMode === "exam"
                          ? metaProgress.examMeta &&
                            metaProgress.examMeta.attempts > 0
                            ? `Prüfungsversuche: ${metaProgress.examMeta.attempts} | Bestanden: ${metaProgress.examMeta.passedCount} | Bestes Ergebnis: ${metaProgress.examMeta.bestScore}%`
                            : "Noch keine Prüfung absolviert"
                          : quiz.masteredTopicsHardcore > 0 ||
                              quiz.passedTopicsHardcore > 0
                            ? `${quiz.masteredTopicsHardcore} von ${totalTopics} gemeistert • ${quiz.passedTopicsHardcore} bestanden`
                            : "Noch keine Themen absolviert"}
                    </p>
                  </div>
                </div>

                <ModeSelector
                  currentMode={gameMode}
                  onSwitchMode={handleSwitchMode}
                />
              </div>

              {/* Statistiken */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 mb-2">
                {gameMode === "arcade" ? (
                  <>
                    <StatBox
                      icon={Trophy}
                      iconColor="text-amber-400"
                      value={quiz.passedTopicsArcade}
                      label="Gemeisterte Themen"
                    />
                    <StatBox
                      icon={Target}
                      iconColor="text-blue-400"
                      value={lernCount}
                      label="In Bearbeitung"
                    />
                    <StatBox
                      icon={Flame}
                      iconColor="text-orange-400"
                      value={metaProgress.stats.bestStreak}
                      label="Längste Serie"
                    />
                    <StatBox
                      icon={RotateCcw}
                      iconColor="text-emerald-400"
                      value={metaProgress.stats.totalRuns}
                      label="Gestartete Runden"
                    />
                    <StatBox
                      icon={Star}
                      iconColor="text-amber-400"
                      value={metaProgress.stats.arcadeRunsCompleted ?? 0}
                      label="Beendete Runden"
                    />
                    <StatBox
                      icon={BarChart3}
                      iconColor="text-purple-400"
                      value={metaProgress.stats.totalQuestionsAnswered}
                      label="Beantwortete Fragen"
                    />
                    <StatBox
                      icon={CheckCircle}
                      iconColor="text-teal-400"
                      value={metaProgress.stats.totalCorrect}
                      label="Richtige Antworten"
                    />
                    {quiz.srsDueCount > 0 && (
                      <StatBox
                        icon={Repeat}
                        iconColor="text-indigo-400"
                        value={quiz.srsDueCount}
                        label="Wiederholung fällig"
                      />
                    )}
                  </>
                ) : gameMode === "exam" ? (
                  <>
                    <StatBox
                      icon={RotateCcw}
                      iconColor="text-blue-400"
                      value={metaProgress.examMeta?.attempts ?? 0}
                      label="Prüfungsversuche"
                    />
                    <StatBox
                      icon={CheckCircle}
                      iconColor="text-emerald-400"
                      value={metaProgress.examMeta?.passedCount ?? 0}
                      label="Bestanden"
                    />
                    <StatBox
                      icon={Trophy}
                      iconColor="text-amber-400"
                      value={metaProgress.examMeta?.bestScore ?? 0}
                      label="Bestes Ergebnis %"
                    />
                    <StatBox
                      icon={Target}
                      iconColor="text-purple-400"
                      value={metaProgress.examMeta?.lastScore ?? 0}
                      label="Letztes Ergebnis %"
                    />
                    <StatBox
                      icon={BarChart3}
                      iconColor="text-teal-400"
                      value={metaProgress.stats.totalQuestionsAnswered}
                      label="Beantwortete Fragen"
                    />
                    <StatBox
                      icon={CheckCircle}
                      iconColor="text-teal-400"
                      value={metaProgress.stats.totalCorrect}
                      label="Richtige Antworten"
                    />
                  </>
                ) : (
                  <>
                    <StatBox
                      icon={Trophy}
                      iconColor="text-amber-400"
                      value={quiz.masteredTopicsHardcore}
                      label="Gemeisterte Themen"
                    />
                    <StatBox
                      icon={CheckCircle}
                      iconColor="text-emerald-400"
                      value={quiz.passedTopicsHardcore}
                      label="Bestandene Themen"
                    />
                    <StatBox
                      icon={Target}
                      iconColor="text-blue-400"
                      value={lernCount}
                      label="In Bearbeitung"
                    />
                    <StatBox
                      icon={Flame}
                      iconColor="text-orange-400"
                      value={metaProgress.stats.bestStreak}
                      label="Längste Serie"
                    />
                    <StatBox
                      icon={BarChart3}
                      iconColor="text-purple-400"
                      value={metaProgress.stats.totalQuestionsAnswered}
                      label="Beantwortete Fragen"
                    />
                    <StatBox
                      icon={CheckCircle}
                      iconColor="text-teal-400"
                      value={metaProgress.stats.totalCorrect}
                      label="Richtige Antworten"
                    />
                  </>
                )}
              </div>

              {/* Erfolgsquote */}
              {metaProgress.stats.totalQuestionsAnswered > 0 && (
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span
                      id="erfolgsquote-label"
                      className="text-slate-600 dark:text-slate-300"
                    >
                      Erfolgsquote
                    </span>
                    <span className="text-teal-600 font-medium dark:text-teal-400">
                      {Math.round(
                        (metaProgress.stats.totalCorrect /
                          metaProgress.stats.totalQuestionsAnswered) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      (metaProgress.stats.totalCorrect /
                        metaProgress.stats.totalQuestionsAnswered) *
                      100
                    }
                    className="h-1.5 bg-slate-200 dark:bg-slate-700"
                    aria-labelledby="erfolgsquote-label"
                  />
                </div>
              )}

              {/* Themen-Fortschritte */}
              <div className="space-y-1 mb-2">
                {TOPICS.map((b) => {
                  const Icon = b.icon;
                  const fragenIds = Object.entries(
                    quiz.quizMeta?.fragenIndex ?? {}
                  )
                    .filter(([, topic]) => topic === b.id)
                    .map(([id]) => id);
                  const gem = fragenIds.filter((id) =>
                    isMastered(metaProgress.fragen[id], quiz.srsMap[id])
                  ).length;
                  const lern = fragenIds.filter((id) => {
                    const meta = metaProgress.fragen[id];
                    return (
                      meta &&
                      meta.attempts > 0 &&
                      !isMastered(meta, quiz.srsMap[id])
                    );
                  }).length;
                  const pct = fragenIds.length
                    ? Math.round((gem / fragenIds.length) * 100)
                    : 0;
                  return (
                    <div
                      key={b.id}
                      className="flex items-center gap-2 sm:gap-3"
                    >
                      <div className="flex items-center gap-1.5 w-24 sm:w-32 shrink-0">
                        <Icon
                          className={`w-3.5 h-3.5 ${b.color}`}
                          aria-hidden="true"
                        />
                        <span className="text-slate-500 text-[10px] truncate dark:text-slate-400">
                          {b.label}
                        </span>
                      </div>
                      <Progress
                        value={pct}
                        className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700"
                        aria-label={`${b.label}: ${pct}% gemeistert`}
                      />
                      <div className="flex items-center justify-end gap-1.5 w-16 sm:w-20 shrink-0 text-right">
                        <span className="text-slate-500 text-[10px] dark:text-slate-400">
                          {gem}/{fragenIds.length}
                        </span>
                        {lern > 0 && (
                          <span className="text-blue-600 text-[9px] dark:text-blue-400">
                            {lern}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <StartViewDialogs
            dialog={dialog}
            gameMode={gameMode}
            onClose={() => setDialog(null)}
            quiz={quiz}
            onRemoveTopic={(topicId) =>
              setAusgewaehlt((p) => p.filter((x) => x !== topicId))
            }
            onEndHardcore={(topicId) =>
              setAusgewaehlt((p) => p.filter((x) => x !== topicId))
            }
            onConfirmSwitch={(targetMode) => quiz.switchGameMode(targetMode)}
          />

          {gameMode === "exam" ? (
            /* Prüfungs-Startkarte */
            <Card className="py-1 bg-white/80 border-slate-200/50 backdrop-blur-sm dark:bg-slate-800/50 dark:border-slate-700/50">
              <CardContent className="py-1 px-3">
                <div className="flex flex-col items-center text-center gap-3 py-4 sm:py-6">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-500/20">
                    <Timer
                      className="w-8 h-8 text-blue-600 dark:text-blue-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <h2 className="text-slate-900 font-semibold text-base sm:text-lg dark:text-white">
                      {isActive ? "Prüfung läuft" : "Prüfungsmodus"}
                    </h2>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1 dark:text-slate-400">
                      {isActive
                        ? `${statistiken.beantwortet} von ${statistiken.gesamt} beantwortet`
                        : "60 zufällige Fragen aus allen Themen • 60 Minuten Zeit"}
                    </p>
                  </div>
                  <Button
                    onClick={
                      isActive ? () => quiz.goToView("quiz") : handleExamStart
                    }
                    aria-label={
                      isActive ? "Prüfung fortsetzen" : "Prüfung starten"
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl shadow-lg shadow-blue-600/20 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 w-full sm:w-auto"
                  >
                    {isActive ? "Prüfung fortsetzen" : "Prüfung starten"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Themenauswahl */
            <Card className="py-1 bg-white/80 border-slate-200/50 backdrop-blur-sm dark:bg-slate-800/50 dark:border-slate-700/50">
              <CardContent className="py-1 px-3">
                <h2 className="text-slate-900 font-semibold text-sm sm:text-base flex items-center gap-2 mb-2 sm:mb-3 dark:text-white">
                  <BookOpen
                    className="w-4 h-4 text-teal-400"
                    aria-hidden="true"
                  />
                  Thema auswählen
                </h2>

                <TopicGrid
                  quiz={quiz}
                  gameMode={gameMode}
                  isActive={isActive}
                  loadedTopics={loadedTopics}
                  metaProgress={metaProgress}
                  effektivAusgewaehlt={effektivAusgewaehlt}
                  onToggle={toggle}
                  onKeyToggle={handleKeyToggle}
                />

                {fehler && (
                  <p
                    className="text-red-400 text-xs mt-3 text-center"
                    role="alert"
                  >
                    {fehler}
                  </p>
                )}

                {/* Study Mode Toggles */}
                <div className="flex items-center gap-2 mb-2 mt-1 flex-wrap">
                  <button
                    onClick={() => setNurFavoriten((p) => !p)}
                    aria-pressed={nurFavoriten}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${nurFavoriten ? "bg-amber-50 text-amber-600 border border-amber-300/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30" : "text-slate-500 hover:text-slate-700 border border-transparent dark:text-slate-400 dark:hover:text-slate-300"}`}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${nurFavoriten ? "fill-current" : ""}`}
                    />
                    Nur Favoriten ({quiz.favorites.length})
                  </button>
                  <button
                    onClick={handleWeaknessTrainer}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors text-slate-500 hover:text-red-600 border border-transparent dark:text-slate-400 dark:hover:text-red-400"
                    title="Nur Fragen mit <50% Erfolgsquote"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    Schwächentrainer
                  </button>
                  <button
                    onClick={() => setFlashcardMode((p) => !p)}
                    aria-pressed={flashcardMode}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${flashcardMode ? "bg-indigo-50 text-indigo-600 border border-indigo-300/50 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30" : "text-slate-500 hover:text-slate-700 border border-transparent dark:text-slate-400 dark:hover:text-slate-300"}`}
                    title="Karteikarten-Modus: Antwort erst aufdecken, dann selbst bewerten"
                  >
                    <Layers
                      className={`w-3.5 h-3.5 ${flashcardMode ? "fill-current" : ""}`}
                    />
                    Karteikarten
                  </button>
                  <button
                    onClick={handleSRSReview}
                    disabled={quiz.srsDueCount === 0}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${quiz.srsDueCount > 0 ? "bg-indigo-50 text-indigo-600 border border-indigo-300/50 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30" : "text-slate-400 border border-transparent cursor-not-allowed dark:text-slate-600"}`}
                    title="Nur fällige SRS-Wiederholungen"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    Wiederholung{" "}
                    {quiz.srsDueCount > 0 ? `(${quiz.srsDueCount})` : ""}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                  <p className="text-slate-500 text-xs dark:text-slate-400">
                    {effektivAusgewaehlt.length > 0 ? (
                      <span>
                        <span className="text-teal-400 font-bold">
                          {nurFavoriten
                            ? quiz.favorites.filter((id) =>
                                effektivAusgewaehlt.some(
                                  (b) => quiz.quizMeta?.fragenIndex[id] === b
                                )
                              ).length
                            : gesamtFragen}
                        </span>{" "}
                        Fragen
                      </span>
                    ) : (
                      "Keine Themen ausgewählt"
                    )}
                  </p>
                  <Button
                    onClick={handleStart}
                    aria-label={
                      isActive
                        ? "Ausgewählte Themen zum Quiz hinzufügen"
                        : "Quiz mit ausgewählten Themen starten"
                    }
                    className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg shadow-lg shadow-teal-500/20 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 w-full sm:w-auto"
                  >
                    {isActive ? "Hinzufügen" : "Quiz starten"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
