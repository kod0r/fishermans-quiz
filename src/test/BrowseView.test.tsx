import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BrowseView from '@/views/BrowseView';
import type { QuizContext } from '@/hooks/useQuiz';
import type { QuizData } from '@/types/quiz';

const mockQuizData: QuizData = {
  meta: { titel: 'Test', anzahl_fragen: 3, topics: { Biologie: 2, Recht: 1 } },
  fragen: [
    { id: '1', topic: 'Biologie', frage: 'Was ist das?', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'A' },
    { id: '2', topic: 'Biologie', frage: 'Noch eine Frage', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'B' },
    { id: '3', topic: 'Recht', frage: 'Rechtsfrage', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'C' },
  ],
};

function createMockQuiz(overrides: Partial<QuizContext> = {}): QuizContext {
  return {
    isActive: false,
    view: 'browse',
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
    quizData: mockQuizData,
    favorites: [],
    metaProgress: { fragen: {}, topics: {}, stats: { totalQuestionsAnswered: 0, totalCorrect: 0, bestStreak: 0, totalRuns: 0, arcadeRunsCompleted: 0 }, arcadeStars: {}, examMeta: { attempts: 0, passedCount: 0, bestScore: 0, lastScore: 0 } },
    srsMap: {},
    ...overrides,
  } as QuizContext;
}

describe('BrowseView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders question count', () => {
    const quiz = createMockQuiz();
    render(<BrowseView quiz={quiz} />);

    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('filters by search query', () => {
    const quiz = createMockQuiz();
    render(<BrowseView quiz={quiz} />);

    const search = screen.getByLabelText('Frage suchen');
    fireEvent.change(search, { target: { value: 'Rechtsfrage' } });

    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('shows loading state when quizData is null', () => {
    const quiz = createMockQuiz({ quizData: null });
    render(<BrowseView quiz={quiz} />);

    expect(screen.getByText('Lade Fragenkatalog...')).toBeInTheDocument();
  });
});
