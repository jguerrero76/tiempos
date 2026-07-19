// Configuración unificada: compatible con Cloudflare Workers (c.env) y Vercel (process.env)

export interface Env {
  AUCORSA_BASE_URL?: string;
  AUCORSA_API_BASE_URL?: string;
  AUCORSA_NONCE?: string;
  AUCORSA_USER_AGENT?: string;
  CACHE_TTL_MS?: string;
}

export interface AppConfig {
  aucorsaBaseUrl: string;
  aucorsaApiBaseUrl: string;
  aucorsaNonce?: string;
  aucorsaUserAgent: string;
  cacheTtlMs: number;
}

/**
 * Obtiene configuración desde bindings de Cloudflare Workers o process.env (Vercel).
 * Si no hay bindings (Vercel), usa process.env como fallback.
 */
export function getConfig(env?: Env): AppConfig {
  return {
    aucorsaBaseUrl: env?.AUCORSA_BASE_URL ?? process.env.AUCORSA_BASE_URL ?? "https://aucorsa.es",
    aucorsaApiBaseUrl: env?.AUCORSA_API_BASE_URL ?? process.env.AUCORSA_API_BASE_URL ?? "https://lightapi.aucorsa.es",
    aucorsaNonce: env?.AUCORSA_NONCE || process.env.AUCORSA_NONCE || undefined,
    aucorsaUserAgent:
      env?.AUCORSA_USER_AGENT ??
      process.env.AUCORSA_USER_AGENT ??
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
    cacheTtlMs: Number(env?.CACHE_TTL_MS ?? process.env.CACHE_TTL_MS ?? 15000),
  };
}