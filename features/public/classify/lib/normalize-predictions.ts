import type { ClassificationLabel } from "@/features/classify/types";

/**
 * Normalizes the raw classification API payload into `ClassificationLabel[]`,
 * tolerating missing/malformed entries. Shared by the server action and the
 * browser-direct helper so both transports parse identically.
 */
export function normalizePredictions(payload: unknown): ClassificationLabel[] {
  if (!payload || typeof payload !== "object") return [];

  const source = payload as {
    results?: Array<{
      label?: unknown;
      score?: unknown;
      index?: unknown;
    }>;
  };
  if (!Array.isArray(source.results)) return [];

  return source.results
    .map((item) => {
      const label =
        typeof item.label === "string" ? item.label.trim() : "Unknown";
      const score =
        typeof item.score === "number" ? item.score : Number(item.score ?? 0);
      const index =
        typeof item.index === "number"
          ? item.index
          : item.index != null
            ? Number(item.index)
            : undefined;

      return {
        label,
        score: Number.isFinite(score) ? score : 0,
        index:
          typeof index === "number" && Number.isFinite(index)
            ? index
            : undefined,
      };
    })
    .filter((item) => item.label.length > 0);
}
