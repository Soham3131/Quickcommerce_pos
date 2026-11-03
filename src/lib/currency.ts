import { CurrencyConfig } from '@/types';

export const CURRENCY_PRESETS: CurrencyConfig[] = [
  {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee (INR)',
    position: 'before',
    decimalPlaces: 2,
    rate: 1,
  },
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar (USD)',
    position: 'before',
    decimalPlaces: 2,
    rate: 0.012, // 1 USD ≈ ₹83.33
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro (EUR)',
    position: 'before',
    decimalPlaces: 2,
    rate: 0.011, // 1 EUR ≈ ₹90.91
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound (GBP)',
    position: 'before',
    decimalPlaces: 2,
    rate: 0.0095, // 1 GBP ≈ ₹105.26
  },
  {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham (AED)',
    position: 'after',
    decimalPlaces: 2,
    rate: 0.044, // 1 AED ≈ ₹22.73
  },
  {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar (CAD)',
    position: 'before',
    decimalPlaces: 2,
    rate: 0.016, // 1 CAD ≈ ₹62.50
  },
];

let globalCurrencyConfig: CurrencyConfig = CURRENCY_PRESETS[0];

export function setGlobalCurrency(config: CurrencyConfig) {
  globalCurrencyConfig = config;
}

export function getGlobalCurrency(): CurrencyConfig {
  return globalCurrencyConfig;
}

/**
 * Centralized currency formatting & conversion utility.
 * Applies configured exchange rate relative to base store currency (INR = 1)
 * and formats using the target currency symbol, precision, and position.
 */
export function formatCurrency(
  amount: number | null | undefined,
  config?: Partial<CurrencyConfig>
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    amount = 0;
  }

  const active = { ...globalCurrencyConfig, ...config };
  const decimals = active.decimalPlaces ?? 2;
  const rate = active.rate ?? 1;

  // Apply explicit configured conversion rate
  const convertedAmount = amount * rate;
  
  // Format with standard locale grouping
  const formattedNumber = convertedAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (active.position === 'after') {
    return `${formattedNumber} ${active.symbol}`;
  }
  return `${active.symbol}${formattedNumber}`;
}
