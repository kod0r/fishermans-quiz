import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StartView from '@/views/StartView';
import type { QuizContext } from '@/hooks/useQuiz';

function createMockQuiz(overrides: Partial<QuizContext> = {}): QuizContext {
  const metaProgress = {
    fragen: {},
    topics: {},
    stats: { totalQuestionsAnswered: 0, totalCorrect: 0, bestStreak: 0, totalRuns: 0, arcadeRunsCompleted: 0 },
    arcadeStars: {},
    examMeta: { attempts: 0, passedCount: 0, bestScore: 0, lastScore: 0 },
    ...((overrides.metaProgress as QuizContext['metaProgress']) ?? {}),
  } as QuizContext['metaProgress'];

  return {
    isActive: false,
    view: 'start',
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
    switchGameMode: vi.fn(),
    backupReminderEnabled: false,
    lastBackupPrompt: null,
    setLastBackupPrompt: vi.fn(),
    settings: {} as QuizContext['settings'],
    quizMeta: {
      meta: { titel: 'Test', anzahl_fragen: 6, topics: { Biologie: 1, Gewässerkunde: 1, Gewässerpflege: 1, 'Fanggeräte und -methoden': 1, Recht: 1, Bilderkennung: 1 } },
      topics: ['Biologie', 'Gewässerkunde', 'Gewässerpflege', 'Fanggeräte und -methoden', 'Recht', 'Bilderkennung'],
      topicFiles: {},
      fragenIndex: { '1': 'Biologie', '2': 'Gewässerkunde', '3': 'Gewässerpflege', '4': 'Fanggeräte und -methoden', '5': 'Recht', '6': 'Bilderkennung' },
    },
    metaProgress,
    lernCount: 0,
    passedTopicsArcade: 0,
    passedTopicsHardcore: 0,
    masteredTopicsHardcore: 0,
    srsMap: {},
    srsDueCount: 0,
    favorites: [],
    ...overrides,
  } as QuizContext;
}

describe('StartView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all topics', () => {
    const quiz = createMockQuiz();
    render(<StartView quiz={quiz} />);

    const group = screen.getByRole('group', { name: 'Themenauswahl' });
    expect(group).toBeInTheDocument();

    const topics = screen.getAllByRole('checkbox');
    expect(topics).toHaveLength(6);
  });

  it('selects and deselects a topic on click', () => {
    const quiz = createMockQuiz();
    render(<StartView quiz={quiz} />);

    const biologie = screen.getByRole('checkbox', { name: /Biologie/ });
    expect(biologie).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(biologie);
    expect(biologie).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(biologie);
    expect(biologie).toHaveAttribute('aria-checked', 'false');
  });

  it('calls starteQuiz when start button clicked with selected topics', () => {
    const quiz = createMockQuiz();
    render(<StartView quiz={quiz} />);

    const biologie = screen.getByRole('checkbox', { name: /Biologie/ });
    fireEvent.click(biologie);

    const startButton = screen.getByLabelText('Quiz mit ausgewählten Themen starten');
    fireEvent.click(startButton);

    expect(quiz.starteQuiz).toHaveBeenCalledWith(['Biologie'], expect.objectContaining({ sessionType: 'quiz' }));
  });

  it('shows error when starting with no topics selected', () => {
    const quiz = createMockQuiz();
    render(<StartView quiz={quiz} />);

    const startButton = screen.getByLabelText('Quiz mit ausgewählten Themen starten');
    fireEvent.click(startButton);

    expect(screen.getByText('Bitte wähle mindestens ein Thema aus.')).toBeInTheDocument();
    expect(quiz.starteQuiz).not.toHaveBeenCalled();
  });

  it('renders exam mode card when gameMode is exam', () => {
    const quiz = createMockQuiz({ gameMode: 'exam' });
    render(<StartView quiz={quiz} />);

    expect(screen.getByText('Prüfungsmodus')).toBeInTheDocument();
    expect(screen.getByLabelText('Prüfung starten')).toBeInTheDocument();
  });

  it('switches mode when mode button clicked', () => {
    const quiz = createMockQuiz();
    render(<StartView quiz={quiz} />);

    const examButton = screen.getByLabelText('Prüfung');
    fireEvent.click(examButton);

    expect(quiz.switchGameMode).toHaveBeenCalledWith('exam');
  });
});
