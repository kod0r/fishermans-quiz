import { useState, useRef, useCallback, useEffect } from 'react';
import { Home, Menu, BarChart3, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HUDProps {
  isActive: boolean;
  onHome: () => void;
  onMenuOpen: () => void;
  onShowProgress?: () => void;
  showProgress?: boolean;
  onStopQuiz?: () => void;
  runStatus?: string;
}

export function HUD({
  isActive,
  onHome,
  onMenuOpen,
  onShowProgress,
  showProgress,
  onStopQuiz,
  runStatus,
}: HUDProps) {
  const [hidden, setHidden] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff < -40 && !hidden) {
      setHidden(true);
      touchStartY.current = null;
    } else if (diff > 40 && hidden) {
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
          className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-1"
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
          fixed top-3 left-1/2 -translate-x-1/2 z-50
          transition-transform duration-300 ease-out
          ${hidden ? '-translate-y-[calc(100%+24px)]' : 'translate-y-0'}
        `}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-2xl px-2.5 py-1.5 shadow-lg shadow-black/10 dark:bg-slate-900/90 dark:border-slate-700/60 dark:shadow-black/20">
          <Button
            onClick={onHome}
            variant="ghost"
            size="icon"
            aria-label="Zur Startseite"
            className="w-8 h-8 rounded-xl bg-slate-100/80 text-teal-500 hover:bg-slate-200 hover:text-teal-600 dark:bg-slate-800/80 dark:text-teal-400 dark:hover:bg-slate-700"
          >
            <Home className="w-4 h-4" />
          </Button>

          <Button
            onClick={onMenuOpen}
            variant="ghost"
            size="icon"
            aria-label="Menü öffnen"
            className="w-9 h-9 rounded-xl bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Menu className="w-4 h-4" />
          </Button>

          {showProgress && onShowProgress && (
            <Button
              onClick={onShowProgress}
              variant="ghost"
              size="icon"
              aria-label="Fortschritt"
              className="w-8 h-8 rounded-xl bg-slate-100/80 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          )}

          {isActive && onStopQuiz && (
            <Button
              onClick={onStopQuiz}
              variant="ghost"
              size="icon"
              aria-label="Quiz beenden"
              className="w-8 h-8 rounded-xl bg-slate-100/80 text-red-500 hover:bg-red-100 hover:text-red-600 dark:bg-slate-800/80 dark:text-red-400 dark:hover:bg-red-900/50"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </Button>
          )}

          {runStatus && (
            <div className="px-2 py-0.5 rounded-lg bg-teal-100/80 text-teal-700 text-[11px] font-semibold dark:bg-teal-900/50 dark:text-teal-400">
              {runStatus}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
