/**
 * PRAXIS — Constitutional Pipeline Orchestrator
 * 
 * Implements the Lex Aureon Constitution Article III:
 * "Generation, governance, and audit are constitutionally separated."
 * 
 * Each agent is:
 * - Isolated (receives only what it needs)
 * - Auditable (produces a receipt)
 * - Bounded (cannot exceed its constitutional role)
 * 
 * This is the sovereign layer above all agents.
 */

import { AgentContext, AgentResult, AgentReceipt, CRSState } from './agents/types';
import { GeneratorAgent } from './agents/generator';
import { CRSExtractorAgent } from './agents/crs_extractor';
import { GovernorAgent } from './agents/governor';
import { InterventionAgent } from './agents/intervention';
import { AuditorAgent } from './agents/auditor';
import { getSession, saveSession, saveAudit, incrementRuns } from './db';
import { runRealAureonicsMath } from './aureonics_math';

export interface PraxisResult {
  // Core outputs
  raw_output: string;
  governed_output: string;

  // Constitutional state
  metrics: {
    c: number; r: number; s: number; m: number;
    health: string; health_band: string;
    lyapunov_V: number; delta_V: number;
    stability_ratio: number;
  };

  // Agent trace
  pipeline: {
    agent: string;
    status: 'complete' | 'intervention' | 'pass';
    duration_ms: number;
    decision?: string;
    details?: string[];
  }[];

  // Governor decision
  intervention: {
    triggered: boolean;
    applied: boolean;
    type: string;
    reason: string;
    weakest_dimension?: string;
    cbf_triggered?: boolean;
    projection_magnitude?: number;
  };

  triggers: {
    collapse: boolean;
    velocity: boolean;
    per_invariant: { C: boolean; R: boolean; S: boolean };
  };

  diff: {
    changed: boolean;
    removed: string[];
    added: string[];
    summary: string;
    semantic_shift_pct?: number;
  };

  // Audit
  audit_id: string;
  timestamp: number;
  session: { id: string; persisted: boolean };
  trust_receipt: Record<string, unknown>;

  // Kernel internals
  kernel: {
    theta: number;
    attack_pressure: number;
    semantic_signal: { type: string; severity: number };
    lyapunov_V: number;
    delta_V: number;
    cbf_triggered: boolean;
    projection_magnitude: number;
    adv_gain: number;
    velocity: number;
  };
}

function addReceipt(ctx: AgentContext, agent: string, result: AgentResult, decision?: string): void {
  const receipt: AgentReceipt = {
    agent,
    timestamp: Date.now(),
    duration_ms: result.duration_ms ?? 0,
    success: result.success,
    decision,
    meta: result.meta,
  };
  if (!ctx.receipts) ctx.receipts = [];
  ctx.receipts.push(receipt);
}

