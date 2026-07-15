import { Pool } from "pg";
import { config } from "../config";

// max: 1 porque en un entorno serverless (Vercel) cada instancia de función puede
// crear su propio pool; hay que evitar agotar las conexiones de Postgres cuando
// hay varias instancias concurrentes.
export const pool = config.databaseUrl ? new Pool({ connectionString: config.databaseUrl, max: 1 }) : null;
