import { NextResponse } from 'next/server';
import { revokeKey } from '@/lib/api_keys';

// DELETE /api/keys/revoke — revoke a key
export async function DELETE(req: Request) {
  try {
    const { id, email } = await req.json() as { id?: string; email?: string };
    if (!id || !email?.includes('@')) {
      return NextResponse.json({ error: 'Key ID and email required' }, { status: 400 });
    }
    const ok = await revokeKey(id, email);
    if (!ok) return NextResponse.json({ error: 'Key not found or email mismatch' }, { status: 404 });
    return NextResponse.json({ ok: true, message: 'Key revoked.' });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 200) }, { status: 500 });
  }
}
