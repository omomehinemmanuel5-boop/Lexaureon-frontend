'use client';
import { useState, useEffect } from 'react';

const G = { gold: '#c9a84c', goldL: '#e8c96d', navy: '#07070d', surface: '#0f1017', border: '#1a2030' };

type Lead = {
  id: number; email: string; source: string; plan: string;
  tx_id: string | null; amount: string | null; coin: string | null; created_at: string;
};

export default function AdminPage() {
  const [token] = useState('lex2026');
  const [authed, setAuthed] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [copied, setCopied] = useState(false);

  const login = async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`/api/leads?token=${token}`);
      const data = await r.json();
      if (!r.ok) { setError('Wrong password'); return; }
      setLeads(data.leads || []);
      setAuthed(true);
    } catch {
      setError('Connection failed');
    } finally { setLoading(false); }
  };

  const refresh = async () => {
    setLoading(true);
    const r = await fetch(`/api/leads?token=${token}`);
    const data = await r.json();
    setLeads(data.leads || []);
    setLoading(false);
  };

  const exportCSV = () => {
    const rows = [
      ['Email', 'Plan', 'Source', 'Coin', 'Amount', 'TX ID', 'Date'],
      ...filtered.map(l => [l.email, l.plan, l.source, l.coin ?? '', l.amount ?? '', l.tx_id ?? '', l.created_at]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `lexaureon-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const copyEmails = () => {
    navigator.clipboard.writeText(filtered.map(l => l.email).join('\n'));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const filtered = filter === 'all' ? leads
    : filter === 'paid' ? leads.filter(l => l.tx_id)
    : leads.filter(l => l.plan === filter);

  const stats = {
    total: leads.length,
    paid: leads.filter(l => l.tx_id).length,
    sovereign: leads.filter(l => l.plan === 'sovereign').length,
    today: leads.filter(l => l.created_at?.startsWith(new Date().toISOString().split('T')[0])).length,
  };

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: G.navy }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: G.surface, border: `1px solid ${G.border}` }}>
        <div className="text-center mb-6">
          <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.2em', color: G.gold, marginBottom: 8 }}>LEX AUREON</div>
          <h1 className="text-white font-bold text-xl">Admin Dashboard</h1>
          <p className="text-slate-500 text-xs mt-1">Leads · Payments · Analytics</p>
        </div>
        <input
          type="password"
          value={token}
          onChange={e => setToken(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="Admin password"
          className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none mb-3"
          style={{ background: '#060810', border: `1px solid ${G.border}` }}
        />
        {error && <p className="text-red-400 text-xs mb-3 text-center">{error}</p>}
        <button onClick={login} disabled={!token || loading}
          className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`, color: '#07070d' }}>
          {loading ? 'Checking...' : 'Enter →'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: G.navy, color: '#c4cfe0' }}>

      {/* Header */}
      <div style={{ background: G.surface, borderBottom: `1px solid ${G.border}` }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.15em', color: G.gold }}>LEX AUREON</span>
            <h1 className="text-white font-bold text-lg">Admin Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={refresh} disabled={loading}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#8a9ab0', border: `1px solid ${G.border}` }}>
              {loading ? '...' : '↺ Refresh'}
            </button>
            <button onClick={copyEmails}
              className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
              style={{ background: 'rgba(201,168,76,0.15)', color: G.gold, border: `1px solid rgba(201,168,76,0.3)` }}>
              {copied ? '✓ Copied' : '📋 Copy Emails'}
            </button>
            <button onClick={exportCSV}
              className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
              style={{ background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`, color: '#07070d' }}>
              ↓ CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-4">
          {[
            { label: 'Total Leads', value: stats.total, color: '#4b8fff' },
            { label: 'Today', value: stats.today, color: '#00e5a0' },
            { label: 'Sovereign', value: stats.sovereign, color: G.gold },
            { label: 'Paid (BTC)', value: stats.paid, color: '#f7931a' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4" style={{ background: G.surface, border: `1px solid ${G.border}` }}>
              <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.15em', color: '#4a5870', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: 'monospace' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {['all', 'paid', 'sovereign', 'explorer'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all capitalize"
              style={{
                background: filter === f ? `rgba(201,168,76,0.15)` : 'rgba(255,255,255,0.03)',
                color: filter === f ? G.gold : '#4a5870',
                border: `1px solid ${filter === f ? 'rgba(201,168,76,0.3)' : G.border}`,
              }}>
              {f} {f === 'all' ? `(${leads.length})` : f === 'paid' ? `(${stats.paid})` : ''}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden" style={{ background: G.surface, border: `1px solid ${G.border}` }}>
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p style={{ color: '#4a5870', fontFamily: 'monospace', fontSize: 12 }}>No leads yet. Share your console link to start collecting.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${G.border}` }}>
                    {['Email', 'Plan', 'Source', 'Payment', 'Date'].map(h => (
                      <th key={h} style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.12em', color: '#4a5870', textTransform: 'uppercase', textAlign: 'left', padding: '10px 14px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, i) => (
                    <tr key={lead.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid rgba(26,32,48,0.5)` : 'none' }}>
                      <td style={{ padding: '12px 14px', color: '#c4cfe0' }}>{lead.email}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          fontFamily: 'monospace', fontSize: 10, padding: '2px 7px', borderRadius: 4,
                          background: lead.plan === 'sovereign' ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.05)',
                          color: lead.plan === 'sovereign' ? G.gold : '#4a5870',
                          border: `1px solid ${lead.plan === 'sovereign' ? 'rgba(201,168,76,0.3)' : G.border}`,
                        }}>{lead.plan}</span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#4a5870', fontFamily: 'monospace', fontSize: 11 }}>{lead.source}</td>
                      <td style={{ padding: '12px 14px' }}>
                        {lead.tx_id ? (
                          <div>
                            <span style={{ color: '#f7931a', fontSize: 11, fontFamily: 'monospace' }}>{lead.coin} · {lead.amount}</span>
                            <div style={{ color: '#4a5870', fontSize: 10, fontFamily: 'monospace', marginTop: 2 }}>{lead.tx_id?.slice(0, 16)}...</div>
                          </div>
                        ) : <span style={{ color: '#4a5870', fontSize: 11 }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#4a5870', fontFamily: 'monospace', fontSize: 11 }}>
                        {lead.created_at?.replace('T', ' ').slice(0, 16)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#4a5870', textAlign: 'center', marginTop: 24 }}>
          ⚖ Lex Aureon Admin · {filtered.length} records shown · Turso DB
        </p>
      </div>
    </div>
  );
}
