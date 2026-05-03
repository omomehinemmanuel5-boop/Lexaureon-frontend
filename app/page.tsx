'use client';

import { useState, useEffect, useRef } from 'react';
import InputConsole from '@/components/InputConsole';
import GovernanceDisplay from '@/components/GovernanceDisplay';


import UpgradeModal from '@/components/UpgradeModal';
import Header from '@/components/Header';
import SignalPillBar from '@/components/SignalPillBar';
import { GovernanceResponse } from '@/types';

const MAX_CALLS = 10;

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<GovernanceResponse | null>(null);
  const [apiCalls, setApiCalls] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

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
    
    try {
      const res = await fetch('/api/lex/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, session_id: 'user-session' }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Error ${res.status}`);
      }
      const data = await res.json();
      setResponse(data);
      setApiCalls(prev => prev + 1);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col">
      <Header apiCalls={apiCalls} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-32">
          <InputConsole prompt={prompt} setPrompt={setPrompt} onRun={handleRun} loading={loading} disabled={apiCalls >= MAX_CALLS} />
          <SignalPillBar prompt={prompt} />
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
              <p className="text-sm text-red-300">⚠️ {error}</p>
            </div>
          )}
          {loading && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-[3px] border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-sm text-slate-400">Executing constitutional governance...</p>
            </div>
          )}
          {response && !loading && (
            <div ref={resultsRef} className="space-y-4">
              <GovernanceDisplay response={response} />
            </div>
          )}
        </div>
      </main>
      {prompt.trim() && !loading && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 md:hidden z-30">
          <button onClick={handleRun} disabled={apiCalls >= MAX_CALLS} className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-xl disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all active:scale-95">
            {apiCalls >= MAX_CALLS ? 'Limit Reached — Upgrade' : '⚡ Run Governance'}
          </button>
        </div>
      )}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} callsUsed={apiCalls} />}
    </div>
  );
}
