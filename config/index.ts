/**
 * Config — Central Registry
 *
 * The single import point for all engines, games, and utilities.
 * The fixture (e2e/fixtures/game.ts) and playwright.config.ts import from here.
 *
 * ─── Adding a new engine ──────────────────────────────────────────────────
 *   1. Create  config/engines/<ID>/index.ts
 *   2. Add it to the `engines` export below
 *
 * ─── Adding a new game ────────────────────────────────────────────────────
 *   1. Create  config/games/<game-id>/index.ts  (config + nodes)
 *   2. Import it below and push it into `gameRegistry`
 *   3. Add a Playwright project in playwright.config.ts
 */

// ── Engines ──────────────────────────────────────────────────────────────────
import { E1 } from './engines/E1';

export const engines: Record<string, import('./types').EngineConfig> = {
  E1,
};

// ── Games ─────────────────────────────────────────────────────────────────────
import * as mahjongDragonWays from './games/mahjong-dragon-ways';

export const gameRegistry: import('./types').GameEntry[] = [
  { ...mahjongDragonWays.config, nodes: mahjongDragonWays.nodes },
];

// ── Utilities & Types (re-exported for convenience) ───────────────────────────
export { buildGameUrl, findGame, getEngineForGame } from './utils';
export type { EngineConfig, GameConfig, GameEntry, GameNodes } from './types';
