import { config } from "../config";

// El nonce viene incrustado por WordPress en el HTML de la web (wp_localize_script).
// No conocemos el nombre exacto de la variable, así que buscamos cualquier campo
// "nonce":"..." en el HTML devuelto.
const NONCE_REGEX = /"nonce"\s*:\s*"([a-f0-9]+)"/i;
const NONCE_TTL_MS = 10 * 60 * 1000;

let cachedNonce: string | undefined;
let nonceFetchedAt = 0;

export class AucorsaAuthError extends Error {}
export class AucorsaConfigError extends Error {}

function requireCookie(): string {
  if (!config.aucorsaCookie) {
    throw new AucorsaConfigError(
      "Falta la variable de entorno AUCORSA_COOKIE. Configúrala en tu .env (local) o en las Environment Variables del proyecto en Vercel y vuelve a desplegar."
    );
  }
  return config.aucorsaCookie;
}

function baseHeaders(): Record<string, string> {
  return {
    accept: "*/*",
    "accept-language": "es-ES,es;q=0.6",
    "cache-control": "no-cache",
    pragma: "no-cache",
    "user-agent": config.aucorsaUserAgent,
    cookie: requireCookie(),
    "x-requested-with": "XMLHttpRequest",
  };
}

async function fetchFreshNonce(line?: string): Promise<string | undefined> {
  try {
    const path = line ? `/linea/${encodeURIComponent(line)}/` : "/";
    const res = await fetch(`${config.aucorsaBaseUrl}${path}`, {
      headers: baseHeaders(),
    });
    if (!res.ok) return undefined;
    const html = await res.text();
    const match = html.match(NONCE_REGEX);
    return match?.[1];
  } catch {
    return undefined;
  }
}

async function getNonce(line: string | undefined, forceRefresh: boolean): Promise<string> {
  const now = Date.now();
  if (!forceRefresh && cachedNonce && now - nonceFetchedAt < NONCE_TTL_MS) {
    return cachedNonce;
  }

  const fresh = await fetchFreshNonce(line);
  if (fresh) {
    cachedNonce = fresh;
    nonceFetchedAt = now;
    return fresh;
  }

  if (config.aucorsaNonce) {
    return config.aucorsaNonce;
  }

  throw new AucorsaAuthError(
    "No se pudo obtener un nonce de AUCORSA (falló el refresco automático y AUCORSA_NONCE no está configurado)."
  );
}

export interface EstimationsParams {
  stopId: string;
  line?: string;
}

async function requestEstimations(stopId: string, line: string | undefined, nonce: string): Promise<unknown> {
  const url = new URL(`${config.aucorsaBaseUrl}/wp-json/aucorsa/v1/estimations/stop`);
  url.searchParams.set("line", "");
  url.searchParams.set("current_line", line ?? "");
  url.searchParams.set("stop_id", stopId);
  url.searchParams.set("_wpnonce", nonce);

  const res = await fetch(url.toString(), {
    headers: {
      ...baseHeaders(),
      referer: line
        ? `${config.aucorsaBaseUrl}/linea/${encodeURIComponent(line)}/`
        : config.aucorsaBaseUrl,
    },
  });

  if (res.status === 401 || res.status === 403) {
    throw new AucorsaAuthError(
      `AUCORSA rechazó la petición (status ${res.status}). El nonce o la cookie probablemente han caducado.`
    );
  }

  if (!res.ok) {
    throw new Error(`AUCORSA respondió con status ${res.status}`);
  }

  return res.json();
}

export async function fetchEstimations({ stopId, line }: EstimationsParams): Promise<unknown> {
  requireCookie(); // falla rápido y con un mensaje claro si falta config, antes de intentar el nonce

  const nonce = await getNonce(line, false);

  try {
    return await requestEstimations(stopId, line, nonce);
  } catch (err) {
    if (!(err instanceof AucorsaAuthError)) throw err;

    // El nonce cacheado puede haber caducado justo ahora: invalidamos y reintentamos una vez.
    cachedNonce = undefined;
    const refreshedNonce = await getNonce(line, true);
    return await requestEstimations(stopId, line, refreshedNonce);
  }
}
