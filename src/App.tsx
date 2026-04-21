import { useQuiz } from '@/hooks/useQuiz';
import { Sidebar } from '@/components/Sidebar';
import { Spinner } from '@/components/ui/spinner';
import StartView from '@/views/StartView';
import QuizView from '@/views/QuizView';
import ProgressView from '@/views/ProgressView';

export default function App() {
  const quiz = useQuiz();

  if (!quiz.istGeladen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-teal-950">
        <div className="text-center">
          <Spinner className="w-12 h-12 text-teal-400 mx-auto mb-4" />
          <p className="text-slate-300 text-lg">Lade Fragenkatalog...</p>
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
      <Sidebar
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
