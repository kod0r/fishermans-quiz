import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Home, RotateCcw } from 'lucide-react';
import type { QuizContext } from '@/hooks/useQuiz';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz: QuizContext;
}

export function PauseMenuDialog({ open, onOpenChange, quiz }: Props) {
  const handleExit = () => {
    quiz.unterbrecheRun();
    quiz.goToView('start');
  };

  const handleRestart = () => {
    // Restart the current run: clear answers and reset index
    quiz.unterbrecheRun();
    // Restart with same parameters is tricky; for now just exit
    // Could add restart logic later if needed
    onOpenChange(false);
    // For now, exit to start and user can restart manually
    quiz.goToView('start');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-xs dark:bg-slate-900 dark:border-slate-700 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-base">Pause</DialogTitle>
          <DialogDescription className="text-slate-500 text-sm dark:text-slate-400">
            Choose an action
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-2">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Weiter
          </Button>
          <Button
            onClick={handleRestart}
            variant="outline"
            className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Neustart
          </Button>
          <Button
            onClick={handleExit}
            variant="destructive"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Zur Startseite
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
