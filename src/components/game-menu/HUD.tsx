import { useState, useRef, useCallback, useEffect } from 'react';
import { Home, Menu, BarChart3, Square, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { QuizContext } from '@/hooks/useQuiz';
import type { MenuPageId } from '@/hooks/useGameMenu';

interface GameMenuApi {
  open: () => void;
  openTo: (page: MenuPageId) => void;
  isOpen: boolean;
}

interface HUDProps {
  quiz: QuizContext;
  gameMenu: GameMenuApi;
}

export function HUD({ quiz, gameMenu }: HUDProps) {
  const [hidden, setHidden] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  const isQuizActive = quiz.isActive;
  const currentView = quiz.view;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
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
  }, [hidden]);

  // Keyboard: H to toggle HUD
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setHidden(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Hidden indicator — tap or swipe up to show */}
      {hidden && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-1"
          onClick={() => setHidden(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <div className="w-10 h-1 rounded-full bg-slate-300/60 dark:bg-slate-600/60 cursor-pointer hover:bg-slate-400/60 transition-colors" />
        </div>
      )}

      {/* HUD Bar */}
      <div
        ref={hudRef}
        className={`
          fixed bottom-3 left-1/2 -translate-x-1/2 z-50
          transition-transform duration-300 ease-out
          ${hidden ? 'translate-y-[calc(100%+24px)]' : 'translate-y-0'}
        `}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-2xl px-2.5 py-1.5 shadow-lg shadow-black/10 dark:bg-slate-900/90 dark:border-slate-700/60 dark:shadow-black/20">
          <Button
            onClick={() => quiz.goToView('start')}
            variant="ghost"
            size="icon"
            aria-label="Zur Startseite"
            className="w-8 h-8 rounded-xl bg-slate-100/80 text-teal-500 hover:bg-slate-200 hover:text-teal-600 dark:bg-slate-800/80 dark:text-teal-400 dark:hover:bg-slate-700"
          >
            <Home className="w-4 h-4" />
          </Button>

          <Button
            onClick={gameMenu.open}
            variant="ghost"
            size="icon"
            aria-label="Menü öffnen"
            className="w-9 h-9 rounded-xl bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Menu className="w-4 h-4" />
          </Button>

          {currentView === 'quiz' && isQuizActive && (
            <Button
              onClick={() => quiz.goToView('progress')}
              variant="ghost"
              size="icon"
              aria-label="Fortschritt"
              className="w-8 h-8 rounded-xl bg-slate-100/80 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          )}

          {currentView !== 'quiz' && isQuizActive && (
            <Button
              onClick={() => quiz.goToView('quiz')}
              variant="ghost"
              size="icon"
              aria-label="Quiz fortsetzen"
              className="w-8 h-8 rounded-xl bg-slate-100/80 text-teal-600 hover:bg-teal-100 hover:text-teal-700 dark:bg-slate-800/80 dark:text-teal-400 dark:hover:bg-teal-900/50"
            >
              <Play className="w-4 h-4 fill-current" />
            </Button>
          )}

          {isQuizActive && (
            <Button
              onClick={() => gameMenu.openTo('run-actions')}
              variant="ghost"
              size="icon"
              aria-label="Quiz beenden"
              className="w-8 h-8 rounded-xl bg-slate-100/80 text-red-500 hover:bg-red-100 hover:text-red-600 dark:bg-slate-800/80 dark:text-red-400 dark:hover:bg-red-900/50"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </Button>
          )}

          {isQuizActive && (
            <div className="px-2 py-0.5 rounded-lg bg-teal-100/80 text-teal-700 text-[11px] font-semibold dark:bg-teal-900/50 dark:text-teal-400">
              {quiz.statistiken?.beantwortet ?? 0}/{quiz.statistiken?.gesamt ?? 0}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
