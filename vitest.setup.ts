import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';

// Mock HTMLCanvasElement.getContext for canvas-based components
HTMLCanvasElement.prototype.getContext = vi.fn(function(contextType: string) {
  if (contextType === '2d') {
    return {
      fillStyle: '',
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      closePath: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(4),
        width: 1,
        height: 1,
      })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(4),
        width: 1,
        height: 1,
      })),
      setTransform: vi.fn(),
      resetTransform: vi.fn(),
      canvas: {
        width: 100,
        height: 100,
      },
    };
  }
  return null;
}) as any;

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 0);
  return 0;
}) as any;

global.cancelAnimationFrame = vi.fn() as any;

// Mock scrollIntoView for JSDOM (not implemented by default)
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// --- WebSocket Mock for useKidLive & dashboard components ---
type WSListener = (event: MessageEvent) => void;

export interface MockWebSocket {
  readyState: number;
  simulateMessage: (data: any) => void;
  close: ReturnType<typeof vi.fn>;
  addEventListener: (type: string, cb: WSListener) => void;
  removeEventListener: (type: string, cb: WSListener) => void;
}

class WebSocketMock implements MockWebSocket {
  private listeners: Record<string, WSListener[]> = {};
  readyState = 1;              // OPEN
  simulateMessage = (data: any) => {
    const evt = { data: JSON.stringify(data) } as MessageEvent;
    this.listeners['message']?.forEach(fn => fn(evt));
  };
  close = vi.fn();

  constructor() {
    // expose for tests that need direct access
    (globalThis as any).__currentWS = this;
  }

  addEventListener = (type: string, cb: WSListener) =>
    (this.listeners[type] ??= []).push(cb);
  removeEventListener = (type: string, cb: WSListener) =>
    this.listeners[type] = (this.listeners[type] || []).filter(f => f !== cb);
}

// Replace the real WebSocket for every test file
globalThis.WebSocket = WebSocketMock as unknown as typeof WebSocket;

// --- Global test cleanup ---
afterEach(() => {
  // Clean up any open WebSocket connections to prevent leaks
  const currentWS = (globalThis as any).__currentWS as MockWebSocket;
  if (currentWS) {
    currentWS.close();
  }
  
  // Reset module cache to prevent cross-test contamination
  vi.resetModules();
});
