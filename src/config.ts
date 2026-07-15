import "dotenv/config";

// No lanzamos aquí si falta AUCORSA_COOKIE: este módulo se carga en el arranque de
// la función serverless, y un throw a nivel de módulo tira abajo TODA la función
// (incluida /health) con un error genérico de la plataforma en vez de un JSON claro.
// La comprobación real vive en aucorsaClient/rutas, donde se puede responder 500 con detalle.
export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL,
  aucorsaBaseUrl: process.env.AUCORSA_BASE_URL ?? "https://aucorsa.es",
  aucorsaCookie: process.env.AUCORSA_COOKIE || undefined,
  aucorsaNonce: process.env.AUCORSA_NONCE || undefined,
  aucorsaUserAgent:
    process.env.AUCORSA_USER_AGENT ??
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
  cacheTtlMs: Number(process.env.CACHE_TTL_MS ?? 15000),
};
