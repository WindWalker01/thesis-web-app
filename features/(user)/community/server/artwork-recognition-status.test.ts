import { describe, it, expect } from "vitest";
import {
  deriveAuthorshipStatus,
  buildAuthorshipFact,
  type AuthorshipStatusInput,
} from "./artwork-recognition-status";

function makeInput(
  overrides: Partial<AuthorshipStatusInput> = {},
): AuthorshipStatusInput {
  return {
    registeredArtStatus: null,
    hasBlockchainRecord: false,
    reviewStatus: null,
    ...overrides,
  };
}

describe("deriveAuthorshipStatus", () => {
  it("returns verified when artwork is active with a blockchain record", () => {
    const status = deriveAuthorshipStatus(
      makeInput({
        registeredArtStatus: "active",
        hasBlockchainRecord: true,
        reviewStatus: "approved",
      }),
    );
    expect(status).toBe("verified");
  });

  it("returns verified for auto-registered artwork with no review", () => {
    const status = deriveAuthorshipStatus(
      makeInput({
        registeredArtStatus: "active",
        hasBlockchainRecord: true,
        reviewStatus: null,
      }),
    );
    expect(status).toBe("verified");
  });

  it("returns rejected when review is rejected even if blockchain exists", () => {
    const status = deriveAuthorshipStatus(
      makeInput({
        registeredArtStatus: "active",
        hasBlockchainRecord: true,
        reviewStatus: "rejected",
      }),
    );
    expect(status).toBe("rejected");
  });

  it("returns blockchain_pending when approved but artwork is pending_blockchain", () => {
    const status = deriveAuthorshipStatus(
      makeInput({
        registeredArtStatus: "pending_blockchain",
        hasBlockchainRecord: false,
        reviewStatus: "approved",
      }),
    );
    expect(status).toBe("blockchain_pending");
  });

  it("returns blockchain_failed when approved but artwork is blockchain_failed", () => {
    const status = deriveAuthorshipStatus(
      makeInput({
        registeredArtStatus: "blockchain_failed",
        hasBlockchainRecord: false,
        reviewStatus: "approved",
      }),
    );
    expect(status).toBe("blockchain_failed");
  });

  it("returns blockchain_pending when approved but no blockchain record yet", () => {
    const status = deriveAuthorshipStatus(
      makeInput({
        registeredArtStatus: "flagged",
        hasBlockchainRecord: false,
        reviewStatus: "approved",
      }),
    );
    expect(status).toBe("blockchain_pending");
  });

  it("returns pending_review when review is pending", () => {
    const status = deriveAuthorshipStatus(
      makeInput({
        registeredArtStatus: "under_review",
        hasBlockchainRecord: false,
        reviewStatus: "pending",
      }),
    );
    expect(status).toBe("pending_review");
  });

  it("returns pending_review when review is under_review", () => {
    const status = deriveAuthorshipStatus(
      makeInput({
        registeredArtStatus: "under_review",
        hasBlockchainRecord: false,
        reviewStatus: "under_review",
      }),
    );
    expect(status).toBe("pending_review");
  });

  it("returns pending_review when review is needs_info", () => {
    const status = deriveAuthorshipStatus(
      makeInput({
        registeredArtStatus: "flagged",
        hasBlockchainRecord: false,
        reviewStatus: "needs_info",
      }),
    );
    expect(status).toBe("pending_review");
  });

  it("returns unknown when no data is available", () => {
    const status = deriveAuthorshipStatus(makeInput());
    expect(status).toBe("unknown");
  });

  it("returns verified when active with blockchain even if review is pending", () => {
    // A completed blockchain record must override a stale pending review state.
    const status = deriveAuthorshipStatus(
      makeInput({
        registeredArtStatus: "active",
        hasBlockchainRecord: true,
        reviewStatus: "pending",
      }),
    );
    expect(status).toBe("verified");
  });
});

describe("buildAuthorshipFact", () => {
  it("returns satisfied fact for verified status", () => {
    const fact = buildAuthorshipFact("verified");
    expect(fact.satisfied).toBe(true);
    expect(fact.detail).toBe("Authorship evidence verified");
  });

  it("returns unsatisfied fact for pending_review status", () => {
    const fact = buildAuthorshipFact("pending_review");
    expect(fact.satisfied).toBe(false);
    expect(fact.detail).toBe("Pending authorship verification");
    expect(fact.description).toContain("awaiting review");
  });

  it("returns unsatisfied fact for blockchain_pending status", () => {
    const fact = buildAuthorshipFact("blockchain_pending");
    expect(fact.satisfied).toBe(false);
    expect(fact.detail).toContain("blockchain registration in progress");
  });

  it("returns unsatisfied fact for blockchain_failed status", () => {
    const fact = buildAuthorshipFact("blockchain_failed");
    expect(fact.satisfied).toBe(false);
    expect(fact.detail).toContain("blockchain registration failed");
  });

  it("returns unsatisfied fact for rejected status", () => {
    const fact = buildAuthorshipFact("rejected");
    expect(fact.satisfied).toBe(false);
    expect(fact.detail).toBe("Authorship verification rejected");
  });

  it("returns unsatisfied fact for unknown status", () => {
    const fact = buildAuthorshipFact("unknown");
    expect(fact.satisfied).toBe(false);
    expect(fact.detail).toBe("Pending authorship verification");
  });
});
