'use client';

import React, { useState } from 'react';
import {
  ReceiptText,
  Search,
  Filter,
  Eye,
  Printer,
  RotateCcw,
  UserCheck,
  Bike,
  Store,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Truck,
  ChevronDown,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Order, OrderStatus, OrderType } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { formatDateTime, formatDate } from '@/lib/utils';
import { InvoiceModal } from '@/components/billing/InvoiceModal';
import { cn } from '@/lib/utils';

export const OrdersView: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    assignDeliveryPerson,
    processRefund,
    settings,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | OrderType>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Selected Order for Details View
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Delivery assignment modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);
  const [deliveryPartnerName, setDeliveryPartnerName] = useState('Manoj Tiwari');
  const [deliveryPartnerPhone, setDeliveryPartnerPhone] = useState('+91 98112 99887');

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery);

    const matchesType = selectedType === 'all' || o.orderType === selectedType;
    const matchesStatus = selectedStatus === 'all' || o.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOpenAssign = (order: Order) => {
    setAssigningOrder(order);
    if (order.deliveryPerson) {
      setDeliveryPartnerName(order.deliveryPerson.name);
      setDeliveryPartnerPhone(order.deliveryPerson.phone);
    }
    setAssignModalOpen(true);
  };

  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningOrder) return;
    assignDeliveryPerson(assigningOrder.id, deliveryPartnerName, deliveryPartnerPhone);
    setAssignModalOpen(false);
  };

  const handleViewInvoice = (order: Order) => {
    setInvoiceOrder(order);
    setIsInvoiceOpen(true);
  };

  const handleCancelRefund = (order: Order) => {
    if (
      confirm(
        `Are you sure you want to cancel / refund Invoice #${order.invoiceNumber}? Stock will be automatically restored to inventory!`
      )
    ) {
      processRefund(order.id, 'Customer cancellation');
      if (activeOrder?.id === order.id) {
        setActiveOrder({ ...activeOrder, status: 'refunded', paymentStatus: 'refunded' });
      }
    }
  };

  // Close modals on Escape key & lock body scroll
  React.useEffect(() => {
    if (!activeOrder && !assignModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveOrder(null);
        setAssignModalOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeOrder, assignModalOpen]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <ReceiptText className="h-6 w-6 text-emerald-600" />
            <span>Order Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track In-Store receipts, Takeaway pickups, and Delivery dispatches in real time.
          </p>
        </div>

        {/* Order Type Tabs */}
        <div className="flex rounded-xl border border-slate-200 bg-white p-1">
          <button
            onClick={() => setSelectedType('all')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
              selectedType === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setSelectedType('in-store')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
              selectedType === 'in-store'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            In-Store
          </button>
          <button
            onClick={() => setSelectedType('takeaway')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
              selectedType === 'takeaway'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Takeaway
          </button>
          <button
            onClick={() => setSelectedType('delivery')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
              selectedType === 'delivery'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Delivery
          </button>
        </div>
      </div>

      {/* Orders Filter & Data Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Search & Status Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-1 items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by invoice #, customer name, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready for Pickup</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Invoice # & Date</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-2">Type</th>
                <th className="py-3 px-3 text-right">Items & Amount</th>
                <th className="py-3 px-2 text-center">Payment</th>
                <th className="py-3 px-3 text-center">Order Status</th>
                <th className="py-3 px-3">Delivery Partner</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isCancelled = ord.status === 'cancelled' || ord.status === 'refunded';

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 font-mono">
                          {ord.invoiceNumber}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatDateTime(ord.createdAt)}
                        </p>
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-800">{ord.customerName}</p>
                        <p className="text-[11px] text-slate-400">{ord.customerPhone}</p>
                      </td>

                      <td className="py-3 px-2">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase',
                            ord.orderType === 'in-store'
                              ? 'bg-slate-100 text-slate-700'
                              : ord.orderType === 'takeaway'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          )}
                        >
                          {ord.orderType}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <p className="font-black text-slate-900 text-sm">
                          {formatCurrency(ord.grandTotal, settings.currency)}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {ord.items.length} items
                        </p>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <span
                          className={cn(
                            'inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase',
                            ord.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.paymentStatus === 'refunded'
                              ? 'bg-slate-200 text-slate-700 line-through'
                              : 'bg-amber-100 text-amber-800'
                          )}
                        >
                          {ord.paymentStatus}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={cn(
                            'inline-block rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide',
                            ord.status === 'completed' || ord.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'out_for_delivery'
                              ? 'bg-blue-100 text-blue-800 animate-pulse'
                              : ord.status === 'preparing' || ord.status === 'ready'
                              ? 'bg-amber-100 text-amber-800'
                              : ord.status === 'cancelled' || ord.status === 'refunded'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-700'
                          )}
                        >
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-700">
                        {ord.orderType === 'delivery' ? (
                          ord.deliveryPerson ? (
                            <div>
                              <p className="font-semibold text-slate-800">
                                {ord.deliveryPerson.name}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {ord.deliveryPerson.phone}
                              </p>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenAssign(ord)}
                              className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700 hover:bg-blue-100"
                            >
                              + Assign Partner
                            </button>
                          )
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setActiveOrder(ord)}
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100"
                            title="View Order Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleViewInvoice(ord)}
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                            title="Print Invoice"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                          {!isCancelled && (
                            <button
                              type="button"
                              onClick={() => handleCancelRefund(ord)}
                              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              title="Cancel & Refund (Restores Stock)"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Order Details — {activeOrder.invoiceNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  {formatDateTime(activeOrder.createdAt)} · Cashier: {activeOrder.cashierName}
                </p>
              </div>
              <button
                onClick={() => setActiveOrder(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Order Status Controller */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-xl bg-slate-50 p-4 border border-slate-200">
                <div>
                  <span className="text-slate-500 font-medium">Current Status:</span>
                  <p className="text-sm font-black text-slate-900 uppercase">
                    {activeOrder.status.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={activeOrder.status}
                    onChange={(e) => {
                      const next = e.target.value as OrderStatus;
                      updateOrderStatus(activeOrder.id, next);
                      setActiveOrder({ ...activeOrder, status: next });
                    }}
                    className="h-8 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready for Pickup</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>

                  {activeOrder.orderType === 'delivery' && (
                    <button
                      onClick={() => handleOpenAssign(activeOrder)}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                    >
                      {activeOrder.deliveryPerson ? 'Change Driver' : 'Assign Driver'}
                    </button>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  Order Line Items
                </h4>
                <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{item.productName}</p>
                        <p className="text-[11px] text-slate-400">
                          {item.quantity} {item.unit} @{' '}
                          {formatCurrency(item.unitPrice, settings.currency)} · GST: {item.taxRate}%
                        </p>
                      </div>
                      <p className="font-bold text-slate-900 text-sm">
                        {formatCurrency(item.total, settings.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(activeOrder.subtotal, settings.currency)}</span>
                </div>
                {activeOrder.orderDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount:</span>
                    <span>-{formatCurrency(activeOrder.orderDiscount, settings.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({settings.tax.name}):</span>
                  <span>{formatCurrency(activeOrder.taxAmount, settings.currency)}</span>
                </div>
                {activeOrder.deliveryCharge > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Charge:</span>
                    <span>{formatCurrency(activeOrder.deliveryCharge, settings.currency)}</span>
                  </div>
                )}
                <div className="border-t border-slate-300 pt-1.5 flex justify-between font-black text-sm text-slate-900">
                  <span>Grand Total:</span>
                  <span className="text-emerald-700">
                    {formatCurrency(activeOrder.grandTotal, settings.currency)}
                  </span>
                </div>
              </div>

              {/* Delivery History if exists */}
              {activeOrder.deliveryHistory && activeOrder.deliveryHistory.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                    Delivery Partner Log
                  </h4>
                  <div className="space-y-1.5 rounded-xl border border-slate-200 p-3 bg-slate-50">
                    {activeOrder.deliveryHistory.map((h, i) => (
                      <div key={i} className="text-[11px] flex justify-between text-slate-600">
                        <span>
                          <span className="font-bold text-slate-900">{h.action}:</span>{' '}
                          {h.details}
                        </span>
                        <span className="text-slate-400 font-mono">
                          {formatDateTime(h.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 bg-slate-50 p-4 flex justify-between">
              <button
                onClick={() => handleCancelRefund(activeOrder)}
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
              >
                Cancel / Refund Order
              </button>
              <button
                onClick={() => {
                  handleViewInvoice(activeOrder);
                  setActiveOrder(null);
                }}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Assignment Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Bike className="h-5 w-5 text-blue-600" />
              <span>Assign Delivery Partner</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter delivery person details for Order #{assigningOrder?.invoiceNumber}.
            </p>
            <form onSubmit={handleConfirmAssign} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Delivery Partner Name</label>
                <input
                  type="text"
                  required
                  value={deliveryPartnerName}
                  onChange={(e) => setDeliveryPartnerName(e.target.value)}
                  placeholder="e.g. Manoj Tiwari"
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={deliveryPartnerPhone}
                  onChange={(e) => setDeliveryPartnerPhone(e.target.value)}
                  placeholder="+91 98112 99887"
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Assign Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        order={invoiceOrder}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </div>
  );
};
