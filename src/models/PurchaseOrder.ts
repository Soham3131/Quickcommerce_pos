import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPurchaseItem {
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

export interface IPurchaseOrder extends Document {
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  invoiceReference: string;
  purchaseDate: string;
  status: 'ordered' | 'received' | 'cancelled';
  items: IPurchaseItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  paymentStatus: 'paid' | 'pending' | 'partial';
  receivedAt?: Date;
  stockUpdated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseItemSchema = new Schema<IPurchaseItem>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const PurchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    purchaseNumber: { type: String, required: true, unique: true, index: true },
    supplierId: { type: String, required: true, index: true },
    supplierName: { type: String, required: true },
    invoiceReference: { type: String, default: '' },
    purchaseDate: { type: String, required: true },
    status: { type: String, enum: ['ordered', 'received', 'cancelled'], default: 'ordered', index: true },
    items: [PurchaseItemSchema],
    subtotal: { type: Number, required: true },
    taxTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['paid', 'pending', 'partial'], default: 'pending' },
    receivedAt: { type: Date },
    stockUpdated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PurchaseOrderModel: Model<IPurchaseOrder> =
  mongoose.models.PurchaseOrder || mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);
