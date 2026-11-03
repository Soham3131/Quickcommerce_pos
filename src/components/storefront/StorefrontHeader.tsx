'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  Heart,
  User as UserIcon,
  MapPin,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  PhoneCall,
  Clock,
  ShieldCheck,
  Truck,
  ArrowRight,
  LogOut,
  LayoutDashboard,
  Receipt,
  Package,
  Globe,
  Repeat,
  FileText,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency, CURRENCY_PRESETS } from '@/lib/currency';
import { ProductCategory } from '@/types';
import { getFeaturedAnnouncementCoupon } from '@/lib/coupons/couponService';
import brandLogo from '@/data/logo.png';

export const CATEGORY_SLUG_MAP: Record<string, ProductCategory> = {
  'fruits-vegetables': 'Fruits & Vegetables',
  'dairy-eggs': 'Dairy & Eggs',
  'bakery-bread': 'Bakery & Bread',
  'grocery-staples': 'Grocery & Staples',
  'beverages': 'Beverages',
  'snacks-sweets': 'Snacks & Sweets',
  'personal-care': 'Personal Care',
  'household-cleaning': 'Household & Cleaning',
  'frozen-foods': 'Frozen Foods',
};

export const REVERSE_CATEGORY_SLUG_MAP: Record<ProductCategory, string> = {
  'Fruits & Vegetables': 'fruits-vegetables',
  'Dairy & Eggs': 'dairy-eggs',
  'Bakery & Bread': 'bakery-bread',
  'Grocery & Staples': 'grocery-staples',
  'Beverages': 'beverages',
  'Snacks & Sweets': 'snacks-sweets',
  'Personal Care': 'personal-care',
  'Household & Cleaning': 'household-cleaning',
  'Frozen Foods': 'frozen-foods',
};

export const STORE_NAV_CATEGORIES = [
  { label: 'All Categories', slug: '/shop' },
  { label: 'Fruits & Vegetables', slug: '/shop/category/fruits-vegetables' },
  { label: 'Dairy & Eggs', slug: '/shop/category/dairy-eggs' },
  { label: 'Grocery & Staples', slug: '/shop/category/grocery-staples' },
  { label: 'Bakery', slug: '/shop/category/bakery-bread' },
  { label: 'Beverages', slug: '/shop/category/beverages' },
  { label: 'Snacks', slug: '/shop/category/snacks-sweets' },
  { label: 'Personal Care', slug: '/shop/category/personal-care' },
  { label: 'Household', slug: '/shop/category/household-cleaning' },
  { label: 'Offers', slug: '/offers', isSpecial: true },
];

