import {
  DB_MATCH_DISPLAY_THRESHOLD,
  DISPLAY_LABEL_VERY_SIMILAR,
  DISPLAY_LABEL_SIMILAR,
} from "@/features/shared/similarity-thresholds";

/**
 * Similarity % below which a database match in the "Other matches" report is
 * replaced by the best internet match (when available).
 * Web/internet matches are never filtered — an online match is treated as an
 * automatic document-submission review since internet ownership cannot be
 * established, so every web match is always shown.
 */
export { DB_MATCH_DISPLAY_THRESHOLD };

/** Formats a similarity percentage for display, or "N/A" when unavailable. */
export function formatSimilarityValue(
  percentage: number | null | undefined,
): string {
  return typeof percentage === "number" ? `${percentage.toFixed(2)}%` : "N/A";
}

/** Human label for a similarity match type ("database" | "internet" | other). */
export function getMatchTypeLabel(type: string | null | undefined): string {
  if (type === "database") return "Database match";
  if (type === "internet") return "Web match";
  return "Detected match";
}

/**
 * Thumbnail-level similarity qualifier used in the "Other matches" grid:
 * >= verySimilarThreshold "Very Similar",
 * >= similarThreshold "Similar",
 * otherwise "Potential Match".
 *
 * @param verySimilarThreshold - Override for the "Very Similar" threshold (defaults to shared config).
 * @param similarThreshold - Override for the "Similar" threshold (defaults to shared config).
 */
export function getSimilarityLabel(
  similarity: number,
  verySimilarThreshold?: number,
  similarThreshold?: number,
): string {
  const verySimilar = verySimilarThreshold ?? DISPLAY_LABEL_VERY_SIMILAR;
  const similar = similarThreshold ?? DISPLAY_LABEL_SIMILAR;

  if (similarity >= verySimilar) return "Very Similar";
  if (similarity >= similar) return "Similar";
  return "Potential Match";
}
