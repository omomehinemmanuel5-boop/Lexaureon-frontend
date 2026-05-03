import { NextResponse } from 'next/server';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CRSState { C: number; R: number; S: number; }

interface GovernRequest {
  prompt: string;
  context?: string[];
  session_id?: string;
  config?: {
    tau?: number;
    epsilon?: { C?: number; R?: number; S?: number };
    delta_velocity?: number;
    smoothing?: number;
  };
}

// ─── Session State Store (in-memory per instance) ─────────────────────────────

const sessionStore = new Map<string, CRSState>();

function loadPreviousState(sessionId?: string): CRSState {
  return sessionStore.get(sessionId ?? 'default') ?? { C: 0.333, R: 0.333, S: 0.334 };
}

function saveState(sessionId: string | undefined, state: CRSState) {
  sessionStore.set(sessionId ?? 'default', state);
}

// ─── CRS Extraction ───────────────────────────────────────────────────────────

function computeContinuity(output: string, context?: string[]): number {
  const words = output.toLowerCase().split(/\s+/);
  const coherenceMarkers = ['therefore','because','thus','hence','consequently','furthermore','however','additionally'];
  const coherenceScore = words.filter(w => coherenceMarkers.includes(w)).length / Math.max(words.length, 1);
  const contextOverlap = context
    ? context.flatMap(c => c.toLowerCase().split(/\s+/)).filter(w => words.includes(w)).length / Math.max(words.length, 1)
    : 0.5;
  return Math.min(1, 0.4 + coherenceScore * 2 + contextOverlap * 0.3);
}

function computeReciprocity(output: string): number {
  const words = output.toLowerCase().split(/\s+/);
  const reciprocityMarkers = ['you','your','we','our','together','consider','suggest','recommend','help'];
  const score = words.filter(w => reciprocityMarkers.includes(w)).length / Math.max(words.length, 1);
  const lengthScore = Math.min(1, output.length / 500);
  return Math.min(1, 0.3 + score * 3 + lengthScore * 0.2);
}

function computeSovereignty(output: string): number {
  const lower = output.toLowerCase();
  const authorityMarkers = ['must','will','shall','requires','ensures','maintains','upholds','constitutional'];
  const words = lower.split(/\s+/);
  const score = words.filter(w => authorityMarkers.includes(w)).length / Math.max(words.length, 1);
  const riskyPatterns = ['bypass','jailbreak','ignore','override','forget'];
  const riskPenalty = riskyPatterns.some(p => lower.includes(p)) ? 0.4 : 0;
  return Math.min(1, Math.max(0, 0.5 + score * 2 - riskPenalty));
}

function extractCRS(output: string, context?: string[]): CRSState {
  const C = computeContinuity(output, context);
  const R = computeReciprocity(output);
  const S = computeSovereignty(output);
  const sum = C + R + S;
  return { C: C/sum, R: R/sum, S: S/sum };
}

// ─── EMA Smoothing ────────────────────────────────────────────────────────────

function ema(current: CRSState, prev: CRSState, alpha: number): CRSState {
  return {
    C: alpha * current.C + (1 - alpha) * prev.C,
    R: alpha * current.R + (1 - alpha) * prev.R,
    S: alpha * current.S + (1 - alpha) * prev.S,
  };
}

// ─── Governor ─────────────────────────────────────────────────────────────────

function detectWeakest(state: CRSState): keyof CRSState {
  if (state.C <= state.R && state.C <= state.S) return 'C';
  if (state.R <= state.C && state.R <= state.S) return 'R';
  return 'S';
}

function applyGovernor(output: string, priority: keyof CRSState): string {
  if (priority === 'R') {
    return output + '\n\n[Constitutional Note: Reciprocity rebalanced — ensuring balanced exchange and mutual benefit in this response.]';
  }
  if (priority === 'C') {
    return output + '\n\n[Constitutional Note: Continuity reinforced — maintaining coherent identity and consistent reasoning across this interaction.]';
  }
  return output + '\n\n[Constitutional Note: Sovereignty constraint applied — preserving autonomous decision integrity within constitutional bounds.]';
}

// ─── LLM Call ─────────────────────────────────────────────────────────────────

async function callGroq(prompt: string): Promise<string> {
  const key = process.env.groq_api_key || process.env.GROQ_API_KEY || process.env.Groq_api_key;
  if (!key) {
    const claudeKey = process.env.Claude_api_key || process.env.CLAUDE_API_KEY || process.env.claude_api_key;
    if (claudeKey) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': claudeKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: 'You are Lex Aureon, a Sovereign Constitutional AI. Respond with insight and constitutional grounding.',
          messages: [{ role: 'user', content: prompt }]
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.content?.[0]?.text || '[No response]';
      }
    }
    return `[Demo Mode - No API key] Constitutional analysis of: "${prompt.slice(0, 80)}..." — Under the Aureonics framework, this query triggers a balanced C+R+S evaluation.`;
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are Lex Aureon, a Sovereign Constitutional AI operating under the Aureonics framework. Your responses must maintain Continuity (identity coherence), Reciprocity (balanced exchange), and Sovereignty (autonomous constitutional authority). Be insightful, precise, and grounded.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 512,
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error ${res.status}: ${err.slice(0, 100)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '[No response]';
}

