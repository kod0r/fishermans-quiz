import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  TooltipProvider,
} from '@/components/ui/tooltip';
import { CheckCircle, XCircle, HelpCircle, ChevronDown } from 'lucide-react';
import type { QuizContext } from '@/hooks/useQuiz';

interface Props {
  quiz: QuizContext;
}

export default function ProgressView({ quiz }: Props) {
  const { statistiken, aktiveFragen, antworten, springeZuFrage, getFrageMeta } = quiz;
  const [showWrong, setShowWrong] = useState(false);
  const [showUnanswered, setShowUnanswered] = useState(false);

  const pct = statistiken.gesamt > 0 ? (statistiken.korrekt / statistiken.gesamt) * 100 : 0;
  const passed = pct >= 60;

  const bereichStats: Record<string, { korrekt: number; falsch: number; gesamt: number }> = {};
  aktiveFragen.forEach(f => {
    const b = f.bereich;
    if (!bereichStats[b]) bereichStats[b] = { korrekt: 0, falsch: 0, gesamt: 0 };
    bereichStats[b].gesamt++;
    if (antworten[f.id] === f.richtige_antwort) bereichStats[b].korrekt++;
    else if (antworten[f.id]) bereichStats[b].falsch++;
  });

  const falsche = aktiveFragen.filter(f => antworten[f.id] && antworten[f.id] !== f.richtige_antwort);
  const offen = aktiveFragen.filter(f => !antworten[f.id]);

  return (
    <TooltipProvider delayDuration={800}>
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-teal-950">
        <div className="container mx-auto px-2.5 sm:px-3.5 py-5 sm:py-7 max-w-4xl pt-12 sm:pt-14">

          <div className="text-center mb-5 sm:mb-7">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Quiz-Fortschritt</h1>
            <p className="text-slate-400 mt-2">Aktueller Durchlauf</p>
          </div>

          {/* Run-Ergebnis */}
          <Card className={`mb-4 sm:mb-6 ${passed ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
            <CardContent className="pt-5 sm:pt-7 pb-5 sm:pb-7 text-center">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${passed ? 'bg-emerald-500/20' : 'bg-red-500/20'}`} aria-hidden="true">
                {passed ? <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400" /> : <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-400" />}
              </div>
              <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${passed ? 'text-emerald-400' : 'text-red-400'}`}>{passed ? 'Bestanden!' : 'Nicht bestanden'}</h2>
              <p className="text-slate-300 mb-5">{statistiken.korrekt} von {statistiken.gesamt} richtig</p>
              <div className="max-w-md mx-auto">
                <Progress
                  value={pct}
                  className="h-3 sm:h-4 bg-slate-700"
                  aria-label={`Gesamtergebnis: ${Math.round(pct)}%`}
                  aria-valuenow={Math.round(pct)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
                <p className="text-slate-400 mt-2">{Math.round(pct)}% — 60% zum Bestehen</p>
              </div>

              {/* Bereichs-Stats */}
              <div className="mt-5 text-left space-y-3 max-w-md mx-auto">
                {Object.entries(bereichStats).map(([b, s]) => {
                  const p = s.gesamt > 0 ? (s.korrekt / s.gesamt) * 100 : 0;
                  return (
                    <div key={b}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{b}</span>
                        <span className={`font-medium ${p >= 60 ? 'text-emerald-400' : 'text-red-400'}`}>{s.korrekt}/{s.gesamt} ({Math.round(p)}%)</span>
                      </div>
                      <Progress value={p} className="h-2 bg-slate-700" aria-label={`${b}: ${Math.round(p)}% richtig`} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Falsche Antworten — klappbar */}
          {falsche.length > 0 && (
            <Card className="mb-4 sm:mb-6 bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <button
                  onClick={() => setShowWrong(!showWrong)}
                  aria-expanded={showWrong}
                  aria-controls="wrong-answers-list"
                  className="w-full flex items-center justify-between min-h-[44px] focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-lg"
                >
                  <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                    <XCircle className="w-5 h-5 text-red-400" aria-hidden="true" />
                    Falsche Antworten ({falsche.length})
                  </CardTitle>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showWrong ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
              </CardHeader>
              {showWrong && (
                <CardContent>
                  <div id="wrong-answers-list" className="space-y-4">
                    {falsche.map(frage => {
                      const meta = getFrageMeta(frage.id);
                      return (
                        <div key={frage.id} className="p-2.5 sm:p-3.5 rounded-xl bg-red-500/5 border border-red-500/10">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <p className="text-white font-medium text-sm">{frage.frage}</p>
                            <button
                              onClick={() => { const idx = aktiveFragen.findIndex(f => f.id === frage.id); if (idx >= 0) springeZuFrage(idx); }}
                              className="text-teal-400 text-xs hover:underline whitespace-nowrap flex-shrink-0 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded"
                            >
                              Zur Frage
                            </button>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-red-400">Deine Antwort: {antworten[frage.id]} — {frage.antworten[antworten[frage.id] as 'A' | 'B' | 'C']}</p>
                            <p className="text-emerald-400">Richtig: {frage.richtige_antwort} — {frage.antworten[frage.richtige_antwort as 'A' | 'B' | 'C']}</p>
                            {meta && <p className="text-slate-500 text-xs mt-1">Bisher {meta.attempts}x, Serie: {meta.correctStreak}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Unbeantwortete — klappbar */}
          {offen.length > 0 && (
            <Card className="mb-4 sm:mb-6 bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <button
                  onClick={() => setShowUnanswered(!showUnanswered)}
                  aria-expanded={showUnanswered}
                  aria-controls="unanswered-list"
                  className="w-full flex items-center justify-between min-h-[44px] focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-lg"
                >
                  <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                    <HelpCircle className="w-5 h-5 text-amber-400" aria-hidden="true" />
                    Unbeantwortete Fragen ({offen.length})
                  </CardTitle>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showUnanswered ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
              </CardHeader>
              {showUnanswered && (
                <CardContent>
                  <div id="unanswered-list" className="flex flex-wrap gap-2">
                    {offen.map(frage => {
                      const idx = aktiveFragen.findIndex(f => f.id === frage.id);
                      return (
                        <button
                          key={frage.id}
                          onClick={() => springeZuFrage(idx)}
                          aria-label={`Zu unbeantworteter Frage ${idx + 1} springen`}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 min-h-[44px]"
                        >
                          Frage {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
