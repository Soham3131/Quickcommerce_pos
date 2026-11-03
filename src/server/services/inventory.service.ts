import { connectToDatabase, isDatabaseConnected } from '@/lib/db';
import { ProductModel } from '@/models/Product';
import { InventoryTransactionModel } from '@/models/InventoryTransaction';
import { dataStore } from '../storage/dataStore';
import { StockAdjustment } from '@/types';
import { logger } from '@/lib/logger';

export interface StockDeductionItem {
  productId: string;
  quantity: number;
}

export class InsufficientStockError extends Error {
  constructor(public productName: string, public available: number, public requested: number) {
    super(`Insufficient stock for '${productName}'. Available: ${available}, Requested: ${requested}`);
    this.name = 'InsufficientStockError';
  }
}

/**
 * Atomically deduct inventory for an order with multi-item rollback safety,
 * concurrency checks, and idempotency protection.
 */
export async function deductInventoryForOrder(
  items: StockDeductionItem[],
  referenceInvoice: string,
  source: 'online_order' | 'pos_sale',
  actorName: string,
  idempotencyKey?: string
): Promise<void> {
  await connectToDatabase();

  if (isDatabaseConnected()) {
    // If idempotencyKey is provided, check if already processed
    if (idempotencyKey) {
      const existing = await InventoryTransactionModel.findOne({ idempotencyKey: `${idempotencyKey}-${items[0]?.productId}` });
      if (existing) {
        logger.info(`[Inventory] Skipping duplicate stock deduction with key '${idempotencyKey}'`);
        return;
      }
    }

    // Step 1: Pre-check availability for all items
    for (const item of items) {
      const product = await ProductModel.findById(item.productId);
      if (!product) {
        throw new Error(`Product ID '${item.productId}' not found.`);
      }
      if (product.currentStock < item.quantity) {
        throw new InsufficientStockError(product.name, product.currentStock, item.quantity);
      }
    }

    // Step 2: Atomic conditional deduction with compensating rollback
    const successfullyDeducted: { productId: string; quantity: number; sku: string; previousStock: number }[] = [];

    try {
      for (const item of items) {
        const updatedProduct = await ProductModel.findOneAndUpdate(
          { _id: item.productId, currentStock: { $gte: item.quantity } },
          { $inc: { currentStock: -item.quantity } },
          { new: false }
        );

        if (!updatedProduct) {
          throw new Error(`Concurrent stock deduction failed for product ID '${item.productId}'. Insufficient stock.`);
        }

        successfullyDeducted.push({
          productId: item.productId,
          quantity: item.quantity,
          sku: updatedProduct.sku,
          previousStock: updatedProduct.currentStock,
        });

        const newStock = updatedProduct.currentStock - item.quantity;

        await InventoryTransactionModel.create({
          transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          productId: item.productId,
          sku: updatedProduct.sku,
          type: 'sale',
          quantity: item.quantity,
          previousStock: updatedProduct.currentStock,
          newStock,
          reason: `${source === 'pos_sale' ? 'POS Counter Sale' : 'Storefront Order'} ${referenceInvoice}`,
          referenceInvoice,
          source,
          adjustedBy: actorName,
          idempotencyKey: idempotencyKey ? `${idempotencyKey}-${item.productId}` : undefined,
        });
      }
    } catch (err: any) {
      // Compensating transaction: Rollback any items that were already deducted in this batch
      logger.error(`[Inventory] Multi-item order deduction failed. Rolling back ${successfullyDeducted.length} items.`, { error: err.message });
      for (const rollbackItem of successfullyDeducted) {
        await ProductModel.findByIdAndUpdate(rollbackItem.productId, {
          $inc: { currentStock: rollbackItem.quantity },
        });
        // Remove the transaction record for the rolled-back item
        if (idempotencyKey) {
          await InventoryTransactionModel.deleteOne({ idempotencyKey: `${idempotencyKey}-${rollbackItem.productId}` });
        }
      }
      throw err;
    }
  } else {
    // Standalone fallback in-memory store
    // Check all items first before mutating any
    for (const item of items) {
      const product = dataStore.products.get(item.productId);
      if (!product) {
        throw new Error(`Product ID '${item.productId}' not found.`);
      }
      if (product.currentStock < item.quantity) {
        throw new InsufficientStockError(product.name, product.currentStock, item.quantity);
      }
    }

    // Deduct and log atomically
    for (const item of items) {
      const product = dataStore.products.get(item.productId)!;
      const prev = product.currentStock;
      product.currentStock = Math.max(0, prev - item.quantity);
      product.updatedAt = new Date().toISOString();

      const adj: StockAdjustment = {
        id: `adj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        type: 'remove',
        quantity: item.quantity,
        previousStock: prev,
        newStock: product.currentStock,
        reason: `${source === 'pos_sale' ? 'POS Sale' : 'Online Order'} ${referenceInvoice}`,
        referenceInvoice,
        adjustedBy: actorName,
        createdAt: new Date().toISOString(),
      };
      dataStore.stockAdjustments.unshift(adj);
    }
  }
}

/**
 * Idempotently restore inventory when an eligible order is cancelled.
 */
export async function restoreInventoryForOrder(
  items: StockDeductionItem[],
  referenceInvoice: string,
  actorName: string,
  idempotencyKey?: string
): Promise<void> {
  await connectToDatabase();

  if (isDatabaseConnected()) {
    if (idempotencyKey) {
      const existing = await InventoryTransactionModel.findOne({
        idempotencyKey: `RESTORE-${idempotencyKey}-${items[0]?.productId}`,
      });
      if (existing) {
        logger.info(`[Inventory] Skipping duplicate stock restoration with key 'RESTORE-${idempotencyKey}'`);
        return;
      }
    }

    for (const item of items) {
      const product = await ProductModel.findByIdAndUpdate(
        item.productId,
        { $inc: { currentStock: item.quantity } },
        { new: true }
      );

      if (product) {
        await InventoryTransactionModel.create({
          transactionId: `RESTORE-TXN-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          productId: item.productId,
          sku: product.sku,
          type: 'cancellation_restore',
          quantity: item.quantity,
          previousStock: product.currentStock - item.quantity,
          newStock: product.currentStock,
          reason: `Order Cancelled: Restocked items for ${referenceInvoice}`,
          referenceInvoice,
          source: 'cancellation',
          adjustedBy: actorName,
          idempotencyKey: idempotencyKey ? `RESTORE-${idempotencyKey}-${item.productId}` : undefined,
        });
      }
    }
  } else {
    for (const item of items) {
      const product = dataStore.products.get(item.productId);
      if (product) {
        const prev = product.currentStock;
        product.currentStock = prev + item.quantity;
        product.updatedAt = new Date().toISOString();

        const adj: StockAdjustment = {
          id: `adj-res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          type: 'add',
          quantity: item.quantity,
          previousStock: prev,
          newStock: product.currentStock,
          reason: `Cancelled Order Restock ${referenceInvoice}`,
          referenceInvoice,
          adjustedBy: actorName,
          createdAt: new Date().toISOString(),
        };
        dataStore.stockAdjustments.unshift(adj);
      }
    }
  }
}

/**
 * Manual inventory adjustment (add, remove, damage, expiry, correction).
 */
export async function adjustInventoryStock(
  productId: string,
  quantityChange: number,
  type: 'add' | 'remove' | 'damage' | 'expiry' | 'correction',
  reason: string,
  actorName: string,
  referenceInvoice?: string
): Promise<{ previousStock: number; newStock: number }> {
  await connectToDatabase();

  if (isDatabaseConnected()) {
    const product = await ProductModel.findById(productId);
    if (!product) throw new Error('Product not found');

    const previousStock = product.currentStock;
    let newStock = previousStock;

    if (type === 'add' || type === 'correction') {
      newStock = type === 'add' ? previousStock + quantityChange : quantityChange;
    } else {
      newStock = Math.max(0, previousStock - quantityChange);
    }

    product.currentStock = newStock;
    await product.save();

    await InventoryTransactionModel.create({
      transactionId: `ADJ-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productId,
      sku: product.sku,
      type,
      quantity: quantityChange,
      previousStock,
      newStock,
      reason,
      referenceInvoice,
      source: 'manual_adjustment',
      adjustedBy: actorName,
    });

    return { previousStock, newStock };
  } else {
    const product = dataStore.products.get(productId);
    if (!product) throw new Error('Product not found');

    const previousStock = product.currentStock;
    let newStock = previousStock;

    if (type === 'add') {
      newStock = previousStock + quantityChange;
    } else if (type === 'correction') {
      newStock = quantityChange;
    } else {
      newStock = Math.max(0, previousStock - quantityChange);
    }

    product.currentStock = newStock;
    product.updatedAt = new Date().toISOString();

    const adj: StockAdjustment = {
      id: `adj-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type,
      quantity: quantityChange,
      previousStock,
      newStock,
      reason,
      referenceInvoice,
      adjustedBy: actorName,
      createdAt: new Date().toISOString(),
    };
    dataStore.stockAdjustments.unshift(adj);

    return { previousStock, newStock };
  }
}

/**
 * Get low stock alerts calculated from current stock and minStock threshold.
 */
export async function getLowStockAlertsServer() {
  await connectToDatabase();
  if (isDatabaseConnected()) {
    return ProductModel.find({
      $expr: { $lte: ['$currentStock', '$minStock'] },
      status: 'active',
    })
      .sort({ currentStock: 1 })
      .lean();
  }

  return Array.from(dataStore.products.values())
    .filter((p) => p.status === 'active' && p.currentStock <= p.minStock)
    .sort((a, b) => a.currentStock - b.currentStock);
}
