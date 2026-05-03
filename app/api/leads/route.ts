import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email } = await req.json() as { email?: string };
    if (!email?.includes('@')) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });

    const db = getClient();
    if (db) {
      await db.execute({
        sql: `CREATE TABLE IF NOT EXISTS leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch())
        )`,
        args: [],
      });
      await db.execute({
        sql: `INSERT OR IGNORE INTO leads (email) VALUES (?)`,
        args: [email],
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('leads:', e);
    return NextResponse.json({ ok: true }); // Don't block user
  }
}
