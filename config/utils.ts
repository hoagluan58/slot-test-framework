import type { EngineConfig, GameConfig } from './types';

/**
 * Look up the engine config for a given game.
 * Import `engines` from config/index.ts before calling this.
 */
export function getEngineForGame(
  game: GameConfig,
  engines: Record<string, EngineConfig>
): EngineConfig {
  const engine = engines[game.engineId];
  if (!engine) {
    throw new Error(`Engine "${game.engineId}" not found for game "${game.id}"`);
  }
  return engine;
}

/**
 * Build the full game URL with ?test=1 + lang + currency query params.
 */
export function buildGameUrl(
  game: GameConfig,
  lang: string,
  currency: string
): string {
  const url = new URL(game.baseUrl);
  url.searchParams.set('test', '1');
  url.searchParams.set('lang', lang);
  url.searchParams.set('currency', currency);
  return url.toString();
}

export function findGame(config: GameConfig[], gameId: string): GameConfig {
  const entry = config.find(g => g.id === gameId);
  if (!entry) {
    throw new Error(
      `Game "${gameId}" not found in config. ` +
      `Available games: ${config.map(g => g.id).join(', ')}`
    );
  }
  return entry;
}
