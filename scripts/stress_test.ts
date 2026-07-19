/**
 * Prueba de peticiones a AUCORSA durante 30 minutos.
 * Hace una petición cada ~30 segundos y registra:
 * - Status code
 * - Tiempo de respuesta
 * - Perfil de navegador usado
 * - Errores
 * - Fragmento de respuesta
 */

import { fetchEstimations, AucorsaAuthError } from "../src/services/aucorsaClient";
import { getRandomProfile } from "../src/services/browserProfiles";
import * as fs from "fs";
import * as path from "path";

const DURATION_MS = 30 * 60 * 1000; // 30 minutos
const INTERVAL_MS = 30_000; // cada 30 segundos
const LOG_FILE = path.join(__dirname, "..", "stress_test_results.jsonl");
const SUMMARY_FILE = path.join(__dirname, "..", "stress_test_summary.json");

interface TestResult {
  timestamp: string;
  elapsed: number;
  stopId: string;
  line: string;
  profile: string;
  status: "ok" | "auth_error" | "error";
  responseTimeMs: number;
  responsePreview: string;
  errorMessage?: string;
}

const STOPS = [
  { stopId: "1", line: "7" },
  { stopId: "2", line: "7" },
  { stopId: "3", line: "7" },
  { stopId: "4", line: "7" },
  { stopId: "5", line: "7" },
  { stopId: "6", line: "7" },
  { stopId: "7", line: "7" },
  { stopId: "8", line: "7" },
  { stopId: "9", line: "7" },
  { stopId: "10", line: "7" },
  { stopId: "11", line: "7" },
  { stopId: "12", line: "7" },
  { stopId: "13", line: "7" },
  { stopId: "14", line: "7" },
  { stopId: "15", line: "7" },
  { stopId: "16", line: "7" },
  { stopId: "17", line: "7" },
  { stopId: "18", line: "7" },
  { stopId: "19", line: "7" },
  { stopId: "20", line: "7" },
  { stopId: "21", line: "7" },
  { stopId: "22", line: "7" },
  { stopId: "23", line: "7" },
  { stopId: "24", line: "7" },
  { stopId: "25", line: "7" },
  { stopId: "26", line: "7" },
  { stopId: "27", line: "7" },
  { stopId: "28", line: "7" },
  { stopId: "29", line: "7" },
  { stopId: "30", line: "7" },
  { stopId: "31", line: "7" },
  { stopId: "32", line: "7" },
  { stopId: "33", line: "7" },
  { stopId: "34", line: "7" },
  { stopId: "35", line: "7" },
  { stopId: "36", line: "7" },
  { stopId: "37", line: "7" },
  { stopId: "38", line: "7" },
  { stopId: "39", line: "7" },
  { stopId: "40", line: "7" },
  { stopId: "41", line: "7" },
  { stopId: "42", line: "7" },
  { stopId: "43", line: "7" },
  { stopId: "44", line: "7" },
  { stopId: "45", line: "7" },
  { stopId: "46", line: "7" },
  { stopId: "47", line: "7" },
  { stopId: "48", line: "7" },
  { stopId: "49", line: "7" },
  { stopId: "50", line: "7" },
  { stopId: "51", line: "7" },
  { stopId: "52", line: "7" },
  { stopId: "53", line: "7" },
  { stopId: "54", line: "7" },
  { stopId: "55", line: "7" },
  { stopId: "56", line: "7" },
  { stopId: "57", line: "7" },
  { stopId: "58", line: "7" },
  { stopId: "59", line: "7" },
  { stopId: "60", line: "7" },
  { stopId: "61", line: "7" },
  { stopId: "62", line: "7" },
  { stopId: "63", line: "7" },
  { stopId: "64", line: "7" },
  { stopId: "65", line: "7" },
  { stopId: "66", line: "7" },
  { stopId: "67", line: "7" },
  { stopId: "68", line: "7" },
  { stopId: "69", line: "7" },
  { stopId: "70", line: "7" },
  { stopId: "71", line: "7" },
  { stopId: "72", line: "7" },
  { stopId: "73", line: "7" },
  { stopId: "74", line: "7" },
  { stopId: "75", line: "7" },
  { stopId: "76", line: "7" },
  { stopId: "77", line: "7" },
  { stopId: "78", line: "7" },
  { stopId: "79", line: "7" },
  { stopId: "80", line: "7" },
  { stopId: "81", line: "7" },
  { stopId: "82", line: "7" },
  { stopId: "83", line: "7" },
  { stopId: "84", line: "7" },
  { stopId: "85", line: "7" },
  { stopId: "86", line: "7" },
  { stopId: "87", line: "7" },
  { stopId: "88", line: "7" },
  { stopId: "89", line: "7" },
  { stopId: "90", line: "7" },
  { stopId: "91", line: "7" },
  { stopId: "92", line: "7" },
  { stopId: "93", line: "7" },
  { stopId: "94", line: "7" },
  { stopId: "95", line: "7" },
  { stopId: "96", line: "7" },
  { stopId: "97", line: "7" },
  { stopId: "98", line: "7" },
  { stopId: "99", line: "7" },
  { stopId: "100", line: "7" },
];

