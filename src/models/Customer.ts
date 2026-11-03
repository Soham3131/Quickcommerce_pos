import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomerAddress {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  fullName: string;
  phone: string;
  houseNo: string;
  street: string;
  area: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface ICustomer extends Document {
  name: string;
  phone: string;
  email: string;
  address?: string;
  customerType: 'Regular' | 'Wholesale' | 'Walk-in' | 'VIP';
  loyaltyPoints: number;
  totalOrders: number;
  totalPurchases: number;
  outstandingBalance: number;
  addresses: ICustomerAddress[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const CustomerAddressSchema = new Schema<ICustomerAddress>({
  id: { type: String, required: true },
  label: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  houseNo: { type: String, required: true },
  street: { type: String, required: true },
  area: { type: String, required: true },
  landmark: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true, index: true },
    phone: { type: String, required: true, index: true },
    email: { type: String, lowercase: true, trim: true, index: true },
    address: { type: String },
    customerType: { type: String, enum: ['Regular', 'Wholesale', 'Walk-in', 'VIP'], default: 'Regular' },
    loyaltyPoints: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
    outstandingBalance: { type: Number, default: 0 },
    addresses: [CustomerAddressSchema],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const CustomerModel: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
