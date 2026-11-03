'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Tag,
  CheckCircle2,
  Heart,
  ArrowLeft,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/currency';
import { calculateTax } from '@/lib/tax';
import { validateCoupon } from '@/lib/coupons/couponService';

export default function ShoppingCartPage() {
  const router = useRouter();
  const {
    settings,
    customerCart,
    customerCartSubtotal,
    customerCartCount,
    updateCustomerCartQuantity,
    removeFromCustomerCart,
    clearCustomerCart,
    toggleWishlist,
    isInWishlist,
    appliedCouponCode,
    applyStorefrontCoupon,
    removeStorefrontCoupon,
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const threshold = settings.storefront?.freeDeliveryThreshold || 499;
  const isThresholdFree = customerCartSubtotal >= threshold;
  const amountNeededForFreeDelivery = Math.max(0, threshold - customerCartSubtotal);
  const progressPercent = Math.min(100, Math.round((customerCartSubtotal / threshold) * 100));

  // Authoritative validation using centralized coupon engine
  const couponResult = validateCoupon(
    appliedCouponCode,
    customerCartSubtotal,
    settings.operations.deliveryCharge,
    settings,
    { fulfillment: 'delivery', isFreeDeliveryByThreshold: isThresholdFree }
  );

  const isFreeDelivery = isThresholdFree || (couponResult.isValid && couponResult.isFreeShipping);
  const couponDiscount = couponResult.isValid ? couponResult.discountAmount : 0;

  // Calculate estimated taxes
  let estimatedTax = 0;
  customerCart.forEach((ci) => {
    const itemSubtotal = ci.product.sellingPrice * ci.quantity;
    const rate = settings.tax.enabled ? ci.product.taxRate : 0;
    const calc = calculateTax(itemSubtotal, rate, settings.tax.isInclusive);
    estimatedTax += calc.taxAmount;
  });

  // Delivery charge
  const deliveryFee = isFreeDelivery ? 0 : settings.operations.deliveryCharge;
  const grandTotal = Math.max(
    0,
    customerCartSubtotal - couponDiscount + (settings.tax.isInclusive ? 0 : estimatedTax) + deliveryFee
  );

  // Total savings
  const totalMrp = customerCart.reduce((sum, item) => sum + item.product.mrp * item.quantity, 0);
  const totalSavings = Math.max(0, totalMrp - customerCartSubtotal) + couponDiscount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponMessage(null);
    if (!couponCode.trim()) return;

    const res = applyStorefrontCoupon(couponCode);
    if (res.isValid) {
      setCouponMessage({ type: 'success', text: res.message });
      setCouponCode('');
    } else {
      setCouponMessage({ type: 'error', text: res.message });
    }
  };

  const handleRemoveCoupon = () => {
    removeStorefrontCoupon();
    setCouponMessage(null);
    setCouponCode('');
  };

  if (customerCart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center space-y-4">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-xs">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Your Grocery Basket is Empty
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Looks like you haven&apos;t added any farm fresh produce, milk, or kitchen staples yet.
        </p>
        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-700/20 transition active:scale-95"
          >
            <span>Explore Fresh Groceries</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <Link href="/" className="hover:text-emerald-700 transition">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-700">Shopping Cart</span>
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Shopping Cart ({customerCartCount} {customerCartCount === 1 ? 'item' : 'items'})
          </h1>
          <button
            type="button"
            onClick={clearCustomerCart}
            className="text-xs font-bold text-rose-600 hover:underline"
          >
            Clear Basket
          </button>
        </div>
      </div>

      {/* Free Delivery Progress Banner */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2 text-emerald-900">
            <Truck className="h-4 w-4 text-emerald-600" />
            <span>
              {isFreeDelivery
                ? '🎉 Congratulations! You have unlocked FREE Doorstep Delivery.'
                : `Add ${formatCurrency(amountNeededForFreeDelivery, settings.currency)} more to unlock FREE Delivery!`}
            </span>
          </div>
          <span className="text-emerald-700 font-extrabold">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-emerald-200/80 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Cart Items Table / Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs space-y-4">
          <div className="divide-y divide-slate-100">
            {customerCart.map((item) => {
              const itemTotal = item.product.sellingPrice * item.quantity;
              const step = item.product.isWeighed ? 0.25 : 1;
              const isWish = isInWishlist(item.product.id);

              return (
                <div
                  key={item.product.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Media & Details */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Link
                      href={`/product/${item.product.id}`}
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-slate-50 border border-slate-100 p-2 shrink-0 flex items-center justify-center overflow-hidden"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </Link>

                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        {item.product.brand}
                      </p>
                      <Link
                        href={`/product/${item.product.id}`}
                        className="font-bold text-xs sm:text-sm text-slate-900 hover:text-emerald-700 transition line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-[11px] text-slate-500">
                        {formatCurrency(item.product.sellingPrice, settings.currency)} /{' '}
                        {item.product.unit}
                        {item.product.mrp > item.product.sellingPrice && (
                          <span className="line-through text-slate-400 ml-1.5 tabular-nums">
                            {formatCurrency(item.product.mrp, settings.currency)}
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-3 pt-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => toggleWishlist(item.product.id)}
                          className={`flex items-center gap-1 ${
                            isWish ? 'text-rose-600 font-bold' : 'text-slate-400 hover:text-rose-600'
                          }`}
                        >
                          <Heart className={`h-3.5 w-3.5 ${isWish ? 'fill-rose-600' : ''}`} />
                          <span>{isWish ? 'Saved' : 'Save for later'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper & Subtotal */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto self-end sm:self-center">
                    {/* Stepper */}
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateCustomerCartQuantity(
                            item.product.id,
                            Math.max(0, item.quantity - step)
                          )
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-700 hover:bg-slate-100 shadow-2xs font-bold"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-3 text-xs font-black text-slate-900 font-mono tabular-nums">
                        {item.quantity} {item.product.unit}
                      </span>
                      <button
                        type="button"
                        disabled={item.quantity >= item.product.currentStock}
                        onClick={() =>
                          updateCustomerCartQuantity(
                            item.product.id,
                            Math.min(item.product.currentStock, item.quantity + step)
                          )
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs font-bold disabled:opacity-40"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Total & Delete */}
                    <div className="text-right min-w-[70px]">
                      <p className="font-black text-sm sm:text-base text-slate-900 tabular-nums">
                        {formatCurrency(itemTotal, settings.currency)}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFromCustomerCart(item.product.id)}
                        className="text-[11px] text-slate-400 hover:text-rose-600 transition flex items-center gap-1 justify-end ml-auto mt-0.5"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Continue Shopping Groceries</span>
            </Link>
          </div>
        </div>

        {/* Right: Order Summary Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="font-black text-base text-slate-900">Order Summary</h3>

            {/* Promo Coupon Box */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">Have a Promotional Code?</label>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. WELCOME50, FREESHIP"
                  className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-xs uppercase font-mono placeholder:normal-case placeholder:font-sans focus:border-emerald-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition active:scale-95"
                >
                  Apply
                </button>
              </form>

              {/* Active Applied Coupon Pill */}
              {appliedCouponCode && couponResult.isValid && (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-300 px-3 py-2 text-xs font-bold text-emerald-900 shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-mono">{appliedCouponCode}</span>
                      <span className="text-[11px] font-semibold text-emerald-700 ml-1.5">
                        {couponResult.isFreeShipping ? '· Free Delivery' : `· Saved ${formatCurrency(couponDiscount, settings.currency)}`}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold underline underline-offset-2 ml-2"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Status Message */}
              {couponMessage && (
                <div
                  className={`rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-2 ${
                    couponMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  <Tag className="h-3.5 w-3.5 shrink-0" />
                  <span>{couponMessage.text}</span>
                </div>
              )}

              {/* Quick-Apply Demo Coupon Chips */}
              <div className="pt-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Available Offers
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { code: 'WELCOME50', label: '10% OFF (Min ₹300)' },
                    { code: 'FREESHIP', label: 'Free Delivery' },
                    { code: 'AVANI15', label: '15% OFF (Min ₹1000)' },
                  ].map((demo) => (
                    <button
                      key={demo.code}
                      type="button"
                      onClick={() => {
                        const res = applyStorefrontCoupon(demo.code);
                        if (res.isValid) {
                          setCouponMessage({ type: 'success', text: res.message });
                        } else {
                          setCouponMessage({ type: 'error', text: res.message });
                        }
                      }}
                      className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition ${
                        appliedCouponCode === demo.code
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                      }`}
                    >
                      <span className="font-bold">{demo.code}</span>
                      <span className="text-[9px] text-slate-400 ml-1 font-sans">({demo.label})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {formatCurrency(customerCartSubtotal, settings.currency)}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Savings</span>
                  <span className="tabular-nums">
                    -{formatCurrency(couponDiscount, settings.currency)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  <span>Delivery Charges</span>
                  {isFreeDelivery && (
                    <span className="rounded bg-emerald-100 px-1 py-0.2 text-[9px] font-black text-emerald-800 uppercase">
                      Free
                    </span>
                  )}
                </span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {deliveryFee > 0
                    ? formatCurrency(deliveryFee, settings.currency)
                    : formatCurrency(0, settings.currency)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Estimated {settings.tax.name}</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {settings.tax.isInclusive ? (
                    <span className="text-slate-400 font-normal">Included in MRP</span>
                  ) : (
                    formatCurrency(estimatedTax, settings.currency)
                  )}
                </span>
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between rounded-xl bg-amber-50 p-2 text-xs font-bold text-amber-900">
                  <span>Your Total Supermarket Savings</span>
                  <span className="tabular-nums">
                    {formatCurrency(totalSavings, settings.currency)}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-black text-sm text-slate-900">Grand Total</span>
                <span className="text-xl font-black text-emerald-700 tabular-nums">
                  {formatCurrency(grandTotal, settings.currency)}
                </span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              type="button"
              onClick={() => router.push('/checkout')}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 text-xs sm:text-sm font-black shadow-lg shadow-emerald-700/25 transition active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Assurance */}
            <div className="pt-2 text-center text-[11px] text-slate-400 space-y-1">
              <p>Safe &amp; Secure Checkout Demo · Local Persistence</p>
              <p>Instant GST invoice generated immediately upon ordering.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
