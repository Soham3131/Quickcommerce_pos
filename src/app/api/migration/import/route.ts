import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isDatabaseConnected } from '@/lib/db';
import { ProductModel } from '@/models/Product';
import { CustomerModel } from '@/models/Customer';
import { SupplierModel } from '@/models/Supplier';
import { OrderModel } from '@/models/Order';
import { StoreSettingsModel } from '@/models/StoreSettings';
import { CouponModel } from '@/models/Coupon';
import { CategoryModel } from '@/models/Category';
import { dataStore } from '@/server/storage/dataStore';
import { getSessionFromRequest } from '@/lib/auth/session';
import { requireAdmin, createAuthErrorResponse } from '@/lib/auth/rbac';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    // Explicit Admin authorization required
    requireAdmin(session);

    await connectToDatabase();

    // Production safety rule: In production, migration must write directly to Atlas; fallback is rejected
    if (env.NODE_ENV === 'production' && !isDatabaseConnected()) {
      return NextResponse.json(
        { success: false, error: 'Database is not connected. Migration cannot proceed in production.' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { products, customers, suppliers, orders, settings, coupons, categories } = body;

    let importedProducts = 0;
    let importedCustomers = 0;
    let importedSuppliers = 0;
    let importedOrders = 0;
    let importedCoupons = 0;
    let importedCategories = 0;

    logger.info('[Migration] Ingestion started by admin', { actor: session?.name, email: session?.email });

    if (isDatabaseConnected()) {
      // 1. Idempotently import products
      if (Array.isArray(products)) {
        for (const p of products) {
          if (!p.sku) continue;
          const skuUpper = p.sku.toUpperCase();
          const existing = await ProductModel.findOne({ sku: skuUpper });
          if (!existing) {
            await ProductModel.create({
              name: p.name,
              slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              description: p.description || '',
              sku: skuUpper,
              barcode: p.barcode || `${Date.now()}`,
              category: p.category,
              brand: p.brand || '',
              image: p.image,
              purchasePrice: p.purchasePrice || 0,
              sellingPrice: p.sellingPrice || 0,
              mrp: p.mrp || p.sellingPrice || 0,
              taxRate: p.taxRate || 0,
              hsnCode: p.hsnCode || '08081000',
              unit: p.unit || 'pcs',
              currentStock: p.currentStock || 0,
              minStock: p.minStock || 5,
              status: p.status || 'active',
              isOnlinePublished: p.isOnlinePublished ?? true,
            });
            importedProducts++;
          }
        }
      }

      // 2. Idempotently import customers
      if (Array.isArray(customers)) {
        for (const c of customers) {
          if (!c.phone && !c.email) continue;
          const query: any = {};
          if (c.email) query.email = c.email.toLowerCase();
          else query.phone = c.phone;

          const existing = await CustomerModel.findOne(query);
          if (!existing) {
            await CustomerModel.create({
              name: c.name,
              phone: c.phone || '',
              email: c.email || '',
              address: c.address || '',
              customerType: c.customerType || 'Regular',
              loyaltyPoints: c.loyaltyPoints || 0,
              totalOrders: c.totalOrders || 0,
              totalPurchases: c.totalPurchases || 0,
              outstandingBalance: c.outstandingBalance || 0,
              addresses: c.addresses || [],
            });
            importedCustomers++;
          }
        }
      }

      // 3. Idempotently import suppliers
      if (Array.isArray(suppliers)) {
        for (const s of suppliers) {
          if (!s.name) continue;
          const existing = await SupplierModel.findOne({ name: s.name });
          if (!existing) {
            await SupplierModel.create({
              name: s.name,
              contactPerson: s.contactPerson || '',
              phone: s.phone || '',
              email: s.email || '',
              address: s.address || '',
              gstin: s.gstin || '',
              category: s.category || 'Grocery',
              status: s.status || 'active',
              totalSupplied: s.totalSupplied || 0,
            });
            importedSuppliers++;
          }
        }
      }

      // 4. Idempotently import orders
      if (Array.isArray(orders)) {
        for (const o of orders) {
          if (!o.invoiceNumber) continue;
          const existing = await OrderModel.findOne({ invoiceNumber: o.invoiceNumber });
          if (!existing) {
            await OrderModel.create({
              invoiceNumber: o.invoiceNumber,
              orderType: o.orderType || 'in-store',
              status: o.status || 'completed',
              paymentStatus: o.paymentStatus || 'paid',
              paymentMethod: o.paymentMethod || 'cash',
              customerId: o.customerId || 'walk-in',
              customerName: o.customerName || 'Customer',
              customerPhone: o.customerPhone || 'N/A',
              customerAddress: o.customerAddress,
              items: o.items || [],
              subtotal: o.subtotal || 0,
              orderDiscount: o.orderDiscount || 0,
              couponDiscount: o.couponDiscount || 0,
              appliedCoupon: o.appliedCoupon,
              taxableAmount: o.taxableAmount || 0,
              taxAmount: o.taxAmount || 0,
              taxBreakdown: o.taxBreakdown || [],
              deliveryCharge: o.deliveryCharge || 0,
              grandTotal: o.grandTotal || 0,
              amountPaid: o.amountPaid || o.grandTotal || 0,
              changeDue: o.changeDue || 0,
              notes: o.notes,
              cashierId: o.cashierId || 'admin',
              cashierName: o.cashierName || 'Avani Staff',
              stockDeducted: true,
              createdAt: o.createdAt || new Date(),
            });
            importedOrders++;
          }
        }
      }

      // 5. Idempotently import coupons
      if (Array.isArray(coupons)) {
        for (const c of coupons) {
          if (!c.code) continue;
          const codeUpper = c.code.toUpperCase();
          const existing = await CouponModel.findOne({ code: codeUpper });
          if (!existing) {
            await CouponModel.create({
              code: codeUpper,
              description: c.description || '',
              discountType: c.discountType || 'fixed',
              discountValue: c.discountValue || 0,
              minOrder: c.minOrder || 0,
              maxDiscount: c.maxDiscount,
              freeShipping: Boolean(c.freeShipping),
              usageCount: c.usageCount || 0,
              usageLimit: c.usageLimit,
              perCustomerLimit: c.perCustomerLimit || 1,
              isActive: c.isActive !== false,
            });
            importedCoupons++;
          }
        }
      }

      // 6. Idempotently import categories
      if (Array.isArray(categories)) {
        for (const cat of categories) {
          if (!cat.name) continue;
          const existing = await CategoryModel.findOne({ name: cat.name });
          if (!existing) {
            await CategoryModel.create({
              name: cat.name,
              slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              description: cat.description || '',
              order: cat.order || 0,
              isActive: true,
            });
            importedCategories++;
          }
        }
      }

      // 7. Update settings if provided
      if (settings) {
        await StoreSettingsModel.findOneAndUpdate({}, settings, { upsert: true });
      }
    } else {
      // In-memory fallback import (development/test mode only)
      if (Array.isArray(products)) {
        for (const p of products) {
          if (!dataStore.products.has(p.id)) {
            dataStore.products.set(p.id, p);
            importedProducts++;
          }
        }
      }
      if (Array.isArray(customers)) {
        for (const c of customers) {
          if (!dataStore.customers.has(c.id)) {
            dataStore.customers.set(c.id, c);
            importedCustomers++;
          }
        }
      }
      if (Array.isArray(orders)) {
        for (const o of orders) {
          if (!dataStore.orders.has(o.id)) {
            dataStore.orders.set(o.id, o);
            importedOrders++;
          }
        }
      }
    }

    logger.info('[Migration] Ingestion completed', {
      importedProducts,
      importedCustomers,
      importedSuppliers,
      importedOrders,
      importedCoupons,
      importedCategories,
    });

    return NextResponse.json({
      success: true,
      message: 'Legacy data migration completed successfully without duplicates.',
      imported: {
        products: importedProducts,
        customers: importedCustomers,
        suppliers: importedSuppliers,
        orders: importedOrders,
        coupons: importedCoupons,
        categories: importedCategories,
      },
    });
  } catch (err: any) {
    logger.error('[Migration] Migration error', { error: err.message });
    return createAuthErrorResponse(err);
  }
}
