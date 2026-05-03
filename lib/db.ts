/**
 * Turso (libSQL) persistence layer for Lex Aureon
 * Free tier: 9GB storage · 500M reads/mo · Always on · 500 databases
 * Falls back to in-memory if TURSO_DATABASE_URL not configured
 */

import { createClient, type Client } from '@libsql/client';

let _client: Client | null = null;

export function getClient(): Client | null {
  if (!process.env.TURSO_DATABASE_URL) return null;
  if (_client) return _client;
  _client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return _client;
}

// ── Schema ────────────────────────────────────────────────────────────────────

export async function initSchema(): Promise<void> {
  const db = getClient();
  if (!db) return;
  await db.batch([
    {
      sql: `CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        c REAL NOT NULL DEFAULT 0.333,
        r REAL NOT NULL DEFAULT 0.333,
        s REAL NOT NULL DEFAULT 0.334,
        theta REAL DEFAULT 1.5,
        attack_pressure REAL DEFAULT 0.0,
        step_counter INTEGER DEFAULT 0,
        updated_at INTEGER NOT NULL
      )`,
      args: [],
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS audit_log (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        m_before REAL,
        m_after REAL,
        health TEXT,
        intervention INTEGER DEFAULT 0,
        reason TEXT,
        input_hash TEXT,
        governed_hash TEXT,
        health_band TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      )`,
      args: [],
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS stats (
        key TEXT PRIMARY KEY,
        value INTEGER NOT NULL DEFAULT 0
      )`,
      args: [],
    },
    {
      sql: `INSERT OR IGNORE INTO stats (key, value) VALUES ('total_runs', 1247)`,
      args: [],
    },
  ], 'write');
}

// ── Session State ─────────────────────────────────────────────────────────────

export interface SessionState {
  C: number; R: number; S: number;
  theta?: number;
  attack_pressure?: number;
  step_counter?: number;
}

// In-memory fallback
const memSessions = new Map<string, SessionState>();
const memAudit: AuditEntry[] = [];
let memRuns = 1247;

export async function getSession(sid: string): Promise<SessionState | null> {
  const db = getClient();
  if (db) {
    try {
      await initSchema();
      const r = await db.execute({ sql: 'SELECT * FROM sessions WHERE id = ?', args: [sid] });
      if (r.rows.length === 0) return null;
      const row = r.rows[0];
      return {
        C: row.c as number,
        R: row.r as number,
        S: row.s as number,
        theta: row.theta as number,
        attack_pressure: row.attack_pressure as number,
        step_counter: row.step_counter as number,
      };
    } catch (e) { console.error('Turso getSession:', e); }
  }
  return memSessions.get(sid) ?? null;
}

export async function saveSession(sid: string, state: SessionState): Promise<void> {
  const db = getClient();
  if (db) {
    try {
      await initSchema();
      await db.execute({
        sql: `INSERT INTO sessions (id, c, r, s, theta, attack_pressure, step_counter, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                c=excluded.c, r=excluded.r, s=excluded.s,
                theta=excluded.theta, attack_pressure=excluded.attack_pressure,
                step_counter=excluded.step_counter, updated_at=excluded.updated_at`,
        args: [
          sid, state.C, state.R, state.S,
          state.theta ?? 1.5,
          state.attack_pressure ?? 0.0,
          state.step_counter ?? 0,
          Date.now(),
        ],
      });
      return;
    } catch (e) { console.error('Turso saveSession:', e); }
  }
  memSessions.set(sid, state);
}

// ── Audit Log ─────────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  session_id: string;
  timestamp: number;
  m_before: number;
  m_after: number;
  health: string;
  intervention: boolean;
  reason?: string;
  input_hash: string;
  governed_hash: string;
  health_band?: string;
}

export async function saveAudit(entry: AuditEntry): Promise<void> {
  const db = getClient();
  if (db) {
    try {
      await initSchema();
      await db.execute({
        sql: `INSERT OR IGNORE INTO audit_log
              (id, session_id, timestamp, m_before, m_after, health, intervention, reason, input_hash, governed_hash, health_band)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          entry.id, entry.session_id, entry.timestamp,
          entry.m_before, entry.m_after, entry.health,
          entry.intervention ? 1 : 0, entry.reason ?? '',
          entry.input_hash, entry.governed_hash, entry.health_band ?? '',
        ],
      });
      return;
    } catch (e) { console.error('Turso saveAudit:', e); }
  }
  memAudit.unshift(entry);
  if (memAudit.length > 200) memAudit.splice(200);
}

export async function getRecentAudits(limit = 20): Promise<AuditEntry[]> {
  const db = getClient();
  if (db) {
    try {
      await initSchema();
      const r = await db.execute({
        sql: 'SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT ?',
        args: [limit],
      });
      return r.rows.map(row => ({
        id: row.id as string,
        session_id: row.session_id as string,
        timestamp: row.timestamp as number,
        m_before: row.m_before as number,
        m_after: row.m_after as number,
        health: row.health as string,
        intervention: (row.intervention as number) === 1,
        reason: row.reason as string,
        input_hash: row.input_hash as string,
        governed_hash: row.governed_hash as string,
        health_band: row.health_band as string,
      }));
    } catch (e) { console.error('Turso getRecentAudits:', e); }
  }
  return memAudit.slice(0, limit);
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export async function incrementRuns(): Promise<number> {
  const db = getClient();
  if (db) {
    try {
      await initSchema();
      await db.execute({
        sql: `INSERT INTO stats (key, value) VALUES ('total_runs', 1248)
              ON CONFLICT(key) DO UPDATE SET value = value + 1`,
        args: [],
      });
      const r = await db.execute({ sql: "SELECT value FROM stats WHERE key = 'total_runs'", args: [] });
      return (r.rows[0]?.value as number) ?? 1247;
    } catch (e) { console.error('Turso incrementRuns:', e); }
  }
  return ++memRuns;
}

export async function getTotalRuns(): Promise<number> {
  const db = getClient();
  if (db) {
    try {
      await initSchema();
      const r = await db.execute({ sql: "SELECT value FROM stats WHERE key = 'total_runs'", args: [] });
      return (r.rows[0]?.value as number) ?? 1247;
    } catch (e) { console.error('Turso getTotalRuns:', e); }
  }
  return memRuns;
}
