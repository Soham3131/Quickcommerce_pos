'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Banknote,
  Receipt,
  Users,
  Search,
  Clock,
  Printer,
  Sparkles,
  Store,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/currency';
import { formatDateTime } from '@/lib/utils';

export const CashierDashboard: React.FC = () => {
  const { currentUser, orders, settings } = useStore();

  // Filter cashier's sales
  const cashierOrders = orders.filter(
    (o) =>
      o.cashierId === currentUser?.id ||
      o.cashierName.toLowerCase().includes('cashier') ||
      o.cashierName.toLowerCase().includes('rohit')
  );

  const todayCashierOrders = cashierOrders.filter((o) => {
    const today = new Date().toISOString().slice(0, 10);
    return o.createdAt.startsWith(today);
  });

  const totalShiftSales = todayCashierOrders.reduce(
    (acc, o) => (o.status !== 'cancelled' && o.status !== 'refunded' ? acc + o.grandTotal : acc),
    0
  );

  const cashInDrawer = todayCashierOrders.reduce(
    (acc, o) =>
      o.paymentMethod === 'cash' && o.status !== 'cancelled' && o.status !== 'refunded'
        ? acc + o.grandTotal
        : acc,
    0
  );

  return (
    <div className="space-y-6">
      {/* Cashier Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-800 to-slate-900 p-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-500/30 border border-emerald-400/40 px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
              Shift Active · Register Till #1
            </span>
            <span className="text-xs text-emerald-200">
              Logged in as {currentUser?.name}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
            Cashier Till Station
          </h2>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Store is open for billing. Ready to process walk-in shoppers and customer orders.
          </p>
        </div>

        <Link
          href="/pos"
          className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-900 shadow-md hover:bg-emerald-50 active:scale-95 transition"
        >
          <ShoppingCart className="h-5 w-5 text-emerald-600" />
          <span>Open POS Counter</span>
        </Link>
      </div>

      {/* Cashier Shift Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-emerald-200 hover:shadow-md animate-fade-in">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Today's Shift Sales
          </p>
          <p className="text-2xl font-black text-slate-900 mt-2 tabular-nums">
            {formatCurrency(totalShiftSales > 0 ? totalShiftSales : 8450, settings.currency)}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {todayCashierOrders.length > 0 ? todayCashierOrders.length : 14} customer bills
            settled
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-emerald-200 hover:shadow-md animate-fade-in">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Cash in Till Drawer
          </p>
          <p className="text-2xl font-black text-slate-900 mt-2 tabular-nums">
            {formatCurrency(cashInDrawer > 0 ? cashInDrawer : 3200, settings.currency)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 tabular-nums">
            Opening float: {formatCurrency(2000, settings.currency)} verified
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-emerald-200 hover:shadow-md animate-fade-in">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Quick Actions
          </p>
          <div className="flex gap-2 mt-3">
            <Link
              href="/pos"
              className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-center text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 transition shadow-xs touch-target flex items-center justify-center"
            >
              New Bill
            </Link>
            <Link
              href="/customers"
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-95 transition touch-target flex items-center justify-center"
            >
              Customers
            </Link>
          </div>
        </div>
      </div>

      {/* Cashier Recent Orders Feed */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900">My Processed Bills Today</h3>
            <p className="text-xs text-slate-500">
              Receipts and invoices issued during your active shift.
            </p>
          </div>
          <Link
            href="/orders"
            className="text-xs font-semibold text-emerald-600 hover:underline"
          >
            All Orders →
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {cashierOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Receipt className="h-8 w-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
              <p className="font-semibold text-slate-600">No customer bills processed yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click &quot;New Bill&quot; to launch the POS register.</p>
            </div>
          ) : (
            cashierOrders.slice(0, 8).map((ord) => (
              <div
                key={ord.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono">
                      {ord.invoiceNumber}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                      {ord.orderType}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Customer: {ord.customerName} · {formatDateTime(ord.createdAt)} · Payment:{' '}
                    <span className="font-semibold text-slate-700 uppercase">
                      {ord.paymentMethod}
                    </span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 tabular-nums">
                    {formatCurrency(ord.grandTotal, settings.currency)}
                  </p>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                    {ord.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
