import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PigletAvatar from './PigletAvatar';

// Mock canvas getContext method
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    set fillStyle(value: string | CanvasGradient | CanvasPattern) {},
    set strokeStyle(value: string | CanvasGradient | CanvasPattern) {},
    set lineWidth(value: number) {},
    set font(value: string) {},
    set textAlign(value: CanvasTextAlign) {},
  })),
});

describe('PigletAvatar', () => {
  it('renders the avatar canvas', () => {
    render(<PigletAvatar />);
    
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('width', '300');
    expect(canvas).toHaveAttribute('height', '200');
  });

  it('renders the title', () => {
    render(<PigletAvatar />);
    
    const title = screen.getByText('PigletChat AI');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('text-xl', 'font-semibold', 'text-gray-300');
  });

  it('applies correct styling to canvas', () => {
    render(<PigletAvatar />);
    
    const canvas = document.querySelector('canvas');
    expect(canvas).toHaveClass('border', 'border-gray-600', 'rounded-lg', 'bg-gray-800');
  });
}); 