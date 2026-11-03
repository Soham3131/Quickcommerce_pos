'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Store,
  Phone,
  AlertTriangle,
  RotateCcw,
  Printer,
  ShoppingBag,
  ArrowLeft,
  User,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/currency';
import { formatDateTime } from '@/lib/utils';
import { InvoiceModal } from '@/components/billing/InvoiceModal';

export default function TrackOrderDetailPage({ params }: { params: { id: string } }) {
  const { orders, settings } = useStore();
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const order = orders.find((o) => o.id === params.id || o.invoiceNumber === params.id);

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested order does not exist or has been removed from store records.
        </p>
        <Link
          href="/track-order"
          className="inline-flex rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
        >
          Back to Tracking Search
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === 'cancelled' || order.status === 'refunded';
  const isTakeaway = order.orderType === 'takeaway';

  // Stages array
  const STAGES = isTakeaway
    ? [
        { id: 'pending', label: 'Order Placed', desc: 'Received by store system' },
        { id: 'confirmed', label: 'Order Confirmed', desc: 'Verified by billing team' },
        { id: 'preparing', label: 'Packing Items', desc: 'Items being boxed at till' },
        { id: 'ready', label: 'Ready for Pickup', desc: 'Awaiting customer collection' },
        { id: 'completed', label: 'Order Completed', desc: 'Picked up from counter' },
      ]
    : [
        { id: 'pending', label: 'Order Placed', desc: 'Received by store system' },
        { id: 'confirmed', label: 'Order Confirmed', desc: 'Accepted by supermarket' },
        { id: 'preparing', label: 'Packing Items', desc: 'Groceries handpicked fresh' },
        { id: 'out_for_delivery', label: 'Out for Delivery', desc: 'Courier en route to address' },
        { id: 'delivered', label: 'Delivered', desc: 'Safely handed over to you' },
      ];

  // Map order status to stage index
  const getStageIndex = (status: string) => {
    if (status === 'pending') return 0;
    if (status === 'confirmed') return 1;
    if (status === 'preparing') return 2;
    if (status === 'out_for_delivery' || status === 'ready') return 3;
    if (status === 'delivered' || status === 'completed') return 4;
    return 0;
  };

  const currentStageIndex = getStageIndex(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back button & Title */}
      <div>
        <Link
          href="/track-order"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Order Tracking</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Order Tracking
              </h1>
              <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl">
                {order.invoiceNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live fulfillment status for {order.customerName} · Placed {formatDateTime(order.createdAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setInvoiceModalOpen(true)}
            className="self-start sm:self-auto flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            <span>Print Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* Cancellation Banner if cancelled */}
      {isCancelled && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-6 text-xs space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-black text-sm">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            <span>Order Cancelled &amp; Inventory Restored</span>
          </div>
          <p className="text-rose-700 leading-relaxed">
            This order was cancelled by the store administrator. All product stock deductions were
            reversed back into the active inventory automatically.
          </p>
          <p className="text-[11px] text-rose-600 font-mono">Status: {order.status.toUpperCase()}</p>
        </div>
      )}

      {/* Active Stage Progress Timeline */}
      {!isCancelled && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Current Fulfillment State
              </span>
              <p className="text-base sm:text-lg font-black text-emerald-800 capitalize">
                {STAGES[currentStageIndex]?.label || order.status.replace('_', ' ')}
              </p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Live Updates</span>
            </span>
          </div>

          {/* Stepper Bar */}
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-5 left-4 right-4 h-1 bg-slate-100 -z-0 hidden sm:block">
              <div
                className="h-full bg-emerald-600 transition-all duration-500"
                style={{
                  width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%`,
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
              {STAGES.map((stage, idx) => {
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div
                    key={stage.id}
                    className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-black text-xs transition shadow-2xs ${
                        isPassed
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                    </div>

                    <div className="space-y-0.5">
                      <p
                        className={`font-bold text-xs ${
                          isCurrent
                            ? 'text-emerald-800'
                            : isPassed
                            ? 'text-slate-900'
                            : 'text-slate-400'
                        }`}
                      >
                        {stage.label}
                      </p>
                      <p className="text-[10px] text-slate-400 hidden sm:block leading-tight">
                        {stage.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Courier Assignment Card (If Admin assigned a delivery partner) */}
      {order.deliveryPerson && (
        <div className="rounded-3xl border border-blue-200 bg-blue-50/40 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-700/20">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Assigned Delivery Partner
              </span>
              <h3 className="text-sm font-black text-slate-900">{order.deliveryPerson.name}</h3>
              <p className="text-xs text-slate-600 font-mono mt-0.5">
                Phone: {order.deliveryPerson.phone}
              </p>
            </div>
          </div>

          <a
            href={`tel:${order.deliveryPerson.phone}`}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-xs transition"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Call Courier</span>
          </a>
        </div>
      )}

      {/* Order Info & Items Breakdown */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="font-black text-sm text-slate-900">Order Particulars</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold">Delivery Address</span>
            <p className="font-bold text-slate-800">{order.customerAddress || 'Store Address'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold">Payment Tendered</span>
            <p className="font-bold text-slate-800 capitalize">
              {order.paymentMethod} · {order.paymentStatus.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Items table */}
        <div className="divide-y divide-slate-100 border-t border-slate-100 pt-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900">{item.productName}</p>
                <p className="text-[10px] text-slate-400">
                  {item.quantity} {item.unit} × {formatCurrency(item.unitPrice, settings.currency)}
                </p>
              </div>
              <span className="font-bold text-slate-900 tabular-nums">
                {formatCurrency(item.total, settings.currency)}
              </span>
            </div>
          ))}
        </div>

        {/* Grand Total */}
        <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-xs">
          <span className="font-black text-slate-900">Total Billed</span>
          <span className="text-lg font-black text-emerald-700 tabular-nums">
            {formatCurrency(order.grandTotal, settings.currency)}
          </span>
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
