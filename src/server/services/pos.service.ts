import { createOrderServer, getAllOrdersServer } from './order.service';
import { Customer, Order, PaymentMethod } from '@/types';
import { BillingInputItem } from './billing.service';

export interface PosCheckoutPayload {
  cashierId: string;
  cashierName: string;
  items: BillingInputItem[];
  customer?: Partial<Customer>;
  orderDiscount?: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  notes?: string;
  idempotencyKey?: string;
}

export async function processPosCheckout(payload: PosCheckoutPayload): Promise<Order> {
  const customerId = payload.customer?.id || 'walk-in';
  const customerName = payload.customer?.name || 'Walk-in Customer';
  const customerPhone = payload.customer?.phone || '9999999999';

  return createOrderServer({
    customerId,
    customerName,
    customerPhone,
    customerEmail: payload.customer?.email,
    customerAddress: payload.customer?.address,
    orderType: 'in-store',
    items: payload.items,
    orderDiscount: payload.orderDiscount || 0,
    paymentMethod: payload.paymentMethod,
    amountPaid: payload.amountPaid,
    notes: payload.notes,
    idempotencyKey: payload.idempotencyKey,
    cashierId: payload.cashierId,
    cashierName: payload.cashierName,
  });
}

export async function getPosTransactionsServer(cashierId?: string): Promise<Order[]> {
  const allOrders = await getAllOrdersServer({ orderType: 'in-store' });
  if (cashierId) {
    return allOrders.filter((o) => o.cashierId === cashierId);
  }
  return allOrders;
}