export const StorefrontHeader: React.FC = () => {
  const router = useRouter();
  const {
    settings,
    products,
    customerCartCount,
    customerCartSubtotal,
    wishlist,
    currentUser,
    logout,
    setCurrency,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Gurugram, DLF Phase 5');

  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  // Outside click listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationMenuOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered search preview items
  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchFocused(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const featuredCoupon = getFeaturedAnnouncementCoupon(settings);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-emerald-900 text-emerald-100 text-[11px] sm:text-xs py-1.5 px-4 font-medium border-b border-emerald-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
            <span>Fresh groceries delivered to your doorstep.</span>
            {featuredCoupon ? (
              <span className="hidden sm:inline">
                Special savings: Use code{' '}
                <span className="font-extrabold text-amber-300 underline underline-offset-2">
                  {featuredCoupon.code}
                </span>{' '}
                for {featuredCoupon.discountType === 'free_shipping' ? 'Free Delivery' : `${featuredCoupon.discountValue || featuredCoupon.discountPercent}% OFF`}
              </span>
            ) : (
              <span className="hidden sm:inline text-emerald-200">
                Express 30–45 min delivery across Gurugram.
              </span>
            )}
            <Link
              href="/offers"
              className="inline-flex items-center gap-1 font-bold text-white hover:text-amber-300 transition ml-1"
            >
              <span>View Offers</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-[11px] text-emerald-200/80 font-normal shrink-0">
            <span className="flex items-center gap-1">
              <PhoneCall className="h-3 w-3" />
              <span>{settings.phone}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>7 AM – 10 PM</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN STORE HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Location */}
        <div className="flex items-center gap-5 shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src={brandLogo.src}
              alt={settings.companyName || 'Avani Grocers'}
              className="h-11 w-auto max-w-[170px] object-contain group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('#storefront-logo-fallback') as HTMLElement | null;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="hidden items-center gap-3" id="storefront-logo-fallback">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">
                  {settings.companyName || 'Avani Grocers'}
                </span>
                <p className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase leading-tight">
                  Fresh Everyday
                </p>
              </div>
            </div>
          </Link>

          {/* Location Delivery Selector (Desktop) */}
          <div className="relative hidden xl:block" ref={locationRef}>
            <button
              type="button"
              onClick={() => setLocationMenuOpen(!locationMenuOpen)}
              className="flex items-center gap-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 px-3 py-1.5 text-xs text-left transition"
            >
              <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-slate-400 leading-none">Deliver to</p>
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[140px]">
                  {selectedLocation}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
            </button>

            {locationMenuOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-fade-in text-xs space-y-2">
                <p className="font-bold text-slate-900 text-xs">Select Delivery Area</p>
                <p className="text-[11px] text-slate-500">
                  Avani Express reaches homes within 30–45 mins.
                </p>
                <div className="space-y-1">
                  {[
                    'Gurugram, DLF Phase 5',
                    'Gurugram, Golf Course Ext Road',
                    'Gurugram, Cyber City Phase 2',
                    'Gurugram, Sohna Road Sector 48',
                  ].map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setLocationMenuOpen(false);
                      }}
                      className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                        selectedLocation === loc
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Product Search Bar */}
        <div className="relative flex-1 max-w-xl hidden md:block" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search farm fresh vegetables, dairy, atta, fruits, snacks..."
              className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-20 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-[11px] font-bold shadow-xs transition"
            >
              Search
            </button>
          </form>

          {/* Autocomplete Search Dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-fade-in text-xs space-y-2">
              <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 pb-1 border-b border-slate-100">
                <span>Suggested Groceries</span>
                <span className="text-emerald-700">{searchResults.length} matches</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {searchResults.map((prod) => (
                  <Link
                    key={prod.id}
                    href={`/product/${prod.id}`}
                    onClick={() => setIsSearchFocused(false)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="h-9 w-9 rounded-lg object-cover border border-slate-100"
                      />
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-emerald-700 transition">
                          {prod.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {prod.category} · {prod.unit}
                        </p>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-900 tabular-nums">
                      {formatCurrency(prod.sellingPrice, settings.currency)}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="pt-1.5 text-center border-t border-slate-100">
                <Link
                  href={`/search?q=${encodeURIComponent(searchQuery)}`}
                  onClick={() => setIsSearchFocused(false)}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  View all results for &quot;{searchQuery}&quot; →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Action Icons: Currency, Wishlist, Cart, Account */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Currency Switcher */}
          <div className="relative hidden lg:block" ref={currencyRef}>
            <button
              type="button"
              onClick={() => setCurrencyMenuOpen(!currencyMenuOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              title="Select Currency"
            >
              <Globe className="h-3.5 w-3.5 text-emerald-600" />
              <span>{settings.currency.symbol} {settings.currency.code}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {currencyMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-fade-in text-xs space-y-1">
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Currency
                </p>
                {CURRENCY_PRESETS.map((curr) => (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => {
                      setCurrency(curr);
                      setCurrencyMenuOpen(false);
                    }}
                    className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs font-medium transition flex items-center justify-between ${
                      settings.currency.code === curr.code
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{curr.name}</span>
                    <span className="font-mono font-bold">{curr.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Wishlist Link */}
          <Link
            href="/account/wishlist"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
            title="My Saved Wishlist"
          >
            <Heart className="h-4 w-4" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white shadow-xs">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Shopping Cart Pill */}
          <Link
            href="/cart"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold shadow-md shadow-emerald-700/20 transition active:scale-98"
          >
            <div className="relative">
              <ShoppingBag className="h-4 w-4" />
              {customerCartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-slate-950">
                  {customerCartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Cart</span>
            <span className="font-extrabold tabular-nums pl-1 border-l border-emerald-500/60 text-white">
              {formatCurrency(customerCartSubtotal, settings.currency)}
            </span>
          </Link>

          {/* User Account Dropdown */}
          <div className="relative" ref={accountRef}>
            <button
              type="button"
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 sm:px-3 sm:py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition"
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-6 w-6 rounded-lg object-cover border border-slate-200"
                />
              ) : (
                <div className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <UserIcon className="h-3.5 w-3.5" />
                </div>
              )}
              <span className="hidden md:inline max-w-[90px] truncate">
                {currentUser?.name ? currentUser.name.split(' ')[0] : 'Sign In'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />
            </button>

            {/* Account Menu Popover */}
            {accountMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl z-50 animate-fade-in text-xs space-y-1">
                {currentUser ? (
                  <>
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-800 uppercase">
                        {currentUser.role}
                      </span>
                    </div>

                    <div className="px-3 pt-1 pb-0.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Account
                    </div>

                    <Link
                      href="/account/profile"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-emerald-800 font-medium transition"
                    >
                      <UserIcon className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/account/orders"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-emerald-800 font-medium transition"
                    >
                      <Package className="h-4 w-4 text-blue-600 shrink-0" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      href="/account/addresses"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-emerald-800 font-medium transition"
                    >
                      <MapPin className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>Saved Addresses</span>
                    </Link>

                    <Link
                      href="/account/wishlist"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-emerald-800 font-medium transition"
                    >
                      <Heart className="h-4 w-4 text-rose-500 shrink-0" />
                      <span>My Wishlist</span>
                    </Link>

                    <Link
                      href="/account/invoices"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-emerald-800 font-medium transition"
                    >
                      <FileText className="h-4 w-4 text-purple-600 shrink-0" />
                      <span>My Invoices</span>
                    </Link>

                    {/* Admin / Cashier shortcuts */}
                    {currentUser.role === 'admin' && (
                      <Link
                        href="/dashboard"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100 font-bold transition mt-1"
                      >
                        <LayoutDashboard className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    {currentUser.role === 'cashier' && (
                      <Link
                        href="/pos"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-blue-800 bg-blue-50/70 hover:bg-blue-100 font-bold transition mt-1"
                      >
                        <Receipt className="h-4 w-4 text-blue-600 shrink-0" />
                        <span>Launch POS Till</span>
                      </Link>
                    )}

                    {/* Divider & Prominent Action Buttons */}
                    <div className="pt-2 border-t border-slate-200 mt-2 space-y-1.5">
                      <button
                        type="button"
                        onClick={async () => {
                          setAccountMenuOpen(false);
                          await logout();
                          router.push('/login');
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 px-3 py-2 text-xs font-bold transition active:scale-98 shadow-2xs"
                      >
                        <Repeat className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                        <span>Switch Account</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          setAccountMenuOpen(false);
                          await logout();
                          router.push('/');
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-2 text-xs font-bold transition active:scale-98 shadow-2xs"
                      >
                        <LogOut className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2">
                      <Link
                        href="/login"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex w-full items-center justify-center rounded-xl bg-emerald-600 py-2 font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                      >
                        Sign In / Select Role
                      </Link>
                    </div>
                    <div className="px-3 py-1 text-center">
                      <p className="text-[11px] text-slate-500">
                        New customer?{' '}
                        <Link
                          href="/signup"
                          onClick={() => setAccountMenuOpen(false)}
                          className="font-bold text-emerald-700 hover:underline"
                        >
                          Create Account
                        </Link>
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* 3. CATEGORY NAVIGATION STRIP (DESKTOP) */}
      <div className="hidden md:block border-t border-slate-100 bg-slate-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-semibold overflow-x-auto no-scrollbar py-2 gap-2">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
            {STORE_NAV_CATEGORIES.map((nav) => (
              <Link
                key={nav.label}
                href={nav.slug}
                className={`rounded-lg px-2.5 py-1.5 whitespace-nowrap transition flex items-center gap-1 ${
                  nav.isSpecial
                    ? 'bg-amber-100 text-amber-900 font-bold hover:bg-amber-200 border border-amber-300/60'
                    : nav.label === 'All Categories'
                    ? 'bg-white text-slate-900 font-bold border border-slate-200 shadow-2xs hover:border-emerald-500'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60'
                }`}
              >
                {nav.isSpecial && <Sparkles className="h-3 w-3 text-amber-600" />}
                <span>{nav.label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 shrink-0 ml-auto">
            <Link
              href="/track-order"
              className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-emerald-700 rounded-lg px-2 py-1 hover:bg-slate-100 transition"
            >
              <Truck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Track Order</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. MOBILE DRAWER NAVIGATION */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[110px] z-50 bg-slate-900/60 backdrop-blur-xs md:hidden animate-fade-in flex flex-col">
          <div className="bg-white p-4 space-y-4 shadow-2xl max-h-[80vh] overflow-y-auto">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fresh groceries..."
                className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-xs focus:border-emerald-600 focus:outline-none"
              />
            </form>

            {/* Mobile Categories */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Grocery Departments
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                {STORE_NAV_CATEGORIES.map((nav) => (
                  <Link
                    key={nav.label}
                    href={nav.slug}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 hover:border-emerald-600 transition flex items-center justify-between"
                  >
                    <span>{nav.label}</span>
                    {nav.isSpecial && <Sparkles className="h-3.5 w-3.5 text-amber-600" />}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Portals */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs font-bold">
              <Link
                href="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-slate-800"
              >
                <Truck className="h-4 w-4 text-emerald-600" />
                <span>Track an Order</span>
              </Link>
              <Link
                href="/account/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-rose-800"
              >
                <Heart className="h-4 w-4 text-rose-600" />
                <span>My Wishlist ({wishlist.length})</span>
              </Link>
              {currentUser ? (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[11px] font-bold text-slate-500">Signed in as:</span>
                    <span className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        setMobileMenuOpen(false);
                        await logout();
                        router.push('/login');
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 text-emerald-800 p-2.5 text-xs font-bold active:scale-95 transition"
                    >
                      <Repeat className="h-3.5 w-3.5 text-emerald-700" />
                      <span>Switch Account</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setMobileMenuOpen(false);
                        await logout();
                        router.push('/');
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 p-2.5 text-xs font-bold active:scale-95 transition"
                    >
                      <LogOut className="h-3.5 w-3.5 text-rose-600" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-emerald-900"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Admin &amp; Cashier Portal Entry</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
