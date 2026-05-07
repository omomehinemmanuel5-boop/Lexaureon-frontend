'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const LiveAuditFeed = dynamic(() => import('@/components/LiveAuditFeed'), {
  ssr: false,
});

export default function AuditFeedClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return (
    <div className="bg-[#0a0a0f] border border-white/6 rounded-2xl h-48 flex items-center justify-center">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" style={{animationDelay:'0.2s'}}/>
        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" style={{animationDelay:'0.4s'}}/>
        <span className="text-xs text-slate-500 font-mono ml-2">Connecting to governance stream...</span>
      </div>
    </div>
  );

  return <LiveAuditFeed />;
}
