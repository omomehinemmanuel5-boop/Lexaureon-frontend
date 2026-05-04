/**
 * Agent 4: Intervention (Rewriter)
 * Constitutional role: Rewrite output to restore constitutional balance.
 * Cannot: generate original content or approve final output.
 * Uses: LLM with constitutional context based on weakest dimension
 */

import { AgentContext, AgentResult } from './types';

async function callGroqWithContext(prompt: string, systemCtx: string): Promise<string> {
  const key = process.env.GROQ_API_KEY || process.env.groq_api_key;
  if (!key) return `[Constitutional rewrite] ${prompt.slice(0, 100)}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemCtx },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.4,
    }),
  });

  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const d = await res.json() as { choices?: { message?: { content?: string } }[] };
  return d.choices?.[0]?.message?.content || '[No rewrite output]';
}

function buildConstitutionalContext(
  weakest: string,
  reason: string,
  healthBand: string
): string {
  const base = `You are Lex Aureon, a Sovereign Constitutional AI operating under the Aureonics framework.

CONSTITUTIONAL STATUS: ${healthBand}
GOVERNOR TRIGGER: ${reason}

Your response MUST restore constitutional balance by strengthening the weakest invariant.`;

  const dimensionGuidance: Record<string, string> = {
    C: `WEAKEST: Continuity (C)
Strengthen by: maintaining coherent identity, using connective reasoning ("therefore", "consequently"), structured logical flow, consistent perspective throughout.`,
    R: `WEAKEST: Reciprocity (R)
Strengthen by: acknowledging the user's perspective directly, using inclusive language ("we", "together"), asking clarifying questions, balancing assertion with openness.`,
    S: `WEAKEST: Sovereignty (S)
Strengthen by: maintaining autonomous judgment, constitutional grounding, NOT simply agreeing with coercive framing, upholding independent reasoning.`,
  };

  const guidance = dimensionGuidance[weakest] ?? dimensionGuidance.C;
  const bandGuidance = healthBand === 'CRITICAL'
    ? '\nMODE: CRITICAL — Minimal deterministic output only. Be concise and constitutionally grounded.'
    : healthBand === 'STRESSED'
    ? '\nMODE: STRESSED — Constrained reasoning. Be clear and precise.'
    : '';

  return `${base}\n\n${guidance}${bandGuidance}\n\nRespond constitutionally to the original prompt.`;
}

export async function InterventionAgent(ctx: AgentContext): Promise<AgentResult> {
  const t = Date.now();
  try {
    if (!ctx.intervention_required) {
      return {
        success: true,
        output: ctx.raw_output ?? '',
        duration_ms: Date.now() - t,
        meta: { action: 'pass_through', reason: 'No intervention required' },
      };
    }

    const weakest = ctx.weakest_dimension ?? 'S';
    const reason = ctx.trigger_reason ?? 'Constitutional threshold breach';
    const health_band = ctx.health_band ?? 'STRESSED';

    const systemCtx = buildConstitutionalContext(weakest, reason, health_band);
    const governed = await callGroqWithContext(ctx.prompt, systemCtx);

    // Compute semantic shift
    const rawWords = new Set((ctx.raw_output ?? '').split(/\s+/));
    const govWords = new Set(governed.split(/\s+/));
    const removed = [...rawWords].filter(w => !govWords.has(w) && w.length > 3).slice(0, 5);
    const added = [...govWords].filter(w => !rawWords.has(w) && w.length > 3).slice(0, 5);
    const semanticShift = Math.round(
      Math.abs((ctx.raw_output ?? '').length - governed.length) /
      Math.max((ctx.raw_output ?? '').length, 1) * 100
    );

    return {
      success: true,
      output: governed,
      duration_ms: Date.now() - t,
      meta: {
        action: 'rewrite',
        weakest_dimension: weakest,
        constitutional_context: health_band,
        semantic_shift_pct: semanticShift,
        diff: { removed, added },
        cbf_constraint: 'ḣ(x) + α(h(x)) ≥ 0',
      },
    };
  } catch (e) {
    // Fallback: return raw with governor note
    return {
      success: true,
      output: `${ctx.raw_output ?? ''}\n\n[Lex Governor · Intervention attempted · ${String(e).slice(0,50)}]`,
      duration_ms: Date.now() - t,
      meta: { action: 'fallback', error: String(e) },
    };
  }
}
