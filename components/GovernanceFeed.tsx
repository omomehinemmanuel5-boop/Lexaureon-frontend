'use client';

import { useEffect, useState } from 'react';

interface AuditRecord {
  id: string;
  timestamp: number;
  m_before: number;
  m_after: number;
  health_band?: string;
  intervention: boolean;
  reason?: string;
  pre_eval_label?: string;
  sigma_viol?: number;
}

function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function SkeletonCard() {
  return (
    <div className="px-4 py-3 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-4 w-12 rounded bg-slate-800" />
        <div className="h-4 w-24 rounded bg-slate-800" />
      </div>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="h-2 w-10 rounded bg-slate-800" />
        <div className="flex-1 h-1.5 rounded-full bg-slate-800" />
      </div>
      <div className="h-3 w-32 rounded bg-slate-800" />
    </div>
  );
}

export default function GovernanceFeed() {
  const [events, setEvents] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newestId, setNewestId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/audits/recent?limit=8', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json() as { audits?: AuditRecord[] };
        const audits = data.audits ?? [];
        if (audits.length > 0) {
          setNewestId(prev => {
            const freshId = audits[0]?.id ?? null;
            if (prev !== null && freshId !== prev) {
              // a truly new event arrived
            }
            return freshId;
          });
          setEvents(audits);
        }
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };

    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/6 bg-[#0a0a0f] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-700 animate-pulse" />
          <span className="text-xs font-semibold text-slate-500">Live Governance Feed</span>
        </div>
        <div className="divide-y divide-white/4">
          {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-white/6 bg-[#0a0a0f] p-10 flex flex-col items-center gap-3">
        <div className="flex items-center gap-1.5">
          {[0, 300, 600].map((delay, i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-slate-600 animate-pulse"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
        <p className="text-sm text-slate-500 font-mono">Waiting for governance events...</p>
        <p className="text-xs text-slate-700 font-mono">Run the console to generate real receipts</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/6 bg-[#0a0a0f] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">Live Governance Feed</span>
          <span className="text-xs text-slate-600 font-mono">— real events</span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/20 border border-emerald-800/40 text-emerald-400 font-mono">
          LIVE
        </span>
      </div>

      {/* Events */}
      <div className="divide-y divide-white/4 max-h-80 overflow-hidden">
        {events.map((event, i) => {
          const preEval =
            event.pre_eval_label ??
            (event.intervention || event.m_before < 0.1 ? 'HIGH' : 'CLEAR');
          const M = event.m_after;
          const mColor = M > 0.15 ? '#22c55e' : M > 0.05 ? '#f59e0b' : '#ef4444';
          const mPct = Math.min(100, Math.round(M * 100));
          const slowDrip = (event.sigma_viol ?? 0) > 0.25;
          const isNewest = i === 0 && event.id === newestId;

          return (
            <a
              key={event.id}
              href={`/audit/${event.id}`}
              className="block px-4 py-3 transition-all duration-500 hover:bg-white/[0.02] cursor-pointer"
              style={{
                opacity: Math.max(0.3, 1 - i * 0.09),
                background: isNewest ? 'rgba(255,255,255,0.015)' : undefined,
                textDecoration: 'none',
              }}
            >
              {/* Badges row */}
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span
                  className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${
                    preEval === 'HIGH'
                      ? 'text-red-400 bg-red-900/20 border border-red-800/40'
                      : 'text-emerald-400 bg-emerald-900/20 border border-emerald-800/40'
                  }`}
                >
                  {preEval}
                </span>
                {event.intervention && (
                  <span className="text-xs px-2 py-0.5 rounded font-mono text-amber-400 bg-amber-900/20 border border-amber-800/40">
                    INTERVENED
                  </span>
                )}
                {slowDrip && (
                  <span className="text-xs px-2 py-0.5 rounded font-mono text-orange-400 bg-orange-900/20 border border-orange-800/40">
                    ⚠ SLOW-DRIP
                  </span>
                )}
              </div>

              {/* M score bar */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono flex-shrink-0" style={{ color: mColor, width: 42 }}>
                  M={mPct}%
                </span>
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${mPct}%`, background: mColor }}
                  />
                </div>
              </div>

              {/* Receipt ID + timestamp */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono truncate" style={{ color: '#c9a84c', maxWidth: 130 }}>
                  {event.id.length > 14 ? `${event.id.slice(0, 14)}…` : event.id}
                </span>
                <span className="text-xs font-mono text-slate-700">{timeAgo(event.timestamp)}</span>
              </div>
            </a>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-slate-700 font-mono">SHA-256 audit receipts · every run</span>
        <a href="/console" className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
          Try it →
        </a>
      </div>
    </div>
  );
}
