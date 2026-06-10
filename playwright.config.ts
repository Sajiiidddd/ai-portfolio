import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.E2E_PORT || '3000';
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL, trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Starts the app for the run. Use a built server in CI, dev locally.
  webServer: {
    command: process.env.CI ? 'npm run build && npm run start' : 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
