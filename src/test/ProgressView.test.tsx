import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProgressView from '@/views/ProgressView';
import type { QuizContext } from '@/hooks/useQuiz';
import type { Frage } from '@/types/quiz';

vi.mock('@/hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: vi.fn(),
}));

const mockFragen: Frage[] = [
  { id: '1', topic: 'Biologie', frage: 'F1', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'A' },
  { id: '2', topic: 'Biologie', frage: 'F2', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'B' },
  { id: '3', topic: 'Recht', frage: 'F3', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'C' },
];

function createMockQuiz(overrides: Partial<QuizContext> = {}): QuizContext {
  return {
    isActive: true,
    view: 'progress',
    goToView: vi.fn(),
    statistiken: { beantwortet: 3, gesamt: 3, korrekt: 2, falsch: 1, offen: 0 },
    istGeladen: true,
    loadError: null,
    gameMode: 'arcade',
    aktiveFragen: mockFragen,
    aktuellerIndex: 0,
    aktuelleFrage: mockFragen[0],
    antworten: { '1': 'A', '2': 'X', '3': 'C' },
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
    loadedTopics: ['Biologie', 'Recht'],
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
    getFrageMeta: vi.fn(() => ({ attempts: 1, correctStreak: 0, lastCorrect: true })),
    ...overrides,
  } as QuizContext;
}

describe('ProgressView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders passed state when >= 60%', () => {
    const quiz = createMockQuiz();
    render(<ProgressView quiz={quiz} />);

    expect(screen.getByText('Bestanden!')).toBeInTheDocument();
  });

  it('renders failed state when < 60%', () => {
    const quiz = createMockQuiz({
      statistiken: { beantwortet: 3, gesamt: 3, korrekt: 1, falsch: 2, offen: 0 },
      antworten: { '1': 'X', '2': 'X', '3': 'C' },
    });
    render(<ProgressView quiz={quiz} />);

    expect(screen.getByText('Nicht bestanden')).toBeInTheDocument();
  });

  it('toggles wrong answers section', () => {
    const quiz = createMockQuiz();
    render(<ProgressView quiz={quiz} />);

    const toggle = screen.getByText('Falsche Antworten (1)');
    fireEvent.click(toggle);

    expect(screen.getByText('F2')).toBeInTheDocument();
    expect(screen.getByText('Zur Frage')).toBeInTheDocument();
  });

  it('toggles unanswered section', () => {
    const quiz = createMockQuiz({ antworten: { '1': 'A' }, statistiken: { beantwortet: 1, gesamt: 3, korrekt: 1, falsch: 0, offen: 2 } });
    render(<ProgressView quiz={quiz} />);

    const toggle = screen.getByText('Unbeantwortete Fragen (2)');
    fireEvent.click(toggle);

    expect(screen.getByLabelText('Zu unbeantworteter Frage 2 springen')).toBeInTheDocument();
  });

  it('calls springeZuFrage and goToView when jumping to a wrong question', () => {
    const quiz = createMockQuiz();
    render(<ProgressView quiz={quiz} />);

    fireEvent.click(screen.getByText('Falsche Antworten (1)'));
    fireEvent.click(screen.getByText('Zur Frage'));

    expect(quiz.springeZuFrage).toHaveBeenCalledWith(1);
    expect(quiz.goToView).toHaveBeenCalledWith('quiz');
  });

  it('calls toggleFavorite from wrong answer item', () => {
    const quiz = createMockQuiz();
    render(<ProgressView quiz={quiz} />);

    fireEvent.click(screen.getByText('Falsche Antworten (1)'));
    fireEvent.click(screen.getByLabelText('Zu Favoriten hinzufügen'));

    expect(quiz.toggleFavorite).toHaveBeenCalledWith('2');
  });

  it('shows empty message when no wrong answers', () => {
    const quiz = createMockQuiz({ antworten: { '1': 'A', '2': 'B', '3': 'C' }, statistiken: { beantwortet: 3, gesamt: 3, korrekt: 3, falsch: 0, offen: 0 } });
    render(<ProgressView quiz={quiz} />);

    fireEvent.click(screen.getByText('Falsche Antworten (0)'));
    expect(screen.getByText('Keine falschen Antworten — super!')).toBeInTheDocument();
  });
});
