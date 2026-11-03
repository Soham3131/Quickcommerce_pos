'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  Truck,
  Leaf,
  CheckCircle2,
  ChevronRight,
  ShoppingBag,
  Tag,
  Star,
  Award,
  PackageCheck,
  Receipt,
  HeartHandshake,
  Check,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ProductCategory } from '@/types';
import { formatCurrency } from '@/lib/currency';

import desktopHero from '@/data/laptop.png';
import mobileHero from '@/data/phone (2).png';

interface CategoryItem {
  name: string;
  slug: string;
  image: string;
  badge?: string;
  description: string;
}

const STORE_CATEGORIES: CategoryItem[] = [
  {
    name: 'Fruits & Vegetables',
    slug: 'fruits-vegetables',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
    description: 'Farm fresh harvest, leafy greens & organic fruits',
  },
  {
    name: 'Dairy & Eggs',
    slug: 'dairy-eggs',
    image: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80',
    description: 'Fresh cow milk, artisan paneer, butter & farm eggs',
  },
  {
    name: 'Atta, Rice & Dals',
    slug: 'grocery-staples',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    description: 'Aged basmati, stone-ground chakki atta & organic pulses',
  },
  {
    name: 'Grocery & Staples',
    slug: 'grocery-staples',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80',
    description: 'Cold-pressed oils, pure desi ghee & aromatic spices',
  },
  {
    name: 'Bakery & Bread',
    slug: 'bakery-bread',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    description: 'Artisan whole wheat loaves, buns, croissants & toasts',
  },
  {
    name: 'Cold Drinks & Beverages',
    slug: 'beverages',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    description: 'Pure fruit juices, herbal teas, coffee & cold drinks',
  },
  {
    name: 'Snacks & Sweets',
    slug: 'snacks-sweets',
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=600&q=80',
    description: 'Roasted dry fruits, namkeen, premium cookies & treats',
  },
  {
    name: 'Household Essentials',
    slug: 'household-cleaning',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',
    description: 'Eco kitchen cleaners, detergents, wipes & foils',
  },
  {
    name: 'Personal Care',
    slug: 'personal-care',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    description: 'Herbal soaps, shampoos, oral hygiene & skincare',
  },
  {
    name: 'Frozen Foods',
    slug: 'frozen-foods',
    image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=600&q=80',
    description: 'Crispy veg snacks, green peas, sweet corn & desserts',
  },
];

