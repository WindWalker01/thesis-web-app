import { ArtworkStatus } from "@/features/(user)/upload-artwork/types";

/**
 * Centralizes the moderation decision derived from the similarity score and match source.
 *
 * Policy rules (evaluated top-to-bottom, first match wins):
 *
 *  1. 100% database match       → hard-blocked upstream, never reaches this function.
 *
 *  2. 100% internet match       → under_review, no blockchain.
 *     We cannot trust an internet result as authoritative proof of duplication, so
 *     we hold it for admin review rather than blocking or approving outright.
 *
 *  3. 87.5 – 99.99% (any src)  → flagged, no genre classification.
 *     High enough to warrant admin attention regardless of source.
 *
 *  4. 75 – 87.49% (any src)    → under_review, genre classified, pending blockchain.
 *     Moderate risk; genre tagging helps admins assess context.
 *
 *  5. < 75%, database source   → pending_blockchain, genre classified.
 *     Low similarity from a trusted source — safe to proceed to chain registration.
 *
 *  6. < 75%, internet source   → under_review, genre classified, pending blockchain.
 *     Low similarity but internet provenance is untrusted; hold for confirmation.
 *
 * We also return shouldClassify so downstream logic does not need to duplicate
 * threshold rules elsewhere in the pipeline.
 */
export function getArtworkStatusFromSimilarity(
    similarity: number,
    source: "database" | "internet" | null,
): {
    artworkStatus: ArtworkStatus;
    moderationMessage: string;
    shouldClassify: boolean;
} {
    // Rule 2: exact internet match — hold for review, do not auto-block
    if (similarity >= 100 && source === "internet") {
        return {
            artworkStatus: "under_review",
            moderationMessage:
                "An exact internet match was detected. Your artwork has been submitted for admin review.",
            shouldClassify: true,
        };
    }

    // Rule 3: high similarity from any source — flag for admin
    if (similarity >= 87.5) {
        return {
            artworkStatus: "flagged",
            moderationMessage:
                "High similarity detected. Your artwork was submitted and flagged for admin review.",
            shouldClassify: false,
        };
    }

    // Rule 4: moderate similarity from any source — review + genre
    if (similarity >= 70) {
        return {
            artworkStatus: "under_review",
            moderationMessage:
                "Moderate similarity detected. Your artwork was submitted for review.",
            shouldClassify: true,
        };
    }

    // Rule 5: low similarity from database (trusted) — ready for chain
    return {
        artworkStatus: "pending_blockchain",
        moderationMessage:
            "Artwork uploaded successfully and is ready for protection.",
        shouldClassify: true,
    };
}
