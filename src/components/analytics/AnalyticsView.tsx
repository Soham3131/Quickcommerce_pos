'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  ShoppingBag,
  ArrowUpRight,
  Calendar,
  Users,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/currency';

const COLORS = ['#059669', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6'];

export const AnalyticsView: React.FC = () => {
  const { products, orders, settings } = useStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Revenue vs Expense Dataset
  const financialData = [
    { period: 'Jan', revenue: 420000, cost: 295000, profit: 125000 },
    { period: 'Feb', revenue: 480000, cost: 330000, profit: 150000 },
    { period: 'Mar', revenue: 510000, cost: 350000, profit: 160000 },
    { period: 'Apr', revenue: 490000, cost: 340000, profit: 150000 },
    { period: 'May', revenue: 580000, cost: 390000, profit: 190000 },
    { period: 'Jun', revenue: 640000, cost: 425000, profit: 215000 },
    { period: 'Jul', revenue: 690000, cost: 460000, profit: 230000 },
    { period: 'Aug', revenue: 730000, cost: 485000, profit: 245000 },
    { period: 'Sep', revenue: 780000, cost: 510000, profit: 270000 },
    { period: 'Oct', revenue: 840000, cost: 550000, profit: 290000 },
  ];

  // Top Selling Products Leaderboard
  const topSelling = [
    { name: 'Amul Taaza Milk 500ml', sold: '1,420 units', revenue: 39760, growth: '+18%' },
    { name: '100% Whole Wheat Bread', sold: '890 units', revenue: 44500, growth: '+12%' },
    { name: 'Fortune Sunflower Oil 1L', sold: '640 units', revenue: 92800, growth: '+9%' },
    { name: 'India Gate Basmati 5kg', sold: '420 units', revenue: 319200, growth: '+24%' },
    { name: 'Organic Vine Tomatoes', sold: '380 kg', revenue: 14440, growth: '+15%' },
    { name: 'Tata Sampann Toor Dal', sold: '310 units', revenue: 55180, growth: '+8%' },
  ];

  const categoryDistribution = [
    { name: 'Dairy & Eggs', value: 34 },
    { name: 'Grocery & Staples', value: 28 },
    { name: 'Fruits & Veg', value: 16 },
    { name: 'Beverages', value: 12 },
    { name: 'Snacks & Bakery', value: 10 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
            <span>Retail Sales & Profit Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time financial performance, profit margins, and basket analytics.
          </p>
        </div>

        {/* Time Selector */}
        <div className="flex rounded-xl border border-slate-200 bg-white p-1">
          <button
            onClick={() => setTimeRange('week')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              timeRange === 'week' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              timeRange === 'month' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              timeRange === 'year' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Annual
          </button>
        </div>
      </div>

      {/* Main Revenue vs Cost Bar Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Revenue vs Wholesale Cost & Net Profit
            </h3>
            <p className="text-xs text-slate-500">
              Monthly retail receipts vs distributor inventory purchase expenditure.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-emerald-600" />
              <span>Revenue</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-slate-300" />
              <span>Cost</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-blue-600" />
              <span>Net Profit</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(val: any) => [formatCurrency(val, settings.currency), '']}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="revenue" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products & Category Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 mb-1">Top Selling Grocery Items</h3>
          <p className="text-xs text-slate-500 mb-4">Ranked by unit velocity and revenue</p>

          <div className="divide-y divide-slate-100">
            {topSelling.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-[11px] text-slate-400">{item.sold}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 tabular-nums">
                    {formatCurrency(item.revenue, settings.currency)}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-semibold">{item.growth}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Share */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">
              Department Sales Distribution
            </h3>
            <p className="text-xs text-slate-500">Revenue contribution percentage</p>
          </div>

          <div className="h-52 w-full my-auto flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <p className="text-center text-xs text-slate-400">
            Dairy, Staples & Fresh Produce account for &gt;75% of store volume.
          </p>
        </div>
      </div>
    </div>
  );
};
