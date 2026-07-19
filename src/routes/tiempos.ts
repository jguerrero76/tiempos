import { Hono } from "hono";
import { Env, getConfig } from "../config";
import { AucorsaAuthError, fetchEstimations } from "../services/aucorsaClient";
import { parseStopResponse, StopResponse } from "../services/estimationsParser";
import { getFromMemory, setMemory } from "../services/cache";

export const tiemposRouter = new Hono<{ Bindings: Env }>();

tiemposRouter.get("/tiempos", async (c) => {
  const config = getConfig(c.env);
  const stopId = c.req.query("parada");
  const line = c.req.query("linea") || undefined;
  const fresh = c.req.query("fresh") === "1";

  if (!stopId) {
    return c.json({ error: 'El parámetro "parada" es obligatorio' }, 400);
  }

  if (!fresh) {
    const memHit = getFromMemory(stopId, line, config.cacheTtlMs);
    if (memHit) {
      return c.json({ ...(memHit.payload as StopResponse), stale: false });
    }
  }

  try {
    const rawHtml = await fetchEstimations({ stopId, line, config });
    const payload = parseStopResponse(String(rawHtml), stopId);
    setMemory(stopId, line, payload);
    return c.json({ ...payload, stale: false });
  } catch (err: unknown) {
    console.error("Error consultando AUCORSA:", err);

    // Sin base de datos, devolvemos error directamente
    const status = err instanceof AucorsaAuthError ? 502 : 500;
    return c.json(
      {
        error: "No se pudieron obtener los tiempos de AUCORSA",
        detail: err instanceof Error ? err.message : String(err),
      },
      status
    );
  }
});