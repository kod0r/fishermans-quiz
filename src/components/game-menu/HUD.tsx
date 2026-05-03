import { useState, useEffect, useMemo } from "react";
import { Home, Menu, Pause, Play, Zap, Timer, Shield, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuizContext } from "@/hooks/useQuiz";
import type { MenuPageId } from "@/hooks/useGameMenu";

interface GameMenuApi {
  open: () => void;
  openTo: (page: MenuPageId) => void;
  isOpen: boolean;
}

interface HUDProps {
  quiz: QuizContext;
  gameMenu: GameMenuApi;
}

function formatRemaining(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function HUD({ quiz, gameMenu }: HUDProps) {
  const isQuizActive = quiz.isActive;
  const currentView = quiz.view;
  const isExam = quiz.gameMode === "exam";

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!isExam || !isQuizActive || !quiz.rawRun?.startedAt || !quiz.rawRun?.durationSeconds) {
      setRemainingSeconds(null);
      return;
    }

    const start = new Date(quiz.rawRun.startedAt).getTime();
    const durationMs = quiz.rawRun.durationSeconds * 1000;
    let animationFrameId: number | null = null;

    const tick = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
      setRemainingSeconds(remaining);

      if (remaining > 0) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isExam, isQuizActive, quiz.rawRun?.startedAt, quiz.rawRun?.durationSeconds]);

  const modeBadge = useMemo(() => {
    if (!isQuizActive) return null;
    switch (quiz.gameMode) {
      case "arcade":
        return (
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <Zap className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold leading-none">Arcade</span>
          </div>
        );
      case "exam":
        return (
          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <Timer className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold leading-none">Prüfung</span>
          </div>
        );
      case "hardcore":
        return (
          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold leading-none">Hardcore</span>
          </div>
        );
      default:
        return null;
    }
  }, [isQuizActive, quiz.gameMode]);

  return (
    <div
      data-testid="hud-bar"
      className="
        fixed bottom-0 left-0 right-0 z-50
        flex justify-center
        pb-[env(safe-area-inset-bottom)]
      "
    >
      <div className="relative flex items-center gap-1.5 bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-2xl px-2.5 py-1.5 shadow-lg shadow-black/10 dark:bg-slate-900/90 dark:border-slate-700/60 dark:shadow-black/20">
        {modeBadge && (
          <div className="flex items-center px-2">
            {modeBadge}
          </div>
        )}

        {remainingSeconds !== null && (
          <div className={`flex items-center px-1 ${remainingSeconds <= 0 ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-200"}`}>
            <span className="text-xs font-mono font-semibold leading-none">
              {formatRemaining(remainingSeconds)}
            </span>
          </div>
        )}

        <Button
          onClick={gameMenu.open}
          variant="ghost"
          size="icon"
          aria-label="Menü öffnen"
          className="w-9 h-9 rounded-xl bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <Menu className="w-4 h-4" />
        </Button>

        {currentView !== "start" && (
          <Button
            onClick={() => quiz.goToView("start")}
            variant="ghost"
            size="icon"
            aria-label="Zur Startseite"
            className="w-8 h-8 rounded-xl bg-slate-100/80 text-teal-500 hover:bg-slate-200 hover:text-teal-600 dark:bg-slate-800/80 dark:text-teal-400 dark:hover:bg-slate-700"
          >
            <Home className="w-4 h-4" />
          </Button>
        )}

        {currentView !== "quiz" && isQuizActive && (
          <Button
            onClick={() => quiz.goToView("quiz")}
            variant="ghost"
            size="icon"
            aria-label={isExam ? "Prüfung fortsetzen" : "Quiz fortsetzen"}
            className="w-8 h-8 rounded-xl bg-slate-100/80 text-teal-600 hover:bg-teal-100 hover:text-teal-700 dark:bg-slate-800/80 dark:text-teal-400 dark:hover:bg-teal-900/50"
          >
            <Play className="w-4 h-4 fill-current" />
          </Button>
        )}

        {currentView === "quiz" && isQuizActive && (
          <Button
            onClick={() => gameMenu.openTo("run-actions")}
            variant="ghost"
            size="icon"
            aria-label="Pause"
            className="w-8 h-8 rounded-xl bg-slate-100/80 text-amber-500 hover:bg-amber-100 hover:text-amber-600 dark:bg-slate-800/80 dark:text-amber-400 dark:hover:bg-amber-900/50"
          >
            <Pause className="w-4 h-4 fill-current" />
          </Button>
        )}

        {currentView !== "help" && !quiz.isTutorialDemoActive && (
          <Button
            onClick={() => quiz.goToView("help")}
            variant="ghost"
            size="icon"
            aria-label="Hilfe"
            className="w-8 h-8 rounded-xl bg-slate-100/80 text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
