'use client';

import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  SlidersHorizontal,
  Download,
  Upload,
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  History,
  TrendingUp,
  DollarSign,
  Package,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Product, ProductCategory, StockAdjustment } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { formatDate, formatDateTime } from '@/lib/utils';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { cn } from '@/lib/utils';

export const InventoryView: React.FC = () => {
  const {
    products,
    deleteProduct,
    settings,
    getStockValuation,
    stockAdjustments,
    getLowStockProducts,
    getOutOfStockProducts,
    currentUser,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'healthy' | 'low' | 'out'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price'>('stock');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<Product | null>(null);

  const valuation = getStockValuation();
  const lowStock = getLowStockProducts();
  const outOfStock = getOutOfStockProducts();

  // Filter & sort products
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;

      let matchesStock = true;
      if (stockFilter === 'out') matchesStock = p.currentStock <= 0;
      else if (stockFilter === 'low') matchesStock = p.currentStock > 0 && p.currentStock <= p.minStock;
      else if (stockFilter === 'healthy') matchesStock = p.currentStock > p.minStock;

      return matchesSearch && matchesCat && matchesStock;
    })
    .sort((a, b) => {
      let diff = 0;
      if (sortBy === 'name') diff = a.name.localeCompare(b.name);
      else if (sortBy === 'stock') diff = a.currentStock - b.currentStock;
      else if (sortBy === 'price') diff = a.sellingPrice - b.sellingPrice;
      return sortOrder === 'asc' ? diff : -diff;
    });

  // Export Inventory as CSV
  const handleExportCSV = () => {
    const headers = [
      'SKU',
      'Product Name',
      'Barcode',
      'Category',
      'Brand',
      'Current Stock',
      'Unit',
      'Min Stock',
      'Purchase Price',
      'Selling Price',
      'MRP',
      'Tax Rate %',
      'Expiry Date',
      'Status',
    ];

    const rows = products.map((p) => [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.barcode}"`,
      `"${p.category}"`,
      `"${p.brand}"`,
      p.currentStock,
      `"${p.unit}"`,
      p.minStock,
      p.purchasePrice,
      p.sellingPrice,
      p.mrp,
      p.taxRate,
      `"${p.expiryDate}"`,
      `"${p.status}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Avani_Grocers_Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import CSV Simulator
  const handleImportCSVClick = () => {
    alert(
      'CSV Import Simulation: All product columns validated successfully. In production, this imports stock updates directly from your distributor spreadsheets.'
    );
  };

  const handleOpenAdjust = (prod?: Product) => {
    setSelectedProductForAdjust(prod || null);
    setIsAdjustModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Inventory & Stock Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stock valuation, unit control, batch expiry, and reordering.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher: Inventory vs Adjustment History */}
          <div className="flex rounded-xl border border-slate-200 bg-white p-1">
            <button
              onClick={() => setActiveTab('inventory')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                activeTab === 'inventory'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Boxes className="h-3.5 w-3.5" />
              <span>Stock Catalog</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                activeTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <History className="h-3.5 w-3.5" />
              <span>Audit History ({stockAdjustments.length})</span>
            </button>
          </div>

          <button
            onClick={() => handleOpenAdjust()}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs transition"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Adjust Stock</span>
          </button>
        </div>
      </div>

      {/* KPI Valuation Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-emerald-200 hover:shadow-md animate-fade-in">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
            <Package className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-2 tabular-nums">{products.length} SKUs</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across 9 retail categories</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-emerald-200 hover:shadow-md animate-fade-in">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Retail Valuation</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-2 tabular-nums">
            {formatCurrency(valuation.retailValue, settings.currency)}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            Margin ~{valuation.profitMargin}%
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-blue-200 hover:shadow-md animate-fade-in">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Cost Valuation</span>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-2 tabular-nums">
            {formatCurrency(valuation.costValue, settings.currency)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Total purchase cost</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-amber-200 hover:shadow-md animate-fade-in">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Low Stock</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-xl font-black text-amber-600 mt-2 tabular-nums">{lowStock.length} Items</p>
          <p className="text-[11px] text-slate-400 mt-0.5">At or below reorder level</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-rose-200 hover:shadow-md animate-fade-in">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Out of Stock</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-xl font-black text-rose-600 mt-2 tabular-nums">{outOfStock.length} Items</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Urgent PO required</p>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        /* ========================================================
           STOCK CATALOG TAB
           ======================================================== */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex flex-1 items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, SKU, barcode, brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Category selector */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                <option value="Dairy & Eggs">Dairy & Eggs</option>
                <option value="Bakery & Bread">Bakery & Bread</option>
                <option value="Grocery & Staples">Grocery & Staples</option>
                <option value="Beverages">Beverages</option>
                <option value="Snacks & Sweets">Snacks & Sweets</option>
                <option value="Personal Care">Personal Care</option>
                <option value="Household & Cleaning">Household & Cleaning</option>
                <option value="Frozen Foods">Frozen Foods</option>
              </select>

              {/* Stock Status Selector */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
              >
                <option value="all">All Stock Levels</option>
                <option value="healthy">Healthy Stock</option>
                <option value="low">Low Stock Only</option>
                <option value="out">Out of Stock Only</option>
              </select>
            </div>

            {/* Actions: Sort & Import/Export */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span>
                  {sortBy === 'stock' ? 'Stock' : sortBy === 'price' ? 'Price' : 'Name'} (
                  {sortOrder.toUpperCase()})
                </span>
              </button>

              <button
                onClick={handleImportCSVClick}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                <Upload className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden sm:inline">Import</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-3">Barcode</th>
                  <th className="py-3 px-3">Category & Brand</th>
                  <th className="py-3 px-3 text-right">Cost Price</th>
                  <th className="py-3 px-3 text-right">Selling Price</th>
                  <th className="py-3 px-3 text-right">Current Stock</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3">Expiry Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isOut = p.currentStock <= 0;
                  const isLow = p.currentStock > 0 && p.currentStock <= p.minStock;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-11 w-11 rounded-lg object-cover border border-slate-100 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{p.name}</p>
                            <p className="text-[11px] font-mono text-slate-400">
                              SKU: {p.sku}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                        {p.barcode}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-medium text-slate-800">{p.category}</p>
                        <p className="text-[11px] text-slate-400">{p.brand}</p>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-600">
                        {formatCurrency(p.purchasePrice, settings.currency)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {formatCurrency(p.sellingPrice, settings.currency)}
                        <span className="text-[10px] text-slate-400 font-normal block">
                          MRP: {formatCurrency(p.mrp, settings.currency)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-sm text-slate-900">
                        {p.currentStock}{' '}
                        <span className="text-[11px] font-medium text-slate-500">{p.unit}</span>
                        <span className="text-[10px] text-slate-400 font-normal block">
                          Min: {p.minStock} {p.unit}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isOut ? (
                          <span className="inline-block rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 animate-pulse">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {formatDate(p.expiryDate)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenAdjust(p)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 transition"
                          >
                            Adjust
                          </button>
                          {currentUser?.role === 'admin' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete product ${p.name}?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="rounded-lg border border-slate-200 bg-white p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                              title="Delete product"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ========================================================
           STOCK ADJUSTMENT AUDIT HISTORY TAB
           ======================================================== */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Stock Adjustment History & Audit Trail
              </h3>
              <p className="text-xs text-slate-500">
                Every sale, restock, damage, and manual count reconciliation recorded.
              </p>
            </div>
            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              {stockAdjustments.length} Records
            </span>
          </div>

          {stockAdjustments.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <History className="h-10 w-10 mx-auto text-slate-300 stroke-[1.5] mb-2" />
              <p className="text-sm font-semibold text-slate-700">No stock adjustments yet</p>
              <p className="text-xs text-slate-400">
                POS checkouts and manual adjustments will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-3">Product Name</th>
                    <th className="py-3 px-2">Type</th>
                    <th className="py-3 px-2 text-right">Adjustment Qty</th>
                    <th className="py-3 px-3 text-right">Previous → New Stock</th>
                    <th className="py-3 px-4">Reason & Reference</th>
                    <th className="py-3 px-3">Adjusted By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockAdjustments.map((adj) => (
                    <tr key={adj.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {formatDateTime(adj.createdAt)}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{adj.productName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">SKU: {adj.sku}</p>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={cn(
                            'rounded px-2 py-0.5 text-[10px] font-bold uppercase',
                            adj.type === 'add'
                              ? 'bg-emerald-100 text-emerald-800'
                              : adj.type === 'damage'
                              ? 'bg-rose-100 text-rose-800'
                              : adj.type === 'expiry'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          )}
                        >
                          {adj.type}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-black text-slate-900">
                        {adj.type === 'add' ? `+${adj.quantity}` : `-${adj.quantity}`}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-700">
                        {adj.previousStock} →{' '}
                        <span className="text-emerald-700">{adj.newStock}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <p className="font-medium">{adj.reason}</p>
                        {adj.referenceInvoice && (
                          <p className="text-[11px] text-slate-400">Ref: {adj.referenceInvoice}</p>
                        )}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {adj.adjustedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        product={selectedProductForAdjust}
      />
    </div>
  );
};
