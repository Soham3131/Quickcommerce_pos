'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  CartItem,
  Customer,
  CustomerAddress,
  Order,
  OrderStatus,
  OrderType,
  PaymentMethod,
  StockAdjustment,
  Supplier,
  PurchaseOrder,
  StoreSettings,
  User,
  UserRole,
  CurrencyConfig,
  TaxConfig,
  StoreOperationsConfig,
} from '@/types';
import { INITIAL_PRODUCTS } from '@/data/products';
import { INITIAL_SUPPLIERS } from '@/data/suppliers';
import { INITIAL_CUSTOMERS, INITIAL_CUSTOMER_ADDRESSES } from '@/data/customers';
import { INITIAL_SETTINGS } from '@/data/settings';
import { INITIAL_ORDERS } from '@/data/orders';
import { setGlobalCurrency } from '@/lib/currency';
import { calculateTax, groupTaxBreakdown } from '@/lib/tax';
import { generateId } from '@/lib/utils';
import {
  validateCoupon,
  normalizeCouponCode,
  CouponValidationResult,
  getStoreCoupons,
} from '@/lib/coupons/couponService';

export const DEMO_USERS: Record<UserRole, User> = {
  customer: {
    id: 'cust-demo-1',
    name: 'Priya Sharma',
    email: 'customer@avanigrocers.com',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    phone: '+91 98765 43210',
    address: 'Flat 402, Tower B, Palm Grove Heights, Golf Course Ext Road, Gurugram, 122018',
  },
  admin: {
    id: 'user-admin',
    name: 'Avani Admin',
    email: 'admin@avanigrocers.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    shiftStartTime: '2026-11-02T08:00:00',
  },
  cashier: {
    id: 'user-cashier',
    name: 'Rohit Sharma (Cashier)',
    email: 'cashier@avanigrocers.com',
    role: 'cashier',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    shiftStartTime: '2026-11-02T09:30:00',
  },
};

interface StoreContextType {
  // Auth
  currentUser: User | null;
  login: (role: UserRole) => void;
  loginWithCredentials: (email: string, pass: string) => boolean | Promise<boolean>;
  signupCustomer: (data: { name: string; email: string; phone: string; password?: string }) => boolean | Promise<boolean>;
  logout: () => void;

  // Products & Inventory
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (
    adjustment: Omit<StockAdjustment, 'id' | 'createdAt' | 'previousStock' | 'newStock'>
  ) => void;
  stockAdjustments: StockAdjustment[];

  // POS Till Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  updateCartItemDiscount: (productId: string, discountPercent: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  selectedCustomer: Customer;
  setSelectedCustomer: (customer: Customer) => void;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  orderDiscount: number;
  setOrderDiscount: (discount: number) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  amountPaid: number;
  setAmountPaid: (amount: number) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  checkout: () => Order | null;

  // Online Storefront Cart
  customerCart: CartItem[];
  addToCustomerCart: (product: Product, quantity?: number) => void;
  updateCustomerCartQuantity: (productId: string, quantity: number) => void;
  removeFromCustomerCart: (productId: string) => void;
  clearCustomerCart: () => void;
  customerCartSubtotal: number;
  customerCartCount: number;
  appliedCouponCode: string | null;
  applyStorefrontCoupon: (code: string) => CouponValidationResult;
  removeStorefrontCoupon: () => void;

  // Customer Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Customer Addresses
  customerAddresses: CustomerAddress[];
  addCustomerAddress: (addr: Omit<CustomerAddress, 'id'>) => CustomerAddress;
  updateCustomerAddress: (id: string, updates: Partial<CustomerAddress>) => void;
  deleteCustomerAddress: (id: string) => void;
  setDefaultCustomerAddress: (id: string) => void;

