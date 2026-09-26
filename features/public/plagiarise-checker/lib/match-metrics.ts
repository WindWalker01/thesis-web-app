/**
 * Shared v2/v3 plagiarism scoring helpers.
 *
 * These apply the same mapping to every match-shaped object in a response —
 * `db`, `web`, `best_match`, each `other_matches` entry, and the `compare`
 * endpoint's `comparison` object (all share identical metric fields, see
 * RESPONSE_STRUCTURE_AUDIT.md). All reads are guarded with fallbacks so
 * legacy responses missing the v2/v3 fields degrade gracefully to the old
 * behavior.
 */

import { TRANSFORM_LABELS } from "@/features/plagiarise-checker/components/hash-labels";
import type { MatchMetrics } from "@/features/plagiarise-checker/types";

/**
 * The headline similarity number shown to users and compared against the
 * similarity-risk thresholds. Reads the raw `similarity` field, the same
 * value the /upload-artwork moderation pipeline thresholds on.
 *
 * For /compare responses (which have no `similarity` field) it falls back to
 * `final_similarity`. `calibrated_confidence` and `raw_similarity_legacy` are
 * never read.
 */
export function getPrimaryScore(
  match: MatchMetrics & { similarity?: number; final_similarity?: number } | null | undefined
): number {
  if (!match) return 0;
  // Prefer raw similarity field (same as upload-artwork), fall back to
  // final_similarity for compare responses that lack similarity.
  return match.similarity ?? match.final_similarity ?? 0;
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

/**
 * Enhanced evidence detail combining agreement counts with evidence status.
 * e.g. "3 of 5 regions matched — consistent under 180° rotation" or
 * "matched on image content only — no rotation/flip detected, likely a crop"
 * Returns `null` when the v2/v3 evidence fields are absent.
 */
export function getEvidenceDetail(match: MatchMetrics | null | undefined): string | null {
  if (!match || match.block_agreements === undefined) return null;

  const blocks = match.block_agreements;
  const transforms = match.transform_agreements;
  const base = `${blocks} of 5 regions matched`;

  // Add dominant transform info if available
  if (match.dominant_transform && blocks > 0 && transforms && transforms > 0) {
    const transformLabel = TRANSFORM_LABELS[match.dominant_transform] ?? match.dominant_transform;
    return `${base}, consistent under ${transformLabel}`;
  }

  // Add evidence status context
  if (match.transform_evidence_status === "absent" && blocks > 0) {
    return `${base} — matched on image content only, no rotation/flip detected (likely a crop)`;
  }

  if (transforms !== undefined && transforms > 0 && blocks > 0) {
    return `${base} across ${transforms} of 6 transform variants`;
  }

  return base;
}

/** True when the uploaded/compared image lacked content-bearing blocks. */
export function isLowContent(match: MatchMetrics | null | undefined): boolean {
  return match?.low_content_warning === true;
}

/** v3: returns the transform evidence status ("absent" | "checked") or null. */
export function getTransformEvidenceStatus(
  match: MatchMetrics | null | undefined
): "absent" | "checked" | null {
  if (!match) return null;
  return match.transform_evidence_status ?? null;
}

/** v3: returns the block evidence status ("absent" | "checked") or null. */
export function getBlockEvidenceStatus(
  match: MatchMetrics | null | undefined
): "absent" | "checked" | null {
  if (!match) return null;
  return match.block_evidence_status ?? null;
}

/** v3: returns the best scale pair [s1, s2] or null. */
export function getBestScalePair(
  match: MatchMetrics | null | undefined
): [string, string] | null {
  if (!match) return null;
  return match.best_scale_pair ?? null;
}

/** v3: returns whether background coincidence was suppressed. */
export function isBackgroundCoincidenceSuppressed(
  match: MatchMetrics | null | undefined
): boolean {
  return match?.background_coincidence_suppressed === true;
}

/** v3: returns whether calibration config was loaded. */
export function isCalibrationLoaded(
  match: MatchMetrics | null | undefined
): boolean {
  return match?.calibration_loaded === true;
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
