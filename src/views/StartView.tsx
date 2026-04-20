import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Fish, BookOpen, Scale, Droplets, Leaf, Eye, HelpCircle, Trophy, Target, Flame, RotateCcw, ChevronDown, BarChart3, Trash2, CheckCircle } from 'lucide-react';
import type { QuizContext } from '@/hooks/useQuiz';

const BEREICHE = [
  { id: 'Biologie', label: 'Biologie', anzahl: 319, icon: Fish, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', selectedBg: 'bg-emerald-500' },
  { id: 'Gewässerkunde', label: 'Gewässerkunde', anzahl: 129, icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', selectedBg: 'bg-blue-500' },
  { id: 'Gewässerpflege', label: 'Gewässerpflege', anzahl: 136, icon: Leaf, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', selectedBg: 'bg-blue-500' },
  { id: 'Fanggeräte und -methoden', label: 'Fanggeräte & Methoden', anzahl: 192, icon: HelpCircle, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', selectedBg: 'bg-amber-500' },
  { id: 'Recht', label: 'Recht', anzahl: 222, icon: Scale, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', selectedBg: 'bg-red-500' },
  { id: 'Bilderkennung', label: 'Bilderkennung', anzahl: 54, icon: Eye, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', selectedBg: 'bg-purple-500' },
];

interface Props {
  quiz: QuizContext;
}

export default function StartView({ quiz }: Props) {
  const [ausgewaehlt, setAusgewaehlt] = useState<string[]>([]);
  const [fehler, setFehler] = useState('');
  const [warnung, setWarnung] = useState<string | null>(null);
  const [showMeta, setShowMeta] = useState(false);

  const { metaProgress, meisterCount, lernCount, isActive, geladeneBereiche, statistiken } = quiz;
  const totalFragen = quiz.quizMeta?.meta.anzahl_fragen || 1052;
  const masterPct = totalFragen > 0 ? Math.round((meisterCount / totalFragen) * 100) : 0;

  const effektivAusgewaehlt = isActive
    ? [...new Set([...geladeneBereiche, ...ausgewaehlt])]
    : ausgewaehlt;

  const toggle = (id: string) => {
    setFehler('');
    setWarnung(null);
    if (isActive && geladeneBereiche.includes(id)) {
      setWarnung(id);
      return;
    }
    setAusgewaehlt(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  const handleKeyToggle = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle(id);
    }
  };

  const handleStart = () => {
    if (effektivAusgewaehlt.length === 0) {
      setFehler('Bitte wähle mindestens einen Bereich aus.');
      return;
    }
    quiz.starteQuiz(effektivAusgewaehlt);
  };

  const handleFortsetzen = () => quiz.goToView('quiz');

  const gesamtFragen = BEREICHE
    .filter(b => effektivAusgewaehlt.includes(b.id))
    .reduce((s, b) => s + b.anzahl, 0);

  return (
    <TooltipProvider delayDuration={800}>
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-teal-950">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-3xl">

          {/* Header */}
          <div className="text-center mb-8 sm:mb-10 pt-10 sm:pt-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Fish className="w-8 h-8 sm:w-10 sm:h-10 text-teal-400" aria-hidden="true" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Fisherman's Quiz</h1>
            </div>
          </div>

          {/* Aktiver Run Info */}
          {isActive && (
            <Card className="mb-4 sm:mb-6 bg-teal-900/30 border-teal-500/30">
              <CardContent className="pt-4 sm:pt-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <p className="text-teal-300 font-medium">Aktiver Quiz-Run</p>
                    <p className="text-slate-400 text-sm">{geladeneBereiche.join(', ')} — {statistiken.beantwortet}/{statistiken.gesamt} beantwortet</p>
                    <p className="text-slate-500 text-xs mt-1">Weitere Bereiche können hinzugefügt werden.</p>
                  </div>
                  <Button
                    onClick={handleFortsetzen}
                    aria-label="Aktives Quiz fortsetzen"
                    className="bg-teal-500 hover:bg-teal-600 text-white whitespace-nowrap focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 min-h-[44px]"
                  >
                    Zum Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── COMPREHENSIVE META-PROGRESS ── Immer sichtbar, klappbar */}
          <Card className="mb-4 sm:mb-6 bg-slate-800/50 border-slate-700/50">
            <CardContent className="pt-4 sm:pt-5 pb-4 sm:pb-5">
              <button
                onClick={() => setShowMeta(!showMeta)}
                aria-expanded={showMeta}
                aria-controls="meta-progress-details"
                className="w-full flex items-center justify-between min-h-[44px] focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-teal-400 flex-shrink-0" aria-hidden="true" />
                  <div className="text-left">
                    <p className="text-white font-medium">Lernfortschritt</p>
                    <p className="text-slate-400 text-sm">
                      {metaProgress.stats.totalQuestionsAnswered > 0
                        ? `${meisterCount} von ${totalFragen} gemeistert (${masterPct}%) • ${metaProgress.stats.totalQuestionsAnswered} beantwortet`
                        : 'Noch keine Fragen beantwortet'}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${showMeta ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              {showMeta && (
                <div id="meta-progress-details" className="mt-4 pt-4 border-t border-slate-700/50">
                  {/* Statistiken */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
                    <StatBox icon={Trophy} iconColor="text-amber-400" value={meisterCount} label="Gemeistert" />
                    <StatBox icon={Target} iconColor="text-blue-400" value={lernCount} label="In Lernung" />
                    <StatBox icon={Flame} iconColor="text-orange-400" value={metaProgress.stats.bestStreak} label="Beste Serie" />
                    <StatBox icon={RotateCcw} iconColor="text-emerald-400" value={metaProgress.stats.totalRuns} label="Durchläufe" />
                    <StatBox icon={BarChart3} iconColor="text-purple-400" value={metaProgress.stats.totalQuestionsAnswered} label="Beantwortet" />
                    <StatBox icon={CheckCircle} iconColor="text-teal-400" value={metaProgress.stats.totalCorrect} label="Korrekt" />
                  </div>

                  {/* Korrektrate */}
                  {metaProgress.stats.totalQuestionsAnswered > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span id="korrektrate-label" className="text-slate-300">Korrektrate</span>
                        <span className="text-teal-400 font-medium">
                          {Math.round((metaProgress.stats.totalCorrect / metaProgress.stats.totalQuestionsAnswered) * 100)}%
                        </span>
                      </div>
                      <Progress
                        value={(metaProgress.stats.totalCorrect / metaProgress.stats.totalQuestionsAnswered) * 100}
                        className="h-2 bg-slate-700"
                        aria-labelledby="korrektrate-label"
                      />
                    </div>
                  )}

                  {/* Bereichs-Fortschritte */}
                  <div className="space-y-2 mb-4">
                    {BEREICHE.map(b => {
                      const fragenIds = Object.entries(quiz.quizMeta?.fragenIndex ?? {})
                        .filter(([, bereich]) => bereich === b.id)
                        .map(([id]) => id);
                      const gem = fragenIds.filter(id => metaProgress.fragen[id]?.correctStreak >= 3).length;
                      const lern = fragenIds.filter(id => {
                        const meta = metaProgress.fragen[id];
                        return meta && meta.attempts > 0 && meta.correctStreak < 3;
                      }).length;
                      const pct = fragenIds.length ? Math.round((gem / fragenIds.length) * 100) : 0;
                      return (
                        <div key={b.id} className="flex items-center gap-2 sm:gap-3">
                          <span className="text-slate-400 text-xs w-24 sm:w-32 truncate">{b.label}</span>
                          <Progress value={pct} className="flex-1 h-1.5 bg-slate-700" aria-label={`${b.label}: ${pct}% gemeistert`} />
                          <span className="text-slate-400 text-xs w-14 sm:w-16 text-right">{gem}/{fragenIds.length}</span>
                          {lern > 0 && <span className="text-blue-400 text-[10px] w-10 text-right">{lern} Lern</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => { if (confirm('Alle Lerndaten löschen? Dies kann nicht rückgängig gemacht werden.')) quiz.resetMetaProgression(); }}
                          variant="outline"
                          size="sm"
                          aria-label="Alle Lerndaten zurücksetzen"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 min-h-[44px]"
                        >
                          <Trash2 className="w-3 h-3 mr-1" aria-hidden="true" />Zurücksetzen
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Alle Lerndaten löschen</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bereichsauswahl */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="pt-4 sm:pt-6">
              <h2 className="text-white font-semibold text-base sm:text-lg flex items-center gap-2 mb-4 sm:mb-5">
                <BookOpen className="w-5 h-5 text-teal-400" aria-hidden="true" />
                {isActive ? 'Bereiche hinzufügen' : 'Bereiche auswählen'}
              </h2>

              {warnung && (
                <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30" role="alert" aria-live="polite">
                  <p className="text-amber-300 text-sm mb-3">"{BEREICHE.find(b => b.id === warnung)?.label}" ist aktiv. Abwählen unterbricht den Run.</p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => { quiz.unterbrecheRun(); setAusgewaehlt(p => p.filter(x => x !== warnung)); setWarnung(null); }}
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-white focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 min-h-[44px]"
                    >
                      Abwählen
                    </Button>
                    <Button
                      onClick={() => setWarnung(null)}
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 min-h-[44px]"
                    >
                      Beibehalten
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2 sm:space-y-3" role="group" aria-label="Bereichsauswahl">
                {BEREICHE.map(b => {
                  const Icon = b.icon;
                  const inRun = isActive && geladeneBereiche.includes(b.id);
                  const checked = effektivAusgewaehlt.includes(b.id);
                  return (
                    <div
                      key={b.id}
                      onClick={() => toggle(b.id)}
                      onKeyDown={(e) => handleKeyToggle(e, b.id)}
                      role="checkbox"
                      aria-checked={checked}
                      tabIndex={0}
                      className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl cursor-pointer border transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${checked ? `${b.bg} ${b.border} shadow-lg` : 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50'} ${inRun ? 'ring-1 ring-teal-400/30' : ''}`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${checked ? `${b.selectedBg} border-transparent` : 'border-slate-500 bg-transparent'}`} aria-hidden="true">
                        {checked && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div className={`p-2 rounded-lg ${b.bg}`} aria-hidden="true"><Icon className={`w-5 h-5 ${b.color}`} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium text-sm sm:text-base truncate">{b.label}</p>
                          {inRun && <span className="px-1.5 py-0.5 rounded text-[10px] bg-teal-500/20 text-teal-400 border border-teal-500/30 flex-shrink-0">AKTIV</span>}
                        </div>
                        <p className="text-slate-400 text-sm">{b.anzahl} Fragen</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {fehler && <p className="text-red-400 text-sm mt-4 text-center" role="alert">{fehler}</p>}

              <Separator className="my-4 sm:my-6 bg-slate-700" />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-slate-400 text-sm">{effektivAusgewaehlt.length > 0 ? <span><span className="text-teal-400 font-bold">{gesamtFragen}</span> Fragen</span> : 'Keine Bereiche ausgewählt'}</p>
                <Button
                  onClick={handleStart}
                  aria-label={isActive ? 'Ausgewählte Bereiche zum Quiz hinzufügen' : 'Quiz mit ausgewählten Bereichen starten'}
                  className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-xl shadow-lg shadow-teal-500/20 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 min-h-[44px] w-full sm:w-auto"
                >
                  {isActive ? 'Hinzufügen' : 'Quiz starten'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-slate-500 text-xs sm:text-sm mt-6 sm:mt-8">Prüfungsfragen zur Staatlichen Fischerprüfung aus dem Bayerischen Fragenkatalog (Stand: 11.03.2026)</p>
        </div>
      </div>
    </TooltipProvider>
  );
}

// ── Hilfskomponenten ──

function StatBox({ icon: Icon, iconColor, value, label }: { icon: typeof Trophy; iconColor: string; value: number; label: string }) {
  return (
    <div className="text-center p-2 sm:p-3 rounded-xl bg-slate-700/30" aria-label={`${label}: ${value}`}>
      <Icon className={`w-5 h-5 ${iconColor} mx-auto mb-1`} aria-hidden="true" />
      <p className="text-lg sm:text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
