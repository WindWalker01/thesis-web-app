export type Stage = "upload" | "analyzing" | "result" | "error";
export type Mode = "web" | "compare";

export interface HashSet {
  phash: string;
  dhash: string;
  whash: string;
}

export interface SearchMatch {
  type: "database" | "internet" | string;
  source: string;
  url: string;
  link?: string;
  similarity: number;
  imageUrl?: string | null; // resolved Cloudinary URL (only for DB matches)
  title?: string | null;    // resolved artwork title (only for DB matches)
}

export interface OtherSearchMatch {
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
}

/**
 * Loosely-typed shape of the raw plagiarism-check response as consumed by the
 * upload-artwork similarity selectors. The optional envelope fields mean the
 * enriched {@link PlagiarismWebResult} returned by `checkPlagiarismWeb` is
 * assignable here without casts.
 */
export interface CheckPlagiarismWebResult {
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
  comparison: {
    transform_similarity: number;
    block_similarity: number;
    final_similarity: number;
  };
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
}
