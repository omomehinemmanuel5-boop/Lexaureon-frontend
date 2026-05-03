'use client';

import dynamic from 'next/dynamic';

const LiveAuditFeed = dynamic(() => import('@/components/LiveAuditFeed'), {
  ssr: false,
  loading: () => (
    <div className="bg-[#0a0a0f] border border-white/6 rounded-2xl h-48 flex items-center justify-center">
      <span className="text-xs text-slate-600 font-mono animate-pulse">Loading live audit feed...</span>
    </div>
  ),
});

export default function AuditFeedClient() {
  return <LiveAuditFeed />;
}
