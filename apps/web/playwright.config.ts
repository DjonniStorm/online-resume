import { defineConfig } from 'playwright/test';

const appUrl = 'http://127.0.0.1:5173';

export default defineConfig({
  testDir: './test/browser',
  forbidOnly: Boolean(process.env.CI),
  outputDir: '../../reports/playwright',
  reporter: process.env.CI
    ? [['line'], ['json', { outputFile: '../../reports/playwright-browser.json' }]]
    : 'list',
  use: {
    baseURL: appUrl,
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    url: appUrl,
    reuseExistingServer: !process.env.CI,
  },
});
