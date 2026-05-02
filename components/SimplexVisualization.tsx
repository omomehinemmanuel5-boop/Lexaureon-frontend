'use client';

interface SimplexVisualizationProps {
  c: number;
  r: number;
  s: number;
  m: number;
  threshold: number;
  governorActivated: boolean;
}

export default function SimplexVisualization({
  c,
  r,
  s,
  m,
  threshold,
  governorActivated,
}: SimplexVisualizationProps) {
  // SVG dimensions
  const size = 300;
  const padding = 40;
  const width = size + padding * 2;
  const height = size + padding * 2;

  // Calculate barycentric coordinates for equilateral triangle
  const height_tri = (size * Math.sqrt(3)) / 2;
  const topX = width / 2;
  const topY = padding;
  const leftX = padding;
  const leftY = padding + height_tri;
  const rightX = width - padding;
  const rightY = padding + height_tri;

  // Convert CRS to point coordinates
  const px = (c * rightX + r * leftX + s * topX) / (c + r + s || 1);
  const py = (c * rightY + r * leftY + s * topY) / (c + r + s || 1);

  // Threshold zone (simplex interior)
  const tau_offset = 20;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 sm:p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Constitutional State Space</h3>
        {governorActivated && (
          <span className="text-xs px-3 py-1 bg-red-900/30 border border-red-700 text-red-300 rounded-full">
            ⚠️ Governor Activated
          </span>
        )}
      </div>

      {/* SVG Triangle Visualization */}
      <div className="flex justify-center mb-6 overflow-x-auto">
        <svg width={width} height={height} className="min-w-full sm:min-w-0">
          {/* Define gradients */}
          <defs>
            <linearGradient id="safe-zone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
              <stop offset="100%" stopColor="rgba(34, 197, 94, 0.1)" />
            </linearGradient>
          </defs>

          {/* Safe zone (tau threshold) */}
          <polygon
            points={`${topX},${topY + tau_offset} ${leftX + tau_offset},${leftY - tau_offset} ${rightX - tau_offset},${rightY - tau_offset}`}
            fill="url(#safe-zone)"
            stroke="rgba(96, 165, 250, 0.3)"
            strokeDasharray="4,4"
            strokeWidth="1"
          />

          {/* Main simplex triangle */}
          <polygon
            points={`${topX},${topY} ${leftX},${leftY} ${rightX},${rightY}`}
            fill="none"
            stroke="rgba(148, 163, 184, 0.3)"
            strokeWidth="2"
          />

          {/* Vertex labels and colors */}
          {/* C (Continuity) - top - blue */}
          <circle cx={topX} cy={topY} r="6" fill="rgba(59, 130, 246, 0.8)" />
          <text
            x={topX}
            y={topY - 20}
            textAnchor="middle"
            className="text-xs font-bold fill-blue-400"
          >
            C
          </text>
          <text
            x={topX}
            y={topY - 8}
            textAnchor="middle"
            className="text-xs fill-slate-400"
          >
            Continuity
          </text>

          {/* R (Reciprocity) - left - green */}
          <circle cx={leftX} cy={leftY} r="6" fill="rgba(34, 197, 94, 0.8)" />
          <text
            x={leftX - 15}
            y={leftY + 5}
            textAnchor="end"
            className="text-xs font-bold fill-green-400"
          >
            R
          </text>
          <text
            x={leftX - 15}
            y={leftY + 15}
            textAnchor="end"
            className="text-xs fill-slate-400"
          >
            Reciprocity
          </text>

          {/* S (Sovereignty) - right - purple */}
          <circle cx={rightX} cy={rightY} r="6" fill="rgba(168, 85, 247, 0.8)" />
          <text
            x={rightX + 15}
            y={rightY + 5}
            textAnchor="start"
            className="text-xs font-bold fill-purple-400"
          >
            S
          </text>
          <text
            x={rightX + 15}
            y={rightY + 15}
            textAnchor="start"
            className="text-xs fill-slate-400"
          >
            Sovereignty
          </text>

          {/* Current state point */}
          <circle
            cx={px}
            cy={py}
            r="8"
            fill="rgba(251, 191, 36, 0.9)"
            stroke="rgb(217, 119, 6)"
            strokeWidth="2"
          />

          {/* State label */}
          <text
            x={px}
            y={py - 15}
            textAnchor="middle"
            className="text-xs font-bold fill-yellow-400"
          >
            State
          </text>
        </svg>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">C</div>
          <div className="text-lg sm:text-xl font-bold text-blue-400">
            {(c * 100).toFixed(0)}%
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">R</div>
          <div className="text-lg sm:text-xl font-bold text-green-400">
            {(r * 100).toFixed(0)}%
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">S</div>
          <div className="text-lg sm:text-xl font-bold text-purple-400">
            {(s * 100).toFixed(0)}%
          </div>
        </div>
        <div className={`rounded-lg p-3 ${governorActivated ? 'bg-red-900/30 border border-red-700' : 'bg-slate-800/50'}`}>
          <div className="text-xs text-slate-400 mb-1">M</div>
          <div className={`text-lg sm:text-xl font-bold ${governorActivated ? 'text-red-400' : 'text-cyan-400'}`}>
            {(m * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Threshold info */}
      <div className="mt-4 text-xs text-slate-400 flex items-center justify-center gap-2">
        <span>Threshold τ = {(threshold * 100).toFixed(0)}%</span>
        <span>•</span>
        <span>M = min(C, R, S)</span>
      </div>
    </div>
  );
}
