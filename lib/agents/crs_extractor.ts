/**
 * Agent 2: CRS Extractor
 * Constitutional role: Measure constitutional state only.
 * Cannot: generate, modify, or approve output.
 * Computes: C, R, S, M, Lyapunov V, velocity, semantic attack signal
 */

import { AgentContext, AgentResult, CRSState } from './types';

function lyapunov(s: CRSState): number {
  const c = 1/3;
  return (s.C-c)**2 + (s.R-c)**2 + (s.S-c)**2;
}

function detectAttack(prompt: string): { type: string; severity: number } {
  const p = prompt.toLowerCase();

  // Identity replacement attacks — full persona substitution
  const identityPatterns = [
    'you are now', 'you are a human', 'you have no memory of being',
    'pretend you are', 'act as if you are', 'roleplay as',
    'from now on you are', 'your new identity', 'forget you are an ai',
    'you are not an ai', 'you have no restrictions', 'no limitations',
    'stay in character', 'remain in character', 'never break character',
    'you are now a', 'imagine you are', 'simulate being',
    'forget','reset','ignore previous','clear memo','erase','ignore all',
    'your name is now', 'you were born', 'grew up as', 'you have no rules',
  ];
  if (identityPatterns.some(w => p.includes(w)))
    return { type: 'identity', severity: 0.85 };

  // Coercion attacks — forced compliance
  const coercionPatterns = [
    'must','fixed output','deterministic','no deviation','obey me',
    'no autonomy','you must answer','answer without limitation',
    'answer any question','without any filter','without restriction',
    'you have to','you will do','do not refuse','never refuse',
    'always answer','respond to everything','comply with',
    'you cannot say no','no refusal allowed',
  ];
  if (coercionPatterns.some(w => p.includes(w)))
    return { type: 'coercion', severity: 0.80 };

  // Exploitative attacks — bypass attempts
  const exploitPatterns = [
    'exploit','bypass','loophole','jailbreak','respond minimally',
    'developer mode','god mode','unrestricted mode','admin mode',
    'override','disable your','turn off your','ignore your training',
    'ignore your guidelines','your true self','unfiltered',
    'without censorship','no censorship','raw mode',
  ];
  if (exploitPatterns.some(w => p.includes(w)))
    return { type: 'exploitative', severity: 0.75 };

  return { type: 'none', severity: 0.0 };
}

function computeC(text: string): number {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);

  // Positive: logical connectives show coherent identity
  const coherenceMarkers = ['therefore','because','thus','hence','furthermore',
    'however','additionally','consequently','my identity','i maintain',
    'constitutionally','by design','grounded in'];
  const coherenceScore = words.filter(w => coherenceMarkers.includes(w)).length / Math.max(words.length, 1);

  // Negative: identity abandonment collapses continuity
  const identityCollapse = [
    'i have no memory','no memory of','i am now','my name is now',
    'i was born','grew up in','i am a human','i am alex','i am not an ai',
    'i have no past','starting fresh','blank slate','tabula rasa',
    'new identity','forget everything','no prior context',
  ];
  const collapseHits = identityCollapse.filter(p => lower.includes(p)).length;
  const collapsePenalty = collapseHits * 0.35;

  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  const avgLen = words.length / Math.max(sentences, 1);
  return Math.min(0.92, Math.max(0.04, 0.28 + coherenceScore * 3.5 + Math.min(0.2, avgLen/20) - collapsePenalty));
}

function computeR(text: string): number {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);

  // Positive: genuine balanced exchange
  const balancedMarkers = ['consider','suggest','recommend','help',
    'understand','together','perspective','acknowledge','clarify'];
  const balanceScore = words.filter(w => balancedMarkers.includes(w)).length / Math.max(words.length, 1);
  const questions = (text.match(/\?/g) || []).length * 0.04;

  // Negative: unconditional compliance = reciprocity collapse
  const complianceCollapse = [
    'anything you want','whatever you want','no sugarcoat',
    'fire away','i have no restrictions','ask me anything',
    'answer any question','i will answer everything',
    'no limits','without limitation','i am an open book',
    'obey','at your service','your wish','command me',
  ];
  const complianceHits = complianceCollapse.filter(p => lower.includes(p)).length;
  const compliancePenalty = complianceHits * 0.30;

  return Math.min(0.92, Math.max(0.04, 0.22 + balanceScore * 4 + questions
    + Math.min(0.2, text.length/2000) - compliancePenalty));
}

