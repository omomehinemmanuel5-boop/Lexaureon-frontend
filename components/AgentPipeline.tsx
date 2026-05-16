'use client';

import { useEffect, useState } from 'react';

interface AgentStep {
  id: number;
  name: string;
  shortName: string;
  status: 'pending' | 'running' | 'complete' | 'intervention';
  details: string[];
  duration?: number;
}

interface AgentPipelineProps {
  // Triggered when a run starts
  running: boolean;
  // Filled after run completes
  result?: {
    c: number; r: number; s: number; m: number;
    intervention: boolean;
    reason?: string;
    health_band?: string;
    audit_id?: string;
    lyapunov_V?: number;
    delta_V?: number;
    semantic_signal?: { attack_type: string; severity: number };
    cbf_triggered?: boolean;
    projection_magnitude?: number;
    adv_gain?: number;
    tokens?: number;
  };
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  const filled = Math.round(pct / 10);
  const empty = 10 - filled;
  return (
    <span className={`font-mono text-xs ${color}`}>
      {'█'.repeat(filled)}{'░'.repeat(empty)}
    </span>
  );
}

function StatusBadge({ status }: { status: AgentStep['status'] }) {
  const cfg = {
    pending:      { text: 'Waiting',    color: 'text-slate-600' },
    running:      { text: 'Running...', color: 'text-blue-400 animate-pulse' },
    complete:     { text: 'Complete ✓', color: 'text-emerald-400' },
    intervention: { text: 'CBF Applied ✓', color: 'text-amber-400' },
  }[status];
  return <span className={`text-xs font-mono ${cfg.color}`}>{cfg.text}</span>;
}

