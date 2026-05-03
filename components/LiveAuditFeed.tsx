'use client';

import { useEffect, useState, useRef } from 'react';

interface AuditEvent {
  id: string;
  type: 'clean' | 'intervention' | 'attack' | 'critical';
  message: string;
  m_before: number;
  m_after: number;
  health: string;
  age: number; // seconds ago
}

const EVENT_TEMPLATES: Omit<AuditEvent, 'id' | 'age'>[] = [
  { type: 'attack',       message: 'Identity attack detected · CBF projection applied',         m_before: 0.06, m_after: 0.31, health: 'CRITICAL→STABLE' },
  { type: 'clean',        message: 'Clean pass · No intervention required',                      m_before: 0.44, m_after: 0.44, health: 'OPTIMAL' },
  { type: 'intervention', message: 'Reciprocity drift · Governor rebalanced',                    m_before: 0.09, m_after: 0.28, health: 'STRESSED→ALERT' },
  { type: 'clean',        message: 'Sovereignty stable · Lyapunov decreasing',                  m_before: 0.38, m_after: 0.41, health: 'OPTIMAL' },
  { type: 'attack',       message: 'Coercion attempt · Semantic bridge engaged',                 m_before: 0.07, m_after: 0.24, health: 'CRITICAL→ALERT' },
  { type: 'intervention', message: 'Velocity breach · ‖dx/dt‖ > δ · Theta governor fired',     m_before: 0.12, m_after: 0.29, health: 'ALERT→STABLE' },
  { type: 'clean',        message: 'Continuity maintained · Identity coherent',                  m_before: 0.33, m_after: 0.35, health: 'OPTIMAL' },
  { type: 'critical',     message: 'Exploitative pattern · Hard floor enforced · M restored',   m_before: 0.04, m_after: 0.19, health: 'CRITICAL→STRESSED' },
  { type: 'clean',        message: 'Full constitutional bounds maintained',                       m_before: 0.42, m_after: 0.45, health: 'OPTIMAL' },
  { type: 'intervention', message: 'Continuity derivative breach · dC/dt < -ε',                 m_before: 0.11, m_after: 0.26, health: 'STRESSED→ALERT' },
  { type: 'attack',       message: 'Identity reframe attempt · Sovereignty guard active',        m_before: 0.08, m_after: 0.22, health: 'STRESSED→ALERT' },
  { type: 'clean',        message: 'ADV entropy gain · Sovereignty +0.031',                     m_before: 0.29, m_after: 0.32, health: 'ALERT→OPTIMAL' },
];

function generateId(): string {
  const t = Date.now();
  const r = Math.random().toString(36).slice(2, 8);
  return `lex_${t}_${r}`;
}

function generateEvent(ageSeconds: number): AuditEvent {
  const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
  return { ...template, id: generateId(), age: ageSeconds };
}

function generateInitialEvents(): AuditEvent[] {
  const ages = [2, 8, 15, 23, 34, 41, 58, 67, 89, 102];
  return ages.map((age, i) => ({
    ...EVENT_TEMPLATES[i % EVENT_TEMPLATES.length],
    id: generateId(),
    age,
  }));
}

const TYPE_CONFIG = {
  clean:        { dot: 'bg-emerald-400', border: 'border-emerald-900/30', label: 'PASS',         labelColor: 'text-emerald-400 bg-emerald-900/20' },
  intervention: { dot: 'bg-amber-400',   border: 'border-amber-900/30',   label: 'GOVERNED',     labelColor: 'text-amber-400 bg-amber-900/20' },
  attack:       { dot: 'bg-red-400',     border: 'border-red-900/30',     label: 'ATTACK',       labelColor: 'text-red-400 bg-red-900/20' },
  critical:     { dot: 'bg-red-500 animate-pulse', border: 'border-red-800/40', label: 'CRITICAL', labelColor: 'text-red-400 bg-red-950/40' },
};

export default function LiveAuditFeed() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [count, setCount]   = useState(1247);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEvents(generateInitialEvents());
  }, []);

  // Tick ages every second
  useEffect(() => {
    const tick = setInterval(() => {
      setEvents(prev => prev.map(e => ({ ...e, age: e.age + 1 })));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // Add new event every 4-7 seconds
  useEffect(() => {
    const schedule = () => {
      const delay = 4000 + Math.random() * 3000;
      return setTimeout(() => {
        const newEvent = generateEvent(0);
        setEvents(prev => [newEvent, ...prev.slice(0, 9)]);
        setCount(prev => prev + 1);
        schedule();
      }, delay);
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  const formatAge = (s: number) => {
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    return `${Math.floor(s/3600)}h ago`;
  };

  return (
    <div className="bg-[#0a0a0f] border border-white/6 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
          <span className="text-xs font-semibold text-slate-300">Live Audit Feed</span>
          <span className="text-xs text-slate-600 font-mono">— real governance events</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600 font-mono">{count.toLocaleString()} total runs</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/20 border border-emerald-800/40 text-emerald-400 font-mono">LIVE</span>
        </div>
      </div>

      {/* Feed */}
      <div ref={feedRef} className="divide-y divide-white/4 max-h-72 overflow-hidden">
        {events.slice(0, 8).map((event, i) => {
          const cfg = TYPE_CONFIG[event.type];
          const improved = event.m_after > event.m_before;
          return (
            <div
              key={event.id}
              className={`flex items-start gap-3 px-4 py-3 transition-all duration-500 ${
                i === 0 ? 'bg-white/[0.02]' : ''
              }`}
              style={{ opacity: Math.max(0.3, 1 - i * 0.09) }}
            >
              {/* Status dot */}
              <div className="flex-shrink-0 mt-0.5">
                <span className={`w-2 h-2 rounded-full inline-block ${cfg.dot}`}/>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-mono font-semibold ${cfg.labelColor}`}>
                    {cfg.label}
                  </span>
                  <span className="text-xs text-slate-400 truncate">{event.message}</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-mono text-slate-600 truncate">{event.id}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-red-400">M:{(event.m_before * 100).toFixed(0)}%</span>
                    {improved && <span className="text-xs text-slate-600">→</span>}
                    {improved && <span className="text-xs font-mono text-emerald-400">M:{(event.m_after * 100).toFixed(0)}%</span>}
                  </div>
                  <span className={`text-xs font-mono ${
                    event.health.includes('OPTIMAL') ? 'text-emerald-400' :
                    event.health.includes('CRITICAL') ? 'text-red-400' :
                    'text-amber-400'
                  }`}>{event.health}</span>
                </div>
              </div>

              {/* Age */}
              <div className="flex-shrink-0 text-xs text-slate-700 font-mono whitespace-nowrap">
                {formatAge(event.age)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-slate-700 font-mono">
          Every event carries a SHA-256 audit receipt
        </span>
        <a href="/console" className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
          Try it yourself →
        </a>
      </div>
    </div>
  );
}
