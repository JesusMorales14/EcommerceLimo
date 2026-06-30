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
        '**/*.html',
        '**/app.routes.ts',
        '**/app.ts',
        '**/core/models/**',
        '**/core/config/**',
        '**/core/services/index.ts',
      ],

      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },
  },
});
