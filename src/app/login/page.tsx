'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag,
  Store,
  Receipt,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  Mail,
  UserCheck,
  CheckCircle2,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { UserRole } from '@/types';
import brandLogo from '@/data/logo.png';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithCredentials, settings } = useStore();

  // Active view: 'select' (3 role cards) or specific role login form
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill credentials when choosing a role
  const handleSelectRole = (role: UserRole) => {
    setActiveRole(role);
    setErrorMessage('');
    if (role === 'customer') {
      setEmail('customer@avanigrocers.com');
      setPassword('Customer@123');
    } else if (role === 'admin') {
      setEmail('admin@avanigrocers.com');
      setPassword('Admin@123');
    } else if (role === 'cashier') {
      setEmail('cashier@avanigrocers.com');
      setPassword('User@123');
    }
  };

  // Quick 1-click demo direct logins
  const handleDirectDemoLogin = (role: UserRole) => {
    login(role);
    if (role === 'admin') router.push('/dashboard');
    else if (role === 'cashier') router.push('/pos');
    else router.push('/account');
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    setTimeout(() => {
      const ok = loginWithCredentials(email.trim(), password.trim());
      setLoading(false);
      if (ok) {
        if (activeRole === 'admin' || email.includes('admin')) {
          router.push('/dashboard');
        } else if (activeRole === 'cashier' || email.includes('cashier')) {
          router.push('/pos');
        } else {
          router.push('/account');
        }
      } else {
        setErrorMessage(
          'Invalid demo credentials. Use the demo credentials shown or click 1-Click Demo Login.'
        );
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src={brandLogo.src}
              alt={settings.companyName || 'Avani Grocers'}
              className="h-10 w-auto max-w-[150px] object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('#login-logo-fallback') as HTMLElement | null;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="hidden items-center gap-2.5" id="login-logo-fallback">
              <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-slate-900 block leading-tight">
                  {settings.companyName || 'Avani Grocers'}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase block">
                  Retail Ecosystem
                </span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Demo Environment
            </span>
            <Link
              href="/"
              className="text-xs font-bold text-slate-600 hover:text-emerald-700 transition"
            >
              Back to Storefront →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex items-center justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl space-y-8">
          {/* Header Title */}
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Unified Retail Authentication
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Welcome to Avani Grocers
            </h1>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Choose how you would like to continue. Each role opens a tailored retail workspace.
            </p>
          </div>

          {/* Explicit Demo Environment Banner */}
          <div className="rounded-2xl border border-amber-200/90 bg-amber-50/70 p-4 text-center max-w-2xl mx-auto shadow-xs">
            <div className="flex items-center justify-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Interactive Demo Environment (APP_DATA_MODE=demo)</span>
            </div>
            <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
              Running in database-free demo mode. Accounts and authentication are pre-seeded for browser evaluation without external database dependencies.
            </p>
          </div>

          {/* VIEW 1: 3-ROLE SELECTION CARDS */}
          {!activeRole && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* CARD 1 — CUSTOMER / SHOPPER */}
                <div className="rounded-3xl border-2 border-emerald-200 bg-white p-6 sm:p-7 shadow-xs hover:shadow-xl hover:border-emerald-500 transition-all duration-200 flex flex-col justify-between space-y-6 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-50 rounded-bl-full -z-0 opacity-80 group-hover:scale-110 transition-transform" />

                  <div className="space-y-4 relative z-10">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                      <ShoppingBag className="h-6 w-6" />
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                        Shopper Experience
                      </span>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                        Continue as Customer
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Browse fresh groceries, shop your essentials, place orders, and manage live
                        tracking and GST invoices.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 space-y-1 text-[11px]">
                      <div className="flex justify-between text-slate-600">
                        <span className="font-semibold text-slate-400">Demo User:</span>
                        <span className="font-mono text-slate-800 font-bold">customer@avanigrocers.com</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span className="font-semibold text-slate-400">Password:</span>
                        <span className="font-mono text-slate-800 font-bold">Customer@123</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 relative z-10 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleDirectDemoLogin('customer')}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 text-xs font-black shadow-sm transition"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Explore as Customer</span>
                    </button>

                    <button
                      onClick={() => handleSelectRole('customer')}
                      className="w-full text-center text-xs font-bold text-slate-600 hover:text-emerald-700 py-1.5 transition"
                    >
                      Customer Login with Credentials →
                    </button>

                    <div className="flex items-center justify-between pt-1 text-[11px] font-medium text-slate-500 border-t border-slate-100">
                      <Link href="/signup" className="text-emerald-700 hover:underline font-bold">
                        Create Account
                      </Link>
                      <Link href="/" className="text-slate-600 hover:text-slate-900">
                        Continue as Guest →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* CARD 2 — ADMIN / STORE OWNER */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs hover:shadow-xl hover:border-slate-800 transition-all duration-200 flex flex-col justify-between space-y-6 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-slate-100 rounded-bl-full -z-0 opacity-80 group-hover:scale-110 transition-transform" />

                  <div className="space-y-4 relative z-10">
                    <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                      <ShieldCheck className="h-6 w-6" />
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Back-Office Operations
                      </span>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                        Admin Portal
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Manage your store, products catalog, real-time inventory, billing, orders,
                        purchases, and analytics.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 space-y-1 text-[11px]">
                      <div className="flex justify-between text-slate-600">
                        <span className="font-semibold text-slate-400">Demo User:</span>
                        <span className="font-mono text-slate-800 font-bold">admin@avanigrocers.com</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span className="font-semibold text-slate-400">Password:</span>
                        <span className="font-mono text-slate-800 font-bold">Admin@123</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 relative z-10 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleDirectDemoLogin('admin')}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-4 text-xs font-black shadow-sm transition"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Explore Admin Portal</span>
                    </button>

                    <button
                      onClick={() => handleSelectRole('admin')}
                      className="w-full text-center text-xs font-bold text-slate-600 hover:text-slate-900 py-1.5 transition"
                    >
                      Admin Login with Credentials →
                    </button>

                    <div className="text-center pt-1 text-[11px] text-slate-400">
                      Full administrative access & settings
                    </div>
                  </div>
                </div>

                {/* CARD 3 — CASHIER / STAFF */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs hover:shadow-xl hover:border-teal-600 transition-all duration-200 flex flex-col justify-between space-y-6 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-teal-50 rounded-bl-full -z-0 opacity-80 group-hover:scale-110 transition-transform" />

                  <div className="space-y-4 relative z-10">
                    <div className="h-12 w-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
                      <Receipt className="h-6 w-6" />
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-teal-700">
                        Billing Counter
                      </span>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                        Cashier Portal
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Access high-speed POS terminal, create bills, scan barcodes, print thermal
                        receipts, and process shift sales.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 space-y-1 text-[11px]">
                      <div className="flex justify-between text-slate-600">
                        <span className="font-semibold text-slate-400">Demo User:</span>
                        <span className="font-mono text-slate-800 font-bold">cashier@avanigrocers.com</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span className="font-semibold text-slate-400">Password:</span>
                        <span className="font-mono text-slate-800 font-bold">User@123</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 relative z-10 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleDirectDemoLogin('cashier')}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-2.5 px-4 text-xs font-black shadow-sm transition"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Explore Cashier POS</span>
                    </button>

                    <button
                      onClick={() => handleSelectRole('cashier')}
                      className="w-full text-center text-xs font-bold text-slate-600 hover:text-teal-700 py-1.5 transition"
                    >
                      Cashier Login with Credentials →
                    </button>

                    <div className="text-center pt-1 text-[11px] text-slate-400">
                      Terminal billing & counter receipts
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest shopping CTA */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Info className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Just browsing or want to place a quick order?
                    </h4>
                    <p className="text-xs text-slate-500">
                      You do not need to log in to browse groceries, check offers, or add items to your cart.
                    </p>
                  </div>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 px-5 py-2.5 text-xs font-bold transition shrink-0"
                >
                  <span>Continue as Guest</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {/* VIEW 2: MANUAL CREDENTIAL LOGIN FORM */}
          {activeRole && (
            <div className="max-w-md mx-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <button
                  type="button"
                  onClick={() => setActiveRole(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Choose Another Role</span>
                </button>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {activeRole} Mode
                </span>
              </div>

              <div className="text-center space-y-1">
                <div
                  className={`h-12 w-12 rounded-2xl mx-auto flex items-center justify-center text-white shadow-md ${
                    activeRole === 'customer'
                      ? 'bg-emerald-600'
                      : activeRole === 'admin'
                      ? 'bg-slate-900'
                      : 'bg-teal-600'
                  }`}
                >
                  {activeRole === 'customer' ? (
                    <ShoppingBag className="h-6 w-6" />
                  ) : activeRole === 'admin' ? (
                    <ShieldCheck className="h-6 w-6" />
                  ) : (
                    <Receipt className="h-6 w-6" />
                  )}
                </div>
                <h2 className="text-xl font-black text-slate-900 capitalize">
                  {activeRole === 'customer'
                    ? 'Customer Login'
                    : activeRole === 'admin'
                    ? 'Admin Portal Access'
                    : 'Cashier Terminal Login'}
                </h2>
                <p className="text-xs text-slate-500">
                  Enter your credentials below to access your account.
                </p>
              </div>

              {errorMessage && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 font-semibold">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleManualLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl text-white text-xs font-black shadow-md transition flex items-center justify-center gap-2 ${
                    activeRole === 'customer'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : activeRole === 'admin'
                      ? 'bg-slate-900 hover:bg-slate-800'
                      : 'bg-teal-600 hover:bg-teal-700'
                  }`}
                >
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Sign In to {activeRole.toUpperCase()}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Fast Fill */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Quick Demo Access:</span>
                <button
                  type="button"
                  onClick={() => handleDirectDemoLogin(activeRole)}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  1-Click Direct Login →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>© 2026 {settings.companyName || 'Avani Grocers'}. Complete Grocery Retail Ecosystem.</p>
      </footer>
    </div>
  );
}
