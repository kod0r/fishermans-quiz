import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, HelpCircle, ChevronDown, Star, Home, ArrowLeft } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { QuizContext } from '@/hooks/useQuiz';

interface Props {
  quiz: QuizContext;
}

export default function ProgressView({ quiz }: Props) {
  const { statistiken, aktiveFragen, antworten, springeZuFrage, getFrageMeta, goToView, isActive, toggleFavorite, isFavorite, gameMode, rawRun } = quiz;
  const [showWrong, setShowWrong] = useState(false);
  const [showUnanswered, setShowUnanswered] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const handleEscape = useCallback(() => {
    if (isActive) {
      goToView('quiz');
    } else {
      goToView('start');
    }
  }, [isActive, goToView]);

  useKeyboardShortcuts({
    onEscape: handleEscape,
    enabled: true,
  });

  const pct = statistiken.gesamt > 0 ? (statistiken.korrekt / statistiken.gesamt) * 100 : 0;
  const isExam = gameMode === 'exam';
  const isCompletedRun = statistiken.gesamt > 0 && statistiken.beantwortet === statistiken.gesamt;

  const headerContent = useMemo(() => {
    if (isExam) {
      const passed = pct >= 60;
      return {
        icon: passed
          ? <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-400" />
          : <XCircle className="w-7 h-7 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" />,
        title: passed ? 'Bestanden!' : 'Nicht bestanden',
        subtitle: `${statistiken.korrekt} von ${statistiken.gesamt} richtig`,
        subline: `${Math.round(pct)}% — 60% zum Bestehen`,
        cardClass: passed
          ? 'bg-emerald-50 border-emerald-300/50 dark:bg-emerald-900/20 dark:border-emerald-500/30'
          : 'bg-red-50 border-red-300/50 dark:bg-red-900/20 dark:border-red-500/30',
        iconBgClass: passed ? 'bg-emerald-500/20' : 'bg-red-500/20',
        titleClass: passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
      };
    }

    if (isCompletedRun) {
      const filterLabel = rawRun?.filter === 'weak'
        ? 'Schwächetrainer'
        : rawRun?.filter === 'srs-due'
          ? 'SRS-Wiederholung'
          : 'Session';
      return {
        icon: <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-teal-600 dark:text-teal-400" />,
        title: `${filterLabel} abgeschlossen!`,
        subtitle: `${statistiken.korrekt} von ${statistiken.gesamt} richtig`,
        subline: `${Math.round(pct)}%`,
        cardClass: 'bg-teal-50 border-teal-300/50 dark:bg-teal-900/20 dark:border-teal-500/30',
        iconBgClass: 'bg-teal-500/20',
        titleClass: 'text-teal-600 dark:text-teal-400',
      };
    }

    return {
      icon: <HelpCircle className="w-7 h-7 sm:w-8 sm:h-8 text-slate-600 dark:text-slate-400" />,
      title: 'Zwischenstand',
      subtitle: `${statistiken.korrekt} von ${statistiken.gesamt} richtig`,
      subline: `${Math.round(pct)}%`,
      cardClass: 'bg-white border-slate-200/50 dark:bg-slate-800/50 dark:border-slate-700/50',
      iconBgClass: 'bg-slate-500/20',
      titleClass: 'text-slate-600 dark:text-slate-400',
    };
  }, [isExam, isCompletedRun, pct, statistiken, rawRun?.filter]);

   const topicStats: Record<string, { korrekt: number; falsch: number; gesamt: number }> = useMemo(() => {
     const stats: Record<string, { korrekt: number; falsch: number; gesamt: number }> = {};
     aktiveFragen.forEach(f => {
       const b = f.topic;
       if (!stats[b]) stats[b] = { korrekt: 0, falsch: 0, gesamt: 0 };
       stats[b].gesamt++;
       if (antworten[f.id] === f.richtige_antwort) stats[b].korrekt++;
       else if (antworten[f.id]) stats[b].falsch++;
     });
     return stats;
   }, [aktiveFragen, antworten]);

   const falsche = useMemo(() =>
     aktiveFragen.filter(f => antworten[f.id] && antworten[f.id] !== f.richtige_antwort),
     [aktiveFragen, antworten]
   );
   const offen = useMemo(() =>
     aktiveFragen.filter(f => !antworten[f.id]),
     [aktiveFragen, antworten]
   );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-blue-950 dark:via-slate-900 dark:to-teal-950">
      <div className="container mx-auto px-3 sm:px-4 py-3 max-w-3xl pb-16">

        {/* Run-Ergebnis */}
        <Card className={`mb-2 ${headerContent.cardClass}`}>
          <CardContent className="py-3 px-3 text-center">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${headerContent.iconBgClass}`} aria-hidden="true">
               {headerContent.icon}
            </div>
            <h2 ref={headingRef} tabIndex={-1} className={`text-lg sm:text-xl font-bold mb-1 outline-none ${headerContent.titleClass}`}>{headerContent.title}</h2>
            <p className="text-slate-600 text-sm mb-4 dark:text-slate-300">{headerContent.subtitle}</p>
            <div className="max-w-sm mx-auto">
              <Progress
                value={pct}
                className="h-2 bg-slate-200 dark:bg-slate-700"
                aria-label={`Gesamtergebnis: ${Math.round(pct)}%`}
                aria-valuenow={Math.round(pct)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
              <p className="text-slate-500 text-xs mt-1.5 dark:text-slate-400">{headerContent.subline}</p>
            </div>

            {/* Themen-Stats */}
            <div className="mt-4 text-left space-y-2 max-w-sm mx-auto">
              {Object.entries(topicStats).map(([b, s]) => {
                const p = s.gesamt > 0 ? (s.korrekt / s.gesamt) * 100 : 0;
                return (
                  <div key={b}>
                     <div className="flex justify-between text-xs mb-0.5">
                       <span className="text-slate-600 dark:text-slate-300">{b}</span>
                       <span className={`font-medium ${p >= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{s.korrekt}/{s.gesamt} ({Math.round(p)}%)</span>
                     </div>
                    <Progress value={p} className="h-1.5 bg-slate-200 dark:bg-slate-700" aria-label={`${b}: ${Math.round(p)}% richtig`} />
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {isActive && (
                <button
                  onClick={() => goToView('quiz')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Zurück zum Quiz
                </button>
              )}
              <button
                onClick={() => goToView('start')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
              >
                <Home className="w-4 h-4" />
                Zum Hauptmenü
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Falsche Antworten — klappbar */}
        <Card className="mb-2 bg-white/80 border-slate-200/50 dark:bg-slate-800/50 dark:border-slate-700/50">
          <CardContent className="py-2 px-3">
             <button
               onClick={() => setShowWrong(!showWrong)}
               aria-expanded={showWrong}
               aria-controls="wrong-answers-list"
               className="w-full flex items-center justify-between focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 rounded-lg"
             >
              <span className="text-slate-900 font-medium text-sm flex items-center gap-2 dark:text-white">
                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" aria-hidden="true" />
                Falsche Antworten ({falsche.length})
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform dark:text-slate-400 ${showWrong ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {falsche.length === 0 ? (
              <p className="text-emerald-600 text-sm mt-2 dark:text-emerald-400">Keine falschen Antworten — super!</p>
            ) : showWrong && (
                /* aktiveFragen already carries shuffled order via answerShuffle in quizRun,
                   so no extra transformation is needed here. */
                <div id="wrong-answers-list" className="mt-3 space-y-3">
                  {falsche.map(frage => {
                    const meta = getFrageMeta(frage.id);
                    return (
                      <div key={frage.id} className="p-2.5 sm:p-3 rounded-lg bg-red-50 border border-red-200/50 dark:bg-red-500/5 dark:border-red-500/10">
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <p className="text-slate-900 font-medium text-sm leading-snug dark:text-white">{frage.frage}</p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => toggleFavorite(frage.id)}
                              aria-label={isFavorite(frage.id) ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                              className={`p-2.5 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 min-w-[44px] min-h-[44px] flex items-center justify-center ${isFavorite(frage.id) ? 'text-amber-400 hover:text-amber-300' : 'text-slate-400 hover:text-amber-400 dark:text-slate-500'}`}
                            >
                              <Star className={`w-4 h-4 ${isFavorite(frage.id) ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => { if (!isActive) return; const idx = aktiveFragen.findIndex(f => f.id === frage.id); if (idx >= 0) { springeZuFrage(idx); goToView('quiz'); } }}
                              disabled={!isActive}
                              className="text-teal-600 text-xs hover:underline whitespace-nowrap flex-shrink-0 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-teal-400 dark:focus-visible:ring-offset-slate-900 rounded disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:no-underline"
                            >
                              Zur Frage
                            </button>
                          </div>
                        </div>
                        <div className="space-y-0.5 text-xs sm:text-sm">
                           <p className="text-red-600 dark:text-red-400">Deine Antwort: {antworten[frage.id]} — {frage.antworten[antworten[frage.id] as 'A' | 'B' | 'C']}</p>
                           <p className="text-emerald-600 dark:text-emerald-400">Richtig: {frage.richtige_antwort} — {frage.antworten[frage.richtige_antwort]}</p>
                          {meta && <p className="text-slate-500 text-[10px] mt-1">Bisher {meta.attempts}×, Serie: {meta.correctStreak}</p>}
                        </div>
                      </div>
                    );
                  })}
                 </div>
               )}
             </CardContent>
           </Card>

        {/* Unbeantwortete — klappbar */}
        <Card className="mb-2 bg-white/80 border-slate-200/50 dark:bg-slate-800/50 dark:border-slate-700/50">
          <CardContent className="py-2 px-3">
             <button
               onClick={() => setShowUnanswered(!showUnanswered)}
               aria-expanded={showUnanswered}
               aria-controls="unanswered-list"
               className="w-full flex items-center justify-between focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 rounded-lg"
             >
              <span className="text-slate-900 font-medium text-sm flex items-center gap-2 dark:text-white">
                <HelpCircle className="w-4 h-4 text-amber-400" aria-hidden="true" />
                Unbeantwortete Fragen ({offen.length})
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform dark:text-slate-400 ${showUnanswered ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {offen.length === 0 ? (
              <p className="text-emerald-600 text-sm mt-2 dark:text-emerald-400">Alle Fragen beantwortet!</p>
            ) : showUnanswered && (
                <div id="unanswered-list" className="mt-3 flex flex-wrap gap-1.5">
                  {offen.map(frage => {
                    const idx = aktiveFragen.findIndex(f => f.id === frage.id);
                    return (
                      <button
                        key={frage.id}
                        onClick={() => { if (!isActive) return; springeZuFrage(idx); goToView('quiz'); }}
                        disabled={!isActive}
                        aria-label={`Zu unbeantworteter Frage ${idx + 1} springen`}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-600 border border-amber-300/50 hover:bg-amber-100 transition-all focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 dark:hover:bg-amber-500/20 dark:focus-visible:ring-offset-slate-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-amber-50 dark:disabled:hover:bg-amber-500/10"
                      >
                        Frage {idx + 1}
                      </button>
                    );
                  })}
                </div>
               )}
             </CardContent>
           </Card>
       </div>
     </div>
   );
}
