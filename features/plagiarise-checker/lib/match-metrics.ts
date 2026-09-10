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
 * Option-B legacy-fallback gate: when the consensus pipeline returns zero,
 * fall back to `raw_similarity_legacy` only if it clears this threshold.
 * Mirrors the backend `LEGACY_FALLBACK_MIN_SCORE` default (60.0). The score
 * is surfaced silently as the decision score — no badge/copy.
 */
export const LEGACY_FALLBACK_MIN_SCORE = 60;

type ScoreLike = {
  similarity?: number | null;
  calibrated_confidence?: number | null;
  raw_similarity?: number | null;
  raw_similarity_legacy?: number | null;
  fallback_used?: boolean | null;
  effective_similarity?: number | null;
};

/**ś
 * The headline "how confident are we this is plagiarism" number.
 * Prefers the percentile-calibrated score; falls back to `similarity` for
 * legacy responses. Never surfaces `raw_similarity_legacy`, which is the
 * transitional metric that produced background false positives.
 */
export function getPrimaryScore(
  match:
    | {
        calibrated_confidence?: number | null;
        similarity?: number | null;
      }
    | null
    | undefined
): number {
  if (!match) return 0;
  return match.calibrated_confidence ?? match.similarity ?? 0;
}

function toFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * Option-B fallback check: true when the consensus scores are zero
 * (`similarity` and `raw_similarity` both ≤ 0 / missing-as-zero) and
 * `raw_similarity_legacy` clears {@link LEGACY_FALLBACK_MIN_SCORE}.
 * Trusts an explicit backend `fallback_used: true` signal; otherwise
 * recomputes locally so backends without the new fields still work.
 */
export function isLegacyFallbackMatch(
  match: ScoreLike | null | undefined
): boolean {
  if (!match) return false;
  if (match.fallback_used === true) return true;
  const similarity = toFiniteNumber(match.similarity) ?? 0;
  const raw = toFiniteNumber(match.raw_similarity) ?? 0;
  const legacy = toFiniteNumber(match.raw_similarity_legacy);
  if (similarity > 0 || raw > 0) return false;
  if (legacy === null) return false;
  return legacy >= LEGACY_FALLBACK_MIN_SCORE;
}

/**
 * Decision score used for all plagiarism flag/display/rank logic.
 * Returns the backend `effective_similarity` when the fallback applies,
 * else the legacy value when the gate fires locally, else the normal
 * `getPrimaryScore()` value. Silent — callers render this number directly
 * with no extra badge/copy.
 */
export function getDecisionScore(
  match: ScoreLike | null | undefined
): number {
  if (!match) return 0;
  if (isLegacyFallbackMatch(match)) {
    const effective = toFiniteNumber(match.effective_similarity);
    if (effective !== null) return effective;
    const legacy = toFiniteNumber(match.raw_similarity_legacy);
    if (legacy !== null) return legacy;
  }
  return getPrimaryScore(match);
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
  // A fallback hit is a positive by definition — never a clean negative.
  if (isLegacyFallbackMatch(match)) return false;
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
