import { Router } from "express";
import { AucorsaAuthError, fetchEstimations } from "../services/aucorsaClient";
import * as cache from "../services/cache";

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

  if (!fresh) {
    const memHit = cache.getFromMemory(stopId, line);
    if (memHit) {
      res.json({
        data: memHit.payload,
        cached: true,
        source: "memory",
        fetchedAt: new Date(memHit.fetchedAt).toISOString(),
      });
      return;
    }
  }

  try {
    const payload = await fetchEstimations({ stopId, line });
    cache.setMemory(stopId, line, payload);
    cache.upsertDb(stopId, line, payload).catch((err) => {
      console.error("No se pudo guardar la respuesta en la cache de base de datos:", err);
    });
    res.json({ data: payload, cached: false, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error("Error consultando AUCORSA:", err);

    const dbHit = await cache.getFromDb(stopId, line).catch(() => undefined);
    if (dbHit) {
      res.json({
        data: dbHit.payload,
        cached: true,
        stale: true,
        source: "db",
        fetchedAt: dbHit.fetchedAt,
      });
      return;
    }

    const status = err instanceof AucorsaAuthError ? 502 : 500;
    res.status(status).json({
      error: "No se pudieron obtener los tiempos de AUCORSA",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});
