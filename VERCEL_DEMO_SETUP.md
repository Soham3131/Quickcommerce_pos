# Avani Grocers — Vercel Demo Mode Configuration & Deployment Guide

This document describes how to deploy **Avani Grocers** to **Vercel** as a fully interactive, database-free quick-commerce and POS demonstration platform without MongoDB Atlas, external payment gateways, Cloudinary, or email infrastructure.

---

## 1. Executive Summary

Avani Grocers features an explicit **database-free demo mode** (`APP_DATA_MODE=demo`). When this mode is configured:
1. **Zero Database Connections**: The application completely bypasses MongoDB Atlas connection attempts during build and runtime. Production safety checks for standard database mode remain intact and are only bypassed when explicit demo mode is declared.
2. **Browser-Authoritative State**: All catalogue adjustments, stock updates, POS billing transactions, customer orders, addresses, and wishlist items persist in the browser's `localStorage` (`avani_grocers_store_state_v3`).
3. **Cross-Role Shared Store**: Admin, Cashier, and Customer roles share the same local state within the browser session. An inventory adjustment or order status change made by the Admin is immediately visible to the Cashier and Customer across open browser tabs via real-time `StorageEvent` listeners.
4. **Zero External Integrations**: Online payments are clearly simulated with `[DEMO SIMULATION]` indicators. Cloudinary and SMTP credentials are not required; assets are served locally from bundled files (`src/data/laptop.png`, `src/data/phone (2).png`, `src/data/logo.png`, and local product images).
5. **Secure Seed Protection**: Authentication seed endpoints (`/api/auth/seed`) remain permanently disabled in Vercel production environments (`DEMO_MODE=false`).

---

## 2. Environment Variables Specification

Configure these environment variables in your **Vercel Project Settings → Environment Variables**:

### Required Environment Variables

| Variable | Recommended Value | Purpose |
|---|---|---|
| `APP_DATA_MODE` | `demo` | Signals the backend runtime to bypass database connections and activate demo adapters. |
| `NEXT_PUBLIC_APP_DATA_MODE` | `demo` | Signals client-side stores to prioritize `localStorage` and prevent serverless cold-start cache overwrites. |
| `AUTH_SECRET` | `avani_demo_secret_jwt_key_vercel_2026_quickcommerce_pos_demo_32chars` | 32+ character key used by the Next.js runtime to sign demo JWT session tokens. |

### Optional Environment Variables

| Variable | Default Value | Purpose |
|---|---|---|
| `SESSION_MAX_AGE_SECONDS` | `604800` | Duration (7 days) for session cookie validity. |
| `NEXTAUTH_URL` | `https://your-deployment.vercel.app` | Canonical deployment URL for headers and redirects. |
| `NEXT_PUBLIC_APP_URL` | `https://your-deployment.vercel.app` | Frontend base URL for client routing and asset resolution. |

### Explicitly Excluded (Do NOT Configure)

