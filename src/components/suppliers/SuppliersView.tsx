'use client';

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Truck,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  Receipt,
  FileCheck,
  X,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Supplier, PurchaseOrder, PurchaseItem } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export const SuppliersView: React.FC<{ defaultTab?: 'suppliers' | 'purchases' }> = ({
  defaultTab = 'purchases',
}) => {
  const {
    suppliers,
    purchases,
    products,
    addSupplier,
    createPurchaseOrder,
    receivePurchaseOrder,
    settings,
    currentUser,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'suppliers' | 'purchases'>(defaultTab);

  // Supplier modal
  const [isSupModalOpen, setIsSupModalOpen] = useState(false);
  const [supName, setSupName] = useState('');
  const [supPerson, setSupPerson] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supGstin, setSupGstin] = useState('');
  const [supCategory, setSupCategory] = useState('');

  // Purchase Order Creation modal
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    suppliers[0]?.id || ''
  );
  const [invoiceRef, setInvoiceRef] = useState(`REF-${Date.now().toString().slice(-5)}`);
  const [poItems, setPoItems] = useState<PurchaseItem[]>([
    {
      productId: products[0]?.id || '',
      productName: products[0]?.name || '',
      sku: products[0]?.sku || '',
      unit: products[0]?.unit || 'kg',
      quantity: 50,
      unitPrice: products[0]?.purchasePrice || 30,
      taxRate: products[0]?.taxRate || 5,
      total: (products[0]?.purchasePrice || 30) * 50,
    },
  ]);

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;

    addSupplier({
      name: supName.trim(),
      contactPerson: supPerson.trim(),
      phone: supPhone.trim(),
      email: supEmail.trim(),
      address: supAddress.trim(),
      gstin: supGstin.trim(),
      category: supCategory.trim() || 'General Grocery',
      status: 'active',
    });

    setIsSupModalOpen(false);
    setSupName('');
    setSupPerson('');
    setSupPhone('');
    setSupEmail('');
    setSupAddress('');
    setSupGstin('');
    setSupCategory('');
  };

  const handleAddPoItem = () => {
    const prod = products[0];
    if (!prod) return;
    setPoItems([
      ...poItems,
      {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        unit: prod.unit,
        quantity: 20,
        unitPrice: prod.purchasePrice,
        taxRate: prod.taxRate,
        total: prod.purchasePrice * 20,
      },
    ]);
  };

  const handleUpdatePoItem = (index: number, updates: Partial<PurchaseItem>) => {
    setPoItems(
      poItems.map((item, i) => {
        if (i === index) {
          const next = { ...item, ...updates };
          next.total = next.quantity * next.unitPrice;
          return next;
        }
        return item;
      })
    );
  };

  const handleRemovePoItem = (index: number) => {
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];
    if (!sup || poItems.length === 0) return;

    const subtotal = poItems.reduce((acc, i) => acc + i.total, 0);
    const taxTotal = poItems.reduce((acc, i) => acc + (i.total * i.taxRate) / 100, 0);
    const grandTotal = Math.round((subtotal + taxTotal) * 100) / 100;

    createPurchaseOrder({
      purchaseNumber: `PO-${Date.now().toString().slice(-6)}`,
      supplierId: sup.id,
      supplierName: sup.name,
      invoiceReference: invoiceRef,
      purchaseDate: new Date().toISOString().slice(0, 10),
      items: poItems,
      subtotal,
      taxTotal,
      grandTotal,
      paymentStatus: 'paid',
    });

    setIsPoModalOpen(false);
  };

  // Close modals on Escape key & lock body scroll
  React.useEffect(() => {
    if (!isSupModalOpen && !isPoModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSupModalOpen(false);
        setIsPoModalOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSupModalOpen, isPoModalOpen]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-emerald-600" />
            <span>Suppliers & Purchase Restocking</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Procure stock from distributors, manage vendor GSTINs, and record incoming inventory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex rounded-xl border border-slate-200 bg-white p-1">
            <button
              onClick={() => setActiveTab('purchases')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                activeTab === 'purchases'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Truck className="h-3.5 w-3.5" />
              <span>Purchase Orders ({purchases.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                activeTab === 'suppliers'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Vendors ({suppliers.length})</span>
            </button>
          </div>

          {activeTab === 'purchases' ? (
            <button
              onClick={() => setIsPoModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create Purchase PO</span>
            </button>
          ) : (
            <button
              onClick={() => setIsSupModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Supplier</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'purchases' ? (
        /* ========================================================
           PURCHASE ORDERS VIEW
           ======================================================== */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Inbound Restock Orders & Goods Received
              </h3>
              <p className="text-xs text-slate-500">
                Receiving a purchase automatically increments inventory stock count.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {purchases.length} Purchase Invoices
            </span>
          </div>

          {purchases.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Truck className="h-10 w-10 mx-auto text-slate-300 stroke-[1.5] mb-2" />
              <p className="text-sm font-semibold text-slate-700">No purchase orders created yet</p>
              <p className="text-xs text-slate-400">
                Click "+ Create Purchase PO" above to record a new distributor shipment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">PO # & Reference</th>
                    <th className="py-3 px-3">Supplier Name</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3 text-right">Items</th>
                    <th className="py-3 px-3 text-right">Grand Total</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchases.map((po) => {
                    const isReceived = po.status === 'received';
                    return (
                      <tr key={po.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 font-mono">
                            {po.purchaseNumber}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Ref: {po.invoiceReference}
                          </p>
                        </td>

                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {po.supplierName}
                        </td>

                        <td className="py-3 px-3 text-slate-600 font-medium">
                          {formatDate(po.purchaseDate)}
                        </td>

                        <td className="py-3 px-3 text-right font-medium text-slate-700">
                          {po.items.length} products
                        </td>

                        <td className="py-3 px-3 text-right font-black text-slate-900 text-sm">
                          {formatCurrency(po.grandTotal, settings.currency)}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={cn(
                              'inline-block rounded px-2.5 py-0.5 text-[10px] font-bold uppercase',
                              isReceived
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                            )}
                          >
                            {po.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          {isReceived ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Stock Added</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Mark PO #${po.purchaseNumber} as Received? This will automatically increase stock in inventory!`
                                  )
                                ) {
                                  receivePurchaseOrder(po.id);
                                }
                              }}
                              className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                            >
                              Receive Stock ✓
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================
           SUPPLIERS DIRECTORY VIEW
           ======================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      {s.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-0.5">{s.name}</h3>
                  </div>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    Active
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">Contact:</span>{' '}
                    {s.contactPerson}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{s.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{s.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{s.address}</span>
                  </p>
                  <p className="font-mono text-[11px] font-bold text-slate-800 pt-1">
                    GSTIN: {s.gstin}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
                <span className="text-slate-500">Total Supplied:</span>
                <span className="font-black text-slate-900">
                  {formatCurrency(s.totalSupplied, settings.currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Supplier Modal */}
      {isSupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h3 className="font-bold text-slate-900 text-base">Add New Supplier</h3>
              <button
                onClick={() => setIsSupModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSupplier} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Company Name *</label>
                <input
                  type="text"
                  required
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  placeholder="e.g. Gujarat Co-op Milk Marketing"
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Contact Person</label>
                  <input
                    type="text"
                    value={supPerson}
                    onChange={(e) => setSupPerson(e.target.value)}
                    placeholder="Ramesh Patel"
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Phone</label>
                  <input
                    type="tel"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    placeholder="+91 98250 11223"
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Email</label>
                  <input
                    type="email"
                    value={supEmail}
                    onChange={(e) => setSupEmail(e.target.value)}
                    placeholder="orders@supplier.com"
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">GSTIN</label>
                  <input
                    type="text"
                    value={supGstin}
                    onChange={(e) => setSupGstin(e.target.value)}
                    placeholder="24AAACG1234F1Z8"
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs font-mono uppercase focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Supplier Category</label>
                <input
                  type="text"
                  value={supCategory}
                  onChange={(e) => setSupCategory(e.target.value)}
                  placeholder="e.g. Dairy & Frozen Goods"
                  className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Warehouse Address</label>
                <textarea
                  value={supAddress}
                  onChange={(e) => setSupAddress(e.target.value)}
                  placeholder="Industrial Area, Mandi Complex"
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSupModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Purchase Order Modal */}
      {isPoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col my-auto">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h3 className="font-bold text-slate-900 text-base">
                Create Inbound Purchase Order (PO)
              </h3>
              <button
                onClick={() => setIsPoModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePo} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Select Supplier *</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Invoice / PO Reference *</label>
                  <input
                    type="text"
                    required
                    value={invoiceRef}
                    onChange={(e) => setInvoiceRef(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Items List */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                    Products to Procure
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPoItem}
                    className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {poItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-3"
                    >
                      <select
                        value={item.productId}
                        onChange={(e) => {
                          const p = products.find((prod) => prod.id === e.target.value);
                          if (p) {
                            handleUpdatePoItem(idx, {
                              productId: p.id,
                              productName: p.name,
                              sku: p.sku,
                              unit: p.unit,
                              unitPrice: p.purchasePrice,
                              taxRate: p.taxRate,
                            });
                          }
                        }}
                        className="h-8 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium focus:outline-none"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-2">
                        <div className="w-20">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdatePoItem(idx, {
                                quantity: parseFloat(e.target.value) || 1,
                              })
                            }
                            placeholder="Qty"
                            className="h-8 w-full rounded-lg border border-slate-200 px-2 text-center text-xs font-bold focus:outline-none"
                          />
                        </div>
                        <span className="text-slate-500 text-[11px] w-8">{item.unit}</span>

                        <div className="w-24">
                          <input
                            type="number"
                            step="0.1"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleUpdatePoItem(idx, {
                                unitPrice: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="Price"
                            className="h-8 w-full rounded-lg border border-slate-200 px-2 text-right text-xs font-semibold focus:outline-none"
                          />
                        </div>

                        <span className="font-bold text-slate-800 text-xs w-20 text-right">
                          {formatCurrency(item.total, settings.currency)}
                        </span>

                        {poItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePoItem(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-sm font-black">
                <span>Total PO Amount:</span>
                <span className="text-emerald-700 text-base">
                  {formatCurrency(
                    poItems.reduce((acc, i) => acc + i.total, 0),
                    settings.currency
                  )}
                </span>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPoModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700"
                >
                  Generate PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