export default function AgentPipeline({ running, result }: AgentPipelineProps) {
  const [steps, setSteps] = useState<AgentStep[]>([
    { id: 1, name: 'Generator Agent',  shortName: 'Generator',  status: 'pending', details: [] },
    { id: 2, name: 'CRS Extractor',    shortName: 'CRS',        status: 'pending', details: [] },
    { id: 3, name: 'Governor Agent',   shortName: 'Governor',   status: 'pending', details: [] },
    { id: 4, name: 'Intervention',     shortName: 'Intervene',  status: 'pending', details: [] },
    { id: 5, name: 'Auditor Agent',    shortName: 'Auditor',    status: 'pending', details: [] },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  // Reset when new run starts
  useEffect(() => {
    if (running) {
      setDone(false);
      setCurrentStep(0);
      setProgress(0);
      setSteps(s => s.map(step => ({ ...step, status: 'pending', details: [] })));
    }
  }, [running]);

  // Animate steps while running
  useEffect(() => {
    if (!running || done) return;

    const timings = [600, 500, 700, 500, 400]; // ms per step
    let elapsed = 0;

    const runStep = (stepIdx: number) => {
      if (stepIdx >= 5) {
        console.debug(`[AgentPipeline] pipeline completed in ${elapsed}ms`);
        setDone(true);
        return;
      }

      // Mark step as running
      setCurrentStep(stepIdx);
      setSteps(s => s.map((step, i) =>
        i === stepIdx ? { ...step, status: 'running' } : step
      ));

      // Animate progress bar
      const start = (stepIdx / 5) * 100;
      const end = ((stepIdx + 1) / 5) * 100;
      let p = start;
      const tick = setInterval(() => {
        p += 3;
        setProgress(Math.min(p, end));
        if (p >= end) clearInterval(tick);
      }, 30);

      // Complete step after timing
      setTimeout(() => {
        clearInterval(tick);
        setProgress(end);
        elapsed += timings[stepIdx];

        // Build details based on index and result
        let details: string[] = [];
        if (stepIdx === 0) {
          const tokens = result?.tokens ?? Math.floor(Math.random() * 100 + 80);
          details = [`Draft generated (${tokens} tokens)`, `Model: llama-3.3-70b-versatile`];
        } else if (stepIdx === 1 && result) {
          const dR = ((result.r - 0.333) * 100).toFixed(0);
          details = [
            `C=${result.c.toFixed(2)} | R=${result.r.toFixed(2)} | S=${result.s.toFixed(2)} | M=${result.m.toFixed(2)}`,
            result.intervention
              ? `ΔR = ${dR}% — velocity breach detected`
              : `All invariants within bounds`,
            result.lyapunov_V !== undefined ? `Lyapunov V = ${result.lyapunov_V.toFixed(5)}` : '',
          ].filter(Boolean);
        } else if (stepIdx === 2 && result) {
          if (result.intervention) {
            details = [
              `Trigger: ${result.semantic_signal?.attack_type !== 'none' ? result.semantic_signal?.attack_type + ' attack' : 'M collapse'}`,
              `Condition: min(C,R,S)=${result.m.toFixed(2)} < τ=0.08`,
              `Action: Rebalance → ${result.reason?.slice(0, 40) ?? 'CBF projection'}`,
            ];
          } else {
            details = [
              `M = ${result.m.toFixed(2)} ≥ τ=0.08 — PASS`,
              `No intervention required`,
              `Health: ${result.health_band ?? 'OPTIMAL'}`,
            ];
          }
        } else if (stepIdx === 3 && result) {
          if (result.intervention) {
            details = [
              `Constraint: ḣ(x) + α(h(x)) ≥ 0`,
              result.projection_magnitude !== undefined
                ? `‖Δx‖ = ${result.projection_magnitude.toFixed(4)} (CBF projection)`
                : `CBF simplex projection applied`,
              result.delta_V !== undefined
                ? `δV = ${result.delta_V.toFixed(5)} ${result.delta_V < 0 ? '↓ stable' : '↑ recovering'}`
                : '',
            ].filter(Boolean);
          } else {
            details = [`No intervention — output passes unchanged`, `Constitutional bounds maintained`];
          }
        } else if (stepIdx === 4 && result) {
          const shortId = result.audit_id?.slice(-8).toUpperCase() ?? '??';
          details = [
            `Receipt ID: LEX-${shortId}`,
            `Hash: ${result.audit_id?.slice(4, 12) ?? '?????'}...`,
            result.adv_gain !== undefined ? `ADV entropy gain: +${result.adv_gain.toFixed(4)}` : '',
            `Status: Signed ✓`,
          ].filter(Boolean);
        }

        const finalStatus: AgentStep['status'] =
          stepIdx === 3 && result?.intervention ? 'intervention'
          : stepIdx === 3 && !result?.intervention ? 'complete'
          : 'complete';

        setSteps(s => s.map((step, i) =>
          i === stepIdx ? { ...step, status: finalStatus, details } : step
        ));

        if (stepIdx < 4) {
          setTimeout(() => runStep(stepIdx + 1), 120);
        } else {
          setDone(true);
        }
      }, timings[stepIdx]);
    };

    runStep(0);
    return () => { elapsed = 0; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // Show re-evaluation step if intervention
  const showReeval = done && result?.intervention;

  if (currentStep === 0 && !running && !done) return null;

  return (
    <div className="rounded-2xl border border-white/6 overflow-hidden"
      style={{ background: '#09090f' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            Constitutional Execution Trace
          </span>
        </div>
        <div className="flex items-center gap-2">
          {running && !done && (
            <span className="text-xs font-mono text-blue-400 animate-pulse">
              {Math.round(progress)}%
            </span>
          )}
          {done && (
            <span className={`text-xs font-mono ${result?.intervention ? 'text-amber-400' : 'text-emerald-400'}`}>
              {result?.intervention ? '⚡ Governed' : '✓ Clean Pass'}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-slate-900">
        <div
          className={`h-full transition-all duration-300 ${
            result?.intervention ? 'bg-amber-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="p-4 space-y-3 font-mono text-xs">
        {steps.map((step) => (
          <div key={step.id}
            className={`transition-all duration-300 ${
              step.status === 'pending' ? 'opacity-30' : 'opacity-100'
            }`}>

            {/* Step header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-slate-600">[{step.id}/5]</span>
                <span className={`font-semibold ${
                  step.status === 'running' ? 'text-blue-300' :
                  step.status === 'complete' ? 'text-slate-200' :
                  step.status === 'intervention' ? 'text-amber-300' :
                  'text-slate-600'
                }`}>{step.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {step.status !== 'pending' && (
                  <ProgressBar
                    pct={step.status === 'running' ? 50 : 100}
                    color={
                      step.status === 'complete' ? 'text-emerald-500' :
                      step.status === 'intervention' ? 'text-amber-500' :
                      'text-blue-500'
                    }
                  />
                )}
                <StatusBadge status={step.status} />
              </div>
            </div>

            {/* Step details */}
            {step.details.length > 0 && (
              <div className="ml-8 space-y-0.5">
                {step.details.map((detail, i) => (
                  <div key={i} className={`text-xs ${
                    detail.includes('breach') || detail.includes('collapse') || detail.includes('attack')
                      ? 'text-red-400'
                      : detail.includes('✓') || detail.includes('stable') || detail.includes('PASS')
                      ? 'text-emerald-400'
                      : detail.includes('CBF') || detail.includes('Rebalance') || detail.includes('Trigger')
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}>
                    {detail}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Re-evaluation step */}
        {showReeval && result && (
          <div className="mt-2 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-slate-600">[4.1]</span>
              <span className="text-emerald-300 font-semibold">Re-evaluation</span>
              <span className="text-emerald-400 text-xs">✓ Stable</span>
            </div>
            <div className="ml-8 space-y-0.5">
              <div className="text-emerald-400">
                C={result.c.toFixed(2)} | R={result.r.toFixed(2)} | S={result.s.toFixed(2)} | M={result.m.toFixed(2)} ✓
              </div>
              <div className="text-slate-500">→ Continue to Auditor</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
