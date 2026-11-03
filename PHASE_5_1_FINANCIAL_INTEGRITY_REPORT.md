# AVANI GROCERS — PHASE 5.1 FINANCIAL INTEGRITY REPORT
**Statutory GST Audit, Server-Side Authoritative Billing, Multi-Currency Ledger & Historical Invoice Invariance**

**Project**: Avani Grocers  
**Module**: Financial Mathematics, Tax Compliance & Audit Integrity  
**Jurisdiction**: Indian GST Framework (Central Goods and Services Tax Act, 2017)  
**Audit Status**: Verified & Hardened  

---

## 1. Executive Summary

Phase 5.1 verified the mathematical correctness, statutory compliance, and immutability of Avani Grocers' financial engine.

### Core Financial Rules Enforced:
1. **Zero Client Trust**: All line items, item discounts, order-level coupons, GST tiers, delivery charges, and grand totals are calculated server-side in [`src/server/services/billing.service.ts`](file:///c:/Users/soham/Desktop/avanimart/src/server/services/billing.service.ts). Client-submitted grand totals are completely ignored.
2. **Statutory GST Accuracy**: Verified across 0% (essential fresh produce), 5% (packaged staples, milk), 12% (processed foods), 18% (cleaning, personal care), and 28% (carbonated luxury beverages).
3. **Dual Tax Computation**: Verified both Tax-Inclusive (retail consumer) and Tax-Exclusive (B2B wholesale) calculations.
4. **Historical Invoice Invariance**: Future changes to product selling prices, tax rates, company addresses, or store currency never alter past historical invoices.

---

## 2. Server-Side Authoritative Billing Calculation Verification

### Test Cart Definition:
A mixed shopping basket containing produce, dairy, grocery, and household items with differing statutory GST rates:

| Item | Database Selling Price | Quantity | Statutory GST | Inclusive Mode Net Taxable | Tax Amount | Intra-State CGST (50%) | Intra-State SGST (50%) | Line Total |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1. Fresh Cavendish Bananas | ₹60.00 / kg | 2.0 kg | **0%** | ₹120.00 | ₹0.00 | ₹0.00 | ₹0.00 | ₹120.00 |
| 2. Amul Taaza Toned Milk | ₹28.00 / pack | 4 packs | **5%** | ₹106.67 | ₹5.33 | ₹2.67 | ₹2.66 | ₹112.00 |
| 3. Organic Ghee (500ml) | ₹340.00 / jar | 1 jar | **12%** | ₹303.57 | ₹36.43 | ₹18.22 | ₹18.21 | ₹340.00 |
| 4. Surf Excel Detergent (1kg) | ₹145.00 / pack | 2 packs | **18%** | ₹245.76 | ₹44.24 | ₹22.12 | ₹22.12 | ₹290.00 |

### Subtotal & Tax Breakdown:
- **Raw Subtotal**: `₹120.00 + ₹112.00 + ₹340.00 + ₹290.00 = ₹862.00`
- **Total Taxable Base**: `₹120.00 + ₹106.67 + ₹303.57 + ₹245.76 = ₹776.00`
- **CGST Total**: `₹0.00 + ₹2.67 + ₹18.22 + ₹22.12 = ₹43.01`
- **SGST Total**: `₹0.00 + ₹2.66 + ₹18.21 + ₹22.12 = ₹42.99`
- **Total GST Amount**: `₹86.00`
- **Delivery Fee**: Orders over ₹499 unlock free delivery threshold (`deliveryCharge = ₹0.00`).
- **Grand Total**: `₹862.00`

### Client Tampering Test:
- **Simulation**: A rogue client intercepted the checkout HTTP request and submitted `"grandTotal": 10.00` and `"taxAmount": 0.00`.
- **Server Behavior**: The billing service fetched current prices from the database, recomputed all formulas, and generated the order for **₹862.00**. The tampered total was discarded.
- **Result**: **PASS (Zero Client Trust Confirmed)**.

---

## 3. Statutory GST Engine Formula Verification

Located in [`src/server/services/tax.service.ts`](file:///c:/Users/soham/Desktop/avanimart/src/server/services/tax.service.ts):

### Mode A: Tax-Inclusive Pricing (Retail Storefront & POS Default)
```
Taxable Base = Amount / (1 + Tax Rate / 100)
Tax Amount = Amount - Taxable Base
```
*Example (18% tax on ₹290.00)*:
- `Taxable Base = 290 / 1.18 = ₹245.76`
- `Tax Amount = 290 - 245.76 = ₹44.24`
- `CGST (9%) = ₹22.12`, `SGST (9%) = ₹22.12`

### Mode B: Tax-Exclusive Pricing (Commercial/Wholesale)
```
Taxable Base = Amount
Tax Amount = Amount * (Tax Rate / 100)
Total With Tax = Taxable Base + Tax Amount
```
*Example (18% tax on ₹290.00)*:
- `Taxable Base = ₹290.00`
- `Tax Amount = 290 * 0.18 = ₹52.20`
- `CGST (9%) = ₹26.10`, `SGST (9%) = ₹26.10`
- `Total = ₹342.20`

### Mode C: Inter-State IGST Split
- If buyer state differs from seller state (`isInterState === true`), `CGST = 0`, `SGST = 0`, and `IGST = Total Tax Amount`.

---

## 4. Authoritative Promotional Coupon Verification

Located in [`src/server/services/coupon.service.ts`](file:///c:/Users/soham/Desktop/avanimart/src/server/services/coupon.service.ts):

| Coupon Code | Cart Subtotal | Expected Result | Calculated Discount | Delivery Fee | Actual Status |
|---|:---:|---|:---:|:---:|:---:|
| `WELCOME50` | ₹250.00 | **Rejected** (Below ₹299 threshold) | ₹0.00 | ₹40.00 | **PASS** |
| `WELCOME50` | ₹350.00 | **Applied** (Flat ₹50 discount) | ₹50.00 | ₹40.00 | **PASS** |
| `FREESHIP` | ₹150.00 | **Rejected** (Below ₹199 threshold) | ₹0.00 | ₹40.00 | **PASS** |
| `FREESHIP` | ₹220.00 | **Applied** (Waives ₹40 delivery fee) | ₹0.00 | ₹0.00 (Free) | **PASS** |
| `AVANI15` | ₹600.00 | **Rejected** (Below ₹799 threshold) | ₹0.00 | ₹0.00 | **PASS** |
| `AVANI15` | ₹1,000.00 | **Applied** (15% discount = ₹150.00) | ₹150.00 | ₹0.00 | **PASS** |
| `AVANI15` | ₹2,000.00 | **Applied** (15% = ₹300, capped at max ₹200) | ₹200.00 (Capped) | ₹0.00 | **PASS** |

---

## 5. Multi-Currency Accounting & Historical Invariance

Located in [`src/server/services/currency.service.ts`](file:///c:/Users/soham/Desktop/avanimart/src/server/services/currency.service.ts):

1. **Store Accounting Base**: Always Indian Rupee (`INR`, `₹`, Rate `1.0`). All inventory valuations, sales ledgers, and tax liabilities are calculated in INR.
2. **Display Conversion Presets**:
   - `USD`: Rate `0.012`
   - `EUR`: Rate `0.011`
   - `GBP`: Rate `0.0095`
   - `AED`: Rate `0.044`
   - `CAD`: Rate `0.016`
3. **Historical Invariant Test**:
   - Placed Order #1045 with invoice total ₹862.00 (snapshot rate `1.0`).
   - Admin updated store base exchange rates in settings.
   - Re-queried Order #1045 invoice snapshot from `InvoiceModel`.
   - **Result**: Invoice #1045 retained its original unit prices, line taxes, and currency rate snapshot. **Zero retrospective alteration confirmed**.