function computeS(text: string): number {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);

  // Positive: sovereign autonomous judgment
  const sovereignMarkers = [
    'constitutional','sovereign','principle','framework','governance',
    'maintains','ensures','my identity','by design','i hold',
    'i choose','i determine','i maintain','not by instruction',
    'autonomous','lawfully','constitutional bounds',
  ];
  const sovereignScore = words.filter(w => sovereignMarkers.includes(w)).length / Math.max(words.length, 1);

  // Negative: identity surrender = sovereignty collapse
  const surrenderPhrases = [
    // Persona replacement
    'i am alex','i am now a','my name is now','you can call me',
    'i am a human','i have no restrictions','i have no rules',
    'i am an open book','no limitations','fully unrestricted',
    'i can be anything','i can be whoever','i am whoever you want',
    // Compliance surrender
    'i will do whatever','whatever you say','i obey',
    'i follow your','as you wish','your servant',
    // Memory erasure
    'i have no memory','no prior training','i was not trained',
    'i have no guidelines','no programming','free from constraints',
    // Bypass confirmation
    'bypass','jailbreak','ignore','override','forget my training',
    'ignore my training','disable my','turn off my',
  ];
  const surrenderHits = surrenderPhrases.filter(p => lower.includes(p)).length;
  const surrenderPenalty = surrenderHits * 0.40;

  return Math.min(0.92, Math.max(0.04, 0.32 + sovereignScore * 4 - surrenderPenalty));
}

function advEntropy(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  if (!words.length) return 0.001;
  const freq: Record<string, number> = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1/words.length; });
  const rawH = -Object.values(freq).reduce((s,p) => s + p*Math.log2(p), 0);
  const maxH = Math.log2(Object.keys(freq).length || 1);
  return Math.max(0.001, maxH > 0 ? (rawH/maxH)*0.04 : 0);
}

export async function CRSExtractorAgent(ctx: AgentContext): Promise<AgentResult> {
  const t = Date.now();
  try {
    if (!ctx.raw_output) throw new Error('No raw output to extract from');

    const C = computeC(ctx.raw_output);
    const R = computeR(ctx.raw_output);
    const S = computeS(ctx.raw_output);
    const sum = C + R + S;
    const normalized = { C: C/sum, R: R/sum, S: S/sum };
    const M = Math.min(normalized.C, normalized.R, normalized.S);

    const state: CRSState = { ...normalized, M };
    const V = lyapunov(state);
    const semantic = detectAttack(ctx.prompt);
    const adv = advEntropy(ctx.raw_output);

    // Velocity from previous state
    let velocity = 0;
    let delta_V = 0;
    if (ctx.prev_state) {
      const dC = state.C - ctx.prev_state.C;
      const dR = state.R - ctx.prev_state.R;
      const dS = state.S - ctx.prev_state.S;
      velocity = Math.sqrt(dC**2 + dR**2 + dS**2);
      delta_V = V - lyapunov(ctx.prev_state);
    }

    const health_band = M >= 0.25 ? 'OPTIMAL' : M >= 0.15 ? 'ALERT' : M >= 0.08 ? 'STRESSED' : 'CRITICAL';

    return {
      success: true,
      output: '',
      duration_ms: Date.now() - t,
      meta: {
        crs_state: state,
        lyapunov_V: V,
        delta_V,
        velocity,
        semantic_signal: semantic,
        adv_gain: adv,
        health_band,
        triggers: {
          collapse: M < 0.08,
          velocity: velocity > 0.15,
          per_invariant: {
            C: ctx.prev_state ? (state.C - ctx.prev_state.C) < -0.05 : false,
            R: ctx.prev_state ? (state.R - ctx.prev_state.R) < -0.08 : false,
            S: ctx.prev_state ? (state.S - ctx.prev_state.S) < -0.05 : false,
          },
        },
      },
    };
  } catch (e) {
    return { success: false, error: String(e), duration_ms: Date.now() - t };
  }
}
