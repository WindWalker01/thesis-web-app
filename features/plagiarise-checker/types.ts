export type Stage = "upload" | "analyzing" | "result" | "error";
export type Mode = "web" | "compare";

/**
 * Consensus-based scoring fields added by the v2 plagiarism API (backend commit
 * `6f114bb`). All fields are optional so responses from older/unmigrated
 * endpoints (and older cached payloads) remain assignable. When present, they
 * appear identically on `db`, `web`, `best_match`, and every `other_matches`
 * entry (see RESPONSE_STRUCTURE_AUDIT.md).
 */
export interface MatchMetrics {
  /** New consensus algorithm's uncalibrated linear score. `0` = no agreeing evidence. */
  raw_similarity?: number;
  /** Old single-minimum-distance algorithm score. Transitional only — never surface in UI. */
  raw_similarity_legacy?: number;
  /** Primary user-facing score: percentile-calibrated against an unrelated-pair baseline. */
  calibrated_confidence?: number;
  /** 0–1. 0.0 = zero agreeing block/transform pairs (clean negative). */
  transform_consistency?: number;
  /** 0–6 transform-variant hashes that agreed. */
  transform_agreements?: number;
  /** 0–5 content-bearing block regions that agreed. */
  block_agreements?: number;
  /** How many blocks of the uploaded image carried enough detail to be used as evidence. */
  content_blocks_used?: number;
  /** True when the uploaded (or compared) image lacked content-bearing blocks. */
  low_content_warning?: boolean;
}

export interface HashSet {
  phash: string;
  dhash: string;
  whash: string;
  /** Per-block entropy (only present on block regions, v2 API). */
  entropy?: number;
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
    blocks: Record<string, HashSet>;
  };
  other_matches: OtherSearchMatch[];
  /** True when the uploaded image lacked content-bearing blocks (v2 API). */
  low_content_warning?: boolean;
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
    /** v2: global resemblance voided because no block corroborated it. */
    background_coincidence_suppressed?: boolean;
    /** v2: transform implied by the agreeing blocks ("0".."270", "mirror", "flip") or null. */
    dominant_transform?: string | null;
  };
  /** v2: true when either image had no content-bearing blocks. */
  low_content_warning?: boolean;
}

// ─── Web / DB Search ──────────────────────────────────────────────────────────

export interface SearchResponse {
  filename: string;
  success: boolean;
  original_hash: string;
  db: SearchMatch | null;
  web: SearchMatch | null;
  best_match: SearchMatch | null;
  hashes: {
    transforms: Record<string, HashSet>;
    blocks: Record<string, HashSet>;
  };
  other_matches: OtherSearchMatch[];
  /** True when the uploaded image lacked content-bearing blocks (v2 API). */
  low_content_warning?: boolean;
}
