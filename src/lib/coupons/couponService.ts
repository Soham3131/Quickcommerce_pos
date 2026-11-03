import { DemoCoupon, StoreSettings } from '@/types';

export const DEFAULT_DEMO_COUPONS: DemoCoupon[] = [
  {
    code: 'WELCOME50',
    description: '10% instant savings on your first grocery basket (min order ₹300)',
    discountType: 'percentage',
    discountValue: 10,
    minOrder: 300,
    maxDiscount: 150,
    isActive: true,
    discountPercent: 10,
  },
  {
    code: 'FREESHIP',
    description: 'Free Express Home Delivery on all orders',
    discountType: 'free_shipping',
    discountValue: 0,
    minOrder: 0,
    isActive: true,
    discountPercent: 0,
  },
  {
    code: 'AVANI15',
    description: '15% savings on family pantry stock-ups above ₹1000',
    discountType: 'percentage',
    discountValue: 15,
    minOrder: 1000,
    maxDiscount: 300,
    isActive: true,
    discountPercent: 15,
  },
];

export interface CouponValidationResult {
  isValid: boolean;
  coupon?: DemoCoupon;
  discountAmount: number;
  isFreeShipping: boolean;
  effectiveDeliveryFee: number;
  message: string;
  error?: string;
}

/**
 * Normalizes input coupon string: removes leading/trailing spaces and converts to uppercase
 */
export function normalizeCouponCode(code: string | null | undefined): string {
  if (!code) return '';
  return code.trim().toUpperCase();
}

/**
 * Retrieves the active coupon list from store settings, falling back to defaults if unconfigured
 */
export function getStoreCoupons(settings?: StoreSettings): DemoCoupon[] {
  const configured = settings?.storefront?.demoCoupons;
  if (configured && configured.length > 0) {
    return configured.map((c) => {
      // Ensure discountType is populated even for legacy records
      if (!c.discountType) {
        if (c.code === 'FREESHIP') {
          return { ...c, discountType: 'free_shipping', discountValue: 0, isActive: c.isActive ?? true };
        }
        return {
          ...c,
          discountType: 'percentage',
          discountValue: c.discountValue ?? c.discountPercent ?? 10,
          isActive: c.isActive ?? true,
        };
      }
      return { ...c, isActive: c.isActive ?? true };
    });
  }
  return DEFAULT_DEMO_COUPONS;
}

/**
 * Authoritative coupon validator and discount calculator
 */
export function validateCoupon(
  rawCode: string | null | undefined,
  subtotal: number,
  standardDeliveryFee: number,
  settings?: StoreSettings,
  options?: { fulfillment?: 'delivery' | 'takeaway'; isFreeDeliveryByThreshold?: boolean }
): CouponValidationResult {
  const code = normalizeCouponCode(rawCode);
  const isTakeaway = options?.fulfillment === 'takeaway';
  const isThresholdFree = options?.isFreeDeliveryByThreshold ?? false;
  const baseDeliveryFee = isTakeaway ? 0 : isThresholdFree ? 0 : standardDeliveryFee;

  if (!code) {
    return {
      isValid: false,
      discountAmount: 0,
      isFreeShipping: false,
      effectiveDeliveryFee: baseDeliveryFee,
      message: '',
    };
  }

  const coupons = getStoreCoupons(settings);
  const coupon = coupons.find((c) => c.code === code);

  if (!coupon) {
    return {
      isValid: false,
      discountAmount: 0,
      isFreeShipping: false,
      effectiveDeliveryFee: baseDeliveryFee,
      message: `Coupon code "${code}" is not valid.`,
      error: 'invalid_code',
    };
  }

  if (coupon.isActive === false) {
    return {
      isValid: false,
      discountAmount: 0,
      isFreeShipping: false,
      effectiveDeliveryFee: baseDeliveryFee,
      message: `Coupon "${code}" is currently inactive.`,
      error: 'inactive_coupon',
    };
  }

  if (subtotal < coupon.minOrder) {
    const symbol = settings?.currency?.symbol || '₹';
    return {
      isValid: false,
      coupon,
      discountAmount: 0,
      isFreeShipping: false,
      effectiveDeliveryFee: baseDeliveryFee,
      message: `Minimum order value for ${code} is ${symbol}${coupon.minOrder}. Add items to qualify.`,
      error: 'min_order_not_met',
    };
  }

  // Calculate discount based on type
  let discountAmount = 0;
  let isFreeShipping = false;
  let effectiveDeliveryFee = baseDeliveryFee;

  if (coupon.discountType === 'free_shipping') {
    isFreeShipping = true;
    effectiveDeliveryFee = 0;
    discountAmount = 0;
  } else if (coupon.discountType === 'percentage') {
    const rate = coupon.discountValue || coupon.discountPercent || 0;
    const computed = Math.round((subtotal * rate) / 100);
    discountAmount = coupon.maxDiscount ? Math.min(computed, coupon.maxDiscount) : computed;
  } else if (coupon.discountType === 'fixed') {
    const fixedVal = coupon.discountValue ?? coupon.discountPercent ?? 0;
    discountAmount = Math.min(fixedVal, subtotal);
  }

  // Do not allow discount to exceed subtotal
  discountAmount = Math.max(0, Math.min(discountAmount, subtotal));

  let successMsg = `Coupon ${code} applied successfully!`;
  if (coupon.discountType === 'free_shipping') {
    successMsg = `Coupon ${code} applied: Free Express Home Delivery activated!`;
  } else {
    const symbol = settings?.currency?.symbol || '₹';
    successMsg = `Coupon ${code} applied: Saved ${symbol}${discountAmount}!`;
  }

  return {
    isValid: true,
    coupon,
    discountAmount,
    isFreeShipping,
    effectiveDeliveryFee,
    message: successMsg,
  };
}

/**
 * Returns a primary active coupon to feature in announcement bars or promotional tickers
 */
export function getFeaturedAnnouncementCoupon(settings?: StoreSettings): DemoCoupon | null {
  const coupons = getStoreCoupons(settings);
  const active = coupons.filter((c) => c.isActive !== false);
  return active.find((c) => c.code === 'WELCOME50') || active[0] || null;
}
