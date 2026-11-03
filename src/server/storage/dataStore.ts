import { Product, Customer, Order, Supplier, PurchaseOrder, StoreSettings, StockAdjustment } from '@/types';
import { INITIAL_PRODUCTS } from '@/data/products';
import { INITIAL_SUPPLIERS } from '@/data/suppliers';
import { INITIAL_CUSTOMERS } from '@/data/customers';
import { INITIAL_SETTINGS } from '@/data/settings';
import { INITIAL_ORDERS } from '@/data/orders';
import { hashPassword } from '@/lib/auth/password';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: 'admin' | 'cashier' | 'customer';
  avatar?: string;
  address?: string;
  status: 'active' | 'inactive';
  emailVerified: boolean;
  shiftStartTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredCoupon {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minOrder: number;
  maxDiscount?: number;
  freeShipping?: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
  validFrom?: string;
  validUntil?: string;
  usageLimit?: number;
  usageCount: number;
  perCustomerLimit?: number;
  customerUsage: { customerId: string; count: number }[];
  isActive: boolean;
  createdAt: string;
}

export interface StoredAuditLog {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  targetResource: string;
  targetId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}

/**
 * Global fallback database store with initialized seeds and hashed passwords.
 * Ensures the application runs flawlessly both with MongoDB Atlas and in standalone environments.
 */
class InMemoryDataStore {
  public users: Map<string, StoredUser> = new Map();
  public products: Map<string, Product> = new Map();
  public customers: Map<string, Customer> = new Map();
  public orders: Map<string, Order> = new Map();
  public suppliers: Map<string, Supplier> = new Map();
  public purchases: Map<string, PurchaseOrder> = new Map();
  public coupons: Map<string, StoredCoupon> = new Map();
  public stockAdjustments: StockAdjustment[] = [];
  public auditLogs: StoredAuditLog[] = [];
  public settings: StoreSettings = { ...INITIAL_SETTINGS };
  private initialized = false;

  constructor() {
    this.initialize();
  }

  public initialize() {
    if (this.initialized) return;

    // 1. Seed demo accounts with cryptographically hashed passwords
    const adminUser: StoredUser = {
      id: 'user-admin',
      name: 'Avani Admin',
      email: 'admin@avanigrocers.com',
      passwordHash: hashPassword('Admin@123'),
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      phone: '+91 98765 43210',
      status: 'active',
      emailVerified: true,
      shiftStartTime: '2026-11-02T08:00:00',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const cashierUser: StoredUser = {
      id: 'user-cashier',
      name: 'Rohit Sharma (Cashier)',
      email: 'cashier@avanigrocers.com',
      passwordHash: hashPassword('User@123'),
      role: 'cashier',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      phone: '+91 98765 12345',
      status: 'active',
      emailVerified: true,
      shiftStartTime: '2026-11-02T09:30:00',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const customerUser: StoredUser = {
      id: 'cust-demo-1',
      name: 'Priya Sharma',
      email: 'customer@avanigrocers.com',
      passwordHash: hashPassword('Customer@123'),
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      phone: '+91 98765 43210',
      address: 'Flat 402, Tower B, Palm Grove Heights, Golf Course Ext Road, Gurugram, 122018',
      status: 'active',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.set(adminUser.email.toLowerCase(), adminUser);
    this.users.set(cashierUser.email.toLowerCase(), cashierUser);
    this.users.set(customerUser.email.toLowerCase(), customerUser);

    // 2. Seed products
    for (const prod of INITIAL_PRODUCTS) {
      this.products.set(prod.id, { ...prod });
    }

    // 3. Seed customers
    for (const cust of INITIAL_CUSTOMERS) {
      this.customers.set(cust.id, { ...cust });
    }

    // 4. Seed suppliers
    for (const supp of INITIAL_SUPPLIERS) {
      this.suppliers.set(supp.id, { ...supp });
    }

    // 5. Seed orders
    for (const ord of INITIAL_ORDERS) {
      this.orders.set(ord.id, { ...ord });
    }

    // 6. Seed canonical coupons (WELCOME50, FREESHIP, AVANI15)
    const demoCoupons: StoredCoupon[] = [
      {
        code: 'WELCOME50',
        description: '₹50 flat discount on your first order above ₹299',
        discountType: 'fixed',
        discountValue: 50,
        minOrder: 299,
        maxDiscount: 50,
        usageCount: 0,
        usageLimit: 1000,
        perCustomerLimit: 1,
        customerUsage: [],
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        code: 'FREESHIP',
        description: '100% Free delivery on any order above ₹199',
        discountType: 'free_shipping',
        discountValue: 40,
        minOrder: 199,
        maxDiscount: 40,
        freeShipping: true,
        usageCount: 0,
        usageLimit: 5000,
        perCustomerLimit: 5,
        customerUsage: [],
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        code: 'AVANI15',
        description: '15% instant discount on grocery orders above ₹799 (up to ₹200)',
        discountType: 'percentage',
        discountValue: 15,
        minOrder: 799,
        maxDiscount: 200,
        usageCount: 0,
        usageLimit: 2000,
        perCustomerLimit: 3,
        customerUsage: [],
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];

    for (const coupon of demoCoupons) {
      this.coupons.set(coupon.code.toUpperCase(), coupon);
    }

    this.initialized = true;
  }
}

// Global singleton cache across Next.js invocations
declare global {
  // eslint-disable-next-line no-var
  var globalDataStore: InMemoryDataStore | undefined;
}

export const dataStore: InMemoryDataStore = global.globalDataStore || new InMemoryDataStore();
if (process.env.NODE_ENV !== 'production') {
  global.globalDataStore = dataStore;
}
