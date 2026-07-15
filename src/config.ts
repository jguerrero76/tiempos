import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Revisa tu archivo .env (mira .env.example).`
    );
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL,
  aucorsaBaseUrl: process.env.AUCORSA_BASE_URL ?? "https://aucorsa.es",
  aucorsaCookie: requireEnv("AUCORSA_COOKIE"),
  aucorsaNonce: process.env.AUCORSA_NONCE || undefined,
  aucorsaUserAgent:
    process.env.AUCORSA_USER_AGENT ??
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
  cacheTtlMs: Number(process.env.CACHE_TTL_MS ?? 15000),
};
