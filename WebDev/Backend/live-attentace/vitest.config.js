import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    testTimeout: 30000,
    hookTimeout: 30000,
    // Run tests sequentially to avoid conflicts with the single active session constraint
    sequence: {
      concurrent: false
    }
  }
});
