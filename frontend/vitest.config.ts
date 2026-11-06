import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,

    environment: 'jsdom',

    passWithNoTests: true,

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
        '**/index.ts',
        '**/test-setup.ts',
        '**/testing/**',
      ],

      // Umbrales mínimos exigidos en CI (Quality Gate local, además de SonarQube)
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 75,
        lines: 80,
      },
    },
  },
});
