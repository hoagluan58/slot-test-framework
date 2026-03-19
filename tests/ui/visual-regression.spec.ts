import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { captureScreenshot, compareScreenshots } from '../../utils/screenshot';
import { GameBridgeHelper } from '../../utils/bridge-helper';

const BASE_URL = process.env.GAME_BASE_URL ?? 'http://localhost:8080';
const BASELINES_DIR = path.resolve(__dirname, '../../baselines');
const ACTUALS_DIR = path.resolve(__dirname, '../../test-results/actuals');
const DIFFS_DIR = path.resolve(__dirname, '../../test-results/diffs');
const DIFF_THRESHOLD = 0.1; // max 0.1% pixel difference

/**
 * To update baselines: CAPTURE_BASELINE=true npx playwright test tests/ui
 */
const CAPTURE_BASELINE = process.env.CAPTURE_BASELINE === 'true';

test.describe('Visual Regression — UI States', () => {
  let bridge: GameBridgeHelper;

  test.beforeEach(async ({ page }) => {
    bridge = new GameBridgeHelper(page);
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
  });

  test('Idle state matches baseline', async ({ page }) => {
    await bridge.assertBridgeAvailable();
    await bridge.waitForState('idle');

    if (CAPTURE_BASELINE) {
      await captureScreenshot(page, 'idle-state', BASELINES_DIR);
      console.log('📸 Baseline captured for idle-state. Re-run without CAPTURE_BASELINE=true to test.');
      return;
    }

    const baselinePath = path.join(BASELINES_DIR, 'idle-state.png');
    if (!fs.existsSync(baselinePath)) {
      test.skip(true, `No baseline found at ${baselinePath}. Run with CAPTURE_BASELINE=true first.`);
      return;
    }

    const actualPath = await captureScreenshot(page, 'idle-state', ACTUALS_DIR);
    const diffPath = path.join(DIFFS_DIR, 'idle-state-diff.png');
    const result = compareScreenshots(baselinePath, actualPath, diffPath, DIFF_THRESHOLD);

    console.log(`🖼 Idle diff: ${result.diffPercent.toFixed(4)}% (${result.diffPixels} pixels)`);
    expect(result.passed, `Visual diff exceeded threshold: ${result.diffPercent.toFixed(4)}% > ${DIFF_THRESHOLD}%`).toBe(true);
  });

  test('Win state matches baseline', async ({ page }) => {
    await bridge.assertBridgeAvailable();

    // Spin until we get a win (or skip if game doesn't support forced wins)
    let attempts = 0;
    let gotWin = false;
    while (attempts < 10 && !gotWin) {
      const { spinResult } = await bridge.performSpin();
      if (spinResult?.isWin) {
        gotWin = true;
        await page.waitForTimeout(500); // Let win animation settle
      }
      attempts++;
    }

    if (!gotWin) {
      test.skip(true, 'Could not trigger a win state in 10 spins. Consider adding a forced-win test mode.');
      return;
    }

    if (CAPTURE_BASELINE) {
      await captureScreenshot(page, 'win-state', BASELINES_DIR);
      console.log('📸 Baseline captured for win-state.');
      return;
    }

    const baselinePath = path.join(BASELINES_DIR, 'win-state.png');
    if (!fs.existsSync(baselinePath)) {
      test.skip(true, `No baseline found at ${baselinePath}.`);
      return;
    }

    const actualPath = await captureScreenshot(page, 'win-state', ACTUALS_DIR);
    const diffPath = path.join(DIFFS_DIR, 'win-state-diff.png');
    const result = compareScreenshots(baselinePath, actualPath, diffPath, DIFF_THRESHOLD);

    console.log(`🖼 Win state diff: ${result.diffPercent.toFixed(4)}%`);
    expect(result.passed).toBe(true);
  });
});
