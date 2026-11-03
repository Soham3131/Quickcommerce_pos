import { NextRequest, NextResponse } from 'next/server';
import { getSuppliersServer, createSupplierServer } from '@/server/services/supplier.service';
import { getSessionFromRequest } from '@/lib/auth/session';
import { requireAdmin, createAuthErrorResponse } from '@/lib/auth/rbac';
import { validateRequestBody, createSupplierSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    requireAdmin(session);

    const suppliers = await getSuppliersServer();
    return NextResponse.json({ success: true, suppliers });
  } catch (err: any) {
    return createAuthErrorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    requireAdmin(session);

    const validation = await validateRequestBody(req, createSupplierSchema);
    if (!validation.success) {
      return validation.response;
    }

    const supplier = await createSupplierServer(validation.data);
    logger.info('[Suppliers] New vendor registered', { supplierId: supplier.id, name: supplier.name, actor: session?.name });

    return NextResponse.json({ success: true, supplier }, { status: 201 });
  } catch (err: any) {
    return createAuthErrorResponse(err);
  }
}
