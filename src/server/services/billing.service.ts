import { calculateServerTax, groupTaxBreakdowns, TaxGroupItem } from './tax.service';
import { validateCouponServer, CouponValidationResult } from './coupon.service';
import { createCurrencySnapshot } from './currency.service';
import { connectToDatabase, isDatabaseConnected } from '@/lib/db';
import { ProductModel } from '@/models/Product';
import { StoreSettingsModel } from '@/models/StoreSettings';
import { dataStore } from '../storage/dataStore';
import { INITIAL_SETTINGS } from '@/data/settings';

export interface BillingInputItem {
  productId: string;
  quantity: number;
  discountPercent?: number;
  customPrice?: number;
}

export interface AuthoritativeLineItem {
  productId: string;
  name: string;
  sku: string;
  hsnCode: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  discountPercent: number;
  discountAmount: number;
  taxRate: number;
  taxableAmount: number;
  taxAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  lineTotal: number;
}

export interface BillingQuote {
  items: AuthoritativeLineItem[];
  subtotal: number;
  itemDiscountsTotal: number;
  orderDiscount: number;
  appliedCoupon?: string;
  couponDiscount: number;
  deliveryCharge: number;
  taxableAmount: number;
  taxAmount: number;
  taxBreakdown: TaxGroupItem[];
  grandTotal: number;
  currency: {
    code: string;
    symbol: string;
    rate: number;
  };
  invoiceSnapshot: any;
}

