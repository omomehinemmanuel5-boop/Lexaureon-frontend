import { NextResponse } from 'next/server';
import { getClient, getTotalRuns } from '@/lib/db';

export async function GET() {
  const db = getClient();
  let runs = 0;
  let statsReadable = true;

  try {
    runs = await getTotalRuns();
  } catch {
    statsReadable = false;
  }

  return NextResponse.json({
    ok: statsReadable,
    api: statsReadable ? 'healthy' : 'degraded',
    now: new Date().toISOString(),
    storage: {
      mode: db ? 'turso' : 'memory',
      stats_readable: statsReadable,
    },
    counters: {
      total_runs: runs,
    },
    frontend_contract: {
      routes: {
        lex_run: '/api/lex/run',
        stats: '/api/stats',
        health: '/api/health',
      },
      required_fields: ['raw_output', 'governed_output', 'metrics', 'intervention', 'audit_id'],
    },
  });
}
