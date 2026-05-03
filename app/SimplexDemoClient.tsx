'use client';
import dynamic from 'next/dynamic';

const DynamicSimplex = dynamic(() => import('@/components/DynamicSimplex'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-center">
      <span className="text-xs text-slate-600 font-mono animate-pulse">Loading simplex...</span>
    </div>
  ),
});

export default function SimplexDemoClient() {
  return <DynamicSimplex demoMode={true} />;
}
