import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QuizHeader } from '@/components/QuizHeader';
import { QuizFooter } from '@/components/QuizFooter';
import { QuizCardShell } from '@/components/QuizCardShell';
import { Eye, RotateCcw, ThumbsDown, ThumbsUp, Zap } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { CheatSheetModal } from '@/components/CheatSheetModal';
import { PauseMenuDialog } from '@/components/PauseMenuDialog';
import type { QuizContext } from '@/hooks/useQuiz';
import type { SelfAssessmentGrade } from '@/types/quiz';

interface Props {
  quiz: QuizContext;
}

const GRADE_BUTTONS: { grade: SelfAssessmentGrade; label: string; icon: React.ReactNode; color: string }[] = [
  { grade: 'again', label: 'Again', icon: <RotateCcw className="w-4 h-4" />, color: 'bg-red-500 hover:bg-red-600 text-white' },
  { grade: 'hard', label: 'Hard', icon: <ThumbsDown className="w-4 h-4" />, color: 'bg-orange-500 hover:bg-orange-600 text-white' },
  { grade: 'good', label: 'Good', icon: <ThumbsUp className="w-4 h-4" />, color: 'bg-teal-500 hover:bg-teal-600 text-white' },
  { grade: 'easy', label: 'Easy', icon: <Zap className="w-4 h-4" />, color: 'bg-emerald-500 hover:bg-emerald-600 text-white' },
];

export default function FlashcardView({ quiz }: Props) {
  const {
    aktuelleFrage,
    aktuellerIndex,
    aktiveFragen,
    antworten,
    beantworteFlashcard,
    naechsteFrage,
    vorherigeFrage,
    gameMode,
    toggleFavorite,
    isFavorite,
    getNote,
    setNote,
  } = quiz;

  const [revealed, setRevealed] = useState(false);
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
  const [pauseMenuOpen, setPauseMenuOpen] = useState(false);

  const userAntwort = antworten[aktuelleFrage?.id || ''];
  const hasAnswered = userAntwort !== undefined;

  const handleReveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const handleGrade = useCallback(
    (grade: SelfAssessmentGrade) => {
      if (!aktuelleFrage) return;
      beantworteFlashcard(aktuelleFrage.id, grade);
      setRevealed(false);
      // Auto-advance after short delay
      setTimeout(() => naechsteFrage(), 300);
    },
    [aktuelleFrage, beantworteFlashcard, naechsteFrage]
  );

  const handleNavigateNext = useCallback(() => {
    setRevealed(false);
    naechsteFrage();
  }, [naechsteFrage]);

  const handleNavigatePrev = useCallback(() => {
    setRevealed(false);
    vorherigeFrage();
  }, [vorherigeFrage]);

  const korrekt = aktiveFragen.filter(
    (f) => antworten[f.id] === f.richtige_antwort
  ).length;
  const falsch = aktiveFragen.filter(
    (f) => antworten[f.id] && antworten[f.id] !== f.richtige_antwort
  ).length;
   const offen = aktiveFragen.filter((f) => !antworten[f.id]).length;

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onPrev: handleNavigatePrev,
    onNext: handleNavigateNext,
    onToggleFavorite: () => {
      if (aktuelleFrage) {
        toggleFavorite(aktuelleFrage.id);
      }
    },
    onSpace: handleReveal,
    onOpenCheatSheet: () => setCheatSheetOpen(true),
    onEscape: () => {
      if (cheatSheetOpen) {
        setCheatSheetOpen(false);
      } else {
        setPauseMenuOpen(true);
      }
    },
    enabled: quiz.isActive && !cheatSheetOpen && !pauseMenuOpen,
  });

  if (!aktuelleFrage) return null;

  return (
    <TooltipProvider delayDuration={800}>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-blue-950 dark:via-slate-900 dark:to-teal-950">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-4xl pt-14 sm:pt-16">
          <QuizHeader
            gameMode={gameMode}
            korrekt={korrekt}
            falsch={falsch}
            offen={offen}
            aktuellerIndex={aktuellerIndex}
            totalFragen={aktiveFragen.length}
          />

          <QuizCardShell
            frage={aktuelleFrage}
            aktuellerIndex={aktuellerIndex}
            hasAnswered={hasAnswered}
            isFavorite={isFavorite(aktuelleFrage.id)}
            onToggleFavorite={() => toggleFavorite(aktuelleFrage.id)}
            note={getNote(aktuelleFrage.id)}
            onNoteChange={(value) => setNote(aktuelleFrage.id, value)}
          >
            {!revealed && !hasAnswered ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <Button
                  onClick={handleReveal}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-5 text-base rounded-xl shadow-lg shadow-teal-500/20"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Antwort aufdecken
                </Button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center gap-3">
                {/* Correct answer display */}
                <div className="space-y-2 mb-2">
                  {(['A', 'B', 'C'] as const).map((buchstabe) => {
                    const isCorrect = aktuelleFrage.richtige_antwort === buchstabe;
                    return (
                      <div
                        key={buchstabe}
                        className={`w-full text-left h-12 sm:h-14 rounded-lg border flex items-center gap-3 px-3 ${
                          isCorrect
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-slate-300/50 bg-slate-100/80 dark:border-slate-600/50 dark:bg-slate-700/30'
                        }`}
                      >
                        <span
                          className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm ${
                            isCorrect
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-300/50 text-slate-600 dark:bg-slate-600/50 dark:text-slate-300'
                          }`}
                        >
                          {buchstabe}
                        </span>
                        <span
                          className={`flex-1 leading-snug text-sm truncate ${
                            isCorrect
                              ? 'text-emerald-600 dark:text-emerald-300 font-medium'
                              : 'text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          {aktuelleFrage.antworten[buchstabe]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Self-assessment buttons */}
                {!hasAnswered && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    {GRADE_BUTTONS.map(({ grade, label, icon, color }) => (
                      <Button
                        key={grade}
                        onClick={() => handleGrade(grade)}
                        className={`${color} text-xs py-3 rounded-lg`}
                      >
                        {icon}
                        <span className="ml-1.5">{label}</span>
                      </Button>
                    ))}
                  </div>
                )}

                {hasAnswered && (
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                    Bewertet. Weiter zur nächsten Frage …
                  </p>
                )}
              </div>
            )}
          </QuizCardShell>

          <QuizFooter
            aktuellerIndex={aktuellerIndex}
            totalFragen={aktiveFragen.length}
            isPending={false}
            onPrev={handleNavigatePrev}
            onNext={handleNavigateNext}
          />

          {/* Keyboard shortcuts modals */}
          <CheatSheetModal open={cheatSheetOpen} onOpenChange={setCheatSheetOpen} />
          <PauseMenuDialog open={pauseMenuOpen} onOpenChange={setPauseMenuOpen} quiz={quiz} />
        </div>
      </div>
    </TooltipProvider>
  );
}
