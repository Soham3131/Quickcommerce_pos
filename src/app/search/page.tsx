'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, ArrowUpDown, ShoppingBag } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ProductCard } from '@/components/storefront/ProductCard';

// Inner component that reads searchParams — must be inside <Suspense>
function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { products } = useStore();

  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  const matchingProducts = products
    .filter((p) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.sellingPrice - b.sellingPrice;
      if (sortBy === 'price-desc') return b.sellingPrice - a.sellingPrice;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <Link href="/" className="hover:text-emerald-700 transition">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-700">Search Results</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Search Results for &quot;{query}&quot;
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Found {matchingProducts.length} grocery items matching your query
            </p>
          </div>

          {matchingProducts.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-2xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="featured">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Grid or Empty */}
      {matchingProducts.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Search className="h-7 w-7" />
          </div>
          <h2 className="font-bold text-base text-slate-800">
            No grocery items matched &quot;{query}&quot;
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try checking for typos or searching for a broader term like &quot;milk&quot;, &quot;vegetables&quot;, or &quot;bread&quot;.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              Browse All Groceries
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {matchingProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
}

// Suspense fallback shown during static prerendering
function SearchFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-64 rounded-xl bg-slate-100 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-100 bg-white p-3 space-y-2 animate-pulse">
            <div className="h-36 rounded-xl bg-slate-100" />
            <div className="h-3 w-3/4 rounded bg-slate-100" />
            <div className="h-3 w-1/2 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Default export wraps inner component in Suspense (required by Next.js for useSearchParams)
export default function SearchResultsPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchResults />
    </Suspense>
  );
}
