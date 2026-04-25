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
  const [bereichComplete, setBereichComplete] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | undefined>();
  const [examAbgelaufen, setExamAbgelaufen] = useState(false);
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
  const [showExamSubmitDialog, setShowExamSubmitDialog] = useState(false);

  // Clear pending wrong answer when navigating to a different question
  useEffect(() => {
    setPendingWrongAnswer(null);
  }, [aktuellerIndex]);

  // Exam timer
  useEffect(() => {
    if (gameMode !== 'exam' || !rawRun?.startedAt || !rawRun?.durationSeconds) {
      setRemainingSeconds(undefined);
      return;
    }

    const start = new Date(rawRun.startedAt).getTime();
    const durationMs = rawRun.durationSeconds * 1000;

    const updateTimer = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        setExamAbgelaufen(true);
        beendeExam?.();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [gameMode, rawRun, beendeExam]);

  const checkBereichComplete = useCallback(
    (frageId: string) => {
      const frage = aktiveFragen.find((f) => f.id === frageId);
      if (!frage) return;

      const bereichFragen = aktiveFragen.filter(
        (f) => f.bereich === frage.bereich,
      );
      const alleBeantwortet = bereichFragen.every(
        (f) => antworten[f.id] !== undefined || f.id === frageId,
      );

      if (alleBeantwortet) {
        setBereichComplete(frage.bereich);
      }
    },
    [aktiveFragen, antworten],
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
        checkBereichComplete(aktuelleFrage.id);
      } else if (gameMode === 'arcade' && isPending) {
        beantworteFrage(aktuelleFrage.id, buchstabe);
        setPendingWrongAnswer(null);
        checkBereichComplete(aktuelleFrage.id);
      } else if (gameMode === 'arcade' && !isPending) {
        setPendingWrongAnswer(buchstabe);
      } else {
        beantworteFrage(aktuelleFrage.id, buchstabe);
        setPendingWrongAnswer(null);
        checkBereichComplete(aktuelleFrage.id);
      }
    },
    [
      aktuelleFrage,
      hasAnswered,
      isPending,
      pendingWrongAnswer,
      gameMode,
      beantworteFrage,
      checkBereichComplete,
      examAbgelaufen,
    ],
   );

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onAnswer: handleAnswerClick,
    onPrev: isPending ? undefined : vorherigeFrage,
    onNext: isPending ? undefined : naechsteFrage,
    onToggleFavorite: () => {
      if (aktuelleFrage) {
        toggleFavorite(aktuelleFrage.id);
      }
    },
    // Space is a no-op in quiz mode (answer selection via number keys only)
    onSpace: undefined,
    onOpenCheatSheet: () => setCheatSheetOpen(true),
    onEscape: () => {
      if (cheatSheetOpen) {
        setCheatSheetOpen(false);
      } else {
        onOpenRunActions();
      }
    },
    enabled: quiz.isActive && !cheatSheetOpen && !gameMenuOpen,
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

           {/* Bereichs-Abschluss Dialog (Issue #46) */}
          <Dialog
            open={bereichComplete !== null}
            onOpenChange={(open) => !open && setBereichComplete(null)}
          >
            <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  Bereich abgeschlossen!
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-sm dark:text-slate-400">
                  Du hast alle Fragen im Bereich{' '}
                  <span className="text-teal-400 font-medium">
                    {bereichComplete}
                  </span>{' '}
                  beantwortet.
                </DialogDescription>
              </DialogHeader>
              <p className="text-slate-600 text-sm dark:text-slate-300">
                Du kannst über die Startansicht einen weiteren Bereich
                hinzufügen.
              </p>
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => setBereichComplete(null)}
                  variant="outline"
                  className="flex-1 border-slate-300 text-slate-600 hover:bg-slate-100 text-xs dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Weiterlernen
                </Button>
                <Button
                  onClick={() => {
                    setBereichComplete(null);
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
