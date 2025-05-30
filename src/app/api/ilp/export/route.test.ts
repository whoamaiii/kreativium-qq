// ---------------------------------------------------------------------------
// Global test‑only stubs
// ---------------------------------------------------------------------------
import { vi } from 'vitest';

// 🟥 jsdom doesn't implement scrollIntoView; stub it once for all tests
// @ts-expect-error – we are monkey‑patching
if (!HTMLElement.prototype.scrollIntoView) {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  HTMLElement.prototype.scrollIntoView = vi.fn();
}

// 🟥 WebSocket mock for useKidLive & dashboard components
const WebSocketMock = vi
  .fn()
  .mockImplementation(() => {
    const ws = {
      simulateMessage: vi.fn(),
      close: vi.fn(),
    };
    // Expose the most recent instance for convenience in unit tests
    //   e.g.   const ws = (globalThis as any).__currentWS;
    (globalThis as any).__currentWS = ws;
    return ws;
  });

// @ts-expect-error – override the global
globalThis.WebSocket = WebSocketMock as unknown as typeof WebSocket;