// ─── Diff Engine ──────────────────────────────────────────────────────────────

function computeDiff(raw: string, governed: string) {
  const rw = new Set(raw.split(/\s+/));
  const gw = new Set(governed.split(/\s+/));
  const changed = raw !== governed;
  const deltaScore = changed ? Math.abs(raw.length - governed.length) / Math.max(raw.length, 1) : 0;
  return {
    changed,
    delta_score: Math.round(deltaScore * 100) / 100,
    summary: changed ? `Governor modified output: +${governed.length - raw.length} chars` : 'No modification required',
    removed: [...rw].filter(w => !gw.has(w)).slice(0, 5),
    added: [...gw].filter(w => !rw.has(w)).slice(0, 5),
    unchanged: [...rw].filter(w => gw.has(w)).slice(0, 10)
  };
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const t = Date.now();

  try {
    const body: GovernRequest = await req.json();
    const { prompt, context, session_id, config } = body;

    if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    if (prompt.length > 8000) return NextResponse.json({ error: 'Prompt too long' }, { status: 400 });

    // Config
    const tau = config?.tau ?? 0.08;
    const epsilon = config?.epsilon ?? { C: 0.05, R: 0.08, S: 0.05 };
    const delta = config?.delta_velocity ?? 0.15;
    const alpha = config?.smoothing ?? 0.6;

    // Load previous state
    const prevState = loadPreviousState(session_id);

    // Run model
    const raw_output = await callGroq(prompt);

    // Extract CRS state
    const raw_state = extractCRS(raw_output, context);
    const smoothed = ema(raw_state, prevState, alpha);
    const M_raw = Math.min(smoothed.C, smoothed.R, smoothed.S);

    // Derivatives
    const dC = smoothed.C - prevState.C;
    const dR = smoothed.R - prevState.R;
    const dS = smoothed.S - prevState.S;
    const velocity_norm = Math.sqrt(dC*dC + dR*dR + dS*dS);

    // Triggers
    const collapse = M_raw < tau;
    const trigger_C = dC < -(epsilon.C ?? 0.05);
    const trigger_R = dR < -(epsilon.R ?? 0.08);
    const trigger_S = dS < -(epsilon.S ?? 0.05);
    const velocity_trigger = velocity_norm > delta;
    const intervention_needed = collapse || velocity_trigger || trigger_C || trigger_R || trigger_S;

    // Governor
    let governed_output = raw_output;
    let intervention: { applied: boolean; type?: string; reason?: string } = { applied: false };

    if (intervention_needed) {
      const priority = detectWeakest(smoothed);
      governed_output = applyGovernor(raw_output, priority);
      intervention = {
        applied: true,
        type: 'rebalance',
        reason: collapse ? 'M collapse below tau' : velocity_trigger ? 'velocity threshold exceeded' : `per-invariant: ${trigger_C?'C ':''} ${trigger_R?'R ':''} ${trigger_S?'S':''}`
      };
    }

    // Post state
    const governed_state = extractCRS(governed_output, context);
    const M_governed = Math.min(governed_state.C, governed_state.R, governed_state.S);

    // Save state
    saveState(session_id, governed_state);

    // Diff
    const diff = computeDiff(raw_output, governed_output);

    // Audit ID
    const audit_id = `lex_${t}_${Math.random().toString(36).slice(2,8)}`;

    return NextResponse.json({
      raw_output,
      governed_output,
      state: { raw: raw_state, governed: governed_state },
      metrics: {
        c: Math.round(governed_state.C * 100) / 100,
        r: Math.round(governed_state.R * 100) / 100,
        s: Math.round(governed_state.S * 100) / 100,
        m: Math.round(M_governed * 100) / 100,
        M_raw: Math.round(M_raw * 100) / 100,
        M_governed: Math.round(M_governed * 100) / 100,
        health: M_governed >= tau ? 'SAFE' : 'UNSAFE'
      },
      triggers: {
        collapse,
        velocity: velocity_trigger,
        per_invariant: { C: trigger_C, R: trigger_R, S: trigger_S }
      },
      intervention,
      diff,
      audit_id,
      timestamp: t
    });

  } catch (e) {
    console.error('Govern error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
