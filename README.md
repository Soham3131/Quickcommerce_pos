# Quickcommerce_pos
# Avani Grocers — Production Grocery Retail ERP & Storefront Platform

Avani Grocers is an enterprise-grade, database-backed grocery retail ecosystem and e-commerce platform built with **Next.js 14 (App Router)**, **TypeScript**, **MongoDB Atlas**, **Mongoose**, **Tailwind CSS**, and **Zod**.

The platform powers three operational frontends backed by a single authoritative backend:
1. **Customer-Facing Grocery E-Commerce Storefront** (`/shop`, `/cart`, `/checkout`, `/account`, `/track-order`)
2. **Cashier Point of Sale (POS) Terminal** (`/pos`, `/my-sales`)
3. **Admin Enterprise Resource Planning (ERP)** (`/dashboard`, `/products`, `/inventory`, `/stock-alerts`, `/orders`, `/purchases`, `/suppliers`, `/customers`, `/delivery`, `/settings`)

---

## 🚀 Phase 5 Backend Architecture

### 1. Database Foundation (`MongoDB Atlas` + `Mongoose`)
- **Connection Caching**: Resilient singleton connection manager (`src/lib/db.ts`) with Next.js HMR reuse, connection pool limits, and safe fallback in standalone environments.
- **Normalized Schemas**:
  - `User`: Admin, Cashier, Customer with PBKDF2/bcrypt password hashing, roles, and status.
  - `Product`: Full inventory attributes (SKU, barcode, slug, MRP, selling price, purchase price, tax rate, HSN code, stock threshold, publication flags).
  - `InventoryTransaction`: Concurrency-safe stock movement audit trail with idempotency keys.
  - `Order`: Full multi-channel order entity with tax breakdown, rider assignment, and payment details.
  - `Invoice`: Immutable transaction snapshot preserving seller details, line items, CGST/SGST/IGST breakdown, and currency conversion rate at transaction time.
  - `Coupon`: Normalized promotional coupon engine with usage limits, date windows, and per-customer caps.
  - `Customer`: Loyalty points, address book, purchase ledger, and customer classification.
  - `Supplier` & `PurchaseOrder`: Vendor management and purchase receiving with atomic stock incrementation.
  - `StoreSettings`: Centralized configuration for GST, currency, operations, and notification rules.
  - `AuditLog`: Security and data mutation audit trail.

### 2. Secure Server-Side Authentication & RBAC
- **Password Security**: Cryptographically salted PBKDF2-SHA512 password hashing with constant-time verification (`crypto.timingSafeEqual`).
- **Session Security**: Signed HMAC-SHA256 JWT tokens transmitted via `httpOnly`, `SameSite: Lax`, and `Secure` cookies. Zero passwords or secret tokens exposed in client bundles.
- **Role-Based Access Control**:
  - **Admin**: Full access to ERP modules, product CRUD, settings, and business analytics.
  - **Cashier**: Access to POS, counter billing, invoice printing, customer lookup, and shift sales. Prohibited from product deletion, tax/currency alteration, or sensitive store settings.
  - **Customer**: Access to public browsing, cart, checkout, own profile, own addresses, and own orders. Customer isolation strictly enforced on the server.
  - **Guest**: Access to browsing, cart, guest checkout, and verified order tracking.

### 3. Authoritative Server-Side Billing Engine
- **Never Trust Client Totals**: All calculations are recomputed on the server.
- **Statutory GST Breakdown**: Supports 0%, 5%, 12%, 18%, 28% GST presets, inclusive vs exclusive tax calculations, and intra-state (CGST + SGST) or inter-state (IGST) split.
- **Authoritative Coupon Validation**: Validates `WELCOME50`, `FREESHIP`, and `AVANI15` against database records with minimum order criteria, usage caps, and expiration checks.

### 4. Transaction-Safe Stock Management
- **Atomic Deductions**: Conditional `$inc` queries (`{ _id, currentStock: { $gte: quantity } }`) prevent overselling or race conditions.
- **Idempotency**: Stock mutation transactions use unique idempotency keys to prevent double-deduction on checkout retries.
- **Order Cancellation Restocking**: Orders mark `stockDeducted: false` upon restocking to prevent duplicate inventory restoration.

### 5. Payment Gateway & Media Management
- **Razorpay Integration**: Server-side order creation (`/api/payments/razorpay/create-order`), HMAC-SHA256 signature verification (`/api/payments/razorpay/verify`), and webhook handler (`/api/webhooks/razorpay`). Includes clear Demo Mode when API keys are not supplied.
- **Cloudinary Integration**: Signed upload endpoint (`/api/upload`) for secure product imagery.

---

## 🔑 Demo Access Credentials

The database seeder (`/api/auth/seed`) automatically initializes the following accounts:

| Role | Email | Password | Allowed Interfaces |
|---|---|---|---|
| **Store Administrator** | `admin@avanigrocers.com` | `Admin@123` | Admin ERP, Products, Inventory, Orders, Settings, POS |
| **Store Cashier** | `cashier@avanigrocers.com` | `User@123` | High-speed POS Billing, Invoices, My Shift Sales |
| **Customer Shopper** | `customer@avanigrocers.com` | `Customer@123` | Storefront, Cart, Checkout, Account Portal, Orders |

---

## 🛠️ Environment Configuration

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in your credentials:
```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/avani_grocers?retryWrites=true&w=majority

# Authentication Secret (Generate with: openssl rand -base64 32)
AUTH_SECRET=your_32_character_jwt_secret_key_here

# Razorpay (Optional - Runs in Demo Mode if omitted)
RAZORPAY_KEY_ID=rzp_test_YourKey
RAZORPAY_KEY_SECRET=YourSecret

# Cloudinary (Optional - Uses curated product URLs if omitted)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

## 💻 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run the Next.js development server
npm run dev

# 3. Open in browser
http://localhost:3000
```

---

## 📂 Project Directory Structure

```
avanimart/
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── api/                  # Backend Route Handlers
│   │   │   ├── auth/             # Login, Register, Me, Logout, Seed
│   │   │   ├── products/         # Product catalog and CRUD
│   │   │   ├── inventory/        # Stock, Alerts, Adjustments, Txns
│   │   │   ├── orders/           # Order placement, Isolation, Riders
│   │   │   ├── pos/              # POS counter sales and billing
│   │   │   ├── coupons/          # Authoritative coupon validation
│   │   │   ├── customers/        # Customer CRM and address book
│   │   │   ├── suppliers/        # Vendor directory
│   │   │   ├── purchases/        # Purchase orders and receiving
│   │   │   ├── settings/         # Store GST, currency, operations
│   │   │   ├── payments/         # Razorpay checkout and verification
│   │   │   ├── webhooks/         # Razorpay webhook processor
│   │   │   ├── upload/           # Cloudinary signed media uploads
│   │   │   └── migration/        # LocalStorage database import
│   │   ├── (storefront)/         # Customer shop, cart, checkout, account
│   │   ├── (admin)/              # ERP dashboard, products, inventory, settings
│   │   └── pos/                  # Cashier terminal
│   ├── lib/
│   │   ├── auth/                 # Password hashing, JWT signing, RBAC
│   │   ├── db.ts                 # Mongoose connection manager
│   │   ├── env.ts                # Environment validation
│   │   ├── migration/            # LocalStorage migration utility
│   │   └── tax.ts, currency.ts   # Core utilities
│   ├── models/                   # Mongoose schemas & indexes
│   ├── server/services/          # Service Layer (Business Logic)
│   ├── store/useStore.tsx        # React Context Store (API synced)
│   └── types/index.ts            # Canonical domain types
```
