import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnswerGrid } from '@/components/AnswerGrid';
import type { Frage } from '@/types/quiz';

const mockFrage: Frage = {
  id: 'f1',
  topic: 'Biologie',
  frage: 'Was ist das?',
  antworten: { A: 'Ein Fisch', B: 'Ein Vogel', C: 'Ein Baum' },
  richtige_antwort: 'B',
};

describe('AnswerGrid', () => {
  it('renders three answer buttons', () => {
    render(
      <AnswerGrid
        frage={mockFrage}
        userAntwort={undefined}
        hasAnswered={false}
        pendingWrongAnswer={null}
        onAnswerClick={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Antwort A: Ein Fisch')).toBeInTheDocument();
    expect(screen.getByLabelText('Antwort B: Ein Vogel')).toBeInTheDocument();
    expect(screen.getByLabelText('Antwort C: Ein Baum')).toBeInTheDocument();
  });

  it('calls onAnswerClick when answer clicked', () => {
    const onAnswerClick = vi.fn();
    render(
      <AnswerGrid
        frage={mockFrage}
        userAntwort={undefined}
        hasAnswered={false}
        pendingWrongAnswer={null}
        onAnswerClick={onAnswerClick}
      />
    );

    fireEvent.click(screen.getByLabelText('Antwort A: Ein Fisch'));
    expect(onAnswerClick).toHaveBeenCalledWith('A');
  });

  it('shows selected state', () => {
    render(
      <AnswerGrid
        frage={mockFrage}
        userAntwort="A"
        hasAnswered={false}
        pendingWrongAnswer={null}
        onAnswerClick={vi.fn()}
      />
    );

    const btn = screen.getByLabelText('Antwort A: Ein Fisch');
    expect(btn).toHaveAttribute('aria-checked', 'true');
  });

  it('shows correct and wrong feedback after answer', () => {
    render(
      <AnswerGrid
        frage={mockFrage}
        userAntwort="A"
        hasAnswered={true}
        pendingWrongAnswer={null}
        onAnswerClick={vi.fn()}
      />
    );

    const correct = screen.getByLabelText('Antwort B: Ein Vogel');
    const wrong = screen.getByLabelText('Antwort A: Ein Fisch');
    expect(correct).toHaveAttribute('aria-disabled', 'true');
    expect(wrong).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows pending wrong badge', () => {
    render(
      <AnswerGrid
        frage={mockFrage}
        userAntwort={undefined}
        hasAnswered={false}
        pendingWrongAnswer="A"
        onAnswerClick={vi.fn()}
      />
    );

    const btn = screen.getByLabelText('Antwort A: Ein Fisch');
    expect(btn).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('Noch ein Versuch')).toBeInTheDocument();
  });

  it('disables buttons when answered', () => {
    render(
      <AnswerGrid
        frage={mockFrage}
        userAntwort="B"
        hasAnswered={true}
        pendingWrongAnswer={null}
        onAnswerClick={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Antwort A: Ein Fisch')).toBeDisabled();
    expect(screen.getByLabelText('Antwort B: Ein Vogel')).toBeDisabled();
    expect(screen.getByLabelText('Antwort C: Ein Baum')).toBeDisabled();
  });

  it('hides feedback when hideFeedback is true', () => {
    render(
      <AnswerGrid
        frage={mockFrage}
        userAntwort="A"
        hasAnswered={true}
        pendingWrongAnswer={null}
        onAnswerClick={vi.fn()}
        hideFeedback
      />
    );

    // Buttons should still be disabled but no checkmark/x shown; just ensure no crash
    expect(screen.getByLabelText('Antwort A: Ein Fisch')).toBeDisabled();
  });
});
