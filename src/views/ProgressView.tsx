import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-teal-950">
      <div className="container mx-auto px-3 sm:px-4 py-3 max-w-3xl pt-14 sm:pt-16">

        {/* Run-Ergebnis */}
        <Card className={`mb-2 ${passed ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
          <CardContent className="py-3 px-3 text-center">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${passed ? 'bg-emerald-500/20' : 'bg-red-500/20'}`} aria-hidden="true">
              {passed ? <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" /> : <XCircle className="w-7 h-7 sm:w-8 sm:h-8 text-red-400" />}
            </div>
            <h2 className={`text-lg sm:text-xl font-bold mb-1 ${passed ? 'text-emerald-400' : 'text-red-400'}`}>{passed ? 'Bestanden!' : 'Nicht bestanden'}</h2>
            <p className="text-slate-300 text-sm mb-4">{statistiken.korrekt} von {statistiken.gesamt} richtig</p>
            <div className="max-w-sm mx-auto">
              <Progress
                value={pct}
                className="h-2 bg-slate-700"
                aria-label={`Gesamtergebnis: ${Math.round(pct)}%`}
                aria-valuenow={Math.round(pct)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
              <p className="text-slate-400 text-xs mt-1.5">{Math.round(pct)}% — 60% zum Bestehen</p>
            </div>

            {/* Bereichs-Stats */}
            <div className="mt-4 text-left space-y-2 max-w-sm mx-auto">
              {Object.entries(bereichStats).map(([b, s]) => {
                const p = s.gesamt > 0 ? (s.korrekt / s.gesamt) * 100 : 0;
                return (
                  <div key={b}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-slate-300">{b}</span>
                      <span className={`font-medium ${p >= 60 ? 'text-emerald-400' : 'text-red-400'}`}>{s.korrekt}/{s.gesamt} ({Math.round(p)}%)</span>
                    </div>
                    <Progress value={p} className="h-1.5 bg-slate-700" aria-label={`${b}: ${Math.round(p)}% richtig`} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Falsche Antworten — klappbar */}
        {falsche.length > 0 && (
          <Card className="mb-2 bg-slate-800/50 border-slate-700/50">
            <CardContent className="py-2 px-3">
              <button
                onClick={() => setShowWrong(!showWrong)}
                aria-expanded={showWrong}
                aria-controls="wrong-answers-list"
                className="w-full flex items-center justify-between focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-lg"
              >
                <span className="text-white font-medium text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" aria-hidden="true" />
                  Falsche Antworten ({falsche.length})
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showWrong ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {showWrong && (
                <div id="wrong-answers-list" className="mt-3 space-y-3">
                  {falsche.map(frage => {
                    const meta = getFrageMeta(frage.id);
                    return (
                      <div key={frage.id} className="p-2.5 sm:p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <p className="text-white font-medium text-sm leading-snug">{frage.frage}</p>
                          <button
                            onClick={() => { const idx = aktiveFragen.findIndex(f => f.id === frage.id); if (idx >= 0) springeZuFrage(idx); }}
                            className="text-teal-400 text-xs hover:underline whitespace-nowrap flex-shrink-0 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded"
                          >
                            Zur Frage
                          </button>
                        </div>
                        <div className="space-y-0.5 text-xs sm:text-sm">
                          <p className="text-red-400">Deine Antwort: {antworten[frage.id]} — {frage.antworten[antworten[frage.id] as 'A' | 'B' | 'C']}</p>
                          <p className="text-emerald-400">Richtig: {frage.richtige_antwort} — {frage.antworten[frage.richtige_antwort as 'A' | 'B' | 'C']}</p>
                          {meta && <p className="text-slate-500 text-[10px] mt-1">Bisher {meta.attempts}×, Serie: {meta.correctStreak}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Unbeantwortete — klappbar */}
        {offen.length > 0 && (
          <Card className="mb-2 bg-slate-800/50 border-slate-700/50">
            <CardContent className="py-2 px-3">
              <button
                onClick={() => setShowUnanswered(!showUnanswered)}
                aria-expanded={showUnanswered}
                aria-controls="unanswered-list"
                className="w-full flex items-center justify-between focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-lg"
              >
                <span className="text-white font-medium text-sm flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  Unbeantwortete Fragen ({offen.length})
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showUnanswered ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {showUnanswered && (
                <div id="unanswered-list" className="mt-3 flex flex-wrap gap-1.5">
                  {offen.map(frage => {
                    const idx = aktiveFragen.findIndex(f => f.id === frage.id);
                    return (
                      <button
                        key={frage.id}
                        onClick={() => springeZuFrage(idx)}
                        aria-label={`Zu unbeantworteter Frage ${idx + 1} springen`}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                      >
                        Frage {idx + 1}
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