export default function CustomerStorefrontHomePage() {
  const { settings, products } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  // 5 Merchandising Product Slices connected to store (active published products)
  const activeProducts = products.filter((p) => p.status !== 'inactive');
  const bestSellers = activeProducts.slice(0, 8);
  const freshPicks = activeProducts.filter((p) => p.category === 'Fruits & Vegetables').slice(0, 4);
  const dailyEssentials = activeProducts.filter((p) => p.category === 'Grocery & Staples').slice(0, 4);
  const dairyBakery = activeProducts
    .filter((p) => p.category === 'Dairy & Eggs' || p.category === 'Bakery & Bread')
    .slice(0, 4);
  const specialOffers = activeProducts
    .filter((p) => p.mrp > p.sellingPrice)
    .sort((a, b) => (b.mrp - b.sellingPrice) / b.mrp - (a.mrp - a.sellingPrice) / a.mrp)
    .slice(0, 4);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubmitted(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setNewsletterSubmitted(false);
    }, 4000);
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* ========================================================
          1. REBUILT HERO SECTION: SOPHISTICATED 2-COLUMN LAYOUT WITH USER HERO ASSET
          ======================================================== */}
      {/* ========================================================
          1. HERO SECTION: ART-DIRECTED EXACT SUPPLIED ASSETS
             - Desktop: laptop.png (prominent produce on right, text on left)
             - Mobile: phone (2).png (vertical art-directed layout)
          ======================================================== */}
      <section className="relative overflow-hidden bg-[#FBF9F4] border-b border-emerald-900/10 min-h-[440px] sm:min-h-[480px] lg:min-h-[520px] flex items-center">
        {/* Responsive Art-Directed Background using Exact Supplied Assets */}
        <picture className="absolute inset-0 z-0 pointer-events-none">
          <source media="(max-width: 767px)" srcSet={mobileHero.src} />
          <source media="(min-width: 768px)" srcSet={desktopHero.src} />
          <img
            src={desktopHero.src}
            alt="Avani Grocers Fresh Harvest"
            className="w-full h-full object-cover object-bottom sm:object-right md:object-right"
            loading="eager"
          />
        </picture>

        {/* Subtle, Delicate Text Readability Shield (does not cover grocery basket on right) */}
        <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-r from-white/90 via-white/50 to-transparent sm:max-w-2xl" />
        <div className="absolute inset-0 z-1 pointer-events-none bg-gradient-to-b from-white/85 via-white/30 to-transparent sm:hidden" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 w-full">
          <div className="max-w-xl lg:max-w-2xl space-y-4 sm:space-y-5 text-left">
            {/* Brand Label */}
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/90 border border-emerald-300/80 px-3.5 py-1 text-[11px] font-black uppercase tracking-widest text-emerald-900 shadow-2xs">
              <Leaf className="h-3.5 w-3.5 text-emerald-700" />
              <span>AVANI GROCERS</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.12]">
              Freshness for every table.
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-lg font-medium">
              Discover fresh fruits, vegetables, dairy and everyday essentials, thoughtfully selected for your home.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-5 sm:px-6 py-3 text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-800/20 transition active:scale-95"
              >
                <span>Shop Groceries</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#categories"
                className="inline-flex items-center gap-2 rounded-xl bg-white/95 hover:bg-white border border-slate-300/90 px-5 py-3 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs transition active:scale-95"
              >
                <span>Explore Categories</span>
              </a>
            </div>

            {/* Three Concise Trust Indicators */}
            <div className="pt-4 border-t border-slate-900/10 grid grid-cols-3 gap-2.5 sm:gap-4 text-left">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-emerald-900 font-black text-xs sm:text-sm">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Farm-Fresh Quality</span>
                </div>
                <p className="text-[11px] text-slate-600 hidden sm:block">
                  Handpicked daily harvest
                </p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-emerald-900 font-black text-xs sm:text-sm">
                  <Truck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Convenient Delivery</span>
                </div>
                <p className="text-[11px] text-slate-600 hidden sm:block">
                  {settings.operations.estimatedDeliveryTime} doorstep dispatch
                </p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-emerald-900 font-black text-xs sm:text-sm">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Safe &amp; Secure Shopping</span>
                </div>
                <p className="text-[11px] text-slate-600 hidden sm:block">
                  Transparent billing with GST
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. SHOP BY CATEGORY (10 CURATED GROCERY AISLES - COMPACT)
          ======================================================== */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="flex items-end justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Everything you need for your everyday essentials.
            </p>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
          >
            <span>Browse All ({products.length})</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
          {STORE_CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/shop/category/${cat.slug}`}
              className="group relative flex flex-col rounded-2xl border border-slate-200/90 bg-white p-2.5 sm:p-3 shadow-2xs hover:shadow-md hover:border-emerald-500 transition-all duration-200 text-left gap-2"
            >
              <div className="aspect-4/3 w-full rounded-xl overflow-hidden bg-slate-50 shrink-0">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 transition leading-snug">
                  {cat.name}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================
          3. SECTION A — BEST SELLERS
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700">
              <TrendingUp className="h-4 w-4" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              Daily Best Sellers
            </h2>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
          >
            <span>View All</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {bestSellers.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* ========================================================
          4. PROMOTIONAL BANNER 1 — FRESH HARVEST PRODUCE
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative">
          <div className="relative z-10 space-y-3 max-w-lg text-left">
            <span className="inline-block rounded-full bg-emerald-500/30 border border-emerald-400/40 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-200">
              Morning Harvest Specials
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              Farm Fresh Organic Greens &amp; Seasonal Fruits
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Harvested every dawn and delivered crisp to your home within {settings.operations.estimatedDeliveryTime}.
            </p>
            <div className="pt-2">
              <Link
                href="/shop/category/fruits-vegetables"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-950 px-5 py-2.5 text-xs font-extrabold hover:bg-emerald-400 transition active:scale-95 shadow-md"
              >
                <span>Shop Fresh Produce</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="relative z-10 shrink-0 w-full md:w-64 aspect-4/3 rounded-2xl overflow-hidden border border-white/20 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80"
              alt="Farm fresh harvest"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ========================================================
          5. SECTION B — FRESH PICKS (FRUITS & VEGETABLES)
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700">
              <Leaf className="h-4 w-4" />
              <span>Direct From Farms</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              Fresh Picks
            </h2>
          </div>
          <Link
            href="/shop/category/fruits-vegetables"
            className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
          >
            <span>See All Produce</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {freshPicks.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* ========================================================
          6. PROMOTIONAL BANNER 2 — BREAKFAST ESSENTIALS
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-amber-950 via-amber-900 to-orange-950 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative">
          <div className="relative z-10 space-y-3 max-w-lg text-left">
            <span className="inline-block rounded-full bg-amber-500/30 border border-amber-400/40 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-200">
              Daily Morning Routines
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              Breakfast Essentials &amp; Dairy Bar
            </h3>
            <p className="text-xs sm:text-sm text-amber-100/80 leading-relaxed">
              Pure whole milk, artisan sourdough breads, country eggs, butter and herbal teas.
            </p>
            <div className="pt-2">
              <Link
                href="/shop/category/dairy-eggs"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-950 px-5 py-2.5 text-xs font-extrabold hover:bg-amber-300 transition active:scale-95 shadow-md"
              >
                <span>Explore Breakfast Essentials</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="relative z-10 shrink-0 w-full md:w-64 aspect-4/3 rounded-2xl overflow-hidden border border-white/20 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80"
              alt="Breakfast and dairy items"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ========================================================
          7. SECTION C — DAILY ESSENTIALS (STAPLES, ATTA, RICE, DALS)
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
              Pantry Staples
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              Daily Essentials
            </h2>
          </div>
          <Link
            href="/shop/category/grocery-staples"
            className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
          >
            <span>All Staples</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {dailyEssentials.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* ========================================================
          8. PROMOTIONAL BANNER 3 — MONTHLY GROCERY STOCK-UP
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative">
          <div className="relative z-10 space-y-3 max-w-lg text-left">
            <span className="inline-block rounded-full bg-blue-500/30 border border-blue-400/40 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-200">
              Value Packs &amp; Combos
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              Monthly Grocery Stock-up
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Wholesale savings on 5kg &amp; 10kg grain sacks, cold-pressed oils, lentils, and cleaning staples.
            </p>
            <div className="pt-2">
              <Link
                href="/shop/category/grocery-staples"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-950 px-5 py-2.5 text-xs font-extrabold hover:bg-blue-300 transition active:scale-95 shadow-md"
              >
                <span>Stock Up Kitchen Now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="relative z-10 shrink-0 w-full md:w-64 aspect-4/3 rounded-2xl overflow-hidden border border-white/20 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"
              alt="Grocery stock up"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ========================================================
          9. SECTION D — DAIRY & BAKERY
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
              Fresh Daily
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              Dairy &amp; Bakery
            </h2>
          </div>
          <Link
            href="/shop/category/dairy-eggs"
            className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
          >
            <span>Explore Corner</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {dairyBakery.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* ========================================================
          10. SECTION E — SPECIAL OFFERS (VALID ACTIVE DISCOUNTS)
          ======================================================== */}
      {specialOffers.length > 0 && (
        <section className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border-y border-amber-200/60 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-black text-amber-900 uppercase tracking-wider">
                  <Tag className="h-3.5 w-3.5 text-amber-700" />
                  <span>Real Supermarket Savings</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
                  Special Offers
                </h2>
              </div>
              <Link
                href="/offers"
                className="flex items-center gap-1 text-xs font-bold text-amber-900 hover:underline"
              >
                <span>View All Offers</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {specialOffers.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          11. TRUST AND SERVICE SECTION (PART 8 REQUIREMENTS)
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
              Trust &amp; Service Guarantee
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Why Customers Rely on {settings.companyName || 'Avani Grocers'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Combining the convenience of fast local delivery with the honest pricing and reliability
              of your neighbourhood grocery store.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
            {/* Feature 1 */}
            <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50/60 border border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Leaf className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                Quality Grocery Selection
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Hand-inspected produce, pure dairy, and verified packaged brands.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50/60 border border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                Convenient Shopping
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Seamless browsing on mobile or desktop with instant search and simple reorders.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50/60 border border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                Flexible Pickup &amp; Delivery
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Fast doorstep dispatch or swift in-store collection at your preferred time.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50/60 border border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Receipt className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                Transparent Billing
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Clear GST invoices with itemized tax and no hidden checkout surcharges.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50/60 border border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <PackageCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                Easy Order Tracking
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Live order status tracking from grocery packing to delivery completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          12. NEWSLETTER / UPDATES
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg text-left">
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-extrabold text-emerald-300">
              Avani Fresh Club
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Get Weekly Harvest Updates &amp; Special Savings
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/80">
              Join local shoppers receiving fresh seasonal produce notifications and coupon savings.
            </p>
          </div>

          <form onSubmit={handleNewsletter} className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address..."
              className="h-11 w-full sm:w-72 rounded-xl border border-white/20 bg-white/10 px-4 text-xs text-white placeholder-emerald-200/60 focus:bg-white focus:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button
              type="submit"
              className="h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 text-xs font-extrabold shadow-md transition shrink-0 active:scale-95"
            >
              Subscribe Free
            </button>
          </form>

          {newsletterSubmitted && (
            <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-emerald-700 text-white p-4 shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-bold">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              <span>Thank you! Welcome coupon WELCOME50 is active for your account.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
