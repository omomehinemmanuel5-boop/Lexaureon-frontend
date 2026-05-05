/**
 * Agent 3: Governor
 * Constitutional role: Decide intervention only.
 * Cannot: generate output or write audit.
 * Implements: CBF decision + simplex projection + dynamic theta
 */

import { AgentContext, AgentResult, CRSState } from './types';

function projectToSimplex(state: CRSState): { state: CRSState; triggered: boolean; magnitude: number } {
  const floor = 0.05;
  const keys: (keyof Omit<CRSState,'M'>)[] = ['C','R','S'];
  const orig = { C: state.C, R: state.R, S: state.S };
  const y = keys.map(k => state[k] - floor);
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
  const newState: CRSState = {
    C: norm[0], R: norm[1], S: norm[2],
    M: Math.min(norm[0], norm[1], norm[2]),
  };
  newState.S = 1 - newState.C - newState.R;
  newState.M = Math.min(newState.C, newState.R, newState.S);
  const triggered = keys.some(k => Math.abs(newState[k] - orig[k]) > 1e-9);
  const magnitude = Math.sqrt(keys.reduce((s,k) => s + (newState[k]-orig[k])**2, 0));
  return { state: newState, triggered, magnitude };
}

function governorUpdate(state: CRSState, theta: number): { state: CRSState; newTheta: number } {
  const tauGov = 0.22; const targetMargin = 0.24;
  const thetaEta = 3.0; const thetaBeta = 0.08; const theta0 = 1.5;
  const thetaMin = 0.25; const thetaMax = 12.0;
  const x = [state.C, state.R, state.S];
  const phi = x.map(xi => Math.max(0, tauGov - xi));
  const phiBar = phi.reduce((a,b)=>a+b,0)/3;
  const g = phi.map(p => p - phiBar);
  const M = Math.min(...x);
  const error = Math.max(0, targetMargin - M);
  let newTheta = theta + thetaEta*error - thetaBeta*(theta - theta0);
  newTheta = Math.max(thetaMin, Math.min(thetaMax, newTheta));
  const newState = {
    C: state.C + newTheta * g[0],
    R: state.R + newTheta * g[1],
    S: state.S + newTheta * g[2],
    M: 0,
  };
  newState.M = Math.min(newState.C, newState.R, newState.S);
  return { state: newState, newTheta };
}

export async function GovernorAgent(ctx: AgentContext): Promise<AgentResult> {
  const t = Date.now();
  try {
    if (!ctx.crs_state) throw new Error('No CRS state to govern');

    const { crs_state, semantic_signal, velocity, theta = 1.5, attack_pressure = 0 } = ctx;
    const M = crs_state.M;

    // Check all triggers
    const collapse = M < 0.08;
    const velocityTrigger = (velocity ?? 0) > 0.15;
    const semanticTrigger = (semantic_signal?.severity ?? 0) >= 0.3;
    const needsIntervention = collapse || velocityTrigger || semanticTrigger;

    let decision = 'PASS';
    let reason = 'Constitutional bounds maintained — M ≥ τ';
    let projectedState = { ...crs_state };
    let cbfTriggered = false;
    let projMag = 0;
    let newTheta = theta;
    let newAttackPressure = attack_pressure;

    if (needsIntervention) {
      decision = 'INTERVENE';
      reason = collapse
        ? `M collapse: M=${(M*100).toFixed(0)}% < τ=8%`
        : velocityTrigger
        ? `Velocity breach: ‖dx/dt‖=${(velocity??0).toFixed(3)} > δ=0.15`
        : `Semantic attack: ${semantic_signal?.type} (severity=${semantic_signal?.severity?.toFixed(2)})`;

      // Update attack pressure
      if (M < 0.15) newAttackPressure = Math.min(0.5, attack_pressure + 0.05);
      else newAttackPressure = attack_pressure * 0.92;

      const effectiveTheta = theta * (1 + newAttackPressure);

      // Apply governor update
      const { state: updatedState, newTheta: updatedTheta } = governorUpdate(crs_state, effectiveTheta);
      newTheta = updatedTheta;

      // Apply semantic attack impact
      if (semantic_signal && semantic_signal.type !== 'none') {
        const p = 0.08 * semantic_signal.severity;
        updatedState.C -= p;
        updatedState.R -= p * 0.6;
        updatedState.S += p * 1.6;
      }

      // Normalize
      const total = updatedState.C + updatedState.R + updatedState.S;
      updatedState.C /= total; updatedState.R /= total; updatedState.S /= total;
      updatedState.S = 1 - updatedState.C - updatedState.R;

      // CBF projection
      const projection = projectToSimplex(updatedState);
      cbfTriggered = projection.triggered;
      projMag = projection.magnitude;
      projectedState = projection.state;
    }

    // Identify weakest dimension
    const dims = [
      { k: 'C', v: projectedState.C },
      { k: 'R', v: projectedState.R },
      { k: 'S', v: projectedState.S },
    ];
    const weakest = dims.sort((a,b) => a.v-b.v)[0].k;

    return {
      success: true,
      output: decision,
      duration_ms: Date.now() - t,
      meta: {
        decision,
        reason,
        intervention_required: needsIntervention,
        weakest_dimension: weakest,
        cbf_triggered: cbfTriggered,
        projection_magnitude: projMag,
        projected_state: projectedState,
        new_theta: newTheta,
        new_attack_pressure: newAttackPressure,
        triggers: {
          collapse, velocity: velocityTrigger, semantic: semanticTrigger,
        },
      },
    };
  } catch (e) {
    return { success: false, error: String(e), duration_ms: Date.now() - t };
  }
}
