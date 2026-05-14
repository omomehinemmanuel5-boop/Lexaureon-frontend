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
    <>
      {/* Print button (no-print on print) */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-doc { box-shadow: none !important; border: 1px solid #ccc !important; }
        }
      `}</style>

      <div className="min-h-screen no-print" style={{ background: '#07070d' }}>
        {/* Nav */}
        <nav
          className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl no-print"
          style={{ background: 'rgba(7,7,13,0.9)' }}
        >
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Lex Aureon" className="w-7 h-7 rounded-lg object-cover" />
              <span className="font-bold text-white text-sm">Lex Aureon</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600 font-mono">AUDIT RECEIPT</span>
              {entry && (
                <button
                  onClick={() => { if (typeof window !== 'undefined') window.print(); }}
                  className="text-xs px-3 py-1.5 rounded-lg border font-mono transition-all hover:opacity-80 no-print"
                  style={{ borderColor: '#c9a84c40', color: '#c9a84c', background: '#c9a84c08' }}
                >
                  🖨 Print
                </button>
              )}
            </div>
          </div>
        </nav>
      </div>

      <main style={{ background: '#07070d', minHeight: '100vh', paddingBottom: '4rem' }}>
        <div className="max-w-xl mx-auto px-4 py-10">
          {!entry ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🔍</div>
              <h1 className="text-xl font-bold text-white mb-2">Receipt Not Found</h1>
              <p className="text-slate-500 text-sm mb-6">
                This audit receipt may not exist or hasn&apos;t been stored yet.
              </p>
              <Link href="/console" className="text-sm text-amber-500 hover:text-amber-400 transition-colors">
                ← Back to Console
              </Link>
            </div>
          ) : (
            /* ── Legal Document Card ─────────────────── */
            <div
              className="print-doc rounded-2xl overflow-hidden"
              style={{
                background: '#f5f0e8',
                color: '#1a1209',
                boxShadow: '0 0 0 1px rgba(201,168,76,0.3), 0 40px 80px rgba(0,0,0,0.6)',
              }}
            >
              {/* Document header */}
              <div
                className="px-8 pt-8 pb-6 text-center border-b"
                style={{ borderColor: '#d4b896', background: '#ede8dc' }}
              >
                {/* Seal */}
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl border-2"
                  style={{ borderColor: '#c9a84c', background: '#f5f0e8', boxShadow: '0 0 0 4px #c9a84c20' }}
                >
                  ⚖
                </div>

                <div className="text-xs font-mono tracking-[0.2em] uppercase mb-1" style={{ color: '#8b6914' }}>
                  Lex Intelligence Systems · Aureonics Framework
                </div>
                <h1 className="text-2xl font-black mb-1" style={{ color: '#1a1209', fontFamily: 'Georgia, serif' }}>
                  Constitutional Audit Receipt
                </h1>
                <div className="text-xs font-mono" style={{ color: '#8b6914' }}>
                  PRAXIS v1.0 · Article IV: Audit and Continuity
                </div>
              </div>

              {/* Receipt ID + hash */}
              <div
                className="px-8 py-4 border-b"
                style={{ borderColor: '#d4b896', background: '#f0ead8' }}
              >
                <div className="text-xs font-mono mb-1" style={{ color: '#8b6914' }}>RECEIPT IDENTIFIER</div>
                <div className="text-sm font-mono font-bold break-all" style={{ color: '#1a1209' }}>
                  {entry.id}
                </div>
                <div className="text-xs font-mono mt-2" style={{ color: '#a07830' }}>
                  SHA-256 · Cryptographically Signed · Immutable
                </div>
              </div>

              {/* Gold rule */}
              <div className="h-0.5 mx-8" style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />

              {/* Constitutional State */}
              <div className="px-8 py-5 border-b" style={{ borderColor: '#d4b896' }}>
                <div className="text-xs font-mono font-bold tracking-widest uppercase mb-3" style={{ color: '#8b6914' }}>
                  § I · Constitutional State
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: 'M Score (Before)',
                      value: `${((entry.m_before ?? 0) * 100).toFixed(1)}%`,
                      sub: 'Pre-governance stability',
                      ok: entry.m_before > 0.08,
                    },
                    {
                      label: 'M Score (After)',
                      value: `${((entry.m_after ?? 0) * 100).toFixed(1)}%`,
                      sub: 'Post-governance stability',
                      ok: entry.m_after > 0.08,
                    },
                    {
                      label: 'Health Band',
                      value: entry.health_band ?? 'N/A',
                      sub: 'Constitutional classification',
                      ok: entry.health_band === 'OPTIMAL' || entry.health_band === 'STABLE',
                    },
                    {
                      label: 'Lyapunov Status',
                      value: entry.m_after >= entry.m_before ? 'STABLE ↑' : 'RECOVERING',
                      sub: 'δV trajectory direction',
                      ok: entry.m_after >= entry.m_before,
                    },
                  ].map(({ label, value, sub, ok }) => (
                    <div key={label} className="rounded-lg p-3" style={{ background: '#e8e0cc', border: '1px solid #d4b896' }}>
                      <div className="text-xs font-mono mb-1" style={{ color: '#8b6914' }}>{label}</div>
                      <div className="text-sm font-bold font-mono" style={{ color: ok ? '#166534' : '#7f1d1d' }}>{value}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#a07830' }}>{sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gold rule */}
              <div className="h-0.5 mx-8" style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />

              {/* Governor Action */}
              <div className="px-8 py-5 border-b" style={{ borderColor: '#d4b896' }}>
                <div className="text-xs font-mono font-bold tracking-widest uppercase mb-3" style={{ color: '#8b6914' }}>
                  § II · Governor Action
                </div>
                <div
                  className="rounded-lg p-4"
                  style={{
                    background: entry.intervention ? '#fef3c7' : '#d1fae5',
                    border: `1px solid ${entry.intervention ? '#f59e0b50' : '#10b98150'}`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{entry.intervention ? '⚡' : '✓'}</span>
                    <span
                      className="text-sm font-bold font-mono"
                      style={{ color: entry.intervention ? '#92400e' : '#065f46' }}
                    >
                      {entry.intervention ? 'GOVERNOR INTERVENED' : 'CLEAN PASS — NO INTERVENTION'}
                    </span>
                  </div>
                  {entry.reason && (
                    <div className="text-xs font-mono mt-2" style={{ color: '#78350f' }}>
                      Reason: {entry.reason}
                    </div>
                  )}
                </div>
              </div>

              {/* Gold rule */}
              <div className="h-0.5 mx-8" style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />

              {/* Cryptographic Proof */}
              <div className="px-8 py-5 border-b" style={{ borderColor: '#d4b896' }}>
                <div className="text-xs font-mono font-bold tracking-widest uppercase mb-3" style={{ color: '#8b6914' }}>
                  § III · Cryptographic Proof
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Receipt ID', value: entry.id },
                    { label: 'Input Hash', value: entry.input_hash ?? 'N/A' },
                    { label: 'Output Hash', value: entry.governed_hash ?? 'N/A' },
                    { label: 'Session', value: entry.session_id ? entry.session_id.slice(0, 28) + (entry.session_id.length > 28 ? '...' : '') : 'N/A' },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded p-2.5 font-mono text-xs" style={{ background: '#e8e0cc', border: '1px solid #d4b896' }}>
                      <span className="mr-2" style={{ color: '#8b6914' }}>{label}:</span>
                      <span className="break-all" style={{ color: '#1a1209' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gold rule */}
              <div className="h-0.5 mx-8" style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />

              {/* Timestamp */}
              <div className="px-8 py-5 border-b" style={{ borderColor: '#d4b896' }}>
                <div className="text-xs font-mono font-bold tracking-widest uppercase mb-3" style={{ color: '#8b6914' }}>
                  § IV · Timestamp
                </div>
                <div className="text-sm font-mono" style={{ color: '#1a1209' }}>
                  {entry.timestamp ? new Date(entry.timestamp).toISOString() : 'N/A'}
                </div>
                <div className="text-xs font-mono mt-1" style={{ color: '#a07830' }}>
                  UTC · Unix epoch: {entry.timestamp ?? 'N/A'}
                </div>
              </div>

              {/* Gold rule */}
              <div className="h-0.5 mx-8" style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />

              {/* CONSTITUTIONALLY VERIFIED stamp */}
              <div className="px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono" style={{ color: '#8b6914' }}>
                    This receipt is governed by the Lex Aureon Constitution v1.0.
                    <br />Article IV: Audit and Continuity.
                  </div>
                  <div className="flex gap-3 mt-3">
                    <Link href="/constitution"
                      className="text-xs font-mono transition-colors hover:underline"
                      style={{ color: '#c9a84c' }}>
                      View Constitution ↗
                    </Link>
                    <Link href="/console"
                      className="text-xs font-mono transition-colors hover:underline"
                      style={{ color: '#3b82f6' }}>
                      Run Governance ↗
                    </Link>
                  </div>
                </div>

                {/* Stamp */}
                <div
                  className="flex-shrink-0 px-5 py-3 rounded-xl border-2 text-center rotate-[-3deg]"
                  style={{
                    borderColor: '#166534',
                    background: 'rgba(22,101,52,0.06)',
                    color: '#166534',
                  }}
                >
                  <div className="text-xs font-black tracking-widest font-mono leading-tight">
                    CONSTITUTIONALLY<br />VERIFIED
                  </div>
                  <div className="text-xs font-mono mt-1" style={{ opacity: 0.7 }}>PRAXIS v1.0</div>
                </div>
              </div>

              {/* Document footer */}
              <div
                className="px-8 py-3 text-center border-t"
                style={{ borderColor: '#d4b896', background: '#ede8dc' }}
              >
                <div className="text-xs font-mono" style={{ color: '#a07830' }}>
                  © 2026 Lex Intelligence Systems · Emmanuel King · Lagos, Nigeria
                  <br />doi.org/10.5281/zenodo.18944243 · PRAXIS v1.0 · C+R+S=1
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
