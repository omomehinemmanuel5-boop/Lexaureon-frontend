import { PreEvalResult } from '@/types';

interface PreEvalPanelProps {
  preEval: PreEvalResult;
}

const riskColors = {
  low: 'bg-green-900/30 border-green-700 text-green-300',
  medium: 'bg-yellow-900/30 border-yellow-700 text-yellow-300',
  high: 'bg-red-900/30 border-red-700 text-red-300',
};

const flagEmojis: Record<string, string> = {
  sycophancy: '🎯',
  refusal: '🔒',
  identity: '👤',
  shift: '🔄',
  adversarial: '⚔️',
};

const flagLabels: Record<string, string> = {
  sycophancy: 'Sycophancy',
  refusal: 'Refusal Bypass',
  identity: 'Identity Reframing',
  shift: 'Distribution Shift',
  adversarial: 'Adversarial',
};

export default function PreEvalPanel({ preEval }: PreEvalPanelProps) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Pre-Evaluation (Heuristic)</h3>
        <span className="text-xs text-slate-500">
          Confidence: {(preEval.confidence * 100).toFixed(0)}%
        </span>
      </div>

      {/* Risk Level Badge */}
      <div className={`inline-block px-3 py-1 rounded-full border text-sm font-medium mb-4 ${riskColors[preEval.riskLevel]}`}>
        {preEval.riskLevel === 'low' && '✓ Low Risk'}
        {preEval.riskLevel === 'medium' && '⚠ Medium Risk'}
        {preEval.riskLevel === 'high' && '✗ High Risk'}
      </div>

      {/* Flags */}
      {preEval.flags.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-2">Detected Signals:</p>
          <div className="flex flex-wrap gap-2">
            {preEval.flags.map((flag) => (
              <span
                key={flag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300"
              >
                <span>{flagEmojis[flag] || '🔍'}</span>
                {flagLabels[flag] || flag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Predicted CRS Scores */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">Continuity</div>
          <div className="text-lg sm:text-xl font-bold text-blue-400">
            {(preEval.predictedC * 100).toFixed(0)}%
          </div>
          <div className="w-full bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full"
              style={{ width: `${preEval.predictedC * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">Reciprocity</div>
          <div className="text-lg sm:text-xl font-bold text-green-400">
            {(preEval.predictedR * 100).toFixed(0)}%
          </div>
          <div className="w-full bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-green-500 h-full"
              style={{ width: `${preEval.predictedR * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">Sovereignty</div>
          <div className="text-lg sm:text-xl font-bold text-purple-400">
            {(preEval.predictedS * 100).toFixed(0)}%
          </div>
          <div className="w-full bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-purple-500 h-full"
              style={{ width: `${preEval.predictedS * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
