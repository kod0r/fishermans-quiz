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
    <TooltipProvider delayDuration={1500}>
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-teal-950">
        <div className="container mx-auto px-4 py-8 max-w-3xl">

          {/* Header */}
          <div className="text-center mb-10 pt-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Fish className="w-10 h-10 text-teal-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">Fisherman's Quiz</h1>
            </div>
          </div>

          {/* Aktiver Run Info */}
          {isActive && (
            <Card className="mb-6 bg-teal-900/30 border-teal-500/30">
              <CardContent className="pt-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <p className="text-teal-300 font-medium">Aktiver Quiz-Run</p>
                    <p className="text-slate-400 text-sm">{geladeneBereiche.join(', ')} — {statistiken.beantwortet}/{statistiken.gesamt} beantwortet</p>
                    <p className="text-slate-500 text-xs mt-1">Weitere Bereiche können hinzugefügt werden.</p>
                  </div>
                  <Button onClick={handleFortsetzen} className="bg-teal-500 hover:bg-teal-600 text-white whitespace-nowrap">Zum Quiz</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── COMPREHENSIVE META-PROGRESS ── Immer sichtbar, klappbar */}
          <Card className="mb-6 bg-slate-800/50 border-slate-700/50">
            <CardContent className="pt-5 pb-5">
              <button onClick={() => setShowMeta(!showMeta)} className="w-full flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-teal-400" />
                  <div>
                    <p className="text-white font-medium text-left">Lernfortschritt</p>
                    <p className="text-slate-400 text-sm text-left">
                      {metaProgress.stats.totalQuestionsAnswered > 0
                        ? `${meisterCount} von ${totalFragen} gemeistert (${masterPct}%) • ${metaProgress.stats.totalQuestionsAnswered} beantwortet`
                        : 'Noch keine Fragen beantwortet'}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showMeta ? 'rotate-180' : ''}`} />
              </button>

              {showMeta && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  {/* Statistiken */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
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
                        <span className="text-slate-300">Korrektrate</span>
                        <span className="text-teal-400 font-medium">
                          {Math.round((metaProgress.stats.totalCorrect / metaProgress.stats.totalQuestionsAnswered) * 100)}%
                        </span>
                      </div>
                      <Progress
                        value={(metaProgress.stats.totalCorrect / metaProgress.stats.totalQuestionsAnswered) * 100}
                        className="h-2 bg-slate-700"
                      />
                    </div>
                  )}

                  {/* Bereichs-Fortschritte */}
                  <div className="space-y-2 mb-4">
                    {BEREICHE.map(b => {
                      const fragen = quiz.quizData?.fragen.filter(f => f.bereich === b.id) ?? [];
                      const gem = fragen.filter(f => metaProgress.fragen[f.id]?.correctStreak >= 3).length;
                      const lern = fragen.filter(f => {
                        const meta = metaProgress.fragen[f.id];
                        return meta && meta.attempts > 0 && meta.correctStreak < 3;
                      }).length;
                      const pct = fragen.length ? Math.round((gem / fragen.length) * 100) : 0;
                      return (
                        <div key={b.id} className="flex items-center gap-3">
                          <span className="text-slate-400 text-xs w-32 truncate">{b.label}</span>
                          <Progress value={pct} className="flex-1 h-1.5 bg-slate-700" />
                          <span className="text-slate-400 text-xs w-16 text-right">{gem}/{fragen.length}</span>
                          {lern > 0 && <span className="text-blue-400 text-[10px] w-10 text-right">{lern} Lern</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={() => { if (confirm('Alle Lerndaten löschen? Dies kann nicht rückgängig gemacht werden.')) quiz.resetMetaProgression(); }} variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                          <Trash2 className="w-3 h-3 mr-1" />Zurücksetzen
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
            <CardContent className="pt-6">
              <h2 className="text-white font-semibold text-lg flex items-center gap-2 mb-5">
                <BookOpen className="w-5 h-5 text-teal-400" />
                {isActive ? 'Bereiche hinzufügen' : 'Bereiche auswählen'}
              </h2>

              {warnung && (
                <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <p className="text-amber-300 text-sm mb-3">"{BEREICHE.find(b => b.id === warnung)?.label}" ist aktiv. Abwählen unterbricht den Run.</p>
                  <div className="flex gap-3">
                    <Button onClick={() => { quiz.unterbrecheRun(); setAusgewaehlt(p => p.filter(x => x !== warnung)); setWarnung(null); }} size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">Abwählen</Button>
                    <Button onClick={() => setWarnung(null)} size="sm" variant="outline" className="border-slate-600 text-slate-300">Beibehalten</Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {BEREICHE.map(b => {
                  const Icon = b.icon;
                  const inRun = isActive && geladeneBereiche.includes(b.id);
                  const checked = effektivAusgewaehlt.includes(b.id);
                  return (
                    <div key={b.id} onClick={() => toggle(b.id)} className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all ${checked ? `${b.bg} ${b.border} shadow-lg` : 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50'} ${inRun ? 'ring-1 ring-teal-400/30' : ''}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${checked ? `${b.selectedBg} border-transparent` : 'border-slate-500 bg-transparent'}`}>
                        {checked && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div className={`p-2 rounded-lg ${b.bg}`}><Icon className={`w-5 h-5 ${b.color}`} /></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium">{b.label}</p>
                          {inRun && <span className="px-1.5 py-0.5 rounded text-[10px] bg-teal-500/20 text-teal-400 border border-teal-500/30">AKTIV</span>}
                        </div>
                        <p className="text-slate-400 text-sm">{b.anzahl} Fragen</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {fehler && <p className="text-red-400 text-sm mt-4 text-center">{fehler}</p>}

              <Separator className="my-6 bg-slate-700" />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-slate-400">{effektivAusgewaehlt.length > 0 ? <span><span className="text-teal-400 font-bold">{gesamtFragen}</span> Fragen</span> : 'Keine Bereiche ausgewählt'}</p>
                <Button onClick={handleStart} className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg shadow-teal-500/20">{isActive ? 'Hinzufügen' : 'Quiz starten'}</Button>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-slate-500 text-sm mt-8">Prüfungsfragen zur Staatlichen Fischerprüfung aus dem Bayerischen Fragenkatalog (Stand: 11.03.2026)</p>
        </div>
      </div>
    </TooltipProvider>
  );
}

// ── Hilfskomponenten ──

function StatBox({ icon: Icon, iconColor, value, label }: { icon: typeof Trophy; iconColor: string; value: number; label: string }) {
  return (
    <div className="text-center p-3 rounded-xl bg-slate-700/30">
      <Icon className={`w-5 h-5 ${iconColor} mx-auto mb-1`} />
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}


