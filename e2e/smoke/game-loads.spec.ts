import { test, expect } from '@playwright/test';
import { CocosTestBridge } from '../helpers/cocos-bridge';

/**
 * Smoke test — navigate to the Cocos game with ?test=1, wait for the
 * 'game-loaded' event AND the landing scene to be active, then capture
 * a screenshot that is embedded directly in the Playwright HTML report.
 *
 * Run:
 *   npx playwright test smoke --project=chromium --headed
 *
 * Override the target URL:
 *   $env:GAME_URL='http://localhost:7456'; npx playwright test smoke --project=chromium
 */

// Append ?test=1 (or &test=1 if the URL already has query params)
const BASE_URL = process.env.GAME_URL ?? 'http://localhost:7456';
const GAME_URL = BASE_URL.includes('?')
  ? `${BASE_URL}&test=1`
  : `${BASE_URL}?test=1`;

test('Navigate to game URL', async ({ page }, testInfo) => {
  // Must register BEFORE navigation so the listener is injected
  // into the page before any game scripts run.
  await page.addInitScript(() => {
    (window as any).__gameLoaded = false;
    window.addEventListener('game-loaded', () => {
      (window as any).__gameLoaded = true;
    });
  });

  await page.goto(GAME_URL, { waitUntil: 'domcontentloaded' });
  console.log(`🌐 Navigated to: ${GAME_URL}`);

  // Wait until the game dispatches the 'game-loaded' event
  await page.waitForFunction(
    () => (window as any).__gameLoaded === true,
    { timeout: 90_000, polling: 300 }
  );
  console.log('✅ game-loaded event received.');

  // Wait for 7 seconds for the landing scene to settle
  await page.waitForTimeout(7000);

  // ── Read all nodes exposed via TestRegistry ──────────────────────────────
  //  window.__testNodes is populated by TestRegistry.register(), e.g.:
  //    "landing.spinBtn"  → Node with [Button, ...]
  //    "landing.balanceLbl" → Node with [Label, ...]
  const bridge = new CocosTestBridge(page);
  const testNodes = await bridge.getExposedTestNodes();
  const keys = Object.keys(testNodes);

  console.log(`\n🧩 Exposed test nodes (${keys.length} total):`);
  for (const key of keys) {
    const components = testNodes[key];
    console.log(`   ${key}  →  [${components.join(', ')}]`);
  }

  // Attach the node list as JSON so it shows in the HTML report
  await testInfo.attach('exposed-test-nodes', {
    body: JSON.stringify(testNodes, null, 2),
    contentType: 'application/json',
  });

  // ── Read the start button label from the first landing node that has 'label' in its key
  const firstLabelKey = keys.find(k => k.includes('label'));
  if (firstLabelKey) {
    const labelText = await bridge.getNodeLabel(firstLabelKey);
    console.log(`🔤 "${firstLabelKey}" label text: "${labelText}"`);
  }

  // Attach screenshot so it appears in the Playwright HTML report
  const screenshot = await page.screenshot({ fullPage: false });
  await testInfo.attach('landing-page', {
    body: screenshot,
    contentType: 'image/png',
  });
  console.log('📸 Screenshot attached to report.');
});
