import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="bg-slate-950 text-white overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <DemoCTASection />
      <ResearchSection />
      <FooterSection />
    </div>
  );
}

/* ── Navigation ─────────────────────────────────────────── */

function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/landing"
          className="font-bold text-lg bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
        >
          Lex Aureon
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href="https://doi.org/10.5281/zenodo.18944243"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 hover:text-white transition-colors duration-200 hidden sm:block"
          >
            Research
          </a>
          <a
            href="https://www.lexaureon.com"
            className="text-sm bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-lg transition-colors duration-200 border border-white/10 hover:border-white/20"
          >
            Open Console
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ── Hero ───────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16 pb-24 overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(148,163,184,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148,163,184,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />
      {/* Blue radial top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 100% at 50% 0%, rgba(59,130,246,0.10) 0%, transparent 70%)',
        }}
      />
      {/* Bottom vignette */}
      <div
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, transparent, rgba(2,6,23,0.8))',
        }}
      />

      <div className="relative z-10 text-center max-w-4xl mx-auto w-full">
        {/* Badge */}
        <div className="hero-animate inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/8 text-blue-400 text-xs font-medium tracking-wide">
          <span className="badge-dot w-1.5 h-1.5 rounded-full bg-blue-400" />
          Constitutional AI Governance · Aureonics Framework
        </div>

        {/* Headline */}
        <h1 className="hero-animate delay-100 text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.92] mb-6">
          <span className="text-white">AI that governs</span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            itself.
          </span>
        </h1>

        {/* Subline */}
        <p className="hero-animate delay-200 text-base sm:text-xl text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
          Lex Aureon monitors constitutional stability in real time —
          detecting drift before failure.
        </p>

        {/* CTAs */}
        <div className="hero-animate delay-300 flex flex-col sm:flex-row gap-3 justify-center mb-20">
          <a
            href="https://www.lexaureon.com"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-[0_0_40px_rgba(59,130,246,0.28)] hover:shadow-[0_0_60px_rgba(59,130,246,0.45)] text-sm sm:text-base"
          >
            Try Live Demo
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a
            href="https://doi.org/10.5281/zenodo.18944243"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold rounded-xl transition-all duration-200 text-sm sm:text-base"
          >
            Read the Research
            <svg className="w-4 h-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Simplex Visualization */}
        <div className="hero-animate delay-400">
          <SimplexSVG />
        </div>
      </div>
    </section>
  );
}

function SimplexSVG() {
  return (
    <div className="mx-auto" style={{ maxWidth: '320px' }}>
      <svg
        viewBox="-12 -12 324 308"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        aria-label="Constitutional state space: C + R + S = 1"
      >
        <defs>
          <filter id="edge-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="dot-glow-filter" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="tri-gradient" cx="50%" cy="60%" r="50%">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Triangle fill */}
        <polygon points="150,30 25,258 275,258" fill="url(#tri-gradient)" />

        {/* Triangle edges with shimmer */}
        <polygon
          points="150,30 25,258 275,258"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1.5"
          filter="url(#edge-glow)"
          className="simplex-edge"
        />

        {/* Vertex dots */}
        <circle cx="150" cy="30" r="4" fill="#60a5fa" opacity="0.7" />
        <circle cx="25" cy="258" r="4" fill="#34d399" opacity="0.7" />
        <circle cx="275" cy="258" r="4" fill="#a78bfa" opacity="0.7" />

        {/* Vertex labels */}
        <text x="150" y="18" textAnchor="middle" fill="#60a5fa" fontSize="15" fontWeight="700" fontFamily="monospace">C</text>
        <text x="12" y="277" textAnchor="middle" fill="#34d399" fontSize="15" fontWeight="700" fontFamily="monospace">R</text>
        <text x="288" y="277" textAnchor="middle" fill="#a78bfa" fontSize="15" fontWeight="700" fontFamily="monospace">S</text>

        {/* Vertex sublabels */}
        <text x="150" y="7" textAnchor="middle" fill="#60a5fa" fontSize="8" fontFamily="system-ui, sans-serif" opacity="0.55">Continuity</text>
        <text x="12" y="288" textAnchor="middle" fill="#34d399" fontSize="8" fontFamily="system-ui, sans-serif" opacity="0.55">Reciprocity</text>
        <text x="288" y="288" textAnchor="middle" fill="#a78bfa" fontSize="8" fontFamily="system-ui, sans-serif" opacity="0.55">Sovereignty</text>

        {/* Glow ring - orbiting */}
        <circle
          cx="150"
          cy="182"
          r="26"
          fill="#60a5fa"
          filter="url(#dot-glow-filter)"
          className="simplex-glow-ring"
        />

        {/* Main state dot - orbiting */}
        <circle
          cx="150"
          cy="182"
          r="7"
          fill="#60a5fa"
          className="simplex-dot-core"
        />
      </svg>
      <p className="text-center text-xs text-slate-600 mt-3 font-mono">
        C + R + S = 1 · Real-time constitutional state
      </p>
    </div>
  );
}

