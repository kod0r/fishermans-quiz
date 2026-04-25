import type { QuizContext } from '@/hooks/useQuiz';
import type { MenuPageId } from '@/hooks/useGameMenu';

interface MenuPageNavigationProps {
  quiz: QuizContext;
  onPop: () => void;
  onPush: (page: MenuPageId) => void;
}

export function MenuPageNavigation({ quiz }: MenuPageNavigationProps) {
  const {
    aktiveFragen,
    antworten,
    aktuellerIndex,
    springeZuFrage,
    view,
    goToView,
  } = quiz;

  const handleJump = (index: number) => {
    if (view !== 'quiz') {
      goToView('quiz');
    }
    springeZuFrage(index);
  };

  return (
    <div className="py-4 px-4">
      <div className="max-h-80 overflow-y-auto pr-1">
        <div
          className="grid grid-cols-5 sm:grid-cols-10 gap-1.5"
          role="list"
          aria-label="Fragen-Übersicht"
        >
          {aktiveFragen.map((frage, idx) => {
            const beantwortet = antworten[frage.id] !== undefined;
            const korrekt = antworten[frage.id] === frage.richtige_antwort;
            const aktuell = idx === aktuellerIndex;

            let stateLabel: string;
            if (aktuell) {
              stateLabel = ', aktuell';
            } else if (beantwortet && korrekt) {
              stateLabel = ', richtig beantwortet';
            } else if (beantwortet && !korrekt) {
              stateLabel = ', falsch beantwortet';
            } else {
              stateLabel = ', unbeantwortet';
            }

            return (
              <button
                data-menu-item
                key={frage.id}
                onClick={() => handleJump(idx)}
                aria-label={`Frage ${idx + 1}${stateLabel}`}
                aria-current={aktuell ? 'true' : undefined}
                className={`
                  w-full aspect-square rounded-md text-xs font-medium
                  flex items-center justify-center
                  transition-colors
                  focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2
                  focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900
                  ${aktuell
                    ? 'bg-teal-500 text-white'
                    : beantwortet && korrekt
                      ? 'bg-emerald-500 text-white dark:bg-emerald-500 dark:text-white'
                      : beantwortet && !korrekt
                        ? 'bg-red-500 text-white dark:bg-red-500 dark:text-white'
                        : 'bg-slate-100/80 text-slate-600 border border-slate-300/30 hover:bg-slate-200 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600/30 dark:hover:bg-slate-700'
                  }
                `}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {aktiveFragen.length === 0 && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
          Keine aktiven Fragen vorhanden.
        </p>
      )}
    </div>
  );
}
