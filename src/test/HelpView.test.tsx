import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HelpView from '@/views/HelpView';
import type { QuizContext } from '@/hooks/useQuiz';

function createMockQuiz(overrides: Partial<QuizContext> = {}): QuizContext {
  return {
    isActive: false,
    view: 'help',
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
    setIsTutorialDemoActive: vi.fn(),
    ...overrides,
  } as QuizContext;
}

describe('HelpView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders landing page', () => {
    const quiz = createMockQuiz();
    render(<HelpView quiz={quiz} />);

    expect(screen.getByText('Hilfe & Tutorials')).toBeInTheDocument();
    expect(screen.getByText('Arcade')).toBeInTheDocument();
    expect(screen.getByText('Prüfung')).toBeInTheDocument();
    expect(screen.getByText('Hardcore')).toBeInTheDocument();
  });

  it('switches to mode explainer on click', () => {
    const quiz = createMockQuiz();
    render(<HelpView quiz={quiz} />);

    fireEvent.click(screen.getByText('Arcade'));
    expect(screen.getByText('Demo starten')).toBeInTheDocument();
    expect(screen.getByText('Lerne in deinem Tempo — mit Sicherheitsnetz.')).toBeInTheDocument();
  });

  it('calls setIsTutorialDemoActive when demo starts', () => {
    const quiz = createMockQuiz();
    render(<HelpView quiz={quiz} />);

    fireEvent.click(screen.getByText('Hardcore'));
    fireEvent.click(screen.getByText('Demo starten'));

    expect(quiz.setIsTutorialDemoActive).toHaveBeenCalledWith(true);
  });
});
