import type { GameConfig } from '../../types';

export const config: GameConfig = {
  id: 'ppc',
  name: 'Mahjong Dragon Ways',
  engineId: 'E1',
  baseUrl: 'http://localhost:3000/',
  supportedLangs: ['en', 'th', 'bd'],
  supportedCurrencies: ['usd', 'thb'],
  nodes: {},
};