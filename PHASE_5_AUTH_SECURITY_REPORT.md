# AVANI GROCERS — PHASE 5 AUTHENTICATION & SECURITY REPORT
**Production Authentication, RBAC, Customer Isolation & Session Security**

**Project**: Avani Grocers  
**Module**: Security & Authorization Architecture  
**Standards Adhered**: OWASP Top 10, NIST SP 800-63B, RFC 7519 (JWT), RFC 6265 (HTTP State Management)  

---

## 1. Authentication Architecture Overview

Prior to Phase 5, Avani Grocers relied on client-side demo user toggles stored in `localStorage`. 

Phase 5 introduces a complete, production-grade server-side authentication system implemented in `src/lib/auth/`:
- **Cryptographic Password Hashing**: PBKDF2 with SHA-512 and unique 16-byte random salts.
- **Constant-Time Verification**: Prevents timing side-channel attacks via `crypto.timingSafeEqual`.
- **Stateless Session Tokens**: Compact, cryptographically signed JSON Web Tokens (HS256) signed using a server-side `AUTH_SECRET`.
- **Transport Security**: Delivered via `httpOnly`, `SameSite: Lax`, and `Secure` (production) cookies, rendering sessions immune to Cross-Site Scripting (XSS) token exfiltration.
- **Zero Client Credential Leakage**: Password hashes and server secret keys never appear in client-facing bundles or responses.

---

## 2. Password Security Specifications

Located in `src/lib/auth/password.ts`:

```typescript
// Format: pbkdf2$iterations$salt$hash
export function hashPassword(password: string): string {
  const iterations = 100000;
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  return `pbkdf2$${iterations}$${salt}$${derivedKey}`;
}
```

### Key Security Properties:
1. **100,000 Iterations**: Meets NIST Guidelines for compute-intensive key derivation, making brute-force dictionary and rainbow-table attacks computationally impractical.
2. **Cryptographic Salt**: Each user gets a unique 128-bit cryptographically secure salt generated via `crypto.randomBytes(16)`.
3. **Constant-Time Comparison**: `verifyPassword` compares the derived key buffer and the original hash buffer using `crypto.timingSafeEqual`, eliminating timing discrepancies.
4. **Bcrypt Compatibility**: The verification helper also includes fallback compatibility for legacy bcrypt hashes.

---

## 3. Session Security & Cookie Hardening

Located in `src/lib/auth/jwt.ts` and `src/lib/auth/session.ts`:

- **Token Format**: Standard HS256 JWT with `userId`, `email`, `role`, `name`, `iat` (issued at), and `exp` (expiration).
- **Default Lifespan**: 7 days (`SESSION_MAX_AGE_SECONDS = 604800`), fully configurable via environment variables.
- **Cookie Flags**:
  - `httpOnly: true`: Browser JavaScript (`document.cookie`) cannot read or access the session cookie.
  - `sameSite: 'lax'`: Protects against Cross-Site Request Forgery (CSRF) on state-mutating cross-origin requests.
  - `secure: process.env.NODE_ENV === 'production'`: Transmitted exclusively over TLS/HTTPS in staging and production.
  - `path: '/'`: Scope constrained to the application origin.

---

## 4. Role-Based Access Control (RBAC) Matrix

Implemented in `src/lib/auth/rbac.ts` and enforced across all API Route Handlers:

