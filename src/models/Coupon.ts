import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minOrder: number;
  maxDiscount?: number;
  freeShipping?: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
  validFrom?: Date;
  validUntil?: Date;
  usageLimit?: number;
  usageCount: number;
  perCustomerLimit?: number;
  customerUsage: { customerId: string; count: number }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: { type: String, default: '' },
    discountType: { type: String, enum: ['percentage', 'fixed', 'free_shipping'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrder: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    freeShipping: { type: Boolean, default: false },
    applicableCategories: [{ type: String }],
    applicableProducts: [{ type: String }],
    validFrom: { type: Date },
    validUntil: { type: Date },
    usageLimit: { type: Number },
    usageCount: { type: Number, default: 0, min: 0 },
    perCustomerLimit: { type: Number, default: 1 },
    customerUsage: [
      {
        customerId: { type: String, required: true },
        count: { type: Number, default: 1 },
      },
    ],
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const CouponModel: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);
