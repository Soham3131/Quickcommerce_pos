# AVANI GROCERS — PHASE 4.2 PRODUCT DATA INTEGRITY REPORT
**Date**: November 3, 2026  
**System**: Avani Grocers Unified Product Catalog & Media Engine  
**Author**: Antigravity Senior Engineering Team  

---

## 1. Canonical Product Data Architecture

Prior to Phase 4.2, product references across different views were vulnerable to index-based association, resulting in discrepancies between product names, images, selling prices, and stock balances.

Phase 4.2 establishes a **Single Source of Truth** for the entire Avani Grocers retail ecosystem:
- The customer-facing storefront selects from the exact same product records as the Admin ERP and Cashier POS.
- Every product possesses an immutable unique identifier (`id`) and a unique commercial SKU (`sku`).
- When a product is edited (name, price, stock, image), the mutation propagates in real time across the entire application without rewriting historical order snapshots.

### Canonical Schema

```typescript
interface Product {
  id: string;              // Immutable primary key (e.g. 'p1', 'prod-001')
  name: string;            // Commercial display title
  sku: string;             // Unique Stock Keeping Unit (e.g. 'AVN-FV-002')
  barcode: string;         // EAN-13 barcode representation
  category: ProductCategory;// Grocery category classification
  brand?: string;          // Manufacturer brand
  description?: string;    // Product narrative description
  price: number;           // Active selling price in base store currency (INR)
  cost: number;            // Procurement cost basis for inventory valuation
  mrp: number;             // Maximum Retail Price
  tax: number;             // Applicable GST rate (0%, 5%, 12%, 18%, 28%)
  hsnCode?: string;        // Indian Harmonized System Nomenclature code
  unit: UnitType;          // Measurement unit ('kg', 'pack', 'bottle', 'can', 'box')
  stock: number;           // Current real-time available stock
  minStock: number;        // Minimum threshold trigger for replenishment alert
  isWeighed: boolean;      // True for produce supporting decimal fractional sales (0.25kg)
  isFeatured?: boolean;    // Storefront merchandising flag
  image: string;           // Primary high-resolution photographic image URL
  rating?: number;         // Customer rating (1-5)
  reviewCount?: number;    // Customer feedback count
  createdAt?: string;      // ISO timestamp
  updatedAt?: string;      // ISO timestamp
}
```

---

## 2. Image Mapping & Quality Audit

A comprehensive audit was performed across all 27 product items and category cards to eliminate mismatched imagery.

### Image Mapping Corrections

| Product / Category | Previous Incorrect Image | Corrected Authentic Image | Verification Note |
|---|---|---|---|
| **Personal Care (Category)** | Blister pack medical pills (`photo-1584308666744-24d5c474f2ae`) | Natural skincare & soaps (`photo-1608248597359-21644781fa6a`) | Completely replaced blister pack; displays authentic organic soap and skincare bottles. |
| **Dettol Antiseptic Liquid (p24)** | Blister pack medical pills (`photo-1584308666744-24d5c474f2ae`) | Antiseptic bottle hygiene (`photo-1584515979956-d9f6e5d09982`) | Verified clean hygiene antiseptic bottle imagery. |
| **Dove Deep Moisture Body Wash (p26)** | None (New Entry) | Creamy moisturizing body wash (`photo-1608248597359-21644781fa6a`) | Added authentic personal care item. |
| **Organic Herbal Aloe Vera Soap (p27)** | None (New Entry) | Natural handcrafted soap bar (`photo-1607006314644-8848c7c7f3f3`) | Added authentic personal care item. |
| **Fresh Produce (p1 - p4)** | Cavendish Bananas, Vine Tomatoes, Potatoes, Onions | High-res farm-fresh produce photography | Verified matching items in POS, Storefront, and Alerts. |
| **Dairy & Eggs (p5 - p8)** | Toned Milk, Salted Butter, Fresh Paneer, Farm Eggs | Authentic dairy packaging photography | Verified matching items across all modules. |
| **Grocery Staples (p9 - p12)** | Chakki Atta, Basmati Rice, Tata Salt, Sunflower Oil | Authentic grocery staples packaging | Verified matching items across all modules. |

---

## 3. Product Lifecycle & Cross-Module Consistency Matrix

Any modification to a product record guarantees uniform reflection across all system touchpoints:

| Operational View | Consistency Behavior | Verification Method |
|---|---|---|
| **Product Catalog Table** | Displays active name, SKU, price, cost, stock, status badge, and actions. | Verified via browser test. |
| **POS Terminal Till** | Displays current image, live selling price, SKU, available stock, and stock status pill. | Verified via browser test. |
| **Customer Storefront** | Displays current image, price, MRP discount %, unit, and stock limit. | Verified via browser test. |
| **Inventory Valuation** | Computes stock value dynamically (`stock * cost`) using the canonical cost basis. | Verified via browser test. |
| **Low-Stock Alerts** | Dynamically includes any product whose `stock <= minStock`. | Verified via browser test. |
| **Historical Invoices** | Retains immutable snapshot of product name, unit price, quantity, and line total at the moment of sale. | Verified via browser test. |

---

## 4. Product CRUD Verification

### Add Product Workflow
1. Cashier or Admin opens Product Catalog and clicks **"+ Add New Product"**.
2. Form opens with prefilled SKU suggestion (`AVN-XXX`) and valid barcode generator.
3. User enters title, category, selling price, cost price, unit, stock, and image URL.
4. Live image preview renders immediately to confirm valid imagery before submission.
5. On submit: Item unshifts to the canonical array, becomes immediately billable on POS, and displays on the storefront.

### Edit Product Workflow
1. User clicks the edit icon on any row in the Product Catalog.
2. Modal loads with existing values.
3. Changing the selling price or stock level updates POS billing calculations and storefront cards instantly upon save.

### Delete Product Workflow
1. User clicks the delete icon.
2. System presents a confirmation dialog.
3. Upon confirmation, product is removed from active catalog, preventing new orders while preserving historical invoices.

---

## 5. Stock Mutation Integrity

All stock mutations utilize atomic single-source updates:
- **POS Checkout**: Deducts `item.quantity` once per item and creates a stock adjustment log entry.
- **Storefront Checkout**: Deducts `item.quantity` once per item and records an adjustment log entry.
- **Order Cancellation**: Inverts the deduction by adding back the exact purchased quantity and logs restoration.
- **Stock Floor Guard**: Deductions are constrained by `Math.max(0, currentStock - qty)` to prevent unapproved negative inventory balances.
