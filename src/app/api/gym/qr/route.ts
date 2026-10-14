import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gymId = searchParams.get('gymId') || 'fit-fiber-gym';
  const format = searchParams.get('format') || 'png'; // 'png' | 'svg'
  const isDownload = searchParams.get('download') === 'true';

  const proto = request.headers.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');

  let baseUrl = '';
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    baseUrl = `${proto}://${host}`;
  } else if (process.env.NEXT_PUBLIC_APP_URL) {
    baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  } else {
    baseUrl = `${proto}://${host || 'localhost:3000'}`;
  }

  const targetUrl = `${baseUrl.replace(/\/$/, '')}/check-in/${gymId}`;

  try {
    if (format === 'svg') {
      const svgString = await QRCode.toString(targetUrl, {
        type: 'svg',
        margin: 2,
        width: 600,
        color: {
          dark: '#0b0f17',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });

      return new NextResponse(svgString, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          ...(isDownload
            ? { 'Content-Disposition': `attachment; filename="fit-fiber-gym-wall-qr-${gymId}.svg"` }
            : {}),
        },
      });
    }

    // Default: High-Resolution 1024x1024 PNG image buffer
    const pngBuffer = await QRCode.toBuffer(targetUrl, {
      type: 'png',
      margin: 2,
      width: 1024,
      color: {
        dark: '#0b0f17',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });

    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        ...(isDownload
          ? { 'Content-Disposition': `attachment; filename="fit-fiber-gym-wall-qr-${gymId}.png"` }
          : {}),
      },
    });
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}
