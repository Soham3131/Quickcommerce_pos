'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  UserPlus,
  CreditCard,
  Banknote,
  QrCode,
  Layers,
  Sparkles,
  ShoppingBag,
  Store,
  Bike,
  Clock,
  AlertCircle,
  Tag,
  Check,
  X,
  ShoppingCart,
  ChevronUp,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ProductCategory, Product, Order } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { InvoiceModal } from '@/components/billing/InvoiceModal';
import { cn } from '@/lib/utils';

const CATEGORIES: ('All' | ProductCategory)[] = [
  'All',
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Bakery & Bread',
  'Grocery & Staples',
  'Beverages',
  'Snacks & Sweets',
  'Personal Care',
  'Household & Cleaning',
  'Frozen Foods',
];

export const POSView: React.FC = () => {
  const {
    products,
    cart,
    addToCart,
    updateCartItemQuantity,
    updateCartItemDiscount,
    removeFromCart,
    clearCart,
    selectedCustomer,
    setSelectedCustomer,
    customers,
    addCustomer,
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
    settings,
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [barcodeFeedback, setBarcodeFeedback] = useState<string | null>(null);
  const [cartToast, setCartToast] = useState<string | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Close mobile cart on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMobileCartOpen) setIsMobileCartOpen(false);
        if (showAddCustomerModal) setShowAddCustomerModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileCartOpen, showAddCustomerModal]);

  // Lock body scroll when mobile cart drawer is open
  useEffect(() => {
    if (isMobileCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileCartOpen]);

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' || p.category === selectedCategory;
    const matchesQuery =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);
    return matchesCategory && matchesQuery;
  });

  const handleAddToCartWithFeedback = (p: Product, qty: number = 1) => {
    addToCart(p, qty);
    setCartToast(`Added "${p.name}" to cart`);
    setTimeout(() => setCartToast(null), 2000);
  };

  // Barcode scanner simulation handler (Enter key)
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    const matched = products.find(
      (p) => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase()
    );

    if (matched) {
      if (matched.currentStock <= 0) {
        setBarcodeFeedback(`⚠️ "${matched.name}" is OUT OF STOCK!`);
      } else {
        handleAddToCartWithFeedback(matched, 1);
        setBarcodeFeedback(`✓ Added "${matched.name}" to cart`);
      }
    } else {
      setBarcodeFeedback(`✕ No product matched barcode: ${code}`);
    }

    setBarcodeInput('');
    setTimeout(() => setBarcodeFeedback(null), 3000);
  };

  // Quick Customer Creation
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const created = addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim() || '—',
      email: newCustEmail.trim() || `${newCustName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      address: 'Counter Registration',
      customerType: 'Regular',
    });

    setSelectedCustomer(created);
    setShowAddCustomerModal(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
  };

  // Cart Calculations
  const rawSubtotal = cart.reduce((acc, ci) => {
    const price = ci.customPrice ?? ci.product.sellingPrice;
    const disc = (price * ci.quantity * ci.discountPercent) / 100;
    return acc + (price * ci.quantity - disc);
  }, 0);

  const netTaxable = Math.max(0, rawSubtotal - orderDiscount);
  const taxTotal = settings.tax.enabled
    ? cart.reduce((acc, ci) => {
        const price = ci.customPrice ?? ci.product.sellingPrice;
        const net = price * ci.quantity * (1 - ci.discountPercent / 100);
        return acc + (net * ci.product.taxRate) / 100;
      }, 0)
    : 0;

  const deliveryCharge = orderType === 'delivery' ? settings.operations.deliveryCharge : 0;
  const grandTotal = Math.round((netTaxable + taxTotal + deliveryCharge) * 100) / 100;
  const changeDue = amountPaid > grandTotal ? amountPaid - grandTotal : 0;
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Checkout Execution
  const handleCheckout = () => {
    if (cart.length === 0) return;
    const order = checkout();
    if (order) {
      setCompletedOrder(order);
      setIsMobileCartOpen(false);
      setIsInvoiceOpen(true);
    }
  };

  // Reusable Cart Renderer (used in desktop docked panel and mobile bottom-sheet drawer)
  const renderCartInner = (isMobile: boolean = false) => (
    <div className="flex flex-col h-full bg-white">
      {/* Mobile drag handle */}
      {isMobile && (
        <div className="pt-2 pb-1 flex justify-center lg:hidden">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>
      )}

      {/* Cart Header */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm text-slate-900">Customer Bill</h3>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-black text-emerald-800 tabular-nums">
            {totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline px-1 py-0.5"
            >
              Clear Cart
            </button>
          )}
          {isMobile && (
            <button
              type="button"
              onClick={() => setIsMobileCartOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 lg:hidden"
              aria-label="Close cart drawer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Order Mode & Customer Selector */}
      <div className="p-3 border-b border-slate-100 bg-white space-y-2.5 shrink-0">
        {/* Order Mode Buttons */}
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 text-xs">
          <button
            type="button"
            onClick={() => setOrderType('in-store')}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-semibold transition touch-target',
              orderType === 'in-store'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Store className="h-3.5 w-3.5 shrink-0" />
            <span>In-Store</span>
          </button>
          <button
            type="button"
            onClick={() => setOrderType('takeaway')}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-semibold transition touch-target',
              orderType === 'takeaway'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>Takeaway</span>
          </button>
          <button
            type="button"
            onClick={() => setOrderType('delivery')}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-semibold transition touch-target',
              orderType === 'delivery'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Bike className="h-3.5 w-3.5 shrink-0" />
            <span>Delivery</span>
          </button>
        </div>

        {/* Customer Selection Row */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCustomer.id}
            onChange={(e) => {
              const found = customers.find((c) => c.id === e.target.value);
              if (found) setSelectedCustomer(found);
            }}
            className="flex-1 h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.phone !== '—' ? `(${c.phone})` : ''} · {c.customerType}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowAddCustomerModal(true)}
            title="Add New Customer"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 touch-target shrink-0"
            aria-label="Add customer"
          >
            <UserPlus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100 min-h-0">
        {cart.length === 0 ? (
          <div className="flex h-44 sm:h-52 flex-col items-center justify-center text-center text-slate-400">
            <ShoppingBag className="h-9 w-9 text-slate-300 stroke-[1.5] mb-2 animate-bounce" />
            <p className="text-xs font-bold text-slate-700">Your bill is empty.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Search or add products to begin.
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.product.id} className="pt-2 first:pt-0">
              <div className="flex justify-between items-start gap-2">
                <div className="flex gap-2 min-w-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-10 w-10 rounded-lg object-cover border border-slate-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate max-w-[150px] sm:max-w-[180px]">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-slate-500 tabular-nums">
                      {formatCurrency(item.product.sellingPrice, settings.currency)} /{' '}
                      {item.product.unit}
                    </p>
                  </div>
                </div>

                {/* Item Total & Remove */}
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-slate-900 tabular-nums">
                    {formatCurrency(
                      item.product.sellingPrice *
                        item.quantity *
                        (1 - item.discountPercent / 100),
                      settings.currency
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-400 hover:text-rose-600 transition p-1 -mr-1"
                    title="Remove item"
                    aria-label={`Remove ${item.product.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Controls: Quantity Stepper & Item Discount */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* Quantity controls */}
                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      updateCartItemQuantity(
                        item.product.id,
                        item.product.isWeighed
                          ? Math.max(0.25, item.quantity - 0.25)
                          : item.quantity - 1
                      )
                    }
                    className="h-7 w-7 rounded-md flex items-center justify-center text-slate-600 hover:bg-white active:scale-95 transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <input
                    type="number"
                    step={item.product.isWeighed ? '0.25' : '1'}
                    min="0.1"
                    max={item.product.currentStock}
                    value={item.quantity}
                    onChange={(e) =>
                      updateCartItemQuantity(
                        item.product.id,
                        parseFloat(e.target.value) || 1
                      )
                    }
                    className="w-12 text-center text-xs font-bold bg-transparent focus:outline-none tabular-nums"
                  />
                  <button
                    type="button"
                    disabled={item.quantity >= item.product.currentStock}
                    onClick={() =>
                      updateCartItemQuantity(
                        item.product.id,
                        item.product.isWeighed
                          ? item.quantity + 0.25
                          : item.quantity + 1
                      )
                    }
                    className="h-7 w-7 rounded-md flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30 active:scale-95 transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Quick weight chips for weighed items */}
                {item.product.isWeighed && (
                  <div className="flex items-center gap-1">
                    {[0.25, 0.5, 0.75, 1.0].map((inc) => (
                      <button
                        key={inc}
                        type="button"
                        onClick={() =>
                          updateCartItemQuantity(
                            item.product.id,
                            Math.min(
                              item.product.currentStock,
                              Math.round((item.quantity + inc) * 100) / 100
                            )
                          )
                        }
                        className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition"
                      >
                        +{inc}
                      </button>
                    ))}
                  </div>
                )}

                {/* Item Discount % */}
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-[10px] text-slate-400">Disc:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={item.discountPercent || ''}
                    onChange={(e) =>
                      updateCartItemDiscount(
                        item.product.id,
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="h-6 w-10 rounded border border-slate-200 bg-white text-center text-[11px] font-semibold focus:border-emerald-500 focus:outline-none tabular-nums"
                  />
                  <span className="text-[10px] text-slate-400">%</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Calculation Summary Footer */}
      <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50/95 space-y-2 shrink-0">
        {/* Subtotal & Order Discount */}
        <div className="flex justify-between text-xs text-slate-600">
          <span>Subtotal:</span>
          <span className="tabular-nums font-semibold">{formatCurrency(rawSubtotal, settings.currency)}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600">Order Discount:</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">{settings.currency.symbol}</span>
            <input
              type="number"
              min="0"
              value={orderDiscount || ''}
              onChange={(e) => setOrderDiscount(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="h-6 w-16 rounded border border-slate-200 bg-white text-right px-1.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none tabular-nums"
            />
          </div>
        </div>

        <div className="flex justify-between text-xs text-slate-600">
          <span>GST Tax ({settings.tax.name}):</span>
          <span className="tabular-nums font-semibold">{formatCurrency(taxTotal, settings.currency)}</span>
        </div>

        {deliveryCharge > 0 && (
          <div className="flex justify-between text-xs text-slate-600">
            <span>Delivery Charge:</span>
            <span className="tabular-nums font-semibold">{formatCurrency(deliveryCharge, settings.currency)}</span>
          </div>
        )}

        {/* Grand Total */}
        <div className="flex justify-between items-baseline border-t border-slate-200 pt-2">
          <span className="font-extrabold text-sm text-slate-900">Grand Total:</span>
          <span className="text-xl font-black text-emerald-700 tabular-nums">
            {formatCurrency(grandTotal, settings.currency)}
          </span>
        </div>

        {/* Payment Method Selector */}
        <div className="grid grid-cols-4 gap-1 pt-1">
          <button
            type="button"
            onClick={() => setPaymentMethod('cash')}
            className={cn(
              'flex flex-col items-center justify-center rounded-xl py-2 text-[11px] font-semibold transition border touch-target',
              paymentMethod === 'cash'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
            )}
          >
            <Banknote className="h-4 w-4 mb-0.5" />
            <span>Cash</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={cn(
              'flex flex-col items-center justify-center rounded-xl py-2 text-[11px] font-semibold transition border touch-target',
              paymentMethod === 'card'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
            )}
          >
            <CreditCard className="h-4 w-4 mb-0.5" />
            <span>Card</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('upi')}
            className={cn(
              'flex flex-col items-center justify-center rounded-xl py-2 text-[11px] font-semibold transition border touch-target',
              paymentMethod === 'upi'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
            )}
          >
            <QrCode className="h-4 w-4 mb-0.5" />
            <span>UPI</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('split')}
            className={cn(
              'flex flex-col items-center justify-center rounded-xl py-2 text-[11px] font-semibold transition border touch-target',
              paymentMethod === 'split'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
            )}
          >
            <Layers className="h-4 w-4 mb-0.5" />
            <span>Split</span>
          </button>
        </div>

        {/* Cash Payment Tender & Change Due */}
        {paymentMethod === 'cash' && (
          <div className="rounded-xl border border-slate-200 bg-white p-2.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Cash Received:</span>
              <input
                type="number"
                placeholder={String(grandTotal)}
                value={amountPaid || ''}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                className="h-8 w-28 rounded-lg border border-slate-200 px-2.5 text-right font-bold text-slate-900 focus:border-emerald-500 focus:outline-none tabular-nums"
              />
            </div>
            {amountPaid > 0 && (
              <div className="flex justify-between font-bold text-emerald-700 pt-1 border-t border-slate-100 tabular-nums">
                <span>Change Due:</span>
                <span>{formatCurrency(changeDue, settings.currency)}</span>
              </div>
            )}
          </div>
        )}

        {/* Checkout Action Button */}
        <button
          type="button"
          disabled={cart.length === 0}
          onClick={handleCheckout}
          className={cn(
            'w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-extrabold text-sm text-white shadow-md transition active:scale-98 min-h-[44px]',
            cart.length === 0
              ? 'bg-slate-300 cursor-not-allowed shadow-none'
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-700/25'
          )}
        >
          <Sparkles className="h-4 w-4" />
          <span>Complete Checkout & Print Bill</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-3.5 sm:gap-4 h-full max-h-full overflow-hidden relative">
      {/* Toast Notification Banner */}
      {cartToast && (
        <div className="fixed top-20 right-4 z-50 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl flex items-center gap-2 animate-fade-in">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{cartToast}</span>
        </div>
      )}

      {/* ========================================================
          LEFT: PRODUCT CATALOG & SCANNER
          ======================================================== */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-w-0 pb-16 lg:pb-0 h-full max-h-full">
        {/* Top Controls: Search & Barcode Input */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50/70 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search grocery items, SKU, or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-xs placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs transition"
              />
            </div>

            {/* Barcode Scanner Simulator */}
            <form onSubmit={handleBarcodeSubmit} className="relative sm:w-64">
              <Barcode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="Scan / type Barcode..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="h-10 w-full rounded-xl border border-emerald-200 bg-emerald-50/40 pl-9 pr-14 text-xs font-mono placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95"
              >
                Scan
              </button>
            </form>
          </div>

          {/* Barcode notification banner */}
          {barcodeFeedback && (
            <div className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-md animate-fade-in flex items-center justify-between">
              <span>{barcodeFeedback}</span>
              <button
                type="button"
                onClick={() => setBarcodeFeedback(null)}
                className="text-slate-400 hover:text-white text-xs ml-2 p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Category Filter Pills (Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all shadow-xs touch-target',
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-emerald-700/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4">
          {filteredProducts.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center text-slate-400">
              <ShoppingBag className="h-10 w-10 text-slate-300 stroke-[1.5] mb-2" />
              <p className="text-sm font-semibold text-slate-600">No products match your search</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Try searching with another keyword or barcode.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.currentStock <= 0;
                const isLowStock = p.currentStock > 0 && p.currentStock <= p.minStock;
                const inCart = cart.find((item) => item.product.id === p.id);

                return (
                  <div
                    key={p.id}
                    className={cn(
                      'group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3 transition-all duration-200 shadow-xs hover:border-emerald-300 hover:shadow-md',
                      isOutOfStock && 'opacity-60 bg-slate-50/80 cursor-not-allowed'
                    )}
                  >
                    {/* Top: Product Image & Badges */}
                    <div>
                      <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-slate-100 mb-2.5">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        {/* Stock status badge */}
                        <div className="absolute top-1.5 right-1.5">
                          {isOutOfStock ? (
                            <span className="rounded-md bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs animate-pulse">
                              Only {p.currentStock} {p.unit}
                            </span>
                          ) : (
                            <span className="rounded-md bg-emerald-600/90 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-xs">
                              {p.currentStock} {p.unit}
                            </span>
                          )}
                        </div>

                        {/* In-cart indicator badge */}
                        {inCart && (
                          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-md bg-slate-900/90 px-2 py-0.5 text-[10px] font-bold text-white animate-fade-in">
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span>{inCart.quantity} in cart</span>
                          </div>
                        )}
                      </div>

                      {/* Title & Category */}
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate block">
                        {p.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug mt-0.5">
                        {p.name}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        SKU: {p.sku}
                      </p>
                    </div>

                    {/* Bottom: Price & Add Button */}
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-black text-slate-900 tabular-nums">
                            {formatCurrency(p.sellingPrice, settings.currency)}
                          </span>
                          <span className="text-[10px] text-slate-400">/{p.unit}</span>
                        </div>
                        {p.mrp > p.sellingPrice && (
                          <span className="text-[10px] text-slate-400 line-through block tabular-nums">
                            MRP: {formatCurrency(p.mrp, settings.currency)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => handleAddToCartWithFeedback(p, 1)}
                        className={cn(
                          'flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-xs touch-target',
                          isOutOfStock
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                        )}
                        aria-label={`Add ${p.name} to cart`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          DESKTOP DOCKED CART (>= lg screens)
          ======================================================== */}
      <div className="hidden lg:flex w-[390px] xl:w-[410px] flex-col rounded-2xl border border-slate-200 shadow-sm overflow-hidden shrink-0 bg-white h-full max-h-full">
        {renderCartInner(false)}
      </div>

      {/* ========================================================
          MOBILE STICKY BOTTOM SUMMARY BAR (< lg screens)
          ======================================================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md px-4 py-3 border-t border-slate-800 text-white flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
              <ShoppingCart className="h-5 w-5" />
            </div>
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">
                {totalItemsCount}
              </span>
            )}
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
              {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
            </p>
            <p className="text-base font-black text-emerald-400 tabular-nums leading-tight">
              {formatCurrency(grandTotal, settings.currency)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileCartOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-2.5 font-bold text-xs shadow-md transition active:scale-95 touch-target"
        >
          <span>View Cart & Pay</span>
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>

      {/* ========================================================
          MOBILE SLIDE-UP BOTTOM SHEET CART DRAWER (< lg screens)
          ======================================================== */}
      {isMobileCartOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
            onClick={() => setIsMobileCartOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] rounded-t-3xl bg-white shadow-2xl flex flex-col border-t border-slate-300 animate-slide-up lg:hidden overflow-hidden">
            {renderCartInner(true)}
          </div>
        </>
      )}

      {/* Quick Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Quick Customer Registration
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add new customer details for loyalty points and invoices.
            </p>
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  placeholder="ramesh@example.com"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 touch-target"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 touch-target"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal Preview */}
      <InvoiceModal
        order={completedOrder}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        onNewSale={() => {
          setIsInvoiceOpen(false);
          clearCart();
        }}
      />
    </div>
  );
};
