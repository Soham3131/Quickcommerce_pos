'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Store, Mail, ArrowRight, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function ForgotPasswordPage() {
  const { settings } = useStore();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between antialiased">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-slate-900 block leading-tight">
                {settings.companyName || 'Avani Grocers'}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase block">
                Password Recovery
              </span>
            </div>
          </Link>

          <Link href="/login" className="text-xs font-bold text-slate-600 hover:text-emerald-700">
            Back to Sign In →
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-1">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <KeyRound className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Forgot Password</h1>
            <p className="text-xs text-slate-500">
              Enter your registered email address to receive password reset instructions.
            </p>
          </div>

          {submitted ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 space-y-2">
                <div className="flex items-center gap-2 font-black text-emerald-900">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>Reset link generated (Demo Mode)</span>
                </div>
                <p className="text-emerald-700 leading-relaxed font-medium">
                  In this demo environment, you can sign in directly using the demo customer credentials:
                </p>
                <div className="rounded-xl bg-white/80 p-3 font-mono text-[11px] text-slate-800 border border-emerald-200">
                  <p>Email: <strong className="text-emerald-800">customer@avanigrocers.com</strong></p>
                  <p>Password: <strong className="text-emerald-800">Customer@123</strong></p>
                </div>
              </div>

              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-black shadow-md transition"
              >
                <span>Return to Login</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="e.g. customer@avanigrocers.com"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Send Reset Link</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Role Selection</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>© 2026 {settings.companyName || 'Avani Grocers'}. Complete Grocery Retail Ecosystem.</p>
      </footer>
    </div>
  );
}
