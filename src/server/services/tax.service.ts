/**
 * Authoritative Server-Side Tax & GST Engine
 * Supports GST rates (0%, 5%, 12%, 18%, 28%), inclusive and exclusive calculations,
 * and intra-state (CGST + SGST) vs inter-state (IGST) breakdowns.
 */

export interface TaxCalculationResult {
  taxableAmount: number;
  taxAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalWithTax: number;
}

export function calculateServerTax(
  amount: number,
  taxRate: number,
  isInclusive = false,
  isInterState = false
): TaxCalculationResult {
  if (!taxRate || taxRate <= 0 || amount <= 0) {
    return {
      taxableAmount: Math.round(amount * 100) / 100,
      taxAmount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalWithTax: Math.round(amount * 100) / 100,
    };
  }

  let taxableAmount: number;
  let taxAmount: number;

  if (isInclusive) {
    taxableAmount = amount / (1 + taxRate / 100);
    taxAmount = amount - taxableAmount;
  } else {
    taxableAmount = amount;
    taxAmount = amount * (taxRate / 100);
  }

  taxableAmount = Math.round(taxableAmount * 100) / 100;
  taxAmount = Math.round(taxAmount * 100) / 100;
  const totalWithTax = Math.round((taxableAmount + taxAmount) * 100) / 100;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isInterState) {
    igst = taxAmount;
  } else {
    cgst = Math.round((taxAmount / 2) * 100) / 100;
    sgst = Math.round((taxAmount - cgst) * 100) / 100;
  }

  return {
    taxableAmount,
    taxAmount,
    cgst,
    sgst,
    igst,
    totalWithTax,
  };
}

export interface TaxGroupItem {
  rate: number;
  taxable: number;
  tax: number;
  cgst: number;
  sgst: number;
  igst: number;
}

export function groupTaxBreakdowns(
  items: { taxableAmount: number; taxAmount: number; taxRate: number }[],
  isInterState = false
): TaxGroupItem[] {
  const map = new Map<number, TaxGroupItem>();

  for (const item of items) {
    const existing = map.get(item.taxRate) || {
      rate: item.taxRate,
      taxable: 0,
      tax: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
    };

    existing.taxable = Math.round((existing.taxable + item.taxableAmount) * 100) / 100;
    existing.tax = Math.round((existing.tax + item.taxAmount) * 100) / 100;

    if (isInterState) {
      existing.igst = existing.tax;
    } else {
      existing.cgst = Math.round((existing.tax / 2) * 100) / 100;
      existing.sgst = Math.round((existing.tax - existing.cgst) * 100) / 100;
    }

    map.set(item.taxRate, existing);
  }

  return Array.from(map.values()).sort((a, b) => a.rate - b.rate);
}
