import { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Waves,
  Heart,
  Scale,
  Eye,
  Zap,
  Shield,
  Timer,
} from "lucide-react";
import type { QuizContext } from "@/hooks/useQuiz";
import type { GameMode } from "@/types/quiz";
import { isMastered } from "@/utils/srs";
import { canSelectTopic, isTopicLocked } from "@/utils/topicLocks";

const TOPICS = [
  {
    id: "Biologie",
    label: "Biologie",
    icon: Fish,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    selectedBg: "bg-emerald-500",
  },
  {
    id: "Gewässerkunde",
    label: "Gewässerkunde",
    icon: Waves,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    selectedBg: "bg-blue-500",
  },
  {
    id: "Gewässerpflege",
    label: "Gewässerpflege",
    icon: Heart,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
    selectedBg: "bg-cyan-500",
  },
  {
    id: "Fanggeräte und -methoden",
    label: "Fanggeräte & Methoden",
    icon: Crosshair,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    selectedBg: "bg-amber-500",
  },
  {
    id: "Recht",
    label: "Recht",
    icon: Scale,
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    selectedBg: "bg-red-500",
  },
  {
    id: "Bilderkennung",
    label: "Bilderkennung",
    icon: Eye,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
    selectedBg: "bg-purple-500",
  },
];

interface Props {
  quiz: QuizContext;
}

