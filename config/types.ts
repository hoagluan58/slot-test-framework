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

/**
 * A single node definition carrying:
 *  - nodeKey  → passed to CocosTestBridge (e.g. 'landing.start-button-label')
 *  - l10nKey  → used to look up the expected text in text.json
 */
export class NodeDef {
  constructor(
    public readonly nodeKey: string,
    public readonly l10nKey: string,
  ) { }
}

/**
 * A screen is a map of friendly names → either a plain node key (string)
 * or a full NodeDef (nodeKey + l10nKey).
 */
export type ScreenNodes = Record<string, string | NodeDef>;

/** The full node map for a game: screen name → ScreenNodes */
export type GameNodes = Record<string, ScreenNodes>;

/** A game config merged with its node map — used in the central registry */
export interface GameEntry extends GameConfig {
  nodes: GameNodes;
}
