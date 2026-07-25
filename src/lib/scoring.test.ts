import { describe, it, expect } from "vitest";
import {
  computeScore,
  suggestStatus,
  canTransition,
  type EvidenceInput,
} from "@/lib/scoring";

describe("computeScore", () => {
  it("es reproducible: mismos inputs => mismo output", () => {
    const ev: EvidenceInput[] = [
      { dimension: "ejecucion", supportsProgress: true, verified: true, trustWeight: 0.9 },
    ];
    expect(computeScore(ev)).toEqual(computeScore(ev));
  });

  it("sin evidencia el score es 0 y confianza 0", () => {
    const r = computeScore([]);
    expect(r.scoreValue).toBe(0);
    expect(r.confidence).toBe(0);
  });

  it("evidencia positiva verificada de alta confianza sube el score", () => {
    const ev: EvidenceInput[] = [
      { dimension: "avance_legislativo", supportsProgress: true, verified: true, trustWeight: 1 },
      { dimension: "ejecucion", supportsProgress: true, verified: true, trustWeight: 1 },
    ];
    const r = computeScore(ev);
    expect(r.scoreValue).toBeGreaterThan(50);
  });

  it("evidencia contradictoria baja el score de la dimensión", () => {
    const ev: EvidenceInput[] = [
      { dimension: "impacto", supportsProgress: false, verified: true, trustWeight: 1 },
    ];
    const r = computeScore(ev);
    expect(r.breakdown.impacto).toBe(0);
  });
});

describe("suggestStatus", () => {
  it("baja confianza => no_verificable", () => {
    expect(suggestStatus({ scoreValue: 90, breakdown: {} as never, confidence: 0.1, algoVersion: "x" })).toBe(
      "no_verificable"
    );
  });
});

describe("canTransition", () => {
  it("permite no_iniciada -> en_progreso", () => {
    expect(canTransition("no_iniciada", "en_progreso")).toBe(true);
  });
  it("bloquea cumplida -> incumplida directo", () => {
    expect(canTransition("cumplida", "incumplida")).toBe(false);
  });
});
