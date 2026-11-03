import { NextResponse } from 'next/server';
import { TokenPayload } from './jwt';

export type Role = 'admin' | 'cashier' | 'customer';

export class UnauthorizedError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Access forbidden for this role') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Enforce that a session exists and user is authenticated.
 */
export function requireAuth(session: TokenPayload | null): TokenPayload {
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

/**
 * Enforce that the user has one of the specified roles.
 */
export function requireRole(session: TokenPayload | null, allowedRoles: Role[]): TokenPayload {
  const user = requireAuth(session);
  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(`Role '${user.role}' is not authorized to access this resource.`);
  }
  return user;
}

/**
 * Enforce admin-only access.
 */
export function requireAdmin(session: TokenPayload | null): TokenPayload {
  return requireRole(session, ['admin']);
}

/**
 * Enforce cashier or admin access (e.g. for POS checkout and billing).
 */
export function requireCashierOrAdmin(session: TokenPayload | null): TokenPayload {
  return requireRole(session, ['admin', 'cashier']);
}

/**
 * Validate customer data isolation: A customer can only access their own records.
 * Admins and cashiers can view customer records for operational processing.
 */
export function assertCustomerAccess(session: TokenPayload | null, targetCustomerId: string): boolean {
  if (!session) return false;
  if (session.role === 'admin' || session.role === 'cashier') return true;
  return session.userId === targetCustomerId || session.email === targetCustomerId;
}

/**
 * Helper to generate standardized JSON error responses for API routes.
 */
export function createAuthErrorResponse(err: unknown) {
  if (err instanceof UnauthorizedError) {
    return NextResponse.json({ success: false, error: err.message }, { status: 401 });
  }
  if (err instanceof ForbiddenError) {
    return NextResponse.json({ success: false, error: err.message }, { status: 403 });
  }
  return NextResponse.json(
    { success: false, error: err instanceof Error ? err.message : 'Internal server error' },
    { status: 500 }
  );
}
