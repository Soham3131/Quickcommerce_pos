import { NextResponse } from 'next/server';
import { getLowStockAlertsServer } from '@/server/services/inventory.service';

export async function GET() {
  try {
    const alerts = await getLowStockAlertsServer();
    return NextResponse.json({ success: true, alerts, count: alerts.length });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch low stock alerts' },
      { status: 500 }
    );
  }
}
