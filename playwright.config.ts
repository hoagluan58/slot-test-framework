import { defineConfig, devices } from '@playwright/test';
import type { GameFixtures } from './e2e/fixtures/game';

/**
 * Slot Test Framework — Playwright Configuration
 *
 * Tuned for Cocos Creator 3.x games running in the browser (local preview
 * or a deployed build).  Canvas / WebGL games have very different timing
 * characteristics from normal web pages, so most timeouts are generous.
 *
 * Override the target URL at runtime:
 *   $env:GAME_URL='http://localhost:7456'; npx playwright test
 */

const GAME_URL = process.env.GAME_URL ?? 'http://localhost:7456';

export default defineConfig<GameFixtures>({
  testDir: './e2e',

  /* Each test file runs sequentially; files can run in parallel. */
  fullyParallel: true,

  /* Block accidental .only commits on CI. */
  forbidOnly: !!process.env.CI,

  /* Retry failed tests on CI only. */
  retries: process.env.CI ? 2 : 0,

  /* Single worker on CI; local uses all available cores. */
  workers: process.env.CI ? 1 : undefined,

  /* ─── Global test timeout ─────────────────────────────────────────────────
   * Cocos games can take 30–60 s to boot assets, shaders, and fire
   * 'game-loaded'. Set a generous per-test ceiling.                        */
  timeout: 120_000,   // 2 minutes per test

  reporter: [
    ['html', { open: 'never' }],
    ['dot'],
  ],

  use: {
    baseURL: GAME_URL,

    /* ─── Timeouts ──────────────────────────────────────────────────────────
     * actionTimeout is the default for page.waitForFunction() in
     * Playwright ≥ 1.35.  Set it high enough that our 60-s game-boot wait
     * is never capped by this value.                                       */
    actionTimeout:     90_000,   // covers waitForFunction / click / fill
    navigationTimeout: 60_000,   // goto / waitForNavigation

    /* Traces & videos help debug canvas failures. */
    trace:      'on-first-retry',
    video:      'on-first-retry',
    screenshot: 'only-on-failure',
  },

  /* ─── Assertion / screenshot comparison settings ─────────────────────── */
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,   // 2 % pixel tolerance for WebGL variance
      threshold: 0.3,
    },
  },

  projects: [
    // ── Chromium base (shared browser config) ─────────────────────────────
    // Individual game projects extend this via `use`.
    // Do not add testMatch here — it would run all tests for all games.

    // ── E1 Engine games ───────────────────────────────────────────────────
    // Each project runs the E1 engine test suite against one game URL.
    // To add a new game: copy one block, set name/GAME/baseURL.
    {
      name: 'mahjong-dragon-ways',
      testMatch: 'e2e/engines/E1/**/*.spec.ts',
      // Passes gameId into the game fixture for this project
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        baseURL: 'https://ppc-test.dev.kobanstudio.com',
        gameId: 'mahjong-dragon-ways',
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu-sandbox',
            '--disable-webgpu',
            '--ignore-certificate-errors',
          ],
        },
      },
    },
    // ── General / smoke tests (no engine) ─────────────────────────────────
    {
      name: 'smoke',
      testMatch: 'e2e/smoke/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu-sandbox',
            '--disable-webgpu',
            '--ignore-certificate-errors',
          ],
        },
      },
    },
  ],
});
