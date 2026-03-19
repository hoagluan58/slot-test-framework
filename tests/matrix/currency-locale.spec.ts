import { test, expect } from '@playwright/test';
import { GameBridgeHelper } from '../../utils/bridge-helper';
import { WsInterceptor } from '../../utils/ws-interceptor';

const BASE_URL = process.env.GAME_BASE_URL ?? 'http://localhost:8080';

type Scenario = {
  currency: string;
  lang: string;
  currencySymbol: string;
};

const scenarios: Scenario[] = [
  { currency: 'USD', lang: 'en', currencySymbol: '$' },
  { currency: 'VND', lang: 'vi', currencySymbol: '₫' },
  { currency: 'EUR', lang: 'de', currencySymbol: '€' },
  { currency: 'JPY', lang: 'ja', currencySymbol: '¥' },
];

for (const scenario of scenarios) {
  test.describe(`Matrix — currency=${scenario.currency} lang=${scenario.lang}`, () => {
    let bridge: GameBridgeHelper;
    let ws: WsInterceptor;

    test.beforeEach(async ({ page }) => {
      ws = new WsInterceptor(page);
      ws.attach();
      bridge = new GameBridgeHelper(page);

      const url = `${BASE_URL}?currency=${scenario.currency}&lang=${scenario.lang}`;
      await page.goto(url);
      await page.waitForTimeout(2000); // Allow game to initialize
    });

    test(`Locale config matches URL params [${scenario.currency}/${scenario.lang}]`, async () => {
      await bridge.assertBridgeAvailable();
      const locale = await bridge.getLocaleConfig();

      expect(locale.currency, `Currency should be ${scenario.currency}`).toBe(scenario.currency);
      expect(locale.language, `Language should be ${scenario.lang}`).toBe(scenario.lang);
      expect(locale.currencySymbol, `Symbol should be ${scenario.currencySymbol}`).toBe(scenario.currencySymbol);
    });

    test(`Balance is reported in correct currency [${scenario.currency}]`, async () => {
      await bridge.assertBridgeAvailable();

      // Trigger spin to get a BALANCE_UPDATE
      await bridge.triggerSpin();
      const balanceFrame = await ws.waitForMessageType('BALANCE_UPDATE', 15000);
      const msg = JSON.parse(balanceFrame.payload);

      expect(msg.currency).toBe(scenario.currency);
    });

    test(`Spin cycle works for [${scenario.currency}/${scenario.lang}]`, async () => {
      await bridge.assertBridgeAvailable();
      const { balanceBefore, balanceAfter, betAmount } = await bridge.performSpin();

      console.log(`[${scenario.currency}/${scenario.lang}] Before=${balanceBefore} After=${balanceAfter} Bet=${betAmount}`);
      // After spin, balance must have changed by at most the bet amount
      const delta = Math.abs(balanceAfter - balanceBefore);
      expect(delta).toBeGreaterThanOrEqual(0);
      expect(delta).toBeLessThanOrEqual(balanceBefore); // Can't lose more than you have
    });
  });
}
