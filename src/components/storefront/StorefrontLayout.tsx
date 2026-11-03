'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { StorefrontHeader } from './StorefrontHeader';
import { StorefrontFooter } from './StorefrontFooter';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/currency';

export const StorefrontLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, customerCartCount, customerCartSubtotal } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 antialiased selection:bg-emerald-500 selection:text-white pb-16 md:pb-0">
      <StorefrontHeader />
      <main className="flex-1">{children}</main>
      <StorefrontFooter />

      {/* Sticky Mobile Cart Bar */}
      {customerCartCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 shadow-2xl animate-slide-up">
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            <div className="flex items-center gap-2.5 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] text-emerald-300 font-semibold leading-tight">
                  {customerCartCount} {customerCartCount === 1 ? 'item' : 'items'} in Cart
                </p>
                <p className="text-sm font-black text-white tabular-nums leading-tight">
                  {formatCurrency(customerCartSubtotal, settings.currency)}
                </p>
              </div>
            </div>

            <Link
              href="/cart"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-2 text-xs font-bold shadow-md transition active:scale-95"
            >
              <span>View Cart</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
