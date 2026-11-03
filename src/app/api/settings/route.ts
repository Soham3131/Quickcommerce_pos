import { NextRequest, NextResponse } from 'next/server';
import {
  getStoreSettingsServer,
  updateStoreSettingsServer,
} from '@/server/services/settings.service';
import { getSessionFromRequest } from '@/lib/auth/session';
import { requireAdmin, createAuthErrorResponse } from '@/lib/auth/rbac';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const settings = await getStoreSettingsServer();
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    logger.error('[Settings] Error fetching settings', { error: err.message });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    requireAdmin(session);

    const body = await req.json();
    const settings = await updateStoreSettingsServer(body, session?.name || 'Admin');

    logger.logSettingsChanged('General & Operations', session?.name || 'Admin');

    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return createAuthErrorResponse(err);
  }
}
