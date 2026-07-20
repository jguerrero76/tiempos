import he from "he";

// Port de la lógica de parseo ya validada por el consumidor de esta API (cliente
// Python que habla directamente con aucorsa.es). AUCORSA no expone JSON estructurado
// para las estimaciones, solo un fragmento HTML pensado para inyectarse en el DOM, así
// que lo parseamos con las mismas expresiones regulares que ya se sabe que funcionan.

const TAG_REGEX = /<[^>]+>/g;

function stripHtml(fragment: string): string {
  return he.decode(fragment.replace(TAG_REGEX, "")).trim();
}

function attr(fragment: string, name: string): string {
  const match = fragment.match(new RegExp(`${name}="([^"]*)"`));
  return match?.[1] ?? "";
}

function classBlock(fragment: string, className: string): string {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`class="[^"]*${escaped}[^"]*"[^>]*>([\\s\\S]*?)</\\w+>`);
  return fragment.match(regex)?.[1] ?? "";
}

function minutesFromBlock(block: string): string {
  const strongMatch = block.match(/<strong[^>]*>([\s\S]*?)<\/strong>/);
  if (!strongMatch) return "---";
  const text = stripHtml(strongMatch[1]).toLowerCase();
  if (text.includes("ahora") || text === "0") return "0";
  const digits = text.match(/(\d+)/);
  return digits?.[1] ?? "---";
}

export interface StopEstimation {
  linea: string;
  ruta: string;
  color: string;
  minutos1: string;
  minutos2: string;
}

export interface StopResponse {
  parada: number;
  nombre: string | null;
  estimaciones: StopEstimation[];
}

export class EstimationsParseError extends Error {}

// AUCORSA incluye el nombre de la parada en el propio fragmento, p.ej.:
// <div class="ppp-stop-label">Parada 413: Paseo de los Verdiales D.C.</div>
// Lo leemos de ahí en vez de mantener un stops.json aparte, así nunca se desincroniza.
const STOP_LABEL_REGEX = /ppp-stop-label[^>]*>([\s\S]*?)<\/div>/;
const STOP_NAME_REGEX = /^Parada\s+\d+:\s*(.+)$/i;

function extractStopName(raw: string): string | null {
  const labelMatch = raw.match(STOP_LABEL_REGEX);
  if (!labelMatch) return null;
  const label = stripHtml(labelMatch[1]);
  const nameMatch = label.match(STOP_NAME_REGEX);
  return (nameMatch ? nameMatch[1] : label).trim() || null;
}

export function parseEstimations(raw: string): StopEstimation[] {
  if (raw.includes("ppp-no-estimations")) return [];

  const parts = raw.split(/(?=<[^>]+class="[^"]*ppp-container)/);
  const containers = parts.filter((part) => part.includes("ppp-container"));

  if (containers.length === 0) {
    throw new EstimationsParseError(
      `Respuesta inesperada de AUCORSA (no se encontraron estimaciones). Respuesta completa: ${raw.slice(0, 3000)}`
    );
  }

  return containers.map((container) => {
    const lineBlock = classBlock(container, "ppp-line-number");
    const routeBlock = classBlock(container, "ppp-line-route");
    const estimationBlocks = [...container.matchAll(/class="[^"]*ppp-estimation[^"]*"[^>]*>([\s\S]*?)<\/div>/g)].map(
      (m) => m[1]
    );

    const lineNumberTag = container.match(/class="[^"]*ppp-line-number[^"]*"[^>]*>[\s\S]*?<\/\w+>/);
    const style = lineNumberTag ? attr(lineNumberTag[0], "style") : "";
    const colorMatch = style.match(/#[0-9a-fA-F]{3,6}/);

    return {
      linea: stripHtml(lineBlock) || "?",
      ruta: stripHtml(routeBlock),
      color: colorMatch?.[0] ?? "#888888",
      minutos1: estimationBlocks[0] ? minutesFromBlock(estimationBlocks[0]) : "---",
      minutos2: estimationBlocks[1] ? minutesFromBlock(estimationBlocks[1]) : "---",
    };
  });
}

export function parseStopResponse(raw: string, stopId: string): StopResponse {
  return {
    parada: Number(stopId),
    nombre: extractStopName(raw),
    estimaciones: parseEstimations(raw),
  };
}
