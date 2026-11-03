# AVANI GROCERS — PHASE 5 BACKEND ARCHITECTURE REPORT
**Production Backend Engineering, Database Integration, Secure Authentication & Real Business Operations**

**Project**: Avani Grocers  
**Root Path**: `C:\Users\soham\Desktop\avanimart`  
**Framework**: Next.js 14 App Router, TypeScript, MongoDB Atlas, Mongoose, Zod  
**Target Architecture**: Single Authoritative Backend for Customer E-Commerce Storefront, Admin ERP, and Cashier POS  

---

## 1. Executive Summary

Phase 5 has transitioned Avani Grocers from client-side `localStorage` demo persistence into a genuine, production-grade database-backed retail ecosystem. The Customer Storefront (`/shop`, `/cart`, `/checkout`), Cashier POS (`/pos`, `/my-sales`), and Admin ERP (`/dashboard`, `/inventory`, `/orders`, `/products`, etc.) now share a unified, authoritative service and database layer.

Key architectural pillars implemented:
1. **Resilient Database Layer**: MongoDB Atlas connection manager with Next.js HMR connection caching (`src/lib/db.ts`) and normalized Mongoose models with compound indexes (`src/models/`).
2. **Stateless, Cryptographically Secure Authentication**: PBKDF2-SHA512 password hashing with constant-time verification, HMAC-SHA256 JWT tokens, and HTTP-only, SameSite cookies (`src/lib/auth/`).
3. **Strict Role-Based Access Control (RBAC)**: Admin, Cashier, and Customer role enforcement with isolated customer data boundaries (`src/lib/auth/rbac.ts`).
4. **Service-Oriented Business Layer**: Modular service files (`src/server/services/`) isolating business calculations from Next.js route handlers.
5. **Authoritative Billing & GST Engine**: Complete server-side computation of line items, tiered GST (0%, 5%, 12%, 18%, 28%), discounts, delivery charges, and immutable historical invoice generation.
6. **Transaction-Safe Stock Management**: Atomic conditional decrements (`$inc` with `{ currentStock: { $gte: quantity } }`), stock mutation ledgers, and idempotent reversal guards.
7. **Payment & Media Integrations**: Official Razorpay signature verification with clean demo fallback, and Cloudinary signed parameter generation.

---

## 2. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                AVANI GROCERS CLIENTS                              |
|                                                                                   |
|  +-------------------------+  +----------------------+  +----------------------+  |
|  | Customer Storefront     |  | Cashier POS Terminal |  | Admin ERP Dashboard  |  |
|  | (/shop, /cart, /account)|  | (/pos, /my-sales)    |  | (/dashboard, /orders)|  |
|  +------------+------------+  +----------+-----------+  +----------+-----------+  |
+---------------|--------------------------|-------------------------|--------------+
                |                          |                         |
                v                          v                         v