| Feature / Resource | Guest | Customer | Cashier | Admin | Enforcement Mechanism |
|---|:---:|:---:|:---:|:---:|---|
| Browse Products & Categories | ✅ | ✅ | ✅ | ✅ | Public endpoint (`/api/products`) |
| Storefront Shopping Cart & Checkout | ✅ | ✅ | ❌ | ❌ | Allowed for customer and guest (`/api/orders`) |
| View Own Orders & Tracking | ✅ (with contact verify) | ✅ | ❌ | ❌ | Guarded by `assertCustomerAccess` |
| View Other Customers' Orders | ❌ | ❌ | ❌ | ❌ | **Strictly Forbidden** (HTTP 403) |
| Manage Own Address Book | ❌ | ✅ | ❌ | ❌ | Guarded by `assertCustomerAccess` |
| High-Speed POS Counter Sale | ❌ | ❌ | ✅ | ✅ | Guarded by `requireCashierOrAdmin` |
| View POS Cashier Shift Sales | ❌ | ❌ | ✅ (own sales) | ✅ (all sales) | Filtered by `cashierId` |
| View Inventory & Valuation | ❌ | ❌ | ✅ (read-only) | ✅ (full) | Guarded by `requireCashierOrAdmin` |
| Perform Manual Stock Adjustment | ❌ | ❌ | ❌ | ✅ | Guarded by `requireAdmin` |
| Low Stock Expiry Radar | ❌ | ❌ | ✅ | ✅ | Guarded by `requireCashierOrAdmin` |
| Product CRUD (Add/Edit) | ❌ | ❌ | ❌ | ✅ | Guarded by `requireAdmin` |
| Product Deletion | ❌ | ❌ | ❌ | ✅ | **Forbidden for Cashiers** (`requireAdmin`) |
| Manage Suppliers & Purchases | ❌ | ❌ | ❌ | ✅ | Guarded by `requireAdmin` |
| Receive Goods & Increment Stock | ❌ | ❌ | ❌ | ✅ | Guarded by `requireAdmin` |
| Modify Store GST & Currency | ❌ | ❌ | ❌ | ✅ | Guarded by `requireAdmin` |
| Legacy Data Migration | ❌ | ❌ | ❌ | ✅ | Guarded by `requireAdmin` |

---

## 5. Customer Data Isolation Safeguards

A critical security vulnerability in multi-user retail systems is Insecure Direct Object References (IDOR), where a customer alters an ID parameter in the URL or payload to view another user's invoice or address.

Avani Grocers enforces strict server-side boundary checks:
```typescript
export function assertCustomerAccess(session: TokenPayload | null, targetCustomerId: string): boolean {
  if (!session) return false;
  // Admins and Cashiers have operational access to lookup orders
  if (session.role === 'admin' || session.role === 'cashier') return true;
  // Customers can strictly ONLY access their own userId or email
  return session.userId === targetCustomerId || session.email === targetCustomerId;
}
```

In `src/app/api/orders/[id]/route.ts`:
```typescript
if (session && session.role === 'customer') {
  const isOwner = assertCustomerAccess(session, order.customerId);
  if (!isOwner) {
    return NextResponse.json(
      { success: false, error: 'Forbidden. You do not have permission to view this order.' },
      { status: 403 }
    );
  }
}
```

---

## 6. Seeded Demo Accounts (Idempotent)

The database seeder (`src/server/services/auth.service.ts` / `/api/auth/seed`) provisions three standard role accounts with hashed passwords:

| Role | Email | Plaintext Password | Password Hash Format |
|---|---|---|---|
| **Admin** | `admin@avanigrocers.com` | `Admin@123` | `pbkdf2$100000$<salt>$<hash>` |
| **Cashier** | `cashier@avanigrocers.com` | `User@123` | `pbkdf2$100000$<salt>$<hash>` |
| **Customer** | `customer@avanigrocers.com` | `Customer@123` | `pbkdf2$100000$<salt>$<hash>` |

Seeding is strictly idempotent: re-invoking the seed script checks for existing records by normalized email and never creates duplicates.

---

## 7. Known Security Boundaries & Best Practices

1. **Secret Key Rotation**: In production, `AUTH_SECRET` must be set to a cryptographically random 32+ character string generated via `openssl rand -base64 32` and stored in a secure secret manager (e.g. AWS Secrets Manager, Vercel Environment Variables).
2. **Rate Limiting**: In high-traffic public deployments, placing an edge proxy (such as Cloudflare or Next.js edge middleware rate limiter) in front of `/api/auth/login` and `/api/coupons/validate` is recommended to prevent automated credential stuffing.
3. **Database Network Isolation**: MongoDB Atlas should be configured with IP Access Lists restricting database connections exclusively to the hosting application IP or VPC peering.
