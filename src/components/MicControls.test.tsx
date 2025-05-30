import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MicControls from './MicControls';

// Mock console.log to avoid test output noise
vi.spyOn(console, 'log').mockImplementation(() => {});

// Mock window.confirm
global.confirm = vi.fn(() => true);

describe('MicControls', () => {
  it('renders all control buttons', () => {
    render(<MicControls />);
    
    const resetButton = screen.getByTitle('Reset');
    const startButton = screen.getByTitle('Start Live Chat');
    const infoButton = screen.getByTitle('Info');
    
    expect(resetButton).toBeInTheDocument();
    expect(startButton).toBeInTheDocument();
    expect(infoButton).toBeInTheDocument();
    expect(infoButton).toBeDisabled(); // Info button is always disabled
  });

  it('displays initial status correctly', () => {
    render(<MicControls />);
    
    const status = screen.getByText('Not connected');
    expect(status).toBeInTheDocument();
  });

  it('calls onStartLiveChat when start button is clicked', () => {
    const mockStartLiveChat = vi.fn();
    render(<MicControls onStartLiveChat={mockStartLiveChat} />);
    
    const startButton = screen.getByTitle('Start Live Chat');
    fireEvent.click(startButton);
    
    expect(mockStartLiveChat).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('[MicControls] Starting live chat (will auto-connect)');
  });

  it('shows stop button and calls onStopLiveChat when active', () => {
    const mockStopLiveChat = vi.fn();
    render(<MicControls isLiveChatActive={true} onStopLiveChat={mockStopLiveChat} />);
    
    const stopButton = screen.getByTitle('Stop Live Chat');
    expect(stopButton).toBeInTheDocument();
    
    fireEvent.click(stopButton);
    
    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to stop the live chat?');
    expect(mockStopLiveChat).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('[MicControls] Stopping live chat (confirmed)');
  });

  it('calls onReset when reset button is clicked', () => {
    const mockReset = vi.fn();
    render(<MicControls onReset={mockReset} />);
    
    const resetButton = screen.getByTitle('Reset');
    fireEvent.click(resetButton);
    
    expect(mockReset).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('[MicControls] Reset triggered via onReset prop');
  });

  it('disables reset button when live chat is active', () => {
    render(<MicControls isLiveChatActive={true} />);
    
    const resetButton = screen.getByTitle('Reset');
    expect(resetButton).toBeDisabled();
  });

  it('shows correct status based on connection and recording state', () => {
    const { rerender } = render(<MicControls />);
    expect(screen.getByText('Not connected')).toBeInTheDocument();
    
    rerender(<MicControls isConnected={true} />);
    expect(screen.getByText('Ready for live chat')).toBeInTheDocument();
    
    rerender(<MicControls isLiveChatActive={true} />);
    expect(screen.getByText('Live chat starting...')).toBeInTheDocument();
    
    rerender(<MicControls isLiveChatActive={true} isRecording={true} />);
    expect(screen.getByText('🔴 LIVE CHAT ACTIVE 🎙️')).toBeInTheDocument();
  });
});