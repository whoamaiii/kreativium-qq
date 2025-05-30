import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useKidLive } from './useKidLive';

// Mock Socket.IO
const mockSocket = {
  emit: vi.fn(),
  on: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock('socket.io-client', () => ({
  default: vi.fn(() => mockSocket),
  io: vi.fn(() => mockSocket),
}));

describe('useKidLive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the on handlers
    mockSocket.on.mockClear();
  });

  it('should initialize with provided stars', () => {
    const { result } = renderHook(() => useKidLive(1, 50));
    expect(result.current.stars).toBe(50);
    expect(result.current.messages).toEqual([]);
  });

  it('should update stars when receiving stars message', () => {
    const { result } = renderHook(() => useKidLive(1, 50));
    
    // Get the stars-update handler that was registered
    const starsHandler = mockSocket.on.mock.calls.find(call => call[0] === 'stars-update')?.[1];
    
    act(() => {
      starsHandler?.({ kidId: 1, total: 75 });
    });
    
    expect(result.current.stars).toBe(75);
  });

  it('should add feedback messages when receiving feedback', () => {
    const { result } = renderHook(() => useKidLive(1, 50));
    
    // Get the feedback-update handler that was registered
    const feedbackHandler = mockSocket.on.mock.calls.find(call => call[0] === 'feedback-update')?.[1];
    const message = { id: '1', content: 'Great job!', role: 'assistant', createdAt: new Date().toISOString() };
    
    act(() => {
      feedbackHandler?.({ kidId: 1, message });
    });
    
    expect(result.current.messages).toEqual([message]);
  });

  it('should ignore messages for different kidId', () => {
    const { result } = renderHook(() => useKidLive(1, 50));
    
    // Get the stars-update handler that was registered
    const starsHandler = mockSocket.on.mock.calls.find(call => call[0] === 'stars-update')?.[1];
    
    act(() => {
      starsHandler?.({ kidId: 2, total: 100 });
    });
    
    expect(result.current.stars).toBe(50); // Unchanged
  });

  it('should close WebSocket on unmount', () => {
    const { unmount } = renderHook(() => useKidLive(1, 50));
    
    unmount();
    
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
}); 