The following variables are **not required** and should be left empty or omitted:
- `MONGODB_URI` *(database bypass active)*
- `MONGODB_DB_NAME` *(in-memory / local storage active)*
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` *(simulated payments active)*
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` *(local assets active)*
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` *(in-app notifications active)*
- `NODE_ENV` *(automatically set to `production` by Vercel)*

---

## 3. Demo Credentials & User Roles

The demo environment includes three pre-configured accounts with instant 1-click login and manual credentials:

| Role | Email | Password | Primary Interfaces & Capabilities |
|---|---|---|---|
| **Store Administrator** | `admin@avanigrocers.com` | `Admin@123` | Dashboard, Products CRUD, Inventory Valuation, Low-Stock Alerts, Stock Reports, Purchases, Suppliers, Customer Management, GST & Currency Configuration, Storefront Settings. |
| **Store Cashier** | `cashier@avanigrocers.com` | `User@123` | High-speed POS Billing Terminal, Barcode & Keyword Search, Weighted Items, Instant Invoice Generation, A4 PDF Printing, 80mm Thermal Receipt Printing. |
| **Customer Shopper** | `customer@avanigrocers.com` | `Customer@123` | Interactive Grocery Storefront, Responsive Hero Banner, Category Navigation, Cart, Promo Coupons (`WELCOME50`, `FREESHIP`, `AVANI15`), Simulated Checkout, Order Tracking, Wishlist, Address Book. |

> **Security Note:** Demo credentials and simulation logic are intended solely for product evaluation. The application displays explicit `[DEMO ENVIRONMENT]` headers and `[DEMO SIMULATION]` checkout badges to ensure visitors understand this is a showcase build.

---

## 4. Browser-Local Persistence Architecture

### How State Persistence Works
```
+-------------------------------------------------------------------------------+
|                             Client Browser Window                             |
|                                                                               |
|   +-------------------+    +--------------------+    +--------------------+   |
|   |   Admin Tab       |    |   Cashier Tab      |    |   Customer Tab     |   |
|   |   (Products CRUD, |    |   (POS Till,       |    |   (Cart, Orders,   |   |
|   |    Order Status)  |    |    GST Invoices)   |    |    Wishlist)       |   |
|   +---------+---------+    +---------+----------+    +---------+----------+   |
|             |                        |                         |              |
|             +------------------------+-------------------------+              |
|                                      |                                        |
|                          window.onstorage (Cross-Tab Sync)                    |
|                                      v                                        |
|             +--------------------------------------------------+              |
|             |  LocalStorage: avani_grocers_store_state_v3      |              |
|             |  - products (live stock, prices, custom items)   |              |
|             |  - orders (in-store, online, status history)     |              |
|             |  - customers (loyalty points, purchase history)  |              |
|             |  - settings (GST rates, currency, store info)    |              |
|             |  - customerCart & posCart                        |              |
|             |  - customerAddresses & wishlist                  |              |
|             +--------------------------------------------------+              |
+-------------------------------------------------------------------------------+
```

### Key Behavioral Rules
1. **Unified Storage Key**: All data modifications write to `localStorage` under key `avani_grocers_store_state_v3`.
2. **Cross-Tab Synchronization**: Real-time `window.addEventListener('storage', ...)` propagates updates across open tabs instantly. For example, if an Admin marks an order as "Delivered" in one tab, the Customer's Order Tracking tab updates without requiring a page refresh.
3. **Cold-Start Protection**: In demo mode (`NEXT_PUBLIC_APP_DATA_MODE=demo`), `useStore` verifies if client modifications already exist before making background calls, preventing serverless cold starts from overwriting locally modified products or orders.
4. **Browser Isolation Limitations**:
   - Demo data is saved exclusively in the user's specific browser `localStorage`.
   - Changes made in Chrome will not sync to Firefox, Safari, or another physical computer/mobile device.
   - Clearing browser cookies and site data will reset the application to its pristine initial demo state.
5. **Factory Reset**: A **Reset to Factory Demo Data** action is available in ERP Settings (`/settings`) to restore all catalogues, stock values, and fixture orders to their initial baseline at any time.

---

## 5. Step-by-Step Vercel Deployment Guide

### Option A: Deploy via Vercel Web Dashboard (Recommended)

1. **Push Codebase to GitHub**:
   Ensure all changes are pushed to your remote repository:
   ```bash
   git branch -M main
   git remote add origin https://github.com/Soham3131/Quickcommerce_pos.git
   git push -u origin main
   ```

2. **Import Project into Vercel**:
   - Navigate to [https://vercel.com/dashboard](https://vercel.com/dashboard).
   - Click **Add New...** → **Project**.
   - Select your GitHub repository: `Quickcommerce_pos`.

3. **Configure Build Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` *(default)*
   - **Output Directory**: `.next` *(default)*
   - **Install Command**: `npm install` *(default)*

4. **Add Environment Variables**:
   Under **Environment Variables**, add:
   - `APP_DATA_MODE` = `demo`
   - `NEXT_PUBLIC_APP_DATA_MODE` = `demo`
   - `AUTH_SECRET` = `avani_demo_secret_jwt_key_vercel_2026_quickcommerce_pos_demo_32chars`

