'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  MapPin,
  Heart,
  FileText,
  Clock,
  ArrowRight,
  Truck,
  Sparkles,
  ShoppingBag,
  Repeat,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { AccountNav } from '@/components/account/AccountNav';
import { formatCurrency } from '@/lib/currency';
import { formatDateTime } from '@/lib/utils';

export default function AccountOverviewPage() {
  const router = useRouter();
  const { currentUser, orders, wishlist, customerAddresses, settings, logout } = useStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSwitchAccount = async () => {
    await logout();
    router.push('/login');
  };

  const handleLogout = async () => {
    await logout();
    setToastMessage('Successfully logged out. Redirecting to storefront...');
    setTimeout(() => {
      router.push('/');
    }, 800);
  };

  // Filter orders matching customer
  const customerOrders = orders.filter(
    (o) =>
      o.customerId === currentUser?.id ||
      (currentUser?.name && o.customerName.toLowerCase().includes(currentUser.name.toLowerCase()))
  );

  const activeOrders = customerOrders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'completed' && o.status !== 'cancelled'
  );

  const recentOrders = customerOrders.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-emerald-800 text-xs font-bold animate-in fade-in shadow-xs">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Shopper Account Header with Prominent Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Shopper Account
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage delivery drop-off addresses, order history, and GST tax bills.
          </p>
        </div>

        {/* Action Buttons: Switch Account & Log Out */}
        <div className="flex flex-wrap items-center gap-2.5 sm:shrink-0">
          <button
            type="button"
            onClick={handleSwitchAccount}
            id="account-switch-btn"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 px-4 py-2.5 text-xs font-extrabold shadow-2xs transition active:scale-95"
            title="Switch authenticated account or role"
          >
            <Repeat className="h-4 w-4 text-emerald-700" />
            <span>Switch Account</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            id="account-logout-btn"
            className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2.5 text-xs font-extrabold shadow-2xs transition active:scale-95"
            title="Sign out of current account"
          >
            <LogOut className="h-4 w-4 text-rose-600" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Account Navigation */}
        <div className="lg:col-span-1">
          <AccountNav />
        </div>

        {/* Right: Dashboard Overview Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Welcome Card */}
          <div className="rounded-3xl bg-gradient-to-r from-emerald-900 to-teal-900 p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                Shopper Dashboard
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Welcome back, {currentUser?.name || 'Priya'}!
              </h1>
              <p className="text-xs text-emerald-100">
                Manage your fresh grocery deliveries, saved addresses, and itemized GST bills.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 text-xs font-black shadow-md transition self-start sm:self-auto shrink-0"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Shop Groceries</span>
            </Link>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Orders</p>
              <p className="text-2xl font-black text-slate-900 tabular-nums">
                {customerOrders.length}
              </p>
              <Link href="/account/orders" className="text-[11px] font-bold text-emerald-700 hover:underline">
                View history →
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Active In-Transit</p>
              <p className="text-2xl font-black text-blue-600 tabular-nums">{activeOrders.length}</p>
              <Link href="/track-order" className="text-[11px] font-bold text-blue-700 hover:underline">
                Track status →
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Saved Addresses</p>
              <p className="text-2xl font-black text-slate-900 tabular-nums">
                {customerAddresses.length}
              </p>
              <Link
                href="/account/addresses"
                className="text-[11px] font-bold text-emerald-700 hover:underline"
              >
                Manage list →
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Wishlist Items</p>
              <p className="text-2xl font-black text-rose-600 tabular-nums">{wishlist.length}</p>
              <Link
                href="/account/wishlist"
                className="text-[11px] font-bold text-rose-700 hover:underline"
              >
                View saved →
              </Link>
            </div>
          </div>

          {/* Recent Orders Snippet */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" />
                <span>Recent Grocery Orders</span>
              </h2>
              <Link
                href="/account/orders"
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                See All Orders →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No orders placed yet. Start adding fresh groceries to your basket!
              </p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          {ord.invoiceNumber}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                            ord.status === 'delivered' || ord.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'cancelled' || ord.status === 'refunded'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {ord.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatDateTime(ord.createdAt)} · {ord.items.length} items
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="font-extrabold text-slate-900 tabular-nums">
                        {formatCurrency(ord.grandTotal, settings.currency)}
                      </span>
                      <Link
                        href={`/track-order/${ord.id}`}
                        className="rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition shadow-2xs"
                      >
                        Track Status →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
