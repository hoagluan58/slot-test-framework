export interface EngineConfig {
  id: string;
  name?: string;
}

export interface GameConfig {
  id: string;
  name: string;
  engineId: string;
  baseUrl: string;
  supportedLangs: string[];
  supportedCurrencies: string[];
  nodes: GameNodes;
}

export type ScreenNodes = Record<string, string>;

/** The full node map for a game: screen name → ScreenNodes */
export type GameNodes = Record<string, ScreenNodes>;
