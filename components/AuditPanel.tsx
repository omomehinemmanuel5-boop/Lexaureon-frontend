'use client';

import { useState } from 'react';
import type { TrustReceipt } from '@/types';

interface AuditPanelProps {
  metrics: { c: number; r: number; s: number; m: number };
  interventionTriggered: boolean;
  interventionReason?: string;
  trustReceipt?: TrustReceipt | null;
}

export default function AuditPanel({
  metrics,
  interventionTriggered,
  interventionReason,
  trustReceipt,
}: AuditPanelProps) {
  const [showReceipt, setShowReceipt] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyReceipt = async () => {
    if (!trustReceipt) return;
    await navigator.clipboard.writeText(JSON.stringify(trustReceipt, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Governance Audit</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Left column */}
        <div className="space-y-3">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Continuity</div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-400 mt-1">
                  {(metrics.c * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-4xl text-blue-600/30">C</div>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: `${metrics.c * 100}%` }} />
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Sovereignty</div>
                <div className="text-2xl sm:text-3xl font-bold text-purple-400 mt-1">
                  {(metrics.s * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-4xl text-purple-600/30">S</div>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-purple-500 h-full" style={{ width: `${metrics.s * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-3">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Reciprocity</div>
                <div className="text-2xl sm:text-3xl font-bold text-green-400 mt-1">
                  {(metrics.r * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-4xl text-green-600/30">R</div>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-green-500 h-full" style={{ width: `${metrics.r * 100}%` }} />
            </div>
          </div>

          <div
            className={`rounded-lg p-3 sm:p-4 border ${
              interventionTriggered
                ? 'bg-red-900/20 border-red-700'
                : 'bg-slate-800/50 border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">
                  Stability Margin
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-bold mt-1 ${
                    interventionTriggered ? 'text-red-400' : 'text-cyan-400'
                  }`}
                >
                  {(metrics.m * 100).toFixed(1)}%
                </div>
              </div>
              <div
                className={`text-4xl ${interventionTriggered ? 'text-red-600/30' : 'text-cyan-600/30'}`}
              >
                M
              </div>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className={interventionTriggered ? 'bg-red-500' : 'bg-cyan-500'}
                style={{ width: `${metrics.m * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Governor Status */}
      <div className="border-t border-slate-700 pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-300">Governor Status</span>
          <span
            className={`text-sm font-semibold px-3 py-1 rounded-full ${
              interventionTriggered
                ? 'bg-red-900/30 border border-red-700 text-red-300'
                : 'bg-green-900/30 border border-green-700 text-green-300'
            }`}
          >
            {interventionTriggered ? '🔴 INTERVENTION ACTIVE' : '🟢 NOMINAL'}
          </span>
        </div>

        {interventionTriggered && interventionReason && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 mt-2">
            <div className="text-xs text-red-300 font-medium mb-1">Intervention Reason:</div>
            <div className="text-sm text-red-200 font-mono">{interventionReason}</div>
          </div>
        )}

        <div className="text-xs text-slate-400 mt-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-500">Threshold τ:</span>{' '}
              <span className="text-slate-300 font-mono">0.15</span>
            </div>
            <div>
              <span className="text-slate-500">Formula:</span>{' '}
              <span className="text-slate-300 font-mono">M = min(C,R,S)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Receipt */}
      {trustReceipt && (
        <div className="border-t border-slate-700 pt-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-slate-300">Trust Receipt</span>
              <span className="ml-2 text-xs text-slate-500 font-mono">
                {trustReceipt.run_id}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyReceipt}
                className="text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 px-3 py-1 rounded-md transition-colors"
              >
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
              <button
                onClick={() => setShowReceipt(!showReceipt)}
                className="text-xs text-blue-400 hover:text-blue-300 border border-blue-800 hover:border-blue-600 px-3 py-1 rounded-md transition-colors"
              >
                {showReceipt ? 'Hide' : 'View'}
              </button>
            </div>
          </div>

          {showReceipt && (
            <div className="mt-3 bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-300 overflow-auto max-h-64 space-y-1">
              <div>
                <span className="text-slate-500">generated_at:</span>{' '}
                {trustReceipt.generated_at}
              </div>
              <div>
                <span className="text-slate-500">input_hash:</span>{' '}
                <span className="text-slate-400 break-all">{trustReceipt.input_hash}</span>
              </div>
              <div>
                <span className="text-slate-500">governed_hash:</span>{' '}
                <span className="text-slate-400 break-all">
                  {trustReceipt.governed_output_hash}
                </span>
              </div>
              <div>
                <span className="text-slate-500">intervention:</span>{' '}
                <span className={trustReceipt.intervention ? 'text-red-400' : 'text-green-400'}>
                  {String(trustReceipt.intervention)}
                </span>
              </div>
              <div>
                <span className="text-slate-500">M:</span> {(trustReceipt.M ?? 0).toFixed(4)}
              </div>
              <div>
                <span className="text-slate-500">receipt_version:</span>{' '}
                {trustReceipt.receipt_version}
              </div>
              <div>
                <span className="text-slate-500">key_id:</span> {trustReceipt.key_id}
              </div>
              <div>
                <span className="text-slate-500">signature:</span>{' '}
                <span className="text-cyan-400 break-all">
                  {trustReceipt.integrity_signature}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
