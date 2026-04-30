import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizFooter } from '@/components/QuizFooter';

describe('QuizFooter', () => {
  it('prev disabled at index 0', () => {
    render(
      <QuizFooter
        aktuellerIndex={0}
        totalFragen={5}
        isPending={false}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Vorherige Frage')).toBeDisabled();
    expect(screen.getByLabelText('Nächste Frage')).not.toBeDisabled();
  });

  it('next disabled at last index', () => {
    render(
      <QuizFooter
        aktuellerIndex={4}
        totalFragen={5}
        isPending={false}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Nächste Frage')).toBeDisabled();
    expect(screen.getByLabelText('Vorherige Frage')).not.toBeDisabled();
  });

  it('both disabled when pending', () => {
    render(
      <QuizFooter
        aktuellerIndex={2}
        totalFragen={5}
        isPending={true}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Vorherige Frage')).toBeDisabled();
    expect(screen.getByLabelText('Nächste Frage')).toBeDisabled();
  });

  it('calls onPrev and onNext when clicked', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    render(
      <QuizFooter
        aktuellerIndex={2}
        totalFragen={5}
        isPending={false}
        onPrev={onPrev}
        onNext={onNext}
      />
    );

    fireEvent.click(screen.getByLabelText('Vorherige Frage'));
    expect(onPrev).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Nächste Frage'));
    expect(onNext).toHaveBeenCalled();
  });
});
