// En Cloudflare Workers las variables de entorno vienen de wrangler.toml o del dashboard.
// Con nodejs_compat también funcionan con process.env, pero usamos Env tipado.

export interface Env {
  AUCORSA_BASE_URL?: string;
  AUCORSA_API_BASE_URL?: string;
  AUCORSA_NONCE?: string;
  AUCORSA_USER_AGENT?: string;
  CACHE_TTL_MS?: string;
  DATABASE_URL?: string;
  AUCOURSA_KV?: KVNamespace;
}

export function getConfig(env: Env) {
  return {
    aucorsaBaseUrl: env.AUCORSA_BASE_URL ?? "https://aucorsa.es",
    aucorsaApiBaseUrl: env.AUCORSA_API_BASE_URL ?? "https://lightapi.aucorsa.es",
    aucorsaNonce: env.AUCORSA_NONCE || undefined,
    aucorsaUserAgent:
      env.AUCORSA_USER_AGENT ??
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
    cacheTtlMs: Number(env.CACHE_TTL_MS ?? 15000),
    databaseUrl: env.DATABASE_URL,
    kv: env.AUCOURSA_KV,
  };
}