import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import FlashcardView from '@/views/FlashcardView';
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
    view: 'flashcard',
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
    setIsTutorialDemoActive: vi.fn(),
    ...overrides,
  } as QuizContext;
}

describe('FlashcardView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders question and reveal button', () => {
    const quiz = createMockQuiz();
    render(<FlashcardView quiz={quiz} onOpenRunActions={vi.fn()} gameMenuOpen={false} />);

    expect(screen.getByText('Was ist das?')).toBeInTheDocument();
    expect(screen.getByText('Antwort aufdecken')).toBeInTheDocument();
  });

  it('reveals answers and highlights correct one', () => {
    const quiz = createMockQuiz();
    render(<FlashcardView quiz={quiz} onOpenRunActions={vi.fn()} gameMenuOpen={false} />);

    fireEvent.click(screen.getByText('Antwort aufdecken'));

    expect(screen.getByText('Ein Fisch')).toBeInTheDocument();
    expect(screen.getByText('Ein Vogel')).toBeInTheDocument();
    expect(screen.getByText('Ein Baum')).toBeInTheDocument();
  });

  it('calls beantworteFlashcard and auto-advances on grade click', () => {
    const quiz = createMockQuiz();
    render(<FlashcardView quiz={quiz} onOpenRunActions={vi.fn()} gameMenuOpen={false} />);

    fireEvent.click(screen.getByText('Antwort aufdecken'));
    fireEvent.click(screen.getByText('Good'));

    expect(quiz.beantworteFlashcard).toHaveBeenCalledWith('f1', 'good');
    expect(quiz.naechsteFrage).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(quiz.naechsteFrage).toHaveBeenCalled();
  });

  it('shows graded message and hides grade buttons when already answered', () => {
    const quiz = createMockQuiz({
      antworten: { f1: 'good' },
      statistiken: { beantwortet: 1, gesamt: 1, korrekt: 1, falsch: 0, offen: 0 },
    });
    render(<FlashcardView quiz={quiz} onOpenRunActions={vi.fn()} gameMenuOpen={false} />);

    expect(screen.queryByText('Antwort aufdecken')).not.toBeInTheDocument();
    expect(screen.getByText('Bewertet. Weiter zur nächsten Frage …')).toBeInTheDocument();
    expect(screen.queryByText('Again')).not.toBeInTheDocument();
  });

  it('registers keyboard shortcuts', () => {
    const quiz = createMockQuiz();
    render(<FlashcardView quiz={quiz} onOpenRunActions={vi.fn()} gameMenuOpen={false} />);

    const lastCall = vi.mocked(useKeyboardShortcuts).mock.calls.at(-1)?.[0];
    expect(lastCall).toBeDefined();
    expect(lastCall!.onSpace).toBeDefined();
    expect(lastCall!.onOpenCheatSheet).toBeDefined();
    expect(lastCall!.onEscape).toBeDefined();
    expect(lastCall!.onToggleFavorite).toBeDefined();
  });

  it('calls toggleFavorite when favorite button clicked', () => {
    const quiz = createMockQuiz();
    render(<FlashcardView quiz={quiz} onOpenRunActions={vi.fn()} gameMenuOpen={false} />);

    fireEvent.click(screen.getByLabelText('Zu Favoriten hinzufügen'));
    expect(quiz.toggleFavorite).toHaveBeenCalledWith('f1');
  });

  it('opens cheat sheet modal via keyboard shortcut handler', () => {
    const quiz = createMockQuiz();
    render(<FlashcardView quiz={quiz} onOpenRunActions={vi.fn()} gameMenuOpen={false} />);

    const lastCall = vi.mocked(useKeyboardShortcuts).mock.calls.at(-1)?.[0];
    expect(lastCall?.onOpenCheatSheet).toBeDefined();

    act(() => {
      lastCall!.onOpenCheatSheet!();
    });

    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
  });
});
