'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  MapPin,
  Heart,
  User,
  FileText,
  LogOut,
  Repeat,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export const AccountNav: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useStore();

  const NAV_ITEMS = [
    { label: 'Overview', href: '/account', icon: LayoutDashboard },
    { label: 'My Orders', href: '/account/orders', icon: Package },
    { label: 'Saved Addresses', href: '/account/addresses', icon: MapPin },
    { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
    { label: 'My Invoices', href: '/account/invoices', icon: FileText },
    { label: 'Profile Details', href: '/account/profile', icon: User },
  ];

  return (
    <aside className="space-y-4">
      {/* User Mini Profile Header */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-3">
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-12 w-12 rounded-2xl object-cover border border-slate-200"
            />
          ) : (
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <User className="h-6 w-6" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-slate-900 truncate">
              {currentUser?.name || 'Customer Shopper'}
            </h3>
            <p className="text-[11px] text-slate-400 truncate">
              {currentUser?.email || 'customer@avanigrocers.com'}
            </p>
            <span className="inline-block mt-0.5 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.2 text-[9px] font-black uppercase">
              {currentUser?.role || 'Guest Customer'}
            </span>
          </div>
        </div>

        {/* Loyalty Points Pill */}
        <div className="rounded-xl bg-gradient-to-r from-amber-50 to-emerald-50 p-2.5 border border-amber-200/80 flex items-center justify-between text-xs">
          <div>
            <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">
              Avani Rewards Points
            </p>
            <p className="font-black text-amber-950 text-base">340 Points</p>
          </div>
          <span className="rounded-full bg-amber-400 text-slate-950 px-2 py-0.5 text-[10px] font-black">
            Silver Tier
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-2 shadow-2xs space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push('/login');
            }}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-emerald-600/30 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 px-3.5 py-2 text-xs font-bold transition active:scale-95 shadow-2xs"
            title="Switch authenticated account or role"
          >
            <Repeat className="h-4 w-4 shrink-0 text-emerald-700" />
            <span>Switch Account</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push('/');
            }}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3.5 py-2 text-xs font-bold transition active:scale-95 shadow-2xs"
            title="Sign out of current account"
          >
            <LogOut className="h-4 w-4 shrink-0 text-rose-600" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