export default function StartView({ quiz }: Props) {
  const [ausgewaehlt, setAusgewaehlt] = useState<string[]>([]);
  const [fehler, setFehler] = useState("");
  const [nurFavoriten, setNurFavoriten] = useState(false);
  const [flashcardMode, setFlashcardMode] = useState(false);

  type DialogState =
    | { type: "remove-arcade"; topicId: string; fragenCount: number }
    | { type: "end-hardcore"; topicId: string }
    | { type: "confirm-mode-switch"; targetMode: GameMode }
    | null;
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

  function getTopicStatus(topicId: string) {
    if (gameMode === "exam") return null;
    // Arcade: Sterne primär, Fallback Bestanden bei Mastery ohne Sterne
    if (gameMode === "arcade") {
      const stars = metaProgress.arcadeStars?.[topicId];
      if (stars) {
        return {
          icon: "★".repeat(stars) + "☆".repeat(3 - stars),
          label: "",
          cls: "text-amber-500 bg-amber-500/10 border-amber-500/20 dark:text-amber-400",
        };
      }
      const fragenIds = Object.entries(quiz.quizMeta?.fragenIndex ?? {})
        .filter(([, b]) => b === topicId)
        .map(([id]) => id);
      const allMastered =
        fragenIds.length > 0 &&
        fragenIds.every((id) =>
          isMastered(metaProgress.fragen[id], quiz.srsMap[id]),
        );
      if (allMastered) {
        return {
          icon: "✅",
          label: "Bestanden",
          cls: "text-emerald-600 bg-emerald-500/20 border-emerald-500/30 dark:text-emerald-400",
        };
      }
    }
    // Hardcore: check topic-level results
    if (gameMode === "hardcore") {
      const tMeta = metaProgress.topics[topicId];
      if (tMeta) {
        if (tMeta.mastered) {
          return {
            icon: "🏆",
            label: "Gemeistert",
            cls: "text-amber-600 bg-amber-500/20 border-amber-500/30 dark:text-amber-400",
          };
        }
        if (tMeta.passed) {
          return {
            icon: "✅",
            label: "Bestanden",
            cls: "text-emerald-600 bg-emerald-500/20 border-emerald-500/30 dark:text-emerald-400",
          };
        }
        if (tMeta.lastAttempt) {
          return {
            icon: "❌",
            label: "Nicht bestanden",
            cls: "text-red-600 bg-red-500/20 border-red-500/30 dark:text-red-400",
          };
        }
      }
    }
    // Only show AKTIV if no completion status exists
    if (isActive && loadedTopics.includes(topicId)) {
      return {
        icon: "🔒",
        label: "AKTIV",
        cls: "text-teal-600 bg-teal-500/20 border-teal-500/30 dark:text-teal-400",
      };
    }
    return null;
  }

  const effektivAusgewaehlt = useMemo(
    () =>
      isActive ? [...new Set([...loadedTopics, ...ausgewaehlt])] : ausgewaehlt,
    [isActive, loadedTopics, ausgewaehlt],
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
    // Trying to select a new topic — enforce lock rules
    if (!ausgewaehlt.includes(id)) {
      if (
        quiz.quizMeta &&
        !canSelectTopic(
          id,
          gameMode,
          metaProgress,
          quiz.quizMeta,
          isActive,
          loadedTopics,
        )
      ) {
        setFehler(
          "Dieses Thema ist im Hardcore-Modus gesperrt. Beende den aktiven Run oder wähle ein anderes Thema.",
        );
        return;
      }
    }
    setAusgewaehlt((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
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
      },
    );
  }, [quiz]);

  // Global Enter handler to start quiz when areas are selected
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        const target = e.target as HTMLElement;
        if (target.isContentEditable) return;
        // Only trigger if focus is not inside a button or interactive element
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
              {/* <button
                onClick={() => quiz.goToView('help')}
                className="ml-1 p-1 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
                aria-label="Hilfe öffnen"
                title="Hilfe & Tutorials"
              >
                <HelpCircle className="w-5 h-5 text-slate-400 hover:text-teal-400 transition-colors" />
              </button> */}
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

          {/* Meta-Progress — immer sichtbar, kompakt */}
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

                {/* Spielmodus-Switcher */}
                <div className="flex items-center bg-slate-200/60 dark:bg-slate-700/40 rounded-lg p-0.5 shrink-0">
                  <ModeButton
                    mode="arcade"
                    currentMode={gameMode}
                    icon={Zap}
                    label="Arcade"
                    subtitle="Ein Retry pro Frage. Themen jederzeit änderbar."
                    activeClass="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                    onClick={() => handleSwitchMode("arcade")}
                  />
                  <ModeButton
                    mode="exam"
                    currentMode={gameMode}
                    icon={Timer}
                    label="Prüfung"
                    subtitle="60 Fragen, 60 Minuten, 60 % zum Bestehen."
                    activeClass="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                    onClick={() => handleSwitchMode("exam")}
                  />
                  <ModeButton
                    mode="hardcore"
                    currentMode={gameMode}
                    icon={Shield}
                    label="Hardcore"
                    subtitle="Ein Fehler sperrt das Thema. Keine Retries."
                    activeClass="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                    onClick={() => handleSwitchMode("hardcore")}
                  />
                </div>
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
                          100,
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
                    quiz.quizMeta?.fragenIndex ?? {},
                  )
                    .filter(([, topic]) => topic === b.id)
                    .map(([id]) => id);
                  const gem = fragenIds.filter((id) =>
                    isMastered(metaProgress.fragen[id], quiz.srsMap[id]),
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

          {/* Dialogs — mode-independent, always mounted */}
          <AlertDialog
            open={dialog?.type === "remove-arcade"}
            onOpenChange={() => setDialog(null)}
          >
            <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-slate-900 dark:text-white">
                  Thema entfernen
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
                  Dies entfernt{" "}
                  {dialog?.type === "remove-arcade" ? dialog.fragenCount : 0}{" "} ursprüngliche
                  Fragen aus dem aktiven Quiz und beendet den aktuellen
                  Durchlauf.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => setDialog(null)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Abbrechen
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (dialog?.type === "remove-arcade") {
                      quiz.removeTopicFromRun(dialog.topicId);
                      setAusgewaehlt((p) =>
                        p.filter((x) => x !== dialog.topicId),
                      );
                    }
                    setDialog(null);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Entfernen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog
            open={dialog?.type === "end-hardcore"}
            onOpenChange={() => setDialog(null)}
          >
            <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-slate-900 dark:text-white">
                  Hardcore-Run beenden
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
                  Im Hardcore-Modus wird der gesamte Run unterbrochen, wenn du
                  ein Thema abwählst. Alle Fortschritte dieses Runs gehen
                  verloren.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => setDialog(null)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Abbrechen
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (dialog?.type === "end-hardcore") {
                      quiz.unterbrecheRun();
                      setAusgewaehlt((p) =>
                        p.filter((x) => x !== dialog.topicId),
                      );
                    }
                    setDialog(null);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Run beenden
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog
            open={dialog?.type === "confirm-mode-switch"}
            onOpenChange={() => setDialog(null)}
          >
            <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-slate-900 dark:text-white">
                  {gameMode === "exam"
                    ? "Laufende Prüfung beenden?"
                    : "Hardcore-Run beenden?"}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
                  {gameMode === "exam"
                    ? "Der Moduswechsel beendet die aktuelle Prüfung. Bereits gegebene Antworten werden gewertet. Dies kann nicht rückgängig gemacht werden."
                    : "Im Hardcore-Modus endet der gesamte Run beim Moduswechsel. Alle Themen dieses Runs werden als nicht bestanden gewertet. Dies kann nicht rückgängig gemacht werden."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => setDialog(null)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Abbrechen
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (dialog?.type === "confirm-mode-switch") {
                      quiz.switchGameMode(dialog.targetMode);
                    }
                    setDialog(null);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {gameMode === "exam"
                    ? "Prüfung beenden und wechseln"
                    : "Run beenden und wechseln"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

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
                  {isActive ? "Thema auswählen" : "Thema auswählen"}
                </h2>

                <div
                  className="space-y-1"
                  role="group"
                  aria-label="Themenauswahl"
                >
                  {TOPICS.map((b) => {
                    const Icon = b.icon;
                    const inRun = isActive && loadedTopics.includes(b.id);
                    const checked = effektivAusgewaehlt.includes(b.id);
                    const status = getTopicStatus(b.id);
                    const selectable = quiz.quizMeta
                      ? canSelectTopic(
                          b.id,
                          gameMode,
                          metaProgress,
                          quiz.quizMeta,
                          isActive,
                          loadedTopics,
                        )
                      : true;
                    const disabled = !selectable && !checked && !inRun;
                    const locked =
                      gameMode === "hardcore" &&
                      isTopicLocked(b.id, gameMode, metaProgress);

                    const topicItem = (
                      <div
                        onClick={() => !disabled && toggle(b.id)}
                        onKeyDown={(e) => !disabled && handleKeyToggle(e, b.id)}
                        role="checkbox"
                        aria-checked={checked}
                        aria-disabled={disabled}
                        tabIndex={disabled ? -1 : 0}
                        className={`flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg border transition-all focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 ${checked ? `${b.bg} ${b.border} shadow-md` : "bg-slate-200/50 border-slate-300/30 dark:bg-slate-700/30 dark:border-slate-600/30"} ${inRun ? "ring-1 ring-teal-400/30" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-slate-300/50 dark:hover:bg-slate-700/50"}`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${checked ? `${b.selectedBg} border-transparent` : "border-slate-500 bg-transparent"}`}
                          aria-hidden="true"
                        >
                          {checked && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <div
                          className={`p-1.5 rounded-md ${b.bg}`}
                          aria-hidden="true"
                        >
                          <Icon className={`w-4 h-4 ${b.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-slate-900 font-medium text-sm truncate dark:text-white">
                              {b.label}
                            </p>
                            {locked ? (
                              <span className="px-1 py-0 rounded text-[9px] flex-shrink-0 border text-slate-600 bg-slate-500/20 border-slate-500/30 dark:text-slate-400">
                                🔒 Gesperrt
                              </span>
                            ) : (
                              status && (
                                <span
                                  className={`px-1 py-0 rounded text-[9px] flex-shrink-0 border ${status.cls}`}
                                >
                                  {status.icon} {status.label}
                                </span>
                              )
                            )}
                          </div>
                          <p className="text-slate-500 text-xs dark:text-slate-400">
                            {quiz.quizMeta?.meta.topics[b.id] ?? 0} Fragen
                          </p>
                        </div>
                      </div>
                    );

                    return locked ? (
                      <Tooltip key={b.id}>
                        <TooltipTrigger asChild>{topicItem}</TooltipTrigger>
                        <TooltipContent side="top">
                          Fehlversuch. Bestehe ein anderes Thema, um dieses
                          wieder freizuschalten.
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Fragment key={b.id}>{topicItem}</Fragment>
                    );
                  })}
                </div>

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
                                  (b) => quiz.quizMeta?.fragenIndex[id] === b,
                                ),
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

          {/* <p className="text-center text-slate-400 text-xs mt-4 sm:mt-5 dark:text-slate-500">Prüfungsfragen zur Staatlichen Fischerprüfung aus dem Bayerischer Fragenkatalog (Stand: 11.03.2026)</p> */}
        </div>
      </div>
    </TooltipProvider>
  );
}

// ── Hilfskomponenten ──

function StatBox({
  icon: Icon,
  iconColor,
  value,
  label,
}: {
  icon: typeof Trophy;
  iconColor: string;
  value: number;
  label: string;
}) {
  return (
    <div
      className="text-center p-1 sm:p-1.5 rounded-lg bg-slate-200/50 dark:bg-slate-700/30"
      aria-label={`${label}: ${value}`}
    >
      <Icon
        className={`w-4 h-4 ${iconColor} mx-auto mb-0.5`}
        aria-hidden="true"
      />
      <p className="text-base sm:text-lg font-bold text-slate-900 leading-tight dark:text-white">
        {value}
      </p>
      <p className="text-[10px] text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function ModeButton({
  mode,
  currentMode,
  icon: Icon,
  label,
  subtitle,
  activeClass,
  onClick,
}: {
  mode: GameMode;
  currentMode: GameMode;
  icon: typeof Zap;
  label: string;
  subtitle: string;
  activeClass: string;
  onClick: () => void;
}) {
  const isActive = mode === currentMode;
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
        isActive
          ? `${activeClass} shadow-sm`
          : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
      }`}
      aria-pressed={isActive}
      aria-label={`${label}${isActive ? " (aktiv)" : ""}`}
    >
      <span className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        <span className="hidden sm:inline">{label}</span>
      </span>
      {isActive && (
        <span className="hidden md:inline text-[9px] opacity-80 mt-0.5 max-w-[140px] truncate">
          {subtitle}
        </span>
      )}
    </button>
  );
}
