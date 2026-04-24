import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { History, Trash2, ArrowLeft } from 'lucide-react';
import type { QuizContext } from '@/hooks/useQuiz';

interface Props {
  quiz: QuizContext;
  onBack: () => void;
}

export default function HistoryView({ quiz, onBack }: Props) {
  const { historyEntries, clearHistory } = quiz;

  const chartData = useMemo(() => {
    return [...historyEntries]
      .reverse()
      .map((entry) => ({
        date: new Date(entry.timestamp).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
        }),
        pct: entry.total > 0 ? Math.round((entry.score / entry.total) * 100) : 0,
        score: entry.score,
        total: entry.total,
      }));
  }, [historyEntries]);

  const stats = useMemo(() => {
    if (historyEntries.length === 0) return null;
    const totalRuns = historyEntries.length;
    const avgScore =
      historyEntries.reduce(
        (sum, e) => sum + (e.total > 0 ? e.score / e.total : 0),
        0
      ) / totalRuns;
    const best = historyEntries.reduce(
      (max, e) =>
        e.total > 0 && e.score / e.total > max.score / max.total ? e : max,
      historyEntries[0]
    );
    const totalDuration = historyEntries.reduce((sum, e) => sum + e.duration, 0);
    return {
      totalRuns,
      avgPct: Math.round(avgScore * 100),
      bestPct: best.total > 0 ? Math.round((best.score / best.total) * 100) : 0,
      totalDuration,
    };
  }, [historyEntries]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-blue-950 dark:via-slate-900 dark:to-teal-950">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-5 max-w-3xl pt-14 sm:pt-16">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            aria-label="Zurück"
            className="w-8 h-8 rounded-full bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </Button>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-teal-400" aria-hidden="true" />
            Session-Verlauf
          </h1>
        </div>

        {historyEntries.length === 0 ? (
          <Card className="bg-white/80 border-slate-200/50 dark:bg-slate-800/50 dark:border-slate-700/50">
            <CardContent className="py-8 text-center">
              <p className="text-slate-500 text-sm dark:text-slate-400">
                Noch keine abgeschlossenen Sessions. Starte ein Quiz!
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                <StatBox label="Sessions" value={String(stats.totalRuns)} />
                <StatBox label="Ø Ergebnis" value={`${stats.avgPct}%`} />
                <StatBox label="Bestes" value={`${stats.bestPct}%`} />
                <StatBox
                  label="Gesamtzeit"
                  value={formatDuration(stats.totalDuration)}
                />
              </div>
            )}

            {/* Chart */}
            {chartData.length >= 2 && (
              <Card className="mb-4 bg-white/80 border-slate-200/50 dark:bg-slate-800/50 dark:border-slate-700/50">
                <CardContent className="py-3 px-3">
                  <p className="text-slate-500 text-xs mb-2 dark:text-slate-400">
                    Ergebnis-Trend (% richtig)
                  </p>
                  <div className="h-48 sm:h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(148,163,184,0.2)"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: '#94a3b8', fontSize: 10 }}
                          stroke="#94a3b8"
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fill: '#94a3b8', fontSize: 10 }}
                          stroke="#94a3b8"
                          unit="%"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15,23,42,0.9)',
                            border: '1px solid rgba(51,65,85,0.5)',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: '#e2e8f0',
                          }}
                          formatter={(value: number) => [`${value}%`, 'Ergebnis']}
                        />
                        <Line
                          type="monotone"
                          dataKey="pct"
                          stroke="#14b8a6"
                          strokeWidth={2}
                          dot={{ r: 3, fill: '#14b8a6' }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* List */}
            <Card className="bg-white/80 border-slate-200/50 dark:bg-slate-800/50 dark:border-slate-700/50">
              <CardContent className="py-2 px-3">
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {historyEntries.map((entry) => {
                    const pct =
                      entry.total > 0
                        ? Math.round((entry.score / entry.total) * 100)
                        : 0;
                    const date = new Date(entry.timestamp).toLocaleString(
                      'de-DE',
                      {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    );
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-100/50 dark:bg-slate-700/30"
                      >
                        <div className="min-w-0">
                          <p className="text-slate-900 text-xs font-medium dark:text-white truncate">
                            {entry.bereiche.join(', ')}
                          </p>
                          <p className="text-slate-500 text-[10px] dark:text-slate-400">
                            {date} • {entry.mode} • {formatDuration(entry.duration)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`text-xs font-bold ${
                              pct >= 60
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {entry.score}/{entry.total}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                              pct >= 60
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                            }`}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-end">
                  <Button
                    onClick={() => {
                      if (
                        confirm('Gesamten Verlauf löschen? Dies kann nicht rückgängig gemacht werden.')
                      ) {
                        clearHistory();
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="border-red-300/50 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-1" aria-hidden="true" />
                    Verlauf löschen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-2 rounded-lg bg-slate-200/50 dark:bg-slate-700/30">
      <p className="text-base font-bold text-slate-900 dark:text-white">
        {value}
      </p>
      <p className="text-[10px] text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m${s}s`;
}
