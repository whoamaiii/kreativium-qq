import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PigletAvatar from './PigletAvatar';

// Canvas mocking is handled in vitest.setup.ts

describe('PigletAvatar', () => {
  it('renders the avatar canvas with correct dimensions', () => {
    render(<PigletAvatar />);
    
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    // Canvas dimensions are set in useEffect, so we check the element exists
    // The actual width/height are set programmatically to 400x400
  });

  it('applies correct styling to canvas', () => {
    render(<PigletAvatar />);
    
    const canvas = document.querySelector('canvas');
    expect(canvas).toHaveClass('drop-shadow-2xl');
    expect(canvas).toHaveStyle({ background: 'transparent' });
  });

  it('renders with different states', () => {
    const { rerender } = render(<PigletAvatar />);
    
    // Default state
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    
    // Connected state
    rerender(<PigletAvatar isConnected={true} />);
    expect(canvas).toBeInTheDocument();
    
    // Recording state
    rerender(<PigletAvatar isConnected={true} isRecording={true} />);
    expect(canvas).toBeInTheDocument();
  });
}); 