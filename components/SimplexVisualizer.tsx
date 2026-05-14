'use client';

interface SimplexVisualizerProps {
  c?: number;
  r?: number;
  s?: number;
  intervention?: boolean;
  animated?: boolean;
}

const C_VERTEX = { x: 140, y: 20 };
const R_VERTEX = { x: 20, y: 240 };
const S_VERTEX = { x: 260, y: 240 };

function toSVG(c: number, r: number, s: number) {
  return {
    x: c * C_VERTEX.x + r * R_VERTEX.x + s * S_VERTEX.x,
    y: c * C_VERTEX.y + r * R_VERTEX.y + s * S_VERTEX.y,
  };
}

// Inner simplex boundary where min(C,R,S) = tau:
// vertices are the three points (tau, tau, 1-2*tau) and permutations
function innerTrianglePoints(tau: number) {
  return [
    toSVG(tau, tau, 1 - 2 * tau),       // near S vertex
    toSVG(tau, 1 - 2 * tau, tau),       // near R vertex
    toSVG(1 - 2 * tau, tau, tau),       // near C vertex
  ];
}

export default function SimplexVisualizer({
  c = 0.333,
  r = 0.333,
  s = 0.334,
  intervention = false,
  animated = false,
}: SimplexVisualizerProps) {
  const pos = toSVG(c, r, s);
  const M = Math.min(c, r, s);
  const dotColor = M > 0.15 ? '#22c55e' : M > 0.05 ? '#f59e0b' : '#ef4444';
  const isPulsing = intervention || animated;

  const floorPts = innerTrianglePoints(0.05);
  const recoveryPts = innerTrianglePoints(0.15);
  const center = toSVG(1 / 3, 1 / 3, 1 / 3);

  const outerPts = `${C_VERTEX.x},${C_VERTEX.y} ${R_VERTEX.x},${R_VERTEX.y} ${S_VERTEX.x},${S_VERTEX.y}`;

  return (
    <svg
      viewBox="0 0 280 268"
      width={280}
      height={260}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="svCBasin" cx="50%" cy="10%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="svRBasin" cx="7%" cy="90%">
          <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="svSBasin" cx="93%" cy="90%">
          <stop offset="0%" stopColor="#9b7fff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#9b7fff" stopOpacity="0" />
        </radialGradient>
        <filter id="svGlow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer triangle fill */}
      <polygon points={outerPts} fill="rgba(7,7,13,0.85)" stroke="rgba(100,116,139,0.4)" strokeWidth="1.5" />

      {/* Basin region fills */}
      <polygon points={outerPts} fill="url(#svCBasin)" />
      <polygon points={outerPts} fill="url(#svRBasin)" />
      <polygon points={outerPts} fill="url(#svSBasin)" />

      {/* τ_recovery boundary (blue dotted) */}
      <polygon
        points={recoveryPts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
        fill="rgba(59,130,246,0.05)"
        stroke="rgba(59,130,246,0.55)"
        strokeWidth="1"
        strokeDasharray="3,2"
      />

      {/* τ_floor boundary (gold dashed) */}
      <polygon
        points={floorPts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
        fill="rgba(239,68,68,0.04)"
        stroke="rgba(201,168,76,0.75)"
        strokeWidth="1"
        strokeDasharray="5,3"
      />

      {/* Center diamond */}
      <polygon
        points={[
          `${center.x},${center.y - 5}`,
          `${center.x + 5},${center.y}`,
          `${center.x},${center.y + 5}`,
          `${center.x - 5},${center.y}`,
        ].join(' ')}
        fill="rgba(255,255,255,0.25)"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="0.5"
      />

      {/* τ labels */}
      <text x={recoveryPts[2].x} y={recoveryPts[2].y - 5} textAnchor="middle" fill="rgba(59,130,246,0.55)" fontSize="6">
        τ_rec=15%
      </text>
      <text x={floorPts[2].x} y={floorPts[2].y - 5} textAnchor="middle" fill="rgba(201,168,76,0.65)" fontSize="6">
        τ_floor=5%
      </text>

      {/* Pulse ring when intervening */}
      {isPulsing && (
        <circle cx={pos.x} cy={pos.y} r="18" fill={dotColor} opacity="0.15">
          <animate attributeName="r" values="10;22;10" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0;0.2" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}

      {/* State dot glow */}
      <circle cx={pos.x} cy={pos.y} r="16" fill={dotColor} opacity="0.12" />

      {/* State dot */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r="7"
        fill={dotColor}
        filter="url(#svGlow)"
        opacity="0.95"
        style={{ transition: 'cx 0.8s cubic-bezier(0.4,0,0.2,1), cy 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
      <circle
        cx={pos.x}
        cy={pos.y}
        r="2.5"
        fill="white"
        opacity="0.9"
        style={{ transition: 'cx 0.8s cubic-bezier(0.4,0,0.2,1), cy 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />

      {/* M score label */}
      <text x={pos.x} y={pos.y - 11} textAnchor="middle" fill={dotColor} fontSize="8" fontWeight="700">
        M={Math.round(M * 100)}%
      </text>

      {/* Corner vertex dots */}
      <circle cx={C_VERTEX.x} cy={C_VERTEX.y} r="5" fill="#3b82f6" filter="url(#svGlow)" />
      <circle cx={R_VERTEX.x} cy={R_VERTEX.y} r="5" fill="#c9a84c" filter="url(#svGlow)" />
      <circle cx={S_VERTEX.x} cy={S_VERTEX.y} r="5" fill="#9b7fff" filter="url(#svGlow)" />

      {/* Corner labels — C (top) */}
      <text x={C_VERTEX.x} y={C_VERTEX.y - 10} textAnchor="middle" fill="#93c5fd" fontSize="13" fontWeight="700">C</text>
      <text x={C_VERTEX.x} y={C_VERTEX.y - 1} textAnchor="middle" fill="#475569" fontSize="7">Continuity</text>

      {/* Corner labels — R (bottom-left) */}
      <text x={R_VERTEX.x - 2} y={R_VERTEX.y + 16} textAnchor="middle" fill="#d4a83c" fontSize="13" fontWeight="700">R</text>
      <text x={R_VERTEX.x + 18} y={R_VERTEX.y + 27} textAnchor="middle" fill="#475569" fontSize="7">Reciprocity</text>

      {/* Corner labels — S (bottom-right) */}
      <text x={S_VERTEX.x + 2} y={S_VERTEX.y + 16} textAnchor="middle" fill="#c4b5fd" fontSize="13" fontWeight="700">S</text>
      <text x={S_VERTEX.x - 18} y={S_VERTEX.y + 27} textAnchor="middle" fill="#475569" fontSize="7">Sovereignty</text>

      {/* Bottom label */}
      <text x={140} y={260} textAnchor="middle" fill="#1e293b" fontSize="7">
        C+R+S=1 · Constitutional Simplex
      </text>
    </svg>
  );
}
