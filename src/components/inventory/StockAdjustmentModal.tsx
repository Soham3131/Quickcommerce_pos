'use client';

import React, { useState } from 'react';
import { X, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Product, StockAdjustment } from '@/types';
import { useStore } from '@/store/useStore';

export const StockAdjustmentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}> = ({ isOpen, onClose, product: initialProduct }) => {
  const { products, adjustStock, currentUser } = useStore();

  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProduct?.id || products[0]?.id || ''
  );
  const [adjustmentType, setAdjustmentType] = useState<StockAdjustment['type']>('add');
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState<string>('Routine restock shipment received');
  const [referenceInvoice, setReferenceInvoice] = useState<string>('');

  // Close on Escape key & lock body scroll
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentProduct =
    products.find((p) => p.id === (initialProduct?.id || selectedProductId)) || products[0];

  if (!currentProduct) return null;

  // Calculate projected stock
  let projectedStock = currentProduct.currentStock;
  if (adjustmentType === 'add') {
    projectedStock = currentProduct.currentStock + quantity;
  } else if (
    adjustmentType === 'remove' ||
    adjustmentType === 'damage' ||
    adjustmentType === 'expiry'
  ) {
    projectedStock = Math.max(0, currentProduct.currentStock - quantity);
  } else if (adjustmentType === 'correction') {
    projectedStock = quantity;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0 && adjustmentType !== 'correction') return;

    adjustStock({
      productId: currentProduct.id,
      productName: currentProduct.name,
      sku: currentProduct.sku,
      type: adjustmentType,
      quantity,
      reason,
      referenceInvoice: referenceInvoice.trim() || undefined,
      adjustedBy: currentUser?.name || 'Admin',
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-scale-up max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 sm:px-6 py-4 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">Adjust Inventory Stock</h3>
            <p className="text-xs text-slate-500">
              Record restocking, damage, expired goods, or count correction.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 touch-target"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Product Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700">Select Product</label>
            <select
              value={currentProduct.id}
              disabled={!!initialProduct}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Current Stock: {p.currentStock} {p.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Adjustment Type Pills */}
          <div>
            <label className="text-xs font-semibold text-slate-700">Adjustment Reason Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
              {[
                { type: 'add', label: 'Add Stock (+)' },
                { type: 'damage', label: 'Damaged Goods (-)' },
                { type: 'expiry', label: 'Expired Stock (-)' },
                { type: 'remove', label: 'Manual Deduction (-)' },
                { type: 'correction', label: 'Count Reconcile' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setAdjustmentType(item.type as StockAdjustment['type'])}
                  className={`rounded-xl py-2 px-2 text-xs font-semibold transition border text-center touch-target ${
                    adjustmentType === item.type
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Unit */}
          <div>
            <label className="text-xs font-semibold text-slate-700">
              {adjustmentType === 'correction' ? 'New Reconciled Stock Quantity' : 'Quantity to Adjust'}{' '}
              ({currentProduct.unit})
            </label>
            <div className="mt-1 flex rounded-xl border border-slate-200 bg-white overflow-hidden">
              <input
                type="number"
                step={currentProduct.isWeighed ? '0.25' : '1'}
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="h-10 flex-1 px-3 text-sm font-bold text-slate-900 focus:outline-none"
              />
              <span className="flex items-center px-4 bg-slate-50 border-l border-slate-200 text-xs font-semibold text-slate-600">
                {currentProduct.unit}
              </span>
            </div>
          </div>

          {/* Detailed Reason Field */}
          <div>
            <label className="text-xs font-semibold text-slate-700">Reason / Notes</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Received weekly distributor batch #402"
              className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Purchase / Invoice Reference */}
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Invoice / PO Reference (Optional)
            </label>
            <input
              type="text"
              value={referenceInvoice}
              onChange={(e) => setReferenceInvoice(e.target.value)}
              placeholder="e.g. PO-8921 or INV-AMUL-99"
              className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Projected Stock Preview Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex items-center justify-between text-xs">
            <div>
              <p className="text-slate-500">Current In-Stock:</p>
              <p className="text-sm font-bold text-slate-800">
                {currentProduct.currentStock} {currentProduct.unit}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400" />
            <div className="text-right">
              <p className="text-slate-500">Projected Stock:</p>
              <p
                className={`text-sm font-extrabold ${
                  projectedStock <= currentProduct.minStock
                    ? 'text-amber-600'
                    : 'text-emerald-700'
                }`}
              >
                {projectedStock} {currentProduct.unit}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
            >
              Confirm Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
