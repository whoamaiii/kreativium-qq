import '@testing-library/jest-dom';
import { vi } from 'vitest';

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
