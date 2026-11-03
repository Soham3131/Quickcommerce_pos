# AVANI GROCERS — PHASE 4.2 CENTRAL CURRENCY REPORT
**Date**: November 3, 2026  
**System**: Multi-Currency Pricing & Statutory Conversion Engine  
**Author**: Antigravity Senior Engineering Team  

---

## 1. Centralized Currency Architecture

In Phase 4.2, the currency subsystem was re-engineered from a cosmetic symbol toggle into an authoritative **Pricing & Conversion Engine**:
- **Store Base Currency**: All catalog pricing, inventory cost valuation, and back-office procurement accounting are maintained internally in base Indian Rupee (**INR** = 1.0000).
- **Exchange Rate Application**: When an alternate currency is selected by the Store Administrator or Customer, amounts are multiplied by explicit configured exchange rates:
  $$\text{Converted Amount} = \text{Amount}_{\text{INR}} \times \text{Rate}_{\text{target}}$$
- **Formatting Consistency**: Symbols, prefix/suffix positions, and decimal precision are enforced uniformly across all storefront product cards, carts, POS billing terminals, and printed invoices.

---

## 2. Supported Currencies & Configured Exchange Rates

The system supports 6 major international currencies:

| Currency | ISO Code | Symbol | Position | Decimals | Configured Rate (vs INR 1.00) | Example: Bananas (₹50) | Example: Atta (₹245) |
|---|---|---|---|---|---|---|---|
| **Indian Rupee** | `INR` | ₹ | Before | 2 | **1.0000** (Base) | ₹50.00 | ₹245.00 |
| **US Dollar** | `USD` | $ | Before | 2 | **0.0120** | $0.60 | $2.94 |
| **Euro** | `EUR` | € | Before | 2 | **0.0110** | €0.55 | €2.70 |
| **British Pound** | `GBP` | £ | Before | 2 | **0.0095** | £0.48 | £2.33 |
| **UAE Dirham** | `AED` | د.إ | After | 2 | **0.0440** | 2.20 د.إ | 10.78 د.إ |
| **Canadian Dollar** | `CAD` | C$ | Before | 2 | **0.0160** | C$0.80 | C$3.92 |

---

## 3. Formatting & Conversion Implementation

### Next.js Engine Implementation ([src/lib/currency.ts](file:///c:/Users/soham/Desktop/avanimart/src/lib/currency.ts))

```typescript
export function formatCurrency(
  amount: number | null | undefined,
  config?: Partial<CurrencyConfig>
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    amount = 0;
  }

  const active = { ...globalCurrencyConfig, ...config };
  const decimals = active.decimalPlaces ?? 2;
  const rate = active.rate ?? 1;

  // Apply explicit configured conversion rate
  const convertedAmount = amount * rate;
  
  // Format with standard locale grouping
  const formattedNumber = convertedAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (active.position === 'after') {
    return `${formattedNumber} ${active.symbol}`;
  }
  return `${active.symbol}${formattedNumber}`;
}
```

### Single-Page Preview Implementation ([index.html](file:///c:/Users/soham/Desktop/avanimart/index.html))

```javascript
function formatMoney(amount) {
  const num = Number(amount) || 0;
  const rate = state.currency && state.currency.rate !== undefined ? state.currency.rate : 1;
  const decimals = state.currency ? state.currency.decimalPlaces : 2;
  const converted = (num * rate).toFixed(decimals);
  if (state.currency && state.currency.position === 'after') {
    return `${converted} ${state.currency.symbol}`;
  }
  return `${(state.currency ? state.currency.symbol : '₹')}${converted}`;
}
```

---

## 4. Persistence & Hydration Lifecycle

1. When the user selects a currency on the **Storefront & GST** settings page:
   ```javascript
   function setStoreCurrency(currCode) {
     const found = CURRENCIES.find(c => c.code === currCode);
     if (found) {
       state.currency = found;
       localStorage.setItem('avani_currency', JSON.stringify(found));
       showToast(`Store currency set to ${found.name}`);
       render();
     }
   }
   ```
2. Upon browser initialization, the application attempts to read `localStorage.getItem('avani_currency')`.
3. If a persisted currency configuration is found, `state.currency` is initialized to that object, preserving the user's preference across browser refreshes and page transitions.

---

## 5. Module-by-Module Verification Matrix

| Module | Verification Status | Observed Output in USD ($) | Observed Output in EUR (€) |
|---|---|---|---|
| **Storefront Home** | PASS | Bananas: `$0.60/kg`, Milk: `$0.67/pack` | Bananas: `€0.55/kg`, Milk: `€0.62/pack` |
| **Storefront Product Cards** | PASS | Shows converted price and MRP discount % | Shows converted price and MRP discount % |
| **Customer Cart** | PASS | Subtotal, discounts, delivery charge converted | Subtotal, discounts, delivery charge converted |
| **POS Terminal Cards** | PASS | Converted rates displayed on each product card | Converted rates displayed on each product card |
| **POS Bill Register** | PASS | Line totals, subtotal, tax, grand total converted | Line totals, subtotal, tax, grand total converted |
| **Admin Dashboard** | PASS | Inventory cost basis & retail valuation converted | Inventory cost basis & retail valuation converted |
| **Inventory Valuation** | PASS | Product valuation (`stock * cost`) converted | Product valuation (`stock * cost`) converted |
| **Low-Stock Alerts** | PASS | Unit rates converted accurately | Unit rates converted accurately |
| **A4 & Thermal Invoices** | PASS | Invoice header, line items, and totals in active currency | Invoice header, line items, and totals in active currency |
