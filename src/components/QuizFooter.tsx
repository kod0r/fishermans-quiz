import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  aktuellerIndex: number;
  totalFragen: number;
  isPending: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export const QuizFooter = React.memo(function QuizFooter({
  aktuellerIndex,
  totalFragen,
  isPending,
  onPrev,
  onNext,
}: Props) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onPrev}
            disabled={aktuellerIndex === 0}
            variant="outline"
            aria-label="Vorherige Frage"
            className="border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 text-xs sm:text-sm min-w-[44px] min-h-[44px] py-2 px-4"
          >
            <ChevronLeft className="w-4 h-4 mr-0.5" aria-hidden="true" />
            <span className="hidden sm:inline">Zurück</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Vorherige Frage</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onNext}
            disabled={aktuellerIndex === totalFragen - 1 || isPending}
            variant="outline"
            aria-label="Nächste Frage"
            className="border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 text-xs sm:text-sm min-w-[44px] min-h-[44px] py-2 px-4"
          >
            <span className="hidden sm:inline">Weiter</span>
            <ChevronRight className="w-4 h-4 ml-0.5" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Nächste Frage</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
});
