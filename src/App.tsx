import { useCallback } from 'react';
import { useQuiz } from '@/hooks/useQuiz';
import { TopNavBar } from '@/components/TopNavBar';
import { Spinner } from '@/components/ui/spinner';
import StartView from '@/views/StartView';
import QuizView from '@/views/QuizView';
import ProgressView from '@/views/ProgressView';

export default function App() {
  const quiz = useQuiz();

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  if (!quiz.istGeladen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-blue-950 dark:via-slate-900 dark:to-teal-950">
        <div className="text-center">
           <Spinner className="w-12 h-12 text-teal-400 mx-auto mb-4" />
           <p className="text-slate-600 dark:text-slate-300 text-lg">Lade Fragenkatalog...</p>
<<<<<<< HEAD
=======
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
>>>>>>> fix/a11y-quizview-touch-targets
        </div>
      </div>
    );
  }

  const isQuizActive = quiz.isActive;
  const currentView = quiz.view;

  // Sidebar-Button-Sichtbarkeit
  const showResumeOnStart = currentView === 'start' && isQuizActive;
  const showResumeOnProgress = currentView === 'progress' && isQuizActive;
  const showProgressOnQuiz = currentView === 'quiz' && isQuizActive;

  return (
    <>
      <TopNavBar
        quiz={quiz}
        onHome={() => quiz.goToView('start')}
        onResumeQuiz={() => quiz.goToView('quiz')}
        showResume={showResumeOnStart || showResumeOnProgress}
        onShowProgress={() => quiz.goToView('progress')}
        showProgress={showProgressOnQuiz}
      />

      {currentView === 'quiz' && isQuizActive && (
        <QuizView quiz={quiz} />
      )}

      {currentView === 'progress' && isQuizActive && (
        <ProgressView quiz={quiz} />
      )}

      {(currentView === 'start' || !isQuizActive) && (
        <StartView quiz={quiz} />
      )}
    </>
  );
}
