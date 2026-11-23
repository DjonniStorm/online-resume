import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'api-integration',
    environment: 'node',
    include: ['src/**/*.integration.test.ts'],
  },
});
