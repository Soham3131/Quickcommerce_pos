import { NextRequest, NextResponse } from 'next/server';
import {
  getProductByIdServer,
  updateProductServer,
  deleteProductServer,
} from '@/server/services/product.service';
import { getSessionFromRequest } from '@/lib/auth/session';
import { requireAdmin, createAuthErrorResponse } from '@/lib/auth/rbac';
import { validateRequestBody, updateProductSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getProductByIdServer(params.id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    logger.error('[Products] Error fetching product detail', { productId: params.id, error: err.message });
    return NextResponse.json(
      { success: false, error: 'Error fetching product' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    requireAdmin(session);

    const validation = await validateRequestBody(req, updateProductSchema);
    if (!validation.success) {
      return validation.response;
    }

    const product = await updateProductServer(params.id, validation.data, session?.name || 'Admin');
    logger.info('[Products] Product updated', { productId: params.id, actor: session?.name });

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    return createAuthErrorResponse(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    // Explicit Admin check: Cashiers are strictly prohibited from deleting products
    requireAdmin(session);

    await deleteProductServer(params.id, session?.name || 'Admin');
    logger.warn('[Products] Product deleted', { productId: params.id, actor: session?.name });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    return createAuthErrorResponse(err);
  }
}
