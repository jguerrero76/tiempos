import { config } from "../config";

// aucorsa.es usa el theme/builder Bricks, que expone en el HTML VARIOS nonces
// distintos en el mismo objeto: "nonce" (propio de Bricks, rutas bricks/v1),
// "formNonce" (formularios), "wpRestNonce" (la acción 'wp_rest' de WP core) y
// "ajax_nonce" (en el objeto `ajax_vars`). Confirmado en vivo: el propio JS de la
// página construye la petición real con `ajax_vars.ajax_nonce` (ver el <script> que
// devuelve el propio endpoint de estimaciones), así que ese es el que hay que imitar;
// en la práctica coincide con wpRestNonce, pero si algún día dejan de coincidir,
// ajax_nonce es la fuente de verdad porque es literalmente lo que usa el sitio.
const AJAX_NONCE_REGEX = /"ajax_nonce"\s*:\s*"([a-f0-9]+)"/i;
const WP_REST_NONCE_REGEX = /"wpRestNonce"\s*:\s*"([a-f0-9]+)"/i;
// Fallback por si estas claves cambian de nombre en el futuro: el objeto estándar que
// WordPress core genera al encolar el script "wp-api-request".
const WP_API_SETTINGS_REGEX = /wpApiSettings\s*=\s*(\{[\s\S]*?\});/;
// Último recurso: cualquier "nonce":"..", puede coger el de otro plugin.
const GENERIC_NONCE_REGEX = /"nonce"\s*:\s*"([a-f0-9]+)"/i;
const NONCE_TTL_MS = 10 * 60 * 1000;

export class AucorsaAuthError extends Error {}

// Los tiempos de llegada son públicos: no hace falta iniciar sesión (comprobado en
// incógnito), así que estas peticiones son anónimas, igual que cualquier visitante sin
// cuenta. No se envía ninguna cookie de usuario.
let cachedNonce: string | undefined;
let nonceFetchedAt = 0;

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
    "x-requested-with": "XMLHttpRequest",
  };
}

function extractNonce(html: string): string | undefined {
  const ajaxNonceMatch = html.match(AJAX_NONCE_REGEX);
  if (ajaxNonceMatch) return ajaxNonceMatch[1];

  const wpRestMatch = html.match(WP_REST_NONCE_REGEX);
  if (wpRestMatch) return wpRestMatch[1];

  const apiSettingsMatch = html.match(WP_API_SETTINGS_REGEX);
  if (apiSettingsMatch) {
    try {
      const parsed = JSON.parse(apiSettingsMatch[1]);
      if (typeof parsed.nonce === "string") return parsed.nonce;
    } catch {
      // el objeto no era JSON válido, seguimos con el fallback genérico
    }
  }

  const genericMatch = html.match(GENERIC_NONCE_REGEX);
  return genericMatch?.[1];
}

async function fetchPageHtml(line?: string): Promise<{ status: number; html: string }> {
  const path = line ? `/linea/${encodeURIComponent(line)}/` : "/";
  const res = await fetch(`${config.aucorsaBaseUrl}${path}`, {
    headers: baseHeaders(),
  });
  return { status: res.status, html: await res.text() };
}

async function fetchFreshNonce(line?: string): Promise<string | undefined> {
  try {
    const { status, html } = await fetchPageHtml(line);
    if (status < 200 || status >= 300) return undefined;
    return extractNonce(html);
  } catch {
    return undefined;
  }
}

async function getNonce(line: string | undefined, forceRefresh: boolean): Promise<string> {
  const now = Date.now();
  if (!forceRefresh && cachedNonce && now - nonceFetchedAt < NONCE_TTL_MS) {
    return cachedNonce;
  }

  // El auto-scrape del nonce es una heurística (buscamos "ajax_nonce"/"wpRestNonce" en
  // el HTML de la página) que en el primer intento se prefiere sobre un valor fijo, y
  // solo recurrimos al valor manual (AUCORSA_NONCE) si el scraping falla.
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
      `AUCORSA rechazó la petición (status ${res.status}). Respuesta completa: ${body.slice(0, 3000)}`
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`AUCORSA respondió con status ${res.status}. Respuesta completa: ${body.slice(0, 3000)}`);
  }

  // AUCORSA normalmente envuelve el fragmento HTML como un string JSON
  // (`"<div>...</div>"`), pero no siempre: a veces el body ya es el HTML sin envolver,
  // o un objeto distinto. Igual que el cliente de referencia: si al parsear como JSON
  // no sale un string, nos quedamos con el texto crudo tal cual.
  const bodyText = await res.text();
  try {
    const parsed = JSON.parse(bodyText);
    if (typeof parsed === "string") return parsed;
  } catch {
    // no era JSON válido, usamos el texto tal cual
  }
  return bodyText;
}

export async function fetchEstimations({ stopId, line }: EstimationsParams): Promise<unknown> {
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
