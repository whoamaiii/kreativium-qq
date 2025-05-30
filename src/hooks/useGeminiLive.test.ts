import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create mock session and connection function outside to reference later
const mockSession = {
  close: vi.fn(),
  sendRealtimeInput: vi.fn(),
  sendClientContent: vi.fn(),
  onReceive: vi.fn(),
};

let capturedLiveConnectCallbacks: any = {}; // Store captured callbacks here

const mockLiveConnect = vi.fn().mockImplementation(async (options) => {
  await Promise.resolve(); 
  if (options && options.callbacks) {
    capturedLiveConnectCallbacks = options.callbacks; // Capture callbacks
    if (typeof options.callbacks.onopen === 'function') {
      options.callbacks.onopen();
    }
  }
  return mockSession;
});

// Mock @google/genai before importing the hook
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    live: {
      connect: mockLiveConnect,
    },
  })),
  Modality: {
    AUDIO: 'AUDIO',
  },
}));

// Mock audio utilities
vi.mock('@/utils/audio', () => ({
  decodeAudioData: vi.fn().mockResolvedValue({
    duration: 1.0,
    sampleRate: 24000,
    numberOfChannels: 1,
  }),
  decode: vi.fn().mockReturnValue(new ArrayBuffer(1024)),
  encodeAudioData: vi.fn().mockReturnValue('base64encodedaudio'),
}));

import { useGeminiLive } from './useGeminiLive';

// Mock fetch
global.fetch = vi.fn();

// Define original secure context for potential restoration
let originalIsSecureContext: boolean | undefined;

// Mock AudioContext
class ActualMockAudioContext {
  sampleRate = 24000;
  currentTime = 0;
  state = 'running';
  createMediaStreamSource = vi.fn().mockReturnValue({ connect: vi.fn(), disconnect: vi.fn() });
  createScriptProcessor = vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    onaudioprocess: null,
  });
  createBufferSource = vi.fn().mockReturnValue({
    buffer: null,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
  createBuffer = vi.fn().mockReturnValue({
    copyToChannel: vi.fn(),
    getChannelData: vi.fn(),
    duration: 1.0,
    sampleRate: 24000,
    numberOfChannels: 1,
    length: 1024,
  });
  decodeAudioData = vi.fn().mockResolvedValue({
    duration: 1.0,
    sampleRate: 24000,
    numberOfChannels: 1,
  });
  destination = {};
  close = vi.fn();
  suspend = vi.fn();
  resume = vi.fn();
  createMediaStreamDestination = vi.fn().mockReturnValue({
    stream: { getTracks: () => [] },
  });
  createAnalyser = vi.fn().mockReturnValue({
    fftSize: 2048,
    frequencyBinCount: 1024,
    getByteFrequencyData: vi.fn(),
    connect: vi.fn(),
  });
  createGain = vi.fn().mockReturnValue({
    gain: { value: 1 },
    connect: vi.fn(),
  });
  audioWorklet = {
    addModule: vi.fn().mockResolvedValue(undefined),
  };
  constructor(...args: any[]) {
    if (args[0] && typeof args[0].sampleRate === 'number') {
      this.sampleRate = args[0].sampleRate;
    }
  }
}

// Mock AudioWorkletNode
class ActualMockAudioWorkletNode {
  port = {
    onmessage: null as ((event: MessageEvent) => void) | null,
    postMessage: vi.fn(),
  };
  connect = vi.fn();
  disconnect = vi.fn();
  constructor(_context?: any, _name?: string, _options?: any) {
    // Mock AudioWorkletNode constructor
  }
}

// @ts-expect-error - Mock AudioContext for testing
global.AudioContext = vi.fn((...args) => new ActualMockAudioContext(...args));
// @ts-expect-error - Mock webkitAudioContext for testing
global.webkitAudioContext = global.AudioContext;
// @ts-expect-error - Mock AudioWorkletNode for testing
global.AudioWorkletNode = vi.fn((...args) => new ActualMockAudioWorkletNode(...args));

// Mock getUserMedia
const mockGetUserMedia = vi.fn();
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true,
});

