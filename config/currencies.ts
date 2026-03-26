/**
 * Currency Configuration
 * 
 * Defines formatting rules for each supported currency.
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  symbolPosition: 'prefix' | 'suffix';
  thousandSeparator: string;
  decimalSeparator: string;
  decimalPrecision: number;
  betOptions: number[];
}

export const currencies: Record<string, CurrencyConfig> = {
  usd: {
    code: 'usd',
    symbol: '$',
    symbolPosition: 'prefix',
    thousandSeparator: ',',
    decimalSeparator: '.',
    decimalPrecision: 2,
    betOptions: [
      0.20, 0.40, 0.60, 0.80, 1.00, 2.00, 3.00, 5.00, 10.00,
      15.00, 20.00, 25.00, 30.00, 35.00, 40.00, 45.00, 50.00, 100.00,
    ],
  },
  thb: {
    code: 'thb',
    symbol: '฿',
    symbolPosition: 'prefix',
    thousandSeparator: ',',
    decimalSeparator: '.',
    decimalPrecision: 2,
    betOptions: [
      1, 2, 3, 5, 10, 20, 25, 50, 100,
      150, 200, 250, 300, 350, 400, 450, 500, 1000,
    ],
  },
};

/**
 * Format a currency value according to its config.
 * e.g. formatCurrency(1000.5, currencies.usd) => "$1,000.50"
 */
export function formatCurrency(value: number, config: CurrencyConfig): string {
  const formatted = value.toFixed(config.decimalPrecision);
  const [intPart, decPart] = formatted.split('.');

  const withThousands = intPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    config.thousandSeparator
  );

  const number = decPart
    ? `${withThousands}${config.decimalSeparator}${decPart}`
    : withThousands;

  return config.symbolPosition === 'prefix'
    ? `${config.symbol}${number}`
    : `${number}${config.symbol}`;
}
