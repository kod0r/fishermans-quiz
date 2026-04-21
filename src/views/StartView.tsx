import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Fish, BookOpen, HelpCircle, Trophy, Target, Flame, RotateCcw, BarChart3, Trash2, CheckCircle, Star, Download, Upload, FileJson } from 'lucide-react';
import type { QuizContext } from '@/hooks/useQuiz';

const BEREICHE = [
  { id: 'Biologie', label: 'Biologie', anzahl: 319, icon: Fish, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', selectedBg: 'bg-emerald-500' },
  { id: 'Gewässerkunde', label: 'Gewässerkunde', anzahl: 129, icon: HelpCircle, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', selectedBg: 'bg-blue-500' },
  { id: 'Gewässerpflege', label: 'Gewässerpflege', anzahl: 136, icon: HelpCircle, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20', selectedBg: 'bg-cyan-500' },
  { id: 'Fanggeräte und -methoden', label: 'Fanggeräte & Methoden', anzahl: 192, icon: HelpCircle, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', selectedBg: 'bg-amber-500' },
  { id: 'Recht', label: 'Recht', anzahl: 222, icon: HelpCircle, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', selectedBg: 'bg-red-500' },
  { id: 'Bilderkennung', label: 'Bilderkennung', anzahl: 54, icon: HelpCircle, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', selectedBg: 'bg-purple-500' },
];

interface Props {
  quiz: QuizContext;
}

export default function StartView({ quiz }: Props) {
  const [ausgewaehlt, setAusgewaehlt] = useState<string[]>([]);
  const [fehler, setFehler] = useState('');
  const [warnung, setWarnung] = useState<string | null>(null);
  const [nurFavoriten, setNurFavoriten] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (nurFavoriten && quiz.favorites.length === 0) {
      setFehler('Noch keine Favoriten vorhanden.');
      return;
    }
    quiz.starteQuiz(effektivAusgewaehlt, nurFavoriten);
  };

  const gesamtFragen = BEREICHE
    .filter(b => effektivAusgewaehlt.includes(b.id))
    .reduce((s, b) => s + b.anzahl, 0);

  return (
    <TooltipProvider delayDuration={800}>
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-teal-950">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-5 max-w-3xl">

          {/* Header */}
          <div className="text-center mb-5 sm:mb-6 pt-12 sm:pt-14">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Fish className="w-7 h-7 sm:w-8 sm:h-8 text-teal-400" aria-hidden="true" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Fisherman's Quiz</h1>
            </div>
          </div>

          {/* Aktiver Run Info */}
          {isActive && (
            <Card className="mb-2 bg-teal-900/30 border-teal-500/30">
              <CardContent className="py-2 px-3">
                <div className="text-center">
                  <p className="text-teal-300 font-medium text-sm">Aktiver Quiz-Run</p>
                  <p className="text-slate-400 text-xs">{geladeneBereiche.join(', ')} — {statistiken.beantwortet}/{statistiken.gesamt} beantwortet</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">Weitere Bereiche können hinzugefügt werden.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Meta-Progress — immer sichtbar, kompakt */}
          <Card className="mb-2 bg-slate-800/50 border-slate-700/50">
            <CardContent className="py-2 px-3">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-teal-400 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-white font-medium text-sm">Lernfortschritt</p>
                  <p className="text-slate-400 text-xs">
                    {metaProgress.stats.totalQuestionsAnswered > 0
                      ? `${meisterCount} von ${totalFragen} gemeistert (${masterPct}%) • ${metaProgress.stats.totalQuestionsAnswered} beantwortet`
                      : 'Noch keine Fragen beantwortet'}
                  </p>
                </div>
              </div>

              {/* Statistiken */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3">
                <StatBox icon={Trophy} iconColor="text-amber-400" value={meisterCount} label="Gemeistert" />
                <StatBox icon={Target} iconColor="text-blue-400" value={lernCount} label="In Lernung" />
                <StatBox icon={Flame} iconColor="text-orange-400" value={metaProgress.stats.bestStreak} label="Beste Serie" />
                <StatBox icon={RotateCcw} iconColor="text-emerald-400" value={metaProgress.stats.totalRuns} label="Durchläufe" />
                <StatBox icon={BarChart3} iconColor="text-purple-400" value={metaProgress.stats.totalQuestionsAnswered} label="Beantwortet" />
                <StatBox icon={CheckCircle} iconColor="text-teal-400" value={metaProgress.stats.totalCorrect} label="Korrekt" />
              </div>

              {/* Korrektrate */}
              {metaProgress.stats.totalQuestionsAnswered > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span id="korrektrate-label" className="text-slate-300">Korrektrate</span>
                    <span className="text-teal-400 font-medium">
                      {Math.round((metaProgress.stats.totalCorrect / metaProgress.stats.totalQuestionsAnswered) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(metaProgress.stats.totalCorrect / metaProgress.stats.totalQuestionsAnswered) * 100}
                    className="h-1.5 bg-slate-700"
                    aria-labelledby="korrektrate-label"
                  />
                </div>
              )}

              {/* Bereichs-Fortschritte */}
              <div className="space-y-1.5 mb-3">
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
                      <span className="text-slate-400 text-[10px] w-20 sm:w-28 truncate">{b.label}</span>
                      <Progress value={pct} className="flex-1 h-1 bg-slate-700" aria-label={`${b.label}: ${pct}% gemeistert`} />
                      <span className="text-slate-400 text-[10px] w-12 sm:w-14 text-right">{gem}/{fragenIds.length}</span>
                      {lern > 0 && <span className="text-blue-400 text-[9px] w-8 text-right">{lern}</span>}
                    </div>
                  );
                })}
              </div>

              {/* Export / Import / Reset */}
              <div className="flex flex-wrap items-center justify-end gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      try {
                        const data = JSON.parse(ev.target?.result as string);
                        if (data.fragen && data.stats) {
                          if (confirm('Lerndaten aus Datei importieren? Dies überschreibt den aktuellen Fortschritt.')) {
                            quiz.importMetaProgression?.(data);
                          }
                        } else {
                          alert('Ungültiges Dateiformat.');
                        }
                      } catch {
                        alert('Fehler beim Lesen der Datei.');
                      }
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    };
                    reader.readAsText(file);
                  }}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => {
                        const data = quiz.metaProgress;
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `fishermans-quiz-meta-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      variant="outline"
                      size="sm"
                      aria-label="Als JSON exportieren"
                      className="border-slate-600 text-slate-300 hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 text-xs"
                    >
                      <FileJson className="w-3 h-3 mr-1" aria-hidden="true" />JSON
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Meta-Daten als JSON exportieren</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => {
                        const rows = [
                          ['Frage-ID', 'Bereich', 'Versuche', 'Serie', 'Letztes Ergebnis', 'Erst gesehen', 'Zuletzt'],
                          ...Object.entries(quiz.metaProgress.fragen).map(([id, m]) => [
                            id,
                            quiz.quizMeta?.fragenIndex?.[id] ?? '',
                            String(m.attempts),
                            String(m.correctStreak),
                            m.lastResult ?? '',
                            m.firstSeen,
                            m.lastAttempt,
                          ]),
                        ];
                        const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `fishermans-quiz-stats-${new Date().toISOString().split('T')[0]}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      variant="outline"
                      size="sm"
                      aria-label="Als CSV exportieren"
                      className="border-slate-600 text-slate-300 hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" aria-hidden="true" />CSV
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Statistik als CSV exportieren</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                      aria-label="JSON importieren"
                      className="border-slate-600 text-slate-300 hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 text-xs"
                    >
                      <Upload className="w-3 h-3 mr-1" aria-hidden="true" />Import
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Meta-Daten aus JSON importieren</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => { if (confirm('Alle Lerndaten löschen? Dies kann nicht rückgängig gemacht werden.')) quiz.resetMetaProgression(); }}
                      variant="outline"
                      size="sm"
                      aria-label="Alle Lerndaten zurücksetzen"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 text-xs"
                    >
                      <Trash2 className="w-3 h-3 mr-1" aria-hidden="true" />Zurücksetzen
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Alle Lerndaten löschen</p></TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>

          {/* Bereichsauswahl */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="py-2 px-3">
              <h2 className="text-white font-semibold text-sm sm:text-base flex items-center gap-2 mb-3 sm:mb-4">
                <BookOpen className="w-4 h-4 text-teal-400" aria-hidden="true" />
                {isActive ? 'Bereiche hinzufügen' : 'Bereiche auswählen'}
              </h2>

              {warnung && (
                <div className="mb-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30" role="alert" aria-live="polite">
                  <p className="text-amber-300 text-xs mb-2">"{BEREICHE.find(b => b.id === warnung)?.label}" ist aktiv. Abwählen unterbricht den Run.</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => { quiz.unterbrecheRun(); setAusgewaehlt(p => p.filter(x => x !== warnung)); setWarnung(null); }}
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-white focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 text-xs"
                    >
                      Abwählen
                    </Button>
                    <Button
                      onClick={() => setWarnung(null)}
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 text-xs"
                    >
                      Beibehalten
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5 sm:space-y-2" role="group" aria-label="Bereichsauswahl">
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
                      className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg cursor-pointer border transition-all focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${checked ? `${b.bg} ${b.border} shadow-md` : 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50'} ${inRun ? 'ring-1 ring-teal-400/30' : ''}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${checked ? `${b.selectedBg} border-transparent` : 'border-slate-500 bg-transparent'}`} aria-hidden="true">
                        {checked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div className={`p-1.5 rounded-md ${b.bg}`} aria-hidden="true"><Icon className={`w-4 h-4 ${b.color}`} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-white font-medium text-sm truncate">{b.label}</p>
                          {inRun && <span className="px-1 py-0 rounded text-[9px] bg-teal-500/20 text-teal-400 border border-teal-500/30 flex-shrink-0">AKTIV</span>}
                        </div>
                        <p className="text-slate-400 text-xs">{b.anzahl} Fragen</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {fehler && <p className="text-red-400 text-xs mt-3 text-center" role="alert">{fehler}</p>}

              {/* Nur Favoriten Toggle */}
              <div className="flex items-center gap-2 mb-3 mt-1">
                <button
                  onClick={() => setNurFavoriten(p => !p)}
                  aria-pressed={nurFavoriten}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${nurFavoriten ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-300 border border-transparent'}`}
                >
                  <Star className={`w-3.5 h-3.5 ${nurFavoriten ? 'fill-current' : ''}`} />
                  Nur Favoriten ({quiz.favorites.length})
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-700/50">
                <p className="text-slate-400 text-xs">
                  {effektivAusgewaehlt.length > 0
                    ? <span><span className="text-teal-400 font-bold">
                      {nurFavoriten
                        ? quiz.favorites.filter(id => effektivAusgewaehlt.some(b => quiz.quizMeta?.fragenIndex[id] === b)).length
                        : gesamtFragen}
                    </span> Fragen</span>
                    : 'Keine Bereiche ausgewählt'}
                </p>
                <Button
                  onClick={handleStart}
                  aria-label={isActive ? 'Ausgewählte Bereiche zum Quiz hinzufügen' : 'Quiz mit ausgewählten Bereichen starten'}
                  className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-5 sm:px-6 py-4 sm:py-5 text-sm sm:text-base rounded-xl shadow-lg shadow-teal-500/20 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 w-full sm:w-auto"
                >
                  {isActive ? 'Hinzufügen' : 'Quiz starten'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-slate-500 text-xs mt-4 sm:mt-5">Prüfungsfragen zur Staatlichen Fischerprüfung aus dem Bayerischen Fragenkatalog (Stand: 11.03.2026)</p>
        </div>
      </div>
    </TooltipProvider>
  );
}

// ── Hilfskomponenten ──

function StatBox({ icon: Icon, iconColor, value, label }: { icon: typeof Trophy; iconColor: string; value: number; label: string }) {
  return (
    <div className="text-center p-1.5 sm:p-2 rounded-lg bg-slate-700/30" aria-label={`${label}: ${value}`}>
      <Icon className={`w-4 h-4 ${iconColor} mx-auto mb-0.5`} aria-hidden="true" />
      <p className="text-base sm:text-lg font-bold text-white leading-tight">{value}</p>
      <p className="text-[10px] text-slate-400">{label}</p>
    </div>
  );
}
