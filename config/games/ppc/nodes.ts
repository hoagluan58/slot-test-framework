/**
 * PPC — Cocos TestRegistry node keys
 *
 * Format: '<screen>.<key>'  (must match what the Cocos side registers)
 *
 * Usage in tests:
 *   import { Nodes } from '../../../../../config/games/ppc/nodes';
 *   await bridge.clickNode(Nodes.landing.startButton);
 */
export const Nodes = {
  landing: {
    startButton: 'landing.start-button',
  },
  mainGame: {
    walletButton: 'main-game.wallet-button',
  },
} as const;
