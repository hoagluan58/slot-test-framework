import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const BASE_URL = process.env.GAME_BASE_URL ?? 'http://localhost:8080';
const HEADLESS = process.env.HEADLESS !== 'false';
const SLOW_MO = parseInt(process.env.SLOW_MO ?? '0', 10);
const TIMEOUT = parseInt(process.env.TIMEOUT_MS ?? '30000', 10);

export default defineConfig({
  testDir: './tests',
  timeout: TIMEOUT,
  retries: 1,
  workers: 1, // Keep sequential for slot game state predictability

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['./reporters/json-reporter.ts'],
  ],

  use: {
    baseURL: BASE_URL,
    headless: HEADLESS,
    slowMo: SLOW_MO,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
