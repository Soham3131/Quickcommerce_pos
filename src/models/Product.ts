import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  image: string;
  additionalImages?: string[];
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  taxRate: number;
  hsnCode: string;
  unit: string;
  currentStock: number;
  minStock: number;
  supplierId?: string;
  supplierName?: string;
  expiryDate?: string;
  status: 'active' | 'inactive' | 'discontinued';
  isWeighed: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  isOnlinePublished: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, default: '' },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    barcode: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    brand: { type: String, default: '' },
    image: { type: String, required: true },
    additionalImages: [{ type: String }],
    purchasePrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, required: true, default: 0 },
    hsnCode: { type: String, default: '' },
    unit: { type: String, required: true, default: 'pcs' },
    currentStock: { type: Number, required: true, default: 0, min: 0 },
    minStock: { type: Number, required: true, default: 5, min: 0 },
    supplierId: { type: String },
    supplierName: { type: String },
    expiryDate: { type: String },
    status: { type: String, enum: ['active', 'inactive', 'discontinued'], default: 'active', index: true },
    isWeighed: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false, index: true },
    isBestseller: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false },
    isOnlinePublished: { type: Boolean, default: true, index: true },
    rating: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text', brand: 'text', sku: 'text' });

export const ProductModel: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
