# AVANI GROCERS — PHASE 5 DATA MIGRATION REPORT
**LocalStorage Audit, Schema Mapping, Idempotent Database Seeding & Migration Strategy**

**Project**: Avani Grocers  
**Module**: Data Migration & State Authority Transition  
**Target Database**: MongoDB Atlas (with graceful local fallback)  

---

## 1. Executive Summary

Phases 1 through 4.2 of Avani Grocers maintained prototype state predominantly in the browser's `localStorage` (`avani_grocers_store_state_v3`). While effective for initial UI prototyping, this architecture presented severe enterprise limitations:
- Unsynchronized state across devices and browser sessions.
- Inability to share authoritative inventory between the Cashier POS and Customer Storefront.
- Vulnerability to client-side data loss upon browser cache eviction.
- Lack of authoritative financial audits or transactional guarantees.

Phase 5 establishes a controlled, non-destructive migration strategy:
1. **Audit existing LocalStorage keys and entities**.
2. **Define strict schema mappings to normalized MongoDB collections**.
3. **Build an automated, idempotent migration pipeline** (`src/lib/migration/migrateLocalStorage.ts` and `src/app/api/migration/import/route.ts`).
4. **Transition state authority to MongoDB Atlas**, while maintaining LocalStorage strictly as an offline-resilient UI preference and shopping cart draft cache.

---

## 2. LocalStorage Audit & Inventory

The existing application stores state under key `avani_grocers_store_state_v3`, encompassing the following entity collections:

| Entity Collection | Typical Record Count | LocalStorage Primary Key | MongoDB Model Equivalent | Key Migration Transformation |
|---|:---:|---|---|---|
| **Products** | 45 items | `id` (e.g. `prod-001`) | `ProductModel` | Canonical SKU uppercase normalization, slug generation, text indexing. |
| **Customers** | 6 records | `id` (e.g. `cust-001`) | `CustomerModel` | Phone/Email uniqueness check, address subdocument normalization. |
| **Suppliers** | 5 vendors | `id` (e.g. `sup-001`) | `SupplierModel` | GSTIN validation, vendor category mapping. |
| **Orders & Invoices** | 10+ orders | `id` / `invoiceNumber` | `OrderModel`, `InvoiceModel` | Creation of immutable historical invoice snapshot with seller details. |
| **Coupons** | 3 canonical codes | `code` | `CouponModel` | Upper-case normalization, usage counters, per-customer cap arrays. |
| **Store Settings** | 1 config object | N/A | `StoreSettingsModel` | Multi-currency exchange rate snapshots, GST configuration. |
| **Stock Adjustments** | Dynamic | `id` (e.g. `adj-xxx`) | `InventoryTransactionModel` | Historical ledger preservation with idempotency keys. |

---

## 3. Data Mapping & Normalization Specification

### A. Products Mapping
```typescript
// Legacy LocalStorage -> MongoDB Product Schema
{
  name: legacy.name,
  slug: legacy.slug || slugify(legacy.name),
  sku: legacy.sku.toUpperCase(),                 // Unique constraint
  barcode: legacy.barcode,
  category: legacy.category,
  brand: legacy.brand || '',
  image: legacy.image,                           // Curated Unsplash CDN
  purchasePrice: Number(legacy.purchasePrice),
  sellingPrice: Number(legacy.sellingPrice),
  mrp: Number(legacy.mrp || legacy.sellingPrice),
  taxRate: Number(legacy.taxRate || 0),
  hsnCode: legacy.hsnCode || '08081000',
  unit: legacy.unit || 'pcs',
  currentStock: Number(legacy.currentStock || 0),
  minStock: Number(legacy.minStock || 5),
  status: legacy.status || 'active',
  isOnlinePublished: legacy.isOnlinePublished ?? true,
}
```

### B. Orders Mapping & Snapshot Creation
During migration, client-supplied financial totals are **not blindly trusted**. Every legacy order's line items are preserved with an immutable `Invoice` snapshot record:
- Seller Snapshot: Company Name (`Avani Grocers`), GSTIN (`06AACCA1234F1Z5`), Address, State (`Haryana`).
- Line Items: Item name, SKU, HSN, Taxable Value, CGST, SGST, IGST, Line Total.
- Currency Snapshot: Base INR (`1.0`) with formatted date stamp.

---

## 4. Duplicate Prevention & Idempotency Rules

Running the migration multiple times or refreshing the application will **never create duplicate records**:

1. **Products**: Deduplicated by unique `sku`. If a product with SKU `AVN-APL-01` already exists in MongoDB, it is preserved without modification.
2. **Customers**: Deduplicated by unique `email` or `phone`.
3. **Suppliers**: Deduplicated by vendor `name` and `gstin`.
4. **Orders & Invoices**: Deduplicated by unique `invoiceNumber` (e.g. `AVN-INV-1045`).
5. **Coupons**: Deduplicated by normalized uppercase code (`WELCOME50`, `FREESHIP`, `AVANI15`).

---

## 5. Migration Pipeline Implementation

### 1. Client-Side Exporter (`src/lib/migration/migrateLocalStorage.ts`)
- `inspectLocalStorage()`: Inspects keys and reports counts.
- `exportLocalStorageData()`: Extracts and packages records into a structured JSON payload.
- `uploadLocalStorageToBackend()`: Sends data to `/api/migration/import` via authenticated HTTP POST.

### 2. Server-Side Ingestion Handler (`src/app/api/migration/import/route.ts`)
- Enforces Admin role verification (`requireAdmin`).
- Processes each collection within MongoDB connection sessions.
- Logs exact counts of inserted vs skipped duplicate records.
- Returns a structured ingestion report:
  ```json
  {
    "success": true,
    "message": "Legacy data migration completed successfully without duplicates.",
    "imported": {
      "products": 45,
      "customers": 6,
      "suppliers": 5,
      "orders": 12
    }
  }
  ```

---

## 6. Post-Migration State Authority Model

Following Phase 5, the separation of state responsibilities is strictly established:

| State Domain | Primary Authority | Secondary / Client Role |
|---|---|---|
| **Products Catalog** | MongoDB Atlas (`ProductModel`) | Cached in React state for immediate rendering |
| **Authoritative Inventory Stock** | MongoDB Atlas (`ProductModel`) | Cached in React state; validated on checkout |
| **Orders & Invoices** | MongoDB Atlas (`OrderModel`, `InvoiceModel`) | Client fetches own orders via `/api/orders` |
| **Customers & Addresses** | MongoDB Atlas (`CustomerModel`) | Synced with logged-in user profile |
| **Coupons & Redemptions** | MongoDB Atlas (`CouponModel`) | Verified server-side via `/api/coupons/validate` |
| **Promotional Cart Draft** | Client `localStorage` | Shopping convenience before checkout submission |
| **Display Currency Preference** | Client `localStorage` | Client visual preference; converted from base INR |
| **Wishlist Items** | Client `localStorage` | Client visual shopping shortlist |
