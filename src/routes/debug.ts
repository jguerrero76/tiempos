import { Router } from "express";
import { debugNonce } from "../services/aucorsaClient";

// Ruta temporal para diagnosticar la extracción del nonce de AUCORSA contra el HTML
// real de la web (este servidor sí tiene salida a aucorsa.es, a diferencia del
// entorno donde se desarrolló esto). Bórrala una vez resuelto el problema del nonce.
export const debugRouter = Router();

debugRouter.get("/debug/nonce", async (req, res) => {
  const line = typeof req.query.linea === "string" ? req.query.linea : undefined;
  try {
    const info = await debugNonce(line);
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});