5. **Deploy**:
   - Click **Deploy**.
   - Vercel will install dependencies, compile TypeScript, optimize production bundles, and output a live preview URL (e.g., `https://quickcommerce-pos.vercel.app`).

---

### Option B: Deploy via Vercel CLI

If you prefer deploying directly from the command line:

```bash
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Authenticate
vercel login

# 3. Link and Deploy
vercel --prod -e APP_DATA_MODE=demo -e NEXT_PUBLIC_APP_DATA_MODE=demo -e AUTH_SECRET=avani_demo_secret_jwt_key_vercel_2026_quickcommerce_pos_demo_32chars
```

---

## 6. Functional Verification Walkthrough

Once deployed on Vercel, verify all primary user journeys:

### Journey 1: Customer Online Shopping & Checkout
1. Open the storefront homepage (`/`).
2. Verify responsive desktop/mobile hero backgrounds (`laptop.png` on desktop, `phone (2).png` on mobile).
3. Add products (e.g., *Organic Alphonso Mangoes*, *Amul Taaza Milk*) to the cart.
4. Open `/cart`, apply coupon code `WELCOME50` or `FREESHIP`, and proceed to `/checkout`.
5. Fill contact details, select delivery slot, and choose a simulated payment method (e.g., *UPI Instant (Demo)* or *Cash on Delivery*).
6. Click **Place Order**. You are redirected to `/order-confirmation/[id]`.
7. Note down the invoice number (e.g., `AG-2026-1008`).

### Journey 2: Admin Order Management & Live Sync
1. Switch account to **Admin** via the header popover or visit `/login`.
2. Open **Orders Management** (`/orders`).
3. Verify that the customer order placed in Journey 1 appears at the top with status `Pending`.
4. Click to assign a delivery rider (e.g., *Suresh Kumar - +91 98765 00112*). Status advances to `Preparing`.
5. Advance status to `Out for Delivery` and `Delivered`.
6. Open `/account` as Customer: verify the order timeline immediately reflects the updated delivery status.

### Journey 3: Cashier Fast POS Terminal
1. Switch to **Cashier** role and navigate to `/pos`.
2. Search products by name (*Alphonso*, *Wheat*) or category tab.
3. Adjust quantities and test a weighted product (e.g., *Organic Golden Wheat Atta* with fractional kg weight).
4. Select a customer or keep *Walk-in Customer*.
5. Complete sale with *Cash* or *Simulated Card*.
6. In the POS Completed modal, click:
   - **Print A4 Invoice**: Generates GST-compliant invoice format with HSN breakdown.
   - **Print 80mm Thermal**: Generates compact thermal till receipt.
7. Open `/inventory`: verify that the sold stock has decreased appropriately.

---

## 7. Pre-Flight Deployment Checklist

- [x] `src/lib/env.ts` handles `APP_DATA_MODE=demo` and bypasses production MongoDB requirement.
- [x] `src/lib/db.ts` returns `null` and disables Mongoose connection in demo mode.
- [x] `src/lib/demo/demoAdapter.ts` provides explicit fixtures and demo credential metadata.
- [x] Client store (`useStore.tsx`) synchronizes POS cart, customer cart, orders, and products via `localStorage`.
- [x] Cross-tab storage listeners enable live updates across concurrent tabs in the same browser.
- [x] Payment options in checkout display explicit `[DEMO SIMULATION]` indicators.
- [x] Login page features dedicated demo environment banner and pre-filled 1-click accounts.
- [x] Hero section displays user-provided `src/data/laptop.png` and `src/data/phone (2).png`.
- [x] Brand logo uses provided `src/data/logo.png`.
- [x] Database seeder (`/api/auth/seed`) remains blocked in production (`DEMO_MODE=false`).
- [x] `.env.example` contains only necessary demo deployment variables.
- [x] Repository configured for GitHub remote: `https://github.com/Soham3131/Quickcommerce_pos.git`.
