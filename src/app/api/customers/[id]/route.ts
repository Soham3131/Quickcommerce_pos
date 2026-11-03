import { NextRequest, NextResponse } from 'next/server';
import {
  getCustomerByIdServer,
  getCustomerAddressesServer,
  addCustomerAddressServer,
} from '@/server/services/customer.service';
import { getSessionFromRequest } from '@/lib/auth/session';
import { assertCustomerAccess } from '@/lib/auth/rbac';
import { validateRequestBody, addAddressSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    // RBAC: Customer can only view their own record unless Admin/Cashier
    if (session && session.role === 'customer' && !assertCustomerAccess(session, params.id)) {
      logger.logFailedAuthorization(`/api/customers/${params.id}`, session.role, ['owner', 'admin']);
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const customer = await getCustomerByIdServer(params.id);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    const addresses = await getCustomerAddressesServer(params.id);

    return NextResponse.json({ success: true, customer, addresses });
  } catch (err: any) {
    logger.error('[Customers] Error fetching customer detail', { customerId: params.id, error: err.message });
    return NextResponse.json(
      { success: false, error: 'Error fetching customer' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (session && session.role === 'customer' && !assertCustomerAccess(session, params.id)) {
      logger.logFailedAuthorization(`/api/customers/${params.id}/address`, session.role, ['owner', 'admin']);
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const validation = await validateRequestBody(req, addAddressSchema);
    if (!validation.success) {
      return validation.response;
    }

    const address = await addCustomerAddressServer(params.id, {
      ...validation.data,
      label: validation.data.label || 'Home',
      isDefault: validation.data.isDefault ?? false,
    });
    logger.info('[Customers] Address added', { customerId: params.id, addressId: address.id });

    return NextResponse.json({ success: true, address }, { status: 201 });
  } catch (err: any) {
    logger.error('[Customers] Error adding address', { customerId: params.id, error: err.message });
    return NextResponse.json(
      { success: false, error: 'Error adding address' },
      { status: 500 }
    );
  }
}
