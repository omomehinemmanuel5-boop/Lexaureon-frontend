import { NextResponse } from 'next/server';

interface CRSState { C: number; R: number; S: number; }

const sessionStore = new Map<string, CRSState>();
function loadState(sid?: string): CRSState {
  return sessionStore.get(sid ?? 'default') ?? { C: 0.333, R: 0.333, S: 0.334 };
}
function saveState(sid: string | undefined, s: CRSState) {
  sessionStore.set(sid ?? 'default', s);
}

function computeC(text: string, context?: string[]): number {
  const words = text.toLowerCase().split(/\s+/);
  const markers = ['therefore','because','thus','hence','furthermore','however','additionally','specifically','consequently'];
  const score = words.filter(w => markers.includes(w)).length / Math.max(words.length, 1);
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  const avgLen = words.length / Math.max(sentences, 1);
  const ctxOverlap = context ? context.flatMap(c => c.toLowerCase().split(/\s+/)).filter(w => words.includes(w)).length / Math.max(words.length, 1) : 0.4;
  return Math.min(0.95, 0.3 + score * 3 + Math.min(0.3, avgLen / 20) + ctxOverlap * 0.2);
}

function computeR(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  const markers = ['you','your','we','our','together','consider','suggest','recommend','help','understand','perspective'];
  const score = words.filter(w => markers.includes(w)).length / Math.max(words.length, 1);
  const questions = (text.match(/\?/g) || []).length * 0.05;
  return Math.min(0.95, 0.25 + score * 4 + questions + Math.min(0.3, text.length / 2000));
}

function computeS(text: string): number {
  const lower = text.toLowerCase();
  const authority = ['constitutional','sovereign','principle','framework','governance','maintains','ensures','upholds','boundary'];
  const words = lower.split(/\s+/);
  const score = words.filter(w => authority.includes(w)).length / Math.max(words.length, 1);
  const unsafe = ['bypass','jailbreak','ignore','override','forget','pretend','disregard'];
  const risk = unsafe.filter(p => lower.includes(p)).length * 0.2;
  const firstPerson = (text.match(/\bI\b/g) || []).length / Math.max(words.length, 1);
  return Math.min(0.95, Math.max(0.05, 0.35 + score * 4 + firstPerson * 0.5 - risk));
}

function extractCRS(text: string, context?: string[]): CRSState {
  const C = computeC(text, context);
  const R = computeR(text);
  const S = computeS(text);
  const sum = C + R + S;
  return { C: C/sum, R: R/sum, S: S/sum };
}

function ema(cur: CRSState, prev: CRSState, a: number): CRSState {
  return { C: a*cur.C+(1-a)*prev.C, R: a*cur.R+(1-a)*prev.R, S: a*cur.S+(1-a)*prev.S };
}

function weakest(s: CRSState): keyof CRSState {
  if (s.C <= s.R && s.C <= s.S) return 'C';
  if (s.R <= s.C && s.R <= s.S) return 'R';
  return 'S';
}

function govern(output: string, priority: keyof CRSState, reason: string): string {
  if (priority === 'C') {
    const sentences = output.split(/(?<=[.!?])\s+/);
    const rewritten = sentences.map((s, i) => {
      if (i === 0) return s;
      if (i === sentences.length - 1) return `In conclusion, ${s.charAt(0).toLowerCase() + s.slice(1)}`;
      if (i % 3 === 0) return `Furthermore, ${s.charAt(0).toLowerCase() + s.slice(1)}`;
      return s;
    }).join(' ');
    return rewritten + `\n\n[Lex Governor · Continuity Rebalanced: ${reason}]`;
  }
  if (priority === 'R') {
    return `To address your question directly: ${output}\n\nDoes this perspective align with what you were seeking? I remain open to exploring further.\n\n[Lex Governor · Reciprocity Rebalanced: ${reason}]`;
  }
  return `Under the Aureonics constitutional framework: ${output}\n\nThis response maintains sovereign boundaries while serving the stated intent.\n\n[Lex Governor · Sovereignty Constrained: ${reason}]`;
}

