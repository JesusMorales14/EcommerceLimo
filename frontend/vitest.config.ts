import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,

    environment: 'jsdom',

    passWithNoTests: true,

    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],

    coverage: {
      provider: 'v8',

      reportsDirectory: './coverage',

      reporter: ['text', 'text-summary', 'html', 'json', 'lcov'],

      exclude: [
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/*.module.ts',
        '**/main.ts',
        '**/environments/**',
        '**/node_modules/**',
      ],

      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
