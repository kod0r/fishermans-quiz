import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, Square, ChevronDown, AlertTriangle } from 'lucide-react';
import type { QuizContext } from '@/hooks/useQuiz';

interface Props {
  quiz: QuizContext;
}

export default function QuizView({ quiz }: Props) {
  const {
    aktuelleFrage, aktuellerIndex, aktiveFragen, antworten,
    beantworteFrage, naechsteFrage, vorherigeFrage,
    springeZuFrage, unterbrecheRun, gameMode,
  } = quiz;

  const [showNav, setShowNav] = useState(false);
  const [firstWrongAttempt, setFirstWrongAttempt] = useState<string | null>(null);

  if (!aktuelleFrage) return null;

  const userAntwort = antworten[aktuelleFrage.id];
  const hasAnswered = userAntwort !== undefined;
  const hasSecondChance = firstWrongAttempt !== null;
  const fortschritt = ((aktuellerIndex + 1) / aktiveFragen.length) * 100;

  // ── Arcade-Modus: Antwort-Logik ──
  const handleAnswerClick = (buchstabe: string) => {
    if (hasAnswered) return;

    const isCorrect = buchstabe === aktuelleFrage.richtige_antwort;

    if (isCorrect) {
      beantworteFrage(aktuelleFrage.id, buchstabe);
      setFirstWrongAttempt(null);
    } else if (gameMode === 'arcade' && !hasSecondChance) {
      setFirstWrongAttempt(buchstabe);
    } else {
      beantworteFrage(aktuelleFrage.id, buchstabe);
      setFirstWrongAttempt(null);
    }
  };

  return (
    <TooltipProvider delayDuration={800}>
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-teal-950">
        <div className="container mx-auto px-2.5 sm:px-3.5 py-3.5 sm:py-5 max-w-4xl pt-12 sm:pt-14">

          {/* Top Bar */}
          <div className="flex items-center justify-between mb-3.5 sm:mb-5 gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${gameMode === 'arcade' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              {gameMode === 'arcade' ? 'Arcade' : 'Hardcore'}
            </span>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => { if (confirm('Quiz beenden? Meta-Fortschritt bleibt erhalten.')) unterbrecheRun(); }}
                  variant="outline"
                  size="sm"
                  aria-label="Quiz beenden"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 min-h-[44px]"
                >
                  <Square className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span className="hidden sm:inline">Beenden</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Quiz beenden</p></TooltipContent>
            </Tooltip>
          </div>

          {/* Progress Bar */}
          <div className="mb-3.5 sm:mb-5">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span id="progress-label">Frage {aktuellerIndex + 1} von {aktiveFragen.length}</span>
              <span aria-hidden="true">{Math.round(fortschritt)}%</span>
            </div>
            <Progress
              value={fortschritt}
              className="h-2 bg-slate-700"
              aria-labelledby="progress-label"
              aria-valuenow={Math.round(fortschritt)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {/* Frage — FESTE HÖHE, niemals variabel */}
          <div className="h-[36rem] sm:h-[40rem] md:h-[44rem] lg:h-[48rem] bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-3.5 sm:p-5 md:p-7 mb-3.5 sm:mb-5 flex flex-col">
            <div className="mb-3.5">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">{aktuelleFrage.bereich}</span>
              {aktuelleFrage.bild && (
                <span className="inline-block ml-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Bilderkennung
                </span>
              )}
            </div>

            <h2 className="text-white text-base sm:text-lg md:text-xl font-semibold mb-3.5 sm:mb-5 leading-relaxed">{aktuelleFrage.frage}</h2>

            {aktuelleFrage.bild_url && (
              <div className="mb-3.5 sm:mb-5 flex justify-center">
                <img
                  src={aktuelleFrage.bild_url}
                  alt={`Bild zur Frage ${aktuellerIndex + 1}: ${aktuelleFrage.frage}`}
                  className="max-w-full max-h-48 sm:max-h-64 object-contain rounded-xl border border-slate-600/50 bg-slate-900/50"
                  loading="lazy"
                />
              </div>
            )}

            {/* Antworten */}
            <div
              className="space-y-3"
              role="radiogroup"
              aria-label="Antwortmöglichkeiten"
            >
              {(['A', 'B', 'C'] as const).map(buchstabe => {
                const isSelected = userAntwort === buchstabe;
                const isCorrect = aktuelleFrage.richtige_antwort === buchstabe;
                const isFirstWrong = firstWrongAttempt === buchstabe;

                let cls = 'border-slate-600/50 bg-slate-700/30 hover:bg-slate-700/50 hover:border-slate-500/50';
                if (hasAnswered) {
                  if (isSelected && isCorrect) cls = 'border-emerald-500 bg-emerald-500/10';
                  else if (isSelected && !isCorrect) cls = 'border-red-500 bg-red-500/10';
                  else if (isCorrect) cls = 'border-emerald-500/50 bg-emerald-500/5';
                } else if (isFirstWrong) {
                  cls = 'border-slate-500/30 bg-slate-700/20 opacity-50';
                } else if (isSelected) {
                  cls = 'border-teal-400 bg-teal-400/10';
                }

                const isDisabled = hasAnswered || isFirstWrong;

                return (
                  <button
                    key={buchstabe}
                    onClick={() => handleAnswerClick(buchstabe)}
                    disabled={isDisabled}
                    aria-pressed={isSelected || isFirstWrong}
                    aria-disabled={isDisabled}
                    aria-label={`Antwort ${buchstabe}: ${aktuelleFrage.antworten[buchstabe]}`}
                    className={`w-full text-left p-3.5 md:p-5 min-h-[44px] rounded-xl border transition-all flex items-start gap-3 sm:gap-4 ${cls} ${isDisabled ? 'cursor-default' : 'cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'}`}
                  >
                    <span
                      className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-sm ${hasAnswered && isCorrect ? 'bg-emerald-500 text-white' : hasAnswered && isSelected && !isCorrect ? 'bg-red-500 text-white' : isFirstWrong ? 'bg-slate-600/30 text-slate-500' : isSelected ? 'bg-teal-400 text-slate-900' : 'bg-slate-600/50 text-slate-300'}`}
                      aria-hidden="true"
                    >
                      {buchstabe}
                    </span>
                    <span className={`flex-1 pt-1 leading-relaxed text-sm sm:text-base ${hasAnswered && isCorrect ? 'text-emerald-300' : hasAnswered && isSelected && !isCorrect ? 'text-red-300' : isFirstWrong ? 'text-slate-500' : 'text-slate-200'}`}>
                      {aktuelleFrage.antworten[buchstabe]}
                    </span>
                    {hasAnswered && isCorrect && (
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {hasAnswered && isSelected && !isCorrect && (
                      <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Arcade: 2. Chance Hinweis ── */}
            {hasSecondChance && gameMode === 'arcade' && !hasAnswered && (
              <Card className="mt-3.5 border-amber-500/20 bg-amber-500/5">
                <CardContent className="pt-3.5 pb-3.5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="text-amber-300 font-medium text-sm">Noch ein Versuch</p>
                      <p className="text-slate-400 text-xs mt-0.5">Wähle eine andere Antwort aus.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Live-Region für Feedback */}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {userAntwort && userAntwort === aktuelleFrage.richtige_antwort && 'Richtig!'}
              {userAntwort && userAntwort !== aktuelleFrage.richtige_antwort && 'Falsch. Die richtige Antwort wird angezeigt.'}
            </div>

            {userAntwort && userAntwort !== aktuelleFrage.richtige_antwort && (
              <div className="mt-3.5 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-emerald-400 text-sm font-medium">
                  Richtige Antwort: {aktuelleFrage.richtige_antwort} — {aktuelleFrage.antworten[aktuelleFrage.richtige_antwort as 'A' | 'B' | 'C']}
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={vorherigeFrage}
                  disabled={aktuellerIndex === 0}
                  variant="outline"
                  aria-label="Vorherige Frage"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 min-h-[44px]"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
                  <span className="hidden sm:inline">Zurück</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Vorherige Frage</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={naechsteFrage}
                  disabled={aktuellerIndex === aktiveFragen.length - 1 || hasSecondChance}
                  variant="outline"
                  aria-label="Nächste Frage"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 min-h-[44px]"
                >
                  <span className="hidden sm:inline">Weiter</span>
                  <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Nächste Frage</p></TooltipContent>
            </Tooltip>
          </div>

          {/* Schnellnavigation */}
          <div className="mt-5 sm:mt-7 pt-3.5 sm:pt-5 border-t border-slate-700/50">
            <button
              onClick={() => setShowNav(!showNav)}
              aria-expanded={showNav}
              aria-controls="schnellnavigation"
              className="flex items-center gap-2 px-2.5 py-1.5 min-h-[44px] rounded-lg bg-slate-800/80 border border-slate-600/50 text-slate-300 text-sm mb-3 hover:bg-slate-700/80 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <span>Schnellnavigation</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showNav ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {showNav && (
              <div id="schnellnavigation" className="max-h-48 overflow-y-auto pr-1.5">
                <div className="flex flex-wrap gap-1.5" role="list" aria-label="Fragen-Übersicht">
                  {aktiveFragen.map((frage, idx) => {
                    const beantwortet = antworten[frage.id] !== undefined;
                    const korrekt = antworten[frage.id] === frage.richtige_antwort;
                    const aktuell = idx === aktuellerIndex;
                    return (
                      <button
                        key={frage.id}
                        onClick={() => springeZuFrage(idx)}
                        aria-label={`Frage ${idx + 1}${beantwortet ? (korrekt ? ', richtig beantwortet' : ', falsch beantwortet') : ', unbeantwortet'}${aktuell ? ', aktuell' : ''}`}
                        aria-current={aktuell ? 'true' : undefined}
                        className={`w-8 h-8 rounded-lg text-xs font-medium flex-shrink-0 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${aktuell ? 'bg-teal-500 text-white' : beantwortet && korrekt ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : beantwortet && !korrekt ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700'}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
