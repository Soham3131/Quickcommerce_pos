import { NextResponse } from 'next/server';
import { getClearSessionCookieOptions } from '@/lib/auth/session';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  const cookieOpts = getClearSessionCookieOptions();

  response.cookies.set(cookieOpts.name, cookieOpts.value, {
    httpOnly: cookieOpts.httpOnly,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    path: cookieOpts.path,
    maxAge: 0,
  });

  return response;
}
