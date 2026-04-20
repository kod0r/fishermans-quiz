import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, BarChart3, Square, ChevronDown } from 'lucide-react';
import type { QuizContext } from '@/hooks/useQuiz';

interface Props {
  quiz: QuizContext;
  onShowProgress: () => void;
}

export default function QuizView({ quiz, onShowProgress }: Props) {
  const {
    aktuelleFrage, aktuellerIndex, aktiveFragen, antworten,
    beantworteFrage, naechsteFrage, vorherigeFrage,
    springeZuFrage, unterbrecheRun,
  } = quiz;

  const [showNav, setShowNav] = useState(false);

  if (!aktuelleFrage) return null;

  const userAntwort = antworten[aktuelleFrage.id];
  const fortschritt = ((aktuellerIndex + 1) / aktiveFragen.length) * 100;
  const korrekt = aktiveFragen.filter(f => antworten[f.id] === f.richtige_antwort).length;
  const falsch = aktiveFragen.filter(f => antworten[f.id] && antworten[f.id] !== f.richtige_antwort).length;
  const offen = aktiveFragen.filter(f => !antworten[f.id]).length;

  return (
    <TooltipProvider delayDuration={1500}>
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-teal-950">
        <div className="container mx-auto px-4 py-6 max-w-4xl pt-16">

          {/* Top Bar — nur Run-Stats */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs uppercase tracking-wider">Quiz-Run</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 mr-2">
                <span className="text-emerald-400 font-bold text-sm">{korrekt}</span><span className="text-slate-500 text-xs">/</span>
                <span className="text-red-400 font-bold text-sm">{falsch}</span><span className="text-slate-500 text-xs">/</span>
                <span className="text-slate-400 text-sm">{offen}</span>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => { if (confirm('Quiz beenden? Meta-Fortschritt bleibt erhalten.')) unterbrecheRun(); }} variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                    <Square className="w-4 h-4 fill-current" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Quiz beenden</p></TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={onShowProgress} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                    <BarChart3 className="w-4 h-4 mr-1" /><span className="hidden sm:inline">Fortschritt</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Fortschritt anzeigen</p></TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Frage {aktuellerIndex + 1} von {aktiveFragen.length}</span>
              <span>{Math.round(fortschritt)}%</span>
            </div>
            <Progress value={fortschritt} className="h-2 bg-slate-700" />
          </div>

          {/* Frage */}
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 md:p-8 mb-6">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">{aktuelleFrage.bereich}</span>
              {aktuelleFrage.bild && <span className="inline-block ml-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">Bilderkennung</span>}
            </div>

            <h2 className="text-white text-lg md:text-xl font-semibold mb-6 leading-relaxed">{aktuelleFrage.frage}</h2>

            {aktuelleFrage.bild_url && (
              <div className="mb-6 flex justify-center">
                <img src={aktuelleFrage.bild_url} alt={`Frage ${aktuelleFrage.id}`} className="max-w-full max-h-64 object-contain rounded-xl border border-slate-600/50 bg-slate-900/50" />
              </div>
            )}

            {/* Antworten */}
            <div className="space-y-3">
              {(['A', 'B', 'C'] as const).map(buchstabe => {
                const isSelected = userAntwort === buchstabe;
                const isCorrect = aktuelleFrage.richtige_antwort === buchstabe;
                const hasAnswered = userAntwort !== undefined;
                let cls = 'border-slate-600/50 bg-slate-700/30 hover:bg-slate-700/50 hover:border-slate-500/50';
                if (hasAnswered) {
                  if (isSelected && isCorrect) cls = 'border-emerald-500 bg-emerald-500/10';
                  else if (isSelected && !isCorrect) cls = 'border-red-500 bg-red-500/10';
                  else if (isCorrect) cls = 'border-emerald-500/50 bg-emerald-500/5';
                } else if (isSelected) cls = 'border-teal-400 bg-teal-400/10';

                return (
                  <button key={buchstabe} onClick={() => !hasAnswered && beantworteFrage(aktuelleFrage.id, buchstabe)} disabled={hasAnswered}
                    className={`w-full text-left p-4 md:p-5 rounded-xl border transition-all flex items-start gap-4 ${cls} ${hasAnswered ? 'cursor-default' : 'cursor-pointer'}`}>
                    <span className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${hasAnswered && isCorrect ? 'bg-emerald-500 text-white' : hasAnswered && isSelected && !isCorrect ? 'bg-red-500 text-white' : isSelected ? 'bg-teal-400 text-slate-900' : 'bg-slate-600/50 text-slate-300'}`}>
                      {buchstabe}
                    </span>
                    <span className={`flex-1 pt-1.5 leading-relaxed ${hasAnswered && isCorrect ? 'text-emerald-300' : hasAnswered && isSelected && !isCorrect ? 'text-red-300' : 'text-slate-200'}`}>
                      {aktuelleFrage.antworten[buchstabe]}
                    </span>
                    {hasAnswered && isCorrect && <svg className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    {hasAnswered && isSelected && !isCorrect && <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                  </button>
                );
              })}
            </div>

            {userAntwort && userAntwort !== aktuelleFrage.richtige_antwort && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-emerald-400 text-sm font-medium">Richtige Antwort: {aktuelleFrage.richtige_antwort} — {aktuelleFrage.antworten[aktuelleFrage.richtige_antwort as 'A' | 'B' | 'C']}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={vorherigeFrage} disabled={aktuellerIndex === 0} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 disabled:opacity-30"><ChevronLeft className="w-4 h-4 mr-1" />Zurück</Button>
              </TooltipTrigger>
              <TooltipContent><p>Vorherige Frage</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={naechsteFrage} disabled={aktuellerIndex === aktiveFragen.length - 1} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 disabled:opacity-30">Weiter<ChevronRight className="w-4 h-4 ml-1" /></Button>
              </TooltipTrigger>
              <TooltipContent><p>Nächste Frage</p></TooltipContent>
            </Tooltip>
          </div>

          {/* Schnellnavigation */}
          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <button onClick={() => setShowNav(!showNav)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-600/50 text-slate-300 text-sm mb-3 hover:bg-slate-700/80 hover:text-white transition-colors">
              <span>Schnellnavigation</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showNav ? 'rotate-180' : ''}`} />
            </button>
            {showNav && (
              <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex flex-wrap gap-1.5">
                  {aktiveFragen.map((frage, idx) => {
                    const beantwortet = antworten[frage.id] !== undefined;
                    const korrekt = antworten[frage.id] === frage.richtige_antwort;
                    const aktuell = idx === aktuellerIndex;
                    return (
                      <button key={frage.id} onClick={() => springeZuFrage(idx)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium flex-shrink-0 ${aktuell ? 'bg-teal-500 text-white' : beantwortet && korrekt ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : beantwortet && !korrekt ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700'}`}>
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
