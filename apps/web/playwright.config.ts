import { defineConfig } from 'playwright/test';

const appUrl = 'http://127.0.0.1:4174';

export default defineConfig({
  testDir: './test/browser',
  forbidOnly: Boolean(process.env.CI),
  timeout: 30_000,
  globalTimeout: process.env.CI ? 120_000 : undefined,
  outputDir: '../../reports/playwright',
  reporter: process.env.CI
    ? [['list'], ['json', { outputFile: '../../reports/playwright-browser.json' }]]
    : 'list',
  use: {
    baseURL: appUrl,
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  webServer: process.env.CI
    ? undefined
    : {
        command: 'pnpm exec rsbuild dev --host 127.0.0.1 --port 4174 --strict-port',
        url: appUrl,
        reuseExistingServer: true,
        timeout: 30_000,
      },
});
