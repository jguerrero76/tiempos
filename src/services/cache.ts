interface MemoryEntry {
  payload: unknown;
  fetchedAt: number;
}

const memoryCache = new Map<string, MemoryEntry>();

function cacheKey(stopId: string, line?: string): string {
  return `${stopId}:${line ?? ""}`;
}

export function getFromMemory(stopId: string, line: string | undefined, cacheTtlMs: number): MemoryEntry | undefined {
  const entry = memoryCache.get(cacheKey(stopId, line));
  if (!entry) return undefined;
  if (Date.now() - entry.fetchedAt > cacheTtlMs) return undefined;
  return entry;
}

export function setMemory(stopId: string, line: string | undefined, payload: unknown): void {
  memoryCache.set(cacheKey(stopId, line), { payload, fetchedAt: Date.now() });
}