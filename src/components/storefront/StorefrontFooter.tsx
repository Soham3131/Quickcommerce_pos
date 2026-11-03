'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Heart,
  ArrowRight,
  Store,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import brandLogo from '@/data/logo.png';

export const StorefrontFooter: React.FC = () => {
  const { settings } = useStore();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      {/* Trust Highlights Strip */}
      <div className="border-b border-slate-900 bg-slate-900/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-2xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">30-Min Fast Delivery</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Handpicked farm harvest delivered to your doorstep in express time.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-2xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Quality Guaranteed</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Fresh produce sourced directly from audited organic growers and dairy farms.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-2xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Instant Replacement</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Hassle-free return or credit if any perishable item does not meet standards.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-2xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Transparent GST Billing</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Official tax invoices with itemized slabs, compliant with GST regulations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="bg-white rounded-2xl px-3 py-1.5 shadow-md flex items-center">
                <img
                  src={brandLogo.src}
                  alt={settings.companyName || 'Avani Grocers'}
                  className="h-10 w-auto max-w-[160px] object-contain group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('#footer-logo-fallback') as HTMLElement | null;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="hidden items-center gap-2" id="footer-logo-fallback">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <span className="text-base font-black tracking-tight text-slate-900">
                    {settings.companyName}
                  </span>
                </div>
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Avani Grocers is an enterprise grocery supermarket and digital storefront delivering
              farm-fresh vegetables, dairy, pantry essentials, and household goods. Real-time POS
              billing, inventory control, and customer-first fulfillment.
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  {settings.address}, {settings.city}, {settings.state} – {settings.pincode}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{settings.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{settings.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Operating Hours: Mon – Sun: 7:00 AM – 10:00 PM</span>
              </div>
            </div>
          </div>

          {/* Departments */}
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Departments
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/shop/category/fruits-vegetables"
                  className="hover:text-emerald-400 transition"
                >
                  Fruits &amp; Vegetables
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/category/dairy-eggs"
                  className="hover:text-emerald-400 transition"
                >
                  Dairy &amp; Farm Eggs
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/category/bakery-bread"
                  className="hover:text-emerald-400 transition"
                >
                  Bakery &amp; Artisan Bread
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/category/grocery-staples"
                  className="hover:text-emerald-400 transition"
                >
                  Atta, Rice &amp; Staples
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/category/beverages"
                  className="hover:text-emerald-400 transition"
                >
                  Juices &amp; Beverages
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/category/snacks-sweets"
                  className="hover:text-emerald-400 transition"
                >
                  Snacks &amp; Sweets
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/category/household-cleaning"
                  className="hover:text-emerald-400 transition"
                >
                  Household Essentials
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Services */}
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Customer Care
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/track-order" className="hover:text-emerald-400 transition">
                  Live Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-emerald-400 transition">
                  My Shopper Account
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-emerald-400 transition">
                  Order History &amp; Bills
                </Link>
              </li>
              <li>
                <Link href="/account/addresses" className="hover:text-emerald-400 transition">
                  Saved Delivery Addresses
                </Link>
              </li>
              <li>
                <Link href="/account/wishlist" className="hover:text-emerald-400 transition">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-emerald-400 transition">
                  Today&apos;s Promo Coupons
                </Link>
              </li>
            </ul>
          </div>

          {/* Enterprise & Portals */}
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Enterprise Suite
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-emerald-400 font-bold hover:text-emerald-300 transition"
                >
                  <Store className="h-3.5 w-3.5" />
                  <span>Admin &amp; POS Login</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-400 transition">
                  Admin ERP Dashboard
                </Link>
              </li>
              <li>
                <Link href="/pos" className="hover:text-emerald-400 transition">
                  Cashier Billing POS Till
                </Link>
              </li>
              <li>
                <Link href="/inventory" className="hover:text-emerald-400 transition">
                  Warehouse Inventory Control
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-emerald-400 transition">
                  Store &amp; Tax Settings
                </Link>
              </li>
            </ul>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-[11px] space-y-1">
              <p className="font-bold text-white">GSTIN / Registration</p>
              <p className="font-mono text-emerald-400">{settings.gstin}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-900 bg-slate-950 py-4 px-4 sm:px-6 lg:px-8 text-center sm:flex sm:justify-between sm:items-center text-[11px] text-slate-500 max-w-7xl mx-auto">
        <p>© 2026 {settings.companyName} Retail Management Ecosystem. All rights reserved.</p>
        <p className="mt-1 sm:mt-0">
          Connected Grocery Retail SaaS · App Router Next.js 14 · LocalStorage Architecture
        </p>
      </div>
    </footer>
  );
};
