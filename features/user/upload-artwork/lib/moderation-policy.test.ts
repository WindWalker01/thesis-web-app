import { describe, expect, it } from "vitest";

import { getArtworkStatusFromSimilarity } from "@/features/(user)/upload-artwork/lib/moderation-policy";

const DEFAULT_OPTIONS = {
  flaggedThreshold: 80,
  manualReviewThreshold: 60,
};

describe("getArtworkStatusFromSimilarity", () => {
  it("auto-rejects a database match at or above the flagged (similarity) threshold", () => {
    for (const similarity of [80, 85, 99.99, 100]) {
      const result = getArtworkStatusFromSimilarity(
        similarity,
        "database",
        DEFAULT_OPTIONS,
      );

      expect(result.artworkStatus).toBe("rejected");
      expect(result.shouldClassify).toBe(false);
      expect(result.moderationMessage).toMatch(/upload blocked/i);
    }

    expect(
      getArtworkStatusFromSimilarity(95, "database", DEFAULT_OPTIONS)
        .moderationMessage,
    ).toContain("95%");
  });

  it("holds internet matches at or above the flagged threshold for manual review (never auto-rejects)", () => {
    for (const similarity of [80, 85, 100]) {
      const result = getArtworkStatusFromSimilarity(
        similarity,
        "internet",
        DEFAULT_OPTIONS,
      );

      expect(result.artworkStatus).toBe("under_review");
      expect(result.shouldClassify).toBe(true);
      expect(result.moderationMessage).toMatch(/internet match/i);
    }
  });

  it("places moderate similarity (>= manualReviewThreshold but < flaggedThreshold) under review with classification", () => {
    // Database match below the rejection threshold → manual review
    const db = getArtworkStatusFromSimilarity(70, "database", DEFAULT_OPTIONS);
    // Internet match below the rejection threshold → manual review
    const web = getArtworkStatusFromSimilarity(79.99, "internet", DEFAULT_OPTIONS);

    expect(db.artworkStatus).toBe("under_review");
    expect(db.shouldClassify).toBe(true);
    expect(web.artworkStatus).toBe("under_review");
    expect(web.shouldClassify).toBe(true);
  });

  it("clears low similarity (< manualReviewThreshold) to pending_blockchain with classification", () => {
    const db = getArtworkStatusFromSimilarity(59.99, "database", DEFAULT_OPTIONS);
    const web = getArtworkStatusFromSimilarity(59.99, "internet", DEFAULT_OPTIONS);

    expect(db.artworkStatus).toBe("pending_blockchain");
    expect(db.shouldClassify).toBe(true);
    expect(web.artworkStatus).toBe("pending_blockchain");
    expect(web.shouldClassify).toBe(true);
  });

  it("treats a low-similarity internet match the same as clean (pending_blockchain)", () => {
    const result = getArtworkStatusFromSimilarity(
      10,
      "internet",
      DEFAULT_OPTIONS,
    );

    expect(result.artworkStatus).toBe("pending_blockchain");
    expect(result.shouldClassify).toBe(true);
  });

  it("accepts custom thresholds via options", () => {
    // With a custom flaggedThreshold of 90, a db score of 85 should NOT be rejected
    const result = getArtworkStatusFromSimilarity(85, "database", {
      flaggedThreshold: 90,
      manualReviewThreshold: 80,
    });

    expect(result.artworkStatus).toBe("under_review");
    expect(result.shouldClassify).toBe(true);

    // ...but a db score of 90 with the same thresholds is rejected
    expect(
      getArtworkStatusFromSimilarity(90, "database", {
        flaggedThreshold: 90,
        manualReviewThreshold: 80,
      }).artworkStatus,
    ).toBe("rejected");
  });
});
