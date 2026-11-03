import { NextRequest, NextResponse } from 'next/server';
import { getPosTransactionsServer } from '@/server/services/pos.service';
import { getSessionFromRequest } from '@/lib/auth/session';
import { requireCashierOrAdmin, createAuthErrorResponse } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const actor = requireCashierOrAdmin(session);

    // Cashiers can see their own transactions, Admin can see all
    const cashierFilter = actor.role === 'cashier' ? actor.userId : undefined;
    const transactions = await getPosTransactionsServer(cashierFilter);

    return NextResponse.json({ success: true, transactions });
  } catch (err: any) {
    return createAuthErrorResponse(err);
  }
}
