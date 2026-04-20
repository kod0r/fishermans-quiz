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
    <TooltipProvider delayDuration={1500}>
      <nav className="fixed left-4 top-4 z-50 flex flex-col gap-3">
        {/* Home */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onHome}
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-full bg-slate-800/90 border-slate-600/50 text-slate-300 hover:bg-slate-700 hover:text-white shadow-lg backdrop-blur-sm"
            >
              <Home className="w-4 h-4" />
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
                className="w-10 h-10 rounded-full bg-teal-900/90 border-teal-500/50 text-teal-400 hover:bg-teal-800 hover:text-white shadow-lg backdrop-blur-sm animate-pulse"
              >
                <Play className="w-4 h-4" />
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
                className="w-10 h-10 rounded-full bg-slate-800/90 border-slate-600/50 text-slate-300 hover:bg-slate-700 hover:text-white shadow-lg backdrop-blur-sm"
              >
                <BarChart3 className="w-4 h-4" />
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
