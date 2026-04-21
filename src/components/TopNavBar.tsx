import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Home, Play, BarChart3, Menu, X, Zap, Shield, ChevronDown } from 'lucide-react';
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
  } = quiz;

  const canChangeMode = !isActive;

  // Menu außerhalb schließen
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
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
    if (confirm('Quiz beenden? Meta-Fortschritt bleibt erhalten.')) {
      setMenuOpen(false);
      unterbrecheRun();
    }
  };

  return (
    <>
      {/* Floating Top Bar */}
      <nav
        ref={menuRef}
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50"
        aria-label="Hauptnavigation"
      >
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-full px-2 py-1.5 shadow-lg shadow-black/20">
          {/* Home — zentrierter Ankerpunkt */}
          <Button
            onClick={handleHome}
            variant="ghost"
            size="icon"
            aria-label="Zur Startseite"
            className="w-8 h-8 rounded-full bg-slate-800/80 text-teal-400 hover:bg-slate-700 hover:text-white focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
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
              className="w-8 h-8 rounded-full bg-teal-900/80 text-teal-400 hover:bg-teal-800 hover:text-white focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
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
              className="w-8 h-8 rounded-full bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
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
              className="w-8 h-8 rounded-full bg-slate-800/80 text-red-400 hover:bg-red-900/50 hover:text-red-300 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </Button>
          )}

          {/* Menu Toggle */}
          <Button
            onClick={() => setMenuOpen(!menuOpen)}
            variant="ghost"
            size="icon"
            aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
            aria-expanded={menuOpen}
            className="w-8 h-8 rounded-full bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Dropdown Panel */}
        {menuOpen && (
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl shadow-black/30 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            {/* Swipe-Handle (mobile) */}
            <div className="flex justify-center pt-2 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-slate-600/50" />
            </div>

            <div className="p-3 sm:p-4 space-y-3">
              {/* Moduswahl */}
              <div>
                <p className="text-slate-400 text-[10px] uppercase tracking-wider font-medium mb-1.5">Spielmodus</p>
                <div className="flex items-center gap-1.5 bg-slate-800/50 rounded-lg p-1">
                  <button
                    onClick={() => canChangeMode && setGameMode('arcade')}
                    disabled={!canChangeMode}
                    aria-pressed={gameMode === 'arcade'}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors min-h-[32px] ${gameMode === 'arcade' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white'} ${!canChangeMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={canChangeMode ? 'Arcade-Modus' : 'Moduswechsel während aktivem Run nicht möglich'}
                  >
                    <Zap className="w-3 h-3" />
                    Arcade
                  </button>
                  <button
                    onClick={() => canChangeMode && setGameMode('hardcore')}
                    disabled={!canChangeMode}
                    aria-pressed={gameMode === 'hardcore'}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors min-h-[32px] ${gameMode === 'hardcore' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'} ${!canChangeMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={canChangeMode ? 'Hardcore-Modus' : 'Moduswechsel während aktivem Run nicht möglich'}
                  >
                    <Shield className="w-3 h-3" />
                    Hardcore
                  </button>
                </div>
                {!canChangeMode && (
                  <p className="text-slate-500 text-[10px] mt-1">Moduswechsel während eines aktiven Runs deaktiviert.</p>
                )}
              </div>

              {/* Schnellnavigation — nur während Quiz */}
              {isActive && view === 'quiz' && (
                <div>
                  <button
                    onClick={() => setShowNavInMenu(!showNavInMenu)}
                    aria-expanded={showNavInMenu}
                    className="w-full flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider font-medium mb-1.5 hover:text-slate-300 transition-colors"
                  >
                    <span>Schnellnavigation</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showNavInMenu ? 'rotate-180' : ''}`} />
                  </button>
                  {showNavInMenu && (
                    <div className="max-h-40 overflow-y-auto pr-1">
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
                              className={`w-7 h-7 rounded-md text-[10px] font-medium flex-shrink-0 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${aktuell ? 'bg-teal-500 text-white' : beantwortet && korrekt ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : beantwortet && !korrekt ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700'}`}
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

              {/* Aktiver Run Info */}
              {isActive && (
                <div className="pt-2 border-t border-slate-700/50">
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider font-medium mb-1">Aktiver Run</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{quiz.geladeneBereiche.join(', ')}</span>
                    <span className="text-teal-400 font-medium">{quiz.statistiken.beantwortet}/{quiz.statistiken.gesamt}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
