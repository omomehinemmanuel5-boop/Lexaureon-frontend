import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.LEX_API_BASE_URL ?? 'https://api.lexaureon.com';

/* Proxy to Python backend /billing/checkout.
   If a NEXT_PUBLIC_PRO_CHECKOUT_URL (Stripe link) is set, redirect there instead. */
export async function POST(req: NextRequest) {
  const stripeUrl = process.env.NEXT_PUBLIC_PRO_CHECKOUT_URL;
  if (stripeUrl) {
    return NextResponse.json({ checkout_url: stripeUrl });
  }

  try {
    const auth = req.headers.get('authorization');
    const body = await req.json() as Record<string, unknown>;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth) headers['Authorization'] = auth;

    const res = await fetch(`${BACKEND}/billing/checkout`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });

    const data = await res.json() as Record<string, unknown>;
    if (!res.ok) {
      return NextResponse.json(
        { error: (data.detail as string) ?? 'Checkout failed' },
        { status: res.status },
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Billing service unavailable' }, { status: 503 });
  }
}
