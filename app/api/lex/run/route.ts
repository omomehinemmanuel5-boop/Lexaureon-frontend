import { NextResponse } from 'next/server';
import { runPraxis } from '@/lib/praxis';
import { seedSovereignLaws } from '@/lib/db';
import { validateAndConsumeKey } from '@/lib/api_keys';

export async function POST(req: Request) {
  try {
    await seedSovereignLaws().catch(() => {});

    const body = await req.json() as { prompt?: string; session_id?: string };

    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }
    if (body.prompt.length > 8000) {
      return NextResponse.json({ error: 'Prompt too long' }, { status: 400 });
    }

    // ── API Key Auth (developer access) ─────────────────────────────────
    const apiKeyHeader =
      req.headers.get('x-api-key') ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    if (apiKeyHeader?.startsWith('lex_sk_')) {
      const validation = await validateAndConsumeKey(apiKeyHeader);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 429 });
      }
      const result = await runPraxis(
        body.prompt,
        body.session_id ?? `api_${validation.key!.id}`,
      );
      return NextResponse.json({
        ...result,
        api_key_info: {
          plan: validation.key!.plan,
          runs_used: validation.key!.runs_used,
          runs_limit: validation.key!.runs_limit,
          runs_remaining: validation.key!.runs_limit - validation.key!.runs_used,
        },
      });
    }

    // ── Console / UI (existing behaviour) ────────────────────────────────
    const result = await runPraxis(body.prompt, body.session_id ?? 'anonymous');
    return NextResponse.json(result);

  } catch (e) {
    console.error('PRAXIS error:', e);
    return NextResponse.json({ error: String(e).slice(0, 200) }, { status: 500 });
  }
}