+-----------------------------------------------------------------------------------+
|                 NEXT.JS 14 APP ROUTER API LAYER (src/app/api/...)                 |
|                                                                                   |
|  /api/auth/*     /api/products/*   /api/inventory/*   /api/orders/*    /api/pos/* |
|  /api/coupons/*  /api/customers/*  /api/purchases/*   /api/settings/*  /api/upload|
|  /api/payments/* /api/webhooks/*   /api/migration/*   /api/categories/*           |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                      SERVICE LAYER (src/server/services/...)                      |
|                                                                                   |
|  - auth.service.ts       - product.service.ts       - inventory.service.ts        |
|  - billing.service.ts    - tax.service.ts           - coupon.service.ts           |
|  - currency.service.ts   - order.service.ts         - pos.service.ts              |
|  - customer.service.ts   - supplier.service.ts      - settings.service.ts         |
|  - payment.service.ts    - audit.service.ts                                       |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|               DATABASE & STORAGE LAYER (src/lib/db.ts & src/models/)              |
|                                                                                   |
|  [MongoDB Atlas via Mongoose]               [Resilient In-Memory Fallback Store]  |
|  - Users Collection (Indexes: email, role)  - Used when MONGODB_URI is unpopulated|
|  - Products Collection (SKU, barcode, slug) - Seeded with canonical initial data  |
|  - InventoryTransactions (idempotencyKey)   - Prevents dev environment crashes    |
|  - Orders & Invoices Collections (Snapshot)                                       |
|  - Coupons Collection (Code, usage counts)                                        |
|  - Customers, Suppliers, Purchases, Settings                                      |
+-----------------------------------------------------------------------------------+
```

---

## 3. Database Schema Design & Relationships

All Mongoose models are strictly typed and located in `src/models/`:

### A. Users (`src/models/User.ts`)
- **Fields**: `name`, `email` (unique, indexed), `phone`, `passwordHash`, `role` (`admin` | `cashier` | `customer`), `avatar`, `address`, `status`, `emailVerified`, `shiftStartTime`, `lastLogin`, timestamps.
- **Indexes**: Unique index on `email`, index on `role`.

### B. Products (`src/models/Product.ts`)
- **Fields**: `name`, `slug` (unique), `sku` (unique, uppercase), `barcode`, `category`, `brand`, `image`, `additionalImages`, `purchasePrice`, `sellingPrice`, `mrp`, `taxRate`, `hsnCode`, `unit`, `currentStock`, `minStock`, `status`, `isWeighed`, `isFeatured`, `isBestseller`, `isOnlinePublished`, timestamps.
- **Indexes**: Unique index on `sku`, unique index on `slug`, index on `barcode`, compound text index on `(name, description, brand, sku)`.

### C. Inventory Transactions (`src/models/InventoryTransaction.ts`)
- **Fields**: `transactionId` (unique), `productId`, `sku`, `type` (`sale` | `purchase` | `add` | `remove` | `damage` | `expiry` | `correction` | `cancellation_restore`), `quantity`, `previousStock`, `newStock`, `reason`, `referenceInvoice`, `source`, `adjustedBy`, `idempotencyKey` (unique sparse), `createdAt`.
- **Purpose**: Authoritative audit log of every stock mutation.

### D. Orders (`src/models/Order.ts`)
- **Fields**: `invoiceNumber` (unique), `orderType`, `status`, `paymentStatus`, `paymentMethod`, `customerId`, `customerName`, `customerPhone`, `customerEmail`, `customerAddress`, `items` (embedded array of product snapshots), `subtotal`, `orderDiscount`, `couponDiscount`, `appliedCoupon`, `taxableAmount`, `taxAmount`, `taxBreakdown`, `deliveryCharge`, `grandTotal`, `amountPaid`, `changeDue`, `cashierId`, `cashierName`, `deliveryPerson`, `deliveryHistory`, `idempotencyKey`, `stockDeducted`, timestamps.

### E. Invoices (`src/models/Invoice.ts`)
- **Fields**: `invoiceNumber` (unique), `invoiceDate`, `orderId`, `sellerDetails` (companyName, gstin, address, phone), `customerDetails`, `items` (line item snapshots with HSN, CGST, SGST, IGST), `subtotal`, `taxableValue`, `cgstTotal`, `sgstTotal`, `igstTotal`, `taxTotal`, `deliveryCharge`, `grandTotal`, `amountPaid`, `balanceDue`, `currency` (code, symbol, rate), `isImmutable: true`.
- **Preservation Rule**: Immutable snapshot. Updating a product's price or changing store GST settings in the future **never** rewrites past invoices.

### F. Coupons (`src/models/Coupon.ts`)
- **Fields**: `code` (unique, uppercase), `description`, `discountType` (`percentage` | `fixed` | `free_shipping`), `discountValue`, `minOrder`, `maxDiscount`, `freeShipping`, `validFrom`, `validUntil`, `usageLimit`, `usageCount`, `perCustomerLimit`, `customerUsage` (array of customer IDs and redemption counts), `isActive`.

### G. Customers (`src/models/Customer.ts`)
- **Fields**: `name`, `phone` (indexed), `email` (indexed), `address`, `customerType`, `loyaltyPoints`, `totalOrders`, `totalPurchases`, `outstandingBalance`, `addresses` (array of subdocuments: houseNo, street, area, city, pincode, isDefault).

### H. Suppliers & Purchase Orders (`src/models/Supplier.ts`, `src/models/PurchaseOrder.ts`)
- **Fields**: `purchaseNumber` (unique), `supplierId`, `supplierName`, `invoiceReference`, `purchaseDate`, `status` (`ordered` | `received` | `cancelled`), `items`, `subtotal`, `taxTotal`, `grandTotal`, `stockUpdated: boolean`.

### I. Store Settings (`src/models/StoreSettings.ts`)
- **Fields**: Company details, GSTIN, invoice prefixes, thermal receipt width (`80mm` | `58mm`), currency configuration, tax settings, store operations, notification email rules, and storefront banners.

---

## 4. API Endpoints Reference

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/auth/login` | `POST` | Public | Authenticates credentials, sets HTTP-only cookie, returns user & token |
| `/api/auth/register` | `POST` | Public | Registers customer account, sets session cookie |
| `/api/auth/me` | `GET` | Authenticated | Validates session cookie, returns current user profile |
| `/api/auth/logout` | `POST` | Authenticated | Clears session cookie |
| `/api/auth/seed` | `POST` | Public / Admin | Idempotently seeds demo users into MongoDB |
| `/api/products` | `GET` | Public | Paginated product list with search and category filtering |
| `/api/products` | `POST` | Admin | Creates a new product |
| `/api/products/[id]` | `GET` | Public | Retrieves product details |
| `/api/products/[id]` | `PATCH` | Admin | Updates product attributes, pricing, or stock threshold |
| `/api/products/[id]` | `DELETE` | Admin | Deletes product (prohibited for Cashiers) |
| `/api/inventory` | `GET` | Cashier / Admin | Real-time stock valuation and status meter |
| `/api/inventory/alerts` | `GET` | Cashier / Admin | Low stock and out of stock product alerts |
| `/api/inventory/adjustments` | `POST` | Admin | Records manual stock adjustment with audit transaction |
| `/api/inventory/transactions`| `GET` | Cashier / Admin | Historical stock mutation audit log |
| `/api/orders` | `GET` | Authenticated | Customer sees own orders; Admin/Cashier sees all |
| `/api/orders` | `POST` | Customer / Guest | Submits online checkout with authoritative stock deduction |
| `/api/orders/[id]` | `GET` | Customer / Admin | Retrieves order (strictly enforced customer isolation) |
| `/api/orders/[id]` | `PATCH` | Admin / Cashier | Updates status, assigns delivery rider, or cancels with restock |
| `/api/pos/checkout` | `POST` | Cashier / Admin | High-speed POS counter sale, atomic deduction, invoice creation |
| `/api/pos/transactions` | `GET` | Cashier / Admin | Lists POS counter transactions |
| `/api/coupons/validate` | `POST` | Public / Customer | Authoritative server-side coupon validation |
| `/api/coupons` | `GET` | Public / Admin | Lists active promotional coupons |
| `/api/coupons` | `POST` | Admin | Creates new promotional coupon |
| `/api/customers` | `GET` | Cashier / Admin | Customer directory with search |
| `/api/customers` | `POST` | Cashier / Admin | Creates customer record |
| `/api/customers/[id]` | `GET` | Customer / Admin | Customer profile and address book (guarded) |
| `/api/suppliers` | `GET` | Admin | Vendor directory |
| `/api/suppliers` | `POST` | Admin | Adds new vendor |
| `/api/purchases` | `GET` | Admin | Lists purchase orders |
| `/api/purchases` | `POST` | Admin | Creates purchase order |
| `/api/purchases/[id]/receive`| `POST` | Admin | Atomically marks PO received and increments product inventory |
| `/api/settings` | `GET` | Public | Retrieves store configurations (tax, currency, operations) |
| `/api/settings` | `PATCH` | Admin | Updates store configurations |
| `/api/payments/razorpay/create-order` | `POST` | Customer / Guest | Creates Razorpay order or returns demo fallback |
| `/api/payments/razorpay/verify` | `POST` | Customer / Guest | Verifies HMAC-SHA256 signature and confirms order |
| `/api/webhooks/razorpay` | `POST` | Webhook Gateway | Signature-verified webhook processor |
| `/api/upload` | `POST` | Admin | Generates signed Cloudinary upload parameters |
| `/api/migration/import` | `POST` | Admin | Idempotently imports legacy LocalStorage data into MongoDB |
| `/api/categories` | `GET` | Public | Retrieves active product categories |

---

## 5. Architectural Quality Attributes

- **Zero Client Trust**: All subtotals, item discounts, coupons, GST rates, delivery charges, and grand totals are verified and calculated on the server.
- **Race Condition Prevention**: Stock deductions utilize atomic conditional queries preventing over-allocation.
- **Idempotency**: All payment and stock mutations support unique idempotency keys.
- **Graceful Degradation**: If MongoDB Atlas credentials are not yet populated in `.env.local`, the server seamlessly falls back to the in-memory store initialized with canonical seed data without crashing.
