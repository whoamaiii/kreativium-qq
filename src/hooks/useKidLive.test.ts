import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useKidLive } from './useKidLive';

// Mock WebSocket
let mockWebSocketInstances: MockWebSocket[] = [];

class MockWebSocket {
  onmessage: ((event: MessageEvent) => void) | null = null;
  close = vi.fn();
  
  constructor(public url: string) {
    mockWebSocketInstances.push(this);
  }
  
  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }));
    }
  }
}

// Replace global WebSocket with mock
(global as any).WebSocket = MockWebSocket;

describe('useKidLive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWebSocketInstances = [];
  });

  it('should initialize with provided stars', () => {
    const { result } = renderHook(() => useKidLive(1, 50));
    expect(result.current.stars).toBe(50);
    expect(result.current.messages).toEqual([]);
  });

  it('should update stars when receiving stars message', () => {
    const { result } = renderHook(() => useKidLive(1, 50));
    
    // Get the WebSocket instance
    const ws = mockWebSocketInstances[0];
    
    act(() => {
      ws.simulateMessage({ type: 'stars', kidId: 1, total: 75 });
    });
    
    expect(result.current.stars).toBe(75);
  });

  it('should add feedback messages when receiving feedback', () => {
    const { result } = renderHook(() => useKidLive(1, 50));
    
    const ws = mockWebSocketInstances[0];
    const feedback = { id: 1, content: 'Great job!', role: 'assistant' };
    
    act(() => {
      ws.simulateMessage({ type: 'feedback', kidId: 1, msg: feedback });
    });
    
    expect(result.current.messages).toEqual([feedback]);
  });

  it('should ignore messages for different kidId', () => {
    const { result } = renderHook(() => useKidLive(1, 50));
    
    const ws = mockWebSocketInstances[0];
    
    act(() => {
      ws.simulateMessage({ type: 'stars', kidId: 2, total: 100 });
    });
    
    expect(result.current.stars).toBe(50); // Unchanged
  });

  it('should close WebSocket on unmount', () => {
    const { unmount } = renderHook(() => useKidLive(1, 50));
    const ws = mockWebSocketInstances[0];
    
    unmount();
    
    expect(ws.close).toHaveBeenCalled();
  });
}); 