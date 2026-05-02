import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.LEX_API_BASE_URL ?? 'https://api.lexaureon.com';

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const res = await fetch(`${BACKEND}/auth/me`, {
      headers: { Authorization: auth },
    });
    const data = await res.json() as Record<string, unknown>;
    if (!res.ok) {
      return NextResponse.json(
        { error: (data.detail as string) ?? 'Unauthorized' },
        { status: res.status },
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
