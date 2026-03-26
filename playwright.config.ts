import { defineConfig, devices } from '@playwright/test';

/**
 * Slot Test Framework — Playwright Configuration
 * 
 * Optimized for Canvas/WebGL-based slot games.
 */
export default defineConfig({
  testDir: './e2e',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  /* Shared settings for all the projects below. */
  use: {
    baseURL: 'https://ppc-test.dev.kobanstudio.com',

    /* Canvas games need more time to load assets */
    actionTimeout: 15_000,
    navigationTimeout: 30_000,

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot comparison settings */
    screenshot: 'only-on-failure',
  },

  /* Snapshot/screenshot comparison settings */
  expect: {
    toHaveScreenshot: {
      /* Allow 2% pixel difference for anti-aliasing and rendering variance */
      maxDiffPixelRatio: 0.02,
      /* Animation threshold — Canvas games have minor rendering variations */
      threshold: 0.3,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});
