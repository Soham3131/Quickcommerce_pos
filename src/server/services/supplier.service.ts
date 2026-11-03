import { connectToDatabase, isDatabaseConnected } from '@/lib/db';
import { SupplierModel } from '@/models/Supplier';
import { PurchaseOrderModel } from '@/models/PurchaseOrder';
import { ProductModel } from '@/models/Product';
import { InventoryTransactionModel } from '@/models/InventoryTransaction';
import { dataStore } from '../storage/dataStore';
import { Supplier, PurchaseOrder } from '@/types';

function normalizeDoc(doc: any) {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  return {
    ...obj,
    id: obj._id ? obj._id.toString() : obj.id,
    _id: undefined,
    __v: undefined,
  };
}

export async function getSuppliersServer(): Promise<Supplier[]> {
  await connectToDatabase();
  if (isDatabaseConnected()) {
    const docs = await SupplierModel.find().sort({ createdAt: -1 });
    return docs.map(normalizeDoc);
  }
  return Array.from(dataStore.suppliers.values());
}

export async function createSupplierServer(data: Partial<Supplier>): Promise<Supplier> {
  await connectToDatabase();
  if (isDatabaseConnected()) {
    const doc = await SupplierModel.create({
      name: data.name,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      address: data.address || '',
      gstin: data.gstin || '',
      category: data.category || 'Grocery',
      status: data.status || 'active',
      totalSupplied: data.totalSupplied || 0,
    });
    return normalizeDoc(doc);
  } else {
    const id = `supp-${Date.now()}`;
    const newSupp: Supplier = {
      id,
      name: data.name || 'Supplier',
      contactPerson: data.contactPerson || '',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      gstin: data.gstin || '',
      category: data.category || 'Grocery',
      status: data.status || 'active',
      totalSupplied: data.totalSupplied || 0,
    };
    dataStore.suppliers.set(id, newSupp);
    return newSupp;
  }
}

export async function getPurchasesServer(): Promise<PurchaseOrder[]> {
  await connectToDatabase();
  if (isDatabaseConnected()) {
    const docs = await PurchaseOrderModel.find().sort({ createdAt: -1 });
    return docs.map(normalizeDoc);
  }
  return Array.from(dataStore.purchases.values());
}

export async function createPurchaseServer(data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
  await connectToDatabase();
  const purchaseNumber = `PO-${Date.now().toString().slice(-6)}`;

  if (isDatabaseConnected()) {
    const doc = await PurchaseOrderModel.create({
      ...data,
      purchaseNumber,
      status: 'ordered',
      stockUpdated: false,
    });
    return normalizeDoc(doc);
  } else {
    const id = `po-${Date.now()}`;
    const newPo: PurchaseOrder = {
      id,
      purchaseNumber,
      supplierId: data.supplierId || '',
      supplierName: data.supplierName || '',
      invoiceReference: data.invoiceReference || '',
      purchaseDate: data.purchaseDate || new Date().toISOString().split('T')[0],
      status: 'ordered',
      items: data.items || [],
      subtotal: data.subtotal || 0,
      taxTotal: data.taxTotal || 0,
      grandTotal: data.grandTotal || 0,
      paymentStatus: data.paymentStatus || 'pending',
      createdAt: new Date().toISOString(),
    };
    dataStore.purchases.set(id, newPo);
    return newPo;
  }
}

/**
 * Atomically receive purchase order and increment stock.
 * Guarded against double receiving.
 */
export async function receivePurchaseOrderServer(
  purchaseId: string,
  actorName: string
): Promise<PurchaseOrder> {
  await connectToDatabase();

  if (isDatabaseConnected()) {
    const po = await PurchaseOrderModel.findById(purchaseId);
    if (!po) throw new Error('Purchase order not found');

    if (po.stockUpdated || po.status === 'received') {
      console.log(`[Purchases] Purchase order '${po.purchaseNumber}' already received.`);
      return normalizeDoc(po);
    }

    // Atomically increment stock for each received line item
    for (const item of po.items) {
      const prod = await ProductModel.findByIdAndUpdate(
        item.productId,
        { $inc: { currentStock: item.quantity } },
        { new: true }
      );

      if (prod) {
        await InventoryTransactionModel.create({
          transactionId: `PO-REC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          productId: item.productId,
          sku: item.sku,
          type: 'purchase',
          quantity: item.quantity,
          previousStock: prod.currentStock - item.quantity,
          newStock: prod.currentStock,
          reason: `Goods Received: PO ${po.purchaseNumber}`,
          referenceInvoice: po.invoiceReference || po.purchaseNumber,
          source: 'purchase_order',
          adjustedBy: actorName,
        });
      }
    }

    po.status = 'received';
    po.stockUpdated = true;
    po.receivedAt = new Date();
    await po.save();

    return normalizeDoc(po);
  } else {
    const po = dataStore.purchases.get(purchaseId);
    if (!po) throw new Error('Purchase order not found');

    if (po.status === 'received') {
      return po;
    }

    for (const item of po.items) {
      const prod = dataStore.products.get(item.productId);
      if (prod) {
        prod.currentStock += item.quantity;
        prod.updatedAt = new Date().toISOString();
      }
    }

    po.status = 'received';
    po.receivedAt = new Date().toISOString();
    return po;
  }
}
