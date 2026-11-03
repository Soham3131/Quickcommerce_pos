import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInventoryTransaction extends Document {
  transactionId: string;
  productId: string;
  sku: string;
  type: 'add' | 'remove' | 'damage' | 'expiry' | 'correction' | 'sale' | 'purchase' | 'cancellation_restore';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  referenceInvoice?: string;
  source: 'online_order' | 'pos_sale' | 'purchase_order' | 'manual_adjustment' | 'cancellation';
  adjustedBy: string;
  idempotencyKey?: string;
  createdAt: Date;
}

const InventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    productId: { type: String, required: true, index: true },
    sku: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['add', 'remove', 'damage', 'expiry', 'correction', 'sale', 'purchase', 'cancellation_restore'],
      required: true,
    },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reason: { type: String, required: true },
    referenceInvoice: { type: String, index: true },
    source: {
      type: String,
      enum: ['online_order', 'pos_sale', 'purchase_order', 'manual_adjustment', 'cancellation'],
      required: true,
      index: true,
    },
    adjustedBy: { type: String, required: true },
    idempotencyKey: { type: String, sparse: true, unique: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const InventoryTransactionModel: Model<IInventoryTransaction> =
  mongoose.models.InventoryTransaction ||
  mongoose.model<IInventoryTransaction>('InventoryTransaction', InventoryTransactionSchema);
