import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { HUD } from '@/components/game-menu/HUD';
import { useQuiz } from '@/hooks/useQuiz';
import type { QuizContext } from '@/hooks/useQuiz';
import type { QuizData } from '@/types/quiz';

const mockQuizData: QuizData = {
  meta: {
    titel: 'Test',
    anzahl_fragen: 3,
    bereiche: { Biologie: 3 },
  },
  fragen: [
    { id: '1', bereich: 'Biologie', frage: 'F1', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'A' },
    { id: '2', bereich: 'Biologie', frage: 'F2', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'B' },
    { id: '3', bereich: 'Biologie', frage: 'F3', antworten: { A: 'a', B: 'b', C: 'c' }, richtige_antwort: 'C' },
  ],
};

const mockMeta = {
  meta: { titel: 'Test', anzahl_fragen: 3, bereiche: { Biologie: 3 } },
  bereiche: ['Biologie'],
  bereichFiles: { 'Biologie': 'biologie.json' },
  fragenIndex: { '1': 'Biologie', '2': 'Biologie', '3': 'Biologie' },
};

const mockBereichResponse = { bereich: 'Biologie', fragen: mockQuizData.fragen };

function createFetchMock() {
  return vi.fn((url: string) => {
    if (url.includes('quiz_meta.json')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockMeta) } as Response);
    }
    if (url.includes('biologie.json')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockBereichResponse) } as Response);
    }
    return Promise.resolve({ ok: false, status: 404 } as Response);
  });
}

function createMockQuiz(overrides: Partial<QuizContext> = {}): QuizContext {
  return {
    isActive: false,
    view: 'progress',
    goToView: vi.fn(),
    statistiken: { beantwortet: 5, gesamt: 10, korrekt: 3, falsch: 2, offen: 5 },
    istGeladen: true,
    loadError: null,
    gameMode: 'exam',
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
    beendeRun: vi.fn(),
    starteQuiz: vi.fn(),
    starteFlashcards: vi.fn(),
    geladeneBereiche: [],
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

function createMockGameMenu() {
  return {
    open: vi.fn(),
    openTo: vi.fn(),
    isOpen: false,
  };
}

describe('Exam submission HUD behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should NOT show play, pause, or progress buttons on progress view after exam ends', () => {
    const quiz = createMockQuiz({ isActive: false, view: 'progress', gameMode: 'exam' });
    const gameMenu = createMockGameMenu();

    render(<HUD quiz={quiz} gameMenu={gameMenu} />);

    expect(screen.queryByLabelText('Quiz fortsetzen')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Pause')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Fortschritt')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Menü öffnen')).toBeInTheDocument();
    expect(screen.getByLabelText('Zur Startseite')).toBeInTheDocument();
  });

  it('should NOT show play button on progress view even if isActive is somehow true', () => {
    // Defensive test: even if isActive were true on progress view (shouldn't happen),
    // the play button must not appear so users can't return to the quiz after exam submission
    const quiz = createMockQuiz({ isActive: true, view: 'progress', gameMode: 'exam' });
    const gameMenu = createMockGameMenu();

    render(<HUD quiz={quiz} gameMenu={gameMenu} />);

    expect(screen.queryByLabelText('Quiz fortsetzen')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Pause')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Fortschritt')).not.toBeInTheDocument();
  });
});

describe('useQuiz beendeExam', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.stubGlobal('fetch', createFetchMock());
  });

  it('should set isActive to false and view to progress after beendeExam', async () => {
    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.istGeladen).toBe(true);
    });

    // Switch to exam mode
    act(() => {
      result.current.setGameMode('exam');
    });

    // Start exam quiz
    await act(async () => {
      await result.current.starteQuiz(['Biologie']);
    });

    await waitFor(() => {
      expect(result.current.isActive).toBe(true);
    });

    expect(result.current.view).toBe('quiz');
    expect(result.current.gameMode).toBe('exam');

    // End the exam
    act(() => {
      result.current.beendeExam();
    });

    // After beendeExam, view should be progress and isActive should be false
    expect(result.current.view).toBe('progress');
    expect(result.current.isActive).toBe(false);
  });
});
