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
 *  1. 100% internet match       → under_review, no blockchain.
 *     We cannot trust an internet result as authoritative proof of duplication, so
 *     we hold it for admin review rather than blocking or approving outright.
 *
 *  2. >= flaggedThreshold       → flagged, no genre classification.
 *     High enough to warrant admin attention regardless of source.
 *
 *  3. >= manualReviewThreshold  → under_review, genre classified.
 *     Moderate risk; genre tagging helps admins assess context.
 *
 *  4. < manualReviewThreshold   → pending_blockchain, genre classified.
 *     Low similarity; safe to proceed to chain registration.
 *
 * We also return shouldClassify so downstream logic does not need to duplicate
 * threshold rules elsewhere in the pipeline.
 */
export function getArtworkStatusFromSimilarity(
    similarity: number,
    source: "database" | "internet" | null,
    options: {
        /** Similarity threshold above which artworks are flagged for admin review (maps to similarity_threshold setting). */
        flaggedThreshold: number;
        /** Similarity threshold above which artworks enter manual review (maps to manual_review_threshold setting). */
        manualReviewThreshold: number;
    },
): {
    artworkStatus: ArtworkStatus;
    moderationMessage: string;
    shouldClassify: boolean;
} {
    const { flaggedThreshold, manualReviewThreshold } = options;

    // Rule 1: exact internet match — hold for review, do not auto-block
    if (similarity >= 100 && source === "internet") {
        return {
            artworkStatus: "under_review",
            moderationMessage:
                "An exact internet match was detected. Your artwork has been submitted for admin review.",
            shouldClassify: true,
        };
    }

    // Rule 2: high similarity from any source — flag for admin
    if (similarity >= flaggedThreshold) {
        return {
            artworkStatus: "flagged",
            moderationMessage:
                "High similarity detected. Your artwork was submitted and flagged for admin review.",
            shouldClassify: false,
        };
    }

    // Rule 3: moderate similarity from any source — review + genre
    if (similarity >= manualReviewThreshold) {
        return {
            artworkStatus: "under_review",
            moderationMessage:
                "Moderate similarity detected. Your artwork was submitted for review.",
            shouldClassify: true,
        };
    }

    // Rule 4: low similarity — ready for chain
    return {
        artworkStatus: "pending_blockchain",
        moderationMessage:
            "Artwork uploaded successfully and is ready for protection.",
        shouldClassify: true,
    };
}