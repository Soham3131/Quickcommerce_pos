'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Package,
  Truck,
  Printer,
  ShoppingBag,
  ArrowRight,
  Clock,
  MapPin,
  CreditCard,
  FileText,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/currency';
import { formatDateTime } from '@/lib/utils';
import { InvoiceModal } from '@/components/billing/InvoiceModal';

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const { orders, settings } = useStore();
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const order = orders.find((o) => o.id === params.id || o.invoiceNumber === params.id);

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested order ID does not exist in the store records.
        </p>
        <Link
          href="/shop"
          className="inline-flex rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-md shadow-emerald-700/10 animate-scale-up">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-800">
          Order Confirmed &amp; Dispatched to Store
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Thank you for your order, {order.customerName.split(' ')[0]}!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
          Your order has been logged into our retail inventory system. You can track preparation and
          courier dispatch in real time.
        </p>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={`/track-order/${order.id}`}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-700/20 transition active:scale-95"
        >
          <Truck className="h-4 w-4" />
          <span>Track Live Order Status</span>
          <ArrowRight className="h-4 w-4" />
        </Link>

        <button
          type="button"
          onClick={() => setInvoiceModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 px-5 py-3 text-xs sm:text-sm font-bold shadow-2xs transition"
        >
          <Printer className="h-4 w-4 text-slate-600" />
          <span>View / Print GST Invoice</span>
        </button>

        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 px-5 py-3 text-xs sm:text-sm font-bold transition"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Order Details Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <p className="text-xs text-slate-400 font-semibold">Invoice Number</p>
            <p className="text-lg font-black font-mono text-slate-900">{order.invoiceNumber}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-slate-400 font-semibold">Order Placed At</p>
            <p className="text-xs font-bold text-slate-700">{formatDateTime(order.createdAt)}</p>
          </div>
        </div>

        {/* 3 Columns: Fulfilment, Payment, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Truck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Fulfilment</span>
            </span>
            <p className="font-bold text-slate-900 capitalize">
              {order.orderType === 'takeaway' ? 'Store Pickup' : 'Home Delivery'}
            </p>
            <p className="text-slate-500 text-[11px] leading-tight line-clamp-2">
              {order.customerAddress || 'Avani Grocers Store'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5 text-blue-600" />
              <span>Payment Mode</span>
            </span>
            <p className="font-bold text-slate-900 capitalize">
              {order.paymentMethod === 'cash' ? 'Cash on Delivery (COD)' : order.paymentMethod.toUpperCase()}
            </p>
            <span
              className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                order.paymentStatus === 'paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              Payment: {order.paymentStatus.toUpperCase()}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-purple-600" />
              <span>Estimated Delivery</span>
            </span>
            <p className="font-bold text-slate-900">
              {order.deliverySlot || '30–45 minutes'}
            </p>
            <span className="inline-block rounded-md bg-purple-100 text-purple-800 px-2 py-0.5 text-[10px] font-bold capitalize">
              Status: {order.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="space-y-3 pt-2">
          <h3 className="font-bold text-sm text-slate-900">Ordered Groceries ({order.items.length})</h3>
          <div className="rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-100 text-xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{item.productName}</p>
                  <p className="text-[11px] text-slate-500">
                    {item.quantity} {item.unit} × {formatCurrency(item.unitPrice, settings.currency)}
                  </p>
                </div>
                <span className="font-black text-slate-900 tabular-nums">
                  {formatCurrency(item.total, settings.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs max-w-sm ml-auto">
          <div className="flex justify-between text-slate-600">
            <span>Items Subtotal</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {formatCurrency(order.subtotal, settings.currency)}
            </span>
          </div>
          {order.orderDiscount > 0 && (
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Coupon Discount</span>
              <span className="tabular-nums">
                -{formatCurrency(order.orderDiscount, settings.currency)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Delivery Fee</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {order.deliveryCharge > 0
                ? formatCurrency(order.deliveryCharge, settings.currency)
                : 'FREE'}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>{settings.tax.name} Total</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {formatCurrency(order.taxAmount, settings.currency)}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-sm">
            <span className="font-black text-slate-900">Total Settled</span>
            <span className="text-xl font-black text-emerald-700 tabular-nums">
              {formatCurrency(order.grandTotal, settings.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Invoice Modal Preview */}
      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        order={order}
      />
    </div>
  );
}
