# AVANI GROCERS — PHASE 5 BUSINESS LOGIC REPORT
**Authoritative Business Rules, Billing Calculations, Inventory Mutations, Tax Engine & Payment States**

**Project**: Avani Grocers  
**Module**: Business Logic Specification & Financial Engineering  
**Service Layer**: `src/server/services/`  

---

## 1. Executive Summary

In enterprise grocery retail, client-submitted financial amounts and stock adjustments can never be trusted. A customer with browser devtools could alter item prices, bypass minimum coupon order limits, or purchase out-of-stock items.

Phase 5 centralizes all retail mathematics and state mutations into a dedicated server-side service layer (`src/server/services/`). Regardless of whether a transaction originates from the **Customer Storefront** or the **Cashier POS**, it passes through the same authoritative billing, tax, and inventory engine.

---

## 2. Server-Side Billing Engine & Calculations

Located in `src/server/services/billing.service.ts`:

### A. Line Item Calculation
For each item submitted in a cart or POS till:
```
Gross Amount = Quantity * Current Database Selling Price (or authorized cashier custom price)
Discount Amount = Gross Amount * (Discount Percent / 100)
Net Taxable Base = Gross Amount - Discount Amount
```

### B. Dual-Mode GST Calculation (`src/server/services/tax.service.ts`)
The store configuration allows either **Tax-Inclusive** or **Tax-Exclusive** pricing:

1. **Tax-Inclusive Mode**:
   ```
   Taxable Amount = Net Amount / (1 + Tax Rate / 100)
   Tax Amount = Net Amount - Taxable Amount
   Total With Tax = Net Amount
   ```
2. **Tax-Exclusive Mode**:
   ```
   Taxable Amount = Net Amount
   Tax Amount = Net Amount * (Tax Rate / 100)
   Total With Tax = Taxable Amount + Tax Amount
   ```

3. **Statutory Tax Split**:
   - **Intra-State Sale** (e.g. Haryana to Haryana):
     ```
     CGST = Math.round((Tax Amount / 2) * 100) / 100
     SGST = Math.round((Tax Amount - CGST) * 100) / 100
     IGST = 0
     ```
   - **Inter-State Sale**:
     ```
     IGST = Tax Amount
     CGST = 0, SGST = 0
     ```

### C. Grand Total Formula
```
Grand Total = Round( (Total Taxable Value + Total Tax Amount) - Order Discount - Coupon Discount + Delivery Fee )
```

---

## 3. Authoritative Coupon Engine

Located in `src/server/services/coupon.service.ts`:

### A. Supported Canonical Promotional Coupons

| Coupon Code | Discount Type | Discount Value | Min Order | Max Discount | Free Shipping | Per-Customer Cap |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `WELCOME50` | Fixed Currency | ₹50.00 | ₹299.00 | ₹50.00 | No | 1 redemption |
| `FREESHIP` | Free Shipping | ₹40.00 (delivery fee waiver) | ₹199.00 | ₹40.00 | **Yes** | 5 redemptions |
| `AVANI15` | Percentage | 15% | ₹799.00 | ₹200.00 | No | 3 redemptions |

### B. Authoritative Validation Rules
1. **Code Normalization**: Codes are trimmed and converted to uppercase (`welcome50` -> `WELCOME50`).
2. **Date Window Validation**: Checks `validFrom <= now <= validUntil`.
3. **Threshold Check**: If `cartSubtotal < minOrder`, rejects with an exact calculation of remaining amount needed (e.g., *"Add ₹45 more to qualify for WELCOME50"*).
4. **Total Usage Cap**: Checks `usageCount < usageLimit`.
5. **Per-Customer Limit**: Checks logged-in customer's redemption count against `perCustomerLimit`.
6. **Atomic Usage Tracking**: On order confirmation, `incrementCouponUsage` atomically increments `usageCount` and appends/updates the customer ID record.

---

## 4. Transaction-Safe Stock Management & Mutation Rules

Located in `src/server/services/inventory.service.ts`:

