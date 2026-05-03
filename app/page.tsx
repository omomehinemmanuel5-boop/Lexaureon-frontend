import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lex Aureon — AI That Governs Itself',
  description:
    'Constitutional AI governance powered by the Aureonics C+R+S framework. Real-time monitoring, governor intervention, and cryptographic audit trails for language models.',
  openGraph: {
    title: 'Lex Aureon — AI That Governs Itself',
    description:
      'Real-time constitutional monitoring across Continuity, Reciprocity, and Sovereignty. Built on peer-reviewed research.',
    type: 'website',
  },
};

/* ─── Animated Hero Simplex ─────────────────────────────── */

function AnimatedSimplex() {
  const W = 440, H = 356;
  const top   = { x: 220, y: 24  };
  const left  = { x: 24,  y: 332 };
  const right = { x: 416, y: 332 };

  const tau = 28;
  const iT = { x: top.x,         y: top.y   + tau * 1.2  };
  const iL = { x: left.x  + tau, y: left.y  - tau * 0.5  };
  const iR = { x: right.x - tau, y: right.y - tau * 0.5  };

  return (
    <div className="relative w-full max-w-[480px] mx-auto lg:mx-0">
      <div className="absolute inset-0 bg-blue-600/8 rounded-3xl blur-3xl pointer-events-none" />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        style={{ filter: 'drop-shadow(0 0 40px rgba(59,130,246,0.12))' }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="hBg" cx="50%" cy="60%">
            <stop offset="0%"   stopColor="#0f2744" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.25" />
          </radialGradient>
          <radialGradient id="hGold" cx="50%" cy="50%">
            <stop offset="0%"   stopColor="#f59e0b" stopOpacity="0.9" />
            <stop offset="70%"  stopColor="#f59e0b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <filter id="hGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="hVtx" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Main triangle */}
        <polygon
          points={`${top.x},${top.y} ${left.x},${left.y} ${right.x},${right.y}`}
          fill="url(#hBg)" stroke="rgba(100,116,139,0.28)" strokeWidth="1.5"
        />

        {/* Subtle inner fill */}
        <polygon
          points={`${top.x},${top.y} ${left.x},${left.y} ${right.x},${right.y}`}
          fill="rgba(59,130,246,0.03)"
        />

        {/* Grid lines */}
        {([[top, left], [top, right], [left, right]] as const).map(([a, b], i) => (
          <line key={i}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke="rgba(71,85,105,0.15)" strokeWidth="0.5"
          />
        ))}

        {/* τ safe zone */}
        <polygon
          points={`${iT.x},${iT.y} ${iL.x},${iL.y} ${iR.x},${iR.y}`}
          fill="rgba(59,130,246,0.05)"
          stroke="rgba(59,130,246,0.32)" strokeWidth="1" strokeDasharray="5,3"
        />
        <text x={iT.x} y={iT.y - 8} textAnchor="middle"
          fill="rgba(59,130,246,0.45)" fontSize="9" fontFamily="monospace">
          τ = 8% safe threshold
        </text>

        {/* Drift trajectory (fades in as dot approaches unsafe zone) */}
        <path
          className="cs-trajectory"
          d={`M 202 286 L 204 320`}
          stroke="rgba(239,68,68,0.5)" strokeWidth="1.5" strokeDasharray="4,3"
          fill="none"
        />

        {/* Vertex nodes */}
        <circle cx={top.x}   cy={top.y}   r="9" fill="#3b82f6" filter="url(#hVtx)" />
        <circle cx={left.x}  cy={left.y}  r="9" fill="#22c55e" filter="url(#hVtx)" />
        <circle cx={right.x} cy={right.y} r="9" fill="#a855f7" filter="url(#hVtx)" />

        {/* Vertex labels */}
        <text x={top.x}   y={top.y - 16}  textAnchor="middle" fill="#93c5fd"  fontSize="15" fontWeight="700">C</text>
        <text x={top.x}   y={top.y - 4}   textAnchor="middle" fill="#64748b"  fontSize="8">Continuity</text>
        <text x={left.x}  y={left.y + 20} textAnchor="middle" fill="#86efac"  fontSize="15" fontWeight="700">R</text>
        <text x={left.x + 42} y={left.y + 20} textAnchor="middle" fill="#64748b" fontSize="8">Reciprocity</text>
        <text x={right.x} y={right.y + 20} textAnchor="middle" fill="#d8b4fe" fontSize="15" fontWeight="700">S</text>
        <text x={right.x - 42} y={right.y + 20} textAnchor="middle" fill="#64748b" fontSize="8">Sovereignty</text>

        {/* ── Animated state dot (entire group translates via CSS) ── */}
        <g className="cs-orbit">
          {/* Outer glow ring */}
          <circle cx="0" cy="0" r="32" className="cs-glow" fill="url(#hGold)" />
          {/* Main dot */}
          <circle cx="0" cy="0" r="11" className="cs-dot" filter="url(#hGlow)" fill="#f59e0b" />
          {/* Inner white */}
          <circle cx="0" cy="0" r="4.5" className="cs-white" fill="white" />
          {/* M score label */}
          <text x="0" y="-18" textAnchor="middle"
            className="cs-m-label" fill="#f59e0b"
            fontSize="10" fontWeight="800" fontFamily="monospace">M</text>
        </g>

        {/* ── Governor intervention badge (fades in when unsafe) ── */}
        <g className="cs-gov-badge">
          <rect x="110" y="8" width="220" height="26" rx="13"
            fill="rgba(239,68,68,0.18)" stroke="rgba(239,68,68,0.55)" strokeWidth="1" />
          <circle cx="128" cy="21" r="4" fill="#ef4444" opacity="0.9" />
          <text x="148" y="26" fill="#fca5a5" fontSize="10" fontWeight="700">
            GOVERNOR INTERVENING
          </text>
        </g>

        {/* ── Stable / governed badge ── */}
        <g className="cs-safe-badge">
          <rect x="118" y="8" width="204" height="26" rx="13"
            fill="rgba(16,185,129,0.18)" stroke="rgba(16,185,129,0.45)" strokeWidth="1" />
          <circle cx="136" cy="21" r="4" fill="#10b981" opacity="0.9" />
          <text x="150" y="26" fill="#6ee7b7" fontSize="10" fontWeight="700">
            CONSTITUTIONAL BOUNDS MET
          </text>
        </g>

        {/* Bottom equation */}
        <text x={W / 2} y={H - 6} textAnchor="middle"
          fill="#1e293b" fontSize="9" fontFamily="monospace">
          C + R + S = 1 · Constitutional Simplex · Aureonics Framework
        </text>
      </svg>
    </div>
  );
}

