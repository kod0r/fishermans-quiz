import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizCardShell } from '@/components/QuizCardShell';
import type { Frage } from '@/types/quiz';

const mockFrage: Frage = {
  id: 'f1',
  topic: 'Biologie',
  frage: 'Was ist das?',
  antworten: { A: 'Ein Fisch', B: 'Ein Vogel', C: 'Ein Baum' },
  richtige_antwort: 'A',
};

describe('QuizCardShell', () => {
  it('renders topic badge', () => {
    render(
      <QuizCardShell
        frage={mockFrage}
        aktuellerIndex={0}
        hasAnswered={false}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
      >
        <div>children</div>
      </QuizCardShell>
    );

    expect(screen.getByText('Biologie')).toBeInTheDocument();
    expect(screen.getByText('Was ist das?')).toBeInTheDocument();
    expect(screen.getByText('children')).toBeInTheDocument();
  });

  it('shows Bilderkennung badge when frage has bild', () => {
    render(
      <QuizCardShell
        frage={{ ...mockFrage, bild: 'some-image' }}
        aktuellerIndex={0}
        hasAnswered={false}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
      >
        <div>children</div>
      </QuizCardShell>
    );

    expect(screen.getByText('Bilderkennung')).toBeInTheDocument();
  });

  it('calls onToggleFavorite when star clicked', () => {
    const onToggleFavorite = vi.fn();
    render(
      <QuizCardShell
        frage={mockFrage}
        aktuellerIndex={0}
        hasAnswered={false}
        isFavorite={false}
        onToggleFavorite={onToggleFavorite}
      >
        <div>children</div>
      </QuizCardShell>
    );

    fireEvent.click(screen.getByLabelText('Zu Favoriten hinzufügen'));
    expect(onToggleFavorite).toHaveBeenCalled();
  });

  it('shows remove-favorite label when favorite', () => {
    render(
      <QuizCardShell
        frage={mockFrage}
        aktuellerIndex={0}
        hasAnswered={false}
        isFavorite={true}
        onToggleFavorite={vi.fn()}
      >
        <div>children</div>
      </QuizCardShell>
    );

    expect(screen.getByLabelText('Aus Favoriten entfernen')).toBeInTheDocument();
  });

  it('renders image with alt when bild_url provided', () => {
    render(
      <QuizCardShell
        frage={{ ...mockFrage, bild_url: '/img.png' }}
        aktuellerIndex={2}
        hasAnswered={false}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
      >
        <div>children</div>
      </QuizCardShell>
    );

    const img = screen.getByAltText('Bild zur Frage 3: Was ist das?');
    expect(img).toHaveAttribute('src', '/img.png');
  });

  it('does not show note textarea when not answered', () => {
    render(
      <QuizCardShell
        frage={mockFrage}
        aktuellerIndex={0}
        hasAnswered={false}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onNoteChange={vi.fn()}
      >
        <div>children</div>
      </QuizCardShell>
    );

    expect(screen.queryByLabelText(/Persönliche Notiz/i)).not.toBeInTheDocument();
  });

  it('shows note textarea when answered and calls onNoteChange on blur', () => {
    const onNoteChange = vi.fn();
    render(
      <QuizCardShell
        frage={mockFrage}
        aktuellerIndex={0}
        hasAnswered={true}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        note="my note"
        onNoteChange={onNoteChange}
      >
        <div>children</div>
      </QuizCardShell>
    );

    const textarea = screen.getByLabelText(/Persönliche Notiz/i);
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('my note');

    fireEvent.change(textarea, { target: { value: 'new note' } });
    fireEvent.blur(textarea);
    expect(onNoteChange).toHaveBeenCalledWith('new note');
  });
});
