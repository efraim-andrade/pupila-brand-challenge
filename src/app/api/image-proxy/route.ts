import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return new NextResponse('Invalid url parameter', { status: 400 });
  }

  if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
    return new NextResponse('Only http/https URLs are allowed', {
      status: 400,
    });
  }

  const response = await fetch(parsedUrl.toString(), {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; image-proxy/1.0)' },
  });

  if (!response.ok) {
    return new NextResponse('Failed to fetch image', {
      status: response.status,
    });
  }

  const contentType = response.headers.get('content-type') ?? 'image/jpeg';
  if (!contentType.startsWith('image/')) {
    return new NextResponse('URL does not point to an image', { status: 422 });
  }

  const body = await response.arrayBuffer();
  return new NextResponse(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
