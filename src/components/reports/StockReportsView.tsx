'use client';

import React, { useState } from 'react';
import {
  FileBarChart,
  Calendar,
  Download,
  Printer,
  TrendingDown,
  TrendingUp,
  Package,
  RotateCcw,
  AlertTriangle,
  Mail,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/currency';
import { formatDate } from '@/lib/utils';
import { ProductCategory } from '@/types';

export const StockReportsView: React.FC = () => {
  const {
    products,
    orders,
    stockAdjustments,
    purchases,
    settings,
    updateSettings,
  } = useStore();

  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [emailSimulationSent, setEmailSimulationSent] = useState(false);

  // Compute movement metrics based on POS sales and adjustments
  const totalStockSoldUnits = orders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((sum, ord) => sum + ord.items.reduce((iSum, item) => iSum + item.quantity, 0), 0);

  const totalStockSoldRevenue = orders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((sum, ord) => sum + ord.grandTotal, 0);

  const totalStockDamaged = stockAdjustments
    .filter((a) => a.type === 'damage')
    .reduce((sum, a) => sum + a.quantity, 0);

  const totalStockExpired = stockAdjustments
    .filter((a) => a.type === 'expiry')
    .reduce((sum, a) => sum + a.quantity, 0);

  const totalStockPurchasedUnits = purchases
    .filter((p) => p.status === 'received')
    .reduce((sum, p) => sum + p.items.reduce((iSum, i) => iSum + i.quantity, 0), 0);

  const currentClosingStockUnits = products.reduce((sum, p) => sum + p.currentStock, 0);
  const currentClosingStockValue = products.reduce(
    (sum, p) => sum + p.currentStock * p.sellingPrice,
    0
  );

  // Opening stock = Closing + Sold + Damaged + Expired - Purchased
  const estimatedOpeningUnits = Math.round(
    currentClosingStockUnits +
      totalStockSoldUnits +
      totalStockDamaged +
      totalStockExpired -
      totalStockPurchasedUnits
  );
  const estimatedOpeningValue = Math.round(
    currentClosingStockValue + totalStockSoldRevenue * 0.75
  );

  const handleExportCSV = () => {
    const headers = [
      'Report Period',
      'Metric',
      'Units / Quantity',
      'Value (Estimated)',
    ];
    const data = [
      [reportPeriod.toUpperCase(), 'Opening Stock', estimatedOpeningUnits, estimatedOpeningValue],
      [reportPeriod.toUpperCase(), 'Stock Purchased', totalStockPurchasedUnits, '—'],
      [reportPeriod.toUpperCase(), 'Stock Sold (POS)', totalStockSoldUnits, totalStockSoldRevenue],
      [reportPeriod.toUpperCase(), 'Stock Damaged', totalStockDamaged, '—'],
      [reportPeriod.toUpperCase(), 'Stock Expired', totalStockExpired, '—'],
      [reportPeriod.toUpperCase(), 'Closing Stock', currentClosingStockUnits, currentClosingStockValue],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...data.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = encoded;
    a.download = `Avani_Grocers_${reportPeriod}_Stock_Report.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendSimulatedEmail = () => {
    setEmailSimulationSent(true);
    setTimeout(() => setEmailSimulationSent(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <FileBarChart className="h-6 w-6 text-emerald-600" />
            <span>Daily & Weekly Stock Movement Reports</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit inventory flows, turnover, retail valuation, and shrinkage analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex rounded-xl border border-slate-200 bg-white p-1">
            <button
              onClick={() => setReportPeriod('daily')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                reportPeriod === 'daily'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Report (Today)
            </button>
            <button
              onClick={() => setReportPeriod('weekly')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                reportPeriod === 'weekly'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly Report
            </button>
            <button
              onClick={() => setReportPeriod('monthly')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                reportPeriod === 'monthly'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Summary
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Movement Ledger KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Opening Stock
          </p>
          <p className="text-xl font-black text-slate-900 mt-2">{estimatedOpeningUnits}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {formatCurrency(estimatedOpeningValue, settings.currency)}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 shadow-xs">
          <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
            Stock Purchased
          </p>
          <p className="text-xl font-black text-blue-700 mt-2">+{totalStockPurchasedUnits}</p>
          <p className="text-[11px] text-blue-900/70 mt-0.5">Received shipments</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs">
          <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Stock Sold (POS)
          </p>
          <p className="text-xl font-black text-emerald-700 mt-2">-{totalStockSoldUnits}</p>
          <p className="text-[11px] text-emerald-900/70 mt-0.5">
            {formatCurrency(totalStockSoldRevenue, settings.currency)} sales
          </p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 shadow-xs">
          <p className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
            Damaged Stock
          </p>
          <p className="text-xl font-black text-rose-700 mt-2">-{totalStockDamaged}</p>
          <p className="text-[11px] text-rose-900/70 mt-0.5">Broken / defectives</p>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-4 shadow-xs">
          <p className="text-xs font-semibold text-purple-800 uppercase tracking-wider">
            Expired Stock
          </p>
          <p className="text-xl font-black text-purple-700 mt-2">-{totalStockExpired}</p>
          <p className="text-[11px] text-purple-900/70 mt-0.5">Past shelf life</p>
        </div>

        <div className="rounded-2xl border border-emerald-300 bg-emerald-100/50 p-4 shadow-xs">
          <p className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
            Closing Valuation
          </p>
          <p className="text-xl font-black text-emerald-800 mt-2">
            {formatCurrency(currentClosingStockValue, settings.currency)}
          </p>
          <p className="text-[11px] text-emerald-800/80 mt-0.5">
            {Math.round(currentClosingStockUnits)} total units
          </p>
        </div>
      </div>

      {/* Category-wise Stock Movement Breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Category-wise Movement & Stock Distribution
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Inventory turnover and retail valuation breakdown by department.
        </p>

        <div className="divide-y divide-slate-100">
          {[
            'Fruits & Vegetables',
            'Dairy & Eggs',
            'Bakery & Bread',
            'Grocery & Staples',
            'Beverages',
            'Snacks & Sweets',
            'Personal Care',
            'Household & Cleaning',
            'Frozen Foods',
          ].map((cat) => {
            const catProds = products.filter((p) => p.category === cat);
            const totalUnits = catProds.reduce((sum, p) => sum + p.currentStock, 0);
            const totalVal = catProds.reduce(
              (sum, p) => sum + p.currentStock * p.sellingPrice,
              0
            );

            return (
              <div key={cat} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">{cat}</p>
                  <p className="text-[11px] text-slate-400">
                    {catProds.length} Products registered
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-slate-900">
                    {formatCurrency(totalVal, settings.currency)}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {Math.round(totalUnits)} Units in stock
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alert Scheduling & Email Simulation Settings Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span>Stock Report Scheduling & Automated Email Alerts</span>
            </h3>
            <p className="text-xs text-slate-500">
              Configure daily and weekly automated stock summaries sent to management.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSendSimulatedEmail}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>
              {emailSimulationSent
                ? '✓ Simulated Email Dispatched!'
                : 'Send Test Summary Email'}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700">Recipient Email</label>
            <input
              type="email"
              value={settings.notifications.reportRecipientEmail}
              onChange={(e) =>
                updateSettings({
                  notifications: {
                    ...settings.notifications,
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
              value={settings.notifications.preferredNotificationTime}
              onChange={(e) =>
                updateSettings({
                  notifications: {
                    ...settings.notifications,
                    preferredNotificationTime: e.target.value,
                  },
                })
              }
              className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-4 pt-5">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={settings.notifications.dailyStockReport}
                onChange={(e) =>
                  updateSettings({
                    notifications: {
                      ...settings.notifications,
                      dailyStockReport: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Daily Stock Summary</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={settings.notifications.weeklyStockReport}
                onChange={(e) =>
                  updateSettings({
                    notifications: {
                      ...settings.notifications,
                      weeklyStockReport: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Weekly Recap</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
