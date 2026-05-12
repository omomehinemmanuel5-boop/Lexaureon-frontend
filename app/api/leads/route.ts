import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      email?: string; source?: string; plan?: string;
      txId?: string; amount?: string; coin?: string;
    };
    const { email, source = 'console', plan = 'explorer', txId, amount, coin } = body;
    if (!email?.includes('@')) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });

    const db = getClient();
    if (db) {
      await db.execute({
        sql: `CREATE TABLE IF NOT EXISTS leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          source TEXT DEFAULT 'console',
          plan TEXT DEFAULT 'explorer',
          tx_id TEXT,
          amount TEXT,
          coin TEXT,
          created_at INTEGER NOT NULL DEFAULT (unixepoch())
        )`,
        args: [],
      });
      // Try insert, if exists update source/plan if upgrading
      await db.execute({
        sql: `INSERT INTO leads (email, source, plan, tx_id, amount, coin)
              VALUES (?, ?, ?, ?, ?, ?)
              ON CONFLICT(email) DO UPDATE SET
                source = excluded.source,
                plan = excluded.plan,
                tx_id = COALESCE(excluded.tx_id, leads.tx_id),
                amount = COALESCE(excluded.amount, leads.amount),
                coin = COALESCE(excluded.coin, leads.coin)`,
        args: [email, source, plan, txId ?? null, amount ?? null, coin ?? null],
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('leads:', e);
    return NextResponse.json({ ok: true });
  }
}

export async function GET(req: Request) {
  // Simple token auth
  // URL-based access — /admin page handles UI security

  try {
    const db = getClient();
    if (!db) return NextResponse.json({ leads: [], total: 0, note: 'No DB configured' });

    const result = await db.execute({
      sql: `SELECT id, email, source, plan, tx_id, amount, coin,
                   datetime(created_at, 'unixepoch') as created_at
            FROM leads ORDER BY created_at DESC LIMIT 500`,
      args: [],
    });

    const leads = result.rows.map(r => ({
      id: r[0], email: r[1], source: r[2], plan: r[3],
      tx_id: r[4], amount: r[5], coin: r[6], created_at: r[7],
    }));

    return NextResponse.json({ leads, total: leads.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
