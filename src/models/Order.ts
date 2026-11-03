import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export interface IOrder extends Document {
  invoiceNumber: string;
  orderType: 'in-store' | 'takeaway' | 'delivery';
  status:
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'out_for_delivery'
    | 'delivered'
    | 'completed'
    | 'cancelled'
    | 'refunded';
  paymentStatus: 'paid' | 'partial' | 'unpaid' | 'refunded';
  paymentMethod: 'cash' | 'card' | 'upi' | 'split';
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  items: IOrderItem[];
  subtotal: number;
  orderDiscount: number;
  couponDiscount?: number;
  appliedCoupon?: string;
  taxableAmount: number;
  taxAmount: number;
  taxBreakdown: { rate: number; taxable: number; tax: number }[];
  deliveryCharge: number;
  grandTotal: number;
  amountPaid: number;
  changeDue: number;
  notes?: string;
  cashierId: string;
  cashierName: string;
  deliveryPerson?: {
    name: string;
    phone: string;
    assignedAt: string;
  };
  deliveryHistory?: {
    action: string;
    timestamp: string;
    details: string;
    actor: string;
  }[];
  deliverySlot?: string;
  deliveryInstructions?: string;
  idempotencyKey?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  stockDeducted: boolean;
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    unit: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    orderType: { type: String, enum: ['in-store', 'takeaway', 'delivery'], default: 'delivery' },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'out_for_delivery',
        'delivered',
        'completed',
        'cancelled',
        'refunded',
      ],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'partial', 'unpaid', 'refunded'],
      default: 'unpaid',
      index: true,
    },
    paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'split'], default: 'cash' },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String },
    customerAddress: { type: String },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    orderDiscount: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    appliedCoupon: { type: String },
    taxableAmount: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    taxBreakdown: [
      {
        rate: { type: Number },
        taxable: { type: Number },
        tax: { type: Number },
      },
    ],
    deliveryCharge: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    changeDue: { type: Number, default: 0 },
    notes: { type: String },
    cashierId: { type: String, default: 'online-storefront' },
    cashierName: { type: String, default: 'Online Order' },
    deliveryPerson: {
      name: { type: String },
      phone: { type: String },
      assignedAt: { type: String },
    },
    deliveryHistory: [
      {
        action: { type: String },
        timestamp: { type: String },
        details: { type: String },
        actor: { type: String },
      },
    ],
    deliverySlot: { type: String },
    deliveryInstructions: { type: String },
    idempotencyKey: { type: String, sparse: true, unique: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    stockDeducted: { type: Boolean, default: true },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const OrderModel: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
