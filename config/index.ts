// ── Engines ──────────────────────────────────────────────────────────────────
import { E1 } from './engines/E1';

export const engines: Record<string, import('./types').EngineConfig> = {
  E1,
};

// ── Games ─────────────────────────────────────────────────────────────────────
import * as ppc from './games/ppc';

export const gameRegistry: import('./types').GameConfig[] = [
  { ...ppc.config }
];

export { buildGameUrl, findGame, getEngineForGame } from './utils';
export type { EngineConfig, GameConfig, GameNodes } from './types';
