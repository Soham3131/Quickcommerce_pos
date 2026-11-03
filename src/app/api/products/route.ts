import { NextRequest, NextResponse } from 'next/server';
import { getProductsServer, createProductServer } from '@/server/services/product.service';
import { getSessionFromRequest } from '@/lib/auth/session';
import { requireAdmin, createAuthErrorResponse } from '@/lib/auth/rbac';
import { validateRequestBody, createProductSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const isOnlinePublished = searchParams.has('isOnlinePublished')
      ? searchParams.get('isOnlinePublished') === 'true'
      : undefined;
    const isFeatured = searchParams.has('isFeatured')
      ? searchParams.get('isFeatured') === 'true'
      : undefined;
    const isBestseller = searchParams.has('isBestseller')
      ? searchParams.get('isBestseller') === 'true'
      : undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const result = await getProductsServer({
      category,
      search,
      status,
      isOnlinePublished,
      isFeatured,
      isBestseller,
      page,
      limit,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    logger.error('[Products] Error fetching products', { error: err.message });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    requireAdmin(session);

    const validation = await validateRequestBody(req, createProductSchema);
    if (!validation.success) {
      return validation.response;
    }

    const product = await createProductServer(validation.data, session?.name || 'Admin');
    logger.info('[Products] Product created', { sku: product.sku, name: product.name, actor: session?.name });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err: any) {
    return createAuthErrorResponse(err);
  }
}
