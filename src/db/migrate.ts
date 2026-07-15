import { readFileSync } from "fs";
import { join } from "path";
import { pool } from "./pool";

async function main() {
  if (!pool) {
    console.error("DATABASE_URL no está configurada, no hay nada que migrar.");
    process.exit(1);
  }

  const sql = readFileSync(join(__dirname, "../../db/schema.sql"), "utf-8");
  await pool.query(sql);
  console.log("Migración aplicada correctamente.");
  await pool.end();
}

main().catch((err) => {
  console.error("Error aplicando la migración:", err);
  process.exit(1);
});
