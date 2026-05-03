import { NextResponse } from 'next/server';
import { getTotalRuns } from '@/lib/db';

export async function GET() {
  const runs = await getTotalRuns();
  return NextResponse.json({ runs });
}
