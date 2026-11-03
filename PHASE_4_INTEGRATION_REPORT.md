# AVANI GROCERS — PHASE 4 INTEGRATION REPORT
## Omnichannel Data Synchronization, Shared Business Rules & Retail Architecture

---

### 1. Unified Retail Model Architecture

The primary architectural requirement of Phase 4 is that **the Customer Website, Admin ERP, and Cashier POS are not three disconnected prototypes, but three specialized user interfaces operating over the same underlying business model**.

```
                   ┌─────────────────────────────────────────┐
                   │        AVANI GROCERS UNIFIED STORE      │
                   └────────────────────┬────────────────────┘
                                        │
         ┌──────────────────────────────┼──────────────────────────────┐
         ▼                              ▼                              ▼
┌─────────────────┐            ┌─────────────────┐            ┌─────────────────┐
│ CUSTOMER SHOP   │            │   ADMIN ERP     │            │  CASHIER POS    │
│  - /shop        │            │  - /dashboard   │            │  - /pos         │
│  - /cart        │            │  - /inventory   │            │  - Barcode scan │
│  - /checkout    │            │  - /orders      │            │  - Cash/Card/UPI│
│  - /track-order │            │  - /delivery    │            │  - Thermal bill │
└────────┬────────┘            └────────┬────────┘            └────────┬────────┘
         │                              │                              │
         └──────────────────────────────┼──────────────────────────────┘
                                        │
                                        ▼
                   ┌─────────────────────────────────────────┐
                   │          SHARED BUSINESS ENGINES        │
                   │  1. Single-Deduction Stock Engine       │
                   │  2. Itemized GST Tax Calculator         │
                   │  3. Multi-Currency Formatter            │
                   │  4. Centralized Orders & Invoices       │
                   │  5. Versioned LocalStorage Persistence  │
                   └─────────────────────────────────────────┘
```

---

### 2. Inventory Synchronization & The Single-Deduction Rule

A core risk in omnichannel retail software is double-deducting stock or allowing online orders to oversell physical inventory. Avani Grocers implements a strict single-deduction inventory lifecycle:

1. **Online Checkout Deduction**:
   - When a shopper clicks **"Place Order"** in `/checkout`, the system validates current stock for all cart items.
   - For each purchased line item, stock is decremented by the exact ordered quantity (supporting integer counts or decimal produce weights like `1.5 kg`).
   - A `StockAdjustment` audit record is created with type `'sale'`, referencing the newly generated `Order.invoiceNumber`.
   - Inventory drops immediately across the entire ecosystem.
2. **Counter POS Till Deduction**:
   - When a cashier bills items in `/pos`, stock is checked against available quantities.
   - Upon pressing **"Charge Bill"**, stock is deducted once, creating corresponding movement records.
3. **Admin Verification & Low Stock Alerts**:
   - In `/inventory` and `/stock-alerts`, the store manager immediately sees updated stock levels. If an online sale drops Bananas from 45.5 kg to 44.0 kg, or Fresh Paneer from 8 packs to 6 packs, the low-stock alert thresholds trigger automatically.
4. **Order Cancellation & Stock Reversal**:
   - If an admin cancels an eligible order in `/orders`, the system iterates over the order items and restores the exact quantities to `product.currentStock`.
   - A compensating `StockAdjustment` record of type `'add'` is appended to the audit trail (*"Order Cancelled — Stock Restored (AVN-INV-1048)"*).
   - Stock reversal is idempotent: cancelled orders cannot be cancelled again.

---

### 3. Dual-Cart State Isolation

A critical challenge solved in Phase 4 is **cart isolation**:
- **POS Till Cart (`cart`)**: Used exclusively by cashier staff billing counter customers in `/pos`. Includes till-specific fields like line-item discounts, custom price overrides, and cash denomination math.
- **Customer Shopping Cart (`customerCart`)**: Used exclusively by online shoppers browsing `/shop` and `/cart`. Tracks promo coupon codes (`WELCOME50`, `FREESHIP`), free shipping progress bars, and saved delivery slots.

Both carts operate concurrently without overwriting each other, while querying and deducting from the same `products` inventory.

---

### 4. Shared Orders & Live Delivery Dispatch

Every order placed on the customer website is persisted to the unified `orders` array:
1. **Invoice Number Generation**: Sequential format (e.g. `AVN-INV-1044`, `AVN-INV-1045`) shared across POS bills and website orders.
2. **Admin Order Management**:
   - Store managers can view the order in `/orders` or `/delivery`.
   - Admins can advance status: `pending` → `confirmed` → `preparing` → `ready` → `out_for_delivery` → `delivered`.
   - Admins can assign delivery riders by entering name and telephone number.
3. **Customer Live Tracking**:
   - When the customer opens `/track-order/[id]`, the visual timeline reads the exact `order.status` set by the admin.
   - If a courier was assigned, the courier card displays the driver's contact info.

---

### 5. Shared Tax & GST Engine

Both the storefront and the POS use the exact same GST engine (`src/lib/tax.ts`):
- **Item-Level Tax Rates**: Products carry tax slabs (0% for fresh produce, 5% for staple atta/milk, 12% for butter/snacks, 18% for beverages/cleaners, 28% for soda cans).
- **Tax Breakdown**: CGST (half rate) and SGST (half rate) are itemized on invoices and checkout summaries.
- **Precision**: Calculations round to 2 decimal places preventing floating-point currency discrepancies.

---

### 6. Dynamic Multi-Currency Integration

The system supports 6 global currencies:
- **INR (₹)** — Indian Rupee
- **USD ($)** — US Dollar
- **EUR (€)** — Euro
- **GBP (£)** — British Pound
- **AED (د.إ)** — UAE Dirham
- **CAD (C$)** — Canadian Dollar

When the store admin or customer selects a currency, all prices—product cards, weight rates, delivery charges, free delivery thresholds, cart subtotals, checkout totals, invoices, and analytics—reformat uniformly. No hardcoded currency symbols exist in the application.

---

### 7. Known Demo Architecture Limitations

For demonstration purposes, the system currently runs on browser LocalStorage:
- **Multi-Tab Sync**: Changes made in one tab update immediately upon navigation; cross-tab synchronization uses storage events.
- **Simulated Payments**: UPI and Card transactions simulate payment processing without hitting live bank rails.
- **Production Roadmap**: The service layer (`src/lib/orders/`, `src/lib/inventory/`, `src/lib/tax/`, `src/lib/auth/`) is structured to facilitate migration to MongoDB / Mongoose, Next.js Server Actions, and Razorpay / Stripe webhooks.
