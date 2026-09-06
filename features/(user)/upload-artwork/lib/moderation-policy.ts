import { ArtworkStatus } from "@/features/(user)/upload-artwork/types";

/**
 * Centralizes the moderation decision derived from the similarity score and match source.
 *
 * Thresholds MUST be provided by the caller — they should come from the Admin Settings
 * (system_settings) table via `getRuntimeSettings()` so that an administrator can tune
 * them without code changes.
 *
 * Policy rules (evaluated top-to-bottom, first match wins):
 *
 *  1. database match >= flaggedThreshold  → rejected, no blockchain, no classification.
 *     A match against a registered artwork at or above the similarity threshold is
 *     treated as conclusive duplication: the upload is blocked outright.
 *
 *  2. similarity >= manualReviewThreshold → under_review, genre classified.
 *     Manual review for ANY source at moderate similarity. This covers:
 *       - internet matches >= manualReviewThreshold (including exact 100% matches —
 *         an internet result is never trusted as authoritative proof of duplication,
 *         so it is held for admin review rather than blocked or approved outright)
 *       - database matches between manualReviewThreshold and flaggedThreshold
 *
 *  3. similarity < manualReviewThreshold  → pending_blockchain, genre classified.
 *     Low similarity; safe to proceed to chain registration.
 *
 * We also return shouldClassify so downstream logic does not need to duplicate
 * threshold rules elsewhere in the pipeline.
 */
export function getArtworkStatusFromSimilarity(
    similarity: number,
    source: "database" | "internet" | null,
    options: {
        /** Similarity threshold at/above which a database match is auto-rejected (maps to similarity_threshold setting). */
        flaggedThreshold: number;
        /** Similarity threshold above which artworks enter manual review (maps to manual_review_threshold setting). */
        manualReviewThreshold: number;
    },
): {
    artworkStatus: "rejected" | ArtworkStatus;
    moderationMessage: string;
    shouldClassify: boolean;
} {
    const { flaggedThreshold, manualReviewThreshold } = options;

    // Rule 1: database match at/above the similarity threshold — automatic rejection
    if (source === "database" && similarity >= flaggedThreshold) {
        return {
            artworkStatus: "rejected",
            moderationMessage: `Upload blocked. A ${similarity}% match was detected against a registered artwork in the database.`,
            shouldClassify: false,
        };
    }

    // Rule 2: moderate-to-high similarity from any source — manual review
    if (similarity >= manualReviewThreshold) {
        return {
            artworkStatus: "under_review",
            moderationMessage: source === "internet"
                ? "An internet match was detected. Your artwork has been submitted for admin review."
                : "Moderate similarity detected. Your artwork was submitted for review.",
            shouldClassify: true,
        };
    }

    // Rule 3: low similarity — ready for chain
    return {
        artworkStatus: "pending_blockchain",
        moderationMessage:
            "Artwork uploaded successfully and is ready for protection.",
        shouldClassify: true,
    };
}