/**
 * E1 Engine — Localization Tests
 *
 * Verifies that localized Label text shown in-game matches the
 * expected value from  data/localize/<lang>/text.json.
 *
 * How it works:
 *   1. Load text.json for the target language into a Map<key, value>
 *   2. After game-loaded, read the actual label text via CocosTestBridge
 *   3. Assert actual === expected
 *
 * Run:
 *   npx playwright test --project=mahjong-dragon-ways e2e/engines/E1/localize
 */

import { test, expect } from '../../fixtures/game';
import { loadL10n, getExpectedText } from '../../helpers/l10n';

test.describe('Localization — Landing screen', () => {

  // ── English ────────────────────────────────────────────────────────────

  test('start button label matches EN text.json', async ({ bridge, gameCfg }) => {
    const l10n = loadL10n('en');

    const actual   = await bridge.getNodeLabel(gameCfg.nodes.landing.startButtonLabel);
    const expected = getExpectedText(l10n, 'LOADING_GET_STARTED');

    console.log(`[EN] start button: "${actual}"  (expected: "${expected}")`);
    expect(actual).toBe(expected);
  });

  // ── Thai ───────────────────────────────────────────────────────────────

  test('start button label matches TH text.json', async ({ page, bridge, gameCfg }) => {
    // Navigate with lang=th
    const url = new URL(gameCfg.baseUrl);
    url.searchParams.set('test', '1');
    url.searchParams.set('lang', 'th');
    await page.goto(url.toString(), { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => (window as any).__gameLoaded === true, { timeout: 90_000 });

    const l10n = loadL10n('th');

    const actual   = await bridge.getNodeLabel(gameCfg.nodes.landing.startButtonLabel);
    const expected = getExpectedText(l10n, 'LOADING_GET_STARTED');

    console.log(`[TH] start button: "${actual}"  (expected: "${expected}")`);
    expect(actual).toBe(expected);
  });

});
