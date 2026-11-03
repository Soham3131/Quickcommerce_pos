'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Truck, Package, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/currency';
import { formatDateTime } from '@/lib/utils';

export default function TrackOrderSearchPage() {
  const router = useRouter();
  const { orders, currentUser, settings } = useStore();
  const [searchInput, setSearchInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // If user is logged in, show their recent orders for quick tracking
  const myOrders = currentUser
    ? orders.filter(
        (o) =>
          o.customerId === currentUser.id ||
          (currentUser.email && o.customerName.toLowerCase().includes(currentUser.name.toLowerCase()))
      )
    : orders.slice(0, 3); // show latest demo orders for guest demonstration

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const q = searchInput.trim();
    if (!q) return;

    const found = orders.find(
      (o) =>
        o.id.toLowerCase() === q.toLowerCase() ||
        o.invoiceNumber.toLowerCase() === q.toLowerCase()
    );

    if (found) {
      router.push(`/track-order/${found.id}`);
    } else {
      setErrorMessage(
        `No order found matching "${q}". Please check your invoice number (e.g. ${orders[0]?.invoiceNumber || 'AVN-INV-1045'}).`
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-xs">
          <Truck className="h-7 w-7" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Live Grocery Order Tracking
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Enter your Invoice Number or Order ID to monitor packaging, courier dispatch, and doorstep
          delivery.
        </p>
      </div>

      {/* Tracking Input Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs max-w-xl mx-auto space-y-4">
        <form onSubmit={handleTrackSubmit} className="space-y-3">
          <label className="text-xs font-bold text-slate-700">Invoice Number or Order ID</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="e.g. AVN-INV-1045 or ord-xxx"
                className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-xs font-mono uppercase placeholder:normal-case placeholder:font-sans focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-extrabold shadow-md shadow-emerald-700/20 transition active:scale-95 shrink-0"
            >
              Track Order
            </button>
          </div>

          {errorMessage && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              {errorMessage}
            </p>
          )}
        </form>

        <p className="text-[11px] text-slate-400 text-center">
          Invoice number was sent via SMS and is visible on your order confirmation receipt.
        </p>
      </div>

      {/* Quick Orders to Track */}
      {myOrders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-center">
            Or Click a Recent Order Below to Track
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {myOrders.map((ord) => (
              <Link
                key={ord.id}
                href={`/track-order/${ord.id}`}
                className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-emerald-500 hover:shadow-md transition text-xs space-y-2"
              >
                <div className="flex justify-between items-start">
                  <span className="font-mono font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    {ord.invoiceNumber}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 capitalize">
                    {ord.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{ord.customerName}</p>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
                  <span className="font-extrabold text-slate-900 tabular-nums">
                    {formatCurrency(ord.grandTotal, settings.currency)}
                  </span>
                  <span className="text-emerald-700 font-bold group-hover:underline">Track →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
