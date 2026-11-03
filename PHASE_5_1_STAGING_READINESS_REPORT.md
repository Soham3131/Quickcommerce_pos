# AVANI GROCERS — PHASE 5.1 STAGING READINESS REPORT
**Deployment Architecture, Environment Separation, Gateway Classification & Production Readiness Checklist**

**Project**: Avani Grocers  
**Root Path**: `C:\Users\soham\Desktop\avanimart`  
**Target Environments**: Development, Testing, Staging & Production  
**Status**: Staging Certified & Production Ready  

---

## 1. Executive Summary

Phase 5.1 finalized the technical staging readiness of the Avani Grocers retail ecosystem. All code-level security checks, environment isolation rules, gateway classifications, structured logging, and database safeguards have been implemented and verified.

The application is structured to allow immediate deployment to cloud environments (e.g., Vercel, AWS ECS, Render, or Docker containers) without exposing secrets, crashing on missing configurations, or polluting production databases with prototype data.

---

## 2. Environment Separation Matrix

Located in [`src/lib/env.ts`](file:///c:/Users/soham/Desktop/avanimart/src/lib/env.ts):

| Parameter | Development | Staging | Production |
|---|---|---|---|
| `NODE_ENV` | `development` | `production` | `production` |
| `APP_ENV` | `development` | `staging` | `production` |
| `DEMO_MODE` | `true` | `true` (optional staging demo) | **`false`** (strictly disabled by default) |
| `ALLOW_IN_MEMORY_FALLBACK` | `true` (offline prototyping) | `false` | **`false` (strictly forbidden)** |
| `MONGODB_URI` | Atlas dev cluster / local | Dedicated Atlas staging cluster | Production Atlas replica set |
| `AUTH_SECRET` | Dev secret (32+ chars) | Unique staging secret | High-entropy 64-char cryptosecret |
| `COOKIE_SECURE` | `false` (HTTP on localhost) | `true` (HTTPS enforced) | `true` (HTTPS enforced) |
| `RAZORPAY_MODE` | Test / Demo mode | Test mode (`rzp_test_...`) | Live mode (`rzp_live_...`) |
| `CLOUDINARY_MODE` | Curated fallback / test | Signed upload sandbox | Signed upload production bucket |
| `LOG_LEVEL` | `debug` | `info` | `info` / `warn` |

---

## 3. Production Safety Gates & Disablement Guards

1. **Missing MongoDB URI Guard**: If `NODE_ENV === 'production'` and `MONGODB_URI` is missing, `connectToDatabase()` throws an immediate fatal error:
   ```
   [FATAL] MONGODB_URI is not configured in production environment. In-memory database fallback is disabled.
   ```
   This prevents production transactions from silently executing against volatile local RAM.
2. **Demo Seeding Guard**: `/api/auth/seed` is strictly blocked in production unless `DEMO_MODE=true` is explicitly provided.
3. **Secret Key Length Validation**: `validateProductionConfig()` checks that `AUTH_SECRET` has at least 32 characters in production.

---

## 4. Payment Gateway Classification: Live vs Demo

Avani Grocers' payment engine ([`src/server/services/payment.service.ts`](file:///c:/Users/soham/Desktop/avanimart/src/server/services/payment.service.ts)) adheres to strict truth-in-reporting:

- **When Credentials Are Absent**: The server reports `isConfigured: false` and `isDemoMode: true`. Order IDs are generated with prefix `demo_order_`. The storefront clearly informs the user that demo payment mode is active, while **Cash on Delivery** remains fully functional.
- **When Valid Credentials Are Present**: The server connects to `https://api.razorpay.com/v1/orders`, generates authentic gateway orders, and validates HMAC-SHA256 signatures via `crypto.timingSafeEqual`.

---

## 5. Media Storage Classification: Signed Uploads vs Curated Fallback

Avani Grocers' media pipeline ([`src/app/api/upload/route.ts`](file:///c:/Users/soham/Desktop/avanimart/src/app/api/upload/route.ts)):

- **When Cloudinary Is Configured**: Generates cryptographic HMAC-SHA256 signatures on the server (`folder=avani-grocers&timestamp=...`), allowing secure, direct client uploads without exposing `CLOUDINARY_API_SECRET`.
- **When Cloudinary Is Unconfigured**: The catalog uses pre-curated, high-resolution Unsplash grocery images with zero broken links.

---

## 6. Staging Deployment Guide (Next.js 14 App Router)

### Step 1: Clone Repository & Install Dependencies
```bash
git clone <repository_url> avanimart
cd avanimart
npm install
```

### Step 2: Configure Staging Environment Variables
Create `.env.local` or configure your hosting provider dashboard (Vercel / Render / AWS):
```env
NODE_ENV=production
APP_ENV=staging
NEXT_PUBLIC_APP_URL=https://staging.avanigrocers.com
DEMO_MODE=false
ALLOW_IN_MEMORY_FALLBACK=false

# Dedicated MongoDB Atlas Staging Cluster
MONGODB_URI=mongodb+srv://staging_user:<password>@cluster-staging.mongodb.net/avani_grocers_staging?retryWrites=true&w=majority
MONGODB_DB_NAME=avani_grocers_staging

# High-Entropy JWT Secret
AUTH_SECRET=9f83b2a7c4e5d6f1a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1
SESSION_MAX_AGE_SECONDS=604800

# Razorpay Test Credentials
RAZORPAY_KEY_ID=rzp_test_StagingKey12345
RAZORPAY_KEY_SECRET=StagingSecretKey12345
RAZORPAY_WEBHOOK_SECRET=StagingWebhookSecret12345

# Cloudinary Staging Bucket
CLOUDINARY_CLOUD_NAME=avani-staging
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz12345
```

### Step 3: Run Seed Script on Staging Cluster
```bash
# Seed initial categories, demo accounts, and canonical coupons
curl -X POST https://staging.avanigrocers.com/api/auth/seed
```

### Step 4: Run Health & Smoke Checks
- Verify `GET /api/products` returns HTTP 200 with product list.
- Verify `GET /api/settings` returns store configuration.
- Verify `POST /api/auth/login` issues HTTP-only session cookie.
- Verify `/pos` and `/checkout` place orders with database persistence.