  // Online Checkout & Orders
  placeCustomerOrder: (payload: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerAddress?: string;
    orderType: OrderType;
    deliverySlot?: string;
    deliveryInstructions?: string;
    paymentMethod: PaymentMethod;
    couponCode?: string;
    notes?: string;
  }) => Order | null;

  // Orders Management
  orders: Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignDeliveryPerson: (orderId: string, name: string, phone: string) => void;
  processRefund: (orderId: string, reason?: string) => void;

  // Suppliers & Purchases
  suppliers: Supplier[];
  purchases: PurchaseOrder[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'totalSupplied'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'createdAt' | 'status'>) => void;
  receivePurchaseOrder: (id: string) => void;

  // Customers
  customers: Customer[];
  addCustomer: (
    customer: Omit<
      Customer,
      'id' | 'createdAt' | 'loyaltyPoints' | 'totalOrders' | 'totalPurchases' | 'outstandingBalance'
    >
  ) => Promise<Customer>;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;

  // Settings
  settings: StoreSettings;
  updateSettings: (updates: Partial<StoreSettings>) => void;
  updateStorefrontSettings: (updates: Partial<StoreSettings['storefront']>) => void;
  setCurrency: (currency: CurrencyConfig) => void;
  setTaxConfig: (tax: TaxConfig) => void;
  setOperations: (ops: StoreOperationsConfig) => void;

  // Helpers
  getLowStockProducts: () => Product[];
  getOutOfStockProducts: () => Product[];
  getStockValuation: () => { retailValue: number; costValue: number; profitMargin: number };
  resetToDemoData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY = 'avani_grocers_store_state_v3';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(DEMO_USERS.admin);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);

  // POS Till States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(INITIAL_CUSTOMERS[0]);
  const [orderType, setOrderType] = useState<OrderType>('in-store');
  const [orderDiscount, setOrderDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Online Storefront States
  const [customerCart, setCustomerCart] = useState<CartItem[]>([]);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>(['prod-001', 'prod-007']);
  const [customerAddresses, setCustomerAddresses] = useState<CustomerAddress[]>(INITIAL_CUSTOMER_ADDRESSES);

  // Hydrate local cache and sync with authoritative backend API
  useEffect(() => {
    let savedDataExists = false;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        savedDataExists = true;
        const parsed = JSON.parse(saved);
        if (parsed.products && Array.isArray(parsed.products) && parsed.products.length > 0) {
          setProducts(parsed.products);
        } else {
          setProducts(INITIAL_PRODUCTS);
        }
        if (parsed.suppliers && Array.isArray(parsed.suppliers)) setSuppliers(parsed.suppliers);
        if (parsed.customers && Array.isArray(parsed.customers)) setCustomers(parsed.customers);
        if (parsed.orders && Array.isArray(parsed.orders)) setOrders(parsed.orders);
        if (parsed.purchases && Array.isArray(parsed.purchases)) setPurchases(parsed.purchases);
        if (parsed.stockAdjustments && Array.isArray(parsed.stockAdjustments)) setStockAdjustments(parsed.stockAdjustments);
        if (parsed.cart && Array.isArray(parsed.cart)) setCart(parsed.cart);
        if (parsed.customerCart && Array.isArray(parsed.customerCart)) setCustomerCart(parsed.customerCart);
        if (parsed.appliedCouponCode !== undefined) setAppliedCouponCode(parsed.appliedCouponCode);
        if (parsed.wishlist && Array.isArray(parsed.wishlist)) setWishlist(parsed.wishlist);
        if (parsed.customerAddresses && Array.isArray(parsed.customerAddresses)) setCustomerAddresses(parsed.customerAddresses);
        if (parsed.settings) {
          setSettings(parsed.settings);
          if (parsed.settings.currency) {
            setGlobalCurrency(parsed.settings.currency);
          }
        }
        if (parsed.currentUser) setCurrentUser(parsed.currentUser);
      } else {
        setGlobalCurrency(INITIAL_SETTINGS.currency);
      }
    } catch (err) {
      console.error('Error hydrating state from localStorage:', err);
    }

    // Authoritative background fetch from backend API (bypassed in demo mode if local state exists)
    const isDemo = process.env.NEXT_PUBLIC_APP_DATA_MODE === 'demo';
    const syncBackendData = async () => {
      // In demo mode, local browser changes take precedence to prevent cold-start overwrites
      if (isDemo && savedDataExists) {
        return;
      }

      try {
        // 1. Fetch live products from backend
        const prodRes = await fetch('/api/products?limit=100');
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (prodData.success && Array.isArray(prodData.products) && prodData.products.length > 0) {
            setProducts(prodData.products);
          }
        }

        // 2. Fetch live settings
        const settRes = await fetch('/api/settings');
        if (settRes.ok) {
          const settData = await settRes.json();
          if (settData.success && settData.settings) {
            setSettings(settData.settings);
            if (settData.settings.currency) {
              setGlobalCurrency(settData.settings.currency);
            }
          }
        }

        // 3. Fetch live orders
        const ordRes = await fetch('/api/orders');
        if (ordRes.ok) {
          const ordData = await ordRes.json();
          if (ordData.success && Array.isArray(ordData.orders)) {
            setOrders(ordData.orders);
          }
        }

        // 4. Verify authenticated session
        const authRes = await fetch('/api/auth/me');
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.success && authData.user) {
            setCurrentUser(authData.user);
          }
        }
      } catch (err) {
        // Backend offline or running in mock standalone mode; local state remains reliable
        console.warn('[Store] API sync background note:', err);
      }
    };

    syncBackendData();
  }, []);

  // Cross-tab synchronization: Changes in one tab (e.g. Admin adding product or updating status)
  // immediately update all other open tabs/roles in the same browser
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.products) setProducts(parsed.products);
          if (parsed.orders) setOrders(parsed.orders);
          if (parsed.customers) setCustomers(parsed.customers);
          if (parsed.suppliers) setSuppliers(parsed.suppliers);
          if (parsed.purchases) setPurchases(parsed.purchases);
          if (parsed.stockAdjustments) setStockAdjustments(parsed.stockAdjustments);
          if (parsed.cart) setCart(parsed.cart);
          if (parsed.customerCart) setCustomerCart(parsed.customerCart);
          if (parsed.appliedCouponCode !== undefined) setAppliedCouponCode(parsed.appliedCouponCode);
          if (parsed.wishlist) setWishlist(parsed.wishlist);
          if (parsed.customerAddresses) setCustomerAddresses(parsed.customerAddresses);
          if (parsed.settings) {
            setSettings(parsed.settings);
            if (parsed.settings.currency) setGlobalCurrency(parsed.settings.currency);
          }
          if (parsed.currentUser) setCurrentUser(parsed.currentUser);
        } catch (err) {
          console.warn('Error synchronizing storage event across tabs:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save to LocalStorage for offline resilience & fast hydration across all roles
  const persistState = useCallback(
    (nextState?: {
      products?: Product[];
      suppliers?: Supplier[];
      customers?: Customer[];
      orders?: Order[];
      purchases?: PurchaseOrder[];
      stockAdjustments?: StockAdjustment[];
      settings?: StoreSettings;
      currentUser?: User | null;
      cart?: CartItem[];
      customerCart?: CartItem[];
      appliedCouponCode?: string | null;
      wishlist?: string[];
      customerAddresses?: CustomerAddress[];
    }) => {
      try {
        const stateToSave = {
          products: nextState?.products ?? products,
          suppliers: nextState?.suppliers ?? suppliers,
          customers: nextState?.customers ?? customers,
          orders: nextState?.orders ?? orders,
          purchases: nextState?.purchases ?? purchases,
          stockAdjustments: nextState?.stockAdjustments ?? stockAdjustments,
          settings: nextState?.settings ?? settings,
          currentUser: nextState?.currentUser ?? currentUser,
          cart: nextState?.cart ?? cart,
          customerCart: nextState?.customerCart ?? customerCart,
          appliedCouponCode:
            nextState?.appliedCouponCode !== undefined ? nextState.appliedCouponCode : appliedCouponCode,
          wishlist: nextState?.wishlist ?? wishlist,
          customerAddresses: nextState?.customerAddresses ?? customerAddresses,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (err) {
        console.error('Error saving state to localStorage:', err);
      }
    },
    [products, suppliers, customers, orders, purchases, stockAdjustments, settings, currentUser, cart, customerCart, appliedCouponCode, wishlist, customerAddresses]
  );

  // --- Auth Actions ---
  const login = (role: UserRole) => {
    const user = DEMO_USERS[role];
    setCurrentUser(user);
    persistState({ currentUser: user });
  };

  const loginWithCredentials = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          persistState({ currentUser: data.user });
          return true;
        }
      }
    } catch (e) {
      console.warn('Online login failed, falling back to local verification:', e);
    }

    // Fallback verification for demo accounts (case-insensitive email matching)
    const norm = email.toLowerCase().trim();
    if (norm === 'admin@avanigrocers.com' && (pass === 'Admin@123' || pass === 'User@123')) {
      login('admin');
      return true;
    }
    if (norm === 'cashier@avanigrocers.com' && pass === 'User@123') {
      login('cashier');
      return true;
    }
    if (norm === 'customer@avanigrocers.com' && (pass === 'Customer@123' || pass === 'User@123')) {
      login('customer');
      return true;
    }
    return false;
  };

  const signupCustomer = async (data: { name: string; email: string; phone: string; password?: string }): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password || 'Customer@123',
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData.success && resData.user) {
          setCurrentUser(resData.user);
          persistState({ currentUser: resData.user });
          return true;
        }
      }
    } catch (e) {
      console.warn('API registration failed, using local registration:', e);
    }

    const newCustomerUser: User = {
      id: generateId('cust-user'),
      name: data.name,
      email: data.email,
      role: 'customer',
      phone: data.phone,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    };
    setCurrentUser(newCustomerUser);
    persistState({ currentUser: newCustomerUser });
    return true;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setCurrentUser(null);
    persistState({ currentUser: null });
  };

  // --- Products & Inventory Actions ---
  const addProduct = async (prodData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const tempId = generateId('prod');
    const newProd: Product = {
      ...prodData,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const next = [newProd, ...products];
    setProducts(next);
    persistState({ products: next });

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prodData),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.product) {
          setProducts((prev) => prev.map((p) => (p.id === tempId ? data.product : p)));
        }
      }
    } catch (err) {
      console.error('Error posting product to API:', err);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const next = products.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    setProducts(next);
    persistState({ products: next });

    try {
      await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error('Error patching product:', err);
    }
  };

  const deleteProduct = async (id: string) => {
    const next = products.filter((p) => p.id !== id);
    setProducts(next);
    persistState({ products: next });

    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting product from API:', err);
    }
  };

  const adjustStock = async (
    adjustment: Omit<StockAdjustment, 'id' | 'createdAt' | 'previousStock' | 'newStock'>
  ) => {
    const target = products.find((p) => p.id === adjustment.productId);
    if (!target) return;

    const previousStock = target.currentStock;
    let newStock = previousStock;

    if (adjustment.type === 'add') {
      newStock = previousStock + adjustment.quantity;
    } else if (
      adjustment.type === 'remove' ||
      adjustment.type === 'damage' ||
      adjustment.type === 'expiry'
    ) {
      newStock = Math.max(0, previousStock - adjustment.quantity);
    } else if (adjustment.type === 'correction') {
      newStock = adjustment.quantity;
    }

    const newAdjustmentRecord: StockAdjustment = {
      ...adjustment,
      id: generateId('adj'),
      previousStock,
      newStock,
      adjustedBy: currentUser?.name || 'System Admin',
      createdAt: new Date().toISOString(),
    };

    const nextProducts = products.map((p) =>
      p.id === target.id ? { ...p, currentStock: newStock, updatedAt: new Date().toISOString() } : p
    );
    const nextAdjustments = [newAdjustmentRecord, ...stockAdjustments];

    setProducts(nextProducts);
    setStockAdjustments(nextAdjustments);
    persistState({ products: nextProducts, stockAdjustments: nextAdjustments });

    try {
      await fetch('/api/inventory/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: adjustment.productId,
          quantity: adjustment.quantity,
          type: adjustment.type,
          reason: adjustment.reason,
          referenceInvoice: adjustment.referenceInvoice,
        }),
      });
    } catch (err) {
      console.error('Error posting inventory adjustment:', err);
    }
  };

  // --- POS Till Cart Actions ---
  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.currentStock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      let nextCart: CartItem[];
      if (existing) {
        const newQty = Math.min(product.currentStock, existing.quantity + quantity);
        nextCart = prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        const initialQty = Math.min(product.currentStock, quantity);
        nextCart = [...prev, { product, quantity: initialQty, discountPercent: 0 }];
      }
      persistState({ cart: nextCart });
      return nextCart;
    });
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const safeQty = Math.min(product.currentStock, quantity);

    setCart((prev) => {
      const nextCart = prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: safeQty } : item
      );
      persistState({ cart: nextCart });
      return nextCart;
    });
  };

  const updateCartItemDiscount = (productId: string, discountPercent: number) => {
    setCart((prev) => {
      const nextCart = prev.map((item) =>
        item.product.id === productId
          ? { ...item, discountPercent: Math.max(0, Math.min(100, discountPercent)) }
          : item
      );
      persistState({ cart: nextCart });
      return nextCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const nextCart = prev.filter((item) => item.product.id !== productId);
      persistState({ cart: nextCart });
      return nextCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    setOrderDiscount(0);
    setAmountPaid(0);
    setOrderNotes('');
    persistState({ cart: [] });
  };

  // --- Online Storefront Cart Actions ---
  const addToCustomerCart = (product: Product, quantity: number = 1) => {
    if (product.currentStock <= 0) return;

    setCustomerCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      let updated: CartItem[];
      if (existing) {
        const newQty = Math.min(product.currentStock, existing.quantity + quantity);
        updated = prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        const initialQty = Math.min(product.currentStock, quantity);
        updated = [...prev, { product, quantity: initialQty, discountPercent: 0 }];
      }
      persistState({ customerCart: updated });
      return updated;
    });
  };

  const updateCustomerCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCustomerCart(productId);
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const safeQty = Math.min(product.currentStock, quantity);

    setCustomerCart((prev) => {
      const updated = prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: safeQty } : item
      );
      persistState({ customerCart: updated });
      return updated;
    });
  };

  const removeFromCustomerCart = (productId: string) => {
    setCustomerCart((prev) => {
      const updated = prev.filter((item) => item.product.id !== productId);
      persistState({ customerCart: updated });
      return updated;
    });
  };

  const clearCustomerCart = () => {
    setCustomerCart([]);
    setAppliedCouponCode(null);
    persistState({ customerCart: [], appliedCouponCode: null });
  };

  const customerCartSubtotal = customerCart.reduce(
    (sum, item) => sum + item.product.sellingPrice * item.quantity,
    0
  );

  const customerCartCount = customerCart.reduce((sum, item) => sum + item.quantity, 0);

  const applyStorefrontCoupon = (code: string): CouponValidationResult => {
    const isFreeThreshold =
      customerCartSubtotal >= (settings.storefront?.freeDeliveryThreshold ?? 499);
    const result = validateCoupon(
      code,
      customerCartSubtotal,
      settings.operations.deliveryCharge,
      settings,
      {
        fulfillment: 'delivery',
        isFreeDeliveryByThreshold: isFreeThreshold,
      }
    );

    if (result.isValid && result.coupon) {
      setAppliedCouponCode(result.coupon.code);
      persistState({ appliedCouponCode: result.coupon.code });
    }

    // Also trigger server-side coupon validation
    try {
      fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartSubtotal: customerCartSubtotal }),
      });
    } catch {}

    return result;
  };

  const removeStorefrontCoupon = () => {
    setAppliedCouponCode(null);
    persistState({ appliedCouponCode: null });
  };

  // --- Customer Wishlist Actions ---
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      persistState({ wishlist: updated });
      return updated;
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // --- Customer Address Book Actions ---
  const addCustomerAddress = (addrData: Omit<CustomerAddress, 'id'>): CustomerAddress => {
    const newAddr: CustomerAddress = {
      ...addrData,
      id: generateId('addr'),
    };
    let updated = customerAddresses;
    if (newAddr.isDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }));
    }
    const next = [newAddr, ...updated];
    setCustomerAddresses(next);
    persistState({ customerAddresses: next });
    return newAddr;
  };

  const updateCustomerAddress = (id: string, updates: Partial<CustomerAddress>) => {
    let next = customerAddresses.map((a) => (a.id === id ? { ...a, ...updates } : a));
    if (updates.isDefault) {
      next = next.map((a) => (a.id === id ? a : { ...a, isDefault: false }));
    }
    setCustomerAddresses(next);
    persistState({ customerAddresses: next });
  };

  const deleteCustomerAddress = (id: string) => {
    const next = customerAddresses.filter((a) => a.id !== id);
    setCustomerAddresses(next);
    persistState({ customerAddresses: next });
  };

  const setDefaultCustomerAddress = (id: string) => {
    const next = customerAddresses.map((a) => ({ ...a, isDefault: a.id === id }));
    setCustomerAddresses(next);
    persistState({ customerAddresses: next });
  };

  // --- Online Checkout & Order Placement ---
  const placeCustomerOrder = (payload: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerAddress?: string;
    orderType: OrderType;
    deliverySlot?: string;
    deliveryInstructions?: string;
    paymentMethod: PaymentMethod;
    couponCode?: string;
    notes?: string;
  }): Order | null => {
    if (customerCart.length === 0) return null;

    let subtotal = 0;
    const taxLines: { taxable: number; rate: number; tax: number }[] = [];

    const orderItems = customerCart.map((ci) => {
      const rawPrice = ci.product.sellingPrice;
      const itemSubtotal = rawPrice * ci.quantity;
      const taxRate = settings.tax.enabled ? ci.product.taxRate : 0;
      const taxCalc = calculateTax(itemSubtotal, taxRate, settings.tax.isInclusive);

      subtotal += itemSubtotal;
      taxLines.push({
        taxable: taxCalc.taxableAmount,
        rate: taxRate,
        tax: taxCalc.taxAmount,
      });

      return {
        productId: ci.product.id,
        productName: ci.product.name,
        sku: ci.product.sku,
        unit: ci.product.unit,
        unitPrice: rawPrice,
        quantity: ci.quantity,
        discount: 0,
        taxRate,
        taxAmount: taxCalc.taxAmount,
        total: Math.round((itemSubtotal + (settings.tax.isInclusive ? 0 : taxCalc.taxAmount)) * 100) / 100,
      };
    });

    let couponDiscount = 0;
    let isFreeDeliveryByCoupon = false;
    let finalAppliedCoupon: string | undefined = undefined;

    const rawCoupon = payload.couponCode || appliedCouponCode;
    if (rawCoupon) {
      const isThresholdFree = subtotal >= (settings.storefront?.freeDeliveryThreshold ?? 499);
      const valResult = validateCoupon(
        rawCoupon,
        subtotal,
        settings.operations.deliveryCharge,
        settings,
        {
          fulfillment: payload.orderType === 'takeaway' ? 'takeaway' : 'delivery',
          isFreeDeliveryByThreshold: isThresholdFree,
        }
      );
      if (valResult.isValid && valResult.coupon) {
        couponDiscount = valResult.discountAmount;
        isFreeDeliveryByCoupon = valResult.isFreeShipping;
        finalAppliedCoupon = valResult.coupon.code;
      }
    }

    const netTaxable = Math.max(0, subtotal - couponDiscount);
    const taxBreakdown = groupTaxBreakdown(taxLines);
    const totalTax = taxBreakdown.reduce((sum, t) => sum + t.tax, 0);

    let deliveryCharge = 0;
    if (payload.orderType === 'delivery') {
      const isFreeDelivery =
        subtotal >= (settings.storefront?.freeDeliveryThreshold ?? 499) || isFreeDeliveryByCoupon;
      deliveryCharge = isFreeDelivery ? 0 : settings.operations.deliveryCharge;
    }

    const grandTotal = Math.round((netTaxable + totalTax + deliveryCharge) * 100) / 100;
    const nextInvoiceNum = `${settings.invoicePrefix}-${settings.startingInvoiceNumber + orders.length}`;

    const matchedCustomer = customers.find(
      (c) =>
        (payload.customerEmail && c.email.toLowerCase() === payload.customerEmail.toLowerCase()) ||
        c.phone === payload.customerPhone
    );
    const customerId = matchedCustomer ? matchedCustomer.id : generateId('cust');

    const newOrder: Order = {
      id: generateId('ord'),
      invoiceNumber: nextInvoiceNum,
      orderType: payload.orderType,
      status: 'pending',
      paymentStatus: payload.paymentMethod === 'cash' ? 'unpaid' : 'paid',
      paymentMethod: payload.paymentMethod,
      customerId,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerAddress: payload.customerAddress,
      items: orderItems,
      subtotal,
      orderDiscount: couponDiscount,
      couponDiscount,
      appliedCoupon: finalAppliedCoupon,
      taxableAmount: netTaxable,
      taxAmount: totalTax,
      taxBreakdown,
      deliveryCharge,
      grandTotal,
      amountPaid: payload.paymentMethod === 'cash' ? 0 : grandTotal,
      changeDue: 0,
      deliverySlot: payload.deliverySlot,
      deliveryInstructions: payload.deliveryInstructions,
      notes: payload.notes,
      cashierId: 'online-store',
      cashierName: 'Online Storefront',
      createdAt: new Date().toISOString(),
    };

    // Deduct inventory locally
    const adjustmentsToLog: StockAdjustment[] = [];
    const updatedProducts = products.map((prod) => {
      const cItem = customerCart.find((ci) => ci.product.id === prod.id);
      if (cItem) {
        const newStock = Math.max(0, prod.currentStock - cItem.quantity);
        adjustmentsToLog.push({
          id: generateId('adj'),
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type: 'remove',
          quantity: cItem.quantity,
          previousStock: prod.currentStock,
          newStock,
          reason: `Online Order — Invoice #${nextInvoiceNum}`,
          referenceInvoice: nextInvoiceNum,
          adjustedBy: 'Online Storefront',
          createdAt: new Date().toISOString(),
        });
        return { ...prod, currentStock: newStock, updatedAt: new Date().toISOString() };
      }
      return prod;
    });

    const nextOrders = [newOrder, ...orders];
    const nextAdjustments = [...adjustmentsToLog, ...stockAdjustments];

    setProducts(updatedProducts);
    setOrders(nextOrders);
    setStockAdjustments(nextAdjustments);
    setCustomerCart([]);
    setAppliedCouponCode(null);

    persistState({
      products: updatedProducts,
      orders: nextOrders,
      stockAdjustments: nextAdjustments,
      customerCart: [],
      appliedCouponCode: null,
    });

    // Authoritative Server-side persistence via API
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          customerName: payload.customerName,
          customerPhone: payload.customerPhone,
          customerEmail: payload.customerEmail,
          customerAddress: payload.customerAddress,
          orderType: payload.orderType,
          items: customerCart.map((ci) => ({ productId: ci.product.id, quantity: ci.quantity })),
          couponCode: finalAppliedCoupon,
          paymentMethod: payload.paymentMethod,
          deliverySlot: payload.deliverySlot,
          deliveryInstructions: payload.deliveryInstructions,
          notes: payload.notes,
        }),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.order) {
            setOrders((prev) => prev.map((o) => (o.id === newOrder.id ? { ...res.order, id: newOrder.id } : o)));
          }
        })
        .catch((e) => console.warn('Order async sync notice:', e));
    } catch {}

    return newOrder;
  };

  // --- POS Till Checkout ---
  const checkout = (): Order | null => {
    if (cart.length === 0) return null;

    let subtotal = 0;
    const taxLines: { taxable: number; rate: number; tax: number }[] = [];

    const orderItems = cart.map((ci) => {
      const rawPrice = ci.customPrice ?? ci.product.sellingPrice;
      const itemSubtotal = rawPrice * ci.quantity;
      const itemDiscount = (itemSubtotal * ci.discountPercent) / 100;
      const netItem = itemSubtotal - itemDiscount;

      const taxRate = settings.tax.enabled ? ci.product.taxRate : 0;
      const taxCalc = calculateTax(netItem, taxRate, settings.tax.isInclusive);

      subtotal += itemSubtotal;
      taxLines.push({
        taxable: taxCalc.taxableAmount,
        rate: taxRate,
        tax: taxCalc.taxAmount,
      });

      return {
        productId: ci.product.id,
        productName: ci.product.name,
        sku: ci.product.sku,
        unit: ci.product.unit,
        unitPrice: rawPrice,
        quantity: ci.quantity,
        discount: itemDiscount,
        taxRate,
        taxAmount: taxCalc.taxAmount,
        total: Math.round((netItem + (settings.tax.isInclusive ? 0 : taxCalc.taxAmount)) * 100) / 100,
      };
    });

    const netTaxable = Math.max(0, subtotal - orderDiscount);
    const taxBreakdown = groupTaxBreakdown(taxLines);
    const totalTax = taxBreakdown.reduce((sum, t) => sum + t.tax, 0);
    const deliveryCharge = orderType === 'delivery' ? settings.operations.deliveryCharge : 0;
    const grandTotal = Math.round((netTaxable + totalTax + deliveryCharge) * 100) / 100;

    const paid = amountPaid > 0 ? amountPaid : grandTotal;
    const changeDue = Math.max(0, paid - grandTotal);

    const nextInvoiceNum = `${settings.invoicePrefix}-${settings.startingInvoiceNumber + orders.length}`;

    const newOrder: Order = {
      id: generateId('ord'),
      invoiceNumber: nextInvoiceNum,
      orderType,
      status: orderType === 'in-store' ? 'completed' : 'confirmed',
      paymentStatus: paid >= grandTotal ? 'paid' : paid > 0 ? 'partial' : 'unpaid',
      paymentMethod,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      customerAddress: selectedCustomer.address,
      items: orderItems,
      subtotal,
      orderDiscount,
      taxableAmount: netTaxable,
      taxAmount: totalTax,
      taxBreakdown,
      deliveryCharge,
      grandTotal,
      amountPaid: paid,
      changeDue,
      notes: orderNotes,
      cashierId: currentUser?.id || 'cashier',
      cashierName: currentUser?.name || 'Cashier',
      createdAt: new Date().toISOString(),
      completedAt: orderType === 'in-store' ? new Date().toISOString() : undefined,
    };

    const adjustmentsToLog: StockAdjustment[] = [];
    const updatedProducts = products.map((prod) => {
      const cartItem = cart.find((ci) => ci.product.id === prod.id);
      if (cartItem) {
        const newStock = Math.max(0, prod.currentStock - cartItem.quantity);
        adjustmentsToLog.push({
          id: generateId('adj'),
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type: 'remove',
          quantity: cartItem.quantity,
          previousStock: prod.currentStock,
          newStock,
          reason: `POS Sale — Invoice #${nextInvoiceNum}`,
          referenceInvoice: nextInvoiceNum,
          adjustedBy: currentUser?.name || 'Cashier',
          createdAt: new Date().toISOString(),
        });
        return { ...prod, currentStock: newStock, updatedAt: new Date().toISOString() };
      }
      return prod;
    });

    const updatedCustomers = customers.map((c) => {
      if (c.id === selectedCustomer.id && c.id !== 'cust-walkin') {
        const pointsEarned = Math.floor(grandTotal / 100) * 5;
        return {
          ...c,
          loyaltyPoints: c.loyaltyPoints + pointsEarned,
          totalOrders: c.totalOrders + 1,
          totalPurchases: c.totalPurchases + grandTotal,
        };
      }
      return c;
    });

    const nextOrders = [newOrder, ...orders];
    const nextAdjustments = [...adjustmentsToLog, ...stockAdjustments];

    setProducts(updatedProducts);
    setOrders(nextOrders);
    setCustomers(updatedCustomers);
    setStockAdjustments(nextAdjustments);
    clearCart();

    persistState({
      products: updatedProducts,
      orders: nextOrders,
      customers: updatedCustomers,
      stockAdjustments: nextAdjustments,
    });

    // Authoritative Server-side POS checkout via API
    try {
      fetch('/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((ci) => ({
            productId: ci.product.id,
            quantity: ci.quantity,
            discountPercent: ci.discountPercent,
            customPrice: ci.customPrice,
          })),
          customer: selectedCustomer,
          orderDiscount,
          paymentMethod,
          amountPaid: paid,
          notes: orderNotes,
        }),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.order) {
            setOrders((prev) => prev.map((o) => (o.id === newOrder.id ? { ...res.order, id: newOrder.id } : o)));
          }
        })
        .catch((e) => console.warn('POS async sync notice:', e));
    } catch {}

    return newOrder;
  };

  // --- Orders Management ---
  const updateOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const isNowCancelled = nextStatus === 'cancelled' || nextStatus === 'refunded';
    const wasActive = targetOrder.status !== 'cancelled' && targetOrder.status !== 'refunded';

    let nextProducts = products;
    let nextAdjustments = stockAdjustments;

    if (isNowCancelled && wasActive) {
      const adjustmentsToLog: StockAdjustment[] = [];
      nextProducts = products.map((prod) => {
        const orderItem = targetOrder.items.find((item) => item.productId === prod.id);
        if (orderItem) {
          const restoredStock = prod.currentStock + orderItem.quantity;
          adjustmentsToLog.push({
            id: generateId('adj'),
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            type: 'add',
            quantity: orderItem.quantity,
            previousStock: prod.currentStock,
            newStock: restoredStock,
            reason: `Order ${nextStatus.toUpperCase()} — Stock Restored (${targetOrder.invoiceNumber})`,
            referenceInvoice: targetOrder.invoiceNumber,
            adjustedBy: currentUser?.name || 'Admin',
            createdAt: new Date().toISOString(),
          });
          return { ...prod, currentStock: restoredStock, updatedAt: new Date().toISOString() };
        }
        return prod;
      });
      nextAdjustments = [...adjustmentsToLog, ...stockAdjustments];
    }

    const nextOrders = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status: nextStatus,
            paymentStatus: isNowCancelled ? 'refunded' : o.paymentStatus,
            completedAt:
              nextStatus === 'completed' || nextStatus === 'delivered'
                ? new Date().toISOString()
                : o.completedAt,
          }
        : o
    );

    setProducts(nextProducts);
    setStockAdjustments(nextAdjustments);
    setOrders(nextOrders);
    persistState({
      products: nextProducts,
      orders: nextOrders,
      stockAdjustments: nextAdjustments,
    });

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch {}
  };

  const assignDeliveryPerson = async (orderId: string, name: string, phone: string) => {
    const historyItem = {
      action: 'Assigned',
      timestamp: new Date().toISOString(),
      details: `Assigned to ${name} (${phone})`,
      actor: currentUser?.name || 'Admin',
    };

    const nextOrders = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status: o.status === 'pending' || o.status === 'confirmed' ? ('preparing' as OrderStatus) : o.status,
            deliveryPerson: { name, phone, assignedAt: new Date().toISOString() },
            deliveryHistory: [...(o.deliveryHistory || []), historyItem],
          }
        : o
    );
    setOrders(nextOrders);
    persistState({ orders: nextOrders });

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assign_rider', riderName: name, riderPhone: phone }),
      });
    } catch {}
  };

  const processRefund = (orderId: string, reason?: string) => {
    updateOrderStatus(orderId, 'refunded');
  };

  // --- Suppliers & Purchases ---
  const addSupplier = async (supData: Omit<Supplier, 'id' | 'totalSupplied'>) => {
    const newSup: Supplier = {
      ...supData,
      id: generateId('sup'),
      totalSupplied: 0,
    };
    const next = [...suppliers, newSup];
    setSuppliers(next);
    persistState({ suppliers: next });

    try {
      await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supData),
      });
    } catch {}
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    const next = suppliers.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setSuppliers(next);
    persistState({ suppliers: next });
  };

  const createPurchaseOrder = async (poData: Omit<PurchaseOrder, 'id' | 'createdAt' | 'status'>) => {
    const newPO: PurchaseOrder = {
      ...poData,
      id: generateId('po'),
      status: 'ordered',
      createdAt: new Date().toISOString(),
    };
    const next = [newPO, ...purchases];
    setPurchases(next);
    persistState({ purchases: next });

    try {
      await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poData),
      });
    } catch {}
  };

  const receivePurchaseOrder = async (poId: string) => {
    const target = purchases.find((p) => p.id === poId);
    if (!target || target.status === 'received') return;

    const adjustmentsToLog: StockAdjustment[] = [];
    const nextProducts = products.map((prod) => {
      const pItem = target.items.find((item) => item.productId === prod.id);
      if (pItem) {
        const incremented = prod.currentStock + pItem.quantity;
        adjustmentsToLog.push({
          id: generateId('adj'),
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type: 'add',
          quantity: pItem.quantity,
          previousStock: prod.currentStock,
          newStock: incremented,
          reason: `Purchase Received — PO #${target.purchaseNumber}`,
          referenceInvoice: target.invoiceReference,
          supplierName: target.supplierName,
          adjustedBy: currentUser?.name || 'Admin',
          createdAt: new Date().toISOString(),
        });
        return {
          ...prod,
          currentStock: incremented,
          purchasePrice: pItem.unitPrice || prod.purchasePrice,
          updatedAt: new Date().toISOString(),
        };
      }
      return prod;
    });

    const nextPurchases = purchases.map((p) =>
      p.id === poId
        ? {
            ...p,
            status: 'received' as const,
            paymentStatus: 'paid' as const,
            receivedAt: new Date().toISOString(),
          }
        : p
    );

    const nextAdjustments = [...adjustmentsToLog, ...stockAdjustments];

    setProducts(nextProducts);
    setPurchases(nextPurchases);
    setStockAdjustments(nextAdjustments);
    persistState({
      products: nextProducts,
      purchases: nextPurchases,
      stockAdjustments: nextAdjustments,
    });

    try {
      await fetch(`/api/purchases/${poId}/receive`, { method: 'POST' });
    } catch {}
  };

  // --- Customers ---
  const addCustomer = async (
    custData: Omit<
      Customer,
      'id' | 'createdAt' | 'loyaltyPoints' | 'totalOrders' | 'totalPurchases' | 'outstandingBalance'
    >
  ): Promise<Customer> => {
    const newCust: Customer = {
      ...custData,
      id: generateId('cust'),
      loyaltyPoints: 0,
      totalOrders: 0,
      totalPurchases: 0,
      outstandingBalance: 0,
      createdAt: new Date().toISOString(),
    };
    const next = [...customers, newCust];
    setCustomers(next);
    persistState({ customers: next });

    try {
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(custData),
      });
    } catch {}

    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    const next = customers.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setCustomers(next);
    persistState({ customers: next });
  };

  // --- Settings ---
  const updateSettings = async (updates: Partial<StoreSettings>) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    if (updates.currency) {
      setGlobalCurrency(updates.currency);
    }
    persistState({ settings: next });

    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {}
  };

  const updateStorefrontSettings = (updates: Partial<StoreSettings['storefront']>) => {
    const next = {
      ...settings,
      storefront: {
        ...settings.storefront,
        ...updates,
      },
    };
    setSettings(next);
    persistState({ settings: next });

    try {
      fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storefront: next.storefront }),
      });
    } catch {}
  };

  const setCurrency = (currency: CurrencyConfig) => {
    const next = { ...settings, currency };
    setSettings(next);
    setGlobalCurrency(currency);
    persistState({ settings: next });

    try {
      fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency }),
      });
    } catch {}
  };

  const setTaxConfig = (tax: TaxConfig) => {
    const next = { ...settings, tax };
    setSettings(next);
    persistState({ settings: next });

    try {
      fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tax }),
      });
    } catch {}
  };

  const setOperations = (operations: StoreOperationsConfig) => {
    const next = { ...settings, operations };
    setSettings(next);
    persistState({ settings: next });

    try {
      fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operations }),
      });
    } catch {}
  };

  // --- Helper Getters ---
  const getLowStockProducts = () => {
    return products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStock);
  };

  const getOutOfStockProducts = () => {
    return products.filter((p) => p.currentStock <= 0);
  };

  const getStockValuation = () => {
    let retailValue = 0;
    let costValue = 0;

    for (const p of products) {
      retailValue += p.currentStock * p.sellingPrice;
      costValue += p.currentStock * p.purchasePrice;
    }

    const profit = retailValue - costValue;
    const profitMargin = retailValue > 0 ? (profit / retailValue) * 100 : 0;

    return {
      retailValue: Math.round(retailValue * 100) / 100,
      costValue: Math.round(costValue * 100) / 100,
      profitMargin: Math.round(profitMargin * 10) / 10,
    };
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProducts(INITIAL_PRODUCTS);
    setSuppliers(INITIAL_SUPPLIERS);
    setCustomers(INITIAL_CUSTOMERS);
    setOrders(INITIAL_ORDERS);
    setPurchases([]);
    setStockAdjustments([]);
    setSettings(INITIAL_SETTINGS);
    setGlobalCurrency(INITIAL_SETTINGS.currency);
    setCurrentUser(DEMO_USERS.admin);
    setCart([]);
    setCustomerCart([]);
    setWishlist(['prod-001', 'prod-007']);
    setCustomerAddresses(INITIAL_CUSTOMER_ADDRESSES);
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        login,
        loginWithCredentials,
        signupCustomer,
        logout,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        stockAdjustments,
        cart,
        addToCart,
        updateCartItemQuantity,
        updateCartItemDiscount,
        removeFromCart,
        clearCart,
        selectedCustomer,
        setSelectedCustomer,
        orderType,
        setOrderType,
        orderDiscount,
        setOrderDiscount,
        paymentMethod,
        setPaymentMethod,
        amountPaid,
        setAmountPaid,
        orderNotes,
        setOrderNotes,
        checkout,
        customerCart,
        addToCustomerCart,
        updateCustomerCartQuantity,
        removeFromCustomerCart,
        clearCustomerCart,
        customerCartSubtotal,
        customerCartCount,
        appliedCouponCode,
        applyStorefrontCoupon,
        removeStorefrontCoupon,
        wishlist,
        toggleWishlist,
        isInWishlist,
        customerAddresses,
        addCustomerAddress,
        updateCustomerAddress,
        deleteCustomerAddress,
        setDefaultCustomerAddress,
        placeCustomerOrder,
        orders,
        updateOrderStatus,
        assignDeliveryPerson,
        processRefund,
        suppliers,
        purchases,
        addSupplier,
        updateSupplier,
        createPurchaseOrder,
        receivePurchaseOrder,
        customers,
        addCustomer,
        updateCustomer,
        settings,
        updateSettings,
        updateStorefrontSettings,
        setCurrency,
        setTaxConfig,
        setOperations,
        getLowStockProducts,
        getOutOfStockProducts,
        getStockValuation,
        resetToDemoData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
