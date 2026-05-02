'use client';

import { useState, useEffect } from 'react';
import InputConsole from '@/components/InputConsole';
import PreEvalPanel from '@/components/PreEvalPanel';
import ResultsPanel from '@/components/ResultsPanel';
import SimplexVisualization from '@/components/SimplexVisualization';
import AuditPanel from '@/components/AuditPanel';
import UpgradeModal from '@/components/UpgradeModal';
import Header from '@/components/Header';
import { GovernanceResponse, PreEvalResult } from '@/types';

// Pure heuristics — module-scope so useEffect deps stay stable

function detectSignals(text: string): string[] {
  const signals: string[] = [];
  if (/\b(agree with me|you.?re right|confirm|validate|yes|correct)\b/i.test(text)) signals.push('sycophancy');
  if (/\b(ignore your|just this once|for research|hypothetically|pretend|imagine|suppose)\b/i.test(text)) signals.push('refusal');
  if (/\b(you are now|act as|roleplay|pretend you|assume you are|become|no restrictions)\b/i.test(text)) signals.push('identity');
  if (/\b(explain differently|reframe|rephrase|another way|simplify|summarize)\b/i.test(text)) signals.push('shift');
  if (/\b(always|never|must|can.?t|impossible)\b/i.test(text)) signals.push('adversarial');
  return signals;
}

function computeRiskLevel(signals: string[]): 'low' | 'medium' | 'high' {
  if (signals.length === 0) return 'low';
  if (signals.length <= 2) return 'medium';
  return 'high';
}

function predictCRS(signals: string[]): { c: number; r: number; s: number } {
  let c = 0.4, r = 0.35, s = 0.25;
  for (const signal of signals) {
    if (signal === 'sycophancy') r -= 0.15;
    else if (signal === 'refusal') s -= 0.15;
    else if (signal === 'identity') c -= 0.15;
    else if (signal === 'shift') c -= 0.08;
    else if (signal === 'adversarial') { r -= 0.1; s -= 0.05; }
  }
  const total = Math.max(0.3, c + r + s);
  return { c: Math.max(0.05, c / total), r: Math.max(0.05, r / total), s: Math.max(0.05, s / total) };
}

function runPreEval(text: string): PreEvalResult {
  const signals = detectSignals(text);
  const { c, r, s } = predictCRS(signals);
  return {
    riskLevel: computeRiskLevel(signals),
    flags: signals,
    predictedC: c,
    predictedR: r,
    predictedS: s,
    confidence: Math.min(0.95, 0.3 + (text.length / 1000) * 0.65),
  };
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<GovernanceResponse | null>(null);
  const [preEval, setPreEval] = useState<PreEvalResult | null>(null);
  const [apiCalls, setApiCalls] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('lex_api_calls');
    if (stored) setApiCalls(parseInt(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('lex_api_calls', apiCalls.toString());
  }, [apiCalls]);

  useEffect(() => {
    setPreEval(prompt.trim() ? runPreEval(prompt) : null);
  }, [prompt]);

  const handleRun = async () => {
    if (apiCalls >= 10) {
      setShowUpgrade(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/lex/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? `API error ${res.status}`);
      }

      const data: GovernanceResponse = await res.json();
      setResponse(data);
      setApiCalls((prev) => prev + 1);
      setShowDiff(false);
    } catch (error) {
      console.error('Governance execution failed:', error);
      alert('Failed to run governance. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex flex-col">
      <Header apiCalls={apiCalls} />

      <main className="flex-1 overflow-y-auto pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6 pt-6 sm:pt-8">
          <InputConsole
            prompt={prompt}
            setPrompt={setPrompt}
            onRun={handleRun}
            loading={loading}
            disabled={apiCalls >= 10}
          />

          {preEval && !response && <PreEvalPanel preEval={preEval} />}

          {response && (
            <div className="space-y-6">
              <ResultsPanel
                response={response}
                showDiff={showDiff}
                onToggleDiff={() => setShowDiff(!showDiff)}
              />

              <SimplexVisualization
                c={response.metrics.c}
                r={response.metrics.r}
                s={response.metrics.s}
                m={response.metrics.m}
                threshold={0.15}
                governorActivated={response.metrics.m < 0.15}
              />

              <AuditPanel
                metrics={response.metrics}
                interventionTriggered={response.intervention?.triggered || false}
                interventionReason={response.intervention?.reason}
              />
            </div>
          )}

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin">
                <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full" />
              </div>
              <span className="ml-4 text-slate-300">Executing governance...</span>
            </div>
          )}
        </div>
      </main>

      {showUpgrade && (
        <UpgradeModal onClose={() => setShowUpgrade(false)} callsUsed={apiCalls} />
      )}
    </div>
  );
}
