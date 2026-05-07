import { NextResponse } from 'next/server';
import { getLatestSessionState, getTotalRuns } from '@/lib/db';

export async function GET() {
  const latest = await getLatestSessionState();
  const totalRuns = await getTotalRuns();

  const fallback = { C: 0.333, R: 0.333, S: 0.334, M: 0.333 };
  const state = latest?.state
    ? {
        C: latest.state.C,
        R: latest.state.R,
        S: latest.state.S,
        M: Math.min(latest.state.C, latest.state.R, latest.state.S),
      }
    : fallback;

  return NextResponse.json({
    session_id: latest?.id ?? null,
    state,
    total_runs: totalRuns,
  });
}
