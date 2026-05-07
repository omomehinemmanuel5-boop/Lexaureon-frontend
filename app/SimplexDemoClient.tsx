'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const DynamicSimplex = dynamic(() => import('@/components/DynamicSimplex'), {
  ssr: false,
});

const G = '#c9a84c';

interface LiveStatePayload {
  state: { C: number; R: number; S: number; M: number };
}

export default function SimplexDemoClient() {
  const [mounted, setMounted] = useState(false);
  const [live, setLive] = useState<LiveStatePayload['state'] | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    const load = async () => {
      try {
        const r = await fetch('/api/live-state', { cache: 'no-store' });
        if (!r.ok) return;
        const data = await r.json() as LiveStatePayload;
        setLive(data.state);
      } catch {
        // keep prior value
      }
    };

    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [mounted]);

  if (!mounted) return (
    <div className="w-full h-48 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl mb-2">⬡</div>
        <span className="text-xs font-mono" style={{color: G}}>C+R+S=1</span>
      </div>
    </div>
  );

  return (
    <DynamicSimplex
      liveC={live?.C}
      liveR={live?.R}
      liveS={live?.S}
      liveM={live?.M}
      demoMode={false}
      healthBand={(live?.M ?? 0.333) >= 0.25 ? 'OPTIMAL' : (live?.M ?? 0.333) >= 0.15 ? 'ALERT' : (live?.M ?? 0.333) >= 0.08 ? 'STRESSED' : 'CRITICAL'}
    />
  );
}
