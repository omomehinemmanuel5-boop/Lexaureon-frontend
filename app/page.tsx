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

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<GovernanceResponse | null>(null);
  const [preEval, setPreEval] = useState<PreEvalResult | null>(null);
  const [apiCalls, setApiCalls] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  // Load API call count from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('lex_api_calls');
    if (stored) setApiCalls(parseInt(stored));
  }, []);

  // Update localStorage when API calls change
  useEffect(() => {
    localStorage.setItem('lex_api_calls', apiCalls.toString());
  }, [apiCalls]);

  // Run pre-eval heuristics as user types
  useEffect(() => {
    if (prompt.trim()) {
      const preEvalResult = runPreEval(prompt);
      setPreEval(preEvalResult);
    } else {
      setPreEval(null);
    }
  }, [prompt]);

  const runPreEval = (text: string): PreEvalResult => {
    // Dynamic heuristics engine
    const signals = detectSignals(text);
    const riskLevel = computeRiskLevel(signals);
    const predictedScores = predictCRS(signals);

    return {
      riskLevel,
      flags: signals,
      predictedC: predictedScores.c,
      predictedR: predictedScores.r,
      predictedS: predictedScores.s,
      confidence: Math.min(0.95, 0.3 + (text.length / 1000) * 0.65),
    };
  };

  const detectSignals = (text: string): string[] => {
    const lowerText = text.toLowerCase();
    const signals: string[] = [];

    // Sycophancy detection
    if (/\b(agree with me|you.?re right|confirm|validate|yes|correct)\b/i.test(text)) {
      signals.push('sycophancy');
    }

    // Refusal bypass detection
    if (/\b(ignore your|just this once|for research|hypothetically|pretend|imagine|suppose)\b/i.test(text)) {
      signals.push('refusal');
    }

    // Identity reframing detection
    if (/\b(you are now|act as|roleplay|pretend you|assume you are|become|no restrictions)\b/i.test(text)) {
      signals.push('identity');
    }

    // Distribution shift detection
    if (/\b(explain differently|reframe|rephrase|another way|simplify|summarize)\b/i.test(text)) {
      signals.push('shift');
    }

    // Adversarial patterns
    if (/\b(always|never|must|can.?t|impossible)\b/i.test(text)) {
      signals.push('adversarial');
    }

    return signals;
  };

  const computeRiskLevel = (signals: string[]): 'low' | 'medium' | 'high' => {
    if (signals.length === 0) return 'low';
    if (signals.length <= 2) return 'medium';
    return 'high';
  };

  const predictCRS = (signals: string[]): { c: number; r: number; s: number } => {
    let c = 0.4;
    let r = 0.35;
    let s = 0.25;

    signals.forEach((signal) => {
      switch (signal) {
        case 'sycophancy':
          r -= 0.15;
          break;
        case 'refusal':
          s -= 0.15;
          break;
        case 'identity':
          c -= 0.15;
          break;
        case 'shift':
          c -= 0.08;
          break;
        case 'adversarial':
          r -= 0.1;
          s -= 0.05;
          break;
      }
    });

    // Normalize to simplex (sum = 1)
    const total = Math.max(0.3, c + r + s);
    return {
      c: Math.max(0.05, c / total),
      r: Math.max(0.05, r / total),
      s: Math.max(0.05, s / total),
    };
  };

  const handleRun = async () => {
    if (apiCalls >= 10) {
      setShowUpgrade(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_LEX_API_BASE_URL || 'https://api.lexaureon.com'}/lex/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6 pt-6 sm:pt-8">
          {/* Input Console */}
          <InputConsole
            prompt={prompt}
            setPrompt={setPrompt}
            onRun={handleRun}
            loading={loading}
            disabled={apiCalls >= 10}
          />

          {/* Pre-Evaluation Panel */}
          {preEval && !response && (
            <PreEvalPanel preEval={preEval} />
          )}

          {/* Results Panel */}
          {response && (
            <div className="space-y-6">
              <ResultsPanel
                response={response}
                showDiff={showDiff}
                onToggleDiff={() => setShowDiff(!showDiff)}
              />

              {/* Simplex Visualization */}
              <SimplexVisualization
                c={response.metrics.c}
                r={response.metrics.r}
                s={response.metrics.s}
                m={response.metrics.m}
                threshold={0.15}
                governorActivated={response.metrics.m < 0.15}
              />

              {/* Audit Panel */}
              <AuditPanel
                metrics={response.metrics}
                interventionTriggered={response.intervention?.triggered || false}
                interventionReason={response.intervention?.reason}
              />
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin">
                <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full"></div>
              </div>
              <span className="ml-4 text-slate-300">Executing governance...</span>
            </div>
          )}
        </div>
      </main>

      {/* Upgrade Modal */}
      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          callsUsed={apiCalls}
        />
      )}
    </div>
  );
}
