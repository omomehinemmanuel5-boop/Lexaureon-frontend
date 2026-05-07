import { Metadata } from 'next';
import Link from 'next/link';
import { getClient } from '@/lib/db';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Audit Receipt ${id} — Lex Aureon`,
    description: 'Cryptographically signed constitutional governance audit receipt.',
  };
}

async function getAuditEntry(id: string) {
  const db = getClient();
  if (!db) return null;
  try {
    await db.execute({
      sql: `CREATE TABLE IF NOT EXISTS audit_log (
        id TEXT PRIMARY KEY, session_id TEXT, timestamp INTEGER,
        m_before REAL, m_after REAL, health TEXT, intervention INTEGER DEFAULT 0,
        reason TEXT, input_hash TEXT, governed_hash TEXT, health_band TEXT,
        created_at INTEGER DEFAULT (unixepoch())
      )`,
      args: [],
    });
    const r = await db.execute({ sql: 'SELECT * FROM audit_log WHERE id = ?', args: [id] });
    if (!r.rows.length) return null;
    const row = r.rows[0];
    return {
      id: row.id as string,
      session_id: row.session_id as string,
      timestamp: row.timestamp as number,
      m_before: row.m_before as number,
      m_after: row.m_after as number,
      health: row.health as string,
      intervention: (row.intervention as number) === 1,
      reason: row.reason as string,
      input_hash: row.input_hash as string,
      governed_hash: row.governed_hash as string,
      health_band: row.health_band as string,
    };
  } catch { return null; }
}

export default async function AuditPage({ params }: Props) {
  const { id } = await params;
  const entry = await getAuditEntry(id);

  return (
    <div className="min-h-screen text-white" style={{ background: '#07070d' }}>

      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl"
        style={{ background: 'rgba(7,7,13,0.9)' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Lex Aureon" className="w-7 h-7 rounded-lg object-cover"/>
            <span className="font-bold text-white text-sm">Lex Aureon</span>
          </Link>
          <span className="text-xs text-slate-600 font-mono">AUDIT RECEIPT</span>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-4 py-12">
        {!entry ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <h1 className="text-xl font-bold text-white mb-2">Receipt Not Found</h1>
            <p className="text-slate-500 text-sm mb-6">
              This audit receipt may not exist or hasn&apos;t been stored yet.
            </p>
            <Link href="/console"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              ← Back to Console
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-xs text-amber-600 font-mono uppercase tracking-widest mb-2">
                Constitutional Audit Receipt
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {entry.intervention ? '⚡ Governor Intervened' : '✓ Clean Pass'}
              </h1>
              <p className="text-slate-500 text-sm font-mono">
                {new Date(entry.timestamp).toISOString()}
              </p>
            </div>

            {/* Gold divider */}
            <div className="h-px" style={{
              background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)'
            }}/>

            {/* Status card */}
            <div className={`rounded-2xl border p-5 ${
              entry.intervention
                ? 'bg-amber-900/10 border-amber-800/40'
                : 'bg-emerald-900/10 border-emerald-800/30'
            }`}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Health Band', value: entry.health_band ?? 'N/A',
                    color: entry.health_band === 'OPTIMAL' ? 'text-emerald-400'
                      : entry.health_band === 'CRITICAL' ? 'text-red-400' : 'text-amber-400' },
                  { label: 'Governor', value: entry.intervention ? 'INTERVENED' : 'PASSED',
                    color: entry.intervention ? 'text-amber-400' : 'text-emerald-400' },
                  { label: 'M Before', value: `${((entry.m_before??0)*100).toFixed(0)}%`,
                    color: 'text-slate-300' },
                  { label: 'M After', value: `${((entry.m_after??0)*100).toFixed(0)}%`,
                    color: entry.m_after > entry.m_before ? 'text-emerald-400' : 'text-red-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-slate-900/40 rounded-xl p-3">
                    <div className="text-xs text-slate-600 mb-1">{label}</div>
                    <div className={`text-sm font-bold font-mono ${color}`}>{value}</div>
                  </div>
                ))}
              </div>
              {entry.reason && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <div className="text-xs text-slate-500 mb-1">Reason</div>
                  <div className="text-xs text-slate-300 font-mono">{entry.reason}</div>
                </div>
              )}
            </div>

            {/* Cryptographic proof */}
            <div className="rounded-2xl border border-white/6 p-5 font-mono text-xs"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-slate-500 uppercase tracking-wider mb-3">Cryptographic Proof</div>
              <div className="space-y-2">
                {[
                  { label: 'Receipt ID', value: entry.id },
                  { label: 'Input Hash', value: entry.input_hash },
                  { label: 'Output Hash', value: entry.governed_hash },
                  { label: 'Session', value: entry.session_id?.slice(0,20) + '...' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-3">
                    <span className="text-slate-600 w-24 flex-shrink-0">{label}</span>
                    <span className="text-slate-300 break-all">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Constitution reference */}
            <div className="rounded-2xl border border-white/5 p-4 text-center"
              style={{ background: 'rgba(255,255,255,0.01)' }}>
              <p className="text-xs text-slate-600 mb-3">
                This receipt is governed by the Lex Aureon Constitution v1.0 —
                Article IV: Audit and Continuity.
              </p>
              <div className="flex justify-center gap-3">
                <Link href="/constitution"
                  className="text-xs text-amber-600 hover:text-amber-500 transition-colors">
                  View Constitution
                </Link>
                <span className="text-slate-700">·</span>
                <Link href="/console"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Run Governance
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
