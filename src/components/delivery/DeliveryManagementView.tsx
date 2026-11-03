'use client';

import React, { useState } from 'react';
import {
  Bike,
  Clock,
  Store,
  CheckCircle2,
  AlertCircle,
  Truck,
  Phone,
  User,
  Sliders,
  DollarSign,
  Package,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Order, OrderStatus } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

export const DeliveryManagementView: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    assignDeliveryPerson,
    settings,
    updateSettings,
  } = useStore();

  const [deliveryPartnerName, setDeliveryPartnerName] = useState('Manoj Tiwari');
  const [deliveryPartnerPhone, setDeliveryPartnerPhone] = useState('+91 98112 99887');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  const deliveryOrders = orders.filter((o) => o.orderType === 'delivery');
  const takeawayOrders = orders.filter((o) => o.orderType === 'takeaway');

  const pendingDelivery = deliveryOrders.filter(
    (o) => o.status === 'pending' || o.status === 'confirmed' || o.status === 'preparing'
  );
  const outForDelivery = deliveryOrders.filter((o) => o.status === 'out_for_delivery');
  const completedDelivery = deliveryOrders.filter(
    (o) => o.status === 'delivered' || o.status === 'completed'
  );

  const handleQuickAssign = (orderId: string) => {
    if (!deliveryPartnerName || !deliveryPartnerPhone) return;
    assignDeliveryPerson(orderId, deliveryPartnerName, deliveryPartnerPhone);
  };

  const handleModeToggle = (mode: 'inStore' | 'takeaway' | 'delivery') => {
    if (mode === 'inStore') {
      updateSettings({
        operations: {
          ...settings.operations,
          inStoreEnabled: !settings.operations.inStoreEnabled,
        },
      });
    } else if (mode === 'takeaway') {
      updateSettings({
        operations: {
          ...settings.operations,
          takeawayEnabled: !settings.operations.takeawayEnabled,
        },
      });
    } else if (mode === 'delivery') {
      updateSettings({
        operations: {
          ...settings.operations,
          deliveryEnabled: !settings.operations.deliveryEnabled,
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Bike className="h-6 w-6 text-blue-600" />
            <span>Takeaway & Delivery Operations</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure order modes, dispatch couriers, and set estimated customer preparation times.
          </p>
        </div>
      </div>

      {/* Store Order Modes & Operational Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* In-Store Mode */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">In-Store Billing</h3>
                <p className="text-[11px] text-slate-500">Walk-in counter POS</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleModeToggle('inStore')}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                settings.operations.inStoreEnabled ? 'bg-emerald-600' : 'bg-slate-300'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                  settings.operations.inStoreEnabled ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-3">
            Status:{' '}
            <span
              className={cn(
                'font-bold',
                settings.operations.inStoreEnabled ? 'text-emerald-700' : 'text-slate-400'
              )}
            >
              {settings.operations.inStoreEnabled ? 'Accepting Counter Sales' : 'Disabled'}
            </span>
          </p>
        </div>

        {/* Takeaway Mode */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-purple-100 p-2 text-purple-700">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Takeaway Orders</h3>
                <p className="text-[11px] text-slate-500">Self-pickup packaging</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleModeToggle('takeaway')}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                settings.operations.takeawayEnabled ? 'bg-purple-600' : 'bg-slate-300'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                  settings.operations.takeawayEnabled ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">Est. Prep Time:</span>
            <input
              type="text"
              value={settings.operations.estimatedTakeawayTime}
              onChange={(e) =>
                updateSettings({
                  operations: {
                    ...settings.operations,
                    estimatedTakeawayTime: e.target.value,
                  },
                })
              }
              className="w-28 rounded-lg border border-slate-200 px-2 py-1 text-right text-xs font-semibold focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Delivery Mode */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
                <Bike className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Home Delivery</h3>
                <p className="text-[11px] text-slate-500">Doorstep delivery fleet</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleModeToggle('delivery')}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                settings.operations.deliveryEnabled ? 'bg-blue-600' : 'bg-slate-300'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                  settings.operations.deliveryEnabled ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">Est. Delivery Time:</span>
            <input
              type="text"
              value={settings.operations.estimatedDeliveryTime}
              onChange={(e) =>
                updateSettings({
                  operations: {
                    ...settings.operations,
                    estimatedDeliveryTime: e.target.value,
                  },
                })
              }
              className="w-28 rounded-lg border border-slate-200 px-2 py-1 text-right text-xs font-semibold focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Quick Dispatch & Partner Assignment Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="h-4 w-4 text-blue-600" />
          <span>Manual Delivery Partner Assignment</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5 mb-4">
          Quickly designate a courier or local rider to an awaiting delivery order.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-600">Select Order</label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Choose Order to Assign --</option>
              {deliveryOrders
                .filter((o) => o.status !== 'completed' && o.status !== 'refunded')
                .map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.invoiceNumber} — {o.customerName} ({o.items.length} items)
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600">
              Delivery Partner Name
            </label>
            <input
              type="text"
              value={deliveryPartnerName}
              onChange={(e) => setDeliveryPartnerName(e.target.value)}
              placeholder="e.g. Manoj Tiwari"
              className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600">Contact Number</label>
            <input
              type="tel"
              value={deliveryPartnerPhone}
              onChange={(e) => setDeliveryPartnerPhone(e.target.value)}
              placeholder="+91 98112 99887"
              className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              disabled={!selectedOrderId}
              onClick={() => handleQuickAssign(selectedOrderId)}
              className="h-9 w-full rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Assign & Dispatch
            </button>
          </div>
        </div>
      </div>

      {/* Live Dispatch Kanban / Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Stage 1: Preparing / Awaiting Dispatch */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Preparing for Dispatch ({pendingDelivery.length})
              </h4>
            </div>
          </div>

          <div className="mt-3 space-y-2.5 flex-1 overflow-y-auto max-h-96">
            {pendingDelivery.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">No orders in prep.</p>
            ) : (
              pendingDelivery.map((o) => (
                <div
                  key={o.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs space-y-1.5 shadow-xs"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 font-mono">
                      {o.invoiceNumber}
                    </span>
                    <span className="font-extrabold text-emerald-700 tabular-nums">
                      {formatCurrency(o.grandTotal, settings.currency)}
                    </span>
                  </div>
                  <p className="font-medium text-slate-800">{o.customerName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{o.customerAddress}</p>
                  <div className="pt-2 flex justify-between items-center border-t border-slate-200">
                    <span className="text-[10px] text-slate-400">
                      {o.deliveryPerson ? o.deliveryPerson.name : 'Unassigned'}
                    </span>
                    <button
                      onClick={() => updateOrderStatus(o.id, 'out_for_delivery')}
                      className="rounded bg-blue-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-blue-700"
                    >
                      Dispatch Now →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stage 2: Out for Delivery */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/30 p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
              <h4 className="font-bold text-xs text-blue-900 uppercase tracking-wider">
                Out for Delivery ({outForDelivery.length})
              </h4>
            </div>
          </div>

          <div className="mt-3 space-y-2.5 flex-1 overflow-y-auto max-h-96">
            {outForDelivery.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">No active couriers en route.</p>
            ) : (
              outForDelivery.map((o) => (
                <div
                  key={o.id}
                  className="rounded-xl border border-blue-200 bg-white p-3 text-xs space-y-1.5 shadow-xs"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 font-mono">
                      {o.invoiceNumber}
                    </span>
                    <span className="font-extrabold text-emerald-700 tabular-nums">
                      {formatCurrency(o.grandTotal, settings.currency)}
                    </span>
                  </div>
                  <p className="font-medium text-slate-800">{o.customerName}</p>
                  <div className="rounded-lg bg-blue-50 p-2 text-[11px] text-blue-900 font-medium">
                    Rider: {o.deliveryPerson?.name} ({o.deliveryPerson?.phone})
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => updateOrderStatus(o.id, 'delivered')}
                      className="rounded bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-700 shadow-xs"
                    >
                      Mark as Delivered ✓
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stage 3: Delivered Today */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Delivered / Closed ({completedDelivery.length})
              </h4>
            </div>
          </div>

          <div className="mt-3 space-y-2.5 flex-1 overflow-y-auto max-h-96">
            {completedDelivery.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">No deliveries finalized yet.</p>
            ) : (
              completedDelivery.map((o) => (
                <div
                  key={o.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-xs space-y-1"
                >
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900 font-mono">{o.invoiceNumber}</span>
                    <span className="font-bold text-emerald-700 tabular-nums">
                      {formatCurrency(o.grandTotal, settings.currency)}
                    </span>
                  </div>
                  <p className="text-slate-600">{o.customerName}</p>
                  <p className="text-[10px] text-slate-400">
                    Delivered at {formatDateTime(o.completedAt || o.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
