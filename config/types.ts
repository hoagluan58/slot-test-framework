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
}

export type GameNodes = Record<string, Record<string, string>>;

/** A game config merged with its node map — used in the central registry */
export interface GameEntry extends GameConfig {
  nodes: GameNodes;
}
