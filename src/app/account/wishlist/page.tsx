'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { AccountNav } from '@/components/account/AccountNav';
import { ProductCard } from '@/components/storefront/ProductCard';

export default function CustomerWishlistPage() {
  const { wishlist, products, toggleWishlist, addToCustomerCart } = useStore();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Navigation */}
        <div className="lg:col-span-1">
          <AccountNav />
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Saved Wishlist</h1>
                <span className="rounded-full bg-rose-50 text-rose-600 px-2.5 py-0.5 text-xs font-black">
                  {wishlistedProducts.length} items
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Your favorite groceries saved for quick recurring weekly or monthly replenishment.
              </p>
            </div>

            {wishlistedProducts.length > 0 && (
              <button
                onClick={() => {
                  wishlistedProducts.forEach((p) => {
                    if (p.currentStock > 0) {
                      addToCustomerCart(p, 1);
                    }
                  });
                  alert('All available wishlist items added to your cart!');
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-black shadow-sm transition shrink-0"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add All to Cart</span>
              </button>
            )}
          </div>

          {wishlistedProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center bg-white space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900">Your wishlist is empty</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tap the heart icon on any grocery item to save it for easy re-ordering.
              </p>
              <Link
                href="/shop"
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
              >
                <span>Browse Grocery Aisles</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-4">
              {wishlistedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
