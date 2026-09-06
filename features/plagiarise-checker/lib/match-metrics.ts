/**
 * Shared v2 plagiarism scoring helpers.
 *
 * These apply the same mapping to every match-shaped object in a response —
 * `db`, `web`, `best_match`, each `other_matches` entry, and the `compare`
 * endpoint's `comparison` object (all share identical metric fields, see
 * RESPONSE_STRUCTURE_AUDIT.md). All reads are guarded with fallbacks so
 * legacy responses missing the v2 fields degrade gracefully to the old
 * behavior.
 */

import { TRANSFORM_LABELS } from "@/features/plagiarise-checker/components/hash-labels";
import type { MatchMetrics } from "@/features/plagiarise-checker/types";

/**
 * The headline "how confident are we this is plagiarism" number.
 * Prefers the percentile-calibrated score; falls back to `similarity` for
 * legacy responses. Never surfaces `raw_similarity_legacy`, which is the
 * transitional metric that produced background false positives.
 */
export function getPrimaryScore(
  match: { calibrated_confidence?: number; similarity?: number } | null | undefined
): number {
  if (!match) return 0;
  return match.calibrated_confidence ?? match.similarity ?? 0;
}

/**
 * Explicit "no matching evidence at all" signal (a genuine true negative,
 * not an error). Only true when the v2 metrics are present AND all of them
 * are zero — legacy responses without the fields return `false` so old
 * payloads keep rendering the normal score UI.
 *
 * Tuple per backend `6f114bb`: raw_similarity 0 • transform_consistency 0 •
 * block_agreements 0 • transform_agreements 0.
 */
export function isNoEvidenceMatch(match: MatchMetrics | null | undefined): boolean {
  if (!match) return false;
  const { raw_similarity, transform_consistency, block_agreements, transform_agreements } = match;
  if (
    raw_similarity === undefined ||
    transform_consistency === undefined ||
    block_agreements === undefined ||
    transform_agreements === undefined
  ) {
    return false;
  }
  return (
    raw_similarity === 0 &&
    transform_consistency === 0 &&
    block_agreements === 0 &&
    transform_agreements === 0
  );
}

/**
 * Human explainability line behind a score, e.g.
 * "3 of 5 regions matched across 4 of 6 transform variants" (positive) or
 * "0 of 5 regions matched" (backs up the clean-negative state).
 * Returns `null` when the v2 evidence fields are absent (legacy response).
 */
export function getEvidenceSummary(match: MatchMetrics | null | undefined): string | null {
  if (!match || match.block_agreements === undefined) return null;

  const blocks = match.block_agreements;
  const transforms = match.transform_agreements;
  const base = `${blocks} of 5 regions matched`;

  if (transforms !== undefined && transforms > 0 && blocks > 0) {
    return `${base} across ${transforms} of 6 transform variants`;
  }
  return base;
}

/** True when the uploaded/compared image lacked content-bearing blocks. */
export function isLowContent(match: MatchMetrics | null | undefined): boolean {
  return match?.low_content_warning === true;
}

/**
 * Best-effort dominant-transform label for /compare responses.
 * Falls back to `null` when the field is absent or unknown.
 */
export function getDominantTransformLabel(
  transform: string | null | undefined
): string | null {
  if (!transform) return null;
  return TRANSFORM_LABELS[transform] ?? null;
}
