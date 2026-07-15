import "dotenv/config";

// Los tiempos de llegada son datos públicos: aucorsa.es los muestra igual sin haber
// iniciado sesión (comprobado directamente en incógnito), así que esta API consulta
// AUCORSA de forma anónima, sin cookies de usuario ni cuentas que mantener.
export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL,
  aucorsaBaseUrl: process.env.AUCORSA_BASE_URL ?? "https://aucorsa.es",
  // Fallback manual si el refresco automático del nonce alguna vez falla (ver
  // aucorsaClient.ts). No hace falta en el uso normal.
  aucorsaNonce: process.env.AUCORSA_NONCE || undefined,
  aucorsaUserAgent:
    process.env.AUCORSA_USER_AGENT ??
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
  cacheTtlMs: Number(process.env.CACHE_TTL_MS ?? 15000),
};
