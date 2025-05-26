import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { launchConfetti } from './confetti';

// Mock DOM methods
const mockCanvas = {
  getContext: vi.fn(),
  style: {},
  width: 0,
  height: 0,
};

const mockContext = {
  clearRect: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  fillRect: vi.fn(),
  fillStyle: '',
};

const mockElement = {
  getBoundingClientRect: vi.fn(() => ({
    left: 100,
    top: 100,
    width: 200,
    height: 50,
  })),
} as unknown as HTMLElement;

// Mock global objects
Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn(() => mockCanvas),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  },
  writable: true,
});

Object.defineProperty(global, 'window', {
  value: {
    innerWidth: 1024,
    innerHeight: 768,
  },
  writable: true,
});

Object.defineProperty(global, 'requestAnimationFrame', {
  value: vi.fn((callback) => {
    // Immediately call the callback for testing
    setTimeout(callback, 16);
    return 1;
  }),
  writable: true,
});

describe('launchConfetti', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCanvas.getContext.mockReturnValue(mockContext);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates and appends canvas to document body', () => {
    launchConfetti(mockElement);

    expect(document.createElement).toHaveBeenCalledWith('canvas');
    expect(document.body.appendChild).toHaveBeenCalledWith(mockCanvas);
  });

  it('sets canvas styles correctly', () => {
    launchConfetti(mockElement);

    expect(mockCanvas.style).toMatchObject({
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: '9999',
    });
  });

  it('sets canvas dimensions to window size', () => {
    launchConfetti(mockElement);

    expect(mockCanvas.width).toBe(1024);
    expect(mockCanvas.height).toBe(768);
  });

  it('returns early if canvas context is null', () => {
    mockCanvas.getContext.mockReturnValue(null);
    
    launchConfetti(mockElement);

    expect(document.body.appendChild).not.toHaveBeenCalled();
  });

  it('removes canvas after specified duration', async () => {
    const duration = 1000;
    launchConfetti(mockElement, duration);

    // Fast-forward time past the duration
    vi.advanceTimersByTime(duration + 100);

    // Wait for any pending animations
    await vi.runAllTimersAsync();

    expect(document.body.removeChild).toHaveBeenCalledWith(mockCanvas);
  });

  it('uses default duration of 3000ms when not specified', async () => {
    launchConfetti(mockElement);

    // Fast-forward to just before 3000ms
    vi.advanceTimersByTime(2999);
    await vi.runAllTimersAsync();
    expect(document.body.removeChild).not.toHaveBeenCalled();

    // Fast-forward past 3000ms
    vi.advanceTimersByTime(100);
    await vi.runAllTimersAsync();
    expect(document.body.removeChild).toHaveBeenCalled();
  });

  it('calls canvas context methods during animation', () => {
    launchConfetti(mockElement, 100);

    // Advance time to trigger animation frame
    vi.advanceTimersByTime(16);

    expect(mockContext.clearRect).toHaveBeenCalled();
    expect(mockContext.save).toHaveBeenCalled();
    expect(mockContext.restore).toHaveBeenCalled();
    expect(mockContext.translate).toHaveBeenCalled();
    expect(mockContext.rotate).toHaveBeenCalled();
    expect(mockContext.fillRect).toHaveBeenCalled();
  });

  it('positions particles at element center initially', () => {
    const rect = mockElement.getBoundingClientRect();
    launchConfetti(mockElement, 100);

    // Advance time to trigger animation frame
    vi.advanceTimersByTime(16);

    // Check that translate was called with positions around the element center
    const expectedCenterX = rect.left + rect.width / 2;
    const expectedCenterY = rect.top + rect.height / 2;

    expect(mockContext.translate).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number)
    );

    // Verify at least one call has coordinates near the center
    const translateCalls = mockContext.translate.mock.calls;
    const hasNearCenterCall = translateCalls.some(([x, y]) => 
      Math.abs(x - expectedCenterX) < 50 && Math.abs(y - expectedCenterY) < 50
    );
    expect(hasNearCenterCall).toBe(true);
  });
}); 