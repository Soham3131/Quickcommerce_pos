import { NextRequest, NextResponse } from 'next/server';
import { registerCustomer } from '@/server/services/auth.service';
import { getSessionCookieOptions } from '@/lib/auth/session';
import { validateRequestBody, registerSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const validation = await validateRequestBody(req, registerSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { name, email, phone, password, address } = validation.data;
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    const result = await registerCustomer({
      name,
      email,
      phone,
      passwordPlain: password,
      address,
    });

    if (!result.success || !result.token) {
      logger.warn('[Auth] Registration rejected', { email, error: result.error, ip });
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    logger.info('[Auth] New customer registered successfully', { email, userId: result.user?.id, ip });

    const response = NextResponse.json({
      success: true,
      user: result.user,
      token: result.token,
    });

    const cookieOpts = getSessionCookieOptions(result.token);
    response.cookies.set(cookieOpts.name, cookieOpts.value, {
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
      maxAge: cookieOpts.maxAge,
    });

    return response;
  } catch (err: any) {
    logger.error('[Auth] Registration server error', { error: err.message });
    return NextResponse.json(
      { success: false, error: 'Registration server error' },
      { status: 500 }
    );
  }
}
