import { NextRequest, NextResponse } from 'next/server';
import { getCustomersServer, createCustomerServer } from '@/server/services/customer.service';
import { getSessionFromRequest } from '@/lib/auth/session';
import { requireCashierOrAdmin, createAuthErrorResponse } from '@/lib/auth/rbac';
import { validateRequestBody, createCustomerSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    requireCashierOrAdmin(session);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;

    const customers = await getCustomersServer(search);
    return NextResponse.json({ success: true, customers });
  } catch (err: any) {
    return createAuthErrorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    requireCashierOrAdmin(session);

    const validation = await validateRequestBody(req, createCustomerSchema);
    if (!validation.success) {
      return validation.response;
    }

    const customer = await createCustomerServer(validation.data);
    logger.info('[Customers] New customer record created', { customerId: customer.id, name: customer.name });

    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (err: any) {
    return createAuthErrorResponse(err);
  }
}
