/**
 * Game Configuration Registry
 * 
 * Each game belongs to an engine and defines its unique properties:
 * URL, supported languages, currencies, symbols, and data paths.
 * 
 * Adding a new game = adding one entry here. All engine-level tests run automatically.
 */

import { engines, type EngineConfig } from './engines';

export interface GameConfig {
  id: string;
  name: string;
  engineId: string;
  baseUrl: string;
  supportedLangs: string[];
  supportedCurrencies: string[];
  /** Path to localization data folder, relative to project root */
  localizeDataPath: string;
  symbols: string[];
  maxWinMultiplier: number;
}

export const games: GameConfig[] = [
  {
    id: 'mahjong-dragon-ways',
    name: 'Mahjong Dragon Ways',
    engineId: 'E1',
    baseUrl: 'https://ppc-test.dev.kobanstudio.com/',
    supportedLangs: ['en', 'th'],
    supportedCurrencies: ['usd', 'thb'],
    localizeDataPath: 'data/localize',
    symbols: [
      'green_dragon', 'red_dragon', 'white_dragon',
      '8_wan', '5_dots', '5_bamboo', '3_dots', '2_dots', '2_bamboo',
      'wild', 'scatter',
    ],
    maxWinMultiplier: 5000,
  },
];

/**
 * Get the engine config for a game.
 */
export function getEngineForGame(game: GameConfig): EngineConfig {
  const engine = engines[game.engineId];
  if (!engine) {
    throw new Error(`Engine "${game.engineId}" not found for game "${game.id}"`);
  }
  return engine;
}

/**
 * Build the full game URL with lang and currency params.
 */
export function buildGameUrl(game: GameConfig, lang: string, currency: string): string {
  const url = new URL(game.baseUrl);
  url.searchParams.set('test', '1');
  url.searchParams.set('lang', lang);
  url.searchParams.set('currency', currency);
  return url.toString();
}
