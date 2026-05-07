import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home } from 'lucide-react';
import { QuizHeader } from '@/components/QuizHeader';
import { AnswerGrid } from '@/components/AnswerGrid';
import { QuizFooter } from '@/components/QuizFooter';
import { QuizCardShell } from '@/components/QuizCardShell';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { CheatSheetModal } from '@/components/CheatSheetModal';
import type { QuizContext } from '@/hooks/useQuiz';

interface Props {
  quiz: QuizContext;
  onOpenRunActions: () => void;
  gameMenuOpen: boolean;
}

export default function QuizView({ quiz, onOpenRunActions, gameMenuOpen }: Props) {
  const {
    aktuelleFrage,
    aktuellerIndex,
    aktiveFragen,
    antworten,
    beantworteFrage,
    naechsteFrage,
    vorherigeFrage,
    gameMode,
    toggleFavorite,
    isFavorite,
    goToView,
    getNote,
    setNote,
    rawRun,
    beendeExam,
  } = quiz;

  const [pendingWrongAnswer, setPendingWrongAnswer] = useState<string | null>(
    null,
  );
  const [topicComplete, setTopicComplete] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | undefined>();
  const [examAbgelaufen, setExamAbgelaufen] = useState(false);
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
  const [showExamSubmitDialog, setShowExamSubmitDialog] = useState(false);

  // Clear pending wrong answer when navigating to a different question
  useEffect(() => {
    setPendingWrongAnswer(null);
  }, [aktuellerIndex]);

  // Exam timer - requestAnimationFrame loop prevents drift
  useEffect(() => {
    if (gameMode !== 'exam' || !rawRun?.startedAt || !rawRun?.durationSeconds) {
      setRemainingSeconds(undefined);
      return;
    }

    const start = new Date(rawRun.startedAt).getTime();
    const durationMs = rawRun.durationSeconds * 1000;
    let animationFrameId: number | null = null;

    const tick = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        setExamAbgelaufen(true);
        beendeExam?.();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        return;
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    // Start the loop
    animationFrameId = requestAnimationFrame(tick);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [gameMode, rawRun, beendeExam]);

  const checkTopicComplete = useCallback(
    (frageId: string) => {
      // Skip topic-complete popup in filtered sessions (Schwächentrainer, SRS-due)
      if (rawRun?.filter && rawRun.filter !== 'all') return;

      const frage = aktiveFragen.find((f) => f.id === frageId);
      if (!frage) return;

      const topicQuestions = aktiveFragen.filter(
        (f) => f.topic === frage.topic,
      );
      const alleBeantwortet = topicQuestions.every(
        (f) => antworten[f.id] !== undefined || f.id === frageId,
      );

      if (alleBeantwortet) {
        setTopicComplete(frage.topic);
      }
    },
    [aktiveFragen, antworten, rawRun],
  );

  const userAntwort = antworten[aktuelleFrage?.id || ''];
  const hasAnswered = userAntwort !== undefined;
  const isPending = pendingWrongAnswer !== null;

  const korrekt = useMemo(
    () =>
      aktiveFragen.filter((f) => antworten[f.id] === f.richtige_antwort).length,
    [aktiveFragen, antworten],
  );
  const falsch = useMemo(
    () =>
      aktiveFragen.filter(
        (f) => antworten[f.id] && antworten[f.id] !== f.richtige_antwort,
      ).length,
    [aktiveFragen, antworten],
  );
  const offen = useMemo(
    () => aktiveFragen.filter((f) => !antworten[f.id]).length,
    [aktiveFragen, antworten],
  );

  const handleAnswerClick = useCallback(
    (buchstabe: string) => {
      if (!aktuelleFrage) return;
      if (hasAnswered) return;
      if (pendingWrongAnswer === buchstabe) return;
      if (examAbgelaufen) return;

      const isCorrect = buchstabe === aktuelleFrage.richtige_antwort;

      if (isCorrect) {
        beantworteFrage(aktuelleFrage.id, buchstabe);
        setPendingWrongAnswer(null);
        checkTopicComplete(aktuelleFrage.id);
      } else if (gameMode === 'arcade' && isPending) {
        beantworteFrage(aktuelleFrage.id, buchstabe);
        setPendingWrongAnswer(null);
        checkTopicComplete(aktuelleFrage.id);
      } else if (gameMode === 'arcade' && !isPending) {
        setPendingWrongAnswer(buchstabe);
      } else {
        beantworteFrage(aktuelleFrage.id, buchstabe);
        setPendingWrongAnswer(null);
        checkTopicComplete(aktuelleFrage.id);
      }
    },
    [
      aktuelleFrage,
      hasAnswered,
      isPending,
      pendingWrongAnswer,
      gameMode,
      beantworteFrage,
      checkTopicComplete,
      examAbgelaufen,
    ],
   );

  const handleToggleFavorite = useCallback(() => {
    if (aktuelleFrage) {
      toggleFavorite(aktuelleFrage.id);
    }
  }, [aktuelleFrage, toggleFavorite]);

  const handleOpenCheatSheet = useCallback(() => {
    setCheatSheetOpen(true);
  }, []);

  const handleEscape = useCallback(() => {
    onOpenRunActions();
  }, [onOpenRunActions]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onAnswer: handleAnswerClick,
    onPrev: isPending ? undefined : vorherigeFrage,
    onNext: isPending ? undefined : naechsteFrage,
    onToggleFavorite: handleToggleFavorite,
    // Space is a no-op in quiz mode (answer selection via number keys only)
    onSpace: undefined,
    onOpenCheatSheet: handleOpenCheatSheet,
    onEscape: handleEscape,
    enabled:
      quiz.isActive &&
      !cheatSheetOpen &&
      !gameMenuOpen &&
      !showExamSubmitDialog &&
      !topicComplete,
  });

  if (!aktuelleFrage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-blue-950 dark:via-slate-900 dark:to-teal-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-slate-700 dark:text-slate-200">Keine Frage verfügbar.</p>
          <Button variant="outline" onClick={onOpenRunActions}>
            <Home className="mr-2 h-4 w-4" />
            Zurück zum Menü
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={800}>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-blue-950 dark:via-slate-900 dark:to-teal-950">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-4xl pb-16">
          <QuizHeader
            gameMode={gameMode}
            korrekt={korrekt}
            falsch={falsch}
            offen={offen}
            aktuellerIndex={aktuellerIndex}
            totalFragen={aktiveFragen.length}
            remainingSeconds={remainingSeconds}
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
            <AnswerGrid
              frage={aktuelleFrage}
              userAntwort={userAntwort}
              hasAnswered={hasAnswered}
              pendingWrongAnswer={pendingWrongAnswer}
              onAnswerClick={handleAnswerClick}
              hideFeedback={gameMode === 'exam'}
            />

            {/* Live-Region für Feedback */}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {userAntwort &&
                userAntwort === aktuelleFrage.richtige_antwort &&
                'Richtig!'}
              {userAntwort &&
                userAntwort !== aktuelleFrage.richtige_antwort &&
                'Falsch.'}
            </div>
          </QuizCardShell>

          <QuizFooter
            aktuellerIndex={aktuellerIndex}
            totalFragen={aktiveFragen.length}
            isPending={isPending}
            onPrev={vorherigeFrage}
            onNext={naechsteFrage}
          />

           {/* Exam: early submit button */}
           {gameMode === 'exam' && !examAbgelaufen && (
             <div className="mt-3 flex justify-center">
               <Button
                 onClick={() => setShowExamSubmitDialog(true)}
                 variant="outline"
                 className="border-blue-300 text-blue-600 hover:bg-blue-50 text-xs dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/30"
               >
                 Prüfung abgeben
               </Button>
             </div>
           )}

           {/* Exam early submit confirmation dialog */}
           <Dialog
             open={showExamSubmitDialog}
             onOpenChange={setShowExamSubmitDialog}
           >
             <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white">
               <DialogHeader>
                 <DialogTitle className="text-base">Prüfung vorzeitig abgeben?</DialogTitle>
                 <DialogDescription className="text-slate-500 text-sm dark:text-slate-400">
                   Deine bisherigen Antworten werden gewertet. Dies kann nicht rückgängig gemacht werden.
                 </DialogDescription>
               </DialogHeader>
               <DialogFooter className="gap-2">
                 <Button
                   variant="outline"
                   onClick={() => setShowExamSubmitDialog(false)}
                   className="flex-1 border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                 >
                   Weiter machen
                 </Button>
                 <Button
                   onClick={() => {
                     setShowExamSubmitDialog(false);
                     beendeExam?.();
                   }}
                   className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                 >
                   Abgeben
                 </Button>
               </DialogFooter>
             </DialogContent>
           </Dialog>

           {/* Themen-Abschluss Dialog (Issue #46) */}
          <Dialog
            open={topicComplete !== null}
            onOpenChange={(open) => !open && setTopicComplete(null)}
          >
            <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  Thema abgeschlossen!
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-sm dark:text-slate-400">
                  Du hast alle Fragen im Thema{' '}
                  <span className="text-teal-400 font-medium">
                    {topicComplete}
                  </span>{' '}
                  beantwortet.
                </DialogDescription>
              </DialogHeader>
              <p className="text-slate-600 text-sm dark:text-slate-300">
                Du kannst über die Startansicht ein weiteres Thema
                hinzufügen.
              </p>
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => setTopicComplete(null)}
                  variant="outline"
                  className="flex-1 border-slate-300 text-slate-600 hover:bg-slate-100 text-xs dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Weiterlernen
                </Button>
                <Button
                  onClick={() => {
                    setTopicComplete(null);
                    goToView('start');
                  }}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white text-xs"
                >
                  <Home className="w-3.5 h-3.5 mr-1" />
                  Zur Startseite
                </Button>
              </div>
            </DialogContent>
           </Dialog>

           {/* Keyboard shortcuts modals */}
           <CheatSheetModal open={cheatSheetOpen} onOpenChange={setCheatSheetOpen} />
         </div>
      </div>
    </TooltipProvider>
  );
}
