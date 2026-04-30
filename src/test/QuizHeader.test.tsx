import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuizHeader } from '@/components/QuizHeader';

describe('QuizHeader', () => {
  it('renders arcade badge', () => {
    render(
      <QuizHeader
        gameMode="arcade"
        korrekt={1}
        falsch={2}
        offen={3}
        aktuellerIndex={0}
        totalFragen={5}
      />
    );

    expect(screen.getByText('Arcade')).toBeInTheDocument();
  });

  it('renders exam badge', () => {
    render(
      <QuizHeader
        gameMode="exam"
        korrekt={0}
        falsch={0}
        offen={10}
        aktuellerIndex={0}
        totalFragen={10}
      />
    );

    expect(screen.getByText('Prüfung')).toBeInTheDocument();
  });

  it('renders hardcore badge', () => {
    render(
      <QuizHeader
        gameMode="hardcore"
        korrekt={0}
        falsch={0}
        offen={0}
        aktuellerIndex={0}
        totalFragen={1}
      />
    );

    expect(screen.getByText('Hardcore')).toBeInTheDocument();
  });

  it('shows stats with correct aria-label', () => {
    render(
      <QuizHeader
        gameMode="arcade"
        korrekt={2}
        falsch={1}
        offen={3}
        aktuellerIndex={1}
        totalFragen={6}
      />
    );

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-label', '2 richtig, 1 falsch, 3 offen');
  });

  it('shows timer when remainingSeconds provided', () => {
    render(
      <QuizHeader
        gameMode="exam"
        korrekt={0}
        falsch={0}
        offen={5}
        aktuellerIndex={0}
        totalFragen={5}
        remainingSeconds={620}
      />
    );

    expect(screen.getByText('10:20')).toBeInTheDocument();
  });

  it('shows red timer when under 5 minutes', () => {
    render(
      <QuizHeader
        gameMode="exam"
        korrekt={0}
        falsch={0}
        offen={5}
        aktuellerIndex={0}
        totalFragen={5}
        remainingSeconds={299}
      />
    );

    const timer = screen.getByText('04:59');
    expect(timer).toHaveClass('text-red-400');
  });

  it('progress bar indicator reflects 50%', () => {
    render(
      <QuizHeader
        gameMode="arcade"
        korrekt={0}
        falsch={0}
        offen={2}
        aktuellerIndex={0}
        totalFragen={2}
      />
    );

    const indicator = document.querySelector('[data-slot="progress-indicator"]');
    expect(indicator).toHaveStyle({ transform: 'translateX(-50%)' });
  });

  it('handles zero totalFragen gracefully', () => {
    render(
      <QuizHeader
        gameMode="arcade"
        korrekt={0}
        falsch={0}
        offen={0}
        aktuellerIndex={0}
        totalFragen={0}
      />
    );

    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '0');
  });
});
