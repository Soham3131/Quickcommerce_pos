import { NextRequest, NextResponse } from 'next/server';
import {
  getOrderByIdServer,
  updateOrderStatusServer,
  assignDeliveryRiderServer,
  cancelOrderServer,
} from '@/server/services/order.service';
import { getSessionFromRequest } from '@/lib/auth/session';
import { assertCustomerAccess } from '@/lib/auth/rbac';
import { validateRequestBody, updateOrderStatusSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    const order = await getOrderByIdServer(params.id);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Customer Isolation Check: Customers can only access their own order
    if (session && session.role === 'customer') {
      const isOwner = assertCustomerAccess(session, order.customerId);
      if (!isOwner) {
        logger.logFailedAuthorization(`/api/orders/${params.id}`, session.role, ['admin', 'owner']);
        return NextResponse.json(
          { success: false, error: 'Forbidden. You do not have permission to view this order.' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    logger.error('[Orders] Error fetching order detail', { orderId: params.id, error: err.message });
    return NextResponse.json(
      { success: false, error: 'Error fetching order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    const actorName = session?.name || 'Store Staff';

    const validation = await validateRequestBody(req, updateOrderStatusSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { action, status, riderName, riderPhone, cancelReason } = validation.data;

    if (action === 'assign_rider') {
      if (!riderName || !riderPhone) {
        return NextResponse.json(
          { success: false, error: 'Rider name and phone are required.' },
          { status: 400 }
        );
      }
      const updated = await assignDeliveryRiderServer(params.id, riderName, riderPhone, actorName);
      logger.info('[Orders] Delivery rider assigned', { orderId: params.id, riderName, riderPhone, actor: actorName });
      return NextResponse.json({ success: true, order: updated });
    }

    if (action === 'cancel' || status === 'cancelled') {
      const updated = await cancelOrderServer(params.id, cancelReason || 'Cancelled by staff/customer', actorName);
      logger.logStockReversal(updated.invoiceNumber, updated.items.length, actorName);
      return NextResponse.json({ success: true, order: updated });
    }

    if (status) {
      const updated = await updateOrderStatusServer(params.id, status, actorName);
      logger.info('[Orders] Order status updated', { orderId: params.id, newStatus: status, actor: actorName });
      return NextResponse.json({ success: true, order: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid update action.' }, { status: 400 });
  } catch (err: any) {
    logger.error('[Orders] Error updating order', { orderId: params.id, error: err.message });
    return NextResponse.json(
      { success: false, error: err.message || 'Error updating order' },
      { status: 500 }
    );
  }
}
