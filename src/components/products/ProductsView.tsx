'use client';

import React, { useState } from 'react';
import {
  PackageCheck,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ExternalLink,
  Sparkles,
  LayoutGrid,
  List,
  AlertTriangle,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Product, ProductCategory, UnitType } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export const ProductsView: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    suppliers,
    settings,
    currentUser,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Product Create/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Fruits & Vegetables');
  const [formBrand, setFormBrand] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formPurchasePrice, setFormPurchasePrice] = useState<number>(50);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(75);
  const [formMrp, setFormMrp] = useState<number>(90);
  const [formTaxRate, setFormTaxRate] = useState<number>(5);
  const [formHsn, setFormHsn] = useState('08039010');
  const [formUnit, setFormUnit] = useState<UnitType>('kg');
  const [formStock, setFormStock] = useState<number>(30);
  const [formMinStock, setFormMinStock] = useState<number>(15);
  const [formSupplierId, setFormSupplierId] = useState(suppliers[0]?.id || 'sup-001');
  const [formExpiry, setFormExpiry] = useState('2027-06-30');

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDesc('');
    setFormSku(`AVN-${Date.now().toString().slice(-4)}`);
    setFormBarcode(`890${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setFormCategory('Grocery & Staples');
    setFormBrand('Avani Selection');
    setFormImage(
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'
    );
    setFormPurchasePrice(100);
    setFormSellingPrice(135);
    setFormMrp(150);
    setFormTaxRate(5);
    setFormHsn('10063020');
    setFormUnit('pack');
    setFormStock(40);
    setFormMinStock(15);
    setFormSupplierId(suppliers[0]?.id || 'sup-001');
    setFormExpiry('2027-12-31');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormDesc(prod.description);
    setFormSku(prod.sku);
    setFormBarcode(prod.barcode);
    setFormCategory(prod.category);
    setFormBrand(prod.brand);
    setFormImage(prod.image);
    setFormPurchasePrice(prod.purchasePrice);
    setFormSellingPrice(prod.sellingPrice);
    setFormMrp(prod.mrp);
    setFormTaxRate(prod.taxRate);
    setFormHsn(prod.hsnCode);
    setFormUnit(prod.unit);
    setFormStock(prod.currentStock);
    setFormMinStock(prod.minStock);
    setFormSupplierId(prod.supplierId);
    setFormExpiry(prod.expiryDate);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === formSupplierId) || suppliers[0];

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formName,
        description: formDesc,
        sku: formSku,
        barcode: formBarcode,
        category: formCategory,
        brand: formBrand,
        image: formImage,
        purchasePrice: formPurchasePrice,
        sellingPrice: formSellingPrice,
        mrp: formMrp,
        taxRate: formTaxRate,
        hsnCode: formHsn,
        unit: formUnit,
        currentStock: formStock,
        minStock: formMinStock,
        supplierId: sup.id,
        supplierName: sup.name,
        expiryDate: formExpiry,
      });
    } else {
      addProduct({
        name: formName,
        description: formDesc,
        sku: formSku,
        barcode: formBarcode,
        category: formCategory,
        brand: formBrand,
        image: formImage,
        purchasePrice: formPurchasePrice,
        sellingPrice: formSellingPrice,
        mrp: formMrp,
        taxRate: formTaxRate,
        hsnCode: formHsn,
        unit: formUnit,
        currentStock: formStock,
        minStock: formMinStock,
        supplierId: sup.id,
        supplierName: sup.name,
        expiryDate: formExpiry,
        status: 'active',
        isWeighed: formUnit === 'kg' || formUnit === 'g',
      });
    }

    setIsModalOpen(false);
  };

  // Close on Escape key & lock body scroll
  React.useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <PackageCheck className="h-6 w-6 text-emerald-600" />
            <span>Product Master Catalog</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage barcodes, SKUs, brand packaging, MRPs, and tax categories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex rounded-xl border border-slate-200 bg-white p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'rounded-lg p-1.5 transition',
                viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'
              )}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'rounded-lg p-1.5 transition',
                viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'
              )}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {currentUser?.role === 'admin' && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Fruits & Vegetables">Fruits & Vegetables</option>
            <option value="Dairy & Eggs">Dairy & Eggs</option>
            <option value="Bakery & Bread">Bakery & Bread</option>
            <option value="Grocery & Staples">Grocery & Staples</option>
            <option value="Beverages">Beverages</option>
            <option value="Snacks & Sweets">Snacks & Sweets</option>
            <option value="Personal Care">Personal Care</option>
            <option value="Household & Cleaning">Household & Cleaning</option>
            <option value="Frozen Foods">Frozen Foods</option>
          </select>
          <span className="text-xs text-slate-500 font-medium">
            {filtered.length} products
          </span>
        </div>
      </div>

      {/* Grid or Table Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-emerald-300 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-slate-100 mb-3">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="rounded bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                      GST {p.taxRate}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      {p.category}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{p.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{p.brand}</p>
                  </div>
                </div>

                <div className="mt-2 text-xs space-y-0.5 text-slate-500 font-mono">
                  <p>SKU: {p.sku}</p>
                  <p>Barcode: {p.barcode}</p>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3">
                <div className="flex justify-between items-baseline mb-3">
                  <div>
                    <span className="text-base font-black text-slate-900">
                      {formatCurrency(p.sellingPrice, settings.currency)}
                    </span>
                    <span className="text-[10px] text-slate-400">/{p.unit}</span>
                  </div>
                  <span
                    className={cn(
                      'rounded px-2 py-0.5 text-[10px] font-bold',
                      p.currentStock <= 0
                        ? 'bg-rose-100 text-rose-700'
                        : p.currentStock <= p.minStock
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-800'
                    )}
                  >
                    Stock: {p.currentStock} {p.unit}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(p)}
                    className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-slate-200 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  {currentUser?.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete ${p.name}?`)) deleteProduct(p.id);
                      }}
                      className="rounded-xl border border-slate-200 p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-3">SKU & Barcode</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Brand</th>
                  <th className="py-3 px-3 text-right">Selling Price</th>
                  <th className="py-3 px-3 text-right">Stock</th>
                  <th className="py-3 px-3 text-right">Tax Rate</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-10 w-10 rounded-lg object-cover border border-slate-100 shrink-0"
                        />
                        <span className="font-bold text-slate-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {p.sku} / {p.barcode}
                    </td>
                    <td className="py-3 px-3 text-slate-700">{p.category}</td>
                    <td className="py-3 px-3 text-slate-700">{p.brand}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(p.sellingPrice, settings.currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-slate-800">
                      {p.currentStock} {p.unit}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-700">
                      {p.taxRate}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="rounded-lg border border-slate-200 p-1 text-slate-600 hover:bg-slate-100"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {currentUser?.role === 'admin' && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete ${p.name}?`)) deleteProduct(p.id);
                            }}
                            className="rounded-lg border border-slate-200 p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          aria-modal="true"
          role="dialog"
        >
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col my-auto animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 sm:px-6 py-4 shrink-0">
              <h3 className="font-bold text-slate-900 text-base">
                {editingProduct ? 'Edit Grocery Product' : 'Add New Grocery Product'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 touch-target"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Image Preview & URL */}
              <div>
                <label className="font-semibold text-slate-700">Product Image URL</label>
                <div className="mt-1 flex items-center gap-3">
                  <img
                    src={formImage || 'https://placehold.co/100'}
                    alt="Preview"
                    className="h-16 w-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                    onError={(e) => {
                      (e.target as any).src =
                        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80';
                    }}
                  />
                  <input
                    type="url"
                    required
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Title & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Amul Butter 500g"
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Brand *</label>
                  <input
                    type="text"
                    required
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="e.g. Amul / Fortune"
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* SKU & Barcode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Barcode / EAN *</label>
                  <input
                    type="text"
                    required
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Bakery & Bread">Bakery & Bread</option>
                    <option value="Grocery & Staples">Grocery & Staples</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Snacks & Sweets">Snacks & Sweets</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Household & Cleaning">Household & Cleaning</option>
                    <option value="Frozen Foods">Frozen Foods</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Unit of Measure *</label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value as UnitType)}
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="g">g (Gram)</option>
                    <option value="L">L (Litre)</option>
                    <option value="ml">ml (Millilitre)</option>
                    <option value="pcs">pcs (Pieces)</option>
                    <option value="pack">pack (Packet)</option>
                    <option value="box">box (Carton Box)</option>
                    <option value="bottle">bottle (Bottle)</option>
                  </select>
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">
                    Cost Price ({settings.currency.symbol})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formPurchasePrice}
                    onChange={(e) => setFormPurchasePrice(parseFloat(e.target.value) || 0)}
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">
                    Selling Price ({settings.currency.symbol})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(parseFloat(e.target.value) || 0)}
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">
                    MRP ({settings.currency.symbol})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formMrp}
                    onChange={(e) => setFormMrp(parseFloat(e.target.value) || 0)}
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Stock, Min Stock & GST Rate */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Current Stock</label>
                  <input
                    type="number"
                    step={formUnit === 'kg' || formUnit === 'g' ? '0.25' : '1'}
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(parseFloat(e.target.value) || 0)}
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Min. Alert Stock</label>
                  <input
                    type="number"
                    required
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(parseFloat(e.target.value) || 0)}
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">GST Tax Rate %</label>
                  <select
                    value={formTaxRate}
                    onChange={(e) => setFormTaxRate(parseInt(e.target.value))}
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5% (Essential)</option>
                    <option value={12}>12% (Standard)</option>
                    <option value={18}>18% (Consumer Goods)</option>
                    <option value={28}>28% (Luxury)</option>
                  </select>
                </div>
              </div>

              {/* Expiry & Supplier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Batch Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={formExpiry}
                    onChange={(e) => setFormExpiry(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Primary Supplier</label>
                  <select
                    value={formSupplierId}
                    onChange={(e) => setFormSupplierId(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700 shadow-sm"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