let requestCount = 0;
let okCount = 0;
let authErrorCount = 0;
let otherErrorCount = 0;
let totalResponseTime = 0;
let minResponseTime = Infinity;
let maxResponseTime = 0;

function pickRandomStop(): { stopId: string; line: string } {
  return STOPS[Math.floor(Math.random() * STOPS.length)];
}

async function makeRequest(): Promise<void> {
  const stop = pickRandomStop();
  const profile = getRandomProfile();
  const startTime = Date.now();

  try {
    const result = await fetchEstimations({ stopId: stop.stopId, line: stop.line });
    const responseTime = Date.now() - startTime;
    const preview = typeof result === "string" ? result.substring(0, 150) : JSON.stringify(result).substring(0, 150);

    const entry: TestResult = {
      timestamp: new Date().toISOString(),
      elapsed: Date.now() - startTime,
      stopId: stop.stopId,
      line: stop.line,
      profile: profile.name,
      status: "ok",
      responseTimeMs: responseTime,
      responsePreview: preview,
    };

    okCount++;
    totalResponseTime += responseTime;
    minResponseTime = Math.min(minResponseTime, responseTime);
    maxResponseTime = Math.max(maxResponseTime, responseTime);

    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n");
    console.log(`[OK] #${requestCount} | parada=${stop.stopId} línea=${stop.line} | ${responseTime}ms | perfil=${profile.name}`);
  } catch (err) {
    const responseTime = Date.now() - startTime;
    const isAuth = err instanceof AucorsaAuthError;

    const entry: TestResult = {
      timestamp: new Date().toISOString(),
      elapsed: Date.now() - startTime,
      stopId: stop.stopId,
      line: stop.line,
      profile: profile.name,
      status: isAuth ? "auth_error" : "error",
      responseTimeMs: responseTime,
      responsePreview: "",
      errorMessage: err instanceof Error ? err.message : String(err),
    };

    if (isAuth) authErrorCount++;
    else otherErrorCount++;

    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n");
    console.log(`[${isAuth ? "AUTH_ERR" : "ERR"}] #${requestCount} | parada=${stop.stopId} línea=${stop.line} | ${responseTime}ms | ${entry.errorMessage?.substring(0, 200)}`);
  }
}

async function run() {
  console.log("=".repeat(80));
  console.log("PRUEBA DE ESTRÉS AUCORSA - 30 MINUTOS");
  console.log(`Inicio: ${new Date().toISOString()}`);
  console.log(`Duración: ${DURATION_MS / 1000}s | Intervalo: ${INTERVAL_MS / 1000}s`);
  console.log("=".repeat(80));
  console.log("");

  // Limpiar logs anteriores
  if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);

  const startTime = Date.now();

  // Primera petición inmediata
  requestCount++;
  await makeRequest();

  // Peticiones periódicas
  const interval = setInterval(async () => {
    requestCount++;
    await makeRequest();

    const elapsed = Date.now() - startTime;
    if (elapsed >= DURATION_MS) {
      clearInterval(interval);

      const finalElapsed = Date.now() - startTime;
      const summary = {
        durationSeconds: Math.round(finalElapsed / 1000),
        totalRequests: requestCount,
        ok: okCount,
        authErrors: authErrorCount,
        otherErrors: otherErrorCount,
        successRate: `${((okCount / requestCount) * 100).toFixed(1)}%`,
        avgResponseTimeMs: requestCount > 0 ? Math.round(totalResponseTime / requestCount) : 0,
        minResponseTimeMs: minResponseTime === Infinity ? 0 : minResponseTime,
        maxResponseTimeMs: maxResponseTime,
        endTime: new Date().toISOString(),
      };

      fs.writeFileSync(SUMMARY_FILE, JSON.stringify(summary, null, 2));
      console.log("");
      console.log("=".repeat(80));
      console.log("PRUEBA COMPLETADA");
      console.log(JSON.stringify(summary, null, 2));
      console.log("=".repeat(80));
      console.log(`Resultados guardados en:`);
      console.log(`  - ${LOG_FILE}`);
      console.log(`  - ${SUMMARY_FILE}`);
    }
  }, INTERVAL_MS);
}

run().catch(console.error);