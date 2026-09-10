export type Stage = "upload" | "analyzing" | "result" | "error";
export type Mode = "web" | "compare";

/**
 * Evidence status values for transform and block channels (v3 API).
 */
export type EvidenceStatus = "absent" | "checked";

/**
 * Consensus-based scoring fields added by the v2 plagiarism API (backend commit
 * `6f114bb`). All fields are optional so responses from older/unmigrated
 * endpoints (and older cached payloads) remain assignable. When present, they
 * appear identically on `db`, `web`, `best_match`, and every `other_matches`
 * entry (see RESPONSE_STRUCTURE_AUDIT.md). v3 additions:
 * - `transform_evidence_status`, `block_evidence_status` (dynamic-reweighting pass)
 * - `best_scale_pair` (multi-scale pass)
 * - `dominant_transform` (now on all match objects, not just compare)
 * - `calibration_loaded`, `background_coincidence_suppressed` (v3 health/debug signals)
 */
export interface MatchMetrics {
  /** New consensus algorithm's uncalibrated linear score. `0` = no agreeing evidence. */
  raw_similarity?: number;
  /** Old single-minimum-distance algorithm score. Transitional only — never surface in UI. */
  raw_similarity_legacy?: number;
  /** Primary user-facing score: percentile-calibrated against an unrelated-pair baseline. */
  calibrated_confidence?: number;
  /** 0–1. 0.0 = zero agreeing block/transform pairs (clean negative); 1.0 = all agreeing pairs share one geometric transform. */
  transform_consistency?: number;
  /** 0–6 transform-variant hashes that agreed. */
  transform_agreements?: number;
  /** 0–5 content-bearing block regions that agreed (per winning scale-pair mesh). */
  block_agreements?: number;
  /** How many blocks of the uploaded image carried enough detail to be used as evidence. */
  content_blocks_used?: number;
  /** True when the uploaded (or compared) image lacked content-bearing blocks. */
  low_content_warning?: boolean;
  /** v3: whether transform evidence was checked or absent (renormalized onto block channel). */
  transform_evidence_status?: EvidenceStatus;
  /** v3: whether block evidence was checked or absent (renormalized onto transform channel). */
  block_evidence_status?: EvidenceStatus;
  /** v3: which two scale factors produced the winning block comparison, e.g. ["0.625", "0.75"]. */
  best_scale_pair?: [string, string] | null;
  /** v3: transform implied by agreeing blocks ("0", "90", "180", "270", "mirror", "flip") or null. */
  dominant_transform?: string | null;
  /** v3: whether calibration config loaded successfully. */
  calibration_loaded?: boolean;
  /** v3: true when score was suppressed as likely background/flat-region coincidence. */
  background_coincidence_suppressed?: boolean;
  /**
   * Backend Option-B signal: consensus scores were zero but
   * `raw_similarity_legacy` cleared the fallback gate. Optional for
   * legacy-cache tolerance.
   */
  fallback_used?: boolean;
  /**
   * Backend-computed decision score (legacy value when `fallback_used`).
   * Optional for legacy-cache tolerance.
   */
  effective_similarity?: number;
}

export interface HashSet {
  phash: string;
  dhash: string;
  whash: string;
  /** Per-block entropy (only present on block regions, v2 API). */
  entropy?: number;
  /** v3: per-block similarity score (0–100) for this specific hash comparison. */
  similarity?: number;
}

export interface SearchMatch extends MatchMetrics {
  type: "database" | "internet" | string;
  source: string;
  url: string;
  link?: string;
  similarity: number;
  imageUrl?: string | null; // resolved Cloudinary URL (only for DB matches)
  title?: string | null;    // resolved artwork title (only for DB matches)
}

export interface OtherSearchMatch extends MatchMetrics {
  source: string;
  link: string;
  url: string;
  similarity: number;
  artwork_id?: string;
}

export interface PlagiarismWebResult {
  filename: string;
  success: boolean;
  original_hash: string;
  db?: SearchMatch | null;
  web?: SearchMatch | null;
  best_match?: SearchMatch | null;
  hashes: {
    transforms: Record<string, HashSet>;
    /** v3: block keys are now scale-prefixed, e.g. "0.625:top_left", "1.0:center". */
    blocks: Record<string, HashSet>;
  };
  other_matches: OtherSearchMatch[];
  /** True when the uploaded image lacked content-bearing blocks (v2 API). */
  low_content_warning?: boolean;
  /**
   * Additive backend field on POST /plagiarism/check/web.
   * Always present on new responses; absent on legacy cached payloads.
   */
  web_warning?: string | null;
  /** Disambiguates `web: null` (no plagiarism vs degraded check). Optional for legacy cache tolerance. */
  web_diagnostics?: WebDiagnostics;
}

