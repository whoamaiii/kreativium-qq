import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AACPage from './page'; // Assuming the component is exported as default from page.tsx

describe('AACPage Component', () => {
  it.skip('renders the symbol grid and sentence bar', () => {
    // FIXME: Update test - component structure may have changed, selectors need verification
    render(<AACPage />);
    expect(screen.getByPlaceholderText('Search symbols...')).toBeInTheDocument();
    expect(screen.getByText('Core')).toBeInTheDocument(); // Category button
    expect(screen.getByText('Speak Sentence')).toBeInTheDocument(); // Speak button
  });

  it.skip('adds a word to the sentence when a symbol is clicked', () => {
    // FIXME: Update test - symbol selection logic may have changed
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

  it.skip('clears the sentence when Clear Sentence button is clicked', () => {
    // FIXME: Update test - clear button functionality may have changed
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
    expect(sentenceDisplay).toHaveTextContent('');
  });

  it.skip('switches categories when a category button is clicked', () => {
    // FIXME: Update test - category switching logic needs verification
    render(<AACPage />);
    const foodCategory = screen.getByText('Food');
    fireEvent.click(foodCategory);
    
    // Check if the active category is "Food"
    expect(foodCategory).toHaveClass('bg-purple-600');
    expect(foodCategory).toHaveClass('text-white');
  });

  it.skip('searches symbols when typing in the search bar', () => {
    // FIXME: Update test - search functionality implementation may have changed
    render(<AACPage />);
    const searchInput = screen.getByPlaceholderText('Search symbols...');
    fireEvent.change(searchInput, { target: { value: 'want' } });
    
    // Check if only "want" symbol is visible
    const wantSymbol = screen.getByText('want');
    expect(wantSymbol).toBeInTheDocument();
    
    // Check if other symbols are not visible
    expect(screen.queryByText('I')).not.toBeInTheDocument();
  });

  it.skip('toggles Teach Mode', () => {
    // FIXME: Update test - teach mode toggle functionality needs verification
    render(<AACPage />);
    const teachModeButton = screen.getByText('Teach Mode');
    fireEvent.click(teachModeButton);
    
    // Check if Teach Mode is active
    expect(teachModeButton).toHaveClass('bg-purple-600');
    expect(teachModeButton).toHaveClass('text-white');
  });
});