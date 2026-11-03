'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  Store,
  Clock,
  MapPin,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Plus,
  ShoppingBag,
  Tag,
  Lock,
  Info,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/currency';
import { calculateTax } from '@/lib/tax';
import { OrderType, PaymentMethod, CustomerAddress } from '@/types';
import { validateCoupon } from '@/lib/coupons/couponService';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    settings,
    customerCart,
    customerCartSubtotal,
    customerAddresses,
    addCustomerAddress,
    placeCustomerOrder,
    currentUser,
    appliedCouponCode,
    applyStorefrontCoupon,
    removeStorefrontCoupon,
  } = useStore();

  // Redirect if cart is empty
  useEffect(() => {
    if (customerCart.length === 0) {
      router.replace('/cart');
    }
  }, [customerCart, router]);

  // Form states
  const [customerName, setCustomerName] = useState(currentUser?.name || 'Priya Sharma');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [customerEmail, setCustomerEmail] = useState(
    currentUser?.email || 'customer@avanigrocers.com'
  );

  // Fulfilment mode: delivery or takeaway
  const [orderType, setOrderType] = useState<OrderType>(
    settings.operations.deliveryEnabled ? 'delivery' : 'takeaway'
  );

  // Selected address or custom address
  const defaultAddr = customerAddresses.find((a) => a.isDefault) || customerAddresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddr?.id || 'new');

  // New address form fields
  const [houseNo, setHouseNo] = useState('Flat 402, Tower B');
  const [street, setStreet] = useState('Palm Grove Heights');
  const [area, setArea] = useState('Golf Course Ext Road, Sector 65');
  const [landmark, setLandmark] = useState('Near WorldMark Mall');
  const [city, setCity] = useState(settings.city || 'Gurugram');
  const [state, setState] = useState(settings.state || 'Haryana');
  const [pincode, setPincode] = useState('122018');

  // Time slot & instructions
  const [deliverySlot, setDeliverySlot] = useState('Express ASAP (30–45 mins)');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod' as any); // cod, upi, card
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Calculations via Centralized Coupon Engine
  const threshold = settings.storefront?.freeDeliveryThreshold || 499;
  const isTakeaway = orderType === 'takeaway';
  const isThresholdFree = isTakeaway || customerCartSubtotal >= threshold;

  const couponResult = validateCoupon(
    appliedCouponCode,
    customerCartSubtotal,
    settings.operations.deliveryCharge,
    settings,
    { fulfillment: isTakeaway ? 'takeaway' : 'delivery', isFreeDeliveryByThreshold: isThresholdFree }
  );

  const isFreeDelivery = isThresholdFree || (couponResult.isValid && couponResult.isFreeShipping);
  const couponDiscount = couponResult.isValid ? couponResult.discountAmount : 0;

  let estimatedTax = 0;
  customerCart.forEach((ci) => {
    const itemSubtotal = ci.product.sellingPrice * ci.quantity;
    const rate = settings.tax.enabled ? ci.product.taxRate : 0;
    const calc = calculateTax(itemSubtotal, rate, settings.tax.isInclusive);
    estimatedTax += calc.taxAmount;
  });

  const deliveryFee = isFreeDelivery ? 0 : settings.operations.deliveryCharge;
  const netTaxable = Math.max(0, customerCartSubtotal - couponDiscount);
  const grandTotal = Math.max(
    0,
    netTaxable + (settings.tax.isInclusive ? 0 : estimatedTax) + deliveryFee
  );

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

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');

    if (!customerName.trim() || !customerPhone.trim()) {
      setOrderError('Please enter your full name and contact phone number.');
      return;
    }

    let finalAddress = 'Store Pickup / Counter Collection';
    if (orderType === 'delivery') {
      if (selectedAddressId !== 'new') {
        const found = customerAddresses.find((a) => a.id === selectedAddressId);
        if (found) {
          finalAddress = `${found.houseNo}, ${found.street}, ${found.area}, ${found.city} – ${found.pincode} (Ph: ${found.phone})`;
        }
      } else {
        if (!houseNo.trim() || !street.trim() || !area.trim() || !pincode.trim()) {
          setOrderError('Please enter your complete delivery street address and pincode.');
          return;
        }
        finalAddress = `${houseNo}, ${street}, ${area}, ${city} – ${pincode}`;
      }
    }

    setIsSubmitting(true);

    try {
      const createdOrder = placeCustomerOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerAddress: finalAddress,
        orderType,
        deliverySlot,
        deliveryInstructions: deliveryInstructions.trim() || undefined,
        paymentMethod: paymentMethod === ('cod' as any) ? 'cash' : paymentMethod,
        couponCode: appliedCouponCode || undefined,
        notes: deliveryInstructions.trim() || undefined,
      });

      if (createdOrder) {
        router.push(`/order-confirmation/${createdOrder.id}`);
      } else {
        setOrderError('Failed to place order. Please review your basket.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setOrderError('An unexpected error occurred while placing your order. Please retry.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Breadcrumb */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <Link href="/" className="hover:text-emerald-700 transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-emerald-700 transition">
            Cart
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-700">Checkout</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Checkout &amp; Order Placement
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your grocery items, choose delivery or store pickup, and confirm your demo order.
        </p>
      </div>

      {orderError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{orderError}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Multi-Section Checkout Forms */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: CONTACT DETAILS */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                  1
                </span>
                <span>Customer Contact Information</span>
              </h2>
              {currentUser?.role === 'customer' && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Signed in as {currentUser.name}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
                  placeholder="e.g. Priya Sharma"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Email (For GST Bill)</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-medium focus:border-emerald-600 focus:outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: FULFILMENT METHOD */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                2
              </span>
              <span>Fulfilment Method</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Home Delivery Card */}
              <div
                onClick={() => settings.operations.deliveryEnabled && setOrderType('delivery')}
                className={`relative rounded-2xl border p-4 cursor-pointer transition flex items-start gap-3.5 ${
                  orderType === 'delivery'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                } ${!settings.operations.deliveryEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    orderType === 'delivery'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-xs text-slate-900">Home Delivery</p>
                    {isFreeDelivery && (
                      <span className="rounded bg-emerald-100 px-1 py-0.2 text-[9px] font-black text-emerald-800">
                        FREE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Express courier to your doorstep ({settings.operations.estimatedDeliveryTime})
                  </p>
                  {!settings.operations.deliveryEnabled && (
                    <p className="text-[10px] font-bold text-rose-600 mt-1">Currently disabled by store</p>
                  )}
                </div>
              </div>

              {/* Takeaway / Counter Pickup Card */}
              <div
                onClick={() => settings.operations.takeawayEnabled && setOrderType('takeaway')}
                className={`relative rounded-2xl border p-4 cursor-pointer transition flex items-start gap-3.5 ${
                  orderType === 'takeaway'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                } ${!settings.operations.takeawayEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    orderType === 'takeaway'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900">Takeaway / Store Pickup</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Collect packed bags from store ({settings.operations.estimatedTakeawayTime})
                  </p>
                  {!settings.operations.takeawayEnabled && (
                    <p className="text-[10px] font-bold text-rose-600 mt-1">Currently disabled by store</p>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 3A: DELIVERY ADDRESS (IF HOME DELIVERY) */}
            {orderType === 'delivery' && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <p className="text-xs font-bold text-slate-900">Delivery Address</p>

                {/* Saved addresses options */}
                {customerAddresses.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    {customerAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition text-xs space-y-1 ${
                          selectedAddressId === addr.id
                            ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 font-medium">
                          {addr.houseNo}, {addr.street}
                        </p>
                        <p className="text-slate-500 text-[11px]">
                          {addr.area}, {addr.city} – {addr.pincode}
                        </p>
                      </div>
                    ))}

                    <div
                      onClick={() => setSelectedAddressId('new')}
                      className={`p-3.5 rounded-2xl border border-dashed flex items-center justify-center cursor-pointer text-xs font-bold transition ${
                        selectedAddressId === 'new'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      <span>Enter Another Address</span>
                    </div>
                  </div>
                )}

                {/* Form fields if 'new' address */}
                {selectedAddressId === 'new' && (
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700">
                          Flat / House / Building *
                        </label>
                        <input
                          type="text"
                          required
                          value={houseNo}
                          onChange={(e) => setHouseNo(e.target.value)}
                          placeholder="e.g. Flat 402, Tower B"
                          className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-600 focus:outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700">
                          Street / Society / Colony *
                        </label>
                        <input
                          type="text"
                          required
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="e.g. Palm Grove Heights"
                          className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-600 focus:outline-none bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700">Area / Locality *</label>
                        <input
                          type="text"
                          required
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          placeholder="e.g. Golf Course Ext Rd"
                          className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-600 focus:outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700">City *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Gurugram"
                          className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-600 focus:outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700">Pincode *</label>
                        <input
                          type="text"
                          required
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          placeholder="122018"
                          className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-600 focus:outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3B: STORE PICKUP LOCATION (IF TAKEAWAY) */}
            {orderType === 'takeaway' && (
              <div className="pt-4 border-t border-slate-100 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Store className="h-4 w-4 text-emerald-600" />
                  <span>Pickup Location: {settings.companyName} Supermarket</span>
                </p>
                <p className="text-slate-600">{settings.address}, {settings.city} – {settings.pincode}</p>
                <p className="text-[11px] text-emerald-700 font-bold">
                  Estimated Ready Time: {settings.operations.estimatedTakeawayTime} from order confirmation.
                </p>
              </div>
            )}
          </div>

          {/* STEP 3: TIME SLOT & DELIVERY INSTRUCTIONS */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                3
              </span>
              <span>Delivery Time Slot &amp; Instructions</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">Preferred Time Window</label>
                <select
                  value={deliverySlot}
                  onChange={(e) => setDeliverySlot(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
                >
                  <option value="Express ASAP (30–45 mins)">⚡ Express ASAP (30–45 mins)</option>
                  <option value="Today Evening (5:00 PM – 7:00 PM)">Today Evening (5:00 PM – 7:00 PM)</option>
                  <option value="Today Night (8:00 PM – 10:00 PM)">Today Night (8:00 PM – 10:00 PM)</option>
                  <option value="Tomorrow Morning (8:00 AM – 10:00 AM)">Tomorrow Morning (8:00 AM – 10:00 AM)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Special Rider Instructions</label>
                <input
                  type="text"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g. Leave at door, call before arriving..."
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* STEP 4: PAYMENT SELECTION (DEMO SIMULATION) */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                  4
                </span>
                <span>Select Payment Method (Demo Simulation)</span>
              </h2>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                <Lock className="h-3 w-3" />
                <span>Simulated Sandbox</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Cash On Delivery */}
              <div
                onClick={() => setPaymentMethod('cod' as any)}
                className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                  (paymentMethod as any) === 'cod' || paymentMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 text-slate-900">
                  <Banknote className="h-5 w-5 text-emerald-600" />
                  <span className="font-bold text-xs">
                    {orderType === 'takeaway' ? 'Cash on Pickup' : 'Cash on Delivery'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Pay at your doorstep via cash or mobile QR scanner upon arrival.
                </p>
              </div>

              {/* Instant UPI Demo */}
              <div
                onClick={() => setPaymentMethod('upi')}
                className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                  paymentMethod === 'upi'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 text-slate-900">
                  <QrCode className="h-5 w-5 text-purple-600" />
                  <span className="font-bold text-xs">UPI Instant (Demo)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Simulate instant payment via GPay, PhonePe, Paytm, or BHIM.
                </p>
              </div>

              {/* Card Payment Demo */}
              <div
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                  paymentMethod === 'card'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 text-slate-900">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <span className="font-bold text-xs">Card Payment (Demo)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Simulate Visa, MasterCard, or RuPay credit &amp; debit card processing.
                </p>
              </div>
            </div>

            {/* Simulated Payment Notice Banner */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-[11px] text-blue-900 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] text-blue-800 bg-blue-200/80 px-1.5 py-0.5 rounded-md mr-1.5">
                  DEMO SIMULATION
                </span>
                <span>
                  All payments are simulated in database-free demo mode. No real money or payment gateway credentials (Razorpay/Stripe) are required or processed.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Review & Checkout Summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="font-black text-base text-slate-900">Order Items ({customerCart.length})</h3>

            {/* Items mini list */}
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
              {customerCart.map((item) => (
                <div key={item.product.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-8 w-8 rounded-lg object-contain bg-slate-50 border border-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{item.product.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {item.quantity} {item.product.unit} ×{' '}
                        {formatCurrency(item.product.sellingPrice, settings.currency)}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 tabular-nums shrink-0">
                    {formatCurrency(item.product.sellingPrice * item.quantity, settings.currency)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Box */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">Promo Coupon</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. WELCOME50"
                  className="h-9 flex-1 rounded-xl border border-slate-200 px-3 text-xs uppercase font-mono focus:border-emerald-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition active:scale-95"
                >
                  Apply
                </button>
              </div>

              {appliedCouponCode && couponResult.isValid && (
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 p-2 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {appliedCouponCode} (
                      {couponResult.isFreeShipping
                        ? 'Free Delivery'
                        : `Saved ${formatCurrency(couponDiscount, settings.currency)}`}
                      )
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-rose-600 hover:text-rose-700 font-bold underline ml-2"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponMessage && (
                <p
                  className={`text-[11px] font-semibold ${
                    couponMessage.type === 'success' ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {couponMessage.text}
                </p>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {formatCurrency(customerCartSubtotal, settings.currency)}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount</span>
                  <span className="tabular-nums">
                    -{formatCurrency(couponDiscount, settings.currency)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {deliveryFee > 0
                    ? formatCurrency(deliveryFee, settings.currency)
                    : formatCurrency(0, settings.currency)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>{settings.tax.name}</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {settings.tax.isInclusive ? (
                    <span className="text-slate-400 font-normal">Included</span>
                  ) : (
                    formatCurrency(estimatedTax, settings.currency)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-black text-sm text-slate-900">Total Payable</span>
                <span className="text-xl font-black text-emerald-700 tabular-nums">
                  {formatCurrency(grandTotal, settings.currency)}
                </span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 text-xs sm:text-sm font-black shadow-lg shadow-emerald-700/25 transition active:scale-98 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Placing Order...' : 'Place Order & Print Bill'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="text-[10px] text-center text-slate-400 leading-tight">
              By confirming, inventory stock will update instantly across the Avani Grocers retail
              ERP.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
