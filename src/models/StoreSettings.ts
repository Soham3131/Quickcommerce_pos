import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStoreSettingsDoc extends Document {
  companyName: string;
  tagline: string;
  logoUrl: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  gstin: string;
  invoicePrefix: string;
  startingInvoiceNumber: number;
  invoiceFooter: string;
  termsAndConditions: string;
  thermalWidth: '80mm' | '58mm';
  showLogoOnInvoice: boolean;
  showCustomerDetails: boolean;
  showTaxBreakdown: boolean;
  currency: {
    code: string;
    symbol: string;
    name: string;
    position: 'before' | 'after';
    decimalPlaces: number;
    rate: number;
  };
  tax: {
    enabled: boolean;
    name: string;
    rates: number[];
    defaultRate: number;
    isInclusive: boolean;
  };
  operations: {
    inStoreEnabled: boolean;
    takeawayEnabled: boolean;
    deliveryEnabled: boolean;
    estimatedTakeawayTime: string;
    estimatedDeliveryTime: string;
    minDeliveryOrder: number;
    deliveryCharge: number;
    storeStatus: 'open' | 'closed';
  };
  notifications: {
    lowStockAlerts: boolean;
    lowStockThresholdDefault: number;
    dailyStockReport: boolean;
    weeklyStockReport: boolean;
    reportRecipientEmail: string;
    preferredNotificationTime: string;
    alertFrequency: 'immediate' | 'daily' | 'weekly';
  };
  storefront: Record<string, any>;
  updatedAt: Date;
}

const StoreSettingsSchema = new Schema<IStoreSettingsDoc>(
  {
    companyName: { type: String, required: true, default: 'Avani Grocers' },
    tagline: { type: String, default: 'Fresh Quality Guaranteed' },
    logoUrl: { type: String, default: '' },
    address: { type: String, default: 'SCO 14-15, Main Market, Sector 14' },
    city: { type: String, default: 'Gurugram' },
    state: { type: String, default: 'Haryana' },
    pincode: { type: String, default: '122001' },
    phone: { type: String, default: '+91 98765 43210' },
    email: { type: String, default: 'contact@avanigrocers.com' },
    website: { type: String, default: 'https://avanigrocers.com' },
    gstin: { type: String, default: '07AAAAA0000A1Z5' },
    invoicePrefix: { type: String, default: 'INV' },
    startingInvoiceNumber: { type: Number, default: 1001 },
    invoiceFooter: { type: String, default: 'Thank you for shopping at Avani Grocers!' },
    termsAndConditions: { type: String, default: 'Goods once sold are returnable within 24 hours with original receipt.' },
    thermalWidth: { type: String, enum: ['80mm', '58mm'], default: '80mm' },
    showLogoOnInvoice: { type: Boolean, default: true },
    showCustomerDetails: { type: Boolean, default: true },
    showTaxBreakdown: { type: Boolean, default: true },
    currency: {
      code: { type: String, default: 'INR' },
      symbol: { type: String, default: '₹' },
      name: { type: String, default: 'Indian Rupee' },
      position: { type: String, enum: ['before', 'after'], default: 'before' },
      decimalPlaces: { type: Number, default: 2 },
      rate: { type: Number, default: 1 },
    },
    tax: {
      enabled: { type: Boolean, default: true },
      name: { type: String, default: 'GST' },
      rates: [{ type: Number }],
      defaultRate: { type: Number, default: 5 },
      isInclusive: { type: Boolean, default: true },
    },
    operations: {
      inStoreEnabled: { type: Boolean, default: true },
      takeawayEnabled: { type: Boolean, default: true },
      deliveryEnabled: { type: Boolean, default: true },
      estimatedTakeawayTime: { type: String, default: '15-25 mins' },
      estimatedDeliveryTime: { type: String, default: '30-45 mins' },
      minDeliveryOrder: { type: Number, default: 199 },
      deliveryCharge: { type: Number, default: 29 },
      storeStatus: { type: String, enum: ['open', 'closed'], default: 'open' },
    },
    notifications: {
      lowStockAlerts: { type: Boolean, default: true },
      lowStockThresholdDefault: { type: Number, default: 5 },
      dailyStockReport: { type: Boolean, default: true },
      weeklyStockReport: { type: Boolean, default: false },
      reportRecipientEmail: { type: String, default: 'admin@avanigrocers.com' },
      preferredNotificationTime: { type: String, default: '09:00' },
      alertFrequency: { type: String, enum: ['immediate', 'daily', 'weekly'], default: 'immediate' },
    },
    storefront: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const StoreSettingsModel: Model<IStoreSettingsDoc> =
  mongoose.models.StoreSettings ||
  mongoose.model<IStoreSettingsDoc>('StoreSettings', StoreSettingsSchema);
