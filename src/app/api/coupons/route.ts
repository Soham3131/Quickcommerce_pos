import { NextRequest, NextResponse } from 'next/server';
import { getAllCoupons } from '@/server/services/coupon.service';
import { connectToDatabase, isDatabaseConnected } from '@/lib/db';
import { CouponModel } from '@/models/Coupon';
import { dataStore } from '@/server/storage/dataStore';
import { getSessionFromRequest } from '@/lib/auth/session';
import { requireAdmin, createAuthErrorResponse } from '@/lib/auth/rbac';
import { validateRequestBody, createCouponSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const coupons = await getAllCoupons();
    return NextResponse.json({ success: true, coupons });
  } catch (err: any) {
    logger.error('[Coupons] Error fetching coupons', { error: err.message });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    requireAdmin(session);

    const validation = await validateRequestBody(req, createCouponSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { code, description, discountType, discountValue, minOrder, maxDiscount, freeShipping, usageLimit } = validation.data;
    const normalizedCode = code.trim().toUpperCase();

    await connectToDatabase();

    if (isDatabaseConnected()) {
      const existing = await CouponModel.findOne({ code: normalizedCode });
      if (existing) {
        return NextResponse.json({ success: false, error: 'Coupon code already exists.' }, { status: 400 });
      }

      const doc = await CouponModel.create({
        code: normalizedCode,
        description: description || '',
        discountType,
        discountValue,
        minOrder: minOrder || 0,
        maxDiscount,
        freeShipping,
        usageLimit,
        usageCount: 0,
        customerUsage: [],
        isActive: true,
      });

      logger.info('[Coupons] New coupon created', { code: normalizedCode, discountType, actor: session?.name });
      return NextResponse.json({ success: true, coupon: doc }, { status: 201 });
    } else {
      const newCoupon = {
        code: normalizedCode,
        description: description || '',
        discountType,
        discountValue,
        minOrder: minOrder || 0,
        maxDiscount,
        freeShipping,
        usageLimit,
        usageCount: 0,
        customerUsage: [],
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      dataStore.coupons.set(normalizedCode, newCoupon);
      logger.info('[Coupons] New coupon created in fallback store', { code: normalizedCode });
      return NextResponse.json({ success: true, coupon: newCoupon }, { status: 201 });
    }
  } catch (err: any) {
    return createAuthErrorResponse(err);
  }
}
