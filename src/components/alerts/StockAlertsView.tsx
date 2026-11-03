'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  AlertCircle,
  Truck,
  Package,
  Plus,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { formatDate } from '@/lib/utils';
import { StockAdjustmentModal } from '@/components/inventory/StockAdjustmentModal';

export const StockAlertsView: React.FC = () => {
  const {
    products,
    getLowStockProducts,
    getOutOfStockProducts,
    settings,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'all' | 'out' | 'low' | 'expiring'>('all');
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const lowStock = getLowStockProducts();
  const outOfStock = getOutOfStockProducts();

  // Expiring soon: within 45 days
  const now = new Date();
  const expiringSoon = products.filter((p) => {
    if (!p.expiryDate) return false;
    const exp = new Date(p.expiryDate);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 45;
  });

  const alerts = products.filter((p) => {
    if (activeTab === 'out') return p.currentStock <= 0;
    if (activeTab === 'low') return p.currentStock > 0 && p.currentStock <= p.minStock;
    if (activeTab === 'expiring') {
      const exp = new Date(p.expiryDate);
      const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 45;
    }
    // all
    return p.currentStock <= p.minStock || expiringSoon.some((e) => e.id === p.id);
  });

  const handleQuickRestock = (prod: Product) => {
    setSelectedProduct(prod);
    setAdjustModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <span>Low Stock & Reorder Alerts</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated replenishment notifications and reorder recommendations based on minimum stock rules.
          </p>
        </div>

        {/* Tab Filter */}
        <div className="flex rounded-xl border border-slate-200 bg-white p-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Alerts ({outOfStock.length + lowStock.length + expiringSoon.length})
          </button>
          <button
            onClick={() => setActiveTab('out')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'out'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Out of Stock ({outOfStock.length})
          </button>
          <button
            onClick={() => setActiveTab('low')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'low'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Low Stock ({lowStock.length})
          </button>
          <button
            onClick={() => setActiveTab('expiring')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'expiring'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Expiring Soon ({expiringSoon.length})
          </button>
        </div>
      </div>

      {/* Alert Severity Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Critical Severity
            </span>
            <span className="rounded-full bg-rose-600 p-1 text-white">
              <AlertCircle className="h-4 w-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-rose-700 mt-2 tabular-nums">{outOfStock.length}</p>
          <p className="text-xs text-rose-900/80 mt-1">
            Products completely out of stock. Customers cannot buy these.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              High Warning
            </span>
            <span className="rounded-full bg-amber-500 p-1 text-white">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-amber-700 mt-2 tabular-nums">{lowStock.length}</p>
          <p className="text-xs text-amber-900/80 mt-1">
            Stock at or below minimum threshold. Reorder advised today.
          </p>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
              Batch Expiry Caution
            </span>
            <span className="rounded-full bg-purple-600 p-1 text-white">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-purple-700 mt-2 tabular-nums">{expiringSoon.length}</p>
          <p className="text-xs text-purple-900/80 mt-1">
            Products approaching expiry date within next 45 days.
          </p>
        </div>
      </div>

      {/* Actionable Alerts Cards Grid */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
            <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500 stroke-[1.5] mb-3" />
            <p className="text-base font-bold text-slate-800">
              No stock alerts at this time!
            </p>
            <p className="text-xs text-slate-400 mt-1">
              All inventory levels are above the configured minimum thresholds.
            </p>
          </div>
        ) : (
          alerts.map((p) => {
            const isOut = p.currentStock <= 0;
            const isLow = p.currentStock > 0 && p.currentStock <= p.minStock;
            // Suggested reorder = (minStock * 2) - currentStock
            const suggestedReorder = Math.max(p.minStock, p.minStock * 2 - p.currentStock);
            const stockPercent = Math.min(
              100,
              Math.round((p.currentStock / Math.max(1, p.minStock * 2)) * 100)
            );

            return (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs hover:border-slate-300 transition"
              >
                {/* Left: Product Media & Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-14 w-14 rounded-xl object-cover border border-slate-100 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
                      {isOut ? (
                        <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          Low Stock
                        </span>
                      ) : (
                        <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                          Expiring Soon
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {p.category} · SKU: <span className="font-mono">{p.sku}</span> · Supplier:{' '}
                      <span className="font-medium text-slate-700">{p.supplierName}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Cost: {formatCurrency(p.purchasePrice, settings.currency)} · Expiry:{' '}
                      {formatDate(p.expiryDate)}
                    </p>
                  </div>
                </div>

                {/* Middle: Stock Level Progress Meter */}
                <div className="w-full sm:w-56 shrink-0 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Current Stock:</span>
                    <span
                      className={`font-black tabular-nums ${
                        isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-800'
                      }`}
                    >
                      {p.currentStock} / {p.minStock} {p.unit}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(4, stockPercent)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Min Stock: {p.minStock}</span>
                    <span className="font-semibold text-emerald-700">
                      Suggested PO: +{suggestedReorder} {p.unit}
                    </span>
                  </div>
                </div>

                {/* Right: Quick Restock & PO Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleQuickRestock(p)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
                    <span>Adjust</span>
                  </button>
                  <Link
                    href={`/purchases?reorder=${p.id}`}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    <span>Create PO</span>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      <StockAdjustmentModal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
};
