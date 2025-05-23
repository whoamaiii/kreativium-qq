import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Waveform from './Waveform';

describe('Waveform', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders the waveform title', () => {
    render(<Waveform />);
    
    const title = screen.getByText('Audio Waveform');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('text-lg', 'font-medium', 'text-gray-300');
  });

  it('renders the listening status', () => {
    render(<Waveform />);
    
    const status = screen.getByText('Listening for audio input...');
    expect(status).toBeInTheDocument();
    expect(status).toHaveClass('text-sm', 'text-gray-400');
  });

  it('renders the SVG waveform container', () => {
    render(<Waveform />);
    
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 800 100');
  });

  it('generates waveform bars', () => {
    render(<Waveform />);
    
    // The component should generate 40 bars
    const svg = document.querySelector('svg');
    const rects = svg?.querySelectorAll('rect');
    expect(rects).toHaveLength(40);
  });

  it('applies correct container styling', () => {
    render(<Waveform />);
    
    const container = screen.getByText('Audio Waveform').closest('div');
    expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'space-y-4', 'w-full', 'max-w-2xl');
  });
}); 