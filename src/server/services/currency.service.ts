/**
 * Authoritative Server-Side Currency & Exchange Snapshot Service
 */

export interface CurrencyPreset {
  code: string;
  symbol: string;
  name: string;
  position: 'before' | 'after';
  decimalPlaces: number;
  rate: number; // Base currency: INR = 1.0
}

export const SERVER_CURRENCY_PRESETS: CurrencyPreset[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', position: 'before', decimalPlaces: 2, rate: 1.0 },
  { code: 'USD', symbol: '$', name: 'US Dollar', position: 'before', decimalPlaces: 2, rate: 0.012 },
  { code: 'EUR', symbol: '€', name: 'Euro', position: 'before', decimalPlaces: 2, rate: 0.011 },
  { code: 'GBP', symbol: '£', name: 'British Pound', position: 'before', decimalPlaces: 2, rate: 0.0095 },
  { code: 'AED', symbol: 'AED ', name: 'UAE Dirham', position: 'before', decimalPlaces: 2, rate: 0.044 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', position: 'before', decimalPlaces: 2, rate: 0.016 },
];

export function getCurrencyConfigByCode(code = 'INR'): CurrencyPreset {
  const found = SERVER_CURRENCY_PRESETS.find((c) => c.code.toUpperCase() === code.toUpperCase());
  return found || SERVER_CURRENCY_PRESETS[0];
}

export function convertFromInr(amountInInr: number, targetCurrencyCode = 'INR'): number {
  const config = getCurrencyConfigByCode(targetCurrencyCode);
  const converted = amountInInr * config.rate;
  return Math.round(converted * 100) / 100;
}

export function formatCurrencyAmount(amount: number, config: CurrencyPreset): string {
  const formatted = amount.toFixed(config.decimalPlaces);
  return config.position === 'before' ? `${config.symbol}${formatted}` : `${formatted} ${config.symbol}`;
}

export function createCurrencySnapshot(code = 'INR') {
  const config = getCurrencyConfigByCode(code);
  return {
    code: config.code,
    symbol: config.symbol,
    rate: config.rate,
    formattedAt: new Date().toISOString(),
  };
}
