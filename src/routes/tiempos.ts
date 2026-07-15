import { Router } from "express";
import { AucorsaAuthError, fetchEstimations } from "../services/aucorsaClient";
import * as cache from "../services/cache";
import { parseEstimations } from "../services/estimationsParser";

export const tiemposRouter = Router();

function firstQueryValue(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

tiemposRouter.get("/tiempos", async (req, res) => {
  const stopId = firstQueryValue(req.query.parada);
  const line = firstQueryValue(req.query.linea);
  const fresh = firstQueryValue(req.query.fresh) === "1";

  if (!stopId) {
    res.status(400).json({ error: 'El parámetro "parada" es obligatorio' });
    return;
  }

  // El body es el array a secas (mismo contrato que get_stop_times() en el cliente
  // Python de referencia); los metadatos de cache van en cabeceras, no en el body.
  if (!fresh) {
    const memHit = cache.getFromMemory(stopId, line);
    if (memHit) {
      res.set("X-Cache", "HIT");
      res.set("X-Cache-Fetched-At", new Date(memHit.fetchedAt).toISOString());
      res.json(memHit.payload);
      return;
    }
  }

  try {
    const rawHtml = await fetchEstimations({ stopId, line });
    const payload = parseEstimations(String(rawHtml));
    cache.setMemory(stopId, line, payload);
    cache.upsertDb(stopId, line, payload).catch((err) => {
      console.error("No se pudo guardar la respuesta en la cache de base de datos:", err);
    });
    res.set("X-Cache", "MISS");
    res.set("X-Cache-Fetched-At", new Date().toISOString());
    res.json(payload);
  } catch (err) {
    console.error("Error consultando AUCORSA:", err);

    const dbHit = await cache.getFromDb(stopId, line).catch(() => undefined);
    if (dbHit) {
      res.set("X-Cache", "STALE");
      res.set("X-Cache-Fetched-At", new Date(dbHit.fetchedAt).toISOString());
      res.json(dbHit.payload);
      return;
    }

    const status = err instanceof AucorsaAuthError ? 502 : 500;
    res.status(status).json({
      error: "No se pudieron obtener los tiempos de AUCORSA",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});
