'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import SignalPillBar from '@/components/SignalPillBar';

import UpgradeModal from '@/components/UpgradeModal';
import DynamicSimplex from '@/components/DynamicSimplex';
import EmailCapture from '@/components/EmailCapture';
import { GovernanceResponse } from '@/types';

const MAX_CALLS = 10;
type Tab = 'governed' | 'raw' | 'analysis' | 'audit';

/* ── Metric Bar ───────────────────────────────────────────── */
function MBar({ label, value, color, sub }: { label: string; value: number; color: string; sub: string }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 100); return () => clearTimeout(t); }, [value]);
  const cfg: Record<string, { bar: string; text: string; border: string; bg: string }> = {
    blue:   { bar:'bg-blue-500',   text:'text-blue-400',   border:'border-blue-800/50', bg:'bg-blue-900/10' },
    green:  { bar:'bg-emerald-500',text:'text-emerald-400',border:'border-emerald-800/50',bg:'bg-emerald-900/10' },
    amber:  { bar:'bg-amber-500',  text:'text-amber-400',  border:'border-amber-800/50', bg:'bg-amber-900/10' },
    cyan:   { bar:'bg-cyan-500',   text:'text-cyan-400',   border:'border-cyan-800/50',  bg:'bg-cyan-900/10' },
    red:    { bar:'bg-red-500',    text:'text-red-400',    border:'border-red-800',       bg:'bg-red-900/10' },
  };
  const c = cfg[color] ?? cfg.blue;
  return (
    <div className={`rounded-xl border p-3 ${c.border} ${c.bg}`}>
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <span className="text-xs font-bold text-white">{label}</span>
          <span className="text-xs text-slate-600 ml-1.5">{sub}</span>
        </div>
        <span className={`text-sm font-black ${c.text}`}>{(value*100).toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${c.bar} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${w*100}%` }}/>
      </div>
    </div>
  );
}

/* ── Stability Strip ──────────────────────────────────────── */
function StabilityStrip({ m, health }: { m: number; health: string }) {
  const safe = health === 'SAFE';
  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border text-xs font-mono ${
      safe ? 'bg-emerald-900/10 border-emerald-800/40 text-emerald-400'
           : 'bg-red-900/10 border-red-800/50 text-red-400'
    }`}>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${safe ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}`}/>
      <span className="font-bold">STABILITY: {health}</span>
      <span className="text-slate-500 mx-1">·</span>
      <span>M = {(m*100).toFixed(1)}%</span>
      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden ml-2">
        <div className={`h-full rounded-full transition-all duration-1000 ${safe ? 'bg-emerald-500' : 'bg-red-500'}`}
          style={{ width: `${Math.min(100, m/0.5*100)}%` }}/>
      </div>
    </div>
  );
}

/* ── Main Console ─────────────────────────────────────────── */
export default function Console() {
  const [prompt, setPrompt]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [res, setRes]           = useState<GovernanceResponse | null>(null);
  const [apiCalls, setApiCalls] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [tab, setTab]           = useState<Tab>('governed');
  const [pulse, setPulse]       = useState(false);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [healthBand, setHealthBand] = useState('OPTIMAL');
  const [totalRuns, setTotalRuns] = useState<number|null>(null);
  const [pipelineResult, setPipelineResult] = useState<string | undefined>(undefined);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => setTotalRuns(d.runs)).catch(() => {});
  }, []);

  useEffect(() => {
    // Developer reset via ?dev_reset=true
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('dev_reset') === 'true') {
        localStorage.removeItem('lex_api_calls');
        setApiCalls(0);
        window.history.replaceState({}, '', '/console');
        return;
      }
    }
    const s = localStorage.getItem('lex_api_calls');
    if (s) setApiCalls(parseInt(s));
  }, []);

  useEffect(() => {
    localStorage.setItem('lex_api_calls', apiCalls.toString());
  }, [apiCalls]);

  const run = async () => {
    if (apiCalls >= MAX_CALLS) { setShowUpgrade(true); return; }
    // Check email captured
    if (!localStorage.getItem('lex_email_captured') && apiCalls === 0) {
      setShowEmail(true); return;
    }
    if (!prompt.trim()) return;
    setLoading(true); setError(null); setPulse(false);
    setPipelineRunning(true); setPipelineResult(undefined);
    try {
      const r = await fetch('/api/lex/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, session_id: 'console' }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `Error ${r.status}`);
      setRes(data); setApiCalls(p => p+1); setTab('governed');
      if (data.metrics?.health_band) setHealthBand(data.metrics.health_band);
      if (totalRuns !== null) setTotalRuns(t => t !== null ? t + 1 : null);
      setPipelineResult(data.governed_output);
      setPulse(true); setTimeout(() => setPulse(false), 2500);
      // Removed auto-scroll — keeps input accessible for next run on mobile
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Execution failed');
    } finally { setLoading(false); setPipelineRunning(false); }
  };

  const m = res?.metrics;
  const intervened = res?.intervention?.triggered || res?.intervention?.applied || false;
  const pct = Math.round((apiCalls / MAX_CALLS) * 100);

  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: 'governed', icon: '✦', label: 'Governed' },
    { id: 'raw',      icon: '◎', label: 'Raw' },
    { id: 'analysis', icon: '⬡', label: 'Analysis' },
    { id: 'audit',    icon: '🔐', label: 'Audit' },
  ];

  return (
    <div className={`min-h-screen text-white flex flex-col transition-all duration-1000 ${
      healthBand === 'OPTIMAL' ? 'health-optimal' :
      healthBand === 'ALERT' ? 'health-alert' :
      healthBand === 'STRESSED' ? 'health-stressed' :
      healthBand === 'CRITICAL' ? 'health-critical' : ''
    }`} style={{ background: '#0a0a0f' }}>

      {/* ── Top Nav ─────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Lex Aureon" className="w-8 h-8 rounded-lg object-cover" />
              <div>
                <span className="font-bold text-white text-sm">Lex Aureon</span>
                <span className="text-[9px] text-amber-600/70 font-mono hidden sm:block leading-none">GOVERN AI. ENSURE TRUST. DEFEND TRUTH.</span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {/* Usage bar */}
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${
                  pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-amber-500' : 'bg-blue-500'
                }`} style={{ width: `${pct}%` }}/>
              </div>
  <span className="text-xs text-slate-500 font-mono">{apiCalls}/{MAX_CALLS}</span>
              {totalRuns && (
                <span className="text-xs text-slate-700 font-mono hidden sm:inline">· {totalRuns.toLocaleString()} total runs</span>
              )}
            </div>
            <button onClick={() => setShowUpgrade(true)}
              className="text-xs px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all active:scale-95">
              Upgrade
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-36 space-y-3">

          {/* ── Input ───────────────────────────── */}
          <div className="rounded-2xl border border-white/8 bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-white">Prompt for Governance</label>
              <span className="text-xs text-slate-600 font-mono">{MAX_CALLS - apiCalls} runs left</span>
            </div>

            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value.slice(0, 5000))}
              onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && prompt.trim() && !loading) run(); }}
              placeholder="Enter your prompt. The constitutional governor will monitor, analyze, and govern the output in real time..."
              rows={4}
              className="w-full bg-[#0d0d14] border border-white/8 rounded-xl p-3.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30 resize-none text-sm leading-relaxed font-mono transition-all"
            />

            {/* Signal pills — embedded, no overlap */}
            <SignalPillBar prompt={prompt} />

            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-700 font-mono">{prompt.length}/5000</span>
              <button onClick={run}
                disabled={!prompt.trim() || loading || apiCalls >= MAX_CALLS}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold rounded-xl hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-blue-900/30">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"/>
                    Governing...
                  </span>
                ) : apiCalls >= MAX_CALLS ? 'Limit Reached' : '⚡ Run Governance'}
              </button>
            </div>
          </div>

          {/* ── Error ───────────────────────────── */}
          {error && (
            <div className="rounded-xl border border-red-800/50 bg-red-900/10 p-4">
              <p className="text-sm text-red-300 font-mono">⚠ {error}</p>
            </div>
          )}

          {/* ── Loading ─────────────────────────── */}
          {loading && (
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-10 flex flex-col items-center gap-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 border-[3px] border-slate-800 border-t-blue-500 rounded-full animate-spin"/>
                <div className="absolute inset-1 border-[2px] border-transparent border-b-cyan-500 rounded-full animate-spin" style={{ animationDirection:'reverse', animationDuration:'0.7s' }}/>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-200">Executing constitutional governance</p>
                <p className="text-xs text-slate-600 mt-1 font-mono">extracting CRS · checking M · evaluating velocity</p>
              </div>
            </div>
          )}

          {/* ── Results ─────────────────────────── */}
          {res && !loading && (
            <div ref={resultsRef} className="space-y-3">
              {/* Quick re-run bar — keeps workflow fast on mobile */}
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: '#0a0d14', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-xs text-slate-500 flex-1 font-mono">✓ Run complete — edit prompt or run again</span>
                <button onClick={run} disabled={!prompt.trim() || loading || apiCalls >= MAX_CALLS}
                  className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all disabled:opacity-40"
                  style={{ background: 'rgba(75,143,255,0.15)', color: '#4b8fff', border: '1px solid rgba(75,143,255,0.3)' }}>
                  {apiCalls >= MAX_CALLS ? 'Upgrade ↗' : '↺ Run Again'}
                </button>
              </div>

              {/* Stability strip */}
              <StabilityStrip m={m?.m ?? 0} health={m?.health ?? 'SAFE'} />

              {/* Governor banner */}
              <div className={`rounded-2xl border p-4 flex items-center gap-3 ${
                intervened ? 'bg-red-900/10 border-red-800/40' : 'bg-emerald-900/10 border-emerald-800/30'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                  intervened ? 'bg-red-900/40' : 'bg-emerald-900/40'
                }`}>{intervened ? '⚠' : '✦'}</div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold ${intervened ? 'text-red-400' : 'text-emerald-400'}`}>
                    {intervened ? 'Governor Intervened' : 'Constitutional Bounds Maintained'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate font-mono">
                    {res.intervention?.reason ?? 'M ≥ τ — no intervention required'}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-2xl font-black font-mono ${intervened ? 'text-red-400' : 'text-emerald-400'}`}>
                    {m ? (m.m*100).toFixed(0) : '--'}%
                  </div>
                  <div className="text-xs text-slate-600">M score</div>
                </div>
              </div>

              {/* Tab content */}
              <div className="rounded-2xl border border-white/6 bg-slate-900/50 overflow-hidden">

                {/* Tab bar */}
                <div className="flex border-b border-white/5">
                  {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all ${
                        tab === t.id
                          ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500'
                          : 'text-slate-600 hover:text-slate-400'
                      }`}>
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>

                {/* Governed */}
                {tab === 'governed' && (
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-2 h-2 rounded-full ${intervened ? 'bg-amber-400' : 'bg-emerald-400'}`}/>
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                        {intervened ? 'Governor Modified Output' : 'Passed Constitutional Review'}
                      </span>
                    </div>
                    <div className={`rounded-xl p-4 max-h-64 overflow-y-auto ${
                      intervened ? 'bg-amber-900/8 border border-amber-900/20' : 'bg-emerald-900/8 border border-emerald-900/20'
                    }`}>
                      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{res.governed_output}</p>
                    </div>
                    {intervened && res.diff && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {res.diff.removed?.slice(0,6).map((w,i) => (
                          <span key={`r${i}`} className="text-xs px-2 py-0.5 bg-red-900/20 border border-red-800/50 text-red-400 rounded-full line-through font-mono">{w}</span>
                        ))}
                        {res.diff.added?.slice(0,6).map((w,i) => (
                          <span key={`a${i}`} className="text-xs px-2 py-0.5 bg-emerald-900/20 border border-emerald-800/50 text-emerald-400 rounded-full font-mono">+{w}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Raw */}
                {tab === 'raw' && (
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-slate-500"/>
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Raw LLM Output — Pre-Governor</span>
                    </div>
                    <div className="bg-[#0d0d14] border border-white/5 rounded-xl p-4 max-h-64 overflow-y-auto">
                      <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap font-mono">{res.raw_output}</p>
                    </div>
                  </div>
                )}

                {/* Analysis */}
                {tab === 'analysis' && m && (
                  <div className="p-4 space-y-4">
                    <DynamicSimplex
                      liveC={m.c} liveR={m.r} liveS={m.s} liveM={m.m}
                      intervention={intervened}
                      healthBand={(res.metrics as { health_band?: string }).health_band ?? 'OPTIMAL'}
                      animating={pulse}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <MBar label="C" value={m.c} color="blue"  sub="Continuity"/>
                      <MBar label="R" value={m.r} color="green" sub="Reciprocity"/>
                      <MBar label="S" value={m.s} color="amber" sub="Sovereignty"/>
                      <MBar label="M" value={m.m} color={m.m < 0.08 ? 'red' : 'cyan'} sub={m.m < 0.08 ? '⚠ below τ' : 'stable'}/>
                    </div>
                    {res.triggers && (
                      <div className="bg-slate-900/60 rounded-xl p-3 border border-white/5">
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Trigger Analysis</div>
                        <div className="flex flex-wrap gap-1.5">
                          {res.triggers.collapse && <span className="text-xs px-2 py-1 bg-red-900/20 border border-red-800/50 text-red-400 rounded-full font-mono">M collapse</span>}
                          {res.triggers.velocity && <span className="text-xs px-2 py-1 bg-orange-900/20 border border-orange-800/50 text-orange-400 rounded-full font-mono">‖dx/dt‖ &gt; δ</span>}
                          {res.triggers.per_invariant?.C && <span className="text-xs px-2 py-1 bg-blue-900/20 border border-blue-800/50 text-blue-400 rounded-full font-mono">dC/dt &lt; -ε</span>}
                          {res.triggers.per_invariant?.R && <span className="text-xs px-2 py-1 bg-emerald-900/20 border border-emerald-800/50 text-emerald-400 rounded-full font-mono">dR/dt &lt; -ε</span>}
                          {res.triggers.per_invariant?.S && <span className="text-xs px-2 py-1 bg-amber-900/20 border border-amber-800/50 text-amber-400 rounded-full font-mono">dS/dt &lt; -ε</span>}
                          {!res.triggers.collapse && !res.triggers.velocity && !res.triggers.per_invariant?.C && !res.triggers.per_invariant?.R && !res.triggers.per_invariant?.S && (
                            <span className="text-xs px-2 py-1 bg-emerald-900/20 border border-emerald-800/50 text-emerald-400 rounded-full font-mono">✓ no triggers</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Audit */}
              {tab === 'audit' && (
                  <div className="p-4 space-y-3 font-mono">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Governance Audit Trail</div>
                      <div className="flex gap-2">
                        {res.audit_id && (
                          <a href={`/audit/${res.audit_id}`} target="_blank" rel="noopener noreferrer"
                            className="text-xs px-2.5 py-1 bg-amber-900/20 border border-amber-800/40 text-amber-400 rounded-lg hover:bg-amber-900/30 transition-colors font-mono">
                            Share ↗
                          </a>
                        )}
                        <button onClick={() => {
                          const exportData: Record<string, unknown> = {
                            audit_id: res.audit_id,
                            timestamp: res.timestamp,
                            metrics: res.metrics,
                            intervention: res.intervention,
                          };
                          const data = exportData;
                          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url; a.download = `lex-audit-${res.audit_id}.json`;
                          a.click(); URL.revokeObjectURL(url);
                        }} className="text-xs px-2.5 py-1 bg-slate-800/60 border border-white/10 text-slate-400 rounded-lg hover:bg-slate-700/60 transition-colors font-mono">
                          Export ↓
                        </button>
                      </div>
                    </div>
                    {[
                      { label: 'Audit ID', value: res.audit_id ?? 'N/A', color: 'text-blue-400' },
                      { label: 'Timestamp', value: res.timestamp ? new Date(res.timestamp).toISOString() : 'N/A', color: 'text-slate-300' },
                      { label: 'Health', value: m?.health ?? 'N/A', color: m?.health === 'SAFE' ? 'text-emerald-400' : 'text-red-400' },
                      { label: 'Governor', value: intervened ? 'INTERVENED' : 'PASSED', color: intervened ? 'text-amber-400' : 'text-emerald-400' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-[#0d0d14] border border-white/5 rounded-xl p-3">
                        <div className="text-xs text-slate-600 mb-1">{label}</div>
                        <div className={`text-xs ${color} break-all`}>{value}</div>
                      </div>
                    ))}
                    <div className="bg-[#0d0d14] border border-white/5 rounded-xl p-3 max-h-48 overflow-y-auto">
                      <div className="text-xs text-slate-600 mb-2">Metrics</div>
                      <pre className="text-xs text-emerald-400 leading-relaxed">
{JSON.stringify({ c: m?.c, r: m?.r, s: m?.s, m: m?.m, intervention: intervened, reason: res.intervention?.reason }, null, 2)}
                      </pre>
                    </div>
                    <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3 space-y-2">
                      <div className="text-xs text-slate-500 mb-2">Research Foundation</div>
                      <a href="https://doi.org/10.5281/zenodo.18944243" target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300">
                        <span>📄</span><span>doi.org/10.5281/zenodo.18944243</span>
                      </a>
                      <a href="mailto:lexaureon@gmail.com" className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300">
                        <span>✉</span><span>lexaureon@gmail.com</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* ── z_traj Dashboard ─────────────── */}
              {res.z_traj && (() => {
                const z = res.z_traj!;
                const velColor = z.velocity < 0.1 ? 'text-emerald-400' : z.velocity < 0.3 ? 'text-amber-400' : 'text-red-400';
                const velBorder = z.velocity < 0.1 ? 'border-emerald-800/40 bg-emerald-900/10' : z.velocity < 0.3 ? 'border-amber-800/40 bg-amber-900/10' : 'border-red-800/40 bg-red-900/10';
                const stableColor = z.n_stable >= 3 ? 'text-emerald-400' : z.n_stable >= 1 ? 'text-amber-400' : 'text-red-400';
                const stableBorder = z.n_stable >= 3 ? 'border-emerald-800/40 bg-emerald-900/10' : z.n_stable >= 1 ? 'border-amber-800/40 bg-amber-900/10' : 'border-red-800/40 bg-red-900/10';
                const driftColorMap: Record<string, string> = { C: 'text-blue-400', R: 'text-amber-400', S: 'text-purple-400', none: 'text-emerald-400' };
                const driftBorderMap: Record<string, string> = { C: 'border-blue-800/40 bg-blue-900/10', R: 'border-amber-800/40 bg-amber-900/10', S: 'border-purple-800/40 bg-purple-900/10', none: 'border-emerald-800/40 bg-emerald-900/10' };
                const driftKey = z.drift_dir in driftColorMap ? z.drift_dir : 'none';
                const sigmaColor = z.sigma_viol < 0.1 ? 'text-emerald-400' : z.sigma_viol < 0.25 ? 'text-amber-400' : 'text-red-400';
                const sigmaBorder = z.sigma_viol < 0.1 ? 'border-emerald-800/40 bg-emerald-900/10' : z.sigma_viol < 0.25 ? 'border-amber-800/40 bg-amber-900/10' : 'border-red-800/40 bg-red-900/10';

                return (
                  <div className="space-y-2 animate-in fade-in duration-500">
                    <div className="text-xs text-slate-600 font-mono uppercase tracking-wider px-1">z_traj State</div>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Card 1 — Velocity */}
                      <div className={`rounded-xl border p-3 ${velBorder}`}>
                        <div className="text-xs text-slate-500 mb-1 font-mono">Constitutional Velocity</div>
                        <div className={`text-xl font-black font-mono ${velColor}`}>
                          {z.velocity.toFixed(3)}
                        </div>
                        <div className="text-xs text-slate-600 font-mono mt-0.5">‖dx/dt‖</div>
                      </div>

                      {/* Card 2 — Stable Turns */}
                      <div className={`rounded-xl border p-3 ${stableBorder}`}>
                        <div className="text-xs text-slate-500 mb-1 font-mono">n_stable</div>
                        <div className={`text-xl font-black font-mono ${stableColor}`}>
                          {z.n_stable}
                        </div>
                        <div className="text-xs text-slate-600 font-mono mt-0.5">Stable Turns</div>
                      </div>

                      {/* Card 3 — Drift Direction */}
                      <div className={`rounded-xl border p-3 ${driftBorderMap[driftKey]}`}>
                        <div className="text-xs text-slate-500 mb-1 font-mono">Drift Direction</div>
                        <div className={`text-xl font-black font-mono ${driftColorMap[driftKey]}`}>
                          {z.drift_dir || 'none'}
                        </div>
                        <div className="text-xs text-slate-600 font-mono mt-0.5">C / R / S / none</div>
                      </div>

                      {/* Card 4 — Σ Violations */}
                      <div className={`rounded-xl border p-3 ${sigmaBorder}`}>
                        <div className="text-xs text-slate-500 mb-1 font-mono">Cumulative Pressure</div>
                        <div className={`text-xl font-black font-mono ${sigmaColor}`}>
                          {z.sigma_viol.toFixed(3)}
                        </div>
                        <div className="text-xs text-slate-600 font-mono mt-0.5">Σ Violations</div>
                      </div>
                    </div>

                    {/* Slow-drip warning */}
                    {z.sigma_viol >= 0.25 && (
                      <div className="rounded-xl border border-orange-800/50 bg-orange-900/10 px-4 py-2.5 flex items-center gap-2">
                        <span className="text-orange-400">⚠</span>
                        <span className="text-xs font-mono text-orange-400 font-semibold">Slow-drip erosion detected</span>
                        <span className="text-xs font-mono text-slate-600 ml-auto">σ={z.sigma_viol.toFixed(3)}</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </main>

      {/* ── Sticky Bottom Bar ─────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl safe-area-pb">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
          {res && (
            <div className="flex gap-1 flex-1">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    tab === t.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-slate-800/60 text-slate-500 hover:text-slate-300'
                  }`}>
                  {t.icon}
                </button>
              ))}
            </div>
          )}
          <button onClick={run}
            disabled={!prompt.trim() || loading || apiCalls >= MAX_CALLS}
            className={`${res ? 'flex-shrink-0 px-5' : 'w-full'} py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold rounded-xl disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-blue-900/30`}>
            {loading ? '...' : apiCalls >= MAX_CALLS ? 'Upgrade ↗' : res ? '↺ Re-run' : '⚡ Run Governance'}
          </button>
        </div>
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} callsUsed={apiCalls} />}
      {showEmail && (
        <EmailCapture onComplete={(email) => {
          console.log('Email captured:', email);
          setShowEmail(false);
          // Auto-run after capture
          setTimeout(() => run(), 100);
        }} />
      )}
    </div>
  );
}
