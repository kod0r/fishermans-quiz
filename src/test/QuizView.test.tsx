import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuizView from '@/views/QuizView';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { QuizContext } from '@/hooks/useQuiz';
import type { Frage } from '@/types/quiz';

vi.mock('@/hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: vi.fn(),
}));

const mockFrage: Frage = {
  id: 'f1',
  topic: 'Biologie',
  frage: 'Was ist das?',
  antworten: { A: 'Ein Fisch', B: 'Ein Vogel', C: 'Ein Baum' },
  richtige_antwort: 'A',
};

function createMockQuiz(overrides: Partial<QuizContext> = {}): QuizContext {
  return {
    isActive: true,
    view: 'quiz',
    goToView: vi.fn(),
    statistiken: { beantwortet: 0, gesamt: 1, korrekt: 0, falsch: 0, offen: 1 },
    istGeladen: true,
    loadError: null,
    gameMode: 'arcade',
    aktiveFragen: [mockFrage],
    aktuellerIndex: 0,
    aktuelleFrage: mockFrage,
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
    loadedTopics: ['Biologie'],
    historyEntries: [],
    exportFullBackup: vi.fn(),
    importFullBackup: vi.fn(),
    clearAllData: vi.fn(),
    setGameMode: vi.fn(),
    backupReminderEnabled: false,
    lastBackupPrompt: null,
    setLastBackupPrompt: vi.fn(),
    settings: {} as QuizContext['settings'],
    ...overrides,
  } as QuizContext;
}

describe('QuizView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders question and answer options', () => {
    const quiz = createMockQuiz();
    render(<QuizView quiz={quiz} onOpenRunActions={vi.fn()} gameMenuOpen={false} />);

    expect(screen.getByText('Was ist das?')).toBeInTheDocument();
    expect(screen.getByLabelText('Antwort A: Ein Fisch')).toBeInTheDocument();
    expect(screen.getByLabelText('Antwort B: Ein Vogel')).toBeInTheDocument();
    expect(screen.getByLabelText('Antwort C: Ein Baum')).toBeInTheDocument();
  });

  it('calls beantworteFrage when answer is clicked', () => {
    const quiz = createMockQuiz();
    render(<QuizView quiz={quiz} onOpenRunActions={vi.fn()} gameMenuOpen={false} />);

    fireEvent.click(screen.getByLabelText('Antwort A: Ein Fisch'));

    expect(quiz.beantworteFrage).toHaveBeenCalledWith('f1', 'A');
  });

  it('calls naechsteFrage when next button clicked', () => {
    const frage2: Frage = { ...mockFrage, id: 'f2' };
    const quiz = createMockQuiz({ aktiveFragen: [mockFrage, frage2], statistiken: { beantwortet: 0, gesamt: 2, korrekt: 0, falsch: 0, offen: 2 } });
    render(<QuizView quiz={quiz} onOpenRunActions={vi.fn()} gameMenuOpen={false} />);

    fireEvent.click(screen.getByLabelText('Nächste Frage'));

    expect(quiz.naechsteFrage).toHaveBeenCalled();
  });

  it('calls vorherigeFrage when prev button clicked', () => {
    const quiz = createMockQuiz({ aktuellerIndex: 1 });
    render(<QuizView quiz={quiz} onOpenRunActions={vi.fn()} gameMenuOpen={false} />);

    fireEvent.click(screen.getByLabelText('Vorherige Frage'));

    expect(quiz.vorherigeFrage).toHaveBeenCalled();
  });

  it('calls toggleFavorite when favorite button clicked', () => {
    const quiz = createMockQuiz();
    render(<QuizView quiz={quiz} onOpenRunActions={vi.fn()} gameMenuOpen={false} />);

    fireEvent.click(screen.getByLabelText('Zu Favoriten hinzufügen'));

    expect(quiz.toggleFavorite).toHaveBeenCalledWith('f1');
  });

  it('shows exam submit button in exam mode', () => {
    const quiz = createMockQuiz({ gameMode: 'exam' });
    render(<QuizView quiz={quiz} onOpenRunActions={vi.fn()} gameMenuOpen={false} />);

    expect(screen.getByText('Prüfung abgeben')).toBeInTheDocument();
  });

  it('does not show exam submit button in arcade mode', () => {
    const quiz = createMockQuiz({ gameMode: 'arcade' });
    render(<QuizView quiz={quiz} onOpenRunActions={vi.fn()} gameMenuOpen={false} />);

    expect(screen.queryByText('Prüfung abgeben')).not.toBeInTheDocument();
  });

  it('opens exam submit dialog and calls beendeExam on confirm', () => {
    const quiz = createMockQuiz({ gameMode: 'exam' });
    render(<QuizView quiz={quiz} onOpenRunActions={vi.fn()} gameMenuOpen={false} />);

    fireEvent.click(screen.getByText('Prüfung abgeben'));
    expect(screen.getByText('Prüfung vorzeitig abgeben?')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Abgeben'));
    expect(quiz.beendeExam).toHaveBeenCalled();
  });

  it('registers keyboard shortcuts with correct handlers', () => {
    const quiz = createMockQuiz();
    render(<QuizView quiz={quiz} onOpenRunActions={vi.fn()} gameMenuOpen={false} />);

    const lastCall = vi.mocked(useKeyboardShortcuts).mock.calls.at(-1)?.[0];
    expect(lastCall).toBeDefined();
    expect(lastCall!.onAnswer).toBeDefined();
    expect(lastCall!.onNext).toBeDefined();
    expect(lastCall!.onPrev).toBeDefined();
    expect(lastCall!.onToggleFavorite).toBeDefined();
  });
});