// Mock File constructor properly
class MockFile extends Blob {
  name: string;
  lastModified: number;
  webkitRelativePath: string;
  
  constructor(chunks: BlobPart[], filename: string, options?: FilePropertyBag) {
    super(chunks, options);
    this.name = filename;
    this.lastModified = options?.lastModified || Date.now();
    this.webkitRelativePath = '';
  }
}

// @ts-expect-error - Mock File for testing
global.File = MockFile as any;

describe('useGeminiLive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.isSecureContext to true for these tests
    originalIsSecureContext = window.isSecureContext;
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      configurable: true,
      writable: true
    });
    
    // Reset mock implementations
    mockSession.close.mockClear();
    mockSession.sendRealtimeInput.mockClear();
    mockSession.sendClientContent.mockClear();
    mockLiveConnect.mockClear();
    
    // Mock successful fetch response with proper Response implementation
    const mockResponse = new Response(JSON.stringify({ apiKey: 'test-api-key' }), {
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
    
    // Override json and text methods to return our test data
    mockResponse.json = vi.fn().mockResolvedValue({ apiKey: 'test-api-key' });
    mockResponse.text = vi.fn().mockResolvedValue('test-api-key');
    
    vi.mocked(global.fetch).mockResolvedValue(mockResponse);

    // Mock getUserMedia
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Restore original isSecureContext
    if (originalIsSecureContext !== undefined) {
      Object.defineProperty(window, 'isSecureContext', {
        value: originalIsSecureContext,
        configurable: true,
        writable: true
      });
    }
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useGeminiLive());

    expect(result.current.connectionState).toBe('disconnected');
    expect(result.current.isRecording).toBe(false);
  });

  it('connects to Gemini Live successfully', async () => {
    const { result } = renderHook(() => useGeminiLive());

    await act(async () => {
      await result.current.connect();
    });

    expect(mockLiveConnect).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gemini-2.5-flash-preview-native-audio-dialog',
      })
    );
    expect(result.current.connectionState).toBe('connected');
  });

  it('handles connection errors', async () => {
    const { result } = renderHook(() => useGeminiLive());
    
    // Mock fetch to fail
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('API key fetch failed'));

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.connectionState).toBe('error');
  });

  it('initializes audio contexts on connect', async () => {
    const { result } = renderHook(() => useGeminiLive());

    await act(async () => {
      await result.current.connect();
    });

    // Wait for connection state to update
    await vi.waitFor(() => expect(result.current.connectionState).toBe('connected'));

    // The hook should have created audio contexts internally.
    // Check if our MockAudioContext constructor was called.
    // initAudio creates two contexts: input (16kHz) and output (24kHz).
    expect(global.AudioContext).toHaveBeenCalledTimes(2);
    expect(global.AudioContext).toHaveBeenCalledWith({ sampleRate: 16000 });
    expect(global.AudioContext).toHaveBeenCalledWith({ sampleRate: 24000 });
  });

  it('starts and stops recording', async () => {
    const { result } = renderHook(() => useGeminiLive());

    // Connect first
    await act(async () => {
      await result.current.connect();
    });
    
    // Wait for connection to be established
    await vi.waitFor(() => expect(result.current.connectionState).toBe('connected'));

    // Start recording
    await act(async () => {
      await result.current.startRecording();
    });

    const expectedAudioConstraints = {
      sampleRate: 16000,
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };
    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: expectedAudioConstraints, video: false });
    expect(result.current.isRecording).toBe(true);

    // Stop recording
    act(() => {
      result.current.stopRecording();
    });

    expect(result.current.isRecording).toBe(false);
  });

  it('handles session callbacks', async () => {
    const mockOnMessage = vi.fn();
    const mockOnError = vi.fn();
    const mockOnStateChange = vi.fn();

    const { result } = renderHook(() => 
      useGeminiLive({ 
        onMessage: mockOnMessage, 
        onError: mockOnError, 
        onStateChange: mockOnStateChange 
      })
    );

    await act(async () => {
      await result.current.connect();
    });
    expect(result.current.connectionState).toBe('connected');

    // Test onmessage
    // Use a valid base64 string for audio.data. 'YWI=' decodes to 'ab' (2 bytes for Int16Array).
    const validBase64Audio = 'YWI='; 
    const testMessage = { 
      serverContent: { 
        modelTurn: { 
          parts: [{ inlineData: { data: validBase64Audio, mimeType: 'audio/opus' }}]
        }
      }
    };
    // Clear onError mock before testing onmessage to ensure it's not called for this path
    mockOnError.mockClear(); 

    await act(async () => {
      await capturedLiveConnectCallbacks.onmessage(testMessage);
    });
    expect(mockOnMessage).toHaveBeenCalledWith({ type: 'audio', audio: validBase64Audio });
    expect(mockOnError).not.toHaveBeenCalled(); // Ensure no error for successful message

    // Test onerror
    const testError = new Error('Session error');
    act(() => {
      capturedLiveConnectCallbacks.onerror(testError);
    });
    expect(mockOnError).toHaveBeenCalledWith(testError);
    expect(result.current.connectionState).toBe('error');
    expect(mockOnStateChange).toHaveBeenCalledWith('error');

    // Test onclose
    // Reset state for this part if needed, or ensure it transitions from error
    act(() => {
      result.current.connect(); // Re-establish 'connected' if onclose is supposed to transition from there, or mock different initial state
    });
    // Wait for connect to re-establish before triggering onclose
    await vi.waitFor(() => expect(result.current.connectionState).toBe('connected'));
    
    act(() => {
      capturedLiveConnectCallbacks.onclose();
    });
    expect(result.current.connectionState).toBe('disconnected');
    expect(mockOnStateChange).toHaveBeenCalledWith('disconnected');
  });

  it('sends realtime input when recording', async () => {
    const { result } = renderHook(() => useGeminiLive());

    await act(async () => {
      await result.current.connect();
      await result.current.startRecording();
    });

    await vi.waitFor(() => expect(result.current.isRecording).toBe(true));

    // Get the created AudioWorkletNode instance
    const mockWorkletConstructor = global.AudioWorkletNode as any; // Cast to any to bypass persistent linter/type issue
    const mockAudioWorkletNodeInstance = mockWorkletConstructor.mock.results[0]?.value;

    expect(mockAudioWorkletNodeInstance).toBeDefined();
    expect(typeof mockAudioWorkletNodeInstance.port.onmessage).toBe('function');

    // Add delay to ensure useEffect has run and closure has updated isRecording state
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const sampleData = new Float32Array([0.1, 0.2, 0.3]);
    const mockEvent = { data: { type: 'audioData', data: sampleData, audioLevel: 0.5 } } as MessageEvent<{type: string, data: Float32Array, audioLevel: number}>;

    act(() => {
      mockAudioWorkletNodeInstance.port.onmessage(mockEvent);
    });

    expect(mockSession.sendRealtimeInput).toHaveBeenCalledTimes(1);
    const callArg = mockSession.sendRealtimeInput.mock.calls[0][0];
    expect(callArg.media).toBeInstanceOf(Blob);
    // Further Blob content inspection is complex, but type check is a good start
  });

  it('disconnects and resets session', async () => {
    const { result } = renderHook(() => useGeminiLive());

    // Connect first
    await act(async () => {
      await result.current.connect();
    });

    // Ensure connected before disconnecting
    await vi.waitFor(() => expect(result.current.connectionState).toBe('connected'));

    // Disconnect
    act(() => {
      result.current.disconnect();
    });

    expect(mockSession.close).toHaveBeenCalled();
    expect(result.current.connectionState).toBe('disconnected');
    expect(result.current.isRecording).toBe(false);
  });

  it('resets session properly', async () => {
    const { result } = renderHook(() => useGeminiLive());

    // Connect and add some state
    await act(async () => {
      await result.current.connect();
    });
    await vi.waitFor(() => expect(result.current.connectionState).toBe('connected'));

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(mockSession.close).toHaveBeenCalled();
    expect(result.current.connectionState).toBe('disconnected');
    expect(result.current.isRecording).toBe(false);
  });
});