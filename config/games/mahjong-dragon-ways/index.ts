import type { GameConfig } from '../../types';

/**
 * Nodes specific to Mahjong Dragon Ways.
 * Add more screens (game, freeSpin…) as the game exposes them.
 *
 * How to fill in:
 *   1. Run:  npx playwright test smoke --project=smoke --headed
 *   2. Open HTML report → `exposed-test-nodes` attachment
 *   3. Copy keys here with a friendly name, wrapping in NodeDef(nodeKey, l10nKey)
 *      when the node has a localisation key, or a plain string otherwise.
 */
export const config: GameConfig = {
  id: 'ppc',
  name: 'Mahjong Dragon Ways',
  engineId: 'E1',
  baseUrl: 'https://ppc-test.dev.kobanstudio.com/',
  supportedLangs: ['en', 'th', 'bd'],
  supportedCurrencies: ['usd', 'thb'],
};


