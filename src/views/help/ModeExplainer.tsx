import { useState, useCallback } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MODE_COPY } from './modeCopy';
import { ARCADE_DEMO_QUESTIONS, HARDCORE_DEMO_QUESTIONS, EXAM_DEMO_QUESTIONS } from './demoQuestions';
import TutorialDemo from './TutorialDemo';

interface ModeExplainerProps {
  mode: 'arcade' | 'hardcore' | 'exam';
  onDemoActiveChange?: (active: boolean) => void;
  onEndDemo?: () => void;
}

const MODE_META: Record<
  'arcade' | 'hardcore' | 'exam',
  { color: string; bulletColor: string; buttonColor: string }
> = {
  arcade: { color: 'text-amber-600 dark:text-amber-400', bulletColor: 'bg-amber-400', buttonColor: 'bg-amber-500 hover:bg-amber-600' },
  hardcore: { color: 'text-red-600 dark:text-red-400', bulletColor: 'bg-red-400', buttonColor: 'bg-red-500 hover:bg-red-600' },
  exam: { color: 'text-blue-600 dark:text-blue-400', bulletColor: 'bg-blue-400', buttonColor: 'bg-blue-500 hover:bg-blue-600' },
};

const DEMO_QUESTIONS: Record<'arcade' | 'hardcore' | 'exam', string[]> = {
  arcade: ARCADE_DEMO_QUESTIONS,
  hardcore: HARDCORE_DEMO_QUESTIONS,
  exam: EXAM_DEMO_QUESTIONS,
};

export default function ModeExplainer({ mode, onDemoActiveChange, onEndDemo }: ModeExplainerProps) {
  const [demoActive, setDemoActive] = useState(false);

  const handleSetDemoActive = useCallback((active: boolean) => {
    setDemoActive(active);
    onDemoActiveChange?.(active);
  }, [onDemoActiveChange]);
  const copy = MODE_COPY[mode];
  const meta = MODE_META[mode];

  if (demoActive) {
    return (
      <TutorialDemo
        mode={mode}
        questionIds={DEMO_QUESTIONS[mode]}
        onBack={() => {
          handleSetDemoActive(false);
          onEndDemo?.();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className={`text-lg font-bold ${meta.color}`}>{copy.title}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          {copy.hook}
        </p>
      </div>

      <ul className="space-y-2">
        {copy.bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${meta.bulletColor} flex-shrink-0`} />
            {bullet}
          </li>
        ))}
      </ul>

      <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
          Konsequenz
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
          {copy.consequence}
        </p>
      </div>

      <Button
        onClick={() => handleSetDemoActive(true)}
        className={`w-full ${meta.buttonColor} text-white font-semibold`}
      >
        <Play className="w-4 h-4 mr-1.5" />
        Demo starten
      </Button>
    </div>
  );
}
