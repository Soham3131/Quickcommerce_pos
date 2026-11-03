import { NextRequest, NextResponse } from 'next/server';
import { getPurchasesServer, createPurchaseServer } from '@/server/services/supplier.service';
import { getSessionFromRequest } from '@/lib/auth/session';
import { requireAdmin, createAuthErrorResponse } from '@/lib/auth/rbac';
import { validateRequestBody, createPurchaseSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    requireAdmin(session);

    const purchases = await getPurchasesServer();
    return NextResponse.json({ success: true, purchases });
  } catch (err: any) {
    return createAuthErrorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    requireAdmin(session);

    const validation = await validateRequestBody(req, createPurchaseSchema);
    if (!validation.success) {
      return validation.response;
    }

    const purchase = await createPurchaseServer(validation.data);
    logger.info('[Purchases] Purchase order created', {
      purchaseNumber: purchase.purchaseNumber,
      supplierName: purchase.supplierName,
      grandTotal: purchase.grandTotal,
      actor: session?.name,
    });

    return NextResponse.json({ success: true, purchase }, { status: 201 });
  } catch (err: any) {
    return createAuthErrorResponse(err);
  }
}
