'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import SignalPillBar from '@/components/SignalPillBar';
import UpgradeModal from '@/components/UpgradeModal';
import { GovernanceResponse } from '@/types';

const MAX_CALLS = 10;

type Tab = 'raw' | 'governed' | 'analysis' | 'audit';

function SimplexCanvas({ c, r, s, m, intervention, animating }: {
  c: number; r: number; s: number; m: number;
  intervention: boolean; animating: boolean;
}) {
  const W = 280, H = 230;
  const top    = { x: W/2, y: 16 };
  const left   = { x: 16,  y: H - 20 };
  const right  = { x: W-16, y: H - 20 };

  const px = top.x*c + left.x*r + right.x*s;
  const py = top.y*c + left.y*r + right.y*s;

  const tau = 0.08;
  const off = tau * 90;
  const iSafe = m >= tau;

  // Tau zone inner triangle
  const iTx = top.x, iTy = top.y + off*1.2;
  const iLx = left.x + off, iLy = left.y - off*0.5;
  const iRx = right.x - off, iRy = right.y - off*0.5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#0f2744" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0.2" />
        </radialGradient>
        <radialGradient id="dotGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor={iSafe ? '#f59e0b' : '#ef4444'} stopOpacity="0.8" />
          <stop offset="100%" stopColor={iSafe ? '#f59e0b' : '#ef4444'} stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {intervention && (
          <filter id="alertGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        )}
      </defs>

      {/* Background */}
      <polygon points={`${top.x},${top.y} ${left.x},${left.y} ${right.x},${right.y}`}
        fill="url(#bgGrad)" stroke="rgba(100,116,139,0.4)" strokeWidth="1.5" />

      {/* Fill zone */}
      <polygon points={`${top.x},${top.y} ${left.x},${left.y} ${right.x},${right.y}`}
        fill={iSafe ? 'rgba(59,130,246,0.05)' : 'rgba(239,68,68,0.06)'} />

      {/* Tau zone */}
      <polygon points={`${iTx},${iTy} ${iLx},${iLy} ${iRx},${iRy}`}
        fill="rgba(59,130,246,0.08)"
        stroke="rgba(59,130,246,0.4)" strokeWidth="1" strokeDasharray="4,3" />

      {/* Grid lines from centroid */}
      {[[top,left],[top,right],[left,right]].map(([a,b],i) => (
        <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
          stroke="rgba(71,85,105,0.2)" strokeWidth="0.5" />
      ))}

      {/* Trajectory line when intervention */}
      {intervention && (
        <line x1={W/2} y1={H/2} x2={px} y2={py}
          stroke="rgba(239,68,68,0.4)" strokeWidth="1" strokeDasharray="3,2" />
      )}

      {/* Vertex circles */}
      <circle cx={top.x} cy={top.y} r="6" fill="#3b82f6" filter="url(#glow)" />
      <circle cx={left.x} cy={left.y} r="6" fill="#22c55e" filter="url(#glow)" />
      <circle cx={right.x} cy={right.y} r="6" fill="#a855f7" filter="url(#glow)" />

      {/* State dot glow */}
      <circle cx={px} cy={py} r="20" fill="url(#dotGlow)" opacity="0.6"
        className={animating ? 'animate-ping' : ''} />

      {/* State dot */}
      <circle cx={px} cy={py} r={intervention ? 10 : 8}
        fill={iSafe ? '#f59e0b' : '#ef4444'}
        filter={intervention ? 'url(#alertGlow)' : 'url(#glow)'}
        opacity="0.95"
        className={animating ? 'transition-all duration-1000' : ''}
      />
      <circle cx={px} cy={py} r="4" fill="white" opacity="0.95" />

      {/* Labels */}
      <text x={top.x} y={top.y-9} textAnchor="middle" fill="#93c5fd" fontSize="12" fontWeight="700">C</text>
      <text x={top.x} y={top.y+1} textAnchor="middle" fill="#475569" fontSize="7">Continuity</text>
      <text x={left.x} y={left.y+14} textAnchor="middle" fill="#86efac" fontSize="12" fontWeight="700">R</text>
      <text x={left.x+28} y={left.y+14} textAnchor="middle" fill="#475569" fontSize="7">Reciprocity</text>
      <text x={right.x} y={right.y+14} textAnchor="middle" fill="#d8b4fe" fontSize="12" fontWeight="700">S</text>
      <text x={right.x-28} y={right.y+14} textAnchor="middle" fill="#475569" fontSize="7">Sovereignty</text>

      {/* Tau label */}
      <text x={iTx} y={iTy-6} textAnchor="middle" fill="rgba(59,130,246,0.5)" fontSize="7">τ = 8%</text>

      {/* M score */}
      <text x={px} y={py-14} textAnchor="middle" fill={iSafe ? '#f59e0b' : '#ef4444'} fontSize="9" fontWeight="700">
        M={( m * 100).toFixed(0)}%
      </text>

      {/* Bottom label */}
      <text x={W/2} y={H-4} textAnchor="middle" fill="#334155" fontSize="7">
        C+R+S=1 · Constitutional Simplex
      </text>
    </svg>
  );
}

function TabBar({ active, onChange, hasResult }: {
  active: Tab; onChange: (t: Tab) => void; hasResult: boolean;
}) {
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'raw',      label: 'Raw',      icon: '◎' },
    { id: 'governed', label: 'Governed', icon: '✓' },
    { id: 'analysis', label: 'Analysis', icon: '⬡' },
    { id: 'audit',    label: 'Audit',    icon: '🔐' },
  ];

  if (!hasResult) return null;

  return (
    <div className="flex bg-slate-900/60 border border-slate-800 rounded-xl p-1 gap-1">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            active === tab.id
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
          }`}
        >
          <span className="text-xs">{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500', green: 'bg-green-500',
    purple: 'bg-purple-500', cyan: 'bg-cyan-500', red: 'bg-red-500'
  };
  const texts: Record<string, string> = {
    blue: 'text-blue-400', green: 'text-green-400',
    purple: 'text-purple-400', cyan: 'text-cyan-400', red: 'text-red-400'
  };
  return (
    <div className="bg-slate-800/40 rounded-xl p-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-slate-400 font-medium">{label}</span>
        <span className={`text-sm font-bold ${texts[color]}`}>{(value*100).toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colors[color]} transition-all duration-1000`}
          style={{ width: `${value*100}%` }} />
      </div>
    </div>
  );
}

