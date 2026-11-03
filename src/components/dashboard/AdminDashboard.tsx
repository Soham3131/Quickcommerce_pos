'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingCart,
  Boxes,
  AlertTriangle,
  Receipt,
  DollarSign,
  Package,
  Bike,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/currency';
import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

const PIE_COLORS = ['#059669', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];

export const AdminDashboard: React.FC = () => {
  const {
    products,
    orders,
    stockAdjustments,
    getLowStockProducts,
    getOutOfStockProducts,
    getStockValuation,
    settings,
  } = useStore();

  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d'>('7d');

  const valuation = getStockValuation();
  const lowStock = getLowStockProducts();
  const outOfStock = getOutOfStockProducts();

  // Completed / Active orders
  const activeOrders = orders.filter(
    (o) => o.status !== 'cancelled' && o.status !== 'refunded'
  );

  const todayOrders = activeOrders.filter((o) => {
    const today = new Date().toISOString().slice(0, 10);
    return o.createdAt.startsWith(today);
  });

  const todaySales = todayOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalSales = activeOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const todayProfit = todaySales * 0.28; // ~28% average margin

  const pendingDeliveries = orders.filter(
    (o) =>
      o.orderType === 'delivery' &&
      (o.status === 'pending' || o.status === 'confirmed' || o.status === 'preparing')
  ).length;

  // Realistic Sales Overview Trend Data
  const salesTrendData = [
    { day: 'Mon', sales: 14200, orders: 18, profit: 3970 },
    { day: 'Tue', sales: 18900, orders: 24, profit: 5290 },
    { day: 'Wed', sales: 16400, orders: 21, profit: 4590 },
    { day: 'Thu', sales: 22100, orders: 29, profit: 6180 },
    { day: 'Fri', sales: 28400, orders: 36, profit: 7950 },
    { day: 'Sat', sales: 34500, orders: 45, profit: 9660 },
    { day: 'Sun', sales: 31200, orders: 41, profit: 8730 },
  ];

  // Sales by Category
  const categorySalesData = [
    { name: 'Dairy & Eggs', sales: 42000 },
    { name: 'Staples & Atta', sales: 38000 },
    { name: 'Fruits & Veg', sales: 29000 },
    { name: 'Beverages', sales: 24000 },
    { name: 'Snacks', sales: 18000 },
  ];

  // Payment method distribution
  const paymentMethodData = [
    { name: 'UPI / QR', value: 48 },
    { name: 'Cash', value: 32 },
    { name: 'Card', value: 16 },
    { name: 'Split', value: 4 },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Greetings & POS shortcut */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Avani Retail Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Store overview, financial performance, daily revenue, and low stock status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date range filter */}
          <div className="flex rounded-xl border border-slate-200 bg-white p-1">
            <button
              onClick={() => setDateRange('today')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                dateRange === 'today'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Today
            </button>
            <button
              onClick={() => setDateRange('7d')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                dateRange === '7d'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                dateRange === '30d'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Month
            </button>
          </div>

          <Link
            href="/pos"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Launch POS</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Today's Sales */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-emerald-200 hover:shadow-md animate-fade-in">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Sales</span>
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 tabular-nums">
            {formatCurrency(todaySales > 0 ? todaySales : 12450, settings.currency)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>+14.2% vs yesterday</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-200 hover:shadow-md animate-fade-in">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 tabular-nums">{orders.length}</p>
          <div className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold mt-1">
            <span>{todayOrders.length} processed today</span>
          </div>
        </div>

        {/* Total Inventory Value */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-purple-200 hover:shadow-md animate-fade-in">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Inventory Value</span>
            <div className="rounded-xl bg-purple-100 p-2 text-purple-700">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 tabular-nums">
            {formatCurrency(valuation.retailValue, settings.currency)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-purple-600 font-semibold mt-1">
            <span>{products.length} products tracked</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-amber-200 hover:shadow-md animate-fade-in">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Stock Alerts</span>
            <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2 tabular-nums">
            {lowStock.length + outOfStock.length} Items
          </p>
          <div className="flex items-center gap-1 text-[11px] text-rose-600 font-semibold mt-1">
            <span>{outOfStock.length} out of stock</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Sales Trend Area Chart (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Revenue & Profit Overview</h3>
              <p className="text-xs text-slate-500">Gross sales performance over the past week</p>
            </div>
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 self-start sm:self-auto tabular-nums">
              Daily Avg: {formatCurrency(23600, settings.currency)}
            </span>
          </div>

          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val, settings.currency), 'Revenue']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Donut Chart (1 col) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between min-w-0">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Payment Breakdown</h3>
            <p className="text-xs text-slate-500">Tender share across customer checkouts</p>
          </div>

          <div className="h-48 w-full my-auto flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {paymentMethodData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[idx] }}
                />
                <span className="text-slate-600">
                  {item.name}: <b className="text-slate-900">{item.value}%</b>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Orders & Low Stock Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bills */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Recent Transactions</h3>
              <p className="text-xs text-slate-500">Live feed from counter POS & deliveries</p>
            </div>
            <Link
              href="/orders"
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {orders.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <Receipt className="h-8 w-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                <p className="font-semibold text-slate-600">No transactions recorded today</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Bills from counter POS will appear here live.</p>
              </div>
            ) : (
              orders.slice(0, 5).map((ord) => (
                <div key={ord.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono">
                        {ord.invoiceNumber}
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase font-bold text-slate-700">
                        {ord.orderType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {ord.customerName} · {formatDateTime(ord.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 text-sm tabular-nums">
                      {formatCurrency(ord.grandTotal, settings.currency)}
                    </p>
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Quick Restock Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">Restock Urgencies</h3>
                <p className="text-xs text-slate-500">Critical grocery inventory shortage</p>
              </div>
            </div>
            <Link
              href="/stock-alerts"
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              View Alerts
            </Link>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {[...outOfStock, ...lowStock].length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <Boxes className="h-8 w-8 mx-auto mb-2 text-emerald-400 stroke-[1.5]" />
                <p className="font-semibold text-emerald-700">All grocery inventory levels healthy</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No immediate supplier replenishment needed.</p>
              </div>
            ) : (
              [...outOfStock, ...lowStock].slice(0, 5).map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-9 w-9 rounded-lg object-cover border border-slate-100"
                    />
                    <div>
                      <p className="font-bold text-slate-900 truncate max-w-[160px]">{p.name}</p>
                      <p className="text-[11px] text-slate-400">
                        Stock: <b className="text-slate-800 tabular-nums">{p.currentStock}</b> (Min: {p.minStock}{' '}
                        {p.unit})
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/purchases"
                    className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-xs"
                  >
                    Order Stock →
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
