import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvoiceItem {
  productId: string;
  name: string;
  sku: string;
  hsnCode: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxableValue: number;
  taxRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  invoiceDate: Date;
  orderId: string;
  orderType: string;
  sellerDetails: {
    companyName: string;
    gstin: string;
    address: string;
    phone: string;
    email: string;
    state: string;
  };
  customerDetails: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    gstin?: string;
  };
  items: IInvoiceItem[];
  subtotal: number;
  orderDiscount: number;
  couponDiscount: number;
  appliedCoupon?: string;
  taxableValue: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  taxTotal: number;
  deliveryCharge: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  currency: {
    code: string;
    symbol: string;
    rate: number;
  };
  paymentMethod: string;
  paymentStatus: string;
  cashierName?: string;
  isImmutable: boolean;
  createdAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    hsnCode: { type: String, default: '' },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    taxableValue: { type: Number, required: true },
    taxRate: { type: Number, required: true },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    invoiceDate: { type: Date, required: true, default: Date.now },
    orderId: { type: String, required: true, index: true },
    orderType: { type: String, default: 'in-store' },
    sellerDetails: {
      companyName: { type: String, required: true },
      gstin: { type: String, default: '' },
      address: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      state: { type: String, default: 'Haryana' },
    },
    customerDetails: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      address: { type: String },
      gstin: { type: String },
    },
    items: [InvoiceItemSchema],
    subtotal: { type: Number, required: true },
    orderDiscount: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    appliedCoupon: { type: String },
    taxableValue: { type: Number, required: true },
    cgstTotal: { type: Number, default: 0 },
    sgstTotal: { type: Number, default: 0 },
    igstTotal: { type: Number, default: 0 },
    taxTotal: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    currency: {
      code: { type: String, default: 'INR' },
      symbol: { type: String, default: '₹' },
      rate: { type: Number, default: 1 },
    },
    paymentMethod: { type: String, default: 'cash' },
    paymentStatus: { type: String, default: 'paid' },
    cashierName: { type: String },
    isImmutable: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const InvoiceModel: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
