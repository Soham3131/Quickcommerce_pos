import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isDatabaseConnected } from '@/lib/db';
import { InventoryTransactionModel } from '@/models/InventoryTransaction';
import { dataStore } from '@/server/storage/dataStore';
import { getSessionFromRequest } from '@/lib/auth/session';
import { requireCashierOrAdmin, createAuthErrorResponse } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    requireCashierOrAdmin(session);

    await connectToDatabase();

    if (isDatabaseConnected()) {
      const docs = await InventoryTransactionModel.find().sort({ createdAt: -1 }).limit(100);
      return NextResponse.json({ success: true, transactions: docs });
    }

    return NextResponse.json({
      success: true,
      transactions: dataStore.stockAdjustments,
    });
  } catch (err: any) {
    return createAuthErrorResponse(err);
  }
}
