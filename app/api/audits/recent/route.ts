import { NextResponse } from 'next/server';
import { getRecentAudits } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limitParam = Number(searchParams.get('limit') ?? '10');
  const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(50, Math.floor(limitParam))) : 10;

  const audits = await getRecentAudits(limit);
  return NextResponse.json({ audits });
}
