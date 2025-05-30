import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AACPage from './page'; // Assuming the component is exported as default from page.tsx

// Mock window.speechSynthesis
const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => []),
  speaking: false,
  pending: false,
  onvoiceschanged: null,
};

// @ts-ignore
global.window.speechSynthesis = mockSpeechSynthesis;

// Mock SpeechSynthesisUtterance
// @ts-ignore
global.SpeechSynthesisUtterance = vi.fn().mockImplementation((text) => {
  return { text }; // Return a simple object, or more properties if needed by the component
});

// Clear mocks before each test
beforeEach(() => {
  mockSpeechSynthesis.speak.mockClear();
  mockSpeechSynthesis.cancel.mockClear();
  // @ts-ignore
  global.SpeechSynthesisUtterance.mockClear();
});

describe('AACPage Component', () => {
  it('renders the symbol grid and sentence bar', () => {
    render(<AACPage />);
    expect(screen.getByPlaceholderText('Search symbols...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Core' })).toBeInTheDocument(); // Category button
    // Speak Sentence button is initially not visible until sentence has words
    expect(screen.queryByRole('button', { name: 'Speak Sentence' })).not.toBeInTheDocument();
  });

  it('adds a word to the sentence when a symbol is clicked', () => {
    render(<AACPage />);
    const iSymbol = screen.getByRole('button', { name: 'word I' });
    fireEvent.click(iSymbol);
    
    // Check if the word "I" is added to the sentence
    // The sentence words are spans with the word as text content
    expect(screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'span' && content === 'I' && element.closest('footer') !== null;
    })).toBeInTheDocument();

    const wantSymbol = screen.getByRole('button', { name: 'word want' });
    fireEvent.click(wantSymbol);
    
    // Check if the word "want" is added to the sentence
    expect(screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'span' && content === 'want' && element.closest('footer') !== null;
    })).toBeInTheDocument();

    // Check if Speak Sentence button is now visible
    expect(screen.getByRole('button', { name: 'Speak Sentence' })).toBeInTheDocument();
  });

  it('clears the sentence when Clear Sentence button is clicked', () => {
    render(<AACPage />);
    const iSymbol = screen.getByRole('button', { name: 'word I' });
    fireEvent.click(iSymbol);
    const wantSymbol = screen.getByRole('button', { name: 'word want' });
    fireEvent.click(wantSymbol);

    // Verify words are in the sentence
    expect(screen.getByText((content, element) => element?.tagName.toLowerCase() === 'span' && content === 'I' && element.closest('footer') !== null)).toBeInTheDocument();
    expect(screen.getByText((content, element) => element?.tagName.toLowerCase() === 'span' && content === 'want' && element.closest('footer') !== null)).toBeInTheDocument();
    
    // Click the Clear Sentence button (it should now be visible)
    const clearButton = screen.getByRole('button', { name: 'Clear Sentence' });
    fireEvent.click(clearButton);
    
    // Check that the sentence is cleared (no span words in footer)
    expect(screen.queryByText((content, element) => element?.tagName.toLowerCase() === 'span' && content === 'I' && element.closest('footer') !== null)).not.toBeInTheDocument();
    expect(screen.queryByText((content, element) => element?.tagName.toLowerCase() === 'span' && content === 'want' && element.closest('footer') !== null)).not.toBeInTheDocument();
    // Speak and Clear buttons should also disappear
    expect(screen.queryByRole('button', { name: 'Speak Sentence' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear Sentence' })).not.toBeInTheDocument();
  });

  it('switches categories when a category button is clicked', () => {
    render(<AACPage />);
    const foodCategoryButton = screen.getByRole('button', { name: 'Food' });
    fireEvent.click(foodCategoryButton);
    
    // Check if the active category is "Food"
    expect(foodCategoryButton).toHaveClass('bg-purple-600');
    expect(foodCategoryButton).toHaveClass('text-white');

    // Check if a symbol from Food category is visible
    expect(screen.getByRole('button', { name: 'word Apple' })).toBeInTheDocument();
    // Check if a symbol from Core category is NOT visible
    expect(screen.queryByRole('button', { name: 'word I' })).not.toBeInTheDocument();
  });

  it('searches symbols when typing in the search bar', () => {
    render(<AACPage />);
    const searchInput = screen.getByPlaceholderText('Search symbols...');
    fireEvent.change(searchInput, { target: { value: 'want' } });
    
    // Check if only "want" symbol is visible
    expect(screen.getByRole('button', { name: 'word want' })).toBeInTheDocument();
    
    // Check if other symbols from "Core" category are not visible
    expect(screen.queryByRole('button', { name: 'word I' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'word eat' })).not.toBeInTheDocument();
  });

  it('toggles Teach Mode and changes button text', () => {
    render(<AACPage />);
    const teachModeButton = screen.getByRole('button', { name: 'Teach Mode' });
    expect(teachModeButton).toBeInTheDocument();
    
    fireEvent.click(teachModeButton);
    
    // Check if Teach Mode is active by looking for the "User Mode" button text
    // and the Teach Mode sidebar title
    expect(screen.getByRole('button', { name: 'User Mode' })).toBeInTheDocument();
    expect(screen.getByText('Teach Mode – Edit Symbol')).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: 'User Mode' }));
    // Check if Teach Mode is inactive
    expect(screen.getByRole('button', { name: 'Teach Mode' })).toBeInTheDocument();
    expect(screen.queryByText('Teach Mode – Edit Symbol')).not.toBeInTheDocument();
  });
});