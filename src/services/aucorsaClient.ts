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
    priority: "u=1, i",
    "sec-ch-ua": '"Not;A=Brand";v="8", "Chromium";v="150", "Brave";v="150"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-gpc": "1",
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

  // El auto-scrape del nonce es una heurística (buscamos "nonce":"..." en el HTML de
  // la página) que puede coger el nonce equivocado si esa página incrusta varios.
  // Si nos han dado uno a mano (recién copiado del navegador) es más de fiar, así que
  // en el primer intento lo preferimos y solo recurrimos al scraping si no hay uno.
  // Si ese intento falla (403) y se pide forceRefresh, ya no repetimos el mismo valor
  // manual (que sabemos que acaba de fallar): intentamos refrescar por scraping.
  if (!forceRefresh && config.aucorsaNonce) {
    return config.aucorsaNonce;
  }

  const fresh = await fetchFreshNonce(line);
  if (fresh) {
    cachedNonce = fresh;
    nonceFetchedAt = now;
    return fresh;
  }

  if (!forceRefresh && config.aucorsaNonce) {
    return config.aucorsaNonce;
  }

  throw new AucorsaAuthError(
    "No se pudo obtener un nonce de AUCORSA (falló el refresco automático y AUCORSA_NONCE no está configurado, o ya ha caducado)."
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
    const body = await res.text().catch(() => "");
    throw new AucorsaAuthError(
      `AUCORSA rechazó la petición (status ${res.status}). El nonce o la cookie probablemente han caducado. Respuesta de AUCORSA: ${body.slice(0, 500)}`
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`AUCORSA respondió con status ${res.status}. Respuesta: ${body.slice(0, 500)}`);
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
