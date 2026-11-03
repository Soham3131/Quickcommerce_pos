import { NextRequest } from 'next/server';
import { verifyJwt, TokenPayload } from './jwt';
import { env } from '../env';

export const SESSION_COOKIE_NAME = 'avani_session';

export interface CookieOptions {
  name: string;
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
  maxAge: number;
}

export function getSessionCookieOptions(token: string, maxAge = env.SESSION_MAX_AGE_SECONDS): CookieOptions {
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  };
}

export function getClearSessionCookieOptions(): CookieOptions {
  return {
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  };
}

/**
 * Extract and verify token payload from NextRequest or standard Request headers.
 */
export function getSessionFromRequest(request: NextRequest | Request): TokenPayload | null {
  try {
    // 1. Check Authorization Bearer header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyJwt(token);
      if (payload) return payload;
    }

    // 2. Check Cookie header
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';').map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith(`${SESSION_COOKIE_NAME}=`)) {
        const token = cookie.substring(SESSION_COOKIE_NAME.length + 1);
        return verifyJwt(token);
      }
    }

    return null;
  } catch {
    return null;
  }
}
