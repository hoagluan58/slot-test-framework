/**
 * screen-nav.ts — Shared navigation helpers for E1 engine tests
 *
 * Each function navigates from a cold page load to the target screen.
 * Import and call the appropriate helper at the top of each spec instead
 * of duplicating the navigation boilerplate.
 *
 * Usage:
 *   import { goToLanding, goToMainGame, goToWallet } from '../../helpers/screen-nav';
 *   await goToMainGame({ bridge, page, baseUrl: gameCfg.baseUrl, lang });
 */

import type { Page } from '@playwright/test';
import type { CocosTestBridge } from './cocos-bridge';
import { Nodes } from '../../config/games/ppc/nodes';

export interface NavOptions {
  bridge: CocosTestBridge;
  page: Page;
  baseUrl: string;
  lang: string;
}

/** Wait times (ms) — adjust per game if needed. */
const TIMING = {
  landingSettle: 8_000,
  maingameSettle: 5_000,
  popupSettle: 2_000,
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Cold-boot the game and wait until the landing screen is fully rendered. */
export async function goToLanding({ bridge, page, baseUrl, lang }: NavOptions): Promise<void> {

  await page.addInitScript(() => {
    (window as any).__gameLoaded = false;
    window.addEventListener('game-loaded', () => {
      (window as any).__gameLoaded = true;
    });
  });

  const url = `${baseUrl.replace(/\/$/, '')}/?test=1&lang=${lang}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => (window as any).__gameLoaded === true,
    { timeout: 10_000 }
  );
  await page.waitForTimeout(TIMING.landingSettle);
}

/** Navigate to landing then click start → main game. */
export async function goToMainGame(opts: NavOptions): Promise<void> {
  await goToLanding(opts);

  const clicked = await opts.bridge.clickNode(Nodes.landing.startButton);
  if (!clicked) {
    throw new Error(
      `Could not click node "${Nodes.landing.startButton}". ` +
      `Make sure Cocos registers it via TestRegistry with screen="landing", key="start-button".`
    );
  }

  await opts.page.waitForTimeout(TIMING.maingameSettle);
}

/** Navigate to main game then open the wallet popup. */
export async function goToWallet(opts: NavOptions): Promise<void> {
  await goToMainGame(opts);

  const clicked = await opts.bridge.clickNode(Nodes.mainGame.walletButton);
  if (!clicked) {
    throw new Error(
      `Could not click node "${Nodes.mainGame.walletButton}". ` +
      `Make sure Cocos registers it via TestRegistry with screen="main-game", key="wallet-button".`
    );
  }

  await opts.page.waitForTimeout(TIMING.popupSettle);
}
