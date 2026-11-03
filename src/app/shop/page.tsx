'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  Search,
  Grid,
  List,
  ChevronDown,
  X,
  Filter,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ProductCategory, Product } from '@/types';
import { REVERSE_CATEGORY_SLUG_MAP } from '@/components/storefront/StorefrontHeader';
import { formatCurrency } from '@/lib/currency';

export default function ShopAllProductsPage() {
  const { products, settings } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>(
    'featured'
  );
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Unique categories and brands
  const allCategories: ProductCategory[] = [
    'Fruits & Vegetables',
    'Dairy & Eggs',
    'Bakery & Bread',
    'Grocery & Staples',
    'Beverages',
    'Snacks & Sweets',
    'Personal Care',
    'Household & Cleaning',
    'Frozen Foods',
  ];

  const allBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet);
  }, [products]);

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Exclude inactive / unpublished products from storefront display
        if (p.status === 'inactive') return false;

        // Category filter
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }
        // Brand filter
        if (selectedBrand !== 'all' && p.brand !== selectedBrand) {
          return false;
        }
        // In Stock filter
        if (inStockOnly && p.currentStock <= 0) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          if (!matchName && !matchCategory && !matchBrand) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.sellingPrice - b.sellingPrice;
        if (sortBy === 'price-desc') return b.sellingPrice - a.sellingPrice;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0; // featured/default
      });
  }, [products, selectedCategory, selectedBrand, inStockOnly, searchQuery, sortBy]);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setInStockOnly(false);
    setSearchQuery('');
    setSortBy('featured');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedBrand !== 'all' ||
    inStockOnly ||
    searchQuery.trim().length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Breadcrumb & Title */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <Link href="/" className="hover:text-emerald-700 transition">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-700">Shop All Groceries</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              All Grocery Essentials
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Showing {filteredProducts.length} of {products.length} products available for delivery
            </p>
          </div>

          {/* Quick Actions (Mobile Filter Toggle + Sort) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-2xs"
            >
              <Filter className="h-4 w-4 text-emerald-600" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="flex h-2 w-2 rounded-full bg-emerald-600" />
              )}
            </button>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-2xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured Picks</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Product Name (A–Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ========================================================
            DESKTOP FILTERS SIDEBAR
            ======================================================== */}
        <aside className="hidden lg:block space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                <span>Filter Catalog</span>
              </h3>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* In Stock Only Switch */}
            <label className="flex items-center justify-between cursor-pointer rounded-xl bg-slate-50 p-3 border border-slate-200/80">
              <span className="text-xs font-bold text-slate-800">In-Stock Only</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            {/* Department Categories */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Departments
              </p>
              <div className="space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 transition ${
                    selectedCategory === 'all'
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[10px] text-slate-400">{products.length}</span>
                </button>

                {allCategories.map((cat) => {
                  const count = products.filter((p) => p.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 transition ${
                        selectedCategory === cat
                          ? 'bg-emerald-50 text-emerald-900 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="truncate max-w-[160px] text-left">{cat}</span>
                      <span className="text-[10px] text-slate-400">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brands */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Brands
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1 text-xs pr-1">
                <button
                  type="button"
                  onClick={() => setSelectedBrand('all')}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 transition ${
                    selectedBrand === 'all'
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>All Brands</span>
                </button>
                {allBrands.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => setSelectedBrand(brand)}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 transition ${
                      selectedBrand === brand
                        ? 'bg-emerald-50 text-emerald-900 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="truncate max-w-[170px] text-left">{brand}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ========================================================
            PRODUCTS LISTING GRID
            ======================================================== */}
        <main className="lg:col-span-3 space-y-4">
          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Active Filters:</span>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  <span>{selectedCategory}</span>
                  <X
                    className="h-3.5 w-3.5 cursor-pointer"
                    onClick={() => setSelectedCategory('all')}
                  />
                </span>
              )}
              {selectedBrand !== 'all' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                  <span>Brand: {selectedBrand}</span>
                  <X
                    className="h-3.5 w-3.5 cursor-pointer"
                    onClick={() => setSelectedBrand('all')}
                  />
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800">
                  <span>In Stock Only</span>
                  <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => setInStockOnly(false)} />
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                  <span>Query: &quot;{searchQuery}&quot;</span>
                  <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => setSearchQuery('')} />
                </span>
              )}
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-bold text-rose-600 hover:underline ml-2"
              >
                Reset All
              </button>
            </div>
          )}

          {/* Grid */}
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Search className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-base text-slate-800">No matching groceries found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try loosening your filters or search keywords to find products in our fresh catalog.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ========================================================
          MOBILE FILTERS BOTTOM SHEET / DRAWER
          ======================================================== */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end lg:hidden animate-fade-in">
          <div className="bg-white rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Filter className="h-4 w-4 text-emerald-600" />
                <span>Filters &amp; Sorting</span>
              </h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* In stock */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-800">In-Stock Products Only</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-4 w-4 rounded text-emerald-600"
              />
            </label>

            {/* Category */}
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-400 mb-2">Category</p>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium"
              >
                <option value="all">All Categories ({products.length})</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-400 mb-2">Brand</p>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-medium"
              >
                <option value="all">All Brands</option>
                {allBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Apply & Close */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-700"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
