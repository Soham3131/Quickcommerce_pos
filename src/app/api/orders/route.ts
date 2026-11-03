import { NextRequest, NextResponse } from 'next/server';
import {
  createOrderServer,
  getAllOrdersServer,
  getCustomerOrdersServer,
} from '@/server/services/order.service';
import { getSessionFromRequest } from '@/lib/auth/session';
import { validateRequestBody, createOrderSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const orderType = searchParams.get('orderType') || undefined;

    // RBAC: Customers can ONLY see their own orders!
    if (session && session.role === 'customer') {
      const customerOrders = await getCustomerOrdersServer(session.userId);
      return NextResponse.json({ success: true, orders: customerOrders });
    }

    // Admins and Cashiers can query all orders
    const allOrders = await getAllOrdersServer({ status, orderType });
    return NextResponse.json({ success: true, orders: allOrders });
  } catch (err: any) {
    logger.error('[Orders] Error fetching orders', { error: err.message });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);

    const validation = await validateRequestBody(req, createOrderSchema);
    if (!validation.success) {
      return validation.response;
    }

    const {
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      orderType,
      items,
      orderDiscount,
      couponCode,
      paymentMethod,
      amountPaid,
      deliverySlot,
      deliveryInstructions,
      notes,
      idempotencyKey,
    } = validation.data;

    // If customer is logged in, attach their authoritative customerId
    const resolvedCustomerId = session && session.role === 'customer' ? session.userId : (customerId || 'guest');

    const effectiveOrderType = orderType || 'delivery';

    const order = await createOrderServer({
      customerId: resolvedCustomerId,
      customerName,
      customerPhone,
      customerEmail: customerEmail || session?.email,
      customerAddress,
      orderType: effectiveOrderType,
      items,
      orderDiscount: orderDiscount || 0,
      couponCode,
      paymentMethod: paymentMethod || 'cash',
      amountPaid,
      deliverySlot,
      deliveryInstructions,
      notes,
      idempotencyKey,
      cashierId: session?.role === 'cashier' ? session.userId : 'online-storefront',
      cashierName: session?.role === 'cashier' ? session.name : 'Online Order',
    });

    logger.logOrderCreated(order.invoiceNumber, order.grandTotal, resolvedCustomerId, order.orderType);

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err: any) {
    logger.error('[Orders] Order creation failed', { error: err.message });
    return NextResponse.json(
      { success: false, error: err.message || 'Order creation failed' },
      { status: 400 }
    );
  }
}