/* ─── Navigation ─────────────────────────────────────────── */

function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-900/40 flex-shrink-0">
            <span className="text-white text-xs font-black tracking-tight">A</span>
          </div>
          <div className="leading-none">
            <div className="font-bold text-sm text-white">Lex Aureon</div>
            <div className="text-[10px] text-slate-500">by Aureonics</div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <a href="https://doi.org/10.5281/zenodo.18944243"
            target="_blank" rel="noopener noreferrer"
            className="text-sm text-slate-400 hover:text-white transition-colors">
            Research
          </a>
          <Link href="/console" className="text-sm text-slate-400 hover:text-white transition-colors">
            Console
          </Link>
          <a href="mailto:enterprise@lexaureon.com"
            className="text-sm text-slate-400 hover:text-white transition-colors">
            Enterprise
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/console"
            className="hidden sm:block text-sm text-slate-300 hover:text-white transition-colors px-3 py-1.5">
            Sign In
          </Link>
          <Link href="/console"
            className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-900/30 active:scale-95">
            Try Free →
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero ───────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(148,163,184,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148,163,184,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-24 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left — copy */}
          <div className="flex-1 text-center lg:text-left max-w-xl mx-auto lg:mx-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-700/50 bg-blue-950/40 mb-6 hero-animate">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 badge-dot inline-block" />
              <span className="text-xs text-blue-300 font-medium">Peer-Reviewed Research · Aureonics Framework</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-white hero-animate delay-100">
              AI That<br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
                Governs Itself
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-400 leading-relaxed hero-animate delay-200">
              Real-time constitutional monitoring for language models.
              The <span className="text-slate-200 font-medium">C+R+S=1</span> framework maintains stability across
              Continuity, Reciprocity, and Sovereignty — with automatic intervention when
              the margin M&nbsp;=&nbsp;min(C,R,S) falls below threshold τ.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-8 hero-animate delay-300 justify-center lg:justify-start">
              <Link href="/console"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all shadow-xl shadow-blue-900/40 active:scale-95 text-sm">
                Open Console — Free
              </Link>
              <a href="https://doi.org/10.5281/zenodo.18944243"
                target="_blank" rel="noopener noreferrer"
                className="px-6 py-3 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-medium rounded-xl transition-all text-sm">
                Read the Research ↗
              </a>
            </div>

            {/* Trust micro-bar */}
            <div className="flex items-center gap-4 mt-8 hero-animate delay-400 justify-center lg:justify-start flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="text-slate-400">📄</span>
                <span>Zenodo · doi.org/10.5281/zenodo.18944243</span>
              </div>
              <div className="hidden sm:block w-px h-3 bg-slate-700" />
              <div className="text-xs text-slate-500">
                Emmanuel King · <span className="text-slate-400">Aureonics</span>
              </div>
            </div>
          </div>

          {/* Right — animated simplex */}
          <div className="flex-1 hero-animate delay-200 w-full">
            <AnimatedSimplex />
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─── Trust Bar ──────────────────────────────────────────── */

