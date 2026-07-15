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
export class AucorsaConfigError extends Error {}

// Una "sesión" = una cuenta AUCORSA (su cookie), con su propio nonce cacheado y su
// propio estado de salud. El nonce está atado a la sesión de WordPress, así que no se
// puede compartir entre cuentas: cada una necesita su propio ciclo de refresco.
interface Session {
  cookie: string;
  cachedNonce?: string;
  nonceFetchedAt: number;
  unhealthyUntil: number;
}

let sessions: Session[] = [];
let sessionsSourceLength = -1;
let roundRobinIndex = 0;

// Reconstruye el pool si cambia la config (relevante sobre todo en tests/dev con
// reinicios en caliente; en producción se calcula una sola vez por instancia fría).
function getSessions(): Session[] {
  if (sessionsSourceLength !== config.aucorsaCookies.length) {
    sessions = config.aucorsaCookies.map((cookie) => ({
      cookie,
      nonceFetchedAt: 0,
      unhealthyUntil: 0,
    }));
    sessionsSourceLength = config.aucorsaCookies.length;
    roundRobinIndex = 0;
  }
  return sessions;
}

function requireSessions(): Session[] {
  const pool = getSessions();
  if (pool.length === 0) {
    throw new AucorsaConfigError(
      "Falta configurar al menos una cuenta de AUCORSA. Define AUCORSA_COOKIE (una cuenta) o AUCORSA_COOKIES " +
        "(varias, una cookie completa por línea) en tu .env o en las Environment Variables del proyecto en Vercel, y vuelve a desplegar."
    );
  }
  return pool;
}

// Round-robin saltándose las cuentas en cooldown (403 reciente). Si todas están en
// cooldown, probamos igualmente con la siguiente del turno: mejor un intento con una
// cuenta "quemada" que fallar sin ni siquiera intentarlo.
function pickSessionIndex(pool: Session[]): number {
  const now = Date.now();
  for (let i = 0; i < pool.length; i++) {
    const idx = (roundRobinIndex + i) % pool.length;
    if (pool[idx].unhealthyUntil <= now) {
      roundRobinIndex = (idx + 1) % pool.length;
      return idx;
    }
  }
  const idx = roundRobinIndex % pool.length;
  roundRobinIndex = (idx + 1) % pool.length;
  return idx;
}

function markUnhealthy(session: Session): void {
  session.unhealthyUntil = Date.now() + config.sessionCooldownMs;
  session.cachedNonce = undefined;
}

function baseHeaders(session: Session): Record<string, string> {
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
    cookie: session.cookie,
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

async function fetchPageHtml(session: Session, line?: string): Promise<{ status: number; html: string }> {
  const path = line ? `/linea/${encodeURIComponent(line)}/` : "/";
  const res = await fetch(`${config.aucorsaBaseUrl}${path}`, {
    headers: baseHeaders(session),
  });
  return { status: res.status, html: await res.text() };
}

async function fetchFreshNonce(session: Session, line?: string): Promise<string | undefined> {
  try {
    const { status, html } = await fetchPageHtml(session, line);
    if (status < 200 || status >= 300) return undefined;
    return extractNonce(html);
  } catch {
    return undefined;
  }
}

async function getNonce(session: Session, line: string | undefined, forceRefresh: boolean): Promise<string> {
  const now = Date.now();
  if (!forceRefresh && session.cachedNonce && now - session.nonceFetchedAt < NONCE_TTL_MS) {
    return session.cachedNonce;
  }

  // El auto-scrape del nonce es una heurística (buscamos "nonce":"..." en el HTML de
  // la página) que puede coger el nonce equivocado si esa página incrusta varios.
  // Si nos han dado uno a mano (recién copiado del navegador) es más de fiar, así que
  // en el primer intento lo preferimos y solo recurrimos al scraping si no hay uno.
  // Si ese intento falla (403) y se pide forceRefresh, ya no repetimos el mismo valor
  // manual (que sabemos que acaba de fallar): intentamos refrescar por scraping.
  // (El AUCORSA_NONCE manual solo tiene sentido con una única cuenta.)
  if (!forceRefresh && config.aucorsaNonce) {
    return config.aucorsaNonce;
  }

  const fresh = await fetchFreshNonce(session, line);
  if (fresh) {
    session.cachedNonce = fresh;
    session.nonceFetchedAt = now;
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

async function requestEstimations(
  session: Session,
  stopId: string,
  line: string | undefined,
  nonce: string
): Promise<unknown> {
  const url = new URL(`${config.aucorsaBaseUrl}/wp-json/aucorsa/v1/estimations/stop`);
  url.searchParams.set("line", "");
  url.searchParams.set("current_line", line ?? "");
  url.searchParams.set("stop_id", stopId);
  url.searchParams.set("_wpnonce", nonce);

  const res = await fetch(url.toString(), {
    headers: {
      ...baseHeaders(session),
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

async function fetchWithSession(session: Session, stopId: string, line: string | undefined): Promise<unknown> {
  const nonce = await getNonce(session, line, false);

  try {
    return await requestEstimations(session, stopId, line, nonce);
  } catch (err) {
    if (!(err instanceof AucorsaAuthError)) throw err;

    // El nonce cacheado puede haber caducado justo ahora: invalidamos y reintentamos
    // una vez con esta misma cuenta antes de darla por mala.
    session.cachedNonce = undefined;
    const refreshedNonce = await getNonce(session, line, true);
    return await requestEstimations(session, stopId, line, refreshedNonce);
  }
}

// Reparte las peticiones entre todas las cuentas configuradas por turno (round-robin),
// para no concentrar todo el tráfico de la web bajo una sola sesión/IP de AUCORSA. Si
// una cuenta falla la autenticación, se aparta unos minutos (AUCORSA_SESSION_COOLDOWN_MS)
// y se reintenta con la siguiente antes de dar el error por definitivo.
export async function fetchEstimations({ stopId, line }: EstimationsParams): Promise<unknown> {
  const pool = requireSessions();
  const attempts = Math.min(pool.length, 3);
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const idx = pickSessionIndex(pool);
    const session = pool[idx];
    try {
      return await fetchWithSession(session, stopId, line);
    } catch (err) {
      lastError = err;
      if (err instanceof AucorsaAuthError) {
        markUnhealthy(session);
        continue;
      }
      throw err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
