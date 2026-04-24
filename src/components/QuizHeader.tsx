import React, { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import type { GameMode } from '@/types/quiz';

interface Props {
  gameMode: GameMode;
  korrekt: number;
  falsch: number;
  offen: number;
  aktuellerIndex: number;
  totalFragen: number;
  remainingSeconds?: number;
}

export const QuizHeader = React.memo(function QuizHeader({
  gameMode,
  korrekt,
  falsch,
  offen,
  aktuellerIndex,
  totalFragen,
  remainingSeconds,
}: Props) {
  const fortschritt = useMemo(
    () => (totalFragen > 0 ? ((aktuellerIndex + 1) / totalFragen) * 100 : 0),
    [aktuellerIndex, totalFragen]
  );

  const timerDisplay = useMemo(() => {
    if (remainingSeconds === undefined) return null;
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    const isLow = remainingSeconds < 300; // < 5 minutes
    return (
      <span
        className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
          isLow
            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        }`}
        aria-live="polite"
      >
        {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </span>
    );
  }, [remainingSeconds]);

  return (
    <>
      {/* Top Bar — Run-Stats */}
      <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              gameMode === 'arcade'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : gameMode === 'exam'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {gameMode === 'arcade' ? 'Arcade' : gameMode === 'exam' ? 'Prüfung' : 'Hardcore'}
          </span>
          {timerDisplay}
        </div>
        <div
          role="status"
          className="flex items-center gap-1.5"
          aria-label={`${korrekt} richtig, ${falsch} falsch, ${offen} offen`}
        >
          <span className="text-emerald-400 font-bold text-sm">{korrekt}</span>
          <span className="text-slate-500 text-xs">/</span>
          <span className="text-red-400 font-bold text-sm">{falsch}</span>
          <span className="text-slate-500 text-xs">/</span>
          <span className="text-slate-400 text-sm">{offen}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3 sm:mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1 dark:text-slate-400">
          <span id="progress-label">
            Frage {aktuellerIndex + 1} / {totalFragen}
          </span>
          <span aria-hidden="true">{Math.round(fortschritt)}%</span>
        </div>
        <Progress
          value={fortschritt}
          className="h-1.5 bg-slate-200 dark:bg-slate-700"
          aria-labelledby="progress-label"
          aria-valuenow={Math.round(fortschritt)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </>
  );
});
