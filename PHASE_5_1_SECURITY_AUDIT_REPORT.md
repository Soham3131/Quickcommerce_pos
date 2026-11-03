# AVANI GROCERS — PHASE 5.1 SECURITY AUDIT REPORT
**Comprehensive Vulnerability Assessment, RBAC Testing, API Security & Production Hardening**

**Project**: Avani Grocers  
**Module**: Security & Penetration Audit  
**Target Scope**: Authentication, Session Cookies, Authorization Gates, API Endpoints, and IDOR Boundaries  
**Audit Status**: Verified & Hardened  

---

## 1. Executive Summary

Phase 5.1 executed an in-depth security and vulnerability audit across Avani Grocers' application architecture. The audit focused on eliminating common OWASP Top 10 web vulnerabilities, verifying role boundaries, preventing privilege escalation, ensuring customer data isolation, and securing sensitive API endpoints.

---

## 2. Authentication & Password Security Audit

Located in [`src/lib/auth/password.ts`](file:///c:/Users/soham/Desktop/avanimart/src/lib/auth/password.ts):

### A. Algorithm Verification
- **Function**: PBKDF2 with SHA-512.
- **Iterations**: 100,000 cycles.
- **Salt**: 16 cryptographically random bytes (`crypto.randomBytes(16).toString('hex')`).
- **Hash Length**: 64 derived bytes (128 hex characters).
- **Format**: `pbkdf2$100000$<salt>$<derivedKey>`.

### B. Verification & Timing Attack Defense
```typescript
const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
return crypto.timingSafeEqual(Buffer.from(derivedKey, 'hex'), Buffer.from(originalHash, 'hex'));
```
- **Constant-Time Comparison**: By comparing buffers via `crypto.timingSafeEqual`, the algorithm execution time is independent of how many characters match, rendering timing-based side-channel attacks ineffective.
- **Error Response Masking**: Failed login attempts always return generic message `"Invalid email or password."` without revealing whether the email exists.

---

## 3. Session Security & Cookie Hardening Audit

Located in [`src/lib/auth/jwt.ts`](file:///c:/Users/soham/Desktop/avanimart/src/lib/auth/jwt.ts) and [`src/lib/auth/session.ts`](file:///c:/Users/soham/Desktop/avanimart/src/lib/auth/session.ts):

### A. Token Signature & Verification
- **Algorithm**: HMAC-SHA256 (HS256).
- **Signing Secret**: `AUTH_SECRET` (validated to require 32+ characters in production).
- **Signature Formula**: `HMAC_SHA256(Base64Url(Header) + "." + Base64Url(Payload), AUTH_SECRET)`.
- **Payload Verification**:
  - Expiration checked against server timestamp (`payload.exp < now`).
  - Signature checked via `crypto.timingSafeEqual`.
  - Malformed tokens rejected immediately.

### B. HTTP Cookie Directives:
```typescript
{
  name: 'avani_session',
  httpOnly: true,                                       // Blocks JavaScript document.cookie access
  secure: process.env.NODE_ENV === 'production',        // Enforces HTTPS transmission
  sameSite: 'lax',                                      // Mitigates cross-site request forgery
  path: '/',
  maxAge: 604800,                                       // 7 days
}
```

---

## 4. Role-Based Access Control (RBAC) & Boundary Tests

Located in [`src/lib/auth/rbac.ts`](file:///c:/Users/soham/Desktop/avanimart/src/lib/auth/rbac.ts):

### Test Results Across Role Boundaries:

| Test Case | Actor Role | Target Resource | Expected Outcome | Actual Result |
|---|---|---|---|:---:|
| 1. Admin accessing ERP Dashboard | Admin | `/api/orders` | 200 OK (all orders) | **PASS** |
| 2. Admin modifying GST configuration | Admin | `PATCH /api/settings` | 200 OK | **PASS** |
| 3. Cashier creating POS bill | Cashier | `POST /api/pos/checkout` | 201 Created | **PASS** |
| 4. Cashier attempting product deletion | Cashier | `DELETE /api/products/[id]` | **403 Forbidden** | **PASS** |
| 5. Cashier attempting GST alteration | Cashier | `PATCH /api/settings` | **403 Forbidden** | **PASS** |
| 6. Cashier attempting user seed | Cashier | `POST /api/auth/seed` | **403 Forbidden** | **PASS** |
| 7. Customer creating online order | Customer | `POST /api/orders` | 201 Created | **PASS** |
| 8. Customer viewing own order | Customer | `GET /api/orders/[own_id]` | 200 OK | **PASS** |
| 9. Customer attempting to view other order | Customer | `GET /api/orders/[other_id]` | **403 Forbidden** | **PASS** |
| 10. Customer attempting stock adjustment | Customer | `POST /api/inventory/adjustments` | **403 Forbidden** | **PASS** |
| 11. Guest shopping and cart | Guest | `GET /api/products` | 200 OK | **PASS** |
| 12. Unauthenticated calling protected API | Guest | `GET /api/inventory/transactions` | **401 Unauthorized** | **PASS** |

---

## 5. Customer Data Isolation & IDOR Verification

A critical security vulnerability in e-commerce applications is Insecure Direct Object Reference (IDOR).

### Security Implementation in `src/app/api/orders/[id]/route.ts`:
```typescript
if (session && session.role === 'customer') {
  const isOwner = assertCustomerAccess(session, order.customerId);
  if (!isOwner) {
    logger.logFailedAuthorization(`/api/orders/${params.id}`, session.role, ['owner', 'admin']);
    return NextResponse.json(
      { success: false, error: 'Forbidden. You do not have permission to view this order.' },
      { status: 403 }
    );
  }
}
```
Direct API requests attempting to query another customer's order ID or customer address book return **HTTP 403 Forbidden** and log an authorization failure event with actor ID and IP address.

---

## 6. Privilege Escalation Prevention Audit

1. **Registration Payload Hardening**: In `src/app/api/auth/register/route.ts`, the `role` field in the request body is ignored. The server hardcodes `role: 'customer'`. A client submitting `{ role: 'admin' }` cannot escalate their privileges.
2. **Profile Update Guarding**: Role cannot be altered via self-service customer profile updates.
3. **Seed Protection**: In production (`NODE_ENV === 'production'`), `/api/auth/seed` returns HTTP 403 unless explicitly enabled with `DEMO_MODE=true`.

---

## 7. API Route Security Matrix

| API Route | Allowed Methods | Public / Protected | Required Role | Zod Schema |
|---|---|---|---|---|
| `/api/auth/login` | `POST` | Public | None | `loginSchema` |
| `/api/auth/register` | `POST` | Public | None | `registerSchema` |
| `/api/auth/me` | `GET` | Protected | Authenticated | None |
| `/api/auth/logout` | `POST` | Protected | Authenticated | None |
| `/api/auth/seed` | `POST` | Protected (Dev/Demo) | Demo / Admin | None |
| `/api/products` | `GET` | Public | None | Query params |
| `/api/products` | `POST` | Protected | Admin | `createProductSchema` |
| `/api/products/[id]` | `GET` | Public | None | None |
| `/api/products/[id]` | `PATCH` | Protected | Admin | `updateProductSchema` |
| `/api/products/[id]` | `DELETE` | Protected | Admin | None |
| `/api/inventory` | `GET` | Protected | Cashier / Admin | Query params |
| `/api/inventory/alerts` | `GET` | Protected | Cashier / Admin | None |
| `/api/inventory/adjustments` | `POST` | Protected | Admin | `adjustStockSchema` |
| `/api/inventory/transactions` | `GET` | Protected | Cashier / Admin | None |
| `/api/orders` | `GET` | Protected | Isolated Customer / Staff | None |
| `/api/orders` | `POST` | Public / Customer | Customer / Guest | `createOrderSchema` |
| `/api/orders/[id]` | `GET` | Protected | Isolated Customer / Staff | None |
| `/api/orders/[id]` | `PATCH` | Protected | Cashier / Admin | `updateOrderStatusSchema` |
| `/api/pos/checkout` | `POST` | Protected | Cashier / Admin | `posCheckoutSchema` |
| `/api/pos/transactions` | `GET` | Protected | Cashier / Admin | None |
| `/api/coupons/validate` | `POST` | Public | None | `validateCouponSchema` |
| `/api/coupons` | `GET` | Public | None | None |
| `/api/coupons` | `POST` | Protected | Admin | `createCouponSchema` |
| `/api/customers` | `GET`, `POST` | Protected | Cashier / Admin | `createCustomerSchema` |
| `/api/customers/[id]` | `GET`, `POST` | Protected | Isolated Customer / Staff | `addAddressSchema` |
| `/api/suppliers` | `GET`, `POST` | Protected | Admin | `createSupplierSchema` |
| `/api/purchases` | `GET`, `POST` | Protected | Admin | `createPurchaseSchema` |
| `/api/purchases/[id]/receive` | `POST` | Protected | Admin | None |
| `/api/settings` | `GET` | Public | None | None |
| `/api/settings` | `PATCH` | Protected | Admin | Object validation |
| `/api/payments/razorpay/create-order` | `POST` | Public | None | `razorpayCreateOrderSchema` |
| `/api/payments/razorpay/verify` | `POST` | Public | None | `razorpayVerifySchema` |
| `/api/webhooks/razorpay` | `POST` | Webhook Gateway | Signature Verified | None |
| `/api/upload` | `POST` | Protected | Admin | None |
| `/api/migration/import` | `POST` | Protected | Admin | Object validation |
| `/api/categories` | `GET` | Public | None | None |
| `/api/categories` | `POST` | Protected | Admin | Object validation |
