import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.LEX_API_BASE_URL ?? 'https://api.lexaureon.com';

type BackendMetrics = { meaning?: number; entropy?: number } | null | undefined;
type DiffChunk = { type: 'removed' | 'added' | 'unchanged'; text: string };

function deriveMetrics(raw: Record<string, unknown>) {
  const M =
    typeof raw.M === 'number'
      ? raw.M
      : Math.max(0, 1 - ((raw.semantic_diff_score as number) ?? 0.5));
  const backendMetrics = raw.metrics as BackendMetrics;
  const meaning = Math.min(1, Math.max(0, (backendMetrics?.meaning ?? 70) / 100));
  const entropy = Math.min(1, Math.max(0, (backendMetrics?.entropy ?? 30) / 100));

  // C = meaning preservation, S = stability (inverse entropy), R = balance
  const c = Math.max(M, meaning);
  const s = Math.max(M, 1 - entropy);
  const r = Math.max(M, (c + s) / 2);
  const total = c + r + s;
  return { c: c / total, r: r / total, s: s / total, m: M };
}

function mapDiff(chunks: DiffChunk[] | undefined) {
  if (!chunks?.length) return undefined;
  return {
    removed: chunks.filter((d) => d.type === 'removed').map((d) => d.text),
    added: chunks.filter((d) => d.type === 'added').map((d) => d.text),
    unchanged: chunks.filter((d) => d.type === 'unchanged').map((d) => d.text),
  };
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    const auth = req.headers.get('authorization');
    const fwdHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth) fwdHeaders['Authorization'] = auth;

    const runRes = await fetch(`${BACKEND}/lex/run`, {
      method: 'POST',
      headers: fwdHeaders,
      body: JSON.stringify({ prompt }),
    });

    if (!runRes.ok) {
      const err = await runRes.json().catch(() => ({})) as Record<string, unknown>;
      return NextResponse.json(
        { error: (err.detail as string) ?? 'Backend error' },
        { status: runRes.status },
      );
    }

    const data = await runRes.json() as Record<string, unknown>;

    // Generate trust receipt (non-fatal — best effort)
    let trust_receipt = null;
    try {
      const receiptRes = await fetch(`${BACKEND}/lex/trust-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...fwdHeaders },
        body: JSON.stringify({ prompt, response: data }),
      });
      if (receiptRes.ok) trust_receipt = await receiptRes.json();
    } catch {
      // trust receipt failure never blocks the main response
    }

    return NextResponse.json({
      raw_output: data.raw_output,
      governed_output: data.governed_output,
      metrics: deriveMetrics(data),
      intervention: {
        triggered: Boolean(data.intervention),
        reason: (data.intervention_reason as string) || undefined,
      },
      diff: mapDiff(data.diff as DiffChunk[] | undefined),
      upgrade_required: data.upgrade_required ?? false,
      trust_receipt,
    });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
