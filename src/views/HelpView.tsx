import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Fish } from 'lucide-react';
import HelpLanding from './help/HelpLanding';
import ModeExplainer from './help/ModeExplainer';

type HelpPanel = 'landing' | 'arcade' | 'hardcore' | 'exam';

interface HelpViewProps {
  onBack: () => void;
}

export default function HelpView({ onBack }: HelpViewProps) {
  const [panel, setPanel] = useState<HelpPanel>('landing');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-blue-950 dark:via-slate-900 dark:to-teal-950">
      <div className="container mx-auto px-3 sm:px-4 py-1 sm:py-2 pb-20 sm:pb-24 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pt-2">
          <button
            onClick={panel === 'landing' ? onBack : () => setPanel('landing')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
          >
            <Fish className="w-4 h-4 text-teal-400 -scale-x-100" aria-hidden="true" />
            Zurück
          </button>
        </div>

        <Card className="bg-white/80 border-slate-200/50 backdrop-blur-sm dark:bg-slate-800/50 dark:border-slate-700/50">
          <CardContent className="py-4 px-4">
            {panel === 'landing' && (
              <>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  Hilfe & Tutorials
                </h1>
                <HelpLanding
                  onSelectMode={(mode) => setPanel(mode)}
                />
              </>
            )}
            {panel === 'arcade' && (
              <ModeExplainer mode="arcade" onBack={() => setPanel('landing')} />
            )}
            {panel === 'hardcore' && (
              <ModeExplainer mode="hardcore" onBack={() => setPanel('landing')} />
            )}
            {panel === 'exam' && (
              <ModeExplainer mode="exam" onBack={() => setPanel('landing')} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