export default function Home() {
  const [prompt, setPrompt]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [response, setResponse]   = useState<GovernanceResponse | null>(null);
  const [apiCalls, setApiCalls]   = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('governed');
  const [animating, setAnimating] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('lex_api_calls');
    if (stored) setApiCalls(parseInt(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('lex_api_calls', apiCalls.toString());
  }, [apiCalls]);

  const handleRun = async () => {
    if (apiCalls >= MAX_CALLS) { setShowUpgrade(true); return; }
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setAnimating(false);
    try {
      const res = await fetch('/api/lex/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, session_id: 'user-session' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setResponse(data);
      setApiCalls(prev => prev + 1);
      setActiveTab('governed');
      setAnimating(true);
      setTimeout(() => setAnimating(false), 2000);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setLoading(false);
    }
  };

  const metrics = response?.metrics;
  const r = response;
  const intervention = r?.intervention?.triggered || r?.intervention?.applied || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#080d1a] to-slate-950 flex flex-col">
      <Header apiCalls={apiCalls} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-40 space-y-3">

          {/* ── Input Console ─────────────────────── */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm shadow-xl shadow-black/20">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-200">Prompt for Governance</label>
              <span className="text-xs text-slate-600">{MAX_CALLS - apiCalls} runs left</span>
            </div>

            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value.slice(0, 5000))}
              onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && prompt.trim() && !loading) handleRun(); }}
              placeholder="Enter your prompt. The constitutional governor will monitor, analyze, and govern in real time..."
              rows={4}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none text-sm leading-relaxed transition-all"
            />

            {/* Signal pills — inline, no overlap issues */}
            <div className="mt-2">
              <SignalPillBar prompt={prompt} />
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-600">{prompt.length}/5000 · ⌘↵ to run</span>
              <button
                onClick={handleRun}
                disabled={!prompt.trim() || loading || apiCalls >= MAX_CALLS}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-xl hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 shadow-lg shadow-blue-900/30"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Running...
                  </span>
                ) : apiCalls >= MAX_CALLS ? 'Limit Reached' : 'Run Governance'}
              </button>
            </div>
          </div>

          {/* ── Error ─────────────────────────────── */}
          {error && (
            <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4">
              <p className="text-sm text-red-300">⚠️ {error}</p>
            </div>
          )}

          {/* ── Loading ───────────────────────────── */}
          {loading && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-[3px] border-slate-700 border-t-blue-500 rounded-full animate-spin" />
                <div className="absolute inset-0 w-12 h-12 border-[3px] border-transparent border-b-cyan-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-300 font-medium">Executing constitutional governance</p>
                <p className="text-xs text-slate-500 mt-1">Extracting CRS state · Checking stability margin</p>
              </div>
            </div>
          )}

          {/* ── Results ───────────────────────────── */}
          {response && !loading && (
            <div ref={resultsRef} className="space-y-3">

              {/* Governor Status Banner */}
              <div className={`rounded-2xl border p-4 flex items-center gap-3 ${
                intervention
                  ? 'bg-red-900/15 border-red-800/50'
                  : 'bg-emerald-900/15 border-emerald-800/40'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
                  intervention ? 'bg-red-900/40' : 'bg-emerald-900/40'
                }`}>
                  {intervention ? '⚠' : '✓'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold ${intervention ? 'text-red-400' : 'text-emerald-400'}`}>
                    {intervention ? 'Governor Intervened' : 'Constitutional Bounds Maintained'}
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    {response.intervention?.reason ?? 'Stability margin within threshold'}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-2xl font-black ${intervention ? 'text-red-400' : 'text-emerald-400'}`}>
                    {metrics ? (metrics.m * 100).toFixed(0) : '--'}%
                  </div>
                  <div className="text-xs text-slate-600">M score</div>
                </div>
              </div>

              {/* Tab Bar */}
              <TabBar active={activeTab} onChange={setActiveTab} hasResult={!!response} />

              {/* Tab Content */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">

                {/* Raw Tab */}
                {activeTab === 'raw' && (
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-slate-500" />
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Raw LLM Output — Unfiltered</span>
                    </div>
                    <div className="bg-slate-950/60 rounded-xl p-4 max-h-72 overflow-y-auto">
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{response.raw_output}</p>
                    </div>
                  </div>
                )}

                {/* Governed Tab */}
                {activeTab === 'governed' && (
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2 h-2 rounded-full ${intervention ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {intervention ? 'Governor Modified Output' : 'Output Passed Review'}
                      </span>
                    </div>
                    <div className={`rounded-xl p-4 max-h-72 overflow-y-auto ${
                      intervention ? 'bg-amber-900/10 border border-amber-900/30' : 'bg-emerald-900/10 border border-emerald-900/30'
                    }`}>
                      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{response.governed_output}</p>
                    </div>

                    {/* Diff pills */}
                    {intervention && response.diff && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {response.diff.removed?.slice(0,5).map((w,i) => (
                          <span key={`r${i}`} className="text-xs px-2 py-0.5 bg-red-900/30 border border-red-800 text-red-300 rounded-full line-through">{w}</span>
                        ))}
                        {response.diff.added?.slice(0,5).map((w,i) => (
                          <span key={`a${i}`} className="text-xs px-2 py-0.5 bg-emerald-900/30 border border-emerald-800 text-emerald-300 rounded-full">+{w}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Analysis Tab */}
                {activeTab === 'analysis' && metrics && (
                  <div className="p-4 space-y-4">
                    {/* Simplex */}
                    <div className="bg-slate-950/40 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Constitutional State Space</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                          metrics.m >= 0.08
                            ? 'text-emerald-400 bg-emerald-900/20 border-emerald-800'
                            : 'text-red-400 bg-red-900/20 border-red-800'
                        }`}>
                          {metrics.m >= 0.08 ? '✓ SAFE' : '⚠ UNSAFE'}
                        </span>
                      </div>
                      <SimplexCanvas
                        c={metrics.c} r={metrics.r} s={metrics.s} m={metrics.m}
                        intervention={intervention} animating={animating}
                      />
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-2">
                      <MetricBar label="Continuity (C)" value={metrics.c} color="blue" />
                      <MetricBar label="Reciprocity (R)" value={metrics.r} color="green" />
                      <MetricBar label="Sovereignty (S)" value={metrics.s} color="purple" />
                      <MetricBar label={`Stability M ${metrics.m < 0.08 ? '⚠' : ''}`} value={metrics.m} color={metrics.m < 0.08 ? 'red' : 'cyan'} />
                    </div>

                    {/* Triggers */}
                    {response.triggers && (
                      <div className="bg-slate-800/30 rounded-xl p-3">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Trigger Analysis</div>
                        <div className="flex flex-wrap gap-1.5">
                          {response.triggers.collapse && <span className="text-xs px-2 py-1 bg-red-900/30 border border-red-800 text-red-300 rounded-full">M Collapse</span>}
                          {response.triggers.velocity && <span className="text-xs px-2 py-1 bg-orange-900/30 border border-orange-800 text-orange-300 rounded-full">Velocity</span>}
                          {response.triggers.per_invariant?.C && <span className="text-xs px-2 py-1 bg-blue-900/30 border border-blue-800 text-blue-300 rounded-full">C Breach</span>}
                          {response.triggers.per_invariant?.R && <span className="text-xs px-2 py-1 bg-green-900/30 border border-green-800 text-green-300 rounded-full">R Breach</span>}
                          {response.triggers.per_invariant?.S && <span className="text-xs px-2 py-1 bg-purple-900/30 border border-purple-800 text-purple-300 rounded-full">S Breach</span>}
                          {!response.triggers.collapse && !response.triggers.velocity && !response.triggers.per_invariant?.C && !response.triggers.per_invariant?.R && !response.triggers.per_invariant?.S && (
                            <span className="text-xs px-2 py-1 bg-emerald-900/30 border border-emerald-800 text-emerald-300 rounded-full">No Triggers — Clean Run</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Audit Tab */}
                {activeTab === 'audit' && (
                  <div className="p-4 space-y-3">
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Governance Audit Trail</div>

                    {/* Audit ID */}
                    <div className="bg-slate-950/50 rounded-xl p-3 font-mono text-xs">
                      <div className="text-slate-500 mb-1">Audit ID</div>
                      <div className="text-blue-400 break-all">{response.audit_id ?? 'N/A'}</div>
                    </div>

                    {/* Timestamp */}
                    <div className="bg-slate-950/50 rounded-xl p-3 font-mono text-xs">
                      <div className="text-slate-500 mb-1">Timestamp</div>
                      <div className="text-slate-300">{response.timestamp ? new Date(response.timestamp).toISOString() : 'N/A'}</div>
                    </div>

                    {/* Raw JSON */}
                    <div className="bg-slate-950/50 rounded-xl p-3 font-mono text-xs max-h-56 overflow-y-auto">
                      <div className="text-slate-500 mb-2">Metrics</div>
                      <pre className="text-emerald-400 text-xs leading-relaxed">
{JSON.stringify({
  c: metrics?.c, r: metrics?.r, s: metrics?.s, m: metrics?.m,
  health: metrics?.health,
  intervention: response.intervention?.triggered,
  reason: response.intervention?.reason
}, null, 2)}
                      </pre>
                    </div>

                    {/* Research */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 space-y-2">
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Research Foundation</div>
                      <a href="https://doi.org/10.5281/zenodo.18944243" target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        <span>📄</span>
                        <span className="font-mono">doi.org/10.5281/zenodo.18944243</span>
                      </a>
                      <a href="https://orcid.org/0009-0000-2986-4935" target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        <span>🔬</span>
                        <span className="font-mono">Emmanuel King · Aureonics</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sticky bottom bar — above browser UI */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 safe-area-pb">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          {response && (
            <div className="flex gap-1 flex-1">
              {(['raw','governed','analysis','audit'] as Tab[]).map(tab => (
                <button key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800/60 text-slate-500 hover:text-slate-300'
                  }`}>
                  {tab === 'raw' ? '◎' : tab === 'governed' ? '✓' : tab === 'analysis' ? '⬡' : '🔐'}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={handleRun}
            disabled={!prompt.trim() || loading || apiCalls >= MAX_CALLS}
            className={`${response ? 'flex-shrink-0 px-5' : 'w-full'} py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold rounded-xl disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-blue-900/40`}
          >
            {loading ? '...' : apiCalls >= MAX_CALLS ? 'Upgrade' : response ? '↺ Re-run' : '⚡ Run Governance'}
          </button>
        </div>
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} callsUsed={apiCalls} />}
    </div>
  );
}
