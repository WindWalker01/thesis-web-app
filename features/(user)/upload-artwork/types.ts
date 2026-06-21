import { type SimilarityReport } from "@/features/(user)/upload-artwork/server/art-similarity-scan";

/**
 * ArtworkStatus represents only the statuses that this upload pipeline can assign.
 */
export type ArtworkStatus = "flagged" | "under_review" | "pending_blockchain";

/**
 * Server action result contract for artwork upload.
 */
export type RecordArtworkInDatabaseResult =
  | {
      success: true;
      artworkId: string;
      fileHash: `0x${string}`;
      perceptualHash: `0x${string}`;
      authorIdHash: `0x${string}`;
      evidenceHash: `0x${string}`;
      imageUrl: string | null;
      message: string;
      similarityReport: SimilarityReport | null;
      artworkStatus: ArtworkStatus;
      genreSuggestions: GenreScoreLabel[];
    }
  | {
      success: false;
      message: string;
      similarityReport: SimilarityReport | null;
    };

/**
 * DTO describing one classifier label prediction.
 */
export interface GenreScoreLabel {
  score: number;
  label: string;
  index: number;
}

/**
 * DTO describing the expected classifier API response shape.
 */
export interface GenreClassificationResult {
  success: boolean;
  results: Array<GenreScoreLabel>;
}
