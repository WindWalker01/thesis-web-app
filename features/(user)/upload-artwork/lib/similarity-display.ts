/**
 * Minimum similarity (percentage) a database match must reach before it is shown
 * in the "Other matches" report. Web/internet matches are never filtered — an
 * online match is treated as an automatic document-submission review since
 * internet ownership cannot be established, so every web match is always shown.
 */
export const DB_MATCH_DISPLAY_THRESHOLD = 70;

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
 * >= 90 "Very Similar", >= 75 "Similar", otherwise "Potential Match".
 */
export function getSimilarityLabel(similarity: number): string {
  if (similarity >= 90) return "Very Similar";
  if (similarity >= 75) return "Similar";
  return "Potential Match";
}
