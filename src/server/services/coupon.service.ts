import { connectToDatabase, isDatabaseConnected } from '@/lib/db';
import { CouponModel, ICoupon } from '@/models/Coupon';
import { dataStore, StoredCoupon } from '../storage/dataStore';

export interface CouponValidationResult {
  isValid: boolean;
  code: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  discountAmount: number;
  freeShipping: boolean;
  message: string;
  coupon?: any;
}

export async function validateCouponServer(
  code: string,
  cartSubtotal: number,
  customerId?: string
): Promise<CouponValidationResult> {
  const normalizedCode = code.trim().toUpperCase();

  await connectToDatabase();

  let coupon: any = null;

  if (isDatabaseConnected()) {
    coupon = await CouponModel.findOne({ code: normalizedCode });
  } else {
    coupon = dataStore.coupons.get(normalizedCode);
  }

  if (!coupon) {
    return {
      isValid: false,
      code: normalizedCode,
      discountType: 'fixed',
      discountValue: 0,
      discountAmount: 0,
      freeShipping: false,
      message: `Coupon code '${normalizedCode}' is not recognized.`,
    };
  }

  if (!coupon.isActive) {
    return {
      isValid: false,
      code: normalizedCode,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: 0,
      freeShipping: false,
      message: `Coupon '${normalizedCode}' is currently inactive.`,
    };
  }

  // Check valid dates
  const now = new Date();
  if (coupon.validFrom && new Date(coupon.validFrom) > now) {
    return {
      isValid: false,
      code: normalizedCode,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: 0,
      freeShipping: false,
      message: `Coupon '${normalizedCode}' is not yet valid.`,
    };
  }

  if (coupon.validUntil && new Date(coupon.validUntil) < now) {
    return {
      isValid: false,
      code: normalizedCode,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: 0,
      freeShipping: false,
      message: `Coupon '${normalizedCode}' has expired.`,
    };
  }

  // Check minimum order
  if (cartSubtotal < coupon.minOrder) {
    return {
      isValid: false,
      code: normalizedCode,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: 0,
      freeShipping: false,
      message: `Add ₹${Math.round(coupon.minOrder - cartSubtotal)} more to qualify for coupon '${normalizedCode}'. (Min. ₹${coupon.minOrder})`,
    };
  }

  // Check total usage limit
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return {
      isValid: false,
      code: normalizedCode,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: 0,
      freeShipping: false,
      message: `Coupon '${normalizedCode}' has reached its maximum redemptions.`,
    };
  }

  // Check per-customer limit
  if (customerId && coupon.perCustomerLimit) {
    const usages = coupon.customerUsage || [];
    const customerRecord = usages.find((u: any) => u.customerId === customerId);
    if (customerRecord && customerRecord.count >= coupon.perCustomerLimit) {
      return {
        isValid: false,
        code: normalizedCode,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: 0,
        freeShipping: false,
        message: `You have already redeemed coupon '${normalizedCode}' the maximum allowed times.`,
      };
    }
  }

  // Calculate discount amount
  let discountAmount = 0;
  let freeShipping = Boolean(coupon.freeShipping || coupon.discountType === 'free_shipping');

  if (coupon.discountType === 'percentage') {
    discountAmount = (cartSubtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else if (coupon.discountType === 'fixed') {
    discountAmount = Math.min(coupon.discountValue, cartSubtotal);
  } else if (coupon.discountType === 'free_shipping') {
    freeShipping = true;
    discountAmount = 0; // Deducted from delivery fee
  }

  discountAmount = Math.round(discountAmount * 100) / 100;

  return {
    isValid: true,
    code: normalizedCode,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
    freeShipping,
    message: `Coupon '${normalizedCode}' applied successfully!`,
    coupon,
  };
}

export async function incrementCouponUsage(code: string, customerId?: string): Promise<void> {
  const normalizedCode = code.trim().toUpperCase();
  await connectToDatabase();

  if (isDatabaseConnected()) {
    const updateOps: any = { $inc: { usageCount: 1 } };
    if (customerId) {
      const existing = await CouponModel.findOne({
        code: normalizedCode,
        'customerUsage.customerId': customerId,
      });

      if (existing) {
        await CouponModel.updateOne(
          { code: normalizedCode, 'customerUsage.customerId': customerId },
          { $inc: { 'customerUsage.$.count': 1 } }
        );
        return;
      } else {
        updateOps.$push = { customerUsage: { customerId, count: 1 } };
      }
    }
    await CouponModel.updateOne({ code: normalizedCode }, updateOps);
  } else {
    const coupon = dataStore.coupons.get(normalizedCode);
    if (coupon) {
      coupon.usageCount += 1;
      if (customerId) {
        const record = coupon.customerUsage.find((u) => u.customerId === customerId);
        if (record) {
          record.count += 1;
        } else {
          coupon.customerUsage.push({ customerId, count: 1 });
        }
      }
    }
  }
}

export async function getAllCoupons(): Promise<any[]> {
  await connectToDatabase();
  if (isDatabaseConnected()) {
    return CouponModel.find().sort({ createdAt: -1 }).lean();
  }
  return Array.from(dataStore.coupons.values());
}
