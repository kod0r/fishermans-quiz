import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { HUD } from '@/components/game-menu/HUD';
import { MenuItem } from '@/components/game-menu/MenuItem';
import { GameMenuOverlay } from '@/components/game-menu/GameMenuOverlay';
import type { QuizContext } from '@/hooks/useQuiz';
import type { MenuPageId } from '@/hooks/useGameMenu';

/* ── Mocks ── */
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

function createMockQuiz(overrides: Partial<QuizContext> = {}): QuizContext {
  return {
    isActive: true,
    view: 'quiz',
    goToView: vi.fn(),
    statistiken: { beantwortet: 5, gesamt: 10, korrekt: 3, falsch: 2, offen: 5 },
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
    rawRun: null,
    beendeExam: vi.fn(),
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

function createMockGameMenu(overrides: Partial<{
  open: () => void;
  openTo: (page: MenuPageId) => void;
  isOpen: boolean;
}> = {}) {
  return {
    open: vi.fn(),
    openTo: vi.fn(),
    isOpen: false,
    ...overrides,
  };
}

/* ── HUD ── */

describe('HUD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all buttons when quiz is active and view is quiz', () => {
    const quiz = createMockQuiz({ isActive: true, view: 'quiz' });
    const gameMenu = createMockGameMenu();

    render(<HUD quiz={quiz} gameMenu={gameMenu} />);

    expect(screen.getByLabelText('Zur Startseite')).toBeInTheDocument();
    expect(screen.getByLabelText('Menü öffnen')).toBeInTheDocument();
    expect(screen.getByLabelText('Fortschritt')).toBeInTheDocument();
    expect(screen.getByLabelText('Quiz beenden')).toBeInTheDocument();
    expect(screen.getByText('5/10')).toBeInTheDocument();
  });

  it('does not render progress button when view is not quiz', () => {
    const quiz = createMockQuiz({ isActive: true, view: 'progress' });
    const gameMenu = createMockGameMenu();

    render(<HUD quiz={quiz} gameMenu={gameMenu} />);

    expect(screen.queryByLabelText('Fortschritt')).not.toBeInTheDocument();
  });

  it('does not render stop button or status when quiz is not active', () => {
    const quiz = createMockQuiz({ isActive: false, view: 'start' });
    const gameMenu = createMockGameMenu();

    render(<HUD quiz={quiz} gameMenu={gameMenu} />);

    expect(screen.queryByLabelText('Quiz beenden')).not.toBeInTheDocument();
    expect(screen.queryByText(/\d+\/\d+/)).not.toBeInTheDocument();
  });

  it('calls quiz.goToView("start") when home button is clicked', () => {
    const quiz = createMockQuiz({ isActive: true, view: 'quiz' });
    const gameMenu = createMockGameMenu();

    render(<HUD quiz={quiz} gameMenu={gameMenu} />);
    fireEvent.click(screen.getByLabelText('Zur Startseite'));

    expect(quiz.goToView).toHaveBeenCalledWith('start');
  });

  it('calls gameMenu.open() when menu button is clicked', () => {
    const quiz = createMockQuiz({ isActive: true, view: 'quiz' });
    const gameMenu = createMockGameMenu();

    render(<HUD quiz={quiz} gameMenu={gameMenu} />);
    fireEvent.click(screen.getByLabelText('Menü öffnen'));

    expect(gameMenu.open).toHaveBeenCalled();
  });

  it('calls gameMenu.openTo("run-actions") when stop button is clicked', () => {
    const quiz = createMockQuiz({ isActive: true, view: 'quiz' });
    const gameMenu = createMockGameMenu();

    render(<HUD quiz={quiz} gameMenu={gameMenu} />);
    fireEvent.click(screen.getByLabelText('Quiz beenden'));

    expect(gameMenu.openTo).toHaveBeenCalledWith('run-actions');
  });

  it('swipe handlers do not crash', () => {
    const quiz = createMockQuiz({ isActive: true, view: 'quiz' });
    const gameMenu = createMockGameMenu();

    const { container } = render(<HUD quiz={quiz} gameMenu={gameMenu} />);
    const hudBar = container.querySelector('[class*="fixed top-3"]');

    expect(() => {
      fireEvent.touchStart(hudBar!, { touches: [{ clientY: 100 }] });
      fireEvent.touchMove(hudBar!, { touches: [{ clientY: 50 }] });
    }).not.toThrow();
  });

  it('keyboard H toggles hidden class', () => {
    const quiz = createMockQuiz({ isActive: true, view: 'quiz' });
    const gameMenu = createMockGameMenu();

    const { container } = render(<HUD quiz={quiz} gameMenu={gameMenu} />);
    const hudBar = container.querySelector('[class*="fixed top-3"]') as HTMLElement;

    expect(hudBar.className).not.toContain('-translate-y-[calc(100%+24px)]');

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' }));
    });

    expect(hudBar.className).toContain('-translate-y-[calc(100%+24px)]');

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'H' }));
    });

    expect(hudBar.className).not.toContain('-translate-y-[calc(100%+24px)]');
  });
});

/* ── MenuItem ── */

describe('MenuItem', () => {
  it('renders label and icon', () => {
    render(<MenuItem label="Test Item" icon={<span data-testid="icon">⭐</span>} />);

    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders detail text', () => {
    render(<MenuItem label="Item" detail="Extra info" />);

    expect(screen.getByText('Extra info')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<MenuItem label="Click me" onClick={onClick} />);

    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalled();
  });

  it('applies destructive styling', () => {
    const { container } = render(<MenuItem label="Delete" destructive />);
    const button = container.querySelector('button');

    expect(button?.className).toContain('text-red-500');
  });

  it('is disabled when disabled prop is true', () => {
    const onClick = vi.fn();
    render(<MenuItem label="Disabled" disabled onClick={onClick} />);

    const button = screen.getByText('Disabled').closest('button');
    expect(button).toBeDisabled();

    fireEvent.click(button!);
    expect(onClick).not.toHaveBeenCalled();
  });
});

/* ── GameMenuOverlay ── */

describe('GameMenuOverlay', () => {
  const mockQuiz = createMockQuiz();

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <GameMenuOverlay
        isOpen={false}
        stack={['root']}
        currentPage="root"
        direction="forward"
        onClose={vi.fn()}
        onPop={vi.fn()}
        onPush={vi.fn()}
        quiz={mockQuiz}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders when isOpen is true', () => {
    render(
      <GameMenuOverlay
        isOpen={true}
        stack={['root']}
        currentPage="root"
        direction="forward"
        onClose={vi.fn()}
        onPop={vi.fn()}
        onPush={vi.fn()}
        quiz={mockQuiz}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <GameMenuOverlay
        isOpen={true}
        stack={['root']}
        currentPage="root"
        direction="forward"
        onClose={onClose}
        onPop={vi.fn()}
        onPush={vi.fn()}
        quiz={mockQuiz}
      />,
    );

    const backdrop = container.querySelector('[class*="bg-black/40"]');
    expect(backdrop).toBeInTheDocument();

    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalled();
  });
});
