/**
 * Centralized Proof of Authorship status derivation.
 *
 * Derives the authoritative Proof of Authorship state from the current
 * `registered_arts` and `artwork_reviews` data. This is the single source
 * of truth for how the Artwork Recognition Profile displays authorship
 * verification status — no other component should re-implement this logic.
 *
 * Priority order (highest wins):
 *   1. Blockchain confirmed  — `registered_arts.status === "active"` with tx_hash/chain/work_id
 *   2. Review rejected       — `artwork_reviews.status === "rejected"`
 *   3. Approved, blockchain pending — review approved but artwork still `pending_blockchain`
 *   4. Approved, blockchain failed  — review approved but artwork `blockchain_failed`
 *   5. Review pending/under review/needs info — evidence submitted, awaiting review
 *   6. Auto-registered (no review) — `registered_arts.status === "active"` with blockchain data
 *   7. No data — fallback pending state
 */

export type ArtworkReviewStatus =
  "pending" | "under_review" | "needs_info" | "approved" | "rejected" | null;

export type RegisteredArtStatus =
  | "active"
  | "flagged"
  | "under_review"
  | "removed"
  | "pending_blockchain"
  | "blockchain_failed"
  | "revoked"
  | null;

export type AuthorshipStatusInput = {
  /** Current status of the artwork in `registered_arts`. */
  registeredArtStatus: RegisteredArtStatus;
  /** Whether the artwork has a completed blockchain record. */
  hasBlockchainRecord: boolean;
  /** Current status of the artwork review, if one exists. */
  reviewStatus: ArtworkReviewStatus;
};

export type AuthorshipStatus =
  | "verified"
  | "blockchain_pending"
  | "blockchain_failed"
  | "rejected"
  | "pending_review"
  | "unknown";

/**
 * Derive the Proof of Authorship status from the current database state.
 * A successfully approved artwork with a completed blockchain record must
 * override any previous `pending` or `under_review` state.
 */
export function deriveAuthorshipStatus(
  input: AuthorshipStatusInput,
): AuthorshipStatus {
  const { registeredArtStatus, hasBlockchainRecord, reviewStatus } = input;

  // 1. Review rejected — never show as verified, even if a blockchain record exists.
  if (reviewStatus === "rejected") {
    return "rejected";
  }

  // 2. Highest priority: blockchain confirmed.
  if (registeredArtStatus === "active" && hasBlockchainRecord) {
    return "verified";
  }

  // 3. Approved but blockchain still in progress.
  if (reviewStatus === "approved") {
    if (registeredArtStatus === "pending_blockchain") {
      return "blockchain_pending";
    }
    if (registeredArtStatus === "blockchain_failed") {
      return "blockchain_failed";
    }
    if (!hasBlockchainRecord) {
      return "blockchain_pending";
    }
  }

  // 4. Review is pending / under review / needs info.
  if (
    reviewStatus === "pending" ||
    reviewStatus === "under_review" ||
    reviewStatus === "needs_info"
  ) {
    return "pending_review";
  }

  // 5. Auto-registered without manual review.
  if (registeredArtStatus === "active" && hasBlockchainRecord) {
    return "verified";
  }

  // 6. Fallback.
  return "unknown";
}

/**
 * Build the human-readable RecognitionFact for the Proof of Authorship
 * section based on the derived status.
 */
export function buildAuthorshipFact(status: AuthorshipStatus): {
  satisfied: boolean;
  detail: string;
  description: string;
} {
  switch (status) {
    case "verified":
      return {
        satisfied: true,
        detail: "Authorship evidence verified",
        description:
          "Authorship has been verified and the artwork is recorded on the blockchain",
      };
    case "blockchain_pending":
      return {
        satisfied: false,
        detail: "Approved — blockchain registration in progress",
        description:
          "Authorship has been approved. The artwork is being registered on the blockchain",
      };
    case "blockchain_failed":
      return {
        satisfied: false,
        detail: "Approved — blockchain registration failed",
        description:
          "Authorship was approved but blockchain registration failed. An administrator may retry",
      };
    case "rejected":
      return {
        satisfied: false,
        detail: "Authorship verification rejected",
        description:
          "The authorship evidence was reviewed and rejected by an administrator",
      };
    case "pending_review":
      return {
        satisfied: false,
        detail: "Pending authorship verification",
        description:
          "Authorship evidence has been submitted and is awaiting review",
      };
    case "unknown":
    default:
      return {
        satisfied: false,
        detail: "Pending authorship verification",
        description:
          "Authorship evidence has been submitted and is awaiting review",
      };
  }
}