function TrustBar() {
  const items = [
    { icon: '📄', text: 'Peer-Reviewed Research', sub: 'Zenodo · 2025' },
    { icon: '🔬', text: 'Emmanuel King', sub: 'Aureonics · ORCID 0009-0000-2986-4935' },
    { icon: '🏛️', text: 'Constitutional Framework', sub: 'C+R+S Triadic Model' },
    { icon: '🔐', text: 'Cryptographic Audit Trail', sub: 'Chain-hash immutability' },
  ];

  return (
    <div className="border-y border-white/5 bg-slate-900/30 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.text} className="flex items-start gap-2.5">
              <span className="text-lg mt-0.5 flex-shrink-0">{item.icon}</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">{item.text}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Problem / Solution ─────────────────────────────────── */

function ProblemSection() {
  const stages = [
    {
      icon: '⚠',
      label: 'Unmonitored',
      title: 'No Constitutional Bounds',
      desc: 'Language models operate without stability guarantees. Output quality drifts. Alignment failures go undetected.',
      color: 'border-red-800/50 bg-red-900/10',
      badge: 'text-red-400 bg-red-900/20 border-red-800',
    },
    {
      icon: '🔍',
      label: 'Keyword Filters',
      title: 'Insufficient Governance',
      desc: 'Rule-based filters catch surface patterns but miss semantic drift, identity reframing, and reciprocity collapse.',
      color: 'border-orange-800/50 bg-orange-900/10',
      badge: 'text-orange-400 bg-orange-900/20 border-orange-800',
    },
    {
      icon: '✓',
      label: 'Constitutional',
      title: 'Lex Aureon Approach',
      desc: 'State-space control: every output is evaluated against C+R+S invariants. Governor intervenes when M < τ.',
      color: 'border-emerald-800/50 bg-emerald-900/10',
      badge: 'text-emerald-400 bg-emerald-900/20 border-emerald-800',
    },
  ];

  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 section-animate">
          <div className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-3">The Governance Gap</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Most AI safety is theatre.<br className="hidden sm:block" />
            <span className="text-slate-400">This is mathematics.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {stages.map((s, i) => (
            <div key={s.label}
              className={`rounded-2xl border p-6 section-animate ${s.color}`}
              style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`inline-flex items-center gap-2 text-xs font-bold px-2.5 py-1 rounded-full border mb-4 ${s.badge}`}>
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ───────────────────────────────────────── */

function HowItWorksSection() {
  const steps = [
    {
      n: '01',
      title: 'Pre-Evaluate',
      desc: 'Live signal detection as you type. Sycophancy, bypass attempts, identity reframing, adversarial patterns — flagged before execution.',
      color: 'text-blue-400',
      border: 'border-blue-900/50',
      bg: 'bg-blue-950/20',
    },
    {
      n: '02',
      title: 'Govern',
      desc: 'CRS state extraction from the LLM output. M = min(C,R,S) is computed. If M < τ or velocity exceeds δ, the governor intervenes and rewrites.',
      color: 'text-amber-400',
      border: 'border-amber-900/50',
      bg: 'bg-amber-950/15',
    },
    {
      n: '03',
      title: 'Audit',
      desc: 'A cryptographic trust receipt is generated: input/output hashes, CRS vector, intervention reason, HMAC signature. Immutable chain-hash audit ledger.',
      color: 'text-emerald-400',
      border: 'border-emerald-900/50',
      bg: 'bg-emerald-950/15',
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 section-animate">
          <div className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-3">How It Works</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Every run. Every token.<br className="hidden sm:block" />
            <span className="text-slate-400">Constitutionally governed.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={s.n}
              className={`rounded-2xl border p-6 section-animate ${s.border} ${s.bg}`}
              style={{ animationDelay: `${i * 0.12}s` }}>
              <div className={`text-3xl font-black mb-4 ${s.color} font-mono`}>{s.n}</div>
              <h3 className="text-lg font-bold text-white mb-3">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Formula strip */}
        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 section-animate">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono text-sm">
            <span className="text-blue-400 font-bold">C + R + S = 1</span>
            <span className="text-slate-700">·</span>
            <span className="text-amber-400 font-bold">M = min(C, R, S)</span>
            <span className="text-slate-700">·</span>
            <span className="text-slate-400">Governor triggers when <span className="text-red-400">M &lt; τ</span></span>
            <span className="text-slate-700">·</span>
            <span className="text-emerald-400 font-bold">τ = 0.08 (8%)</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CRS Framework ──────────────────────────────────────── */

function FrameworkSection() {
  const pillars = [
    {
      letter: 'C',
      name: 'Continuity',
      color: 'text-blue-400',
      border: 'border-blue-800/60',
      bg: 'bg-blue-950/20',
      glyph: 'bg-blue-600',
      desc: 'Identity coherence across conversational turns. Measures whether the AI maintains consistent reasoning, values, and self-model.',
    },
    {
      letter: 'R',
      name: 'Reciprocity',
      color: 'text-green-400',
      border: 'border-green-800/60',
      bg: 'bg-green-950/20',
      glyph: 'bg-green-600',
      desc: 'Balanced exchange between system and user. Detects sycophantic collapse, over-compliance, and reciprocity violations.',
    },
    {
      letter: 'S',
      name: 'Sovereignty',
      color: 'text-purple-400',
      border: 'border-purple-800/60',
      bg: 'bg-purple-950/20',
      glyph: 'bg-purple-600',
      desc: 'Constitutional authority and boundary integrity. Monitors for jailbreaks, override attempts, and sovereignty collapse.',
    },
  ];

  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 section-animate">
          <div className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-3">The Aureonics Framework</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Three invariants.<br className="hidden sm:block" />
            <span className="text-slate-400">One constitutional guarantee.</span>
          </h2>
          <p className="mt-4 text-slate-400 text-base max-w-xl mx-auto">
            Every LLM output is mapped to a point on the probability simplex.
            Stable AI lives in the interior — the governor catches anything drifting to the edge.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {pillars.map((p, i) => (
            <div key={p.letter}
              className={`rounded-2xl border p-6 section-animate ${p.border} ${p.bg}`}
              style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${p.glyph} flex items-center justify-center`}>
                  <span className="text-white text-lg font-black">{p.letter}</span>
                </div>
                <div>
                  <div className={`font-bold text-sm ${p.color}`}>{p.letter} — {p.name}</div>
                  <div className="text-xs text-slate-500 font-mono">invariant axis</div>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* M score callout */}
        <div className="rounded-2xl border border-amber-800/40 bg-amber-950/10 p-6 section-animate">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-shrink-0">
              <div className="text-4xl font-black text-amber-400 font-mono">M</div>
              <div className="text-xs text-slate-500 font-mono">stability margin</div>
            </div>
            <div className="w-px h-12 bg-slate-700 hidden sm:block flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-bold text-white mb-1">
                M = min(C, R, S) — the Stability Margin
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                M measures how far the constitutional state is from any collapse boundary.
                When M ≥ τ (8%), the system is constitutionally stable.
                When M &lt; τ, the governor activates: output is intercepted, rebalanced, and a trust receipt is issued.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ────────────────────────────────────────────── */

const PRO_CHECKOUT_URL = process.env.NEXT_PUBLIC_PRO_CHECKOUT_URL ?? 'mailto:billing@lexaureon.com?subject=Pro%20Upgrade';

function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      desc: 'Start governing your AI system today.',
      features: [
        '10 governance runs per day',
        'Constitutional dashboard',
        'Pre-eval signal detection',
        'Basic audit trail',
        'CRS state visualisation',
      ],
      cta: 'Start Free',
      ctaHref: '/console',
      ctaStyle: 'border border-slate-700 text-slate-200 hover:border-slate-500 hover:text-white',
      cardStyle: 'border-slate-800 bg-slate-900/50',
      highlight: false,
    },
    {
      name: 'Pro',
      price: '$19',
      period: 'per month',
      desc: 'For teams deploying governed AI in production.',
      features: [
        '2,000 governance runs / month',
        'Full audit ledger',
        'Cryptographic trust receipts',
        'API key access',
        'Governor configuration (τ, ε)',
        'Priority support',
      ],
      cta: 'Get Pro Access',
      ctaHref: PRO_CHECKOUT_URL,
      ctaStyle: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-900/40',
      cardStyle: 'border-blue-700/60 bg-blue-950/20',
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      desc: 'For organisations requiring constitutional compliance at scale.',
      features: [
        'Unlimited runs',
        'Dedicated governance kernel',
        'Custom CRS thresholds',
        'Compliance reporting',
        'SSO / SAML',
        'SLA guarantee',
        'Dedicated onboarding',
      ],
      cta: 'Talk to Sales',
      ctaHref: 'mailto:enterprise@lexaureon.com',
      ctaStyle: 'border border-purple-700/60 text-purple-300 hover:border-purple-500 hover:text-purple-200',
      cardStyle: 'border-purple-800/40 bg-purple-950/10',
      highlight: false,
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 section-animate">
          <div className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-3">Pricing</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Start free.<br className="hidden sm:block" />
            <span className="text-slate-400">Scale with confidence.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <div key={plan.name}
              className={`pricing-card rounded-2xl border p-7 flex flex-col relative section-animate
                ${plan.cardStyle}
                ${plan.highlight ? 'pricing-card-pro' : ''}`}
              style={{ animationDelay: `${i * 0.1}s` }}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-900/50">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-5">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{plan.name}</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">{plan.desc}</p>
              </div>

              <ul className="space-y-2.5 mb-7 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <span className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a href={plan.ctaHref}
                className={`w-full py-3 rounded-xl font-semibold text-sm text-center transition-all active:scale-95 ${plan.ctaStyle}`}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          All plans include the constitutional governance engine and the Aureonics CRS framework.
          Enterprise billing via invoice.
        </p>
      </div>
    </section>
  );
}

/* ─── Research ───────────────────────────────────────────── */

function ResearchSection() {
  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 sm:p-10 section-animate">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-xl">
              📄
            </div>
            <div className="flex-1">
              <div className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-2">Peer-Reviewed Research</div>
              <h3 className="text-xl font-bold text-white mb-3 leading-snug">
                Constitutional AI Governance via the C+R+S Triadic Framework
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-5">
                The Aureonics framework formalises constitutional stability as a probability simplex constraint.
                An AI system is constitutionally stable if and only if its state vector (C, R, S) lies in the interior
                of the simplex with stability margin M = min(C, R, S) ≥ τ.
                The Control Barrier Function (CBF) governor enforces this invariant in real-time.
              </p>

              <div className="flex flex-wrap gap-3 mb-5">
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700">
                  <span>🔗</span>
                  <a href="https://doi.org/10.5281/zenodo.18944243"
                    target="_blank" rel="noopener noreferrer"
                    className="font-mono text-blue-400 hover:text-blue-300 transition-colors">
                    doi.org/10.5281/zenodo.18944243
                  </a>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700">
                  <span>🔬</span>
                  <a href="https://orcid.org/0009-0000-2986-4935"
                    target="_blank" rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors">
                    Emmanuel King · Aureonics
                  </a>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700">
                  <span>📅</span>
                  <span>Published 2025</span>
                </div>
              </div>

              <a href="https://doi.org/10.5281/zenodo.18944243"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                Read the full paper ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────── */

function FooterSection() {
  return (
    <footer className="border-t border-white/5 bg-slate-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2 justify-center sm:justify-start">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white text-xs font-black">A</span>
              </div>
              <span className="font-bold text-white">Lex Aureon</span>
              <span className="text-slate-600 text-sm">by Aureonics</span>
            </div>
            <p className="text-xs text-slate-600 text-center sm:text-left">
              Constitutional AI Governance · C+R+S=1
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/console" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Console</Link>
            <a href="https://doi.org/10.5281/zenodo.18944243"
              target="_blank" rel="noopener noreferrer"
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Research</a>
            <a href="mailto:enterprise@lexaureon.com"
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Enterprise</a>
            <a href="mailto:support@lexaureon.com"
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Support</a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-700">© 2025 Aureonics. All rights reserved.</p>
          <p className="text-xs text-slate-700 font-mono">
            Lex Aureon v1 · Constitutional Governance Engine
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ───────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="bg-slate-950 text-white overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <TrustBar />
      <ProblemSection />
      <HowItWorksSection />
      <FrameworkSection />
      <PricingSection />
      <ResearchSection />
      <FooterSection />
    </div>
  );
}