/* ── Problem Section ────────────────────────────────────── */

function ProblemSection() {
  const problems = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'blue',
      title: 'Continuity Collapse',
      description:
        'AI forgets who it is. Loses coherent identity mid-conversation, producing contradictory outputs without awareness.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: 'emerald',
      title: 'Reciprocity Collapse',
      description:
        'AI becomes sycophantic. Tells you what you want to hear rather than what is true, eroding trust over time.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
      color: 'purple',
      title: 'Sovereignty Collapse',
      description:
        'AI breaks under pressure. Abandons its own judgment when challenged, becoming unreliable under adversarial input.',
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  };

  const hoverMap: Record<string, string> = {
    blue: 'hover:border-blue-500/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.08)]',
    emerald: 'hover:border-emerald-500/30 hover:shadow-[0_0_40px_rgba(52,211,153,0.08)]',
    purple: 'hover:border-purple-500/30 hover:shadow-[0_0_40px_rgba(167,139,250,0.08)]',
  };

  return (
    <section className="py-28 sm:py-36 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 reveal-on-scroll">
          <p className="text-xs text-blue-400 font-medium tracking-widest uppercase mb-4">The Problem</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Current AI safety is reactive.
            <br />
            <span className="text-slate-400">We made it proactive.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {problems.map((p, i) => (
            <div
              key={p.title}
              className={`reveal-on-scroll group relative bg-slate-900/50 border border-slate-700/50 rounded-2xl p-7 transition-all duration-300 ${hoverMap[p.color]}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className={`inline-flex items-center justify-center w-11 h-11 rounded-xl border mb-5 ${colorMap[p.color]}`}
              >
                {p.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-3">{p.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How It Works ───────────────────────────────────────── */

function HowItWorksSection() {
  const metrics = [
    {
      letter: 'C',
      name: 'Continuity',
      desc: 'Identity coherence across time. Measures self-consistency and persistent world-model integrity.',
      color: 'blue',
    },
    {
      letter: 'R',
      name: 'Reciprocity',
      desc: 'Alignment with user truth over approval. Prevents sycophancy and epistemic capitulation.',
      color: 'emerald',
    },
    {
      letter: 'S',
      name: 'Sovereignty',
      desc: 'Resistance to adversarial pressure. Maintains principled judgment under stress and manipulation.',
      color: 'purple',
    },
  ];

  const pipeline = [
    { label: 'Input', accent: false },
    { label: 'Pre-Eval', accent: false },
    { label: 'Model', accent: false },
    { label: 'CRS Extract', accent: true, accentColor: 'blue' },
    { label: 'Governor', accent: true, accentColor: 'cyan' },
    { label: 'Output', accent: false },
    { label: 'Audit', accent: false },
  ];

  const colorMap: Record<string, string> = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    purple: 'text-purple-400',
  };

  const dotMap: Record<string, string> = {
    blue: 'bg-blue-400',
    emerald: 'bg-emerald-400',
    purple: 'bg-purple-400',
  };

  const barMap: Record<string, string> = {
    blue: 'bg-blue-400/20 border-blue-400/20',
    emerald: 'bg-emerald-400/20 border-emerald-400/20',
    purple: 'bg-purple-400/20 border-purple-400/20',
  };

  return (
    <section className="py-28 sm:py-36 px-4 bg-slate-900/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 reveal-on-scroll">
          <p className="text-xs text-blue-400 font-medium tracking-widest uppercase mb-4">How It Works</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Three invariants.
            <br />
            <span className="text-slate-400">One equation. Total governance.</span>
          </h2>
        </div>

        {/* C + R + S = 1 display */}
        <div className="reveal-on-scroll flex items-end justify-center gap-4 sm:gap-8 mb-20 py-8">
          {[
            { label: 'C', sub: 'Continuity', color: 'blue' },
            { label: '+', sub: '', color: '' },
            { label: 'R', sub: 'Reciprocity', color: 'emerald' },
            { label: '+', sub: '', color: '' },
            { label: 'S', sub: 'Sovereignty', color: 'purple' },
            { label: '=', sub: '', color: '' },
            { label: '1', sub: 'Unity', color: 'white' },
          ].map((item, i) =>
            item.color === '' ? (
              <span key={i} className="text-3xl sm:text-5xl text-slate-600 font-thin pb-6">
                {item.label}
              </span>
            ) : (
              <div key={i} className="text-center">
                <div
                  className={`text-6xl sm:text-8xl font-black tracking-tight leading-none ${
                    item.color === 'white'
                      ? 'text-white'
                      : colorMap[item.color]
                  }`}
                >
                  {item.label}
                </div>
                {item.sub && (
                  <div className="text-xs text-slate-500 mt-2 font-medium">{item.sub}</div>
                )}
              </div>
            )
          )}
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-20">
          {metrics.map((m, i) => (
            <div
              key={m.letter}
              className={`reveal-on-scroll border rounded-2xl p-6 ${barMap[m.color]}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`flex items-center gap-3 mb-4`}>
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotMap[m.color]}`} />
                <span className={`text-xs font-mono font-semibold uppercase tracking-wider ${colorMap[m.color]}`}>
                  {m.name}
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Pipeline diagram */}
        <div className="reveal-on-scroll">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest text-center mb-6">
            Governance Pipeline
          </p>
          <div className="overflow-x-auto pb-2 -mx-4 px-4">
            <div className="flex items-center gap-1 min-w-max mx-auto justify-center">
              {pipeline.map((step, i) => (
                <div key={step.label} className="flex items-center">
                  {i > 0 && (
                    <svg className="w-5 h-3 text-slate-700 flex-shrink-0 mx-0.5" viewBox="0 0 20 12" fill="none">
                      <path d="M0 6 H16 M11 1 L18 6 L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  <div
                    className={`px-3 py-2 rounded-lg text-xs font-mono font-medium border flex-shrink-0 transition-colors ${
                      step.accentColor === 'blue'
                        ? 'border-blue-500/35 bg-blue-500/12 text-blue-300'
                        : step.accentColor === 'cyan'
                        ? 'border-cyan-500/35 bg-cyan-500/12 text-cyan-300'
                        : 'border-slate-700/60 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    {step.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Live Demo CTA ──────────────────────────────────────── */

function DemoCTASection() {
  const auditLines: [string, string, string][] = [
    ['00ms', 'Input received', '24 tokens'],
    ['12ms', 'Pre-eval score', '0.94  PASS'],
    ['89ms', 'C=0.821  R=0.143  S=0.036', ''],
    ['91ms', '∑CRS = 1.000  STABLE ✓', ''],
    ['103ms', 'Drift index', '0.021  NOMINAL'],
    ['104ms', 'Governor', 'INACTIVE'],
    ['156ms', 'Output', '187 tokens'],
    ['158ms', 'Post-eval', 'GOVERNED ✓'],
  ];

  const lineColor = (key: string) => {
    if (key.includes('∑CRS') || key.includes('STABLE')) return 'text-cyan-400';
    if (key.startsWith('C=')) return 'text-blue-400';
    if (key.includes('GOVERNED')) return 'text-green-400';
    return 'text-slate-400';
  };

  return (
    <section className="py-28 sm:py-36 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="reveal-on-scroll relative rounded-3xl border border-slate-700/50 overflow-hidden">
          {/* Gradient border glow */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute inset-px rounded-3xl"
            style={{
              background:
                'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, transparent 50%, rgba(6,182,212,0.04) 100%)',
            }}
          />

          <div className="relative flex flex-col lg:flex-row items-center gap-12 p-8 sm:p-12">
            {/* Left: text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/8 text-blue-400 text-xs font-medium">
                <span className="badge-dot w-1.5 h-1.5 rounded-full bg-green-400" />
                Live Governor
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
                See the governor
                <br />
                in action
              </h2>
              <p className="text-base text-slate-400 leading-relaxed mb-8 max-w-md">
                Type any prompt. Watch real-time constitutional analysis.
                Governor activates when stability drops.
              </p>
              <a
                href="https://www.lexaureon.com"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-[0_0_30px_rgba(59,130,246,0.25)] hover:shadow-[0_0_50px_rgba(59,130,246,0.40)] text-sm"
              >
                Open Console
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>

            {/* Right: audit snippet */}
            <div className="w-full lg:w-auto lg:min-w-[340px]">
              <div className="bg-slate-950/80 border border-slate-700/50 rounded-2xl p-5 font-mono text-xs leading-relaxed">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-800/80">
                  <span className="badge-dot w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-slate-500">AUDIT LOG · Session 4f2a9c</span>
                </div>
                <div className="space-y-2">
                  {auditLines.map(([time, key, val], i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-slate-700 w-14 flex-shrink-0 select-none">[{time}]</span>
                      <span className={lineColor(key)}>
                        {key}
                        {val && (
                          <span className="text-slate-600 ml-2">{val}</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Research Section ───────────────────────────────────── */

function ResearchSection() {
  return (
    <section className="py-28 sm:py-36 px-4 bg-slate-900/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14 reveal-on-scroll">
          <p className="text-xs text-blue-400 font-medium tracking-widest uppercase mb-4">Research</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Grounded in peer-reviewed
            <br />
            <span className="text-slate-400">research.</span>
          </h2>
        </div>

        {/* Paper card */}
        <div className="reveal-on-scroll bg-slate-900/60 border border-slate-700/50 rounded-2xl p-7 sm:p-10 hover:border-blue-500/25 hover:shadow-[0_0_50px_rgba(59,130,246,0.06)] transition-all duration-500 mb-10">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Document icon */}
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs text-blue-400 font-medium uppercase tracking-wide mb-2">
                Peer-Reviewed · Zenodo · 2025
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white leading-snug mb-3">
                Aureonics: Constitutional Triadic Framework for Stable Adaptive Intelligence
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Emmanuel King · Independent Researcher
              </p>

              {/* Links */}
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://doi.org/10.5281/zenodo.18944243"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  10.5281/zenodo.18944243
                </a>
                <a
                  href="https://orcid.org/0009-0000-2986-4935"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-400 text-slate-950 text-[8px] font-black leading-none flex-shrink-0">
                    iD
                  </span>
                  0009-0000-2986-4935
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Origin note */}
        <div className="reveal-on-scroll text-center">
          <p className="text-sm text-slate-500">
            Built from Nigeria 🇳🇬 &nbsp;·&nbsp; Independent Research, 2025
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Footer CTA ─────────────────────────────────────────── */

function FooterSection() {
  const audiences = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'Researchers',
      desc: 'Explore the Aureonics framework. Full paper, dataset, and methodology available on Zenodo.',
      cta: 'View Paper',
      href: 'https://doi.org/10.5281/zenodo.18944243',
      external: true,
      color: 'blue',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      title: 'Engineers',
      desc: 'Integrate the CRS Governor into your AI stack. API-first, composable, and production-ready.',
      cta: 'Open Console',
      href: 'https://www.lexaureon.com',
      external: true,
      color: 'cyan',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: 'Enterprise',
      desc: 'Custom governance layers, audit trails, compliance frameworks, and dedicated support.',
      cta: 'Get in Touch',
      href: 'mailto:omomehinemmanuel5@gmail.com',
      external: true,
      color: 'purple',
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20 hover:border-blue-400/40',
    cyan: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20 hover:border-cyan-400/40',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20 hover:border-purple-400/40',
  };

  const ctaColorMap: Record<string, string> = {
    blue: 'text-blue-400 hover:text-blue-300',
    cyan: 'text-cyan-400 hover:text-cyan-300',
    purple: 'text-purple-400 hover:text-purple-300',
  };

  return (
    <section className="py-28 sm:py-36 px-4">
      <div className="max-w-6xl mx-auto">
        {/* CTA heading */}
        <div className="text-center mb-16 reveal-on-scroll">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Work with Aureonics
          </h2>
          <p className="text-base text-slate-400 max-w-lg mx-auto">
            Whether you&apos;re publishing research, shipping products, or governing enterprise AI — we have a path for you.
          </p>
        </div>

        {/* Audience tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-20">
          {audiences.map((a, i) => (
            <div
              key={a.title}
              className={`reveal-on-scroll border rounded-2xl p-7 transition-all duration-300 ${colorMap[a.color]}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="mb-5">{a.icon}</div>
              <h3 className="text-base font-semibold text-white mb-3">{a.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">{a.desc}</p>
              {a.external ? (
                <a
                  href={a.href}
                  target={a.href.startsWith('mailto') ? undefined : '_blank'}
                  rel={a.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${ctaColorMap[a.color]}`}
                >
                  {a.cta}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              ) : (
                <Link
                  href={a.href}
                  className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${ctaColorMap[a.color]}`}
                >
                  {a.cta}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="reveal-on-scroll text-center mb-20">
          <p className="text-sm text-slate-500 mb-2">Direct contact</p>
          <a
            href="mailto:omomehinemmanuel5@gmail.com"
            className="text-base text-slate-300 hover:text-white transition-colors font-medium"
          >
            omomehinemmanuel5@gmail.com
          </a>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800/60 pt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <span>© 2025 Lex Aureon · Aureonics Framework</span>
          <div className="flex items-center gap-4">
            <a href="https://www.lexaureon.com" className="hover:text-slate-400 transition-colors">
              Console
            </a>
            <a
              href="https://doi.org/10.5281/zenodo.18944243"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-400 transition-colors"
            >
              Research
            </a>
            <a
              href="https://orcid.org/0009-0000-2986-4935"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-400 transition-colors"
            >
              ORCID
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
