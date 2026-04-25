import { useState } from 'react';
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
import { Play, RotateCcw, Home, BarChart3 } from 'lucide-react';
import type { MenuPageComponentProps } from './menuConfig';

export function MenuPageRunActions({ quiz, onClose }: MenuPageComponentProps) {
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const handleContinue = () => {
    onClose();
  };

  const handleRestart = () => {
    setShowRestartDialog(true);
  };

  const confirmRestart = () => {
    setShowRestartDialog(false);
    quiz.unterbrecheRun();
    quiz.goToView('start');
    onClose();
  };

  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    setShowExitDialog(false);
    quiz.unterbrecheRun();
    quiz.goToView('start');
    onClose();
  };

  const handleProgress = () => {
    quiz.goToView('progress');
    onClose();
  };

  if (!quiz.isActive) {
    return (
      <div className="py-8 px-4 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Kein aktives Quiz.
        </p>
      </div>
    );
  }

  return (
    <div className="py-2 space-y-6 px-4">
      {/* Primary CTA: Continue */}
      <section>
        <button
          onClick={handleContinue}
          aria-label="Quiz fortsetzen"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-500 text-white font-semibold text-[15px] hover:bg-teal-600 active:scale-[0.98] transition-all"
        >
          <Play className="w-5 h-5" />
          Weiter
        </button>
      </section>

      {/* Actions */}
      <section>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-4 dark:text-slate-400">
          Aktionen
        </h3>
        <div className="bg-slate-100/80 dark:bg-slate-800/50 rounded-xl overflow-hidden divide-y divide-slate-200/50 dark:divide-slate-700/50">
          <button
            onClick={handleRestart}
            aria-label="Quiz neu starten"
            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none active:scale-[0.98] cursor-pointer hover:bg-accent/50 text-foreground"
          >
            <span className="flex-shrink-0 text-muted-foreground">
              <RotateCcw className="w-5 h-5" />
            </span>
            <span className="flex-1 text-[15px] font-medium leading-tight">Neustart</span>
          </button>

          <button
            onClick={handleProgress}
            aria-label="Zum Fortschritt"
            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none active:scale-[0.98] cursor-pointer hover:bg-accent/50 text-foreground"
          >
            <span className="flex-shrink-0 text-muted-foreground">
              <BarChart3 className="w-5 h-5" />
            </span>
            <span className="flex-1 text-[15px] font-medium leading-tight">Fortschritt</span>
          </button>

          <button
            onClick={handleExit}
            aria-label="Zur Startseite"
            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none active:scale-[0.98] cursor-pointer hover:bg-accent/50 text-red-500 dark:text-red-400"
          >
            <span className="flex-shrink-0 text-red-500 dark:text-red-400">
              <Home className="w-5 h-5" />
            </span>
            <span className="flex-1 text-[15px] font-medium leading-tight">Zur Startseite</span>
          </button>
        </div>
      </section>

      {/* Restart Confirmation */}
      <AlertDialog open={showRestartDialog} onOpenChange={setShowRestartDialog}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">
              Quiz neu starten?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              Der aktuelle Fortschritt wird beendet. Meta-Fortschritt bleibt erhalten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowRestartDialog(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRestart}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Neustart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exit Confirmation */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">
              Quiz beenden?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              Meta-Fortschritt bleibt erhalten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowExitDialog(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmExit}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Beenden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
