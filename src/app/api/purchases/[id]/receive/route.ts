import { NextRequest, NextResponse } from 'next/server';
import { receivePurchaseOrderServer } from '@/server/services/supplier.service';
import { getSessionFromRequest } from '@/lib/auth/session';
import { requireAdmin, createAuthErrorResponse } from '@/lib/auth/rbac';
import { logger } from '@/lib/logger';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    requireAdmin(session);

    const actorName = session?.name || 'Admin';
    const updatedPo = await receivePurchaseOrderServer(params.id, actorName);

    logger.logPurchaseReceived(updatedPo.purchaseNumber, updatedPo.supplierName, updatedPo.items.length, actorName);

    return NextResponse.json({
      success: true,
      message: 'Purchase order received and stock updated atomically.',
      purchase: updatedPo,
    });
  } catch (err: any) {
    logger.error('[Purchases] Purchase receiving failed', { poId: params.id, error: err.message });
    return createAuthErrorResponse(err);
  }
}
