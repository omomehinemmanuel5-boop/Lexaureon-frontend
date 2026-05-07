import { NextResponse } from 'next/server';
import { runPraxis } from '@/lib/praxis';
import { seedSovereignLaws } from '@/lib/db';

export async function POST(req: Request) {
  try {
    await seedSovereignLaws().catch(() => {}); // seed laws on first run
    const body = await req.json() as { prompt?: string; session_id?: string };
    if (!body.prompt?.trim()) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    if (body.prompt.length > 8000) return NextResponse.json({ error: 'Prompt too long' }, { status: 400 });

    const result = await runPraxis(body.prompt, body.session_id ?? 'anonymous');
    return NextResponse.json(result);

  } catch (e) {
    console.error('PRAXIS error:', e);
    return NextResponse.json({ error: String(e).slice(0, 200) }, { status: 500 });
  }
}
