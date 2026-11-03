'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Clock,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Share2,
  Tag,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/currency';
import { ProductCard } from '@/components/storefront/ProductCard';
import { REVERSE_CATEGORY_SLUG_MAP } from '@/components/storefront/StorefrontHeader';
import { formatDate } from '@/lib/utils';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const {
    products,
    settings,
    customerCart,
    addToCustomerCart,
    updateCustomerCartQuantity,
    toggleWishlist,
    isInWishlist,
  } = useStore();

  // Find product by id or slug
  const product = products.find(
    (p) =>
      p.id === params.slug ||
      p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === params.slug
  );

  const [qty, setQty] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested grocery item is unavailable or has been discontinued.
        </p>
        <Link
          href="/shop"
          className="inline-flex rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
        >
          Browse All Groceries
        </Link>
      </div>
    );
  }

  const cartItem = customerCart.find((ci) => ci.product.id === product.id);
  const inCart = !!cartItem;
  const currentCartQty = cartItem?.quantity || 0;
  const isWishlisted = isInWishlist(product.id);

  const discountPercent =
    product.mrp > product.sellingPrice
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0;

  const isOutOfStock = product.currentStock <= 0;
  const isLowStock = product.currentStock > 0 && product.currentStock <= product.minStock;
  const step = product.isWeighed ? 0.25 : 1;

  // Related products from the same department
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const categorySlug = REVERSE_CATEGORY_SLUG_MAP[product.category] || 'fruits-vegetables';

  const handleAddToCart = () => {
    addToCustomerCart(product, qty);
  };

  const handleBuyNow = () => {
    if (!inCart) {
      addToCustomerCart(product, qty);
    }
    router.push('/checkout');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-emerald-700 transition">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-emerald-700 transition">
          Shop
        </Link>
        <span>/</span>
        <Link
          href={`/shop/category/${categorySlug}`}
          className="hover:text-emerald-700 transition"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-700 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Media Container */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-square w-full rounded-2xl bg-slate-50 border border-slate-100 p-6 flex items-center justify-center overflow-hidden">
              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 z-10 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-black text-white shadow-xs">
                  {discountPercent}% OFF
                </span>
              )}

              <img
                src={product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
              />

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border transition ${
                  isWishlisted
                    ? 'border-rose-200 bg-rose-50 text-rose-600 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-400 hover:text-rose-600'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
              </button>
            </div>

            {/* Quick Share */}
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>{copiedLink ? 'Link copied!' : 'Share Grocery Item'}</span>
              </button>
            </div>
          </div>

          {/* Right Product Details & Buy Box */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Brand */}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                  {product.category}
                </span>
                <span className="text-xs font-mono text-slate-400">SKU: {product.sku}</span>
              </div>

              {/* Product Title & Brand */}
              <div>
                <p className="text-xs font-bold text-emerald-700 tracking-wide uppercase">
                  {product.brand}
                </p>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                  {product.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price Row */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-baseline justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                      {formatCurrency(product.sellingPrice, settings.currency)}
                    </span>
                    {product.mrp > product.sellingPrice && (
                      <span className="text-sm font-semibold text-slate-400 line-through tabular-nums">
                        {formatCurrency(product.mrp, settings.currency)}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-500">/ {product.unit}</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                    {settings.tax.isInclusive
                      ? `Includes ${product.taxRate}% ${settings.tax.name}`
                      : `Plus ${product.taxRate}% ${settings.tax.name} at checkout`}
                  </p>
                </div>

                {/* Stock Badge */}
                <div>
                  {isOutOfStock ? (
                    <span className="rounded-full bg-rose-100 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-700">
                      Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <span className="rounded-full bg-amber-100 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
                      Only {product.currentStock} {product.unit} left!
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>In Stock ({product.currentStock} {product.unit} available)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Weighted produce chips helper */}
              {product.isWeighed && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700">
                    Quick Weight Increments ({product.unit}):
                  </span>
                  <div className="flex items-center gap-2">
                    {[0.25, 0.5, 1.0, 2.0].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setQty(w)}
                        className={`rounded-xl border px-3 py-1 text-xs font-bold transition ${
                          qty === w
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-black'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        +{w} {product.unit}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Stepper & Cart Actions */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Stepper */}
                {!inCart ? (
                  <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => setQty(Math.max(step, qty - step))}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 hover:bg-slate-100 shadow-2xs font-bold"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 text-xs font-black text-slate-900 font-mono tabular-nums">
                      {qty} {product.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(Math.min(product.currentStock, qty + step))}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 hover:bg-slate-100 shadow-2xs font-bold"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center rounded-2xl border border-emerald-300 bg-emerald-50 p-1">
                    <button
                      type="button"
                      onClick={() =>
                        updateCustomerCartQuantity(
                          product.id,
                          Math.max(0, currentCartQty - step)
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-800 hover:bg-emerald-100 shadow-2xs font-bold"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 text-xs font-black text-emerald-950 font-mono tabular-nums">
                      {currentCartQty} {product.unit} in Cart
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateCustomerCartQuantity(
                          product.id,
                          Math.min(product.currentStock, currentCartQty + step)
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs font-bold"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Primary Add to Cart Button */}
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-700/20 transition active:scale-98 disabled:opacity-40"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{inCart ? 'Add More to Cart' : 'Add to Cart'}</span>
                </button>

                {/* Buy Now Direct */}
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className="w-full sm:w-auto rounded-2xl bg-slate-900 hover:bg-slate-800 text-white py-3 px-6 text-xs sm:text-sm font-bold shadow-md transition active:scale-98 disabled:opacity-40"
                >
                  Buy Now →
                </button>
              </div>

              {/* Delivery Assurance Strip */}
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-3.5 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Truck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>30–45 Mins Express Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>100% Quality Assurance</span>
                </div>
              </div>
            </div>

            {/* Specifications Details Table */}
            <div className="pt-4 border-t border-slate-100 text-xs">
              <h4 className="font-bold text-slate-900 mb-2">Product Specifications</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                  <span className="text-[10px] text-slate-400 font-semibold">Department</span>
                  <p className="font-bold text-slate-800">{product.category}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                  <span className="text-[10px] text-slate-400 font-semibold">Packaging Unit</span>
                  <p className="font-bold text-slate-800">{product.unit}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                  <span className="text-[10px] text-slate-400 font-semibold">GST Rate</span>
                  <p className="font-bold text-slate-800">{product.taxRate}%</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                  <span className="text-[10px] text-slate-400 font-semibold">Expiry Date</span>
                  <p className="font-bold text-slate-800">{formatDate(product.expiryDate)}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                  <span className="text-[10px] text-slate-400 font-semibold">Barcode</span>
                  <p className="font-bold text-slate-800 font-mono">{product.barcode}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                  <span className="text-[10px] text-slate-400 font-semibold">Farm/Distributor</span>
                  <p className="font-bold text-slate-800 truncate">{product.supplierName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products from Same Category */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              More from {product.category}
            </h2>
            <Link
              href={`/shop/category/${categorySlug}`}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              View Department →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
