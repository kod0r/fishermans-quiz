import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Home, Play, BarChart3 } from 'lucide-react';

interface Props {
  onHome: () => void;
  onResumeQuiz?: () => void;
  showResume?: boolean;
  onShowProgress?: () => void;
  showProgress?: boolean;
}

export function Sidebar({ onHome, onResumeQuiz, showResume, onShowProgress, showProgress }: Props) {
  return (
    <TooltipProvider delayDuration={800}>
      <nav
        className="fixed left-2 top-2 z-50 flex flex-col gap-2 sm:left-4 sm:top-4 sm:gap-3"
        aria-label="Hauptnavigation"
      >
        {/* Home */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onHome}
              variant="outline"
              size="icon"
              aria-label="Zur Startseite"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800/90 border-slate-600/50 text-slate-300 hover:bg-slate-700 hover:text-white shadow-lg backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Startseite</p>
          </TooltipContent>
        </Tooltip>

        {/* Quiz fortsetzen */}
        {showResume && onResumeQuiz && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onResumeQuiz}
                variant="outline"
                size="icon"
                aria-label="Quiz fortsetzen"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-teal-900/90 border-teal-500/50 text-teal-400 hover:bg-teal-800 hover:text-white shadow-lg backdrop-blur-sm animate-pulse focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                <Play className="w-4 h-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Quiz fortsetzen</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Fortschritt */}
        {showProgress && onShowProgress && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onShowProgress}
                variant="outline"
                size="icon"
                aria-label="Quiz-Fortschritt anzeigen"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800/90 border-slate-600/50 text-slate-300 hover:bg-slate-700 hover:text-white shadow-lg backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                <BarChart3 className="w-4 h-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Quiz-Fortschritt</p>
            </TooltipContent>
          </Tooltip>
        )}
      </nav>
    </TooltipProvider>
  );
}
