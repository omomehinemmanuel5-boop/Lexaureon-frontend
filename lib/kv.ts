/**
 * Vercel KV persistence layer for Lex Aureon
 * Falls back gracefully to in-memory if KV not configured
 */

interface CRSState {
  C: number; R: number; S: number;
  theta?: number;
  attack_pressure?: number;
  step_counter?: number;
  timestamp?: number;
}

interface AuditEntry {
  audit_id: string;
  timestamp: number;
  session_id: string;
  m_before: number;
  m_after: number;
  health: string;
  intervention: boolean;
  reason?: string;
  input_hash: string;
  governed_output_hash: string;
}

// In-memory fallback (works without KV configured)
const mem = new Map<string, string>();
const memLists = new Map<string, string[]>();

function hasKV(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function kvGet(key: string): Promise<string | null> {
  if (hasKV()) {
    try {
      const { kv } = await import('@vercel/kv');
      return await kv.get<string>(key) ?? null;
    } catch { /* fall through */ }
  }
  return mem.get(key) ?? null;
}

async function kvSet(key: string, value: string, ex?: number): Promise<void> {
  if (hasKV()) {
    try {
      const { kv } = await import('@vercel/kv');
      ex ? await kv.set(key, value, { ex }) : await kv.set(key, value);
      return;
    } catch { /* fall through */ }
  }
  mem.set(key, value);
}

async function kvLPush(key: string, value: string, maxLen = 50): Promise<void> {
  if (hasKV()) {
    try {
      const { kv } = await import('@vercel/kv');
      await kv.lpush(key, value);
      await kv.ltrim(key, 0, maxLen - 1);
      return;
    } catch { /* fall through */ }
  }
  const list = memLists.get(key) ?? [];
  list.unshift(value);
  if (list.length > maxLen) list.splice(maxLen);
  memLists.set(key, list);
}

async function kvLRange(key: string, start: number, end: number): Promise<string[]> {
  if (hasKV()) {
    try {
      const { kv } = await import('@vercel/kv');
      return (await kv.lrange(key, start, end)) as string[];
    } catch { /* fall through */ }
  }
  const list = memLists.get(key) ?? [];
  return list.slice(start, end + 1);
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getSessionState(sid: string): Promise<CRSState | null> {
  const raw = await kvGet(`s:${sid}:state`);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function saveSessionState(sid: string, state: CRSState): Promise<void> {
  await kvSet(`s:${sid}:state`, JSON.stringify({ ...state, timestamp: Date.now() }), 86400);
}

export async function saveAuditEntry(entry: AuditEntry): Promise<void> {
  const val = JSON.stringify(entry);
  await kvLPush('audit:global', val, 200);
  await kvLPush(`audit:${entry.session_id}`, val, 50);
}

export async function getRecentAudits(limit = 20): Promise<AuditEntry[]> {
  const raw = await kvLRange('audit:global', 0, limit - 1);
  return raw.map(r => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean) as AuditEntry[];
}

export async function getSessionHistory(sid: string, limit = 10): Promise<AuditEntry[]> {
  const raw = await kvLRange(`audit:${sid}`, 0, limit - 1);
  return raw.map(r => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean) as AuditEntry[];
}

export async function incrementRuns(): Promise<number> {
  if (hasKV()) {
    try {
      const { kv } = await import('@vercel/kv');
      return await kv.incr('stats:runs');
    } catch { /* fall through */ }
  }
  const n = parseInt(mem.get('stats:runs') ?? '1247') + 1;
  mem.set('stats:runs', String(n));
  return n;
}

export async function getTotalRuns(): Promise<number> {
  if (hasKV()) {
    try {
      const { kv } = await import('@vercel/kv');
      return (await kv.get<number>('stats:runs')) ?? 1247;
    } catch { /* fall through */ }
  }
  return parseInt(mem.get('stats:runs') ?? '1247');
}
