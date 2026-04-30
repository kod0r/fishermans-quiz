import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';
import { Keyboard } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHORTCUTS: { key: string; description: string; keys: string[] }[] = [
  { key: 'answers', description: 'Select answer', keys: ['1', '2', '3'] },
  { key: 'nav-prev', description: 'Previous question', keys: ['←'] },
  { key: 'nav-next', description: 'Next question', keys: ['→'] },
  { key: 'reveal', description: 'Reveal answer (flashcard)', keys: ['Space'] },
  { key: 'favorite', description: 'Toggle favorite', keys: ['F'] },
  { key: 'help', description: 'Show help', keys: ['?'] },
  { key: 'menu', description: 'Open menu', keys: ['Esc'] },
];

export function CheatSheetModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-teal-400" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-sm dark:text-slate-400">
            Press a key to perform the action immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {SHORTCUTS.map(({ key, description, keys }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-700 dark:text-slate-300">{description}</span>
              <div className="flex items-center gap-1">
                {keys.map((k, i) => (
                  <Kbd key={i}>{k}</Kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