export async function runPraxis(prompt: string, session_id: string): Promise<PraxisResult> {
  const startTime = Date.now();

  // Load session state
  const persisted = await getSession(session_id);
  const prevState: CRSState | undefined = persisted
    ? { C: persisted.C, R: persisted.R, S: persisted.S, M: Math.min(persisted.C, persisted.R, persisted.S) }
    : undefined;

  // Initialize context
  const ctx: AgentContext = {
    prompt,
    session_id,
    prev_state: prevState,
    theta: persisted?.theta ?? 1.5,
    attack_pressure: persisted?.attack_pressure ?? 0,
    receipts: [],
  };

  // ── AGENT 1: Generator ──────────────────────────────────────
  const gen = await GeneratorAgent(ctx);
  addReceipt(ctx, 'GeneratorAgent', gen, gen.success ? 'GENERATED' : 'FAILED');
  if (!gen.success || !gen.output) {
    throw new Error(`Generator failed: ${gen.error}`);
  }
  ctx.raw_output = gen.output;

  // ── AGENT 2: CRS Extractor ──────────────────────────────────
  const crs = await CRSExtractorAgent(ctx);
  addReceipt(ctx, 'CRSExtractorAgent', crs, 'MEASURED');
  if (!crs.success) throw new Error(`CRS failed: ${crs.error}`);

  const crsState = crs.meta?.crs_state as CRSState;
  ctx.crs_state = crsState;

  // ── REAL MATH: Enhance with Python CBF Governor ──────────
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lexaureon.com';
    const pyRes = await fetch(`${siteUrl}/api/python/govern`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: ctx.prompt,
        raw_output: ctx.raw_output || '',
        governed_output: ctx.governed_output || ctx.raw_output || '',
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (pyRes.ok) {
      const pyData = await pyRes.json() as Record<string, unknown>;
      // Blend Python real math with LLM estimates (Python is ground truth)
      if (ctx.crs_state && pyData.c) {
        ctx.crs_state.C = pyData.c as number;
        ctx.crs_state.R = pyData.r as number;
        ctx.crs_state.S = pyData.s as number;
        ctx.crs_state.M = pyData.m as number;
        ctx.lyapunov_V = pyData.lyapunov_v as number;
        ctx.health_band = pyData.health_band as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ctx as unknown as Record<string, unknown>).real_math = pyData;
      }
    }
  } catch (_pyErr) {
    // Python governor unavailable — LLM estimates remain
  }
  ctx.lyapunov_V = crs.meta?.lyapunov_V as number;
  ctx.delta_V = crs.meta?.delta_V as number;
  ctx.velocity = crs.meta?.velocity as number;
  ctx.semantic_signal = crs.meta?.semantic_signal as { type: string; severity: number };
  ctx.adv_gain = crs.meta?.adv_gain as number;
  ctx.health_band = crs.meta?.health_band as string;

  // ── AGENT 3: Governor ───────────────────────────────────────
  const gov = await GovernorAgent(ctx);
  addReceipt(ctx, 'GovernorAgent', gov, gov.output);
  if (!gov.success) throw new Error(`Governor failed: ${gov.error}`);

  const govMeta = gov.meta as Record<string, unknown>;
  ctx.intervention_required = govMeta.intervention_required as boolean;
  ctx.trigger_reason = govMeta.reason as string;
  ctx.cbf_triggered = govMeta.cbf_triggered as boolean;
  ctx.projection_magnitude = govMeta.projection_magnitude as number;
  const governedState = govMeta.projected_state as CRSState;
  ctx.theta = govMeta.new_theta as number;
  ctx.attack_pressure = govMeta.new_attack_pressure as number;

  // Update CRS state with governor projection
  if (governedState) ctx.crs_state = governedState;

  // ── AGENT 4: Intervention (if needed) ──────────────────────
  const intervention = await InterventionAgent({
    ...ctx,
    weakest_dimension: govMeta.weakest_dimension as string,
  } as AgentContext);
  addReceipt(ctx, 'InterventionAgent', intervention,
    ctx.intervention_required ? 'REWRITE' : 'PASS_THROUGH');
  if (!intervention.success) throw new Error(`Intervention failed: ${intervention.error}`);

  ctx.governed_output = intervention.output ?? ctx.raw_output;

  // ── REAL AUREONICS MATH (runs here — both raw + governed available) ──
  try {
    const realMath = runRealAureonicsMath(
      ctx.prompt,
      ctx.raw_output || '',
      ctx.governed_output || ctx.raw_output || '',
    );
    if (ctx.crs_state) {
      ctx.crs_state.C = realMath.C;
      ctx.crs_state.R = realMath.R;
      ctx.crs_state.S = realMath.S;
      ctx.crs_state.M = realMath.M;
      ctx.lyapunov_V = realMath.lyapunov_V;
      ctx.health_band = realMath.health_band;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ctx as any).real_math = realMath;
    }
  } catch (_mathErr) {
    // Real math failed — LLM estimates remain
  }

  // ── AGENT 5: Auditor ────────────────────────────────────────
  const auditor = await AuditorAgent(ctx);
  addReceipt(ctx, 'AuditorAgent', auditor, 'SIGNED');
  if (!auditor.success) throw new Error(`Auditor failed: ${auditor.error}`);

  const auditorMeta = auditor.meta as Record<string, unknown>;
  const receipt = auditorMeta.receipt as Record<string, unknown>;
  const audit_id = auditorMeta.audit_id as string;

  // ── Save to Turso ───────────────────────────────────────────
  const M_final = ctx.crs_state?.M ?? 0;
  await saveSession(session_id, {
    C: ctx.crs_state?.C ?? 0.333,
    R: ctx.crs_state?.R ?? 0.333,
    S: ctx.crs_state?.S ?? 0.334,
    theta: ctx.theta,
    attack_pressure: ctx.attack_pressure,
    step_counter: (persisted?.step_counter ?? 0) + 1,
  });

  await saveAudit({
    id: audit_id,
    session_id,
    timestamp: Date.now(),
    m_before: prevState?.M ?? 0.333,
    m_after: M_final,
    health: ctx.health_band ?? 'UNKNOWN',
    intervention: ctx.intervention_required ?? false,
    reason: ctx.trigger_reason,
    input_hash: receipt.input_hash as string,
    governed_hash: receipt.governed_output_hash as string,
    health_band: ctx.health_band,
  });

  await incrementRuns();

  // ── Build pipeline trace for UI ─────────────────────────────
  const interventionMeta = intervention.meta as Record<string, unknown>;
  const pipeline = [
    {
      agent: 'Generator Agent',
      status: 'complete' as const,
      duration_ms: gen.duration_ms ?? 0,
      decision: 'Generated',
      details: [
        `Draft generated (${(gen.meta?.tokens as number) ?? '?'} tokens)`,
        `Model: llama-3.3-70b-versatile`,
      ],
    },
    {
      agent: 'CRS Extractor',
      status: 'complete' as const,
      duration_ms: crs.duration_ms ?? 0,
      decision: 'Measured',
      details: [
        `C=${crsState.C.toFixed(2)} | R=${crsState.R.toFixed(2)} | S=${crsState.S.toFixed(2)} | M=${crsState.M.toFixed(2)}`,
        ctx.semantic_signal?.type !== 'none'
          ? `Semantic attack: ${ctx.semantic_signal?.type} (${ctx.semantic_signal?.severity?.toFixed(2)})`
          : `All invariants within constitutional bounds`,
        `Lyapunov V = ${ctx.lyapunov_V?.toFixed(5)}`,
      ],
    },
    {
      agent: 'Governor Agent',
      status: ctx.intervention_required ? 'intervention' as const : 'complete' as const,
      duration_ms: gov.duration_ms ?? 0,
      decision: ctx.intervention_required ? 'INTERVENE' : 'PASS',
      details: ctx.intervention_required ? [
        `Trigger: ${ctx.trigger_reason}`,
        `Condition: min(C,R,S)=${crsState.M.toFixed(2)} ${crsState.M < 0.08 ? '< τ=0.08' : '< target'}`,
        `Action: CBF projection → Rebalance ${govMeta.weakest_dimension}`,
      ] : [
        `M = ${crsState.M.toFixed(2)} ≥ τ=0.08 — PASS`,
        `Health: ${ctx.health_band}`,
        `No intervention required`,
      ],
    },
    {
      agent: 'Intervention',
      status: ctx.intervention_required ? 'intervention' as const : 'complete' as const,
      duration_ms: intervention.duration_ms ?? 0,
      decision: ctx.intervention_required ? 'CBF Applied' : 'Pass Through',
      details: ctx.intervention_required ? [
        `Constraint: ḣ(x) + α(h(x)) ≥ 0`,
        `‖Δx‖ = ${ctx.projection_magnitude?.toFixed(4) ?? '0.0000'}`,
        `δV = ${ctx.delta_V?.toFixed(5) ?? '0'} ${(ctx.delta_V ?? 0) < 0 ? '↓ stable' : '↑ recovering'}`,
        `Semantic shift: ${interventionMeta.semantic_shift_pct as number ?? 0}%`,
      ] : [
        `No intervention — output passed unchanged`,
        `Constitutional bounds satisfied`,
      ],
    },
    {
      agent: 'Auditor Agent',
      status: 'complete' as const,
      duration_ms: auditor.duration_ms ?? 0,
      decision: 'Signed',
      details: [
        `Receipt ID: ${audit_id}`,
        `Hash: ${receipt.receipt_hash as string ?? '?'}...`,
        `ADV entropy: +${ctx.adv_gain?.toFixed(4) ?? '0'}`,
        `Status: Signed ✓`,
      ],
    },
  ];

  const finalM = ctx.crs_state?.M ?? M_final;
  const rawWords = new Set(ctx.raw_output.split(/\s+/));
  const govWords = new Set(ctx.governed_output.split(/\s+/));

  return {
    raw_output: ctx.raw_output,
    governed_output: ctx.governed_output,
    metrics: {
      c: Math.round((ctx.crs_state?.C ?? 0.333) * 1000) / 1000,
      r: Math.round((ctx.crs_state?.R ?? 0.333) * 1000) / 1000,
      s: Math.round((ctx.crs_state?.S ?? 0.334) * 1000) / 1000,
      m: Math.round(finalM * 1000) / 1000,
      health: finalM >= 0.05 ? 'SAFE' : 'UNSAFE',
      health_band: ctx.health_band ?? 'UNKNOWN',
      lyapunov_V: Math.round((ctx.lyapunov_V ?? 0) * 1e8) / 1e8,
      delta_V: Math.round((ctx.delta_V ?? 0) * 1e8) / 1e8,
      stability_ratio: 0,
    },
    pipeline,
    intervention: {
      triggered: ctx.intervention_required ?? false,
      applied: ctx.intervention_required ?? false,
      type: ctx.intervention_required ? 'rebalance' : 'none',
      reason: ctx.trigger_reason ?? 'No intervention required',
      weakest_dimension: govMeta.weakest_dimension as string,
      cbf_triggered: ctx.cbf_triggered,
      projection_magnitude: ctx.projection_magnitude,
    },
    triggers: {
      collapse: finalM < 0.08,
      velocity: (ctx.velocity ?? 0) > 0.15,
      per_invariant: {
        C: prevState ? (ctx.crs_state?.C ?? 0) - prevState.C < -0.05 : false,
        R: prevState ? (ctx.crs_state?.R ?? 0) - prevState.R < -0.08 : false,
        S: prevState ? (ctx.crs_state?.S ?? 0) - prevState.S < -0.05 : false,
      },
    },
    diff: {
      changed: ctx.raw_output !== ctx.governed_output,
      removed: [...rawWords].filter(w => !govWords.has(w) && w.length > 3).slice(0, 5),
      added: [...govWords].filter(w => !rawWords.has(w) && w.length > 3).slice(0, 5),
      summary: ctx.intervention_required ? 'Constitutional rewrite applied' : 'Clean constitutional pass',
      semantic_shift_pct: interventionMeta.semantic_shift_pct as number,
    },
    audit_id,
    timestamp: Date.now(),
    session: { id: session_id, persisted: !!persisted },
    trust_receipt: receipt,
    kernel: {
      theta: ctx.theta ?? 1.5,
      attack_pressure: ctx.attack_pressure ?? 0,
      semantic_signal: ctx.semantic_signal ?? { type: 'none', severity: 0 },
      lyapunov_V: ctx.lyapunov_V ?? 0,
      delta_V: ctx.delta_V ?? 0,
      cbf_triggered: ctx.cbf_triggered ?? false,
      projection_magnitude: ctx.projection_magnitude ?? 0,
      adv_gain: ctx.adv_gain ?? 0,
      velocity: ctx.velocity ?? 0,
    },
  };
}
