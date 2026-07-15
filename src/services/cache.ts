import { config } from "../config";
import { pool } from "../db/pool";

interface MemoryEntry {
  payload: unknown;
  fetchedAt: number;
}

const memoryCache = new Map<string, MemoryEntry>();

function cacheKey(stopId: string, line?: string): string {
  return `${stopId}:${line ?? ""}`;
}

export function getFromMemory(stopId: string, line?: string): MemoryEntry | undefined {
  const entry = memoryCache.get(cacheKey(stopId, line));
  if (!entry) return undefined;
  if (Date.now() - entry.fetchedAt > config.cacheTtlMs) return undefined;
  return entry;
}

export function setMemory(stopId: string, line: string | undefined, payload: unknown): void {
  memoryCache.set(cacheKey(stopId, line), { payload, fetchedAt: Date.now() });
}

export interface DbEntry {
  payload: unknown;
  fetchedAt: string;
}

export async function getFromDb(stopId: string, line?: string): Promise<DbEntry | undefined> {
  if (!pool) return undefined;
  const { rows } = await pool.query(
    "SELECT payload, fetched_at FROM estimation_cache WHERE stop_id = $1 AND line = $2",
    [stopId, line ?? ""]
  );
  const row = rows[0];
  if (!row) return undefined;
  return { payload: row.payload, fetchedAt: row.fetched_at };
}

export async function upsertDb(stopId: string, line: string | undefined, payload: unknown): Promise<void> {
  if (!pool) return;
  await pool.query(
    `INSERT INTO estimation_cache (stop_id, line, payload, fetched_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (stop_id, line) DO UPDATE SET payload = EXCLUDED.payload, fetched_at = now()`,
    [stopId, line ?? "", payload]
  );
}
