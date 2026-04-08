import { type SimilarityReport } from "@/features/(user)/upload-artwork/server/art-similarity-scan";

/**
 * ArtworkStatus represents only the statuses that this upload pipeline can assign.
 *
 * We intentionally keep this narrower than the full database enum to make the
 * return type reflect the actual outcomes produced by this function.
 */
export type ArtworkStatus = "flagged" | "under_review" | "pending_blockchain";

/**
 * Server action result contract for artwork upload.
 *
 * On success, we return all hashes and metadata needed by the caller to continue
 * the protection flow or display a detailed result to the user.
 *
 * On failure, we return a user-facing message and, when available, the similarity
 * report so the UI can still explain why the request failed.
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