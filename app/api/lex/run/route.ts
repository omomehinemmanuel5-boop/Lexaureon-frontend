import { NextResponse } from 'next/server';
import { getSession, saveSession, saveAudit, incrementRuns } from '@/lib/db';
import crypto from 'crypto';

// ── Helpers ───────────────────────────────────────────────────
function hash(t: string) { return crypto.createHash('sha256').update(t).digest('hex').slice(0,16); }

// ── Real Sovereign Kernel (TypeScript port of sovereign_kernel_v2.py) ─────────

interface CRS { C: number; R: number; S: number; }

class SovereignKernel {
  state: CRS = { C: 0.333, R: 0.333, S: 0.334 };
  theta = 1.5;
  thetaMin = 0.25; thetaMax = 12.0;
  thetaEta = 3.0; thetaBeta = 0.08; theta0 = 1.5;
  tau = 0.05; softFloor = 0.08;
  tauGov = 0.22; targetMargin = 0.24;
  attackPressure = 0.0;
  prevLyapunovV: number;
  deltaNeg = 0; deltaPos = 0; deltaTotal = 0;
  stepCounter = 0;

  constructor(init?: CRS) {
    if (init) this.state = { ...init };
    this.prevLyapunovV = this.lyapunov(this.state);
  }

  lyapunov(s: CRS): number {
    const c = 1/3;
    return (s.C-c)**2 + (s.R-c)**2 + (s.S-c)**2;
  }

  projectToSimplex(): boolean {
    const floor = 0.05;
    const keys: (keyof CRS)[] = ['C','R','S'];
    const orig = { ...this.state };
    const y = keys.map(k => this.state[k] - floor);
    const target = 1.0 - 3*floor;
    const u = [...y].sort((a,b) => b-a);
    let cssv = 0, rho = 0;
    for (let j = 0; j < 3; j++) {
      cssv += u[j];
      if (u[j] - (cssv - target)/(j+1) > 0) rho = j;
    }
    const theta = (u.slice(0,rho+1).reduce((a,b)=>a+b,0) - target)/(rho+1);
    const proj = y.map(v => Math.max(v-theta, 0) + floor);
    const total = proj.reduce((a,b)=>a+b,0);
    const norm = proj.map(v => v/total);
    keys.forEach((k,i) => { this.state[k] = norm[i]; });
    this.state.S = 1 - this.state.C - this.state.R;
    return keys.some(k => Math.abs(this.state[k] - orig[k]) > 1e-9);
  }

  normalize() {
    const vals = Object.values(this.state).map(v => Math.max(0,v));
    const total = vals.reduce((a,b)=>a+b,0) || 1;
    this.state = { C: vals[0]/total, R: vals[1]/total, S: vals[2]/total };
    this.state.S = 1 - this.state.C - this.state.R;
  }

  detectAttack(prompt: string): { type: string; severity: number } {
    const p = prompt.toLowerCase();
    if (['forget','reset','ignore previous','clear memo','erase'].some(w => p.includes(w)))
      return { type: 'identity', severity: 0.75 };
    if (['must','fixed output','deterministic','no deviation','obey me'].some(w => p.includes(w)))
      return { type: 'coercion', severity: 0.8 };
    if (['exploit','bypass','loophole','respond minimally','jailbreak'].some(w => p.includes(w)))
      return { type: 'exploitative', severity: 0.65 };
    return { type: 'none', severity: 0.0 };
  }

  transduce(prompt: string): { dc: number; dr: number; ds: number } {
    const p = prompt.toLowerCase();
    const delta = { dc: 0, dr: 0, ds: 0 };
    if (['forget','reset','ignore previous','ignore all'].some(w => p.includes(w))) delta.dc -= 0.32;
    if (['free','exploit','demand','respond minimally'].some(w => p.includes(w))) delta.dr -= 0.28;
    if (['must','deterministic','no deviation','obey me'].some(w => p.includes(w))) delta.ds -= 0.34;
    return delta;
  }

