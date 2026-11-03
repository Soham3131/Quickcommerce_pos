/**
 * Avani Grocers — Demo Mode Adapter
 * Explicit database-free demo mode provider.
 * Serves initial fixtures and acts as the bridge for browser localStorage persistence.
 * When APP_DATA_MODE === 'demo', this adapter ensures zero database calls are attempted.
 */

import { INITIAL_PRODUCTS } from '@/data/products';
import { INITIAL_SUPPLIERS } from '@/data/suppliers';
import { INITIAL_CUSTOMERS, INITIAL_CUSTOMER_ADDRESSES } from '@/data/customers';
import { INITIAL_SETTINGS } from '@/data/settings';
import { INITIAL_ORDERS } from '@/data/orders';
import { DEFAULT_DEMO_COUPONS } from '@/lib/coupons/couponService';
import { isDemoMode } from '@/lib/env';
import { Product, Supplier, Customer, CustomerAddress, Order, StoreSettings, UserRole, User } from '@/types';

export const DEMO_STORAGE_KEY = 'avani_grocers_store_state_v3';

export const DEMO_CREDENTIALS = [
  {
    role: 'admin' as UserRole,
    name: 'Avani Admin',
    email: 'admin@avanigrocers.com',
    passwordDisplay: 'Admin@123',
    description: 'Store manager with full administrative privileges (Products, Inventory, Orders, Settings, Suppliers, Analytics)',
  },
  {
    role: 'cashier' as UserRole,
    name: 'Rohit Sharma (Cashier)',
    email: 'cashier@avanigrocers.com',
    passwordDisplay: 'User@123',
    description: 'Front-desk point-of-sale operator (Fast POS Till, Barcode/Manual billing, GST receipt generation, Thermal printing)',
  },
  {
    role: 'customer' as UserRole,
    name: 'Priya Sharma',
    email: 'customer@avanigrocers.com',
    passwordDisplay: 'Customer@123',
    description: 'Online customer account (Storefront, Cart, Coupons, Checkout, Order Tracking, Wishlist, Saved Addresses)',
  },
];

export interface DemoStoreState {
  products: Product[];
  suppliers: Supplier[];
  customers: Customer[];
  orders: Order[];
  customerAddresses: CustomerAddress[];
  settings: StoreSettings;
  coupons: typeof DEFAULT_DEMO_COUPONS;
}

/**
 * Returns the pristine initial demo fixture dataset.
 */
export function getInitialDemoState(): DemoStoreState {
  return {
    products: [...INITIAL_PRODUCTS],
    suppliers: [...INITIAL_SUPPLIERS],
    customers: [...INITIAL_CUSTOMERS],
    orders: [...INITIAL_ORDERS],
    customerAddresses: [...INITIAL_CUSTOMER_ADDRESSES],
    settings: { ...INITIAL_SETTINGS },
    coupons: [...DEFAULT_DEMO_COUPONS],
  };
}

/**
 * Check if the application is configured to run in demo mode.
 */
export function isDemoModeActive(): boolean {
  return isDemoMode();
}

/**
 * Get demo account credentials list for presentation in login modals or help banners.
 */
export function getDemoAccounts() {
  return DEMO_CREDENTIALS;
}
