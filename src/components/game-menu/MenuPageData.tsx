import { useRef, useState } from 'react';
import { FileJson, Table, Database, Upload, RotateCcw, Download, Trash2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { QuizContext } from '@/hooks/useQuiz';
import { buildCsv } from '@/utils/csvExport';
import { MetaProgressionSchema } from '@/utils/quizLoader';

interface MenuPageDataProps {
  quiz: QuizContext;
}

export function MenuPageData({ quiz }: MenuPageDataProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const [expJson, setExpJson] = useState(false);
  const [expCsv, setExpCsv] = useState(false);
  const [expBackup, setExpBackup] = useState(false);

  return (
    <div className="py-2 space-y-6 px-4">
      {/* Export Section */}
      <section>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-4 dark:text-slate-400">
          Export
        </h3>
        <div className="bg-slate-100/80 dark:bg-slate-800/50 rounded-xl overflow-hidden divide-y divide-slate-200/50 dark:divide-slate-700/50">
          <div className="flex items-center space-x-2 px-4 py-3">
            <Checkbox
              id="exp-json-data"
              checked={expJson}
              onCheckedChange={(v) => setExpJson(v === true)}
            />
            <Label htmlFor="exp-json-data" className="flex-1 cursor-pointer flex items-center gap-2 text-[15px]">
              <FileJson className="w-4 h-4 text-slate-400" />
              Progress — aktueller Modus (JSON)
            </Label>
          </div>
          <div className="flex items-center space-x-2 px-4 py-3">
            <Checkbox
              id="exp-csv-data"
              checked={expCsv}
              onCheckedChange={(v) => setExpCsv(v === true)}
            />
            <Label htmlFor="exp-csv-data" className="flex-1 cursor-pointer flex items-center gap-2 text-[15px]">
              <Table className="w-4 h-4 text-slate-400" />
              Stats — aktueller Modus (CSV)
            </Label>
          </div>
          <div className="flex items-center space-x-2 px-4 py-3">
            <Checkbox
              id="exp-backup-data"
              checked={expBackup}
              onCheckedChange={(v) => setExpBackup(v === true)}
            />
            <Label htmlFor="exp-backup-data" className="flex-1 cursor-pointer flex items-center gap-2 text-[15px]">
              <Database className="w-4 h-4 text-slate-400" />
              Full Backup
            </Label>
          </div>
          <div className="px-4 pb-3">
            <Button
              data-menu-item
              size="sm"
              className="w-full"
              disabled={!expJson && !expCsv && !expBackup}
              onClick={() => {
                if (expJson) {
                  const data = quiz.metaProgress;
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `fishermans-quiz-meta-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 100);
                }
                if (expCsv) {
                  const rows = [
                    ['Frage-ID', 'Thema', 'Versuche', 'Serie', 'Letztes Ergebnis', 'Erst gesehen', 'Zuletzt'],
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
                  const csv = buildCsv(rows);
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `fishermans-quiz-stats-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 100);
                }
                if (expBackup) {
                  quiz.exportFullBackup?.();
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </section>

      {/* Import Section */}
      <section>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-4 dark:text-slate-400">
          Import
        </h3>
        <div className="bg-slate-100/80 dark:bg-slate-800/50 rounded-xl overflow-hidden divide-y divide-slate-200/50 dark:divide-slate-700/50">
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
                  const raw = ev.target?.result;
                  const data = JSON.parse(typeof raw === 'string' ? raw : '');
                  const parsed = MetaProgressionSchema.safeParse(data);
                  if (parsed.success) {
                    if (confirm(`Import progress data for ${quiz.gameMode === 'exam' ? 'Prüfungsmodus' : quiz.gameMode}?\nDies überschreibt nur den Fortschritt des aktuellen Modus.`)) {
                      quiz.importMetaProgression?.(parsed.data);
                    }
                  } else {
                    console.error('[Import] Validation failed:', parsed.error.format());
                    alert('Invalid file format. The file does not contain valid progress data.');
                  }
                } catch {
                  alert('Error reading file.');
                }
                if (fileInputRef.current) fileInputRef.current.value = '';
              };
              reader.readAsText(file);
            }}
          />
          <input
            ref={backupInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                try {
                  const raw = ev.target?.result;
                  const data = JSON.parse(typeof raw === 'string' ? raw : '');
                  if (confirm('Restore full backup? This will overwrite ALL data and reload the page.')) {
                    const ok = quiz.importFullBackup?.(data);
                    if (ok === false) {
                      alert('Invalid backup format.');
                    }
                  }
                } catch {
                  alert('Error reading file.');
                }
                if (backupInputRef.current) backupInputRef.current.value = '';
              };
              reader.readAsText(file);
            }}
          />
          <div className="px-4 py-3 grid grid-cols-2 gap-3">
            <Button data-menu-item variant="outline" size="sm" className="h-8" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Progress (aktueller Modus)
            </Button>
            <Button data-menu-item variant="outline" size="sm" className="h-8" onClick={() => backupInputRef.current?.click()}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Full Restore
            </Button>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-4 dark:text-slate-400">
          Gefahrenzone
        </h3>
        <div className="bg-slate-100/80 dark:bg-slate-800/50 rounded-xl overflow-hidden divide-y divide-slate-200/50 dark:divide-slate-700/50">
          {/* Per-Mode Reset */}
          <Button
            data-menu-item
            variant="ghost"
            size="sm"
            className="w-full justify-start px-4 py-3 h-auto text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-500/10"
            onClick={() => {
              const modeLabel = quiz.gameMode === 'arcade' ? 'Arcade' : quiz.gameMode === 'hardcore' ? 'Hardcore' : 'Prüfungsmodus';
              if (confirm(`${modeLabel}-Fortschritt löschen?\n\nDies entfernt alle Meta-Daten und den aktiven Run NUR für den ${modeLabel}. Andere Modi bleiben unberührt. Dies kann nicht rückgängig gemacht werden.`)) {
                quiz.resetMetaProgression();
                quiz.clearCurrentRun?.();
              }
            }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {quiz.gameMode === 'arcade' ? 'Arcade-Fortschritt löschen' : quiz.gameMode === 'hardcore' ? 'Hardcore-Fortschritt löschen' : 'Prüfungs-Fortschritt löschen'}
          </Button>

          {/* Global Reset */}
          <Button
            data-menu-item
            variant="ghost"
            size="sm"
            className="w-full justify-start px-4 py-3 h-auto text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            onClick={() => {
              if (confirm('ALLE Daten löschen?\n\nDies entfernt den Fortschritt ALLER Modi (Arcade, Hardcore, Prüfung), alle Runs, Favoriten, Notizen, Verlauf und SRS-Daten. Dies kann nicht rückgängig gemacht werden.')) {
                quiz.resetAllMetaProgression?.();
                quiz.clearAllRuns?.();
                quiz.resetSRS?.();
                quiz.resetFavorites?.();
                quiz.resetNotes?.();
                quiz.clearHistory?.();
              }
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Alle Daten löschen
          </Button>
        </div>
      </section>

      {/* Backup Reminder */}
      <section className="px-4">
        <button
          data-menu-item
          onClick={() => quiz.setBackupReminderEnabled?.(!quiz.backupReminderEnabled)}
          aria-pressed={quiz.backupReminderEnabled}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
            quiz.backupReminderEnabled
              ? 'bg-teal-50 text-teal-600 border-teal-300/50 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/30'
              : 'text-slate-500 hover:text-slate-700 border-transparent dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          <span className="flex items-center gap-2">
            <Bell className={`w-4 h-4 ${quiz.backupReminderEnabled ? 'fill-current' : ''}`} />
            Backup reminder
          </span>
          <span className="text-xs">{quiz.backupReminderEnabled ? 'on' : 'off'}</span>
        </button>
      </section>
    </div>
   );
 }

