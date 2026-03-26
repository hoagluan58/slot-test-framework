/**
 * Currency Tests
 * 
 * Screenshot-based tests for currency symbol display and bet options.
 * Validates that each currency is rendered correctly in the game UI.
 */
import { test, expect } from '@playwright/test';
import { games } from '../config/games';
import { currencies } from '../config/currencies';
import { SlotGamePage } from './fixtures/slot-game.fixture';

for (const game of games) {
  for (const currencyCode of game.supportedCurrencies) {
    const currencyConfig = currencies[currencyCode];
    const defaultLang = game.supportedLangs[0]; // Use default language for currency tests

    test.describe(`[${game.name}] Currency — ${currencyCode.toUpperCase()}`, () => {
      let slotPage: SlotGamePage;

      test.beforeEach(async ({ page }) => {
        slotPage = new SlotGamePage(page, game, defaultLang, currencyCode, currencyConfig);
        await slotPage.load();
        await slotPage.clickGetStarted();
      });

      test('main game shows correct currency formatting', async () => {
        // The main game HUD shows balance and bet with currency symbol
        await expect(slotPage.page.locator('canvas')).toHaveScreenshot(
          `${game.id}-${currencyCode}-main-hud.png`
        );
      });

      test('bet options display correct values', async () => {
        await slotPage.openBetOptions();
        await expect(slotPage.page.locator('canvas')).toHaveScreenshot(
          `${game.id}-${currencyCode}-bet-options.png`
        );
      });

      test('rules page shows correct currency info', async () => {
        await slotPage.openInfoModal();
        await slotPage.switchInfoTab('rules');
        await expect(slotPage.page.locator('canvas')).toHaveScreenshot(
          `${game.id}-${currencyCode}-rules-currency.png`
        );
      });

      test('bet option count matches config', async () => {
        // This is a data validation: the number of bet options should match
        expect(currencyConfig.betOptions.length).toBe(18);
      });

      test('bet options values are in ascending order', async () => {
        const sorted = [...currencyConfig.betOptions].sort((a, b) => a - b);
        expect(currencyConfig.betOptions).toEqual(sorted);
      });

      test('min/max bet matches first/last bet option', async () => {
        const minBet = currencyConfig.betOptions[0];
        const maxBet = currencyConfig.betOptions[currencyConfig.betOptions.length - 1];

        expect(minBet).toBeLessThan(maxBet);
        // Verify specific values from the game design doc
        if (currencyCode === 'usd') {
          expect(minBet).toBe(0.20);
          expect(maxBet).toBe(100.00);
        } else if (currencyCode === 'thb') {
          expect(minBet).toBe(1);
          expect(maxBet).toBe(1000);
        }
      });
    });
  }
}
