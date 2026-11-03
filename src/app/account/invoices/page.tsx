'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, Printer, Download, Eye, Calendar, DollarSign, Package } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { AccountNav } from '@/components/account/AccountNav';
import { formatCurrency } from '@/lib/currency';
import { formatDateTime } from '@/lib/utils';
import { InvoiceModal } from '@/components/billing/InvoiceModal';
import { Order } from '@/types';

export default function CustomerInvoicesPage() {
  const { orders, currentUser, settings } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const customerOrders = orders.filter(
    (o) =>
      o.customerId === currentUser?.id ||
      (currentUser?.name && o.customerName.toLowerCase().includes(currentUser.name.toLowerCase()))
  );

  const handleViewInvoice = (order: Order) => {
    setSelectedOrder(order);
    setIsInvoiceOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <AccountNav />
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="border-b border-slate-200 pb-5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tax Invoices</h1>
            <p className="text-xs text-slate-500 mt-1">
              Download and print GST compliant tax invoices with complete HSN summary, SGST/CGST breakdown, and delivery records.
            </p>
          </div>

          {customerOrders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center bg-white space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900">No invoices available</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Invoices are generated automatically as soon as an order is placed on Avani Grocers.
              </p>
              <Link
                href="/shop"
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black tracking-wider text-slate-400">
                    <tr>
                      <th className="py-3.5 px-4">Invoice #</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Tax (GST)</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {customerOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {ord.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {formatDateTime(ord.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 capitalize">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                            {ord.orderType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900 tabular-nums">
                          {formatCurrency(ord.grandTotal, settings.currency)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-500 tabular-nums">
                          {formatCurrency(ord.taxAmount, settings.currency)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              ord.paymentStatus === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleViewInvoice(ord)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 text-xs font-bold transition shadow-2xs"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View Bill</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {isInvoiceOpen && selectedOrder && (
        <InvoiceModal
          order={selectedOrder}
          isOpen={isInvoiceOpen}
          onClose={() => {
            setIsInvoiceOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}
