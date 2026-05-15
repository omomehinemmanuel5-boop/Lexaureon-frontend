import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Fail secure: if env var is not set, block all access
  if (!adminPassword) {
    return new NextResponse('Admin access is not configured', { status: 503 });
  }

  const auth = req.headers.get('authorization');
  if (auth) {
    const spaceIdx = auth.indexOf(' ');
    const scheme = auth.slice(0, spaceIdx);
    const encoded = auth.slice(spaceIdx + 1);
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded);
      const colonIdx = decoded.indexOf(':');
      const password = decoded.slice(colonIdx + 1);
      if (password === adminPassword) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Lex Aureon Admin"' },
  });
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
