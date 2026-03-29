// e2e/engines/E1/localize.spec.ts
//
// Localization screenshot test.
//
// Flow (per language):
//   1. Navigate to /?test=1&lang=<lang>
//   2. Wait for the game to dispatch the 'game-loaded' custom event
//   3. Wait a few seconds for the landing screen to fully render
//   4. Capture a full-page screenshot and compare against the baseline
//
// First run creates the baselines in:
//   e2e/engines/E1/__screenshots__/localize.spec.ts/
//
// Re-generate baselines:
//   npx playwright test e2e/engines/E1/localize.spec.ts --project=ppc --update-snapshots

import { test, expect } from '../../fixtures/game';

// How long (ms) to wait after game-loaded before screenshotting.
// Increase if loading animations are still playing.
const SETTLE_MS = 5_000;

test.describe('Localization — landing screen screenshot per language', () => {

  for (const lang of ['en', 'th', 'bn']) {
    test(`landing screen renders correctly in [${lang}]`, async ({ page, gameCfg }, testInfo) => {

      // ── 1. Inject the game-loaded sentinel BEFORE navigation ───────────────
      await page.addInitScript(() => {
        (window as any).__gameLoaded = false;
        window.addEventListener('game-loaded', () => {
          (window as any).__gameLoaded = true;
        });
      });

      // ── 2. Navigate ────────────────────────────────────────────────────────
      // Use the project's baseURL (localhost:7456) from playwright.config.ts,
      // not gameCfg.baseUrl, so overriding via $env:GAME_URL still works.
      const base = testInfo.project.use.baseURL ?? gameCfg.baseUrl;
      const url = `${base.replace(/\/$/, '')}/?test=1&lang=${lang}`;

      await page.goto(url, { waitUntil: 'domcontentloaded' });

      // ── 3. Wait for game-loaded event ──────────────────────────────────────
      await page.waitForFunction(
        () => (window as any).__gameLoaded === true,
        { timeout: 90_000, polling: 300 }
      );

      // ── 4. Let the landing screen settle ───────────────────────────────────
      await page.waitForTimeout(SETTLE_MS);

      // ── 5. Attach screenshot to HTML report (always visible) ───────────────
      const screenshotBytes = await page.screenshot({ fullPage: false });
      await testInfo.attach(`landing-${lang}`, {
        body: screenshotBytes,
        contentType: 'image/png',
      });

      // ── 6. Visual snapshot comparison (baseline created on first run) ──────
      await expect(page).toHaveScreenshot(`landing-${lang}.png`, {
        maxDiffPixelRatio: 0.02,   // 2% tolerance for WebGL variance
        threshold: 0.3,
      });
    });
  }
});