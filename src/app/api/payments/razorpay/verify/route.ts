import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpaySignature, confirmOrderPayment } from '@/server/services/payment.service';
import { validateRequestBody, razorpayVerifySchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const validation = await validateRequestBody(req, razorpayVerifySchema);
    if (!validation.success) {
      return validation.response;
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderInvoiceNumber } = validation.data;

    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature || ''
    );

    if (!isValid) {
      logger.warn('[Payments] Signature verification failed', { razorpayOrderId, razorpayPaymentId });
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature. Payment verification failed.' },
        { status: 400 }
      );
    }

    if (orderInvoiceNumber) {
      await confirmOrderPayment(orderInvoiceNumber, razorpayPaymentId, razorpayOrderId);
      logger.info('[Payments] Order payment confirmed and verified', {
        invoiceNumber: orderInvoiceNumber,
        razorpayPaymentId,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed successfully.',
    });
  } catch (err: any) {
    logger.error('[Payments] Signature verification error', { error: err.message });
    return NextResponse.json(
      { success: false, error: 'Signature verification error' },
      { status: 500 }
    );
  }
}
