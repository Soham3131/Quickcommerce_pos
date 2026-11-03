import { NextRequest, NextResponse } from 'next/server';
import { adjustInventoryStock } from '@/server/services/inventory.service';
import { getSessionFromRequest } from '@/lib/auth/session';
import { requireAdmin, createAuthErrorResponse } from '@/lib/auth/rbac';
import { validateRequestBody, adjustStockSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    // Adjustments require Admin permissions
    requireAdmin(session);

    const validation = await validateRequestBody(req, adjustStockSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { productId, quantity, type, reason, referenceInvoice } = validation.data;
    const actorName = session?.name || 'Admin';

    const result = await adjustInventoryStock(
      productId,
      quantity,
      type,
      reason,
      actorName,
      referenceInvoice
    );

    logger.logInventoryMutation(
      productId,
      result.previousStock,
      result.newStock,
      `[${type.toUpperCase()}] ${reason}`,
      actorName
    );

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    logger.error('[Inventory] Manual adjustment failed', { error: err.message });
    return createAuthErrorResponse(err);
  }
}
