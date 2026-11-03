import { connectToDatabase, isDatabaseConnected } from '@/lib/db';
import { ProductModel, IProduct } from '@/models/Product';
import { dataStore } from '../storage/dataStore';
import { Product, ProductCategory } from '@/types';

export type ProductInputData = Partial<Omit<Product, 'category'>> & {
  category?: ProductCategory | string;
};

export interface ProductQueryParams {
  search?: string;
  category?: string;
  status?: string;
  isOnlinePublished?: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'sellingPrice' | 'currentStock' | 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

function normalizeProduct(doc: any): Product {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  return {
    ...obj,
    id: obj._id ? obj._id.toString() : obj.id,
    _id: undefined,
    __v: undefined,
  };
}

export async function getProductsServer(params: ProductQueryParams = {}): Promise<{
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  await connectToDatabase();

  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 50));
  const skip = (page - 1) * limit;

  if (isDatabaseConnected()) {
    const query: any = {};

    if (params.category && params.category !== 'All') {
      query.category = params.category;
    }

    if (params.status) {
      query.status = params.status;
    }

    if (typeof params.isOnlinePublished === 'boolean') {
      query.isOnlinePublished = params.isOnlinePublished;
    }

    if (typeof params.isFeatured === 'boolean') {
      query.isFeatured = params.isFeatured;
    }

    if (typeof params.isBestseller === 'boolean') {
      query.isBestseller = params.isBestseller;
    }

    if (params.search) {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { sku: searchRegex }, { brand: searchRegex }, { barcode: searchRegex }];
    }

    const sortField = params.sortBy || 'createdAt';
    const sortDir = params.sortOrder === 'asc' ? 1 : -1;
    const sortOpts: any = { [sortField]: sortDir };

    const total = await ProductModel.countDocuments(query);
    const docs = await ProductModel.find(query).sort(sortOpts).skip(skip).limit(limit);

    return {
      products: docs.map(normalizeProduct),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  } else {
    let list = Array.from(dataStore.products.values());

    if (params.category && params.category !== 'All') {
      list = list.filter((p) => p.category === params.category);
    }

    if (params.status) {
      list = list.filter((p) => p.status === params.status);
    }

    if (typeof params.isOnlinePublished === 'boolean') {
      list = list.filter((p) => p.isOnlinePublished === params.isOnlinePublished);
    }

    if (typeof params.isFeatured === 'boolean') {
      list = list.filter((p) => p.isFeatured === params.isFeatured);
    }

    if (typeof params.isBestseller === 'boolean') {
      list = list.filter((p) => p.isBestseller === params.isBestseller);
    }

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.barcode.includes(q)
      );
    }

    const total = list.length;
    const paginated = list.slice(skip, skip + limit);

    return {
      products: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

export async function getProductByIdServer(id: string): Promise<Product | null> {
  await connectToDatabase();
  if (isDatabaseConnected()) {
    try {
      const doc = await ProductModel.findById(id);
      return doc ? normalizeProduct(doc) : null;
    } catch {
      return null;
    }
  }
  const found = dataStore.products.get(id);
  return found || null;
}

export async function createProductServer(data: ProductInputData, actorName: string): Promise<Product> {
  await connectToDatabase();

  const sku = (data.sku || `SKU-${Date.now()}`).toUpperCase().trim();
  const slug = (data.name || 'product')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + `-${Date.now().toString().slice(-4)}`;

  if (isDatabaseConnected()) {
    const existingSku = await ProductModel.findOne({ sku });
    if (existingSku) {
      throw new Error(`Product with SKU '${sku}' already exists.`);
    }

    const doc = await ProductModel.create({
      ...data,
      sku,
      slug,
      currentStock: data.currentStock || 0,
      minStock: data.minStock || 5,
      taxRate: data.taxRate || 0,
      status: data.status || 'active',
      isOnlinePublished: data.isOnlinePublished ?? true,
    });

    return normalizeProduct(doc);
  } else {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = {
      id,
      name: data.name || 'New Product',
      description: data.description || '',
      sku,
      barcode: data.barcode || `${Date.now()}`,
      category: (data.category as ProductCategory) || 'Grocery & Staples',
      brand: data.brand || 'Avani',
      image: data.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80',
      purchasePrice: data.purchasePrice || 0,
      sellingPrice: data.sellingPrice || 0,
      mrp: data.mrp || data.sellingPrice || 0,
      taxRate: data.taxRate || 0,
      hsnCode: data.hsnCode || '08081000',
      unit: (data.unit as any) || 'pcs',
      currentStock: data.currentStock || 0,
      minStock: data.minStock || 5,
      supplierId: data.supplierId || '',
      supplierName: data.supplierName || '',
      expiryDate: data.expiryDate || '',
      status: data.status || 'active',
      isWeighed: Boolean(data.isWeighed),
      isOnlinePublished: data.isOnlinePublished ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dataStore.products.set(id, newProduct);
    return newProduct;
  }
}

export async function updateProductServer(id: string, updates: ProductInputData, actorName: string): Promise<Product> {
  await connectToDatabase();

  if (isDatabaseConnected()) {
    const updated = await ProductModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) throw new Error('Product not found');
    return normalizeProduct(updated);
  } else {
    const product = dataStore.products.get(id);
    if (!product) throw new Error('Product not found');

    const updated: Product = {
      ...product,
      ...updates,
      category: (updates.category as ProductCategory) || product.category,
      updatedAt: new Date().toISOString(),
    };
    dataStore.products.set(id, updated);
    return updated;
  }
}

export async function deleteProductServer(id: string, actorName: string): Promise<void> {
  await connectToDatabase();

  if (isDatabaseConnected()) {
    const deleted = await ProductModel.findByIdAndDelete(id);
    if (!deleted) throw new Error('Product not found');
  } else {
    if (!dataStore.products.has(id)) throw new Error('Product not found');
    dataStore.products.delete(id);
  }
}
