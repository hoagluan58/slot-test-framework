/**
 * Localization Visual Tests
 * 
 * Screenshot-based tests for Canvas/WebGL games.
 * Captures screenshots of key game screens in each language
 * and compares against baselines to detect text cutoff, overflow, or missing translations.
 */
import { test, expect } from '@playwright/test';
import { games } from '../config/games';
import { currencies } from '../config/currencies';
import { SlotGamePage } from './fixtures/slot-game.fixture';

for (const game of games) {
  // Use the first currency for localization visual tests
  const defaultCurrency = game.supportedCurrencies[0];
  const currencyConfig = currencies[defaultCurrency];

  for (const lang of game.supportedLangs) {
    test.describe(`[${game.name}] Visual — ${lang.toUpperCase()}`, () => {
      let slotPage: SlotGamePage;

      test.beforeEach(async ({ page }) => {
        slotPage = new SlotGamePage(page, game, lang, defaultCurrency, currencyConfig);
        await slotPage.load();
        await slotPage.clickGetStarted();
      });

      test('main game screen', async () => {
        const screenshot = await slotPage.takeCanvasScreenshot('main-game');
        await expect(slotPage.page.locator('canvas')).toHaveScreenshot(
          `${game.id}-${lang}-main-game.png`
        );
      });

      test('paytable', async () => {
        await slotPage.openInfoModal();
        // Paytable is the default tab
        await expect(slotPage.page.locator('canvas')).toHaveScreenshot(
          `${game.id}-${lang}-paytable.png`
        );
      });

      test('rules', async () => {
        await slotPage.openInfoModal();
        await slotPage.switchInfoTab('rules');
        await expect(slotPage.page.locator('canvas')).toHaveScreenshot(
          `${game.id}-${lang}-rules.png`
        );
      });

      test('history tab', async () => {
        await slotPage.openInfoModal();
        await slotPage.switchInfoTab('history');
        await expect(slotPage.page.locator('canvas')).toHaveScreenshot(
          `${game.id}-${lang}-history.png`
        );
      });

      test('bet options popup', async () => {
        await slotPage.openBetOptions();
        await expect(slotPage.page.locator('canvas')).toHaveScreenshot(
          `${game.id}-${lang}-bet-options.png`
        );
      });
    });
  }
}
