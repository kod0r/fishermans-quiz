import { useCallback, useEffect } from 'react';
import type { AppView } from '@/types/quiz';
import type { QuizContext } from '@/hooks/useQuiz';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useQuiz } from '@/hooks/useQuiz';
import { useGameMenu } from '@/hooks/useGameMenu';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import { HUD } from '@/components/game-menu/HUD';
import { GameMenuOverlay } from '@/components/game-menu/GameMenuOverlay';
import { Spinner } from '@/components/ui/spinner';
import StartView from '@/views/StartView';
import QuizView from '@/views/QuizView';
import FlashcardView from '@/views/FlashcardView';
import ProgressView from '@/views/ProgressView';
import HistoryView from '@/views/HistoryView';
import BrowseView from '@/views/BrowseView';

export default function App() {
  const quiz = useQuiz();
  const gameMenu = useGameMenu();

  // Listen for storage errors and show toast (debounced)
  useEffect(() => {
    let lastToastTime = 0;
    const DEBOUNCE_MS = 30000; // 30 seconds

    const handler = () => {
      const now = Date.now();
      if (now - lastToastTime < DEBOUNCE_MS) return;
      lastToastTime = now;

      toast.error('Speicherfehler', {
        description: 'Dein Fortschritt konnte nicht gespeichert werden. Prüfe den verfügbaren Speicherplatz.',
        duration: 6000,
      });
    };

    window.addEventListener('storage:error', handler as EventListener);
    return () => window.removeEventListener('storage:error', handler as EventListener);
  }, []);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  if (!quiz.istGeladen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-blue-950 dark:via-slate-900 dark:to-teal-950">
        <div className="text-center">
           <Spinner className="w-12 h-12 text-teal-400 mx-auto mb-4" />
           <p className="text-slate-600 dark:text-slate-300 text-lg">Lade Fragenkatalog...</p>
        </div>
      </div>
    );
  }

  if (quiz.loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-blue-950 dark:via-slate-900 dark:to-teal-950">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 mx-auto mb-4 flex items-center justify-center" aria-hidden="true">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Laden fehlgeschlagen</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">{quiz.loadError}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  const isQuizActive = quiz.isActive;
  const currentView = quiz.view;

  return (
    <>
      <HUD quiz={quiz} gameMenu={gameMenu} />

      <GameMenuOverlay
        isOpen={gameMenu.isOpen}
        stack={gameMenu.stack}
        currentPage={gameMenu.currentPage}
        direction={gameMenu.direction}
        onClose={gameMenu.close}
        onPop={gameMenu.pop}
        onPush={gameMenu.push}
        registerOnActivate={gameMenu.registerOnActivate}
        quiz={quiz}
      />

      <ErrorBoundary>
        <ViewRenderer
          currentView={currentView}
          isQuizActive={isQuizActive}
          quiz={quiz}
          gameMenu={gameMenu}
        />
      </ErrorBoundary>
       <Toaster position="top-center" richColors />
     </>
   );
 }

interface ViewRendererProps {
  currentView: AppView;
  isQuizActive: boolean;
  quiz: QuizContext;
  gameMenu: ReturnType<typeof useGameMenu>;
}

function ViewRenderer({
  currentView,
  isQuizActive,
  quiz,
  gameMenu,
}: ViewRendererProps) {
  if (currentView === 'quiz') {
    if (!isQuizActive) return null;
    return quiz.rawRun?.sessionType === 'flashcard' ? (
      <FlashcardView quiz={quiz} onOpenRunActions={() => gameMenu.openTo('run-actions')} gameMenuOpen={gameMenu.isOpen} />
    ) : (
      <QuizView quiz={quiz} onOpenRunActions={() => gameMenu.openTo('run-actions')} gameMenuOpen={gameMenu.isOpen} />
    );
  }
  if (currentView === 'progress') {
    if (!isQuizActive && !quiz.rawRun) return null;
    return <ProgressView quiz={quiz} />;
  }
  if (currentView === 'history') {
    return <HistoryView quiz={quiz} onBack={() => quiz.goToView('start')} />;
  }
  if (currentView === 'browse') {
    return <BrowseView quiz={quiz} onBack={() => quiz.goToView('start')} />;
  }
  if (currentView === 'start') {
    return <StartView quiz={quiz} />;
  }
  const _exhaustiveCheck: never = currentView;
  return _exhaustiveCheck;
}