/**
 * Online (Serper/Cloudinary) branch status for POST /plagiarism/check/web.
 * - ok: web match rendered normally.
 * - no_matches: online images checked, none similar.
 * - no_candidates: reverse search returned zero candidates.
 * - degraded / not_attempted: online check incomplete; db result still valid.
 */
export type WebDiagnosticsStatus =
  | "ok"
  | "no_matches"
  | "no_candidates"
  | "degraded"
  | "not_attempted";

export interface WebDiagnostics {
  status: WebDiagnosticsStatus;
  cloudinary_ready?: boolean;
  readiness_attempts?: number;
  /** Last HTTP status of the Cloudinary HEAD poll (200/206 = ready, 404 = propagating). */
  readiness_status?: number | null;
  readiness_ms?: number;
  payload_keys?: string[];
  list_key?: string;
  serp_returned?: number;
  /** Candidates actually attempted (capped at 60). */
  attempted?: number;
  hashed_ok?: number;
  hashed_failed?: number;
  url_keys_seen?: string[];
  /** Grouped failure causes, e.g. {"fetch_timeout:<host>": 4}. Render generically. */
  failure_reasons?: Record<string, number>;
  /** Present when status === "degraded". */
  error?: string;
}

/**
 * Loosely-typed shape of the raw plagiarism-check response as consumed by the
 * upload-artwork similarity selectors. The optional envelope fields mean the
 * enriched {@link PlagiarismWebResult} returned by `checkPlagiarismWeb` is
 * assignable here without casts.
 */
export interface CheckPlagiarismWebResult extends MatchMetrics {
  success: boolean;
  filename?: string;
  original_hash?: string;
  hashes?:
    | {
        transforms?: Record<string, HashSet>;
        /** v3: block keys are now scale-prefixed, e.g. "0.625:top_left". */
        blocks?: Record<string, HashSet>;
      }
    | Record<string, unknown>
    | null;
  db?: SearchMatch | null;
  web?: SearchMatch | null;
  best_match?: SearchMatch | null;
  other_matches: OtherSearchMatch[] | null;
}

export interface ResultBestSearch {
  type: string;
  source: string;
  link?: string;
  url: string;
  similarity: number;
}

export interface PlagiarismCheckResult {
  filename1: string;
  filename2: string;
  distance: number;
  hash1: Record<string, string>;
  hash2: Record<string, string>;
}

// ─── Compare Two Images ───────────────────────────────────────────────────────

export interface CompareResponse {
  image1: string;
  image2: string;
  comparison: MatchMetrics & {
    transform_similarity: number;
    block_similarity: number;
    final_similarity: number;
    /** v2: true when config/calibration.json was loaded; false = identity fallback. */
    calibration_loaded?: boolean;
    /** v3: global resemblance voided because no block corroborated it. */
    background_coincidence_suppressed?: boolean;
  };
  /** v3: true when either image had no content-bearing blocks. */
  low_content_warning?: boolean;
  /** Backend Option-B signal for /compare (beside `comparison`). */
  fallback_used?: boolean;
  /** Backend-computed decision score for /compare. */
  effective_similarity?: number;
}

// ─── Web / DB Search ──────────────────────────────────────────────────────────

export interface SearchResponse {
  filename: string;
  success: boolean;
  original_hash: string;
  db?: SearchMatch | null;
  web?: SearchMatch | null;
  best_match?: SearchMatch | null;
  hashes: {
    transforms: Record<string, HashSet>;
    /** v3: block keys are now scale-prefixed, e.g. "0.625:top_left", "1.0:center". */
    blocks: Record<string, HashSet>;
  };
  other_matches: OtherSearchMatch[];
  /** True when the uploaded image lacked content-bearing blocks (v2 API). */
  low_content_warning?: boolean;
  /** Additive backend field; null when the online branch needs no warning. Optional for legacy cache tolerance. */
  web_warning?: string | null;
  /** Disambiguates `web: null`. Optional for legacy cache tolerance. */
  web_diagnostics?: WebDiagnostics;
}
