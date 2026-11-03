import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { env, isCloudinaryConfigured } from '@/lib/env';
import { getSessionFromRequest } from '@/lib/auth/session';
import { requireAdmin, createAuthErrorResponse } from '@/lib/auth/rbac';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    requireAdmin(session);

    if (!isCloudinaryConfigured()) {
      return NextResponse.json({
        success: false,
        isConfigured: false,
        message: 'Cloudinary credentials are not configured in .env.local. Direct image URLs are supported.',
      });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'avani-grocers';

    // Generate SHA-1 / SHA-256 signature for client signed upload
    const signatureString = `folder=${folder}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

    return NextResponse.json({
      success: true,
      isConfigured: true,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      timestamp,
      folder,
      signature,
      uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    });
  } catch (err: any) {
    return createAuthErrorResponse(err);
  }
}
