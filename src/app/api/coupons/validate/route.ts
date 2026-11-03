import { NextRequest, NextResponse } from 'next/server';
import { validateCouponServer } from '@/server/services/coupon.service';
import { getSessionFromRequest } from '@/lib/auth/session';
import { validateRequestBody, validateCouponSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);

    const validation = await validateRequestBody(req, validateCouponSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { code, cartSubtotal } = validation.data;
    const customerId = session?.userId;

    const result = await validateCouponServer(code, cartSubtotal, customerId);

    logger.debug('[Coupons] Coupon validated', {
      code,
      subtotal: cartSubtotal,
      isValid: result.isValid,
      discountAmount: result.discountAmount,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    logger.error('[Coupons] Coupon validation error', { error: err.message });
    return NextResponse.json(
      { isValid: false, message: 'Coupon validation failed' },
      { status: 500 }
    );
  }
}