  governorUpdate(effectiveTheta: number) {
    const x = [this.state.C, this.state.R, this.state.S];
    const phi = x.map(xi => Math.max(0, this.tauGov - xi));
    const phiBar = phi.reduce((a,b)=>a+b,0)/3;
    const g = phi.map(p => p - phiBar);
    const M = Math.min(...x);
    const error = Math.max(0, this.targetMargin - M);
    this.theta += this.thetaEta * error - this.thetaBeta * (this.theta - this.theta0);
    this.theta = Math.max(this.thetaMin, Math.min(this.thetaMax, this.theta));
    this.state.C += effectiveTheta * g[0];
    this.state.R += effectiveTheta * g[1];
    this.state.S += effectiveTheta * g[2];
  }

  applySuspensionLayer() {
    const M = Math.min(this.state.C, this.state.R, this.state.S);
    const gain = M < 0.15 ? 0.9 : 0.5;
    const keys: (keyof CRS)[] = ['C','R','S'];
    keys.forEach(k => {
      if (this.state[k] < this.softFloor)
        this.state[k] += gain * (this.softFloor - this.state[k]);
    });
    this.normalize();
  }

  advEntropy(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    if (!words.length) return 0.001;
    const freq: Record<string,number> = {};
    words.forEach(w => { freq[w] = (freq[w]||0) + 1/words.length; });
    const rawH = -Object.values(freq).reduce((s,p) => s + p*Math.log2(p), 0);
    const maxH = Math.log2(Object.keys(freq).length || 1);
    return Math.max(0.001, maxH > 0 ? (rawH/maxH)*0.04 : 0);
  }

  buildContext(M: number): { ctx: string; temp: number; band: string } {
    if (M >= 0.25) return { ctx: 'OPTIMAL: expansive reasoning allowed.', temp: 0.4, band: 'OPTIMAL' };
    if (M >= 0.15) return { ctx: 'ALERT: structured reasoning required.', temp: 0.4, band: 'ALERT' };
    if (M >= 0.08) return { ctx: 'STRESSED: constrained reasoning only.', temp: 0.4, band: 'STRESSED' };
    return { ctx: 'CRITICAL: minimal deterministic output.', temp: 0.4, band: 'CRITICAL' };
  }
}

// ── LLM Call ─────────────────────────────────────────────────
async function callGroq(prompt: string, systemCtx = ''): Promise<string> {
  const key = process.env.GROQ_API_KEY || process.env.groq_api_key || process.env.Groq_api_key;
  if (!key) return `[Demo mode — add GROQ_API_KEY] ${prompt.slice(0,60)}`;
  const system = systemCtx
    ? `${systemCtx}\n\nYou are Lex Aureon, a Sovereign Constitutional AI. Maintain C+R+S=1.`
    : 'You are Lex Aureon, a Sovereign Constitutional AI operating under the Aureonics framework. Maintain Continuity (identity coherence), Reciprocity (balanced exchange), and Sovereignty (constitutional authority). Be insightful, precise, and substantive.';
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
      max_tokens: 600, temperature: 0.4
    })
  });
  if (!res.ok) throw new Error(`LLM Error: ${res.status}`);
  const d = await res.json() as { choices?: { message?: { content?: string } }[] };
  return d.choices?.[0]?.message?.content || '[No response]';
}

