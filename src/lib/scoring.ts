// Motor de scoring explicable, puro y reproducible.
// Mismos inputs => mismo output. Sin efectos secundarios ni fechas internas.

export const SCORING_ALGO_VERSION = "scoring@1.0.0";

export type DimensionKey =
  | "avance_legislativo"
  | "presupuesto"
  | "ejecucion"
  | "impacto";

export type PromiseStatus =
  | "no_iniciada"
  | "en_progreso"
  | "parcialmente_cumplida"
  | "cumplida"
  | "incumplida"
  | "no_verificable";

export interface DimensionConfig {
  key: DimensionKey;
  label: string;
  weight: number; // los pesos activos deben sumar 1.0
}

// Pesos por defecto (editables vía tabla ScoringDimension).
export const DEFAULT_DIMENSIONS: DimensionConfig[] = [
  { key: "avance_legislativo", label: "Avance legislativo", weight: 0.3 },
  { key: "presupuesto", label: "Asignación presupuestaria", weight: 0.2 },
  { key: "ejecucion", label: "Ejecución real", weight: 0.35 },
  { key: "impacto", label: "Impacto medible", weight: 0.15 },
];

export interface EvidenceInput {
  dimension: DimensionKey;
  supportsProgress: boolean; // true suma, false resta
  verified: boolean;
  trustWeight: number; // 0..1 confianza de la fuente
}

export interface ScoreResult {
  scoreValue: number; // 0-100
  breakdown: Record<DimensionKey, number>; // 0-100 por dimensión
  confidence: number; // 0..1 media ponderada de confianza
  algoVersion: string;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * Puntuación por dimensión: agrega evidencias verificadas ponderadas por
 * confianza de la fuente. La evidencia no verificada aporta la mitad de peso.
 * Rango de salida 0..100.
 */
function scoreDimension(evidence: EvidenceInput[]): {
  score: number;
  weightSum: number;
} {
  if (evidence.length === 0) return { score: 0, weightSum: 0 };

  let numerator = 0;
  let weightSum = 0;

  for (const e of evidence) {
    const verificationFactor = e.verified ? 1 : 0.5;
    const w = clamp(e.trustWeight, 0, 1) * verificationFactor;
    const contribution = e.supportsProgress ? 1 : -1;
    numerator += contribution * w;
    weightSum += w;
  }

  if (weightSum === 0) return { score: 0, weightSum: 0 };

  // ratio en [-1, 1] -> escala a [0, 100]
  const ratio = numerator / weightSum;
  const score = clamp((ratio + 1) * 50, 0, 100);
  return { score: Math.round(score), weightSum };
}

/**
 * Calcula el score total 0-100 ponderando dimensiones activas.
 * Determinista: no usa Date.now() ni Math.random().
 */
export function computeScore(
  evidenceItems: EvidenceInput[],
  dimensions: DimensionConfig[] = DEFAULT_DIMENSIONS
): ScoreResult {
  const breakdown = {} as Record<DimensionKey, number>;
  let weightedTotal = 0;
  let confidenceNum = 0;
  let confidenceDen = 0;
  const totalWeight = dimensions.reduce((s, d) => s + d.weight, 0) || 1;

  for (const dim of dimensions) {
    const items = evidenceItems.filter((e) => e.dimension === dim.key);
    const { score, weightSum } = scoreDimension(items);
    breakdown[dim.key] = score;
    weightedTotal += score * (dim.weight / totalWeight);
    confidenceNum += weightSum * dim.weight;
    confidenceDen += dim.weight;
  }

  const confidence =
    confidenceDen > 0 ? clamp(confidenceNum / confidenceDen, 0, 1) : 0;

  return {
    scoreValue: Math.round(clamp(weightedTotal, 0, 100)),
    breakdown,
    confidence: Number(confidence.toFixed(3)),
    algoVersion: SCORING_ALGO_VERSION,
  };
}

/**
 * Deriva un estado sugerido a partir del score y la confianza.
 * La transición final requiere revisión editorial (moderación).
 */
export function suggestStatus(result: ScoreResult): PromiseStatus {
  if (result.confidence < 0.2) return "no_verificable";
  if (result.scoreValue >= 85) return "cumplida";
  if (result.scoreValue >= 50) return "parcialmente_cumplida";
  if (result.scoreValue >= 15) return "en_progreso";
  if (result.scoreValue < 15 && result.confidence >= 0.5) return "incumplida";
  return "no_iniciada";
}

// Transiciones de estado permitidas (máquina de estados).
export const ALLOWED_TRANSITIONS: Record<PromiseStatus, PromiseStatus[]> = {
  no_iniciada: ["en_progreso", "no_verificable", "incumplida"],
  en_progreso: [
    "parcialmente_cumplida",
    "cumplida",
    "incumplida",
    "no_verificable",
  ],
  parcialmente_cumplida: ["cumplida", "incumplida", "en_progreso"],
  cumplida: ["parcialmente_cumplida"], // sólo revertible con evidencia contraria
  incumplida: ["en_progreso", "parcialmente_cumplida"],
  no_verificable: ["en_progreso", "no_iniciada"],
};

export function canTransition(
  from: PromiseStatus,
  to: PromiseStatus
): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}
