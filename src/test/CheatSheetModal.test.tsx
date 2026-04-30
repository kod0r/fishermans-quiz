import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CheatSheetModal } from '@/components/CheatSheetModal';

describe('CheatSheetModal', () => {
  it('renders shortcuts when open', () => {
    render(<CheatSheetModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Select answer')).toBeInTheDocument();
    expect(screen.getByText('Previous question')).toBeInTheDocument();
    expect(screen.getByText('Next question')).toBeInTheDocument();
    expect(screen.getByText('Reveal answer (flashcard)')).toBeInTheDocument();
    expect(screen.getByText('Toggle favorite')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(<CheatSheetModal open={false} onOpenChange={() => {}} />);

    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
  });
});
