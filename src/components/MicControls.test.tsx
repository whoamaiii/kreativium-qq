import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MicControls from './MicControls';

// Mock console.log to avoid test output noise
vi.spyOn(console, 'log').mockImplementation(() => {});

describe('MicControls', () => {
  it('renders all control buttons', () => {
    render(<MicControls />);
    
    const resetButton = screen.getByTitle('Reset');
    const recordButton = screen.getByTitle('Record');
    const stopButton = screen.getByTitle('Stop');
    
    expect(resetButton).toBeInTheDocument();
    expect(recordButton).toBeInTheDocument();
    expect(stopButton).toBeInTheDocument();
  });

  it('displays initial status correctly', () => {
    render(<MicControls />);
    
    const status = screen.getByText('Ready to record');
    expect(status).toBeInTheDocument();
    expect(status).toHaveClass('text-gray-300');
  });

  it('starts recording when record button is clicked', () => {
    render(<MicControls />);
    
    const recordButton = screen.getByTitle('Record');
    fireEvent.click(recordButton);
    
    const status = screen.getByText('Recording...');
    expect(status).toBeInTheDocument();
    expect(status).toHaveClass('text-red-400');
    expect(console.log).toHaveBeenCalledWith('Recording started');
  });

  it('stops recording when stop button is clicked during recording', () => {
    render(<MicControls />);
    
    // Start recording first
    const recordButton = screen.getByTitle('Record');
    fireEvent.click(recordButton);
    
    // Then stop
    const stopButton = screen.getByTitle('Stop');
    fireEvent.click(stopButton);
    
    const status = screen.getByText('Recording stopped');
    expect(status).toBeInTheDocument();
    expect(status).toHaveClass('text-green-400');
    expect(console.log).toHaveBeenCalledWith('Recording stopped');
  });

  it('resets to idle state when reset button is clicked', () => {
    render(<MicControls />);
    
    // Start and stop recording to get to stopped state
    const recordButton = screen.getByTitle('Record');
    const stopButton = screen.getByTitle('Stop');
    const resetButton = screen.getByTitle('Reset');
    
    fireEvent.click(recordButton);
    fireEvent.click(stopButton);
    fireEvent.click(resetButton);
    
    const status = screen.getByText('Ready to record');
    expect(status).toBeInTheDocument();
    expect(console.log).toHaveBeenCalledWith('Reset triggered');
  });

  it('disables buttons appropriately based on state', () => {
    render(<MicControls />);
    
    const resetButton = screen.getByTitle('Reset');
    const recordButton = screen.getByTitle('Record');
    const stopButton = screen.getByTitle('Stop');
    
    // Initial state: reset and stop should be disabled
    expect(resetButton).toBeDisabled();
    expect(stopButton).toBeDisabled();
    expect(recordButton).not.toBeDisabled();
    
    // Recording state: record should be disabled, stop enabled
    fireEvent.click(recordButton);
    expect(recordButton).toBeDisabled();
    expect(stopButton).not.toBeDisabled();
    expect(resetButton).not.toBeDisabled();
  });
}); 