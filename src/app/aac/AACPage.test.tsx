import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest'; // Import vi
import AACPage from './page'; // Assuming the component is exported as default from page.tsx

describe('AACPage Component', () => {
  it('renders the symbol grid and sentence bar', () => {
    render(<AACPage />);
    expect(screen.getByPlaceholderText('Search symbols...')).toBeInTheDocument();
    expect(screen.getByText('Core')).toBeInTheDocument(); // Category button
    expect(screen.getByText('Speak Sentence')).toBeInTheDocument(); // Speak button
  });

  it('adds a word to the sentence when a symbol is clicked', () => {
    render(<AACPage />);
    const iSymbol = screen.getByRole('button', { name: 'I' });
    fireEvent.click(iSymbol);
    
    // Check if the word is added to the sentence
    const iWord = screen.getAllByText('I')[1]; // Get the second occurrence (in the sentence)
    expect(iWord).toBeInTheDocument();

    const wantSymbol = screen.getByRole('button', { name: 'want' });
    fireEvent.click(wantSymbol);
    
    // Check if the word is added to the sentence
    const wantWord = screen.getAllByText('want')[1]; // Get the second occurrence (in the sentence)
    expect(wantWord).toBeInTheDocument();

    // Check if both are in the sentence display
    const sentenceDisplay = document.querySelector('.bg-slate-600\\/50.p-3.rounded-md');
    expect(sentenceDisplay).toHaveTextContent('I want');
  });

  it('clears the sentence when Clear Sentence button is clicked', () => {
    render(<AACPage />);
    const iSymbol = screen.getByRole('button', { name: 'I' });
    fireEvent.click(iSymbol);
    const wantSymbol = screen.getByRole('button', { name: 'want' });
    fireEvent.click(wantSymbol);

    // Verify words are in the sentence
    expect(screen.getAllByText('I')[1]).toBeInTheDocument();
    expect(screen.getAllByText('want')[1]).toBeInTheDocument();

    // Click the Clear Sentence button
    const clearButton = screen.getByText('Clear Sentence');
    fireEvent.click(clearButton);
    
    // Check that the sentence is cleared
    const sentenceDisplay = document.querySelector('.bg-slate-600\\/50.p-3.rounded-md');
    expect(sentenceDisplay).not.toHaveTextContent('I');
    expect(sentenceDisplay).not.toHaveTextContent('want');
  });

  it('speaks the sentence when the Speak Sentence button is clicked', () => {
    // Mock window.speechSynthesis
    const mockSpeak = vi.fn();
    const mockCancel = vi.fn();
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
        getVoices: () => [], // Mock getVoices to prevent errors
      },
      writable: true,
    });

    render(<AACPage />);
    const iSymbol = screen.getByRole('button', { name: 'I' });
    fireEvent.click(iSymbol);
    const wantSymbol = screen.getByRole('button', { name: 'want' });
    fireEvent.click(wantSymbol);

    const speakButton = screen.getByText('Speak Sentence');
    fireEvent.click(speakButton);

    expect(mockSpeak).toHaveBeenCalledTimes(3); // Once for each word when clicked, and once for the sentence
    expect(mockSpeak.mock.calls[2][0].text).toBe('I want'); // The third call should be for the full sentence
  });
});
