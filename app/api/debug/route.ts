import { NextResponse } from 'next/server';

// Debug endpoint — restricted to internal Vercel checks only
export async function GET(req: Request) {
  const host = req.headers.get('host') ?? '';
  const isVercel = req.headers.get('x-vercel-id') !== null;
  const secret = req.headers.get('x-debug-secret');
  const expectedSecret = process.env.DEBUG_SECRET;

  // Only allow with correct secret or internal Vercel health checks
  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ ok: true, status: 'operational' });
  }

  return NextResponse.json({
    ok: true,
    groq: !!process.env.GROQ_API_KEY,
    turso: !!process.env.TURSO_DATABASE_URL,
    jina: !!process.env.JINA_API_KEY,
    host,
    isVercel,
  });
}
