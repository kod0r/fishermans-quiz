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
import { ChevronLeft, ChevronRight, BarChart3, Square, ChevronDown, AlertTriangle } from 'lucide-react';
import type { QuizContext } from '@/hooks/useQuiz';

interface Props {
  quiz: QuizContext;
  onShowProgress: () => void;
}

export default function QuizView({ quiz, onShowProgress }: Props) {
  const {
    aktuelleFrage, aktuellerIndex, aktiveFragen, antworten,
    beantworteFrage, naechsteFrage, vorherigeFrage,
    springeZuFrage, unterbrecheRun, gameMode,
  } = quiz;

  const [showNav, setShowNav] = useState(false);
  const [pendingWrongAnswer, setPendingWrongAnswer] = useState<string | null>(null);

  if (!aktuelleFrage) return null;

  const userAntwort = antworten[aktuelleFrage.id];
  const hasAnswered = userAntwort !== undefined;
  const isPending = pendingWrongAnswer !== null;
  const fortschritt = ((aktuellerIndex + 1) / aktiveFragen.length) * 100;
  const korrekt = aktiveFragen.filter(f => antworten[f.id] === f.richtige_antwort).length;
  const falsch = aktiveFragen.filter(f => antworten[f.id] && antworten[f.id] !== f.richtige_antwort).length;
  const offen = aktiveFragen.filter(f => !antworten[f.id]).length;

  // ── Arcade-Modus: Antwort-Logik ──
  const handleAnswerClick = (buchstabe: string) => {
    if (hasAnswered || isPending) return;

    const isCorrect = buchstabe === aktuelleFrage.richtige_antwort;

    if (isCorrect) {
      // Richtig → sofort speichern
      beantworteFrage(aktuelleFrage.id, buchstabe);
    } else if (gameMode === 'arcade') {
      // Arcade + Falsch → Preview, "Sicher?" Dialog
      setPendingWrongAnswer(buchstabe);
    } else {
      // Hardcore + Falsch → sofort speichern (später: Submit-Step)
      beantworteFrage(aktuelleFrage.id, buchstabe);
    }
  };

  const handleConfirmWrong = () => {
    if (pendingWrongAnswer) {
      beantworteFrage(aktuelleFrage.id, pendingWrongAnswer);
    }
    setPendingWrongAnswer(null);
  };

  const handleCancelWrong = () => {
    setPendingWrongAnswer(null);
  };

  return (
    <TooltipProvider delayDuration={800}>
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-teal-950">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl pt-14 sm:pt-16">

          {/* Top Bar — Run-Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs uppercase tracking-wider">Quiz-Run</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${gameMode === 'arcade' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                {gameMode === 'arcade' ? 'Arcade' : 'Hardcore'}
              </span>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
              <div
                className="flex items-center gap-1 mr-2"
                aria-label={`${korrekt} richtig, ${falsch} falsch, ${offen} offen`}
              >
                <span className="text-emerald-400 font-bold text-sm">{korrekt}</span>
                <span className="text-slate-500 text-xs">/</span>
                <span className="text-red-400 font-bold text-sm">{falsch}</span>
                <span className="text-slate-500 text-xs">/</span>
                <span className="text-slate-400 text-sm">{offen}</span>
              </div>

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
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Quiz beenden</p></TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onShowProgress}
                    variant="outline"
                    size="sm"
                    aria-label="Fortschritt anzeigen"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 min-h-[44px]"
                  >
                    <BarChart3 className="w-4 h-4 mr-1" aria-hidden="true" />
                    <span className="hidden sm:inline">Fortschritt</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Fortschritt anzeigen</p></TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4 sm:mb-6">
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

          {/* Frage */}
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">{aktuelleFrage.bereich}</span>
              {aktuelleFrage.bild && (
                <span className="inline-block ml-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Bilderkennung
                </span>
              )}
            </div>

            <h2 className="text-white text-base sm:text-lg md:text-xl font-semibold mb-4 sm:mb-6 leading-relaxed">{aktuelleFrage.frage}</h2>

            {aktuelleFrage.bild_url && (
              <div className="mb-4 sm:mb-6 flex justify-center">
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
                const isPendingSelection = pendingWrongAnswer === buchstabe;

                let cls = 'border-slate-600/50 bg-slate-700/30 hover:bg-slate-700/50 hover:border-slate-500/50';
                if (hasAnswered) {
                  if (isSelected && isCorrect) cls = 'border-emerald-500 bg-emerald-500/10';
                  else if (isSelected && !isCorrect) cls = 'border-red-500 bg-red-500/10';
                  else if (isCorrect) cls = 'border-emerald-500/50 bg-emerald-500/5';
                } else if (isPendingSelection) {
                  // Arcade: Pending wrong answer preview
                  cls = 'border-red-500 bg-red-500/10';
                } else if (isSelected) {
                  cls = 'border-teal-400 bg-teal-400/10';
                }

                const isDisabled = hasAnswered || (isPending && !isPendingSelection);

                return (
                  <button
                    key={buchstabe}
                    onClick={() => handleAnswerClick(buchstabe)}
                    disabled={isDisabled}
                    aria-pressed={isSelected || isPendingSelection}
                    aria-disabled={isDisabled}
                    aria-label={`Antwort ${buchstabe}: ${aktuelleFrage.antworten[buchstabe]}`}
                    className={`w-full text-left p-4 md:p-5 min-h-[44px] rounded-xl border transition-all flex items-start gap-3 sm:gap-4 ${cls} ${isDisabled ? 'cursor-default' : 'cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'}`}
                  >
                    <span
                      className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-sm ${hasAnswered && isCorrect ? 'bg-emerald-500 text-white' : hasAnswered && isSelected && !isCorrect ? 'bg-red-500 text-white' : isPendingSelection ? 'bg-red-500 text-white' : isSelected ? 'bg-teal-400 text-slate-900' : 'bg-slate-600/50 text-slate-300'}`}
                      aria-hidden="true"
                    >
                      {buchstabe}
                    </span>
                    <span className={`flex-1 pt-1.5 leading-relaxed text-sm sm:text-base ${hasAnswered && isCorrect ? 'text-emerald-300' : hasAnswered && isSelected && !isCorrect ? 'text-red-300' : isPendingSelection ? 'text-red-300' : 'text-slate-200'}`}>
                      {aktuelleFrage.antworten[buchstabe]}
                    </span>
                    {hasAnswered && isCorrect && (
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {hasAnswered && isSelected && !isCorrect && (
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    {isPendingSelection && (
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Arcade: Sicher? Dialog ── */}
            {isPending && gameMode === 'arcade' && (
              <Card className="mt-4 border-amber-500/30 bg-amber-500/10">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="text-amber-300 font-medium text-sm">Bist du sicher?</p>
                      <p className="text-slate-400 text-xs mt-0.5">Diese Antwort ist falsch. Du kannst noch eine andere wählen.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleCancelWrong}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 min-h-[44px]"
                    >
                      Nochmal wählen
                    </Button>
                    <Button
                      onClick={handleConfirmWrong}
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-white focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 min-h-[44px]"
                    >
                      Bestätigen
                    </Button>
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
              <div className="mt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
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
                  disabled={aktuellerIndex === aktiveFragen.length - 1 || isPending}
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
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-700/50">
            <button
              onClick={() => setShowNav(!showNav)}
              aria-expanded={showNav}
              aria-controls="schnellnavigation"
              className="flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-lg bg-slate-800/80 border border-slate-600/50 text-slate-300 text-sm mb-3 hover:bg-slate-700/80 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <span>Schnellnavigation</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showNav ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            {showNav && (
              <div id="schnellnavigation" className="max-h-48 overflow-y-auto pr-2">
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
