'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const DynamicSimplex = dynamic(() => import('@/components/DynamicSimplex'), {
  ssr: false,
});

const G = '#c9a84c';

export default function SimplexDemoClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return (
    <div className="w-full h-48 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl mb-2">⬡</div>
        <span className="text-xs font-mono" style={{color: G}}>C+R+S=1</span>
      </div>
    </div>
  );

  return <DynamicSimplex demoMode={true} />;
}
