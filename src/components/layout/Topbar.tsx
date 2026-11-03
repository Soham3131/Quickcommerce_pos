'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Bell,
  ShoppingCart,
  Coins,
  RotateCcw,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Package,
  X,
  Repeat,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { CURRENCY_PRESETS, formatCurrency } from '@/lib/currency';
import { CurrencyConfig } from '@/types';
import { cn } from '@/lib/utils';

export const Topbar: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const router = useRouter();
  const {
    currentUser,
    settings,
    setCurrency,
    getLowStockProducts,
    getOutOfStockProducts,
    resetToDemoData,
    products,
    logout,
  } = useStore();

  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const currencyRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Click-outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setShowCurrencyDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotificationDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCurrencyDropdown(false);
        setShowNotificationDropdown(false);
        setShowUserMenu(false);
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const lowStock = getLowStockProducts();
  const outOfStock = getOutOfStockProducts();
  const totalAlerts = lowStock.length + outOfStock.length;

  // Search matches
  const filteredProducts = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.barcode.includes(searchQuery)
        )
        .slice(0, 6)
    : [];

  const handleCurrencyChange = (curr: CurrencyConfig) => {
    setCurrency(curr);
    setShowCurrencyDropdown(false);
  };

  const handleReset = () => {
    if (confirm('Reset store data back to initial demo dataset? All temporary bills and adjustments will be refreshed.')) {
      resetToDemoData();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-3 sm:px-6 backdrop-blur-sm gap-2">
      {/* Left: Mobile Menu Toggle & Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-lg">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition lg:hidden shrink-0 touch-target flex items-center justify-center"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Product & SKU Search */}
        <div ref={searchRef} className="relative w-full max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products, SKU, barcode..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 text-xs placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Search Autocomplete Results */}
          {showSearchResults && searchQuery.trim() && (
            <div className="absolute left-0 right-0 sm:w-[420px] top-11 z-50 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-scale-up">
              <div className="flex items-center justify-between px-2 pb-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <span>Matching Products ({filteredProducts.length})</span>
                <button
                  onClick={() => setShowSearchResults(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Close
                </button>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No matching grocery products found.
                </div>
              ) : (
                <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                  {filteredProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/pos`}
                      onClick={() => setShowSearchResults(false)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50/70 transition group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-9 w-9 rounded-lg object-cover border border-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 truncate">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {p.category} · SKU: {p.sku} · Barcode: {p.barcode}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-xs font-bold text-slate-800 tabular-nums">
                          {formatCurrency(p.sellingPrice, settings.currency)}
                        </p>
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded-md font-semibold',
                            p.currentStock <= 0
                              ? 'bg-rose-100 text-rose-700'
                              : p.currentStock <= p.minStock
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          )}
                        >
                          {p.currentStock} {p.unit}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Currency Switcher */}
        <div ref={currencyRef} className="relative">
          <button
            type="button"
            onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
            title="Change Currency"
            className="flex items-center gap-1 sm:gap-1.5 rounded-xl border border-slate-200 bg-white px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 touch-target"
            aria-label="Select currency"
          >
            <Coins className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="hidden xs:inline">
              {settings.currency.code} ({settings.currency.symbol})
            </span>
            <span className="xs:hidden font-bold">
              {settings.currency.symbol}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
          </button>

          {showCurrencyDropdown && (
            <div className="absolute right-0 top-11 z-50 w-52 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-scale-up">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Active Currency
              </div>
              <div className="space-y-0.5">
                {CURRENCY_PRESETS.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleCurrencyChange(c)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs transition text-left min-h-[36px]',
                      settings.currency.code === c.code
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    <span>{c.name}</span>
                    <span className="font-bold text-emerald-700">{c.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications & Stock Alerts Bell */}
        <div ref={notificationRef} className="relative">
          <button
            type="button"
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            className="relative rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 touch-target flex items-center justify-center"
            aria-label="Stock alerts notifications"
          >
            <Bell className="h-4 w-4" />
            {totalAlerts > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white shadow-xs">
                {totalAlerts}
              </span>
            )}
          </button>

          {showNotificationDropdown && (
            <div className="absolute right-0 top-11 z-50 w-[300px] sm:w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl animate-scale-up">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-800">
                    Live Stock Alerts ({totalAlerts})
                  </span>
                </div>
                <Link
                  href="/stock-alerts"
                  onClick={() => setShowNotificationDropdown(false)}
                  className="text-[11px] text-emerald-600 hover:underline font-medium"
                >
                  View All
                </Link>
              </div>

              <div className="mt-2 divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {outOfStock.map((p) => (
                  <div key={p.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-rose-700 truncate max-w-[170px]">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-400">SKU: {p.sku}</p>
                    </div>
                    <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                      Out of Stock
                    </span>
                  </div>
                ))}
                {lowStock.map((p) => (
                  <div key={p.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-800 truncate max-w-[170px]">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Left: {p.currentStock} {p.unit} (Min: {p.minStock})
                      </p>
                    </div>
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                      Low Stock
                    </span>
                  </div>
                ))}
                {totalAlerts === 0 && (
                  <p className="py-4 text-center text-xs text-slate-400">
                    All inventory levels are healthy!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Demo Data Reset Button */}
        <button
          onClick={handleReset}
          title="Reset Demo Data"
          className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <RotateCcw className="h-3 w-3" />
          <span className="text-[11px]">Reset Demo</span>
        </button>

        {/* Prominent POS Billing CTA Button */}
        <Link
          href="/pos"
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-emerald-700/20 transition hover:bg-emerald-700 active:scale-95"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">Launch POS</span>
          <span className="sm:hidden">POS</span>
        </Link>

        {/* User Account / Switcher Dropdown */}
        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold text-slate-800 transition"
            title="User Account & Switcher"
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-6 w-6 rounded-lg object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="h-6 w-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <UserIcon className="h-3.5 w-3.5" />
              </div>
            )}
            <span className="hidden md:inline max-w-[85px] truncate">
              {currentUser?.name ? currentUser.name.split(' ')[0] : 'User'}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:inline" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl animate-scale-up text-xs space-y-1.5">
              <div className="px-2 py-1.5 border-b border-slate-100">
                <p className="font-bold text-slate-900 truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser?.email}</p>
                <span className="inline-block mt-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-800">
                  {currentUser?.role}
                </span>
              </div>

              <div className="pt-1 space-y-1.5">
                <button
                  type="button"
                  onClick={async () => {
                    setShowUserMenu(false);
                    await logout();
                    router.push('/login');
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 px-3 py-2 font-bold transition active:scale-95 shadow-2xs"
                >
                  <Repeat className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Switch Account</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setShowUserMenu(false);
                    await logout();
                    router.push('/');
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-2 font-bold transition active:scale-95 shadow-2xs"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-600" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