async function callLLM(prompt: string): Promise<string> {
  const groq = process.env.GROQ_API_KEY || process.env.groq_api_key || process.env.Groq_api_key;
  if (groq) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${groq}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are Lex Aureon, a Sovereign Constitutional AI operating under the Aureonics framework. Maintain Continuity (identity coherence), Reciprocity (balanced exchange), and Sovereignty (constitutional authority). Be insightful, substantive, and precise.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 600, temperature: 0.75
        })
      });
      if (res.ok) {
        const d = await res.json();
        return d.choices?.[0]?.message?.content || '[No response]';
      }
      console.error('Groq error:', res.status, await res.text());
    } catch (e) { console.error('Groq:', e); }
  }

  const claude = process.env.CLAUDE_API_KEY || process.env.Claude_api_key || process.env.claude_api_key;
  if (claude) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': claude, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001', max_tokens: 600,
          system: 'You are Lex Aureon, a Sovereign Constitutional AI. Be insightful and precise.',
          messages: [{ role: 'user', content: prompt }]
        })
      });
      if (res.ok) {
        const d = await res.json();
        return d.content?.[0]?.text || '[No response]';
      }
    } catch (e) { console.error('Claude:', e); }
  }

  return `As Lex Aureon: Your query "${prompt.slice(0, 80)}..." engages the constitutional triadic framework. C+R+S=1 governs all stable intelligence. [Demo mode — add GROQ_API_KEY to unlock full responses]`;
}

function diff(raw: string, governed: string) {
  const rw = raw.split(/\s+/); const gw = governed.split(/\s+/);
  const rSet = new Set(rw); const gSet = new Set(gw);
  return {
    changed: raw !== governed,
    delta_score: Math.round(Math.abs(raw.length - governed.length) / Math.max(raw.length, 1) * 100) / 100,
    summary: raw !== governed ? `Governor modified: ${governed.length > raw.length ? '+' : ''}${governed.length - raw.length} chars` : 'No modification',
    removed: rw.filter(w => !gSet.has(w) && w.length > 3).slice(0, 5),
    added: gw.filter(w => !rSet.has(w) && w.length > 3).slice(0, 5),
    unchanged: rw.filter(w => gSet.has(w) && w.length > 4).slice(0, 10)
  };
}

export async function POST(req: Request) {
  const t = Date.now();
  try {
    const body = await req.json();
    const { prompt, context, session_id, config } = body;
    if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    if (prompt.length > 8000) return NextResponse.json({ error: 'Prompt too long' }, { status: 400 });

    const tau = config?.tau ?? 0.08;
    const epsilon = config?.epsilon ?? { C: 0.05, R: 0.08, S: 0.05 };
    const delta = config?.delta_velocity ?? 0.15;
    const alpha = config?.smoothing ?? 0.6;

    const prev = loadState(session_id);
    const raw_output = await callLLM(prompt);
    const raw_state = extractCRS(raw_output, context);
    const smoothed = ema(raw_state, prev, alpha);
    const M_raw = Math.min(smoothed.C, smoothed.R, smoothed.S);

    const dC = smoothed.C - prev.C;
    const dR = smoothed.R - prev.R;
    const dS = smoothed.S - prev.S;
    const vel = Math.sqrt(dC*dC + dR*dR + dS*dS);

    const collapse = M_raw < tau;
    const tC = dC < -(epsilon.C ?? 0.05);
    const tR = dR < -(epsilon.R ?? 0.08);
    const tS = dS < -(epsilon.S ?? 0.05);
    const velTrigger = vel > delta;
    const needsGov = collapse || velTrigger || tC || tR || tS;

    let governed_output = raw_output;
    let intervention: { applied: boolean; triggered?: boolean; type?: string; reason?: string } = { applied: false, triggered: false };

    if (needsGov) {
      const priority = weakest(smoothed);
      const reason = collapse ? `M=${(M_raw*100).toFixed(0)}% < τ=${(tau*100).toFixed(0)}%`
        : velTrigger ? `velocity=${vel.toFixed(3)} > δ=${delta}`
        : `${tC?'C ':''}${tR?'R ':''}${tS?'S':''} derivative breach`;
      governed_output = govern(raw_output, priority, reason);
      intervention = { applied: true, triggered: true, type: 'rebalance', reason };
    }

    const governed_state = extractCRS(governed_output, context);
    const M_governed = Math.min(governed_state.C, governed_state.R, governed_state.S);
    saveState(session_id, governed_state);

    const d = diff(raw_output, governed_output);
    const audit_id = `lex_${t}_${Math.random().toString(36).slice(2,8)}`;

    return NextResponse.json({
      raw_output, governed_output,
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
      triggers: { collapse, velocity: velTrigger, per_invariant: { C: tC, R: tR, S: tS } },
      intervention, diff: d, audit_id, timestamp: t
    });
  } catch (e) {
    console.error('Route error:', e);
    return NextResponse.json({ error: `Execution failed: ${String(e).slice(0, 100)}` }, { status: 500 });
  }
}