export async function calculateAuthoritativeBill(
  inputItems: BillingInputItem[],
  options: {
    orderDiscount?: number;
    couponCode?: string;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    customerAddress?: string;
    customerGstin?: string;
    isDelivery?: boolean;
    isInterState?: boolean;
    currencyCode?: string;
    cashierName?: string;
  } = {}
): Promise<BillingQuote> {
  await connectToDatabase();

  // Load settings
  let settings: any = null;
  if (isDatabaseConnected()) {
    settings = await StoreSettingsModel.findOne();
  }
  if (!settings) {
    settings = dataStore.settings || INITIAL_SETTINGS;
  }

  const isTaxInclusive = Boolean(settings?.tax?.isInclusive);
  const isInterState = Boolean(options.isInterState);
  const currencySnapshot = createCurrencySnapshot(options.currencyCode || settings?.currency?.code || 'INR');

  const authoritativeItems: AuthoritativeLineItem[] = [];
  let rawSubtotal = 0;
  let totalItemDiscounts = 0;

  for (const item of inputItems) {
    if (item.quantity <= 0) continue;

    let product: any = null;
    if (isDatabaseConnected()) {
      product = await ProductModel.findById(item.productId);
    } else {
      product = dataStore.products.get(item.productId);
    }

    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    const unitPrice = typeof item.customPrice === 'number' && item.customPrice >= 0 ? item.customPrice : product.sellingPrice;
    const discountPercent = Math.max(0, Math.min(100, item.discountPercent || 0));

    const grossAmount = Math.round(unitPrice * item.quantity * 100) / 100;
    const discountAmount = Math.round((grossAmount * (discountPercent / 100)) * 100) / 100;
    const netAmount = Math.max(0, grossAmount - discountAmount);

    rawSubtotal += grossAmount;
    totalItemDiscounts += discountAmount;

    // Calculate tax for this line item
    const taxCalc = calculateServerTax(netAmount, product.taxRate || 0, isTaxInclusive, isInterState);

    authoritativeItems.push({
      productId: product._id ? product._id.toString() : product.id,
      name: product.name,
      sku: product.sku,
      hsnCode: product.hsnCode || '08081000',
      unit: product.unit,
      unitPrice,
      quantity: item.quantity,
      discountPercent,
      discountAmount,
      taxRate: product.taxRate || 0,
      taxableAmount: taxCalc.taxableAmount,
      taxAmount: taxCalc.taxAmount,
      cgst: taxCalc.cgst,
      sgst: taxCalc.sgst,
      igst: taxCalc.igst,
      lineTotal: isTaxInclusive ? netAmount : taxCalc.totalWithTax,
    });
  }

  const subtotal = Math.round(rawSubtotal * 100) / 100;
  const orderDiscount = Math.max(0, options.orderDiscount || 0);

  // Evaluate coupon if applied
  let appliedCoupon: string | undefined = undefined;
  let couponDiscount = 0;
  let freeShippingFromCoupon = false;

  if (options.couponCode) {
    const couponValidation: CouponValidationResult = await validateCouponServer(
      options.couponCode,
      subtotal,
      options.customerId
    );

    if (couponValidation.isValid) {
      appliedCoupon = couponValidation.code;
      couponDiscount = couponValidation.discountAmount;
      freeShippingFromCoupon = couponValidation.freeShipping;
    }
  }

  // Delivery charge calculation
  let deliveryCharge = 0;
  if (options.isDelivery) {
    const baseDelivery = settings?.operations?.deliveryCharge ?? 40;
    const freeThreshold = settings?.storefront?.freeDeliveryThreshold ?? 499;

    if (freeShippingFromCoupon || subtotal >= freeThreshold) {
      deliveryCharge = 0;
    } else {
      deliveryCharge = baseDelivery;
    }
  }

  // Aggregate taxes
  const taxBreakdown = groupTaxBreakdowns(
    authoritativeItems.map((i) => ({
      taxableAmount: i.taxableAmount,
      taxAmount: i.taxAmount,
      taxRate: i.taxRate,
    })),
    isInterState
  );

  const totalTaxable = Math.round(taxBreakdown.reduce((sum, t) => sum + t.taxable, 0) * 100) / 100;
  const totalTax = Math.round(taxBreakdown.reduce((sum, t) => sum + t.tax, 0) * 100) / 100;

  // Grand total calculation
  let grandTotal = 0;
  if (isTaxInclusive) {
    // If tax is inclusive, line totals already contain tax
    const sumLineTotals = authoritativeItems.reduce((acc, it) => acc + it.lineTotal, 0);
    grandTotal = Math.max(0, sumLineTotals - orderDiscount - couponDiscount + deliveryCharge);
  } else {
    // If tax is exclusive, grandTotal = taxable + tax + delivery - discounts
    grandTotal = Math.max(0, totalTaxable + totalTax - orderDiscount - couponDiscount + deliveryCharge);
  }
  grandTotal = Math.round(grandTotal * 100) / 100;

  // Build immutable invoice snapshot
  const invoiceSnapshot = {
    sellerDetails: {
      companyName: settings.companyName || 'Avani Grocers',
      gstin: settings.gstin || '06AACCA1234F1Z5',
      address: settings.address || 'Shop 101-104 Horizon Prime Galleria, Golf Course Road, Gurugram, 122002',
      phone: settings.phone || '+91 98765 43210',
      email: settings.email || 'orders@avanigrocers.com',
      state: settings.state || 'Haryana',
    },
    customerDetails: {
      id: options.customerId || 'walk-in',
      name: options.customerName || 'Walk-in Customer',
      phone: options.customerPhone || 'N/A',
      email: options.customerEmail || '',
      address: options.customerAddress || '',
      gstin: options.customerGstin || '',
    },
    items: authoritativeItems.map((i) => ({
      productId: i.productId,
      name: i.name,
      sku: i.sku,
      hsnCode: i.hsnCode,
      unit: i.unit,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      discount: i.discountAmount,
      taxableValue: i.taxableAmount,
      taxRate: i.taxRate,
      cgst: i.cgst,
      sgst: i.sgst,
      igst: i.igst,
      total: i.lineTotal,
    })),
    subtotal,
    itemDiscountsTotal: totalItemDiscounts,
    orderDiscount,
    couponDiscount,
    appliedCoupon,
    taxableValue: totalTaxable,
    cgstTotal: Math.round(taxBreakdown.reduce((sum, t) => sum + t.cgst, 0) * 100) / 100,
    sgstTotal: Math.round(taxBreakdown.reduce((sum, t) => sum + t.sgst, 0) * 100) / 100,
    igstTotal: Math.round(taxBreakdown.reduce((sum, t) => sum + t.igst, 0) * 100) / 100,
    taxTotal: totalTax,
    deliveryCharge,
    grandTotal,
    currency: currencySnapshot,
    cashierName: options.cashierName || 'System',
    snapshotCreatedAt: new Date().toISOString(),
  };

  return {
    items: authoritativeItems,
    subtotal,
    itemDiscountsTotal: totalItemDiscounts,
    orderDiscount,
    appliedCoupon,
    couponDiscount,
    deliveryCharge,
    taxableAmount: totalTaxable,
    taxAmount: totalTax,
    taxBreakdown,
    grandTotal,
    currency: currencySnapshot,
    invoiceSnapshot,
  };
}
