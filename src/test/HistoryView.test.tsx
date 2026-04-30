import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HistoryView from '@/views/HistoryView';
import type { QuizContext } from '@/hooks/useQuiz';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <svg>{children}</svg>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

function createMockQuiz(overrides: Partial<QuizContext> = {}): QuizContext {
  return {
    isActive: false,
    view: 'history',
    goToView: vi.fn(),
    statistiken: { beantwortet: 0, gesamt: 0, korrekt: 0, falsch: 0, offen: 0 },
    istGeladen: true,
    loadError: null,
    gameMode: 'arcade',
    aktiveFragen: [],
    aktuellerIndex: 0,
    aktuelleFrage: null,
    antworten: {},
    beantworteFrage: vi.fn(),
    beantworteFlashcard: vi.fn(),
    naechsteFrage: vi.fn(),
    vorherigeFrage: vi.fn(),
    springeZuFrage: vi.fn(),
    toggleFavorite: vi.fn(),
    isFavorite: vi.fn(() => false),
    getNote: vi.fn(() => ''),
    setNote: vi.fn(),
    goToNextUnanswered: vi.fn(),
    unterbrecheRun: vi.fn(),
    restarteRun: vi.fn(),
    rawRun: null,
    beendeExam: vi.fn(),
    starteQuiz: vi.fn(),
    starteFlashcards: vi.fn(),
    loadedTopics: [],
    historyEntries: [],
    exportFullBackup: vi.fn(),
    importFullBackup: vi.fn(),
    clearAllData: vi.fn(),
    setGameMode: vi.fn(),
    backupReminderEnabled: false,
    lastBackupPrompt: null,
    setLastBackupPrompt: vi.fn(),
    settings: {} as QuizContext['settings'],
    metaProgress: { fragen: {}, topics: {}, stats: { totalQuestionsAnswered: 0, totalCorrect: 0, bestStreak: 0, totalRuns: 0, arcadeRunsCompleted: 0 }, arcadeStars: {}, examMeta: { attempts: 0, passedCount: 0, bestScore: 0, lastScore: 0 } },
    clearHistory: vi.fn(),
    ...overrides,
  } as QuizContext;
}

describe('HistoryView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  it('renders empty state when no entries', () => {
    const quiz = createMockQuiz();
    render(<HistoryView quiz={quiz} />);

    expect(screen.getByText('Noch keine abgeschlossenen Sessions. Starte ein Quiz!')).toBeInTheDocument();
  });

  it('renders stats and entries when history exists', () => {
    const quiz = createMockQuiz({
      historyEntries: [
        { topics: ['Biologie'], score: 8, total: 10, duration: 120, mode: 'arcade', timestamp: '2024-01-01T00:00:00Z' },
        { topics: ['Recht'], score: 5, total: 10, duration: 90, mode: 'hardcore', timestamp: '2024-01-02T00:00:00Z' },
      ],
    });
    render(<HistoryView quiz={quiz} />);

    expect(screen.getByText('2')).toBeInTheDocument(); // total runs stat
    expect(screen.getByText('65%')).toBeInTheDocument(); // avg ((80+50)/2)
    expect(screen.getAllByText('80%').length).toBeGreaterThanOrEqual(1); // best stat or entry badge
  });

  it('calls clearHistory when delete button clicked', () => {
    const quiz = createMockQuiz({
      historyEntries: [
        { topics: ['Biologie'], score: 8, total: 10, duration: 120, mode: 'arcade', timestamp: '2024-01-01T00:00:00Z' },
      ],
    });
    render(<HistoryView quiz={quiz} />);

    fireEvent.click(screen.getByText('Verlauf löschen'));
    expect(quiz.clearHistory).toHaveBeenCalled();
  });
});
