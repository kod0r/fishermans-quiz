import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Home, Play, BarChart3, Menu, X, Zap, Shield, ChevronDown, Sun, Moon, Monitor, History, Square, Timer, Search } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { QuizContext } from '@/hooks/useQuiz';

interface Props {
  quiz: QuizContext;
  onHome: () => void;
  onResumeQuiz?: () => void;
  showResume?: boolean;
  onShowProgress?: () => void;
  showProgress?: boolean;
}

export function TopNavBar({
  quiz,
  onHome,
  onResumeQuiz,
  showResume,
  onShowProgress,
  showProgress,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNavInMenu, setShowNavInMenu] = useState(false);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

   const {
     isActive,
     gameMode,
     setGameMode,
     aktiveFragen,
     antworten,
     aktuellerIndex,
     springeZuFrage,
     view,
     unterbrecheRun,
     goToView,
     historyEntries,
   } = quiz;
   const { theme, setTheme } = useTheme();

  const canChangeMode = !isActive;

  // Menu außerhalb schließen (mouse + touch)
  useEffect(() => {
    const handleInteractionOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleInteractionOutside);
      document.addEventListener('touchstart', handleInteractionOutside);
      return () => {
        document.removeEventListener('mousedown', handleInteractionOutside);
        document.removeEventListener('touchstart', handleInteractionOutside);
      };
    }
  }, [menuOpen]);

  // Swipe-down to close (mobile)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 60) {
      setMenuOpen(false);
      touchStartY.current = null;
    }
  }, []);

  const menuToggleRef = useRef<HTMLButtonElement>(null);

  const handleHome = () => {
    setMenuOpen(false);
    onHome();
  };

  const handleResume = () => {
    setMenuOpen(false);
    onResumeQuiz?.();
  };

  const handleProgress = () => {
    setMenuOpen(false);
    onShowProgress?.();
  };

  const handleJumpToQuestion = (idx: number) => {
    setMenuOpen(false);
    if (view !== 'quiz') goToView('quiz');
    springeZuFrage(idx);
  };

  const handleStopQuiz = () => {
    setShowStopDialog(true);
  };

  const confirmStopQuiz = () => {
    setShowStopDialog(false);
    setMenuOpen(false);
    unterbrecheRun();
  };

  // Focus management: focus first focusable element when menu opens, return focus to toggle on close
  useEffect(() => {
    if (menuOpen) {
      // Focus first focusable element in dropdown after render
      setTimeout(() => {
        const panel = document.getElementById('menu-panel');
        if (panel) {
          const firstFocusable = panel.querySelector<HTMLElement>(
            'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          firstFocusable?.focus();
        }
      }, 0);
    } else {
      // Return focus to menu toggle
      menuToggleRef.current?.focus();
    }
  }, [menuOpen]);

  return (
    <>
      {/* Floating Top Bar */}
      <nav
        ref={menuRef}
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50"
        aria-label="Hauptnavigation"
      >
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white/90 backdrop-blur-md border border-slate-200/50 rounded-full px-2 py-1.5 shadow-lg shadow-black/10 dark:bg-slate-900/90 dark:border-slate-700/50 dark:shadow-black/20">
          {/* Home — zentrierter Ankerpunkt */}
          <Button
            onClick={handleHome}
            variant="ghost"
            size="icon"
            aria-label="Zur Startseite"
            className="w-8 h-8 rounded-full bg-slate-100/80 text-teal-500 hover:bg-slate-200 hover:text-teal-600 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-slate-800/80 dark:text-teal-400 dark:hover:bg-slate-700 dark:hover:text-white dark:focus-visible:ring-offset-slate-900"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
          </Button>

          {/* Resume Quiz */}
          {showResume && onResumeQuiz && (
            <Button
              onClick={handleResume}
              variant="ghost"
              size="icon"
              aria-label={view === 'progress' ? 'Zurück zum Quiz' : 'Quiz fortsetzen'}
              className="w-8 h-8 rounded-full bg-teal-100/80 text-teal-600 hover:bg-teal-200 hover:text-teal-700 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-teal-900/80 dark:text-teal-400 dark:hover:bg-teal-800 dark:hover:text-white dark:focus-visible:ring-offset-slate-900"
            >
              <Play className="w-4 h-4" aria-hidden="true" />
            </Button>
          )}

          {/* Progress */}
          {showProgress && onShowProgress && (
            <Button
              onClick={handleProgress}
              variant="ghost"
              size="icon"
              aria-label="Quiz-Fortschritt"
              className="w-8 h-8 rounded-full bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white dark:focus-visible:ring-offset-slate-900"
            >
              <BarChart3 className="w-4 h-4" aria-hidden="true" />
            </Button>
          )}

          {/* Stop — nur während Quiz */}
          {isActive && view === 'quiz' && (
            <Button
              onClick={handleStopQuiz}
              variant="ghost"
              size="icon"
              aria-label="Quiz beenden"
              className="w-8 h-8 rounded-full bg-slate-100/80 text-red-500 hover:bg-red-100 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-slate-800/80 dark:text-red-400 dark:hover:bg-red-900/50 dark:hover:text-red-300 dark:focus-visible:ring-offset-slate-900"
            >
              <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            </Button>
          )}

       {/* Menu Toggle */}
       <Button
         ref={menuToggleRef}
         onClick={() => setMenuOpen(!menuOpen)}
         variant="ghost"
         size="icon"
         aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
         aria-expanded={menuOpen}
         aria-haspopup="true"
         aria-controls="menu-panel"
         className="w-10 h-10 rounded-full bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white dark:focus-visible:ring-offset-slate-900"
       >
         {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
       </Button>
        </div>

        {/* Dropdown Panel */}
        {menuOpen && (
          <div
            id="menu-panel"
            role="menu"
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 sm:w-80 bg-white/95 backdrop-blur-md border border-slate-200/50 rounded-2xl shadow-xl shadow-black/10 overflow-hidden dark:bg-slate-900/95 dark:border-slate-700/50 dark:shadow-black/30"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                setMenuOpen(false);
              }
            }}
          >
            {/* Swipe-Handle (mobile) */}
            <div className="flex justify-center pt-2 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-slate-300/50 dark:bg-slate-600/50" />
            </div>

            <div className="p-3 sm:p-4 space-y-3">
                {/* Moduswahl */}
                <div>
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider font-medium mb-1.5 dark:text-slate-400">Spielmodus</p>
                  <div role="radiogroup" aria-label="Spielmodus" className="flex items-center gap-1.5 bg-slate-100/80 rounded-lg p-1 dark:bg-slate-800/50">
                    <button
                      onClick={() => canChangeMode && setGameMode('arcade')}
                      disabled={!canChangeMode}
                      role="radio"
                      aria-checked={gameMode === 'arcade'}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors min-h-[32px] ${gameMode === 'arcade' ? 'bg-amber-500 text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'} ${!canChangeMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      title={canChangeMode ? 'Arcade-Modus' : 'Moduswechsel während aktivem Run nicht möglich'}
                    >
                      <Zap className="w-3 h-3" />
                      Arcade
                    </button>
                    <button
                      onClick={() => canChangeMode && setGameMode('hardcore')}
                      disabled={!canChangeMode}
                      role="radio"
                      aria-checked={gameMode === 'hardcore'}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors min-h-[32px] ${gameMode === 'hardcore' ? 'bg-red-500 text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'} ${!canChangeMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      title={canChangeMode ? 'Hardcore-Modus' : 'Moduswechsel während aktivem Run nicht möglich'}
                    >
                      <Shield className="w-3 h-3" />
                      Hardcore
                    </button>
                    <button
                      onClick={() => canChangeMode && setGameMode('exam')}
                      disabled={!canChangeMode}
                      role="radio"
                      aria-checked={gameMode === 'exam'}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors min-h-[32px] ${gameMode === 'exam' ? 'bg-blue-500 text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'} ${!canChangeMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      title={canChangeMode ? 'Prüfungsmodus' : 'Moduswechsel während aktivem Run nicht möglich'}
                    >
                      <Timer className="w-3 h-3" />
                      Exam
                    </button>
                  </div>
                 {!canChangeMode && (
                   <p className="text-slate-400 text-[10px] mt-1 dark:text-slate-500">Moduswechsel während eines aktiven Runs deaktiviert.</p>
                 )}
               </div>

                {/* Themewahl */}
                <div className="mt-4">
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider font-medium mb-1.5 dark:text-slate-400">Design</p>
                  <div role="radiogroup" aria-label="Design" className="flex items-center gap-1.5 bg-slate-100/80 rounded-lg p-1 dark:bg-slate-800/50">
                    <button
                      onClick={() => setTheme('light')}
                      role="radio"
                      aria-checked={theme === 'light'}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors min-h-[32px] ${theme === 'light' ? 'bg-white text-slate-900 border border-slate-300' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                    >
                      <Sun className="w-3 h-3" />
                      Hell
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      role="radio"
                      aria-checked={theme === 'dark'}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors min-h-[32px] ${theme === 'dark' ? 'bg-slate-800 text-white border border-slate-600' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                    >
                      <Moon className="w-3 h-3" />
                      Dunkel
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      role="radio"
                      aria-checked={theme === 'system'}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors min-h-[32px] ${theme === 'system' ? 'bg-teal-500 text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                    >
                      <Monitor className="w-3 h-3" />
                      System
                    </button>
                  </div>
                </div>

                {/* Schnellnavigation — nur während Quiz */}
                {isActive && view === 'quiz' && (
                  <div>
                    <button
                      onClick={() => setShowNavInMenu(!showNavInMenu)}
                      aria-expanded={showNavInMenu}
                      aria-controls="schnellnavigation-list"
                      className="w-full flex items-center justify-between text-slate-500 text-[10px] uppercase tracking-wider font-medium mb-1.5 hover:text-slate-700 transition-colors dark:text-slate-400 dark:hover:text-slate-300"
                    >
                      <span>Schnellnavigation</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${showNavInMenu ? 'rotate-180' : ''}`} />
                    </button>
                    {showNavInMenu && (
                      <div id="schnellnavigation-list" className="max-h-40 overflow-y-auto pr-1">
                        <div className="flex flex-wrap gap-1" role="list" aria-label="Fragen-Übersicht">
                        {aktiveFragen.map((frage, idx) => {
                          const beantwortet = antworten[frage.id] !== undefined;
                          const korrekt = antworten[frage.id] === frage.richtige_antwort;
                          const aktuell = idx === aktuellerIndex;
                          return (
                            <button
                              key={frage.id}
                              onClick={() => handleJumpToQuestion(idx)}
                              aria-label={`Frage ${idx + 1}${beantwortet ? (korrekt ? ', richtig beantwortet' : ', falsch beantwortet') : ', unbeantwortet'}${aktuell ? ', aktuell' : ''}`}
                              aria-current={aktuell ? 'true' : undefined}
                              className={`w-7 h-7 rounded-md text-[10px] font-medium flex-shrink-0 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 ${aktuell ? 'bg-teal-500 text-white' : beantwortet && korrekt ? 'bg-emerald-100 text-emerald-600 border border-emerald-300/50 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30' : beantwortet && !korrekt ? 'bg-red-100 text-red-600 border border-red-300/50 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30' : 'bg-slate-100/80 text-slate-600 border border-slate-300/30 hover:bg-slate-200 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600/30 dark:hover:bg-slate-700'}`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Browse */}
              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                <button
                  onClick={() => { setMenuOpen(false); goToView('browse'); }}
                  className="w-full flex items-center gap-2 text-slate-600 text-xs hover:text-teal-600 transition-colors dark:text-slate-300 dark:hover:text-teal-400"
                >
                  <Search className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Fragenkatalog</span>
                </button>
              </div>

              {/* History */}
              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                <button
                  onClick={() => { setMenuOpen(false); goToView('history'); }}
                  className="w-full flex items-center gap-2 text-slate-600 text-xs hover:text-teal-600 transition-colors dark:text-slate-300 dark:hover:text-teal-400"
                >
                  <History className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Session-Verlauf</span>
                  {historyEntries.length > 0 && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      {historyEntries.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Aktiver Run Info */}
              {isActive && (
                <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider font-medium mb-1 dark:text-slate-400">Aktiver Run</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300">{quiz.geladeneBereiche.join(', ')}</span>
                    <span className="text-teal-600 font-medium dark:text-teal-400">{quiz.statistiken.beantwortet}/{quiz.statistiken.gesamt}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Stop Quiz Confirmation */}
      <AlertDialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">Quiz beenden?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              Meta-Fortschritt bleibt erhalten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowStopDialog(false)} className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStopQuiz} className="bg-red-600 hover:bg-red-700 text-white">Beenden</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
