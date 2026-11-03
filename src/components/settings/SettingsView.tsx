'use client';

import React, { useState } from 'react';
import {
  Settings,
  Store,
  Coins,
  Percent,
  Receipt,
  Bike,
  Bell,
  RotateCcw,
  Save,
  CheckCircle2,
  ShoppingBag,
  Globe,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { CURRENCY_PRESETS } from '@/lib/currency';
import { CurrencyConfig, TaxConfig } from '@/types';
import { cn } from '@/lib/utils';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToDemoData, currentUser } = useStore();

  const [activeTab, setActiveTab] = useState<
    'storefront' | 'tax' | 'currency' | 'invoice' | 'operations' | 'general' | 'notifications'
  >('storefront');
  const [saveBanner, setSaveBanner] = useState(false);

  // Form state clone
  const [formData, setFormData] = useState(settings);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 3000);
  };

  const handleReset = () => {
    if (
      confirm(
        'Reset all settings, product inventory, and customer bills back to initial seed data?'
      )
    ) {
      resetToDemoData();
      setFormData(settings);
    }
  };

  if (currentUser?.role === 'cashier') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
        <p className="text-xs text-slate-500 mt-1">
          Store settings, tax configurations, and currency preferences are restricted to
          Administrators. Please switch to the Admin profile to modify configurations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-emerald-600" />
            <span>Storefront, Tax & ERP Business Configuration</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure customer storefront branding, delivery thresholds, GST tax rates, multi-currency, and operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
          >
            <Save className="h-4 w-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </div>

      {saveBanner && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Settings saved successfully! Storefront, GST rates, and operational parameters updated store-wide.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar gap-2">
        {[
          { id: 'storefront', label: 'Storefront Configuration', icon: ShoppingBag, badge: 'STORE' },
          { id: 'tax', label: 'GST & Tax Configuration', icon: Percent, badge: 'STATUTORY' },
          { id: 'currency', label: 'Currency & Format', icon: Coins },
          { id: 'invoice', label: 'Invoice & Thermal', icon: Receipt },
          { id: 'operations', label: 'Store Operations', icon: Bike },
          { id: 'general', label: 'Store Profile', icon: Store },
          { id: 'notifications', label: 'Alerts & Reports', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition',
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={cn(
                  'rounded px-1.5 py-0.2 text-[9px] font-black',
                  activeTab === tab.id ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* ==================== 1. GENERAL SETTINGS ==================== */}
        {activeTab === 'general' && (
          <div className="space-y-4 max-w-2xl text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Store & Company Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700">Company / Store Name *</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700">Store Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700">Contact Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Official Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700">
                GSTIN / Tax Registration Number *
              </label>
              <input
                type="text"
                required
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs font-mono uppercase focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Printed on all customer A4 tax invoices and thermal cash slips.
              </p>
            </div>
          </div>
        )}

        {/* ==================== 2. CURRENCY SETTINGS ==================== */}
        {activeTab === 'currency' && (
          <div className="space-y-4 max-w-2xl text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Currency & Monetary Formatting
            </h3>
            <p className="text-slate-500">
              Select your operating currency. All prices, totals, reports, and invoices
              across the system will adapt immediately.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {CURRENCY_PRESETS.map((curr) => {
                const isSelected = formData.currency.code === curr.code;
                return (
                  <div
                    key={curr.code}
                    onClick={() => setFormData({ ...formData, currency: curr })}
                    className={cn(
                      'cursor-pointer rounded-xl border p-4 transition flex items-center justify-between',
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    )}
                  >
                    <div>
                      <p className="font-bold text-slate-900">{curr.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Code: {curr.code} · Symbol: {curr.symbol}
                      </p>
                    </div>
                    <span className="text-xl font-black text-emerald-800">{curr.symbol}</span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="font-semibold text-slate-700">Symbol Placement</label>
                <select
                  value={formData.currency.position}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currency: {
                        ...formData.currency,
                        position: e.target.value as 'before' | 'after',
                      },
                    })
                  }
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="before">Before Amount (e.g. ₹500)</option>
                  <option value="after">After Amount (e.g. 500 د.إ)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Decimal Precision</label>
                <select
                  value={formData.currency.decimalPlaces}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currency: {
                        ...formData.currency,
                        decimalPlaces: parseInt(e.target.value),
                      },
                    })
                  }
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value={2}>2 Decimals (e.g. ₹1,000.50)</option>
                  <option value={0}>0 Decimals (e.g. ₹1,001)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 3. TAX & GST SETTINGS ==================== */}
        {activeTab === 'tax' && (
          <div className="space-y-4 max-w-2xl text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Tax Engine & GST Configuration
            </h3>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">Enable Tax Calculations</p>
                <p className="text-[11px] text-slate-500">
                  Calculate and print tax breakdown on checkout
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.tax.enabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tax: { ...formData.tax, enabled: e.target.checked },
                  })
                }
                className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700">Tax System Name</label>
                <input
                  type="text"
                  value={formData.tax.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tax: { ...formData.tax, name: e.target.value },
                    })
                  }
                  placeholder="GST / VAT / Sales Tax"
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Pricing Mode</label>
                <select
                  value={formData.tax.isInclusive ? 'inclusive' : 'exclusive'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tax: {
                        ...formData.tax,
                        isInclusive: e.target.value === 'inclusive',
                      },
                    })
                  }
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="exclusive">Tax Exclusive (Prices + GST added)</option>
                  <option value="inclusive">Tax Inclusive (Prices include GST)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700">Standard GST Tax Slabs</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-1">
                {[0, 5, 12, 18, 28].map((rate) => (
                  <div
                    key={rate}
                    className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-2.5 text-center"
                  >
                    <p className="font-black text-emerald-800 text-sm">{rate}%</p>
                    <p className="text-[10px] text-slate-500">
                      {rate === 0
                        ? 'Exempt'
                        : rate === 5
                        ? 'Staples'
                        : rate === 12
                        ? 'Food'
                        : rate === 18
                        ? 'Standard'
                        : 'Luxury'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 4. INVOICE SETTINGS ==================== */}
        {activeTab === 'invoice' && (
          <div className="space-y-4 max-w-2xl text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Invoice & Thermal Print Layout
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700">Invoice Number Prefix</label>
                <input
                  type="text"
                  value={formData.invoicePrefix}
                  onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                  placeholder="AVN-INV"
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Thermal Printer Width</label>
                <select
                  value={formData.thermalWidth}
                  onChange={(e) =>
                    setFormData({ ...formData, thermalWidth: e.target.value as any })
                  }
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="80mm">80mm (Standard POS Counter)</option>
                  <option value="58mm">58mm (Compact Mobile POS)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700">Invoice Footer Note</label>
              <input
                type="text"
                value={formData.invoiceFooter}
                onChange={(e) => setFormData({ ...formData, invoiceFooter: e.target.value })}
                className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700">Terms & Conditions</label>
              <textarea
                value={formData.termsAndConditions}
                onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ==================== 5. OPERATIONS ==================== */}
        {activeTab === 'operations' && (
          <div className="space-y-4 max-w-2xl text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Store Channels & Delivery Settings
            </h3>

            <div className="space-y-2">
              <label className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200 cursor-pointer">
                <div>
                  <p className="font-bold text-slate-800">In-Store Counter Ordering</p>
                  <p className="text-[11px] text-slate-500">Walk-in customer checkout</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.operations.inStoreEnabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      operations: {
                        ...formData.operations,
                        inStoreEnabled: e.target.checked,
                      },
                    })
                  }
                  className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200 cursor-pointer">
                <div>
                  <p className="font-bold text-slate-800">Takeaway Orders</p>
                  <p className="text-[11px] text-slate-500">Pick-up packaging counter</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.operations.takeawayEnabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      operations: {
                        ...formData.operations,
                        takeawayEnabled: e.target.checked,
                      },
                    })
                  }
                  className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200 cursor-pointer">
                <div>
                  <p className="font-bold text-slate-800">Home Delivery</p>
                  <p className="text-[11px] text-slate-500">Courier doorstep delivery</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.operations.deliveryEnabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      operations: {
                        ...formData.operations,
                        deliveryEnabled: e.target.checked,
                      },
                    })
                  }
                  className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="font-semibold text-slate-700">
                  Minimum Order Value for Delivery ({settings.currency.symbol})
                </label>
                <input
                  type="number"
                  value={formData.operations.minDeliveryOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      operations: {
                        ...formData.operations,
                        minDeliveryOrder: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">
                  Flat Delivery Charge ({settings.currency.symbol})
                </label>
                <input
                  type="number"
                  value={formData.operations.deliveryCharge}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      operations: {
                        ...formData.operations,
                        deliveryCharge: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================== 6. NOTIFICATIONS ==================== */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 max-w-2xl text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Alerts & Automated Reporting Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700">Report Recipient Email</label>
                <input
                  type="email"
                  value={formData.notifications.reportRecipientEmail}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications,
                        reportRecipientEmail: e.target.value,
                      },
                    })
                  }
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Preferred Daily Report Time</label>
                <input
                  type="time"
                  value={formData.notifications.preferredNotificationTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications,
                        preferredNotificationTime: e.target.value,
                      },
                    })
                  }
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.notifications.lowStockAlerts}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications,
                        lowStockAlerts: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Enable In-App Realtime Low Stock Warning Badges</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.notifications.dailyStockReport}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications,
                        dailyStockReport: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Daily Stock Summary Generation</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.notifications.weeklyStockReport}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications,
                        weeklyStockReport: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Weekly Movement & Profit Recap Report</span>
              </label>
            </div>
          </div>
        )}

        {/* ==================== 7. E-COMMERCE STOREFRONT ==================== */}
        {activeTab === 'storefront' && (
          <div className="space-y-6 max-w-3xl text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-600" />
                <span>Customer-Facing E-Commerce Storefront Settings</span>
              </h3>
              <p className="text-slate-500 mt-1">
                Control the online grocery website, homepage announcement banner, hero section copy, free delivery threshold, and active promotional discount coupons.
              </p>
            </div>

            {/* Online Storefront Switch */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">Enable Customer Online Storefront</p>
                <p className="text-slate-500 text-[11px]">
                  When disabled, customers will see a temporary maintenance message instead of the product catalog.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.storefront?.enabled ?? true}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storefront: {
                        ...(formData.storefront || {} as any),
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Announcement Bar */}
            <div className="space-y-3 rounded-2xl border border-slate-200 p-4 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Top Announcement Banner</h4>
                  <p className="text-slate-400 text-[11px]">
                    Slim promotional ticker bar displayed at the very top of all customer pages.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.storefront?.announcementBar?.enabled ?? true}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storefront: {
                          ...(formData.storefront || {} as any),
                          announcementBar: {
                            ...(formData.storefront?.announcementBar || {} as any),
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Active</span>
                </label>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Announcement Ticker Text</label>
                <input
                  type="text"
                  value={
                    formData.storefront?.announcementBar?.text ||
                    'Fresh Farm Produce Delivered in 30 Mins | Free Express Delivery on orders above ₹499'
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storefront: {
                        ...(formData.storefront || {} as any),
                        announcementBar: {
                          ...(formData.storefront?.announcementBar || {} as any),
                          text: e.target.value,
                        },
                      },
                    })
                  }
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Free Delivery Threshold & Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-slate-200 p-4 bg-white">
              <div>
                <label className="font-semibold text-slate-700">
                  Free Delivery Threshold ({formData.currency.symbol})
                </label>
                <input
                  type="number"
                  value={formData.storefront?.freeDeliveryThreshold ?? 499}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storefront: {
                        ...(formData.storefront || {} as any),
                        freeDeliveryThreshold: Number(e.target.value),
                      },
                    })
                  }
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Orders equal or above this value receive ₹0 delivery fee.
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700">
                  Standard Home Delivery Charge ({formData.currency.symbol})
                </label>
                <input
                  type="number"
                  value={formData.storefront?.deliveryCharge ?? 40}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storefront: {
                        ...(formData.storefront || {} as any),
                        deliveryCharge: Number(e.target.value),
                      },
                    })
                  }
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Applied when total order is below free shipping threshold.
                </p>
              </div>
            </div>

            {/* Hero Copy */}
            <div className="space-y-3 rounded-2xl border border-slate-200 p-4 bg-white">
              <h4 className="font-bold text-slate-900">Homepage Hero Section</h4>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Hero Main Headline</label>
                  <input
                    type="text"
                    value={
                      formData.storefront?.heroBanner?.heading ||
                      'Fresh Groceries. Handpicked Daily. Delivered to Your Doorstep.'
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storefront: {
                          ...(formData.storefront || {} as any),
                          heroBanner: {
                            ...(formData.storefront?.heroBanner || {} as any),
                            heading: e.target.value,
                          },
                        },
                      })
                    }
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Hero Subheading</label>
                  <textarea
                    rows={2}
                    value={
                      formData.storefront?.heroBanner?.subheading ||
                      'Explore over 5,000+ certified organic produce, dairy, farm-fresh staples, and pantry essentials. Premium quality guaranteed at local neighborhood supermarket rates.'
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storefront: {
                          ...(formData.storefront || {} as any),
                          heroBanner: {
                            ...(formData.storefront?.heroBanner || {} as any),
                            subheading: e.target.value,
                          },
                        },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Demo Promo Coupons */}
            <div className="space-y-3 rounded-2xl border border-slate-200 p-4 bg-white">
              <h4 className="font-bold text-slate-900">Configured Demo Coupon Codes</h4>
              <p className="text-slate-400 text-[11px]">
                Valid promo codes accepted during customer online checkout:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(formData.storefront?.demoCoupons || [
                  { code: 'WELCOME50', discountPercent: 10, description: '10% off for new shoppers', minOrder: 300 },
                  { code: 'FREESHIP', discountPercent: 0, description: 'Free Express Shipping', minOrder: 0 },
                  { code: 'AVANI15', discountPercent: 15, description: '15% off cart above ₹1000', minOrder: 1000 },
                ]).map((c) => (
                  <div key={c.code} className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
                    <span className="font-mono font-black text-emerald-700 text-xs">{c.code}</span>
                    <p className="text-[11px] text-slate-600 font-medium">{c.description}</p>
                    <p className="text-[10px] text-slate-400">Min Order: ₹{c.minOrder}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Form Footer Save Button */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
