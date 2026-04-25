import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Fish, BookOpen, Trophy, Target, Flame, RotateCcw, BarChart3, CheckCircle, Star, Crosshair, Layers, Repeat, Waves, Heart, Scale, Eye } from 'lucide-react';
import type { QuizContext } from '@/hooks/useQuiz';
import { isMastered } from '@/utils/srs';
import { canSelectBereich } from '@/utils/bereichLocks';

const BEREICHE = [
  { id: 'Biologie', label: 'Biologie', icon: Fish, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', selectedBg: 'bg-emerald-500' },
  { id: 'Gewässerkunde', label: 'Gewässerkunde', icon: Waves, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', selectedBg: 'bg-blue-500' },
  { id: 'Gewässerpflege', label: 'Gewässerpflege', icon: Heart, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20', selectedBg: 'bg-cyan-500' },
  { id: 'Fanggeräte und -methoden', label: 'Fanggeräte & Methoden', icon: Crosshair, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', selectedBg: 'bg-amber-500' },
  { id: 'Recht', label: 'Recht', icon: Scale, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', selectedBg: 'bg-red-500' },
  { id: 'Bilderkennung', label: 'Bilderkennung', icon: Eye, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', selectedBg: 'bg-purple-500' },
];

interface Props {
  quiz: QuizContext;
}

export default function StartView({ quiz }: Props) {
  const [ausgewaehlt, setAusgewaehlt] = useState<string[]>([]);
  const [fehler, setFehler] = useState('');
  const [nurFavoriten, setNurFavoriten] = useState(false);
  const [flashcardMode, setFlashcardMode] = useState(false);

  type DialogState =
    | { type: 'remove-arcade'; bereichId: string; fragenCount: number }
    | { type: 'end-hardcore'; bereichId: string }
    | null;
  const [dialog, setDialog] = useState<DialogState>(null);

  const { metaProgress, lernCount, isActive, geladeneBereiche, statistiken, gameMode } = quiz;
  const totalBereiche = BEREICHE.length;

  function getBereichStatus(bereichId: string) {
    // Arcade: check per-question mastery first
    if (gameMode === 'arcade') {
      const fragenIds = Object.entries(quiz.quizMeta?.fragenIndex ?? {})
        .filter(([, b]) => b === bereichId).map(([id]) => id);
      const allMastered = fragenIds.length > 0 && fragenIds.every(id => isMastered(metaProgress.fragen[id], quiz.srsMap[id]));
      if (allMastered) {
        return { icon: '✅', label: 'Bestanden', cls: 'text-emerald-600 bg-emerald-500/20 border-emerald-500/30 dark:text-emerald-400' };
      }
    }
    // Hardcore: check bereich-level results
    if (gameMode === 'hardcore') {
      const bMeta = metaProgress.bereiche[bereichId];
      if (bMeta) {
        if (bMeta.mastered) {
          return { icon: '🏆', label: 'Gemeistert', cls: 'text-amber-600 bg-amber-500/20 border-amber-500/30 dark:text-amber-400' };
        }
        if (bMeta.passed) {
          return { icon: '✅', label: 'Bestanden', cls: 'text-emerald-600 bg-emerald-500/20 border-emerald-500/30 dark:text-emerald-400' };
        }
        if (bMeta.lastAttempt) {
          return { icon: '❌', label: 'Nicht bestanden', cls: 'text-red-600 bg-red-500/20 border-red-500/30 dark:text-red-400' };
        }
      }
    }
    // Only show AKTIV if no completion status exists
    if (isActive && geladeneBereiche.includes(bereichId)) {
      return { icon: '🔒', label: 'AKTIV', cls: 'text-teal-600 bg-teal-500/20 border-teal-500/30 dark:text-teal-400' };
    }
    return null;
  }

  const effektivAusgewaehlt = useMemo(() =>
    isActive
      ? [...new Set([...geladeneBereiche, ...ausgewaehlt])]
      : ausgewaehlt,
    [isActive, geladeneBereiche, ausgewaehlt]
  );

  const toggle = (id: string) => {
    setFehler('');
    if (isActive && geladeneBereiche.includes(id)) {
      if (quiz.gameMode === 'hardcore') {
        setDialog({ type: 'end-hardcore', bereichId: id });
        return;
      }
      const count = quiz.aktiveFragen.filter(f => f.bereich === id).length;
      if (count === 0) {
        quiz.entferneBereichAusRun(id);
        setAusgewaehlt(p => p.filter(x => x !== id));
        return;
      }
      setDialog({ type: 'remove-arcade', bereichId: id, fragenCount: count });
      return;
    }
    // Trying to select a new bereich — enforce lock rules
    if (!ausgewaehlt.includes(id)) {
      if (quiz.quizMeta && !canSelectBereich(id, gameMode, metaProgress, quiz.quizMeta, isActive, geladeneBereiche)) {
        setFehler('Dieser Bereich ist im Hardcore-Modus gesperrt. Beende den aktiven Run oder wähle einen anderen Bereich.');
        return;
      }
    }
    setAusgewaehlt(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  const handleKeyToggle = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle(id);
    }
  };

  const handleStart = useCallback(() => {
    if (effektivAusgewaehlt.length === 0) {
      setFehler('Bitte wähle mindestens einen Bereich aus.');
      return;
    }
    if (nurFavoriten && quiz.favorites.length === 0) {
      setFehler('Noch keine Favoriten vorhanden.');
      return;
    }
    quiz.starteQuiz(effektivAusgewaehlt, { nurFavoriten, sessionType: flashcardMode ? 'flashcard' : 'quiz' });
  }, [effektivAusgewaehlt, nurFavoriten, quiz, flashcardMode]);

  // Global Enter handler to start quiz when areas are selected
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && effektivAusgewaehlt.length > 0) {
        // Only trigger if focus is not inside a button or interactive element
        const target = e.target;
        if (target instanceof Element) {
          const tag = target.tagName;
          if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
            return;
          }
        }
        handleStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [effektivAusgewaehlt, handleStart]);

  const handleWeaknessTrainer = () => {
    const allBereiche = BEREICHE.map(b => b.id);
    quiz.starteQuiz(allBereiche, { filter: 'weak', sessionType: flashcardMode ? 'flashcard' : 'quiz' });
  };

  const handleSRSReview = () => {
    const allBereiche = BEREICHE.map(b => b.id);
    quiz.starteQuiz(allBereiche, { filter: 'srs-due', sessionType: flashcardMode ? 'flashcard' : 'quiz' });
  };

  const gesamtFragen = effektivAusgewaehlt.reduce((sum, bereichId) => {
    return sum + (quiz.quizMeta?.meta.bereiche[bereichId] ?? 0);
  }, 0);

  return (
    <TooltipProvider delayDuration={800}>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-blue-950 dark:via-slate-900 dark:to-teal-950">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-5 max-w-3xl">

          {/* Header */}
          <div className="text-center mb-5 sm:mb-6 pt-4 sm:pt-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Fish className="w-7 h-7 sm:w-8 sm:h-8 text-teal-400" aria-hidden="true" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Fisherman's Quiz</h1>
            </div>
          </div>

          {/* Aktiver Run Info */}
          {isActive && (
            <Card className="mb-2 bg-teal-50 border-teal-300/50 dark:bg-teal-900/30 dark:border-teal-500/30">
              <CardContent className="py-2 px-3">
                <div className="text-center">
                  <p className="text-teal-700 font-medium text-sm dark:text-teal-300">Aktiver Quiz-Run</p>
                  <p className="text-slate-500 text-xs dark:text-slate-400">{geladeneBereiche.join(', ')} — {statistiken.beantwortet}/{statistiken.gesamt} beantwortet</p>
                  <p className="text-slate-400 text-[10px] mt-0.5 dark:text-slate-500">Weitere Bereiche können hinzugefügt werden.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Meta-Progress — immer sichtbar, kompakt */}
          <Card className="mb-2 bg-white/80 border-slate-200/50 dark:bg-slate-800/50 dark:border-slate-700/50">
            <CardContent className="py-2 px-3">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-teal-400 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-slate-900 font-medium text-sm dark:text-white">Lernfortschritt</p>
                  <p className="text-slate-500 text-xs dark:text-slate-400">
                    {gameMode === 'arcade'
                      ? (quiz.bestandeneBereicheArcade > 0
                        ? `${quiz.bestandeneBereicheArcade} von ${totalBereiche} Bereichen bestanden • ${metaProgress.stats.totalQuestionsAnswered} beantwortet`
                        : 'Noch keine Fragen beantwortet')
                      : gameMode === 'exam'
                        ? (metaProgress.stats.totalQuestionsAnswered > 0
                          ? `${metaProgress.stats.totalQuestionsAnswered} beantwortet • ${Math.round((metaProgress.stats.totalCorrect / metaProgress.stats.totalQuestionsAnswered) * 100)}% Korrektrate`
                          : 'Noch keine Prüfung absolviert')
                        : (quiz.gemeisterteBereicheHardcore > 0 || quiz.bestandeneBereicheHardcore > 0
                          ? `${quiz.gemeisterteBereicheHardcore} von ${totalBereiche} gemeistert • ${quiz.bestandeneBereicheHardcore} bestanden`
                          : 'Noch keine Bereiche absolviert')
                    }
                  </p>
                </div>
              </div>

              {/* Statistiken */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3">
                {gameMode === 'arcade' ? (
                  <>
                    <StatBox icon={CheckCircle} iconColor="text-emerald-400" value={quiz.bestandeneBereicheArcade} label="Bestandene Bereiche" />
                    <StatBox icon={Target} iconColor="text-blue-400" value={lernCount} label="In Lernung" />
                    <StatBox icon={Flame} iconColor="text-orange-400" value={metaProgress.stats.bestStreak} label="Beste Serie" />
                    <StatBox icon={RotateCcw} iconColor="text-emerald-400" value={metaProgress.stats.totalRuns} label="Durchläufe" />
                    <StatBox icon={BarChart3} iconColor="text-purple-400" value={metaProgress.stats.totalQuestionsAnswered} label="Beantwortet" />
                    <StatBox icon={CheckCircle} iconColor="text-teal-400" value={metaProgress.stats.totalCorrect} label="Korrekt" />
                    {quiz.srsDueCount > 0 && (
                      <StatBox icon={Repeat} iconColor="text-indigo-400" value={quiz.srsDueCount} label="Wiederholung fällig" />
                    )}
                  </>
                ) : gameMode === 'exam' ? (
                  <>
                    <StatBox icon={RotateCcw} iconColor="text-blue-400" value={metaProgress.stats.totalRuns} label="Prüfungen" />
                    <StatBox icon={Flame} iconColor="text-orange-400" value={metaProgress.stats.bestStreak} label="Beste Serie" />
                    <StatBox icon={BarChart3} iconColor="text-purple-400" value={metaProgress.stats.totalQuestionsAnswered} label="Beantwortet" />
                    <StatBox icon={CheckCircle} iconColor="text-teal-400" value={metaProgress.stats.totalCorrect} label="Korrekt" />
                    <StatBox icon={Target} iconColor="text-red-400" value={metaProgress.stats.totalIncorrect} label="Falsch" />
                    <StatBox icon={Trophy} iconColor="text-amber-400" value={Math.round((metaProgress.stats.totalCorrect / Math.max(1, metaProgress.stats.totalQuestionsAnswered)) * 100)} label="Korrektrate %" />
                  </>
                ) : (
                  <>
                    <StatBox icon={Trophy} iconColor="text-amber-400" value={quiz.gemeisterteBereicheHardcore} label="Gemeisterte Bereiche" />
                    <StatBox icon={CheckCircle} iconColor="text-emerald-400" value={quiz.bestandeneBereicheHardcore} label="Bestandene Bereiche" />
                    <StatBox icon={Target} iconColor="text-blue-400" value={lernCount} label="In Lernung" />
                    <StatBox icon={Flame} iconColor="text-orange-400" value={metaProgress.stats.bestStreak} label="Beste Serie" />
                    <StatBox icon={BarChart3} iconColor="text-purple-400" value={metaProgress.stats.totalQuestionsAnswered} label="Beantwortet" />
                    <StatBox icon={CheckCircle} iconColor="text-teal-400" value={metaProgress.stats.totalCorrect} label="Korrekt" />
                  </>
                )}
              </div>

              {/* Korrektrate */}
              {metaProgress.stats.totalQuestionsAnswered > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span id="korrektrate-label" className="text-slate-600 dark:text-slate-300">Korrektrate</span>
                    <span className="text-teal-600 font-medium dark:text-teal-400">
                      {Math.round((metaProgress.stats.totalCorrect / metaProgress.stats.totalQuestionsAnswered) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(metaProgress.stats.totalCorrect / metaProgress.stats.totalQuestionsAnswered) * 100}
                    className="h-1.5 bg-slate-200 dark:bg-slate-700"
                    aria-labelledby="korrektrate-label"
                  />
                </div>
              )}

              {/* Bereichs-Fortschritte */}
              <div className="space-y-2 mb-3">
                {BEREICHE.map(b => {
                  const Icon = b.icon;
                  const fragenIds = Object.entries(quiz.quizMeta?.fragenIndex ?? {})
                    .filter(([, bereich]) => bereich === b.id)
                    .map(([id]) => id);
                  const gem = fragenIds.filter(id => isMastered(metaProgress.fragen[id], quiz.srsMap[id])).length;
                  const lern = fragenIds.filter(id => {
                    const meta = metaProgress.fragen[id];
                    return meta && meta.attempts > 0 && !isMastered(meta, quiz.srsMap[id]);
                  }).length;
                  const pct = fragenIds.length ? Math.round((gem / fragenIds.length) * 100) : 0;
                  return (
                    <div key={b.id} className="flex items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-1.5 w-24 sm:w-32 shrink-0">
                        <Icon className={`w-3.5 h-3.5 ${b.color}`} aria-hidden="true" />
                        <span className="text-slate-500 text-[10px] truncate dark:text-slate-400">{b.label}</span>
                      </div>
                      <Progress value={pct} className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700" aria-label={`${b.label}: ${pct}% gemeistert`} />
                      <div className="flex items-center justify-end gap-1.5 w-16 sm:w-20 shrink-0 text-right">
                        <span className="text-slate-500 text-[10px] dark:text-slate-400">{gem}/{fragenIds.length}</span>
                        {lern > 0 && <span className="text-blue-600 text-[9px] dark:text-blue-400">{lern}</span>}
                      </div>
                    </div>
                  );
                })}
               </div>
             </CardContent>
          </Card>

          {/* Bereichsauswahl */}
          <Card className="bg-white/80 border-slate-200/50 backdrop-blur-sm dark:bg-slate-800/50 dark:border-slate-700/50">
            <CardContent className="py-2 px-3">
              <h2 className="text-slate-900 font-semibold text-sm sm:text-base flex items-center gap-2 mb-3 sm:mb-4 dark:text-white">
                <BookOpen className="w-4 h-4 text-teal-400" aria-hidden="true" />
                {isActive ? 'Bereiche hinzufügen' : 'Bereiche auswählen'}
              </h2>

              {/* Dialog: Arcade — Bereich aus Run entfernen */}
              <AlertDialog open={dialog?.type === 'remove-arcade'} onOpenChange={() => setDialog(null)}>
                <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-slate-900 dark:text-white">Bereich entfernen</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
                      Dies entfernt {dialog?.type === 'remove-arcade' ? dialog.fragenCount : 0} Fragen aus dem aktiven Quiz. Der Rest des Runs läuft normal weiter.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDialog(null)} className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">Abbrechen</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        if (dialog?.type === 'remove-arcade') {
                          quiz.entferneBereichAusRun(dialog.bereichId);
                          setAusgewaehlt(p => p.filter(x => x !== dialog.bereichId));
                        }
                        setDialog(null);
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      Entfernen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Dialog: Hardcore — Run beenden */}
              <AlertDialog open={dialog?.type === 'end-hardcore'} onOpenChange={() => setDialog(null)}>
                <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-slate-900 dark:text-white">Hardcore-Run beenden</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
                      Im Hardcore-Modus wird der gesamte Run unterbrochen, wenn du einen Bereich abwählst. Alle Fortschritte dieses Runs gehen verloren.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDialog(null)} className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">Abbrechen</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        if (dialog?.type === 'end-hardcore') {
                          quiz.unterbrecheRun();
                          setAusgewaehlt(p => p.filter(x => x !== dialog.bereichId));
                        }
                        setDialog(null);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Run beenden
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <div className="space-y-1.5 sm:space-y-2" role="group" aria-label="Bereichsauswahl">
                {BEREICHE.map(b => {
                  const Icon = b.icon;
                  const inRun = isActive && geladeneBereiche.includes(b.id);
                  const checked = effektivAusgewaehlt.includes(b.id);
                  const status = getBereichStatus(b.id);
                  const selectable = quiz.quizMeta ? canSelectBereich(b.id, gameMode, metaProgress, quiz.quizMeta, isActive, geladeneBereiche) : true;
                  const disabled = !selectable && !checked && !inRun;
                  return (
                    <div
                      key={b.id}
                      onClick={() => !disabled && toggle(b.id)}
                      onKeyDown={(e) => !disabled && handleKeyToggle(e, b.id)}
                      role="checkbox"
                      aria-checked={checked}
                      aria-disabled={disabled}
                      tabIndex={disabled ? -1 : 0}
                      className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border transition-all focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 ${checked ? `${b.bg} ${b.border} shadow-md` : 'bg-slate-200/50 border-slate-300/30 dark:bg-slate-700/30 dark:border-slate-600/30'} ${inRun ? 'ring-1 ring-teal-400/30' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-300/50 dark:hover:bg-slate-700/50'}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${checked ? `${b.selectedBg} border-transparent` : 'border-slate-500 bg-transparent'}`} aria-hidden="true">
                        {checked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div className={`p-1.5 rounded-md ${b.bg}`} aria-hidden="true"><Icon className={`w-4 h-4 ${b.color}`} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-slate-900 font-medium text-sm truncate dark:text-white">{b.label}</p>
                          {status && <span className={`px-1 py-0 rounded text-[9px] flex-shrink-0 border ${status.cls}`}>{status.icon} {status.label}</span>}
                        </div>
                        <p className="text-slate-500 text-xs dark:text-slate-400">{(quiz.quizMeta?.meta.bereiche[b.id] ?? 0)} Fragen</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {fehler && <p className="text-red-400 text-xs mt-3 text-center" role="alert">{fehler}</p>}

              {/* Study Mode Toggles */}
              <div className="flex items-center gap-2 mb-3 mt-1 flex-wrap">
                <button
                  onClick={() => setNurFavoriten(p => !p)}
                  aria-pressed={nurFavoriten}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${nurFavoriten ? 'bg-amber-50 text-amber-600 border border-amber-300/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30' : 'text-slate-500 hover:text-slate-700 border border-transparent dark:text-slate-400 dark:hover:text-slate-300'}`}
                >
                  <Star className={`w-3.5 h-3.5 ${nurFavoriten ? 'fill-current' : ''}`} />
                  Nur Favoriten ({quiz.favorites.length})
                </button>
                <button
                  onClick={handleWeaknessTrainer}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors text-slate-500 hover:text-red-600 border border-transparent dark:text-slate-400 dark:hover:text-red-400"
                  title="Nur Fragen mit <50% Korrektrate"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  Schwächentrainer
                </button>
                <button
                  onClick={() => setFlashcardMode(p => !p)}
                  aria-pressed={flashcardMode}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${flashcardMode ? 'bg-indigo-50 text-indigo-600 border border-indigo-300/50 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30' : 'text-slate-500 hover:text-slate-700 border border-transparent dark:text-slate-400 dark:hover:text-slate-300'}`}
                  title="Karteikarten-Modus: Antwort erst aufdecken, dann selbst bewerten"
                >
                  <Layers className={`w-3.5 h-3.5 ${flashcardMode ? 'fill-current' : ''}`} />
                  Karteikarten
                </button>
                <button
                  onClick={handleSRSReview}
                  disabled={quiz.srsDueCount === 0}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${quiz.srsDueCount > 0 ? 'bg-indigo-50 text-indigo-600 border border-indigo-300/50 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30' : 'text-slate-400 border border-transparent cursor-not-allowed dark:text-slate-600'}`}
                  title="Nur fällige SRS-Wiederholungen"
                >
                  <Repeat className="w-3.5 h-3.5" />
                  Wiederholung {quiz.srsDueCount > 0 ? `(${quiz.srsDueCount})` : ''}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                <p className="text-slate-500 text-xs dark:text-slate-400">
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
                  className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-5 sm:px-6 py-4 sm:py-5 text-sm sm:text-base rounded-xl shadow-lg shadow-teal-500/20 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 w-full sm:w-auto"
                >
                  {isActive ? 'Hinzufügen' : 'Quiz starten'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* <p className="text-center text-slate-400 text-xs mt-4 sm:mt-5 dark:text-slate-500">Prüfungsfragen zur Staatlichen Fischerprüfung aus dem Bayerischer Fragenkatalog (Stand: 11.03.2026)</p> */}
        </div>
      </div>
    </TooltipProvider>
  );
}

// ── Hilfskomponenten ──

function StatBox({ icon: Icon, iconColor, value, label }: { icon: typeof Trophy; iconColor: string; value: number; label: string }) {
  return (
    <div className="text-center p-1.5 sm:p-2 rounded-lg bg-slate-200/50 dark:bg-slate-700/30" aria-label={`${label}: ${value}`}>
      <Icon className={`w-4 h-4 ${iconColor} mx-auto mb-0.5`} aria-hidden="true" />
      <p className="text-base sm:text-lg font-bold text-slate-900 leading-tight dark:text-white">{value}</p>
      <p className="text-[10px] text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
