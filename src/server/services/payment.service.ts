import crypto from 'crypto';
import { env, isRazorpayConfigured } from '@/lib/env';
import { connectToDatabase, isDatabaseConnected } from '@/lib/db';
import { OrderModel } from '@/models/Order';
import { dataStore } from '../storage/dataStore';

export interface RazorpayOrderResult {
  isConfigured: boolean;
  isDemoMode: boolean;
  orderId: string;
  amount: number; // in paise (e.g. ₹500.00 = 50000 paise)
  currency: string;
  keyId?: string;
  message?: string;
}

/**
 * Create a payment order via Razorpay API or prepare demo fallback.
 */
export async function createRazorpayOrder(
  amountInInr: number,
  receiptInvoice: string,
  customerNotes?: Record<string, string>
): Promise<RazorpayOrderResult> {
  const amountInPaise = Math.round(amountInInr * 100);

  if (isRazorpayConfigured()) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: receiptInvoice,
          notes: customerNotes || {},
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Razorpay] Order creation failed:', errorText);
        throw new Error(`Razorpay gateway error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        isConfigured: true,
        isDemoMode: false,
        orderId: data.id,
        amount: data.amount,
        currency: data.currency,
        keyId: env.RAZORPAY_KEY_ID,
      };
    } catch (err: any) {
      console.warn('[Razorpay] Falling back to demo mode due to connection error:', err.message);
    }
  }

  // Graceful Demo / Staging Mode Fallback
  return {
    isConfigured: false,
    isDemoMode: true,
    orderId: `demo_order_${Date.now()}`,
    amount: amountInPaise,
    currency: 'INR',
    message: 'Razorpay keys not configured. Running in Demo Payment Mode.',
  };
}

/**
 * Verify Razorpay payment signature using HMAC-SHA256.
 * Signature formula: HMAC_SHA256(order_id + "|" + payment_id, secret)
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!isRazorpayConfigured()) {
    // In demo mode with demo order prefix
    if (orderId.startsWith('demo_order_')) return true;
    return false;
  }

  try {
    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'utf8'),
      Buffer.from(signature, 'utf8')
    );
  } catch (err) {
    console.error('[Razorpay] Signature verification error:', err);
    return false;
  }
}

/**
 * Verify Razorpay Webhook signature using secret.
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signatureHeader: string
): boolean {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return false;

  try {
    const generatedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'utf8'),
      Buffer.from(signatureHeader, 'utf8')
    );
  } catch {
    return false;
  }
}

/**
 * Confirm order payment after signature validation.
 */
export async function confirmOrderPayment(
  orderInvoiceNumber: string,
  razorpayPaymentId: string,
  razorpayOrderId?: string
): Promise<void> {
  await connectToDatabase();

  if (isDatabaseConnected()) {
    await OrderModel.findOneAndUpdate(
      { invoiceNumber: orderInvoiceNumber },
      {
        paymentStatus: 'paid',
        status: 'confirmed',
        razorpayPaymentId,
        razorpayOrderId,
      }
    );
  } else {
    for (const ord of Array.from(dataStore.orders.values())) {
      if (ord.invoiceNumber === orderInvoiceNumber) {
        ord.paymentStatus = 'paid';
        ord.status = 'confirmed';
        break;
      }
    }
  }
}
