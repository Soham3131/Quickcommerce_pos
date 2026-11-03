import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const docsDir = path.join(process.cwd(), 'docs');

    if (fs.existsSync(docsDir)) {
      const files = fs.readdirSync(docsDir);
      // Find the first image file supplied by user in docs
      const imageFile = files.find((f) =>
        /\.(png|jpe?g|webp|svg|avif)$/i.test(f)
      );

      if (imageFile) {
        const filePath = path.join(docsDir, imageFile);
        const fileBuffer = fs.readFileSync(filePath);
        const ext = path.extname(imageFile).toLowerCase().replace('.', '');
        const contentType =
          ext === 'svg'
            ? 'image/svg+xml'
            : ext === 'png'
            ? 'image/png'
            : ext === 'webp'
            ? 'image/webp'
            : 'image/jpeg';

        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });
      }
    }

    // High-resolution verified fallback if user hasn't dropped image yet
    return NextResponse.redirect(
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
      307
    );
  } catch (error) {
    return NextResponse.redirect(
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
      307
    );
  }
}
