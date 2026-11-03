'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Award,
  ShoppingBag,
  CreditCard,
  Eye,
  Mail,
  Phone,
  MapPin,
  X,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Customer } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { formatDate, formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

export const CustomersView: React.FC = () => {
  const { customers, addCustomer, updateCustomer, orders, settings } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);

  // Add Customer Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [customerType, setCustomerType] = useState<Customer['customerType']>('Regular');

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'All' || c.customerType === selectedType;
    return matchesSearch && matchesType;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCustomer({
      name: name.trim(),
      phone: phone.trim() || '—',
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      address: address.trim() || 'Local Customer',
      customerType,
    });

    setIsModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
  };

  const customerOrders = activeCustomer
    ? orders.filter((o) => o.customerId === activeCustomer.id)
    : [];

  // Close modals on Escape key & lock body scroll
  React.useEffect(() => {
    if (!isModalOpen && !activeCustomer) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setActiveCustomer(null);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, activeCustomer]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-600" />
            <span>Customer Directory & Loyalty Program</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer ledgers, purchase history, outstanding balances, and reward points.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
        >
          <UserPlus className="h-4 w-4" />
          <span>New Customer</span>
        </button>
      </div>

      {/* Customer Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
          >
            <option value="All">All Customer Types</option>
            <option value="VIP">VIP</option>
            <option value="Regular">Regular</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Walk-in">Walk-in</option>
          </select>
          <span className="text-xs text-slate-500 font-medium">
            {filtered.length} customers
          </span>
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-3">Contact Information</th>
                <th className="py-3 px-3 text-center">Type</th>
                <th className="py-3 px-3 text-right">Loyalty Points</th>
                <th className="py-3 px-3 text-right">Orders</th>
                <th className="py-3 px-3 text-right">Total Purchases</th>
                <th className="py-3 px-3 text-right">Balance Due</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 text-xs">{c.name}</p>
                    <p className="text-[11px] text-slate-400">ID: {c.id}</p>
                  </td>

                  <td className="py-3 px-3 text-slate-600">
                    <p className="font-medium text-slate-800">{c.phone}</p>
                    <p className="text-[11px] text-slate-400">{c.email}</p>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span
                      className={cn(
                        'inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase',
                        c.customerType === 'VIP'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : c.customerType === 'Wholesale'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : c.customerType === 'Walk-in'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-emerald-100 text-emerald-800'
                      )}
                    >
                      {c.customerType}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-extrabold text-amber-600">
                    {c.loyaltyPoints} pts
                  </td>

                  <td className="py-3 px-3 text-right font-semibold text-slate-800">
                    {c.totalOrders}
                  </td>

                  <td className="py-3 px-3 text-right font-black text-slate-900">
                    {formatCurrency(c.totalPurchases, settings.currency)}
                  </td>

                  <td className="py-3 px-3 text-right font-semibold">
                    {c.outstandingBalance > 0 ? (
                      <span className="text-rose-600 font-bold">
                        {formatCurrency(c.outstandingBalance, settings.currency)}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">0.00</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setActiveCustomer(c)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Purchase History Modal */}
      {activeCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>{activeCustomer.name}</span>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 font-bold">
                    {activeCustomer.customerType}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Phone: {activeCustomer.phone} · Loyalty Points: {activeCustomer.loyaltyPoints} pts
                </p>
              </div>
              <button
                onClick={() => setActiveCustomer(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Past Invoices & Sales Records ({customerOrders.length})
              </h4>

              {customerOrders.length === 0 ? (
                <p className="text-center text-slate-400 py-8">
                  No orders found for this customer.
                </p>
              ) : (
                <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                  {customerOrders.map((ord) => (
                    <div key={ord.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 font-mono">
                            {ord.invoiceNumber}
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-700 uppercase">
                            {ord.orderType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {formatDateTime(ord.createdAt)} · {ord.items.length} items · Payment:{' '}
                          {ord.paymentMethod.toUpperCase()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">
                          {formatCurrency(ord.grandTotal, settings.currency)}
                        </p>
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h3 className="font-bold text-slate-900 text-base">Register New Customer</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anjali Sharma"
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98123 45678"
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anjali@example.com"
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Delivery Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Building, Flat No, Landmark"
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Customer Category</label>
                <select
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value as any)}
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="Walk-in">Walk-in</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
