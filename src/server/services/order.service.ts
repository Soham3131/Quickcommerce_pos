import { connectToDatabase, isDatabaseConnected } from '@/lib/db';
import { OrderModel, IOrder } from '@/models/Order';
import { InvoiceModel } from '@/models/Invoice';
import { dataStore } from '../storage/dataStore';
import { Order, OrderStatus, OrderType, PaymentMethod } from '@/types';
import { calculateAuthoritativeBill, BillingInputItem } from './billing.service';
import { deductInventoryForOrder, restoreInventoryForOrder } from './inventory.service';
import { incrementCouponUsage } from './coupon.service';

function normalizeOrder(doc: any): Order {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  return {
    ...obj,
    id: obj._id ? obj._id.toString() : obj.id,
    _id: undefined,
    __v: undefined,
  };
}

export interface CreateOrderPayload {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  orderType: OrderType;
  items: BillingInputItem[];
  orderDiscount?: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  amountPaid?: number;
  deliverySlot?: string;
  deliveryInstructions?: string;
  notes?: string;
  idempotencyKey?: string;
  cashierId?: string;
  cashierName?: string;
}

export async function createOrderServer(payload: CreateOrderPayload): Promise<Order> {
  await connectToDatabase();

  const invoiceNumber = `AVN-${Date.now().toString().slice(-6)}`;
  const idempotencyKey = payload.idempotencyKey || `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  // 1. Calculate authoritative totals on the server
  const quote = await calculateAuthoritativeBill(payload.items, {
    orderDiscount: payload.orderDiscount,
    couponCode: payload.couponCode,
    customerId: payload.customerId,
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    customerEmail: payload.customerEmail,
    customerAddress: payload.customerAddress,
    isDelivery: payload.orderType === 'delivery',
    cashierName: payload.cashierName,
  });

  // 2. Atomically deduct inventory with concurrency protection
  await deductInventoryForOrder(
    payload.items.map((it) => ({ productId: it.productId, quantity: it.quantity })),
    invoiceNumber,
    payload.orderType === 'in-store' ? 'pos_sale' : 'online_order',
    payload.cashierName || payload.customerName || 'Customer',
    idempotencyKey
  );

  // 3. Increment coupon usage if valid coupon applied
  if (quote.appliedCoupon) {
    await incrementCouponUsage(quote.appliedCoupon, payload.customerId);
  }

  // 4. Determine initial order and payment status
  const isPaid = payload.paymentMethod !== 'cash' || (payload.amountPaid && payload.amountPaid >= quote.grandTotal);
  const paymentStatus = isPaid ? 'paid' : 'unpaid';
  const initialStatus: OrderStatus = payload.orderType === 'in-store' ? 'completed' : 'pending';

  const orderData: any = {
    invoiceNumber,
    orderType: payload.orderType,
    status: initialStatus,
    paymentStatus,
    paymentMethod: payload.paymentMethod,
    customerId: payload.customerId || 'walk-in',
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    customerEmail: payload.customerEmail,
    customerAddress: payload.customerAddress,
    items: quote.items.map((i) => ({
      productId: i.productId,
      productName: i.name,
      sku: i.sku,
      unit: i.unit,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      discount: i.discountAmount,
      taxRate: i.taxRate,
      taxAmount: i.taxAmount,
      total: i.lineTotal,
    })),
    subtotal: quote.subtotal,
    orderDiscount: quote.orderDiscount,
    couponDiscount: quote.couponDiscount,
    appliedCoupon: quote.appliedCoupon,
    taxableAmount: quote.taxableAmount,
    taxAmount: quote.taxAmount,
    taxBreakdown: quote.taxBreakdown,
    deliveryCharge: quote.deliveryCharge,
    grandTotal: quote.grandTotal,
    amountPaid: payload.amountPaid !== undefined ? payload.amountPaid : (isPaid ? quote.grandTotal : 0),
    changeDue: payload.amountPaid && payload.amountPaid > quote.grandTotal ? Math.round((payload.amountPaid - quote.grandTotal) * 100) / 100 : 0,
    notes: payload.notes,
    cashierId: payload.cashierId || 'online-storefront',
    cashierName: payload.cashierName || 'Online Order',
    deliverySlot: payload.deliverySlot,
    deliveryInstructions: payload.deliveryInstructions,
    idempotencyKey,
    stockDeducted: true,
    createdAt: new Date().toISOString(),
    deliveryHistory: [
      {
        action: 'Order Placed',
        timestamp: new Date().toISOString(),
        details: `Order created via ${payload.orderType}`,
        actor: payload.cashierName || 'Customer',
      },
    ],
  };

  if (isDatabaseConnected()) {
    const created = await OrderModel.create(orderData);

    // Create immutable invoice record in database
    await InvoiceModel.create({
      invoiceNumber,
      orderId: created._id.toString(),
      orderType: payload.orderType,
      ...quote.invoiceSnapshot,
      amountPaid: orderData.amountPaid,
      balanceDue: Math.max(0, quote.grandTotal - orderData.amountPaid),
      paymentMethod: payload.paymentMethod,
      paymentStatus,
      isImmutable: true,
    });

    return normalizeOrder(created);
  } else {
    const id = `ord-${Date.now()}`;
    const orderWithId = { ...orderData, id };
    dataStore.orders.set(id, orderWithId);
    return orderWithId;
  }
}

export async function getOrderByIdServer(id: string): Promise<Order | null> {
  await connectToDatabase();
  if (isDatabaseConnected()) {
    try {
      const doc = await OrderModel.findById(id);
      if (doc) return normalizeOrder(doc);
      // Fallback search by invoice number
      const docByInv = await OrderModel.findOne({ invoiceNumber: id });
      if (docByInv) return normalizeOrder(docByInv);
    } catch {
      return null;
    }
  }

  const found = dataStore.orders.get(id);
  if (found) return found;

  for (const ord of dataStore.orders.values()) {
    if (ord.invoiceNumber === id) return ord;
  }
  return null;
}

export async function getCustomerOrdersServer(customerId: string): Promise<Order[]> {
  await connectToDatabase();
  if (isDatabaseConnected()) {
    const docs = await OrderModel.find({ customerId }).sort({ createdAt: -1 });
    return docs.map(normalizeOrder);
  }

  return Array.from(dataStore.orders.values())
    .filter((o) => o.customerId === customerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAllOrdersServer(filters: { status?: string; orderType?: string } = {}): Promise<Order[]> {
  await connectToDatabase();
  if (isDatabaseConnected()) {
    const q: any = {};
    if (filters.status && filters.status !== 'all') q.status = filters.status;
    if (filters.orderType && filters.orderType !== 'all') q.orderType = filters.orderType;

    const docs = await OrderModel.find(q).sort({ createdAt: -1 });
    return docs.map(normalizeOrder);
  }

  let list = Array.from(dataStore.orders.values());
  if (filters.status && filters.status !== 'all') {
    list = list.filter((o) => o.status === filters.status);
  }
  if (filters.orderType && filters.orderType !== 'all') {
    list = list.filter((o) => o.orderType === filters.orderType);
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateOrderStatusServer(
  orderId: string,
  newStatus: OrderStatus,
  actorName: string
): Promise<Order> {
  await connectToDatabase();

  const historyItem = {
    action: `Status Updated to ${newStatus.toUpperCase()}`,
    timestamp: new Date().toISOString(),
    details: `Order status changed to ${newStatus}`,
    actor: actorName,
  };

  if (isDatabaseConnected()) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error('Order not found');

    order.status = newStatus;
    order.deliveryHistory = order.deliveryHistory || [];
    order.deliveryHistory.push(historyItem);
    if (newStatus === 'completed' || newStatus === 'delivered') {
      order.completedAt = new Date();
    }
    await order.save();
    return normalizeOrder(order);
  } else {
    const order = dataStore.orders.get(orderId);
    if (!order) throw new Error('Order not found');

    order.status = newStatus;
    order.deliveryHistory = order.deliveryHistory || [];
    order.deliveryHistory.push(historyItem);
    if (newStatus === 'completed' || newStatus === 'delivered') {
      order.completedAt = new Date().toISOString();
    }
    return order;
  }
}

export async function assignDeliveryRiderServer(
  orderId: string,
  riderName: string,
  riderPhone: string,
  actorName: string
): Promise<Order> {
  await connectToDatabase();

  const assignment = {
    name: riderName,
    phone: riderPhone,
    assignedAt: new Date().toISOString(),
  };

  const historyItem = {
    action: 'Delivery Partner Assigned',
    timestamp: new Date().toISOString(),
    details: `Assigned to rider ${riderName} (${riderPhone})`,
    actor: actorName,
  };

  if (isDatabaseConnected()) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error('Order not found');

    order.deliveryPerson = assignment;
    order.status = 'out_for_delivery';
    order.deliveryHistory = order.deliveryHistory || [];
    order.deliveryHistory.push(historyItem);
    await order.save();
    return normalizeOrder(order);
  } else {
    const order = dataStore.orders.get(orderId);
    if (!order) throw new Error('Order not found');

    order.deliveryPerson = assignment;
    order.status = 'out_for_delivery';
    order.deliveryHistory = order.deliveryHistory || [];
    order.deliveryHistory.push(historyItem);
    return order;
  }
}

export async function cancelOrderServer(
  orderId: string,
  reason: string,
  actorName: string
): Promise<Order> {
  await connectToDatabase();

  const historyItem = {
    action: 'Order Cancelled',
    timestamp: new Date().toISOString(),
    details: `Cancellation reason: ${reason}`,
    actor: actorName,
  };

  if (isDatabaseConnected()) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error('Order not found');

    if (order.status === 'cancelled') {
      return normalizeOrder(order);
    }

    // Protect stock: only restore if stock was deducted and not yet restored
    if (order.stockDeducted) {
      await restoreInventoryForOrder(
        order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        order.invoiceNumber,
        actorName,
        order._id.toString()
      );
      order.stockDeducted = false;
    }

    order.status = 'cancelled';
    order.deliveryHistory = order.deliveryHistory || [];
    order.deliveryHistory.push(historyItem);
    await order.save();
    return normalizeOrder(order);
  } else {
    const order = dataStore.orders.get(orderId);
    if (!order) throw new Error('Order not found');

    if (order.status === 'cancelled') {
      return order;
    }

    if (order.stockDeducted) {
      await restoreInventoryForOrder(
        order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        order.invoiceNumber,
        actorName,
        order.id
      );
      order.stockDeducted = false;
    }

    order.status = 'cancelled';
    order.deliveryHistory = order.deliveryHistory || [];
    order.deliveryHistory.push(historyItem);
    return order;
  }
}
