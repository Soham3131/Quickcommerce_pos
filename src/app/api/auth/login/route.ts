import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/server/services/auth.service';
import { getSessionCookieOptions } from '@/lib/auth/session';
import { validateRequestBody, loginSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const validation = await validateRequestBody(req, loginSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { email, password } = validation.data;
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    const result = await loginUser(email, password);

    if (!result.success || !result.token) {
      logger.logLoginAttempt(email, 'unknown', false, ip, result.error);
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }

    logger.logLoginAttempt(email, result.user?.role || 'customer', true, ip);

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
    logger.error('[Auth] Login unexpected server error', { error: err.message });
    return NextResponse.json(
      { success: false, error: 'Internal authentication server error' },
      { status: 500 }
    );
  }
}
