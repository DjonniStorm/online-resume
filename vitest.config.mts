import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'apps/web/vitest.config.ts',
      'apps/web/vitest.browser.config.ts',
      'apps/api/vitest.config.mts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        '**/dist/**',
        '**/coverage/**',
        '**/generated/**',
        '**/*.config.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.browser.test.ts',
        '**/*.browser.test.tsx',
      ],
    },
  },
});
