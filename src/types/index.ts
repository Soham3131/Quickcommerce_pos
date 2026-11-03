export type ProductCategory =
  | 'Fruits & Vegetables'
  | 'Dairy & Eggs'
  | 'Bakery & Bread'
  | 'Grocery & Staples'
  | 'Beverages'
  | 'Snacks & Sweets'
  | 'Personal Care'
  | 'Household & Cleaning'
  | 'Frozen Foods';

export type UnitType = 'kg' | 'g' | 'L' | 'ml' | 'pcs' | 'pack' | 'box' | 'bottle';

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  barcode: string;
  category: ProductCategory;
  brand: string;
  image: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  taxRate: number;
  hsnCode: string;
  unit: UnitType;
  currentStock: number;
  minStock: number;
  supplierId: string;
  supplierName: string;
  expiryDate: string;
  status: 'active' | 'inactive' | 'discontinued';
  isWeighed: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  isOnlinePublished?: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discountPercent: number;
  customPrice?: number;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  customerType: 'Regular' | 'Wholesale' | 'Walk-in' | 'VIP';
  loyaltyPoints: number;
  totalOrders: number;
  totalPurchases: number;
  outstandingBalance: number;
  addresses?: CustomerAddress[];
  status?: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export type OrderType = 'in-store' | 'takeaway' | 'delivery';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'paid' | 'partial' | 'unpaid' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'split';

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  unit: UnitType;
  unitPrice: number;
  quantity: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export interface DeliveryAssignment {
  name: string;
  phone: string;
  assignedAt: string;
}

export interface DeliveryHistoryItem {
  action: string;
  timestamp: string;
  details: string;
  actor: string;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  orderType: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  items: OrderItem[];
  subtotal: number;
  orderDiscount: number;
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
  deliveryPerson?: DeliveryAssignment;
  deliveryHistory?: DeliveryHistoryItem[];
  deliverySlot?: string;
  deliveryInstructions?: string;
  appliedCoupon?: string;
  couponDiscount?: number;
  stockDeducted?: boolean;
  cancelReason?: string;
  idempotencyKey?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: string;
  completedAt?: string;
}

export interface CustomerAddress {
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

export interface StorefrontPromoBanner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  ctaText: string;
  ctaLink: string;
  bgGradient: string;
  imageUrl: string;
}

export type CouponDiscountType = 'percentage' | 'fixed' | 'free_shipping';

export interface DemoCoupon {
  code: string;
  description: string;
  discountType?: CouponDiscountType;
  discountValue?: number; // percentage (e.g. 10) or fixed currency amount (e.g. 50)
  minOrder: number;
  maxDiscount?: number;
  isActive?: boolean;
  discountPercent?: number; // legacy backwards compatibility
}

export interface StorefrontSettings {
  enabled: boolean;
  storeName: string;
  tagline: string;
  announcementBar: {
    enabled: boolean;
    text: string;
    highlightText?: string;
    linkUrl?: string;
  };
  hero: {
    badge: string;
    heading: string;
    subheading: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
    imageUrl: string;
  };
  heroBanner?: {
    heading?: string;
    subheading?: string;
  };
  promoBanners: StorefrontPromoBanner[];
  freeDeliveryThreshold: number;
  deliveryCharge?: number;
  featuredCategoryOrder: ProductCategory[];
  demoCoupons: DemoCoupon[];
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: 'add' | 'remove' | 'damage' | 'expiry' | 'correction';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  referenceInvoice?: string;
  supplierName?: string;
  adjustedBy: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  category: string;
  status: 'active' | 'inactive';
  totalSupplied: number;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  sku: string;
  unit: UnitType;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  invoiceReference: string;
  purchaseDate: string;
  status: 'ordered' | 'received' | 'cancelled';
  items: PurchaseItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  paymentStatus: 'paid' | 'pending' | 'partial';
  receivedAt?: string;
  createdAt: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  position: 'before' | 'after';
  decimalPlaces: number;
  rate?: number; // configured exchange rate relative to base store currency (INR = 1)
}

export interface TaxConfig {
  enabled: boolean;
  name: string;
  rates: number[];
  defaultRate: number;
  isInclusive: boolean;
}

export interface StoreOperationsConfig {
  inStoreEnabled: boolean;
  takeawayEnabled: boolean;
  deliveryEnabled: boolean;
  estimatedTakeawayTime: string;
  estimatedDeliveryTime: string;
  minDeliveryOrder: number;
  deliveryCharge: number;
  storeStatus: 'open' | 'closed';
}

export interface NotificationSettings {
  lowStockAlerts: boolean;
  lowStockThresholdDefault: number;
  dailyStockReport: boolean;
  weeklyStockReport: boolean;
  reportRecipientEmail: string;
  preferredNotificationTime: string;
  alertFrequency: 'immediate' | 'daily' | 'weekly';
}

export interface StoreSettings {
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
  currency: CurrencyConfig;
  tax: TaxConfig;
  operations: StoreOperationsConfig;
  notifications: NotificationSettings;
  storefront: StorefrontSettings;
}

export type UserRole = 'admin' | 'cashier' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  address?: string;
  shiftStartTime?: string;
}
