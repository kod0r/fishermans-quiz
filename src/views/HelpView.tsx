import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { QuizContext } from '@/hooks/useQuiz';

import HelpLanding from './help/HelpLanding';
import ModeExplainer from './help/ModeExplainer';

type HelpPanel = 'landing' | 'arcade' | 'hardcore' | 'exam';

interface HelpViewProps {
  quiz: QuizContext;
}

export default function HelpView({ quiz }: HelpViewProps) {
  const [panel, setPanel] = useState<HelpPanel>('landing');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-blue-950 dark:via-slate-900 dark:to-teal-950">
      <div className="container mx-auto px-3 sm:px-4 py-1 sm:py-2 pb-20 sm:pb-24 max-w-3xl">
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
              <ModeExplainer mode="arcade" onDemoActiveChange={quiz.setIsTutorialDemoActive} onEndDemo={() => setPanel('landing')} />
            )}
            {panel === 'hardcore' && (
              <ModeExplainer mode="hardcore" onDemoActiveChange={quiz.setIsTutorialDemoActive} onEndDemo={() => setPanel('landing')} />
            )}
            {panel === 'exam' && (
              <ModeExplainer mode="exam" onDemoActiveChange={quiz.setIsTutorialDemoActive} onEndDemo={() => setPanel('landing')} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
