import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/praxis', () => ({
  runPraxis: vi.fn(async (prompt: string, sessionId: string) => ({
    raw_output: `raw:${prompt}`,
    governed_output: `governed:${prompt}`,
    metrics: {
      c: 0.34, r: 0.33, s: 0.33, m: 0.33,
      health: 'SAFE', health_band: 'OPTIMAL',
      lyapunov_V: 0.01, delta_V: -0.001, stability_ratio: 0.95,
    },
    pipeline: [],
    intervention: { triggered: false, applied: false, type: 'none', reason: 'stable' },
    triggers: { collapse: false, velocity: false, per_invariant: { C: false, R: false, S: false } },
    diff: { changed: false, removed: [], added: [], summary: 'none' },
    audit_id: 'audit-test-1',
    timestamp: Date.now(),
    session: { id: sessionId, persisted: true },
    trust_receipt: { input_hash: 'abc', governed_output_hash: 'def' },
    kernel: {
      theta: 1.5, attack_pressure: 0, semantic_signal: { type: 'none', severity: 0 },
      lyapunov_V: 0.01, delta_V: -0.001, cbf_triggered: false,
      projection_magnitude: 0, adv_gain: 0.2, velocity: 0.01,
    },
  })),
}));

vi.mock('../lib/db', () => ({
  seedSovereignLaws: vi.fn(async () => undefined),
  getTotalRuns: vi.fn(async () => 1337),
  getClient: vi.fn(() => null),
  getRecentAudits: vi.fn(async () => [{
    id: 'audit-1',
    session_id: 'console',
    timestamp: Date.now(),
    m_before: 0.07,
    m_after: 0.28,
    health: 'STRESSED',
    intervention: true,
    reason: 'M below threshold',
    input_hash: 'ih',
    governed_hash: 'gh',
    health_band: 'ALERT',
    c_after: 0.31,
    r_after: 0.34,
    s_after: 0.35,
    metrics_version: 'aureonics-ts-v1',
  }]),
  getLatestSessionState: vi.fn(async () => ({
    id: 'console',
    state: { C: 0.34, R: 0.33, S: 0.33 },
  })),
}));

describe('API integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /api/lex/run returns governed payload', async () => {
    const { POST } = await import('../app/api/lex/run/route');

    const req = new Request('http://localhost/api/lex/run', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt: 'Explain the simplex.' , session_id: 'console' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.governed_output).toContain('governed:Explain the simplex.');
    expect(data.metrics.m).toBeGreaterThan(0.08);
    expect(data.intervention.triggered).toBe(false);
    expect(data.session.id).toBe('console');
  });

  it('POST /api/lex/run rejects empty prompts', async () => {
    const { POST } = await import('../app/api/lex/run/route');

    const req = new Request('http://localhost/api/lex/run', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt: '   ' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Prompt required' });
  });

  it('GET /api/stats returns current run count', async () => {
    const { GET } = await import('../app/api/stats/route');
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ runs: 1337 });
  });

  it('GET /api/health reports backend/frontend bridge status', async () => {
    const { GET } = await import('../app/api/health/route');
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.ok).toBe(true);
    expect(data.api).toBe('healthy');
    expect(data.storage.mode).toBe('memory');
    expect(data.frontend_contract.routes.lex_run).toBe('/api/lex/run');
  });


  it('GET /api/audits/recent returns real persisted audit events', async () => {
    const { GET } = await import('../app/api/audits/recent/route');
    const req = new Request('http://localhost/api/audits/recent?limit=5');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.audits)).toBe(true);
    expect(data.audits[0].id).toBe('audit-1');
    expect(data.audits[0].metrics_version).toBe('aureonics-ts-v1');
  });

  it('GET /api/live-state returns latest CRS state for landing simplex', async () => {
    const { GET } = await import('../app/api/live-state/route');
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.session_id).toBe('console');
    expect(data.state.C + data.state.R + data.state.S).toBeCloseTo(1, 8);
  });
});
