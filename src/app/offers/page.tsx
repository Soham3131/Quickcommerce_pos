'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Tag, Sparkles, Copy, Check, ArrowRight, Percent } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ProductCard } from '@/components/storefront/ProductCard';
import { formatCurrency } from '@/lib/currency';
import { getStoreCoupons } from '@/lib/coupons/couponService';

export default function OffersDealsPage() {
  const { products, settings } = useStore();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const coupons = getStoreCoupons(settings);

  const discountedProducts = products
    .filter((p) => p.mrp > p.sellingPrice)
    .sort((a, b) => (b.mrp - b.sellingPrice) / b.mrp - (a.mrp - a.sellingPrice) / a.mrp);

  const handleCopy = (code: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950 via-emerald-950 to-teal-950 p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Supermarket Savings Hub</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Today&apos;s Deals &amp; Promo Coupons
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Save extra on your daily grocery basket. Apply promo coupons during checkout or shop
            discounted farm produce and pantry staples.
          </p>
        </div>
      </div>

      {/* Active Coupon Codes Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Tag className="h-4 w-4 text-emerald-600" />
          <span>Active Promo Coupons</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.code}
              className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 p-5 shadow-2xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-black text-emerald-900 tracking-wider">
                    {coupon.code}
                  </span>
                  <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-black">
                    {coupon.code === 'FREESHIP' ? 'FREE DELIVERY' : `${coupon.discountPercent}% OFF`}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-snug">{coupon.description}</p>
                <p className="text-[10px] font-semibold text-slate-400">
                  Minimum Order: {formatCurrency(coupon.minOrder, settings.currency)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(coupon.code)}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 py-2 text-xs font-bold hover:bg-emerald-600 hover:text-white transition shadow-2xs"
              >
                {copiedCode === coupon.code ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Discounted Products Grid */}
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Discounted Supermarket Items ({discountedProducts.length})
            </h2>
            <p className="text-xs text-slate-500">
              Fresh items on price-drop today, handpicked for maximum value.
            </p>
          </div>
          <Link href="/shop" className="text-xs font-bold text-emerald-700 hover:underline">
            View All Groceries →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {discountedProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>
    </div>
  );
}
