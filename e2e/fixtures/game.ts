/**
 * Game Fixture
 *
 * Provides `gameCfg`, `engine`, `nodes`, and `bridge` to every test.
 * The active game is selected by `gameId` set per Playwright project
 * in playwright.config.ts via `use: { gameId: '...' }`.
 *
 * Usage in a test:
 *   import { test } from '../../fixtures/game';
 *   test('my test', async ({ page, bridge, gameCfg, nodes }) => { ... });
 */

import { test as base } from '@playwright/test';
import {
  gameRegistry,
  engines,
  findGame,
  buildGameUrl,
  type GameEntry,
  type EngineConfig,
} from '../../config';
import { CocosTestBridge } from '../helpers/cocos-bridge';

export interface GameFixtures {
  /** Game ID — set via `use: { gameId }` in playwright.config.ts */
  gameId: string;
  /** Full config + nodes for the active game */
  gameCfg: GameEntry;
  /** Engine config the game runs on */
  engine: EngineConfig;
  /** Ready-to-use Cocos bridge (game is already loaded when test starts) */
  bridge: CocosTestBridge;
}

export const test = base.extend<GameFixtures>({

  gameId: ['', { option: true }],

  gameCfg: async ({ gameId }, use) => {
    if (!gameId) throw new Error(
      'gameId is not set. Add `use: { gameId: "..." }` to your Playwright project in playwright.config.ts'
    );
    await use(findGame(gameRegistry, gameId));
  },

  engine: async ({ gameCfg }, use) => {
    const engine = engines[gameCfg.engineId];
    if (!engine) throw new Error(`Engine "${gameCfg.engineId}" not found in config/engines/`);
    await use(engine);
  },

  bridge: async ({ page, gameCfg }, use) => {
    // Inject the game-loaded listener BEFORE navigation
    await page.addInitScript(() => {
      (window as any).__gameLoaded = false;
      window.addEventListener('game-loaded', () => {
        (window as any).__gameLoaded = true;
      });
    });

    // Navigate with ?test=1, default lang & currency
    const url = buildGameUrl(gameCfg, gameCfg.supportedLangs[0], gameCfg.supportedCurrencies[0]);
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Wait for the game to signal it has fully loaded
    await page.waitForFunction(
      () => (window as any).__gameLoaded === true,
      { timeout: 90_000, polling: 300 }
    );

    await use(new CocosTestBridge(page));
  },
});

export { expect } from '@playwright/test';
