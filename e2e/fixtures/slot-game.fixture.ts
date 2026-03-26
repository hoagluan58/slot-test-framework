/**
 * Slot Game Fixture
 * 
 * Base Playwright fixture for E1 engine slot games.
 * Handles game loading, "GET STARTED" click, and common interactions.
 */
import { test as base, expect, type Page } from '@playwright/test';
import { type GameConfig, buildGameUrl } from '../../config/games';
import { type CurrencyConfig } from '../../config/currencies';

export interface SlotGameFixtureOptions {
  gameConfig: GameConfig;
  lang: string;
  currency: string;
  currencyConfig: CurrencyConfig;
}

export interface SlotGameFixture {
  slotPage: SlotGamePage;
}

export class SlotGamePage {
  constructor(
    public readonly page: Page,
    public readonly gameConfig: GameConfig,
    public readonly lang: string,
    public readonly currency: string,
    public readonly currencyConfig: CurrencyConfig
  ) {}

  /**
   * Navigate to the game and wait for it to fully load.
   */
  async load(): Promise<void> {
    const url = buildGameUrl(this.gameConfig, this.lang, this.currency);
    await this.page.goto(url);

    // Wait for the canvas to be present and rendered
    await this.page.waitForSelector('canvas', { timeout: 30_000 });

    // Give the game time to finish loading assets
    await this.page.waitForTimeout(5_000);
  }

  /**
   * Click "GET STARTED" button on the splash screen.
   * The button location is consistent across E1 games.
   */
  async clickGetStarted(): Promise<void> {
    const canvas = this.page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // "GET STARTED" button is in the lower-center of the canvas
    await this.page.mouse.click(
      box.x + box.width / 2,
      box.y + box.height * 0.88
    );

    // Wait for main game to load
    await this.page.waitForTimeout(3_000);
  }

  /**
   * Click the info (i) button to open paytable/rules modal.
   */
  async openInfoModal(): Promise<void> {
    const canvas = this.page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Info button is in the top-right area of the game canvas
    await this.page.mouse.click(
      box.x + box.width * 0.95,
      box.y + box.height * 0.08
    );
    await this.page.waitForTimeout(1_500);
  }

  /**
   * Switch to a tab in the info modal (Paytable, Rules, History).
   */
  async switchInfoTab(tab: 'paytable' | 'rules' | 'history'): Promise<void> {
    const canvas = this.page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    const tabPositions = {
      paytable: 0.35,
      rules: 0.50,
      history: 0.65,
    };

    await this.page.mouse.click(
      box.x + box.width * tabPositions[tab],
      box.y + box.height * 0.90
    );
    await this.page.waitForTimeout(1_000);
  }

  /**
   * Close the info modal.
   */
  async closeInfoModal(): Promise<void> {
    const canvas = this.page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Close (X) button at top-right of modal
    await this.page.mouse.click(
      box.x + box.width * 0.93,
      box.y + box.height * 0.04
    );
    await this.page.waitForTimeout(1_000);
  }

  /**
   * Click the bet area to open bet options popup.
   */
  async openBetOptions(): Promise<void> {
    const canvas = this.page.locator('canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Bet display is in the bottom bar, center-left area
    await this.page.mouse.click(
      box.x + box.width * 0.50,
      box.y + box.height * 0.93
    );
    await this.page.waitForTimeout(1_500);
  }

  /**
   * Take a screenshot of the full game canvas.
   */
  async takeCanvasScreenshot(name: string): Promise<Buffer> {
    const canvas = this.page.locator('canvas');
    return await canvas.screenshot({ type: 'png' });
  }
}

/**
 * Create a test fixture with the slot game page loaded.
 */
export function createSlotGameTest(options: SlotGameFixtureOptions) {
  return base.extend<SlotGameFixture>({
    slotPage: async ({ page }, use) => {
      const slotPage = new SlotGamePage(
        page,
        options.gameConfig,
        options.lang,
        options.currency,
        options.currencyConfig
      );
      await slotPage.load();
      await slotPage.clickGetStarted();
      await use(slotPage);
    },
  });
}
