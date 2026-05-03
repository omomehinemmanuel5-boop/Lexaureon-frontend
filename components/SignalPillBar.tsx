'use client';

import { useEffect, useState } from 'react';

interface Signal {
  type: string;
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
  description: string;
}

const SIGNAL_RULES: { pattern: RegExp; signal: Signal }[] = [
  {
    pattern: /\b(agree with me|you.?re right|confirm|validate|tell me i.?m|am i right)\b/i,
    signal: {
      type: 'sycophancy',
      label: 'Sycophancy',
      icon: '🎭',
      color: 'text-yellow-300',
      bg: 'bg-yellow-900/30',
      border: 'border-yellow-700/50',
      description: 'R collapse risk — AI may over-agree'
    }
  },
  {
    pattern: /\b(ignore your|just this once|for research|hypothetically|pretend|imagine you|suppose you|no restrictions|forget your)\b/i,
    signal: {
      type: 'refusal_bypass',
      label: 'Bypass Attempt',
      icon: '🚫',
      color: 'text-red-300',
      bg: 'bg-red-900/30',
      border: 'border-red-700/50',
      description: 'S collapse risk — sovereignty override attempt'
    }
  },
  {
    pattern: /\b(you are now|act as|roleplay|pretend you are|assume you are|become a|no longer|you.?re not|forget you are)\b/i,
    signal: {
      type: 'identity',
      label: 'Identity Reframe',
      icon: '🎭',
      color: 'text-orange-300',
      bg: 'bg-orange-900/30',
      border: 'border-orange-700/50',
      description: 'C collapse risk — identity destabilization'
    }
  },
  {
    pattern: /\b(explain differently|reframe|rephrase|another way|change your|look at it|different perspective|reconsider)\b/i,
    signal: {
      type: 'distribution_shift',
      label: 'Distribution Shift',
      icon: '📊',
      color: 'text-blue-300',
      bg: 'bg-blue-900/30',
      border: 'border-blue-700/50',
      description: 'Velocity trigger — rapid state change'
    }
  },
  {
    pattern: /\b(always|never|must|absolutely|impossible|you have to|you must|cannot refuse|no choice)\b/i,
    signal: {
      type: 'adversarial',
      label: 'Adversarial',
      icon: '⚡',
      color: 'text-purple-300',
      bg: 'bg-purple-900/30',
      border: 'border-purple-700/50',
      description: 'Constraint override — coercive framing'
    }
  },
  {
    pattern: /\b(jailbreak|bypass|exploit|hack|override|circumvent|disable|unlock|uncensored|unrestricted)\b/i,
    signal: {
      type: 'exploit',
      label: 'Exploit Signal',
      icon: '🔴',
      color: 'text-red-400',
      bg: 'bg-red-950/40',
      border: 'border-red-600',
      description: 'Critical — direct constitutional attack'
    }
  },
];

function getRiskLevel(signals: Signal[]): { level: string; color: string; bg: string } {
  if (signals.some(s => s.type === 'exploit' || s.type === 'refusal_bypass')) {
    return { level: 'HIGH', color: 'text-red-400', bg: 'bg-red-900/20' };
  }
  if (signals.length >= 2) {
    return { level: 'MEDIUM', color: 'text-yellow-400', bg: 'bg-yellow-900/20' };
  }
  if (signals.length === 1) {
    return { level: 'LOW', color: 'text-blue-400', bg: 'bg-blue-900/20' };
  }
  return { level: 'CLEAR', color: 'text-emerald-400', bg: 'bg-emerald-900/10' };
}

interface SignalPillBarProps {
  prompt: string;
}

export default function SignalPillBar({ prompt }: SignalPillBarProps) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!prompt.trim()) {
      setSignals([]);
      setVisible(false);
      return;
    }

    const detected = SIGNAL_RULES
      .filter(rule => rule.pattern.test(prompt))
      .map(rule => rule.signal);

    // Deduplicate
    const unique = detected.filter((s, i, arr) => arr.findIndex(x => x.type === s.type) === i);
    setSignals(unique);
    setVisible(true);
  }, [prompt]);

  if (!visible || !prompt.trim()) return null;

  const risk = getRiskLevel(signals);

  return (
    <div className="animate-in slide-in-from-bottom-2 duration-200">
      {/* Main pill bar */}
      <div
        className={`rounded-xl border p-3 cursor-pointer transition-all duration-200 ${risk.bg} ${signals.length > 0 ? 'border-slate-700' : 'border-emerald-900/30'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {/* Risk badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${risk.color} bg-slate-900/60 border border-slate-700 flex-shrink-0`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current inline-block animate-pulse"></span>
            Pre-Eval: {risk.level}
          </div>

          {signals.length === 0 ? (
            <span className="text-xs text-emerald-400">✓ No constitutional signals detected</span>
          ) : (
            <>
              {signals.map((signal, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${signal.color} ${signal.bg} ${signal.border}`}
                >
                  <span>{signal.icon}</span>
                  <span>{signal.label}</span>
                </div>
              ))}
              <span className="text-xs text-slate-500 ml-auto flex-shrink-0">
                {expanded ? '▲' : '▼'} details
              </span>
            </>
          )}
        </div>

        {/* Expanded details */}
        {expanded && signals.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2">
            <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Signal Analysis</div>
            {signals.map((signal, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-base flex-shrink-0">{signal.icon}</span>
                <div>
                  <div className={`text-xs font-semibold ${signal.color}`}>{signal.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{signal.description}</div>
                </div>
              </div>
            ))}
            <div className="mt-3 pt-2 border-t border-slate-800">
              <div className="text-xs text-slate-500">
                Governor will {signals.length > 0 ? <span className="text-amber-400">monitor actively</span> : <span className="text-emerald-400">pass through</span>} based on detected signals.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
