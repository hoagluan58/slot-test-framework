/**
 * Game Bridge — TypeScript types for window.__test__
 *
 * The Cocos game dev team should implement this interface and expose it
 * on the window object in non-production builds:
 *
 *   window.__test__ = { ... }
 *
 * Use `window.__TEST_ENABLED__` to guard the bridge in Cocos builds.
 */

export type GameState = 'idle' | 'spinning' | 'win' | 'bonus' | 'freespin' | 'error';

export type SpinResult = {
  symbols: string[][];       // 2D grid of symbols, e.g. [['A','B','C'],['7','7','7']]
  winAmount: number;
  isWin: boolean;
  isBonus: boolean;
  isFreeSpin: boolean;
  multiplier: number;
};

export type LocaleConfig = {
  currency: string;          // e.g. 'USD', 'VND'
  language: string;          // e.g. 'en', 'vi'
  currencySymbol: string;    // e.g. '$', '₫'
};

export interface GameTestBridge {
  /** Current player balance */
  getBalance(): number;

  /** Currently selected bet amount per spin */
  getBetAmount(): number;

  /** Current game state */
  getGameState(): GameState;

  /** Result from the most recent completed spin */
  getLastSpinResult(): SpinResult | null;

  /** Active locale/currency config */
  getLocaleConfig(): LocaleConfig;

  /** All symbols visible on the reel grid */
  getCurrentSymbols(): string[][];

  /** Programmatically trigger a spin (dev/test only) */
  triggerSpin(): void;

  /** Set bet amount (dev/test only) */
  setBetAmount(amount: number): void;

  /** Listen for state changes */
  onStateChange(callback: (state: GameState) => void): () => void; // returns unsubscribe fn

  /** Listen for spin results */
  onSpinResult(callback: (result: SpinResult) => void): () => void;
}

declare global {
  interface Window {
    __test__?: GameTestBridge;
    __TEST_ENABLED__?: boolean;
  }
}