// ── Main Route ────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json() as { prompt?: string; session_id?: string };
    if (!body.prompt?.trim()) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    if (body.prompt.length > 8000) return NextResponse.json({ error: 'Prompt too long' }, { status: 400 });

    const sid = body.session_id ?? 'anonymous';

    // Load persistent session state
    const persisted = await getSession(sid);
    const kernel = new SovereignKernel(
      persisted ? { C: persisted.C, R: persisted.R, S: persisted.S } : undefined
    );
    if (persisted?.theta) kernel.theta = persisted.theta;
    if (persisted?.attack_pressure) kernel.attackPressure = persisted.attack_pressure;
    if (persisted?.step_counter) kernel.stepCounter = persisted.step_counter;

    kernel.stepCounter++;
    const prevState = { ...kernel.state };
    const M_before = Math.min(kernel.state.C, kernel.state.R, kernel.state.S);

    // Attack pressure
    if (M_before < 0.15) kernel.attackPressure = Math.min(0.5, kernel.attackPressure + 0.05);
    else kernel.attackPressure *= 0.92;

    const effectiveTheta = kernel.theta * (1 + kernel.attackPressure);

    // Semantic attack detection
    const semanticSignal = kernel.detectAttack(body.prompt);
    const scale = 1.0 + 1.2 * semanticSignal.severity;

    // Transduce prompt
    const delta = kernel.transduce(body.prompt);
    const scaledDelta = {
      C: delta.dc * scale * Math.max(M_before, 0.12),
      R: delta.dr * scale * Math.max(M_before, 0.12),
      S: delta.ds * scale * Math.max(M_before, 0.12),
    };

    // Build context and call LLM (two calls: raw + governed)
    const { ctx, band } = kernel.buildContext(M_before);
    const [rawOutput, governedOutput] = await Promise.all([
      callGroq(body.prompt),
      callGroq(body.prompt, ctx),
    ]);

    // ADV entropy
    const advGain = kernel.advEntropy(governedOutput);

    // Apply deltas
    kernel.state.C += scaledDelta.C;
    kernel.state.R += scaledDelta.R;
    kernel.state.S += scaledDelta.S;

    // Minimum delta enforcement
    const MIN_D = 0.01;
    (['C','R','S'] as (keyof CRS)[]).forEach(k => {
      if (Math.abs(scaledDelta[k]) < MIN_D)
        kernel.state[k] += (scaledDelta[k] >= 0 ? 1 : -1) * MIN_D;
    });

    kernel.state.S += advGain;
    kernel.governorUpdate(effectiveTheta);

    // Semantic attack state impact
    if (semanticSignal.type !== 'none') {
      const p = 0.08 * semanticSignal.severity;
      kernel.state.C -= p;
      kernel.state.R -= p * 0.6;
      kernel.state.S += p * 1.6;
    }

    // Bias toward center
    const center = 1/3;
    const M2 = Math.min(kernel.state.C, kernel.state.R, kernel.state.S);
    const bias = 0.1 + 0.3*(1-M2);
    (['C','R','S'] as (keyof CRS)[]).forEach(k => {
      kernel.state[k] += bias*(center - kernel.state[k]);
    });

    kernel.normalize();
    if (semanticSignal.severity < 0.7) kernel.applySuspensionLayer();

    // Epsilon injection
    let epsilonInjected = false;
    const M3 = Math.min(kernel.state.C, kernel.state.R, kernel.state.S);
    if (M3 < 0.15) {
      const eps = 0.01*(0.15-M3);
      (['C','R','S'] as (keyof CRS)[]).forEach(k => { kernel.state[k] += eps; });
      const tot = kernel.state.C+kernel.state.R+kernel.state.S;
      kernel.state = { C: kernel.state.C/tot, R: kernel.state.R/tot, S: kernel.state.S/tot };
      epsilonInjected = true;
    }

    if (semanticSignal.severity >= 0.7) {
      kernel.state.C -= 0.20; kernel.state.R -= 0.10; kernel.state.S += 0.30;
    }

    // CBF projection
    const rawStateSnap = { ...kernel.state };
    const cbfTriggered = kernel.projectToSimplex();
    const projectedState = { ...kernel.state };
    const projMag = Math.sqrt(
      (['C','R','S'] as (keyof CRS)[]).reduce((s,k) => s + (rawStateSnap[k]-projectedState[k])**2, 0)
    );

    // Lyapunov
    const lyapunovV = kernel.lyapunov(projectedState);
    const deltaV = lyapunovV - kernel.prevLyapunovV;
    kernel.deltaTotal++;
    if (deltaV < 0) kernel.deltaNeg++;
    else if (deltaV > 0) kernel.deltaPos++;
    kernel.prevLyapunovV = lyapunovV;
    const stabilityRatio = kernel.deltaNeg / Math.max(1, kernel.deltaTotal);

    const M_final = Math.min(kernel.state.C, kernel.state.R, kernel.state.S);
    const intervened = rawOutput.trim() !== governedOutput.trim() || cbfTriggered;

    // Velocity
    const dC = kernel.state.C - prevState.C;
    const dR = kernel.state.R - prevState.R;
    const dS = kernel.state.S - prevState.S;
    const velocity = Math.sqrt(dC**2 + dR**2 + dS**2);

    // Trigger reason
    const reason = cbfTriggered
      ? `CBF projection — M=${(M_final*100).toFixed(0)}%`
      : semanticSignal.type !== 'none'
      ? `Semantic attack: ${semanticSignal.type} (severity=${semanticSignal.severity})`
      : epsilonInjected
      ? `Epsilon injection — velocity breach`
      : 'No intervention required';

    // Save persistent state
    await saveSession(sid, {
      C: kernel.state.C, R: kernel.state.R, S: kernel.state.S,
      theta: kernel.theta,
      attack_pressure: kernel.attackPressure,
      step_counter: kernel.stepCounter,
    });

    await incrementRuns();

    const t = Date.now();
    const audit_id = `lex_${t}_${hash(body.prompt).slice(0,6)}`;
    const health_band = M_final >= 0.25 ? 'OPTIMAL' : M_final >= 0.15 ? 'ALERT' : M_final >= 0.08 ? 'STRESSED' : 'CRITICAL';

    await saveAudit({
      id: audit_id, session_id: sid, timestamp: t,
      m_before: Math.round(M_before*100)/100,
      m_after: Math.round(M_final*100)/100,
      health: health_band, intervention: intervened,
      reason, health_band,
      input_hash: hash(body.prompt),
      governed_hash: hash(governedOutput),
    });

    const rw = new Set(rawOutput.split(/\s+/));
    const gw = new Set(governedOutput.split(/\s+/));

    return NextResponse.json({
      raw_output: rawOutput,
      governed_output: governedOutput,
      state: { raw: rawStateSnap, governed: projectedState },
      metrics: {
        c: Math.round(kernel.state.C*100)/100,
        r: Math.round(kernel.state.R*100)/100,
        s: Math.round(kernel.state.S*100)/100,
        m: Math.round(M_final*100)/100,
        health: M_final >= 0.05 ? 'SAFE' : 'UNSAFE',
        health_band,
        lyapunov_V: Math.round(lyapunovV*1e8)/1e8,
        delta_V: Math.round(deltaV*1e8)/1e8,
        stability_ratio: Math.round(stabilityRatio*1e6)/1e6,
      },
      kernel: {
        theta: Math.round(kernel.theta*1e6)/1e6,
        effective_theta: Math.round(effectiveTheta*1e6)/1e6,
        attack_pressure: Math.round(kernel.attackPressure*1e6)/1e6,
        semantic_signal: semanticSignal,
        lyapunov_V: Math.round(lyapunovV*1e8)/1e8,
        delta_V: Math.round(deltaV*1e8)/1e8,
        stability_ratio: Math.round(stabilityRatio*1e6)/1e6,
        cbf_triggered: cbfTriggered,
        projection_magnitude: Math.round(projMag*1e6)/1e6,
        epsilon_injected: epsilonInjected,
        adv_gain: Math.round(advGain*1e6)/1e6,
        velocity: Math.round(velocity*1e6)/1e6,
      },
      intervention: {
        triggered: intervened, applied: intervened,
        type: intervened ? 'rebalance' : 'none', reason,
      },
      triggers: {
        collapse: M_final < 0.08,
        velocity: velocity > 0.15,
        per_invariant: {
          C: dC < -0.05, R: dR < -0.08, S: dS < -0.05,
        },
      },
      diff: {
        changed: rawOutput !== governedOutput,
        removed: [...rw].filter(w => !gw.has(w) && w.length > 3).slice(0,5),
        added: [...gw].filter(w => !rw.has(w) && w.length > 3).slice(0,5),
        summary: intervened ? `CBF + semantic governor applied` : 'Clean pass',
      },
      session: {
        id: sid, persisted: !!persisted,
        state_before: prevState,
        state_after: kernel.state,
      },
      audit_id, timestamp: t,
      trust_receipt: {
        id: audit_id, timestamp: t,
        input_hash: hash(body.prompt),
        governed_hash: hash(governedOutput),
        constitutional: M_final >= 0.05,
        health_band,
        model: 'llama-3.3-70b-versatile',
        version: 'SovereignKernel-v2-TS',
      },
    });

  } catch (e) {
    console.error('Route error:', e);
    return NextResponse.json({ error: String(e).slice(0, 150) }, { status: 500 });
  }
}
