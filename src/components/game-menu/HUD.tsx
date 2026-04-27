import { useState, useRef, useCallback, useEffect, useMemo } from "react";
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
  const [hidden, setHidden] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  const isQuizActive = quiz.isActive;
  const currentView = quiz.view;
  const isExam = quiz.gameMode === "exam";

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!isExam || !isQuizActive || !quiz.rawRun?.startedAt || !quiz.rawRun?.durationSeconds) {
      setRemainingSeconds(null);
      return;
    }

    const startedAt = quiz.rawRun.startedAt;
    const durationSeconds = quiz.rawRun.durationSeconds;
    const tick = () => {
      const started = new Date(startedAt).getTime();
      const elapsed = Math.floor((Date.now() - started) / 1000);
      const left = (durationSeconds ?? 0) - elapsed;
      setRemainingSeconds(left);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isExam, isQuizActive, quiz.rawRun?.startedAt, quiz.rawRun?.durationSeconds]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartY.current === null) return;
      const diff = e.touches[0].clientY - touchStartY.current;
      // Bottom HUD: swipe down to hide, swipe up to show
      if (diff > 40 && !hidden) {
        setHidden(true);
        touchStartY.current = null;
      } else if (diff < -40 && hidden) {
        setHidden(false);
        touchStartY.current = null;
      }
    },
    [hidden],
  );

  const handleTouchEnd = useCallback(() => {
    touchStartY.current = null;
  }, []);

  // Keyboard: H to toggle HUD
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "h" || e.key === "H") {
        setHidden((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    <>
      {/* Invisible touch strip when hidden to enlarge swipe-up / tap target */}
      {hidden && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 h-14 touch-none"
          onClick={() => setHidden(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      )}

      <div
        ref={hudRef}
        data-testid="hud-bar"
        className={`
          fixed bottom-[10px] left-0 right-0 z-50
          flex justify-center
          transition-transform duration-300 ease-out
          touch-none
          ${hidden ? "translate-y-[calc(100%-12px)]" : "translate-y-0"}
        `}
        onClick={hidden ? () => setHidden(false) : undefined}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative flex items-center gap-1.5 bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-2xl px-2.5 py-1.5 shadow-lg shadow-black/10 dark:bg-slate-900/90 dark:border-slate-700/60 dark:shadow-black/20">
          {/* Grabber indicator seamlessly on upper inside edge */}
          <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-slate-300 dark:bg-slate-600" />

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

        <Button
          onClick={() => quiz.goToView("help")}
          variant="ghost"
          size="icon"
          aria-label="Hilfe"
          className="w-8 h-8 rounded-xl bg-slate-100/80 text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-700"
        >
          <HelpCircle className="w-4 h-4" />
        </Button>
      </div>
    </div>
    </>
  );
}
