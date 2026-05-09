import { NextResponse } from 'next/server';
import { generateApiKey, getKeysByEmail } from '@/lib/api_keys';

// POST /api/keys — generate a new API key
export async function POST(req: Request) {
  try {
    const { email, name, plan } = await req.json() as {
      email?: string;
      name?: string;
      plan?: 'free' | 'sovereign';
    };

    if (!email?.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Free tier: max 3 keys per email
    const existing = await getKeysByEmail(email);
    if (existing.length >= 3 && plan !== 'sovereign') {
      return NextResponse.json({
        error: 'Free tier limit: 3 keys per email. Upgrade to Sovereign for unlimited keys.',
      }, { status: 429 });
    }

    const apiKey = await generateApiKey({ email, name, plan });
    if (!apiKey) {
      return NextResponse.json({ error: 'Failed to generate key' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      key: apiKey.key,
      id: apiKey.id,
      name: apiKey.name,
      plan: apiKey.plan,
      runs_limit: apiKey.runs_limit,
      message: `Your API key has been generated. Store it safely — it won't be shown again.`,
    });

  } catch (e) {
    console.error('keys POST:', e);
    return NextResponse.json({ error: String(e).slice(0, 200) }, { status: 500 });
  }
}

// GET /api/keys?email=xxx — list keys for an email
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email?.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const keys = await getKeysByEmail(email);

    // Mask the key — only show prefix + last 4 chars
    const masked = keys.map(k => ({
      id: k.id,
      name: k.name,
      key_preview: `${k.key.slice(0, 10)}...${k.key.slice(-4)}`,
      plan: k.plan,
      runs_used: k.runs_used,
      runs_limit: k.runs_limit,
      created_at: k.created_at,
      last_used_at: k.last_used_at,
    }));

    return NextResponse.json({ ok: true, keys: masked, total: masked.length });

  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 200) }, { status: 500 });
  }
}
