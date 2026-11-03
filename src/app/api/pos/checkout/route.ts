import { NextRequest, NextResponse } from 'next/server';
import { processPosCheckout } from '@/server/services/pos.service';
import { getSessionFromRequest } from '@/lib/auth/session';
import { requireCashierOrAdmin, createAuthErrorResponse } from '@/lib/auth/rbac';
import { validateRequestBody, posCheckoutSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    // RBAC: Cashier or Admin required
    const actor = requireCashierOrAdmin(session);

    const validation = await validateRequestBody(req, posCheckoutSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { items, customer, orderDiscount, paymentMethod, amountPaid, notes, idempotencyKey } = validation.data;

    const order = await processPosCheckout({
      cashierId: actor.userId,
      cashierName: actor.name,
      items,
      customer,
      orderDiscount: orderDiscount || 0,
      paymentMethod: paymentMethod || 'cash',
      amountPaid: amountPaid || 0,
      notes,
      idempotencyKey,
    });

    logger.logOrderCreated(order.invoiceNumber, order.grandTotal, customer?.id || 'walk-in', 'in-store');

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err: any) {
    logger.error('[POS] POS checkout failed', { error: err.message });
    return createAuthErrorResponse(err);
  }
}
