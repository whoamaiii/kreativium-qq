import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useGeminiLive } from './useGeminiLive';

// Mock fetch
global.fetch = vi.fn();

// Mock WebSocket
class MockWebSocket {
  url: string;
  readyState = 0; // WebSocket.CONNECTING
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      this.readyState = 1; // WebSocket.OPEN
      this.onopen?.(new Event('open'));
    }, 0);
  }

  send = vi.fn();
  close = vi.fn(() => {
    this.readyState = 3; // WebSocket.CLOSED
    this.onclose?.(new CloseEvent('close'));
  });

  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
}

// @ts-ignore
global.WebSocket = MockWebSocket;

// Mock MediaRecorder
class MockMediaRecorder {
  ondataavailable: ((event: BlobEvent) => void) | null = null;
  state = 'inactive';

  constructor(stream: MediaStream, options?: MediaRecorderOptions) {}

  start = vi.fn(() => {
    this.state = 'recording';
  });

  stop = vi.fn(() => {
    this.state = 'inactive';
  });

  static isTypeSupported = vi.fn(() => true);
}

// @ts-ignore
global.MediaRecorder = MockMediaRecorder;

// Mock getUserMedia
const mockGetUserMedia = vi.fn();
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true,
});

describe('useGeminiLive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful fetch response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ apiKey: 'test-api-key' }),
    });

    // Mock successful media stream
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with disconnected state', () => {
    const { result } = renderHook(() => useGeminiLive());
    
    expect(result.current.connectionState).toBe('disconnected');
    expect(result.current.isRecording).toBe(false);
  });

  it('connects to WebSocket successfully', async () => {
    const onStateChange = vi.fn();
    const { result } = renderHook(() => useGeminiLive({ onStateChange }));
    
    await act(async () => {
      await result.current.connect();
    });
    
    expect(onStateChange).toHaveBeenCalledWith('connecting');
    expect(onStateChange).toHaveBeenCalledWith('connected');
    expect(result.current.connectionState).toBe('connected');
  });

  it('handles connection errors', async () => {
    const onError = vi.fn();
    (global.fetch as any).mockRejectedValue(new Error('API key fetch failed'));
    
    const { result } = renderHook(() => useGeminiLive({ onError }));
    
    await act(async () => {
      await result.current.connect();
    });
    
    expect(onError).toHaveBeenCalled();
    expect(result.current.connectionState).toBe('error');
  });

  it('starts and stops recording', async () => {
    const { result } = renderHook(() => useGeminiLive());
    
    // First connect
    await act(async () => {
      await result.current.connect();
    });
    
    // Start recording
    await act(async () => {
      await result.current.startRecording();
    });
    
    expect(mockGetUserMedia).toHaveBeenCalled();
    expect(result.current.isRecording).toBe(true);
    
    // Stop recording
    act(() => {
      result.current.stopRecording();
    });
    
    expect(result.current.isRecording).toBe(false);
  });

  it('handles message callbacks', async () => {
    const onMessage = vi.fn();
    const { result } = renderHook(() => useGeminiLive({ onMessage }));
    
    await act(async () => {
      await result.current.connect();
    });
    
    // Simulate WebSocket message
    const mockMessage = {
      data: JSON.stringify({
        serverContent: {
          modelTurn: {
            parts: [
              {
                text: 'Hello from Gemini!',
              },
            ],
          },
        },
      }),
    };
    
    // Access the mock WebSocket instance
    const ws = (global.WebSocket as any).mock.instances[0];
    
    act(() => {
      ws.onmessage?.(mockMessage);
    });
    
    expect(onMessage).toHaveBeenCalledWith({
      type: 'text',
      content: 'Hello from Gemini!',
    });
  });

  it('disconnects properly', async () => {
    const { result } = renderHook(() => useGeminiLive());
    
    await act(async () => {
      await result.current.connect();
    });
    
    expect(result.current.connectionState).toBe('connected');
    
    act(() => {
      result.current.disconnect();
    });
    
    expect(result.current.connectionState).toBe('disconnected');
  });
}); 