import { TaxConfig } from '@/types';

export const GST_PRESETS = [
  { label: 'GST 0% (Exempt)', rate: 0 },
  { label: 'GST 5% (Essential Staples)', rate: 5 },
  { label: 'GST 12% (Processed Foods)', rate: 12 },
  { label: 'GST 18% (Standard Retail)', rate: 18 },
  { label: 'GST 28% (Luxury / Aerated)', rate: 28 },
];

export interface TaxCalculationResult {
  taxableAmount: number;
  taxAmount: number;
  totalWithTax: number;
}

/**
 * Calculates tax for an amount based on rate and whether price is inclusive or exclusive.
 * Uses integer minor units to avoid floating point precision issues.
 */
export function calculateTax(
  amount: number,
  ratePercent: number,
  isInclusive: boolean = false
): TaxCalculationResult {
  if (amount <= 0 || ratePercent <= 0) {
    return {
      taxableAmount: Math.round(amount * 100) / 100,
      taxAmount: 0,
      totalWithTax: Math.round(amount * 100) / 100,
    };
  }

  if (isInclusive) {
    // Total is amount, tax is included: tax = amount - (amount / (1 + rate/100))
    const taxable = amount / (1 + ratePercent / 100);
    const tax = amount - taxable;
    return {
      taxableAmount: Math.round(taxable * 100) / 100,
      taxAmount: Math.round(tax * 100) / 100,
      totalWithTax: Math.round(amount * 100) / 100,
    };
  } else {
    // Total is amount + tax
    const tax = (amount * ratePercent) / 100;
    const total = amount + tax;
    return {
      taxableAmount: Math.round(amount * 100) / 100,
      taxAmount: Math.round(tax * 100) / 100,
      totalWithTax: Math.round(total * 100) / 100,
    };
  }
}

/**
 * Groups tax lines by percentage rate for the invoice tax breakdown.
 */
export function groupTaxBreakdown(
  items: { taxable: number; rate: number; tax: number }[]
): { rate: number; taxable: number; tax: number }[] {
  const map = new Map<number, { taxable: number; tax: number }>();

  for (const item of items) {
    const existing = map.get(item.rate) || { taxable: 0, tax: 0 };
    map.set(item.rate, {
      taxable: Math.round((existing.taxable + item.taxable) * 100) / 100,
      tax: Math.round((existing.tax + item.tax) * 100) / 100,
    });
  }

  return Array.from(map.entries())
    .map(([rate, vals]) => ({
      rate,
      taxable: vals.taxable,
      tax: vals.tax,
    }))
    .sort((a, b) => a.rate - b.rate);
}
