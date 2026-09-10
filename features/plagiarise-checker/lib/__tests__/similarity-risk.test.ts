import { describe, expect, it } from "vitest";
import {
  DEFAULT_SIMILARITY_RISK_THRESHOLDS,
  getSimilarityColor,
  getSimilarityRiskLabel,
  getSimilarityRiskTier,
} from "@/features/plagiarise-checker/lib/similarity-risk";

describe("similarity-risk", () => {
  it("uses shared admin defaults (critical 80, moderate 60)", () => {
    expect(DEFAULT_SIMILARITY_RISK_THRESHOLDS).toEqual({
      critical: 80,
      moderate: 60,
    });
  });

  it("marks values at/above critical as red/Critical", () => {
    expect(getSimilarityRiskTier(80)).toBe("critical");
    expect(getSimilarityColor(80)).toBe("#ef4444");
    expect(getSimilarityRiskLabel(80)).toBe("Critical");
    expect(getSimilarityRiskTier(95)).toBe("critical");
  });

  it("marks the moderate band as amber/Moderate (below critical)", () => {
    expect(getSimilarityRiskTier(79.9)).toBe("moderate");
    expect(getSimilarityColor(60)).toBe("#f59e0b");
    expect(getSimilarityRiskLabel(60)).toBe("Moderate");
  });

  it("marks values below moderate as green/Low Risk", () => {
    expect(getSimilarityRiskTier(59.9)).toBe("low");
    expect(getSimilarityColor(10)).toBe("#22c55e");
    expect(getSimilarityRiskLabel(10)).toBe("Low Risk");
  });

  it("honours custom admin thresholds", () => {
    const thresholds = { critical: 95, moderate: 70 };
    expect(getSimilarityRiskTier(94.9, thresholds)).toBe("moderate");
    expect(getSimilarityRiskTier(95, thresholds)).toBe("critical");
    expect(getSimilarityRiskTier(69.9, thresholds)).toBe("low");
    expect(getSimilarityColor(95, thresholds)).toBe("#ef4444");
  });

  it("normalises inverted thresholds instead of breaking", () => {
    const tier = getSimilarityRiskTier(75, { critical: 60, moderate: 80 });
    expect(["critical", "moderate", "low"]).toContain(tier);
    expect(getSimilarityColor(75, { critical: 60, moderate: 80 })).toBe(
      getSimilarityColor(75, { critical: 80, moderate: 60 }),
    );
  });
});
