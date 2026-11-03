'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Plus, Minus, Star } from 'lucide-react';
import { Product } from '@/types';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/currency';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const {
    settings,
    customerCart,
    addToCustomerCart,
    updateCustomerCartQuantity,
    toggleWishlist,
    isInWishlist,
  } = useStore();

  const cartItem = customerCart.find((item) => item.product.id === product.id);
  const inCart = !!cartItem;
  const currentQuantity = cartItem?.quantity || 0;
  const isWishlisted = isInWishlist(product.id);

  const discountPercent =
    product.mrp > product.sellingPrice
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0;

  const isOutOfStock = product.currentStock <= 0;
  const isLowStock = product.currentStock > 0 && product.currentStock <= product.minStock;

  const step = product.isWeighed ? 0.25 : 1;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCustomerCart(product, step);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextQty = Math.min(product.currentStock, currentQuantity + step);
    updateCustomerCartQuantity(product.id, nextQty);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextQty = Math.max(0, currentQuantity - step);
    updateCustomerCartQuantity(product.id, nextQty);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const displayRating = product.rating ? Number(product.rating).toFixed(1) : '4.8';

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-2.5 sm:p-3 shadow-2xs hover:shadow-md hover:border-emerald-400 transition-all duration-200 h-full">
      {/* Top Media Container */}
      <div className="relative">
        {/* Discount & Weighed Badges */}
        <div className="absolute top-1 left-1 z-10 flex flex-col gap-1 items-start pointer-events-none">
          {discountPercent > 0 && (
            <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black text-white shadow-2xs">
              {discountPercent}% OFF
            </span>
          )}
          {product.isWeighed && (
            <span className="rounded-md bg-amber-400 px-1.5 py-0.2 text-[8px] sm:text-[9px] font-black text-slate-950 uppercase">
              By Wt
            </span>
          )}
        </div>

        {/* Wishlist Heart */}
        <button
          type="button"
          onClick={handleWishlist}
          className={`absolute top-1 right-1 z-10 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border transition ${
            isWishlisted
              ? 'border-rose-200 bg-rose-50 text-rose-600 shadow-2xs'
              : 'border-slate-200/80 bg-white/90 text-slate-400 hover:text-rose-600 hover:bg-white'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
        >
          <Heart className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Product Image Link with strict aspect ratio */}
        <Link
          href={`/product/${product.id}`}
          className="block aspect-4/3 w-full overflow-hidden rounded-xl bg-slate-50 p-2 relative"
        >
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Product Details & Compact Spacing */}
      <div className="mt-2 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Unit row */}
          <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-0.5">
            <span className="truncate max-w-[120px]">{product.category}</span>
            <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-bold text-slate-600 normal-case">
              {product.unit}
            </span>
          </div>

          {/* 2-line fixed height Title */}
          <Link href={`/product/${product.id}`} className="block group-hover:text-emerald-700">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2 h-8 overflow-hidden">
              {product.name}
            </h3>
          </Link>

          {/* Rating & Stock Indicator */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] mt-1">
            <div className="flex items-center gap-1 text-amber-600 font-bold">
              <Star className="h-3 w-3 fill-amber-400 text-amber-500 shrink-0" />
              <span>{displayRating}</span>
              {product.reviewCount ? (
                <span className="text-[10px] font-normal text-slate-400">({product.reviewCount})</span>
              ) : null}
            </div>

            {isOutOfStock ? (
              <span className="text-[10px] font-bold text-rose-600">Out of Stock</span>
            ) : isLowStock ? (
              <span className="text-[10px] font-bold text-amber-600">Only {product.currentStock} left</span>
            ) : (
              <span className="text-[10px] font-semibold text-emerald-700">In Stock</span>
            )}
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-baseline justify-between gap-1 mb-2">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-black text-slate-900 tabular-nums">
                {formatCurrency(product.sellingPrice, settings.currency)}
              </span>
              {product.mrp > product.sellingPrice && (
                <span className="text-[10px] sm:text-[11px] text-slate-400 line-through tabular-nums">
                  {formatCurrency(product.mrp, settings.currency)}
                </span>
              )}
            </div>
          </div>

          {/* Add / Stepper Button */}
          {isOutOfStock ? (
            <button
              disabled
              className="w-full rounded-xl bg-slate-100 py-1.5 text-xs font-semibold text-slate-400 cursor-not-allowed text-center"
            >
              Unavailable
            </button>
          ) : inCart ? (
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-300 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={handleDecrement}
                className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-white text-emerald-800 hover:bg-emerald-100 shadow-2xs font-bold transition active:scale-95"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-xs font-black text-emerald-900 tabular-nums font-mono px-1.5">
                {currentQuantity} {product.unit}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={currentQuantity >= product.currentStock}
                className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs font-bold transition active:scale-95 disabled:opacity-40"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="w-full flex items-center justify-center gap-1 rounded-xl border border-emerald-600 bg-emerald-50/50 hover:bg-emerald-600 hover:text-white py-1.5 text-xs font-bold text-emerald-800 transition active:scale-98 shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
