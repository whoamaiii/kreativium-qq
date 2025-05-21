import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'; // For JSX transformation

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Allows using Vitest globals (describe, test, expect) without importing
    environment: 'jsdom', // Simulates a browser environment for testing React components
    setupFiles: './vitest.setup.ts', // Optional setup file for extending expect, etc.
    css: true, // If you need to process CSS imports in your components
    alias: { // To match tsconfig.json paths for absolute imports
      '@/': new URL('./src/', import.meta.url).pathname,
    },
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'], // Explicitly include test files in src
  },
});
