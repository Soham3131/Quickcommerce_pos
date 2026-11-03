'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpDown, Filter, ChevronRight, ShoppingBag } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ProductCard } from '@/components/storefront/ProductCard';
import { CATEGORY_SLUG_MAP } from '@/components/storefront/StorefrontHeader';
import { ProductCategory } from '@/types';

export default function CategoryProductsPage({ params }: { params: { slug: string } }) {
  const { products, settings } = useStore();
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  const categoryName = CATEGORY_SLUG_MAP[params.slug];
  if (!categoryName) {
    // If not matching map, fallback or notFound
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900">Department Not Found</h2>
        <p className="text-xs text-slate-500">The requested grocery category does not exist.</p>
        <Link
          href="/shop"
          className="inline-flex rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
        >
          Return to All Groceries
        </Link>
      </div>
    );
  }

  // Filter products by category (active published only)
  let categoryProducts = products.filter((p) => p.category === categoryName && p.status !== 'inactive');
  if (inStockOnly) {
    categoryProducts = categoryProducts.filter((p) => p.currentStock > 0);
  }

  if (sortBy === 'price-asc') {
    categoryProducts.sort((a, b) => a.sellingPrice - b.sellingPrice);
  } else if (sortBy === 'price-desc') {
    categoryProducts.sort((a, b) => b.sellingPrice - a.sellingPrice);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Breadcrumb & Navigation */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <Link href="/" className="hover:text-emerald-700 transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-emerald-700 transition">
            Shop
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-700">{categoryName}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {categoryName}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Fresh supermarket inventory · {categoryProducts.length} items available for 30-min delivery
            </p>
          </div>

          {/* Quick Sort & Stock Filter */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer rounded-xl bg-white border border-slate-200 px-3 py-2 shadow-2xs">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>In-Stock Only</span>
            </label>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-2xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured Picks</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {categoryProducts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <ShoppingBag className="h-12 w-12 mx-auto text-slate-300 stroke-[1.5]" />
          <h3 className="font-bold text-base text-slate-800">
            No items currently available in {categoryName}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Please check back shortly or explore other fresh departments.
          </p>
          <Link
            href="/shop"
            className="inline-block rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
          >
            Explore All Groceries
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {categoryProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
}
