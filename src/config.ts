import "dotenv/config";

// Varias cuentas AUCORSA, una cookie completa por línea (así no hay que escapar nada
// en el dashboard de Vercel). Si solo hay una cuenta, sigue funcionando con AUCORSA_COOKIE.
function parseCookiePool(): string[] {
  const multi = process.env.AUCORSA_COOKIES;
  if (multi) {
    return multi
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  const single = process.env.AUCORSA_COOKIE;
  return single ? [single] : [];
}

// No lanzamos aquí si falta ninguna cookie: este módulo se carga en el arranque de
// la función serverless, y un throw a nivel de módulo tira abajo TODA la función
// (incluida /health) con un error genérico de la plataforma en vez de un JSON claro.
// La comprobación real vive en aucorsaClient/rutas, donde se puede responder 500 con detalle.
export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL,
  aucorsaBaseUrl: process.env.AUCORSA_BASE_URL ?? "https://aucorsa.es",
  aucorsaCookies: parseCookiePool(),
  aucorsaNonce: process.env.AUCORSA_NONCE || undefined,
  aucorsaUserAgent:
    process.env.AUCORSA_USER_AGENT ??
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
  cacheTtlMs: Number(process.env.CACHE_TTL_MS ?? 15000),
  // Cuánto tiempo se aparta una cuenta del pool tras un fallo de autenticación antes
  // de volver a intentarla.
  sessionCooldownMs: Number(process.env.AUCORSA_SESSION_COOLDOWN_MS ?? 5 * 60 * 1000),
};
