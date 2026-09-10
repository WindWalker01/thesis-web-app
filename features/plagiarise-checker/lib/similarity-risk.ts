import {
  MANUAL_REVIEW_THRESHOLD,
  SIMILARITY_THRESHOLD,
} from "@/features/shared/similarity-thresholds";

/**
 * Thresholds driving the red/amber/green similarity indicator on the
 * Check Similarity (plagiarism-checker) page.
 *
 * - `critical` maps to the admin `similarity_threshold` setting (red).
 * - `moderate` maps to the admin `manual_review_threshold` setting (amber).
 * - Anything below `moderate` renders green (low risk).
 */
export type SimilarityRiskThresholds = {
  critical: number;
  moderate: number;
};

/** Fallback thresholds used before admin runtime settings load (or if fetch fails). */
export const DEFAULT_SIMILARITY_RISK_THRESHOLDS: SimilarityRiskThresholds = {
  critical: SIMILARITY_THRESHOLD,
  moderate: MANUAL_REVIEW_THRESHOLD,
};

export type SimilarityRiskTier = "critical" | "moderate" | "low";

const RISK_COLORS: Record<SimilarityRiskTier, string> = {
  critical: "#ef4444",
  moderate: "#f59e0b",
  low: "#22c55e",
};

function normalizeThresholds(
  thresholds?: Partial<SimilarityRiskThresholds> | null,
): SimilarityRiskThresholds {
  const critical =
    typeof thresholds?.critical === "number" &&
    Number.isFinite(thresholds.critical)
      ? thresholds.critical
      : DEFAULT_SIMILARITY_RISK_THRESHOLDS.critical;
  const moderate =
    typeof thresholds?.moderate === "number" &&
    Number.isFinite(thresholds.moderate)
      ? thresholds.moderate
      : DEFAULT_SIMILARITY_RISK_THRESHOLDS.moderate;
  // Guard against misconfiguration (e.g. admin sets critical below moderate).
  return {
    critical: Math.max(critical, moderate),
    moderate: Math.min(critical, moderate),
  };
}

/** Resolves the risk tier for a 0–100 similarity value. */
export function getSimilarityRiskTier(
  value: number,
  thresholds?: Partial<SimilarityRiskThresholds> | null,
): SimilarityRiskTier {
  const { critical, moderate } = normalizeThresholds(thresholds);
  if (value >= critical) return "critical";
  if (value >= moderate) return "moderate";
  return "low";
}

/** Hex color for the similarity indicator (ring, bar, percentage text). */
export function getSimilarityColor(
  value: number,
  thresholds?: Partial<SimilarityRiskThresholds> | null,
): string {
  return RISK_COLORS[getSimilarityRiskTier(value, thresholds)];
}

/** Short label rendered under the similarity ring. */
export function getSimilarityRiskLabel(
  value: number,
  thresholds?: Partial<SimilarityRiskThresholds> | null,
): string {
  const tier = getSimilarityRiskTier(value, thresholds);
  if (tier === "critical") return "Critical";
  if (tier === "moderate") return "Moderate";
  return "Low Risk";
}
