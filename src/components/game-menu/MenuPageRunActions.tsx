import { useState } from 'react';
import { Play, RotateCcw, Home } from 'lucide-react';
import type { MenuPageComponentProps } from './menuConfig';

export function MenuPageRunActions({ quiz, onClose }: MenuPageComponentProps) {
  const [confirming, setConfirming] = useState<'restart' | 'exit' | null>(null);
  const isExam = quiz.gameMode === 'exam';

  const handleContinue = () => {
    onClose();
  };

  const handleRestart = () => {
    setConfirming('restart');
  };

  const confirmRestart = () => {
    setConfirming(null);
    quiz.restarteRun();
    onClose();
  };

  const handleExit = () => {
    setConfirming('exit');
  };

  const confirmExit = () => {
    setConfirming(null);
    quiz.unterbrecheRun();
    quiz.goToView('start');
    onClose();
  };

  const cancelConfirm = () => {
    setConfirming(null);
  };

  if (!quiz.isActive) {
    return (
      <div className="py-8 px-4 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isExam ? 'Keine aktive Prüfung.' : 'Kein aktives Quiz.'}
        </p>
      </div>
    );
  }

  return (
    <div className="py-2 space-y-6 px-4">
      {/* Primary CTA: Continue */}
      <section>
        <button
          type="button"
          data-menu-item
          onClick={handleContinue}
          aria-label={isExam ? 'Prüfung fortsetzen' : 'Quiz fortsetzen'}
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
          {/* Restart — hidden in exam mode */}
          {!isExam && (
            confirming === 'restart' ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-900/20">
                <span className="flex-1 text-[15px] font-medium text-amber-700 dark:text-amber-400">
                  Wirklich neustarten?
                </span>
                <button
                  type="button"
                  data-menu-item
                  onClick={cancelConfirm}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 px-2 py-1 rounded"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  data-menu-item
                  onClick={confirmRestart}
                  className="text-xs font-semibold text-amber-700 dark:text-amber-400 px-2 py-1 rounded hover:bg-amber-100 dark:hover:bg-amber-900/40"
                >
                  Neustart
                </button>
              </div>
            ) : (
              <button
                type="button"
                data-menu-item
                onClick={handleRestart}
                aria-label="Quiz neu starten"
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none active:scale-[0.98] cursor-pointer hover:bg-accent/50 text-foreground"
              >
                <span className="flex-shrink-0 text-muted-foreground">
                  <RotateCcw className="w-5 h-5" />
                </span>
                <span className="flex-1 text-[15px] font-medium leading-tight">Neustart</span>
              </button>
            )
          )}

          {/* Exit */}
          {confirming === 'exit' ? (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20">
              <span className="flex-1 text-[15px] font-medium text-red-700 dark:text-red-400">
                Wirklich beenden?
              </span>
              <button
                type="button"
                data-menu-item
                onClick={cancelConfirm}
                className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 px-2 py-1 rounded"
              >
                Abbrechen
              </button>
              <button
                type="button"
                data-menu-item
                onClick={confirmExit}
                className="text-xs font-semibold text-red-700 dark:text-red-400 px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/40"
              >
                Beenden
              </button>
            </div>
          ) : (
            <button
              type="button"
              data-menu-item
              onClick={handleExit}
              aria-label={isExam ? 'Prüfung beenden' : 'Quiz beenden'}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none active:scale-[0.98] cursor-pointer hover:bg-accent/50 text-red-500 dark:text-red-400"
            >
              <span className="flex-shrink-0 text-red-500 dark:text-red-400">
                <Home className="w-5 h-5" />
              </span>
              <span className="flex-1 text-[15px] font-medium leading-tight">
                {isExam ? 'Prüfung beenden' : 'Quiz beenden'}
              </span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
