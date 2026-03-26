/**
 * Engine Configuration Registry
 * 
 * Each engine defines a playstyle shared by multiple games.
 * Games within the same engine share the same test logic but differ in UI/theme.
 */

export interface EngineConfig {
  id: string;
  name: string;
  reelLayout: number[];        // rows per reel, e.g. [4, 5, 5, 5, 4]
  waysToWin: number;
  hasFreeSpin: boolean;
  hasMultiplier: boolean;
  hasBuyFeature: boolean;
  hasCascading: boolean;
  hasGoldSymbols: boolean;
  multiplierSequence: {
    mainGame: number[];
    freeSpin: number[];
  };
}

export const engines: Record<string, EngineConfig> = {
  E1: {
    id: 'E1',
    name: 'Ways Engine',
    reelLayout: [4, 5, 5, 5, 4],
    waysToWin: 2000,
    hasFreeSpin: true,
    hasMultiplier: true,
    hasBuyFeature: true,
    hasCascading: true,
    hasGoldSymbols: true,
    multiplierSequence: {
      mainGame: [1, 2, 3, 5],
      freeSpin: [2, 4, 6, 10],
    },
  },
};
