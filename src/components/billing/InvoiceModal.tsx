'use client';

import React, { useState } from 'react';
import {
  Printer,
  Download,
  Share2,
  CheckCircle2,
  Receipt,
  FileText,
  X,
  Store,
  Sparkles,
} from 'lucide-react';
import { Order } from '@/types';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/lib/currency';
import { formatDateTime, generateBarcodeSvg } from '@/lib/utils';

export const InvoiceModal: React.FC<{
  order: Order | null;
  isOpen?: boolean;
  onClose: () => void;
  onNewSale?: () => void;
  settings?: any;
}> = ({ order, isOpen = true, onClose, onNewSale }) => {
  const { settings } = useStore();
  const [activeTab, setActiveTab] = useState<'a4' | 'thermal'>('a4');
  const [copiedShare, setCopiedShare] = useState(false);

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

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(
      `Avani Grocers - Invoice #${order.invoiceNumber}\nCustomer: ${order.customerName}\nTotal: ${formatCurrency(order.grandTotal, settings.currency)}\nThank you for shopping with us!`
    );
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[94vh] animate-scale-up border border-slate-200">
        {/* Modal Top Bar */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-3.5 bg-slate-50/90 rounded-t-2xl gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Bill Generated
                  </h3>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-emerald-800 tabular-nums">
                    {order.invoiceNumber}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {order.paymentMethod.toUpperCase()} · {formatDateTime(order.createdAt)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition sm:hidden touch-target"
              aria-label="Close invoice preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            {/* Tab switch between A4 and Thermal 80mm */}
            <div className="flex rounded-xl border border-slate-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setActiveTab('a4')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition touch-target ${
                  activeTab === 'a4'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span>A4 Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('thermal')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition touch-target ${
                  activeTab === 'thermal'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Receipt className="h-3.5 w-3.5 shrink-0" />
                <span>Thermal 80mm</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="hidden sm:flex rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              aria-label="Close invoice preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body (Scrollable & Printable) */}
        <div className="flex-1 overflow-y-auto p-6" id="printable-invoice">
          {activeTab === 'a4' ? (
            /* ========================================================
               A4 TAX INVOICE FORMAT
               ======================================================== */
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-800 shadow-sm print:border-none print:p-0 print:shadow-none">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <div className="flex items-center gap-3">
                    {settings.showLogoOnInvoice && (
                      <img
                        src="/logo.png"
                        alt={settings.companyName || 'Avani Grocers'}
                        className="h-12 w-auto max-w-[170px] object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('#invoice-logo-fallback') as HTMLElement | null;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    )}
                    <div className={cn("items-center gap-2", settings.showLogoOnInvoice ? "hidden" : "flex")} id="invoice-logo-fallback">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
                        <Store className="h-6 w-6" />
                      </div>
                      <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">
                          {settings.companyName}
                        </h1>
                        <p className="text-xs text-slate-500">{settings.tagline}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-slate-600 space-y-0.5">
                    <p>{settings.address}</p>
                    <p>
                      {settings.city}, {settings.state} - {settings.pincode}
                    </p>
                    <p>Phone: {settings.phone} · Email: {settings.email}</p>
                    <p className="font-semibold text-slate-900">
                      GSTIN: {settings.gstin}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block rounded-md bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold tracking-wider text-emerald-800 uppercase">
                    Tax Invoice
                  </span>
                  <div className="mt-3 text-xs space-y-1">
                    <p>
                      <span className="text-slate-400">Invoice No:</span>{' '}
                      <span className="font-bold text-slate-900">{order.invoiceNumber}</span>
                    </p>
                    <p>
                      <span className="text-slate-400">Date & Time:</span>{' '}
                      <span className="font-medium text-slate-800">
                        {formatDateTime(order.createdAt)}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-400">Cashier:</span>{' '}
                      <span className="font-medium text-slate-800">{order.cashierName}</span>
                    </p>
                    <p>
                      <span className="text-slate-400">Order Mode:</span>{' '}
                      <span className="font-semibold text-emerald-700 uppercase">
                        {order.orderType}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Bill To Customer Section */}
              <div className="mt-5 rounded-lg bg-slate-50 p-4 border border-slate-100 flex justify-between items-start text-xs">
                <div>
                  <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Billed To:
                  </p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {order.customerName}
                  </p>
                  <p className="text-slate-600">Phone: {order.customerPhone}</p>
                  {order.customerAddress && (
                    <p className="text-slate-600 max-w-xs">{order.customerAddress}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Payment Status:</p>
                  <span className="inline-block mt-0.5 rounded bg-emerald-100 px-2 py-0.5 font-bold uppercase text-emerald-800">
                    {order.paymentStatus} via {order.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-2">HSN</th>
                      <th className="py-2.5 px-2 text-center">Unit</th>
                      <th className="py-2.5 px-2 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate</th>
                      <th className="py-2.5 px-3 text-right">Disc</th>
                      <th className="py-2.5 px-2 text-right">GST %</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-slate-900">{item.productName}</p>
                          <p className="text-[10px] text-slate-400">SKU: {item.sku}</p>
                        </td>
                        <td className="py-2.5 px-2 text-slate-500 font-mono text-[11px]">
                          080390
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-600">
                          {item.unit}
                        </td>
                        <td className="py-2.5 px-2 text-right font-semibold text-slate-800">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">
                          {formatCurrency(item.unitPrice, settings.currency)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500">
                          {item.discount > 0
                            ? `-${formatCurrency(item.discount, settings.currency)}`
                            : '—'}
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-600 font-medium">
                          {item.taxRate}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {formatCurrency(item.total, settings.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & Tax Breakdown */}
              <div className="mt-6 flex flex-col sm:flex-row justify-between gap-6 items-start">
                {/* GST Breakdown Table */}
                <div className="w-full sm:w-1/2 rounded-lg border border-slate-200 p-3 bg-slate-50/50 text-[11px]">
                  <p className="font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Tax Breakdown ({settings.tax.name})
                  </p>
                  <table className="w-full text-right">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 pb-1">
                        <th className="text-left font-medium">Rate</th>
                        <th className="font-medium">Taxable</th>
                        <th className="font-medium">CGST</th>
                        <th className="font-medium">SGST</th>
                        <th className="font-medium">Total Tax</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {order.taxBreakdown.map((tb, idx) => (
                        <tr key={idx} className="py-1">
                          <td className="text-left font-semibold py-1">{tb.rate}%</td>
                          <td className="py-1">
                            {formatCurrency(tb.taxable, settings.currency)}
                          </td>
                          <td className="py-1">
                            {formatCurrency(tb.tax / 2, settings.currency)}
                          </td>
                          <td className="py-1">
                            {formatCurrency(tb.tax / 2, settings.currency)}
                          </td>
                          <td className="font-semibold text-slate-800 py-1">
                            {formatCurrency(tb.tax, settings.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calculation Summary */}
                <div className="w-full sm:w-5/12 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Items Subtotal:</span>
                    <span>{formatCurrency(order.subtotal, settings.currency)}</span>
                  </div>
                  {order.orderDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Order Discount:</span>
                      <span>-{formatCurrency(order.orderDiscount, settings.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Value:</span>
                    <span>{formatCurrency(order.taxableAmount, settings.currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total Tax ({settings.tax.name}):</span>
                    <span>{formatCurrency(order.taxAmount, settings.currency)}</span>
                  </div>
                  {order.deliveryCharge > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Delivery Charge:</span>
                      <span>{formatCurrency(order.deliveryCharge, settings.currency)}</span>
                    </div>
                  )}

                  <div className="border-t-2 border-slate-900 pt-2 flex justify-between items-baseline">
                    <span className="text-sm font-extrabold text-slate-900">Grand Total:</span>
                    <span className="text-lg font-black text-emerald-700">
                      {formatCurrency(order.grandTotal, settings.currency)}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-1.5 flex justify-between text-slate-600 text-[11px]">
                    <span>Amount Paid ({order.paymentMethod.toUpperCase()}):</span>
                    <span className="font-semibold">
                      {formatCurrency(order.amountPaid, settings.currency)}
                    </span>
                  </div>
                  {order.changeDue > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold text-[11px]">
                      <span>Change Returned:</span>
                      <span>{formatCurrency(order.changeDue, settings.currency)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Terms & Footer Note */}
              <div className="mt-8 border-t border-slate-200 pt-4 text-[11px] text-slate-500">
                <p className="font-semibold text-slate-700">Terms & Conditions:</p>
                <p className="whitespace-pre-line mt-1">{settings.termsAndConditions}</p>
                <div className="mt-4 text-center border-t border-slate-100 pt-3">
                  <p className="font-medium text-slate-700">{settings.invoiceFooter}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    This is a computer generated invoice. No signature required.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================
               80mm THERMAL RECEIPT FORMAT (Compact Authentic POS Bill)
               ======================================================== */
            <div className="mx-auto max-w-sm rounded-lg border border-slate-300 bg-white p-6 font-mono text-[12px] leading-tight text-slate-800 shadow-sm">
              <div className="text-center space-y-1">
                {settings.showLogoOnInvoice && (
                  <div className="flex justify-center mb-1.5">
                    <img
                      src="/logo.png"
                      alt={settings.companyName}
                      className="h-10 w-auto max-w-[140px] object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <p className="font-black text-sm uppercase tracking-wider">
                  *** {settings.companyName} ***
                </p>
                <p className="text-[11px] text-slate-600">{settings.address}</p>
                <p className="text-[11px] text-slate-600">
                  {settings.city} · Ph: {settings.phone}
                </p>
                <p className="text-[11px] font-bold">GSTIN: {settings.gstin}</p>
              </div>

              <div className="my-2 border-b border-dashed border-slate-400" />

              <div className="text-[11px] space-y-0.5">
                <div className="flex justify-between">
                  <span>BILL NO: {order.invoiceNumber}</span>
                  <span>MODE: {order.orderType.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE: {formatDateTime(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CUST: {order.customerName}</span>
                  <span>CASHIER: {order.cashierName.split(' ')[0]}</span>
                </div>
              </div>

              <div className="my-2 border-b border-dashed border-slate-400" />

              {/* Items in thermal format */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-[11px]">
                  <span>ITEM</span>
                  <span>QTY x RATE</span>
                  <span>TOTAL</span>
                </div>
                {order.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <p className="truncate font-medium">{item.productName}</p>
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>
                        {item.quantity} {item.unit} x{' '}
                        {formatCurrency(item.unitPrice, settings.currency)}
                      </span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(item.total, settings.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="my-2 border-b border-dashed border-slate-400" />

              {/* Calculations */}
              <div className="space-y-1 text-right text-[11px]">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>{formatCurrency(order.subtotal, settings.currency)}</span>
                </div>
                {order.orderDiscount > 0 && (
                  <div className="flex justify-between font-bold">
                    <span>DISCOUNT:</span>
                    <span>-{formatCurrency(order.orderDiscount, settings.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>TOTAL TAX (GST):</span>
                  <span>{formatCurrency(order.taxAmount, settings.currency)}</span>
                </div>
                {order.deliveryCharge > 0 && (
                  <div className="flex justify-between">
                    <span>DELIVERY:</span>
                    <span>{formatCurrency(order.deliveryCharge, settings.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black border-t border-b border-slate-900 py-1 my-1">
                  <span>GRAND TOTAL:</span>
                  <span>{formatCurrency(order.grandTotal, settings.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PAID ({order.paymentMethod.toUpperCase()}):</span>
                  <span>{formatCurrency(order.amountPaid, settings.currency)}</span>
                </div>
                {order.changeDue > 0 && (
                  <div className="flex justify-between font-bold">
                    <span>CHANGE DUE:</span>
                    <span>{formatCurrency(order.changeDue, settings.currency)}</span>
                  </div>
                )}
              </div>

              <div className="my-3 border-b border-dashed border-slate-400" />

              {/* Barcode Simulator and Thank you note */}
              <div className="text-center space-y-2">
                <div
                  className="flex justify-center"
                  dangerouslySetInnerHTML={{
                    __html: `<svg width="180" height="35" viewBox="0 0 180 35">${generateBarcodeSvg(
                      order.invoiceNumber
                    )}</svg>`,
                  }}
                />
                <p className="text-[10px] tracking-widest">{order.invoiceNumber}</p>
                <p className="text-xs font-bold uppercase mt-2">
                  *** THANK YOU! VISIT AGAIN ***
                </p>
                <p className="text-[10px] text-slate-500">Avani Grocers - Smart Retail</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Controls */}
        <div className="no-print flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-slate-200 bg-slate-50/90 px-4 sm:px-6 py-3.5 rounded-b-2xl gap-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 shadow-xs touch-target"
            >
              <Printer className="h-4 w-4" />
              <span>Print Invoice</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 touch-target"
            >
              <Share2 className="h-4 w-4" />
              <span>{copiedShare ? 'Copied Details!' : 'Share'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 touch-target"
            >
              Close
            </button>
            {onNewSale && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNewSale();
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-700 touch-target active:scale-95"
              >
                <Sparkles className="h-4 w-4" />
                <span>Next Customer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
