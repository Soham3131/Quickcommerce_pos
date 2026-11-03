'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Package, Truck, Printer, Clock, ArrowRight, ShoppingBag } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { AccountNav } from '@/components/account/AccountNav';
import { formatCurrency } from '@/lib/currency';
import { formatDateTime } from '@/lib/utils';
import { InvoiceModal } from '@/components/billing/InvoiceModal';
import { Order } from '@/types';

export default function MyOrdersPage() {
  const { orders, currentUser, settings } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const customerOrders = orders.filter(
    (o) =>
      o.customerId === currentUser?.id ||
      (currentUser?.name && o.customerName.toLowerCase().includes(currentUser.name.toLowerCase()))
  );

  const handlePrintInvoice = (order: Order) => {
    setSelectedOrder(order);
    setInvoiceModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <AccountNav />
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Grocery Orders</h1>
            <p className="text-xs text-slate-500 mt-1">
              Review fulfillment history, live tracking status, and official GST tax invoices.
            </p>
          </div>

          {customerOrders.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
              <Package className="h-12 w-12 mx-auto text-slate-300 stroke-[1.5]" />
              <h3 className="font-bold text-base text-slate-800">No grocery orders placed yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Discover our fresh supermarket produce and daily essentials catalog.
              </p>
              <Link
                href="/shop"
                className="inline-flex rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                Browse All Groceries
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {customerOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Invoice #
                        </span>
                        <p className="font-mono text-sm font-black text-slate-900">
                          {ord.invoiceNumber}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
                          ord.status === 'delivered' || ord.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'cancelled' || ord.status === 'refunded'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ord.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="sm:text-right text-xs text-slate-500">
                      <span>Placed on {formatDateTime(ord.createdAt)}</span>
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {ord.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-800 truncate max-w-[190px]">
                          {item.productName}
                        </span>
                        <span className="font-bold text-slate-900 tabular-nums shrink-0">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer Actions & Total */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-slate-400">Total Billed: </span>
                      <span className="text-base font-black text-emerald-700 tabular-nums">
                        {formatCurrency(ord.grandTotal, settings.currency)}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-2">
                        ({ord.paymentMethod.toUpperCase()} · {ord.paymentStatus.toUpperCase()})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handlePrintInvoice(ord)}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>GST Invoice</span>
                      </button>

                      <Link
                        href={`/track-order/${ord.id}`}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 font-bold shadow-xs transition"
                      >
                        <Truck className="h-3.5 w-3.5" />
                        <span>Live Status →</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <InvoiceModal
          isOpen={invoiceModalOpen}
          onClose={() => {
            setInvoiceModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      )}
    </div>
  );
}
