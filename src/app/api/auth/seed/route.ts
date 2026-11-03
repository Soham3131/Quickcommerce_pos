import { NextResponse } from 'next/server';
import { seedDemoAccountsServer } from '@/server/services/auth.service';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    // Critical Security Protection:
    // Demo accounts must NOT be seeded in production unless explicitly enabled via DEMO_MODE flag
    if (env.NODE_ENV === 'production' && !env.DEMO_MODE) {
      logger.warn('[Security] Unauthorized attempt to invoke /api/auth/seed in production');
      return NextResponse.json(
        {
          success: false,
          error: 'Demo seeding is disabled in production environment.',
        },
        { status: 403 }
      );
    }

    await seedDemoAccountsServer();
    logger.info('[Auth] Seed endpoint executed successfully');

    return NextResponse.json({
      success: true,
      message: 'Demo accounts verified and seeded successfully.',
    });
  } catch (err: any) {
    logger.error('[Auth] Seeding failed', { error: err.message });
    return NextResponse.json(
      { success: false, error: err.message || 'Seeding failed' },
      { status: 500 }
    );
  }
}
