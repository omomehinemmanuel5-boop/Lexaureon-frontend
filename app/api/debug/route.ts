import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return new NextResponse('Admin access is not configured', { status: 503 });
  }

  const auth = req.headers.get('authorization');
  let authorized = false;
  if (auth?.startsWith('Basic ')) {
    try {
      const decoded = atob(auth.slice(6));
      const colonIdx = decoded.indexOf(':');
      const password = decoded.slice(colonIdx + 1);
      if (password === adminPassword) authorized = true;
    } catch { /* malformed base64 */ }
  }

  if (!authorized) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Lex Aureon Admin"' },
    });
  }

  const host = req.headers.get('host') ?? '';
  const isVercel = req.headers.get('x-vercel-id') !== null;

  return NextResponse.json({
    ok: true,
    groq: !!process.env.GROQ_API_KEY,
    turso: !!process.env.TURSO_DATABASE_URL,
    jina: !!process.env.JINA_API_KEY,
    host,
    isVercel,
  });
}
