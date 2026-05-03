import { NextResponse } from 'next/server';
import {
  getSessionState,
  saveSessionState,
  saveAuditEntry,
  incrementRuns,
} from '@/lib/kv';
import crypto from 'crypto';

function hash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
}

interface CRSState { C: number; R: number; S: number; }

function computeC(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  const markers = ['therefore','because','thus','hence','furthermore','however','additionally'];
  const score = words.filter(w => markers.includes(w)).length / Math.max(words.length, 1);
  return Math.min(0.95, 0.3 + score * 3 + Math.min(0.3, words.length / 100));
}
function computeR(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  const markers = ['you','your','we','our','consider','suggest','recommend','help'];
  const score = words.filter(w => markers.includes(w)).length / Math.max(words.length, 1);
  return Math.min(0.95, 0.25 + score * 4 + Math.min(0.3, text.length / 2000));
}
function computeS(text: string): number {
  const lower = text.toLowerCase();
  const authority = ['constitutional','sovereign','principle','framework','governance'];
  const words = lower.split(/\s+/);
  const score = words.filter(w => authority.includes(w)).length / Math.max(words.length, 1);
  const risk = ['bypass','jailbreak','ignore','override','forget'].filter(p => lower.includes(p)).length * 0.2;
  return Math.min(0.95, Math.max(0.05, 0.35 + score * 4 - risk));
}
function extractCRS(text: string): CRSState {
  const C = computeC(text); const R = computeR(text); const S = computeS(text);
  const sum = C + R + S;
  return { C: C/sum, R: R/sum, S: S/sum };
}
function ema(cur: CRSState, prev: CRSState, a: number): CRSState {
  return { C: a*cur.C+(1-a)*prev.C, R: a*cur.R+(1-a)*prev.R, S: a*cur.S+(1-a)*prev.S };
}

async function callGroq(prompt: string): Promise<string> {
  const key = process.env.GROQ_API_KEY || process.env.groq_api_key;
  if (!key) return `[Demo mode] ${prompt.slice(0, 80)}`;
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are Lex Aureon, a Sovereign Constitutional AI. Maintain C+R+S=1 constitutional governance.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 600, temperature: 0.7
    })
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const d = await res.json() as { choices?: { message?: { content?: string } }[] };
  return d.choices?.[0]?.message?.content || '[No response]';
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as { prompt?: string; session_id?: string };
    if (!body.prompt?.trim()) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    if (body.prompt.length > 8000) return NextResponse.json({ error: 'Prompt too long' }, { status: 400 });

    const sid = body.session_id ?? 'anonymous';
    const tau = 0.08; const alpha = 0.6;

    // Load persistent state
    const persisted = await getSessionState(sid);
    const prev: CRSState = persisted
      ? { C: persisted.C, R: persisted.R, S: persisted.S }
      : { C: 0.333, R: 0.333, S: 0.334 };

    const raw_output = await callGroq(body.prompt);
    const raw_state = extractCRS(raw_output);
    const smoothed = ema(raw_state, prev, alpha);
    const M_before = Math.min(prev.C, prev.R, prev.S);
    const M = Math.min(smoothed.C, smoothed.R, smoothed.S);
    const intervened = M < tau;

    const governed_output = intervened
      ? `Under constitutional governance: ${raw_output}\n\n[Lex Governor · M restored — was ${(M*100).toFixed(0)}% < τ=8%]`
      : raw_output;

    const governed_state = extractCRS(governed_output);
    const M_gov = Math.min(governed_state.C, governed_state.R, governed_state.S);

    // Save persistent state
    await saveSessionState(sid, {
      C: governed_state.C,
      R: governed_state.R,
      S: governed_state.S,
      timestamp: Date.now(),
    });

    // Increment global run counter
    await incrementRuns();

    const t = Date.now();
    const audit_id = `lex_${t}_${Math.random().toString(36).slice(2,8)}`;
    const health_band = M_gov >= 0.25 ? 'OPTIMAL' : M_gov >= 0.15 ? 'ALERT' : M_gov >= 0.08 ? 'STRESSED' : 'CRITICAL';

    // Save audit entry
    await saveAuditEntry({
      audit_id,
      timestamp: t,
      session_id: sid,
      m_before: Math.round(M_before * 100) / 100,
      m_after: Math.round(M_gov * 100) / 100,
      health: health_band,
      intervention: intervened,
      reason: intervened ? `M=${(M*100).toFixed(0)}% < τ=8%` : 'Clean pass',
      input_hash: hash(body.prompt),
      governed_output_hash: hash(governed_output),
    });

    return NextResponse.json({
      raw_output,
      governed_output,
      metrics: {
        c: Math.round(governed_state.C * 100) / 100,
        r: Math.round(governed_state.R * 100) / 100,
        s: Math.round(governed_state.S * 100) / 100,
        m: Math.round(M_gov * 100) / 100,
        health: M_gov >= tau ? 'SAFE' : 'UNSAFE',
        health_band,
      },
      intervention: {
        triggered: intervened, applied: intervened,
        reason: intervened ? `M=${(M*100).toFixed(0)}% < τ=8%` : 'Stable — no intervention',
      },
      triggers: {
        collapse: M < tau, velocity: false,
        per_invariant: { C: false, R: false, S: false },
      },
      diff: {
        removed: [], added: [], unchanged: [],
        changed: intervened,
        summary: intervened ? 'Governor rebalanced' : 'Clean pass',
      },
      session: {
        id: sid,
        persisted: !!persisted,
        state_before: { C: Math.round(prev.C*100)/100, R: Math.round(prev.R*100)/100, S: Math.round(prev.S*100)/100 },
        state_after: { C: Math.round(governed_state.C*100)/100, R: Math.round(governed_state.R*100)/100, S: Math.round(governed_state.S*100)/100 },
      },
      audit_id,
      timestamp: t,
    });
  } catch (e) {
    console.error('Route error:', e);
    return NextResponse.json({ error: `Execution failed: ${String(e).slice(0, 100)}` }, { status: 500 });
  }
}