### A. Concurrency Safety & Race Condition Protection
When an order is submitted:
```typescript
// Atomically deduct only if currentStock is sufficient
const updatedProduct = await ProductModel.findOneAndUpdate(
  { _id: item.productId, currentStock: { $gte: item.quantity } },
  { $inc: { currentStock: -item.quantity } },
  { new: false }
);

if (!updatedProduct) {
  throw new InsufficientStockError(product.name, product.currentStock, item.quantity);
}
```
If two shoppers simultaneously attempt to buy the remaining stock of an item, only the first transaction succeeds; the second receives an `InsufficientStockError` without corrupting stock totals.

### B. Idempotent Deductions & Checkouts
Every stock deduction passes an `idempotencyKey` (e.g. `ORD-1730592000-abcd-prod-001`). If a payment webhook or network retry resubmits the checkout, the mutation check detects the existing `InventoryTransaction` and skips duplicate deductions.

### C. Order Cancellation & Stock Reversal Safeguard
When an order is cancelled or refunded:
1. The server inspects `order.stockDeducted`.
2. If `true`, it calls `restoreInventoryForOrder`, atomically increments stock by the exact original quantity, logs a `cancellation_restore` transaction, and sets `order.stockDeducted = false`.
3. If the cancellation endpoint is triggered a second time, it observes `stockDeducted === false` and **does not restore stock twice**.

---

## 5. Multi-Currency Accounting Architecture

Located in `src/server/services/currency.service.ts`:

1. **Base Store Accounting Currency**: Always **INR (₹)** with rate `1.0`. All financial ledgers, GST filings, and inventory valuations are recorded in INR.
2. **Display Conversion**:
   - `USD ($)`: Rate `0.012`
   - `EUR (€)`: Rate `0.011`
   - `GBP (£)`: Rate `0.0095`
   - `AED (AED )`: Rate `0.044`
   - `CAD (CA$)`: Rate `0.016`
3. **Historical Exchange Rate Snapshotting**:
   When an invoice is issued, it records the exact conversion rate snapshot at that point in time:
   ```json
   {
     "code": "USD",
     "symbol": "$",
     "rate": 0.012,
     "formattedAt": "2026-11-03T01:00:00.000Z"
   }
   ```
   If an administrator updates currency rates in the future, past order invoices remain immutable.

---

## 6. Immutable Invoice Records

Located in `src/models/Invoice.ts`:

Every completed order creates an immutable `Invoice` snapshot preserving:
- Seller Identity: Company Name, GSTIN, Address, Phone, State.
- Customer Identity: Name, Phone, Email, Billing/Shipping Address.
- Itemized Lines: Name, SKU, HSN Code, Quantity, Unit Price, Line Discount, Taxable Value, CGST, SGST, IGST, Line Total.
- Tax Totals: CGST Total, SGST Total, IGST Total, Total Tax.
- Payment Status: Paid, Amount Paid, Balance Due.
- Format Support: Perfectly styled for both **A4 Full GST Tax Invoice** and **80mm Thermal Receipt** printing without content clipping.

---

## 7. Order Statuses & Payment States Lifecycle

### Order Statuses:
- `pending`: Order placed online, awaiting store acknowledgment.
- `confirmed`: Order acknowledged by store staff or online payment verified.
- `preparing`: Items being picked and packed at the store.
- `ready`: Packed and ready for takeaway pickup or driver dispatch.
- `out_for_delivery`: Handed over to delivery rider (assigned rider name and phone logged).
- `delivered`: Successfully delivered to customer address.
- `completed`: Counter POS sale completed or order delivery concluded.
- `cancelled`: Order cancelled prior to dispatch; stock restored.
- `refunded`: Order refunded with reversal ledger.

### Payment States:
- `unpaid`: Cash on Delivery order awaiting customer handover.
- `paid`: Payment captured via Card, UPI, or verified online Razorpay signature.
- `partial`: Partial payment received on split POS counter bill.
- `refunded`: Payment returned to original payment source.
