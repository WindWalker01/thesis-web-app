export type Stage = "upload" | "analyzing" | "result";
export type Mode = "web" | "compare";

// types/plagiarism.ts

export interface PlagiarismWebResult {
  filename: string;
  original_hash: string;
  hashes: Record<string, string>;
  best_match: WebResultBestSearch;
  internet_match: WebResultBestSearch;
  database_match: DBResultBestSearch;
  success: boolean;
}

export interface ResultBestSearch {
  type: string;
  source: string;
  link: string;
  url: string;
  similarity: number;
}

export interface WebResultBestSearch {
  source: string;
  link: string;
  url: string;
  similarity: number;
}

export interface DBResultBestSearch {
  source: string;
  link: string;
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

// ------------------NOTE: REWORK BELOW these are outdated anymore

export interface ReverseSearchResponse {
  progress: number;
  stage: string;
  result: ReverseSearchResult;
}

export interface ReverseSearchResult {
  filename: string;
  hashes: ImageTransformHashes;
  // Now reflects the "0", "1", etc. keys seen in your JSON
  distances: Record<string, CombinedDistanceMetrics>;
  success: boolean;
}

export interface CombinedDistanceMetrics {
  source: string;
  link: string;
  url: string;
  min_combined_distance: number;
  average_combined_distance: number;
  max_combined_distance: number;
  best_match_pair: string;
  similarity_percentage: number;
}

export interface ImageTransformHashes {
  "0": HashValues;
  "90": HashValues;
  "180": HashValues;
  "270": HashValues;
  mirror: HashValues;
  flip: HashValues;
}

export interface HashValues {
  phash: string;
  dhash: string;
  whash: string;
}

// ------------------ IMAGE COMPARISON -------------------------------
export interface ImageComparisonResponse {
  progress: number;
  stage: string;
  result: ComparisonResult;
}

export interface ComparisonResult {
  filename1: string;
  filename2: string;
  distance: DistanceMetrics;
  hash1: ImageTransformHashes;
  hash2: ImageTransformHashes;
}

export interface DistanceMetrics {
  min_weighted_distance: number;
  average_weighted_distance: number;
  max_weighted_distance: number;
  best_match_pair: string;
  similarity_percentage: number;
}

export interface ImageTransformHashes {
  "0": HashValues;
  "90": HashValues;
  "180": HashValues;
  "270": HashValues;
  mirror: HashValues;
  flip: HashValues;
}

export interface HashValues {
  phash: string;
  dhash: string;
  whash: string;
}
