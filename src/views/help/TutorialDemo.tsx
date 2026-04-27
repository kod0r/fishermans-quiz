import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QuizHeader } from '@/components/QuizHeader';
import { AnswerGrid } from '@/components/AnswerGrid';
import { QuizFooter } from '@/components/QuizFooter';
import { QuizCardShell } from '@/components/QuizCardShell';
import { useTutorialRun } from '@/hooks/useTutorialRun';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { GameMode } from '@/types/quiz';
import { Fish, RotateCcw } from 'lucide-react';
import { MODE_COPY } from './modeCopy';

interface TutorialDemoProps {
  mode: GameMode;
  questionIds: string[];
  onBack: () => void;
}

export default function TutorialDemo({ mode, questionIds, onBack }: TutorialDemoProps) {
  const tutorial = useTutorialRun(mode, questionIds);
  const [pendingWrongAnswer, setPendingWrongAnswer] = useState<string | null>(null);
  const [showExamSubmitDialog, setShowExamSubmitDialog] = useState(false);
  const [examAbgelaufen, setExamAbgelaufen] = useState(false);
  const [firstWrongIndex, setFirstWrongIndex] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | undefined>();

  const {
    aktuelleFrage,
    aktuellerIndex,
    aktiveFragen,
    beantworteFrage,
    naechsteFrage,
    vorherigeFrage,
    beendeRun,
    hasAnswered,
    userAntwort,
    isActive,
    statistiken,
    rawRun,
  } = tutorial;

  // Clear pending wrong answer when navigating
  useEffect(() => {
    setPendingWrongAnswer(null);
  }, [aktuellerIndex]);

  // Exam timer
  useEffect(() => {
    if (mode !== 'exam' || !rawRun?.startedAt || !rawRun?.durationSeconds) {
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
        beendeRun();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        return;
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [mode, rawRun, beendeRun]);

  const korrekt = statistiken.korrekt;
  const falsch = statistiken.falsch;
  const offen = statistiken.gesamt - statistiken.beantwortet;
  const isPending = pendingWrongAnswer !== null;

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
      } else if (mode === 'arcade' && isPending) {
        beantworteFrage(aktuelleFrage.id, buchstabe);
        setPendingWrongAnswer(null);
      } else if (mode === 'arcade' && !isPending) {
        setPendingWrongAnswer(buchstabe);
      } else {
        beantworteFrage(aktuelleFrage.id, buchstabe);
        setPendingWrongAnswer(null);
        if (mode === 'hardcore' && firstWrongIndex === null) {
          setFirstWrongIndex(aktuellerIndex + 1);
        }
      }
    },
    [aktuelleFrage, hasAnswered, isPending, pendingWrongAnswer, mode, beantworteFrage, examAbgelaufen, firstWrongIndex, aktuellerIndex]
  );

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onAnswer: handleAnswerClick,
    onPrev: isPending ? undefined : vorherigeFrage,
    onNext: isPending ? undefined : naechsteFrage,
    onToggleFavorite: undefined,
    onSpace: undefined,
    onOpenCheatSheet: undefined,
    onEscape: undefined,
    enabled: isActive && !showExamSubmitDialog,
  });

  const allAnswered = statistiken.beantwortet === statistiken.gesamt;
  const isComplete = !isActive || allAnswered || examAbgelaufen;

  // End screen
  if (isComplete || !aktuelleFrage) {
    const accuracy = statistiken.gesamt > 0 ? Math.round((statistiken.korrekt / statistiken.gesamt) * 100) : 0;
    const copy = MODE_COPY[mode];

    let hardcoreNote: string | null = null;
    if (mode === 'hardcore' && firstWrongIndex !== null) {
      hardcoreNote = `Im echten Hardcore-Modus wäre dein Run bei Frage ${firstWrongIndex} beendet und das Thema gesperrt worden.`;
    } else if (mode === 'hardcore') {
      hardcoreNote = 'Im echten Hardcore-Modus hättest du dieses Thema gemeistert.';
    }

    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Demo beendet
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {mode === 'arcade' ? 'Arcade' : mode === 'exam' ? 'Prüfung' : 'Hardcore'} — Demo
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{statistiken.korrekt}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Richtig</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-lg font-bold text-red-600 dark:text-red-400">{statistiken.falsch}</p>
            <p className="text-[10px] text-red-600 dark:text-red-400">Falsch</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{accuracy}%</p>
            <p className="text-[10px] text-blue-600 dark:text-blue-400">Erfolgsquote</p>
          </div>
        </div>

        {hardcoreNote && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/30">
            <p className="text-sm text-amber-800 dark:text-amber-300">{hardcoreNote}</p>
          </div>
        )}

        {mode === 'exam' && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/30">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {accuracy >= 60
                ? 'Du hättest bestanden. Im echten Prüfungsmodus wird das Ergebnis gespeichert.'
                : 'Du hättest nicht bestanden. 60 % sind zum Bestehen nötig.'}
            </p>
          </div>
        )}

        <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Konsequenz</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{copy.consequence}</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Fish className="w-4 h-4 mr-1 text-teal-400 -scale-x-100" />
            Zurück
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Demo wiederholen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={800}>
      <div className="space-y-3">
        {/* <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
        >
          <Fish className="w-4 h-4 text-teal-400 -scale-x-100" />
          Demo beenden
        </button> */}

        <QuizHeader
          gameMode={mode}
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
          isFavorite={false}
          onToggleFavorite={() => {}}
          note=""
          onNoteChange={() => {}}
        >
          <AnswerGrid
            frage={aktuelleFrage}
            userAntwort={userAntwort}
            hasAnswered={hasAnswered}
            pendingWrongAnswer={pendingWrongAnswer}
            onAnswerClick={handleAnswerClick}
            hideFeedback={mode === 'exam'}
          />
        </QuizCardShell>

        <QuizFooter
          aktuellerIndex={aktuellerIndex}
          totalFragen={aktiveFragen.length}
          isPending={isPending}
          onPrev={vorherigeFrage}
          onNext={naechsteFrage}
        />

        {mode === 'exam' && !examAbgelaufen && (
          <div className="flex justify-center">
            <Button
              onClick={() => setShowExamSubmitDialog(true)}
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-50 text-xs dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/30"
            >
              Prüfung abgeben
            </Button>
          </div>
        )}

        <Dialog open={showExamSubmitDialog} onOpenChange={setShowExamSubmitDialog}>
          <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white">
            <DialogHeader>
              <DialogTitle className="text-base">Prüfung vorzeitig abgeben?</DialogTitle>
              <DialogDescription className="text-slate-500 text-sm dark:text-slate-400">
                Deine bisherigen Antworten werden gewertet.
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
                  beendeRun();
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Abgeben
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
