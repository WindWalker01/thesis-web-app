export type Stage = "upload" | "analyzing" | "result" | "error";
export type Mode = "web" | "compare";

export interface PlagiarismWebResult {
  filename: string;
  original_hash: string;
  hashes: Record<string, string>;
  best_match: ResultBestSearch;
  success: boolean;
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

export interface SearchMatch {
  type: "database" | "internet";
  source: string;
  url: string;
  link?: string;
  similarity: number;
}

export interface HashSet {
  phash: string;
  dhash: string;
  whash: string;
}

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
}
