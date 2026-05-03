import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { Frage } from '@/types/quiz';

interface Props {
  frage: Frage;
  userAntwort: string | undefined;
  hasAnswered: boolean;
  pendingWrongAnswer: string | null;
  onAnswerClick: (buchstabe: string) => void;
  hideFeedback?: boolean;
}

export const AnswerGrid = React.memo(function AnswerGrid({
  frage,
  userAntwort,
  hasAnswered,
  pendingWrongAnswer,
  onAnswerClick,
  hideFeedback = false,
}: Props) {

  return (
    <div
      className="space-y-2 flex-1 flex flex-col justify-center"
      role="radiogroup"
      aria-label="Antwortmöglichkeiten"
    >
      {(['A', 'B', 'C'] as const).map((buchstabe) => {
        const isSelected = userAntwort === buchstabe;
        const isCorrect = frage.richtige_antwort === buchstabe;
        const isPendingSelection = pendingWrongAnswer === buchstabe;

        let cls =
          'border-slate-300/50 bg-slate-100/80 hover:bg-slate-200/50 hover:border-slate-400/50 dark:border-slate-600/50 dark:bg-slate-700/30 dark:hover:bg-slate-700/50 dark:hover:border-slate-500/50';
        if (hasAnswered && !hideFeedback) {
          if (isSelected && isCorrect)
            cls = 'border-emerald-500 bg-emerald-500/10';
          else if (isSelected && !isCorrect)
            cls = 'border-red-500 bg-red-500/10';
          else if (isCorrect)
            cls = 'border-emerald-500/50 bg-emerald-500/5';
        } else if (isPendingSelection) {
          cls = 'border-red-500 bg-red-500/10 opacity-80';
        } else if (isSelected) {
          cls = 'border-teal-400 bg-teal-400/10';
        }

        const isDisabled = hasAnswered || isPendingSelection;

        return (
          <button
            key={buchstabe}
            onClick={() => onAnswerClick(buchstabe)}
            disabled={isDisabled}
            role="radio"
            aria-checked={isSelected || isPendingSelection}
            aria-disabled={isDisabled}
            aria-label={`Antwort ${buchstabe}: ${frage.antworten[buchstabe]}`}
            className={`w-full text-left min-h-[72px] sm:min-h-20 h-auto py-3 rounded-lg border transition-all flex items-center gap-3 px-3 ${cls} ${isDisabled ? 'cursor-default opacity-50' : 'cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900'}`}
          >
            <span
              className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm ${hasAnswered && isCorrect && !hideFeedback ? 'bg-emerald-500 text-white' : hasAnswered && isSelected && !isCorrect && !hideFeedback ? 'bg-red-500 text-white' : isPendingSelection ? 'bg-red-500 text-white' : isSelected ? 'bg-teal-400 text-slate-900' : 'bg-slate-300/50 text-slate-600 dark:bg-slate-600/50 dark:text-slate-300'}`}
              aria-hidden="true"
            >
              {buchstabe}
            </span>
            <span
              className={`flex-1 leading-snug text-sm flex items-center ${hasAnswered && isCorrect && !hideFeedback ? 'text-emerald-600 dark:text-emerald-300' : hasAnswered && isSelected && !isCorrect && !hideFeedback ? 'text-red-600 dark:text-red-300' : isPendingSelection ? 'text-red-600 dark:text-red-300' : 'text-slate-700 dark:text-slate-200'}`}
            >
              {frage.antworten[buchstabe]}
            </span>

            {isPendingSelection && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-amber-400 font-medium">
                  Noch ein Versuch
                </span>
                <AlertTriangle
                  className="w-4 h-4 text-amber-400"
                  aria-hidden="true"
                />
              </div>
            )}

            {hasAnswered && isCorrect && !hideFeedback && (
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {hasAnswered && isSelected && !isCorrect && !hideFeedback && (
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
});
