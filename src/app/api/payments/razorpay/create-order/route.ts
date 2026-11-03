import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/server/services/payment.service';
import { validateRequestBody, razorpayCreateOrderSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const validation = await validateRequestBody(req, razorpayCreateOrderSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { amount, receiptInvoice, notes } = validation.data;

    const result = await createRazorpayOrder(
      amount,
      receiptInvoice || `RCPT-${Date.now()}`,
      notes
    );

    logger.info('[Payments] Payment order generated', {
      orderId: result.orderId,
      amount,
      isDemoMode: result.isDemoMode,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    logger.error('[Payments] Razorpay order creation failed', { error: err.message });
    return NextResponse.json(
      { success: false, error: err.message || 'Razorpay order creation failed' },
      { status: 500 }
    );
  }
}
