import { describe, expect, it } from "vitest";

import { getArtworkStatusFromSimilarity } from "@/features/(user)/upload-artwork/lib/moderation-policy";

describe("getArtworkStatusFromSimilarity", () => {
  it("holds an exact (100%) internet match under review and classifies it", () => {
    const result = getArtworkStatusFromSimilarity(100, "internet", {
      flaggedThreshold: 80,
      manualReviewThreshold: 60,
    });

    expect(result.artworkStatus).toBe("under_review");
    expect(result.shouldClassify).toBe(true);
    expect(result.moderationMessage).toMatch(/internet match/i);
  });

  it("flags high similarity (>= flaggedThreshold) from any source and skips classification", () => {
    for (const source of ["database", "internet", null] as const) {
      const result = getArtworkStatusFromSimilarity(80, source, {
        flaggedThreshold: 80,
        manualReviewThreshold: 60,
      });

      expect(result.artworkStatus).toBe("flagged");
      expect(result.shouldClassify).toBe(false);
    }

    expect(
      getArtworkStatusFromSimilarity(95, "database", {
        flaggedThreshold: 80,
        manualReviewThreshold: 60,
      }).artworkStatus,
    ).toBe("flagged");
  });

  it("places moderate similarity (>= manualReviewThreshold but < flaggedThreshold) under review with classification", () => {
    const low = getArtworkStatusFromSimilarity(60, "database", {
      flaggedThreshold: 80,
      manualReviewThreshold: 60,
    });
    const high = getArtworkStatusFromSimilarity(79.99, "internet", {
      flaggedThreshold: 80,
      manualReviewThreshold: 60,
    });

    expect(low.artworkStatus).toBe("under_review");
    expect(low.shouldClassify).toBe(true);
    expect(high.artworkStatus).toBe("under_review");
    expect(high.shouldClassify).toBe(true);
  });

  it("clears low similarity (< manualReviewThreshold) to pending_blockchain with classification", () => {
    const result = getArtworkStatusFromSimilarity(59.99, "database", {
      flaggedThreshold: 80,
      manualReviewThreshold: 60,
    });

    expect(result.artworkStatus).toBe("pending_blockchain");
    expect(result.shouldClassify).toBe(true);
  });

  it("treats a low-similarity internet match the same as clean (pending_blockchain)", () => {
    const result = getArtworkStatusFromSimilarity(10, "internet", {
      flaggedThreshold: 80,
      manualReviewThreshold: 60,
    });

    expect(result.artworkStatus).toBe("pending_blockchain");
    expect(result.shouldClassify).toBe(true);
  });

  it("accepts custom thresholds via options", () => {
    // With a custom flaggedThreshold of 90, a score of 85 should NOT be flagged
    const result = getArtworkStatusFromSimilarity(85, "database", {
      flaggedThreshold: 90,
      manualReviewThreshold: 80,
    });

    expect(result.artworkStatus).toBe("under_review");
    expect(result.shouldClassify).toBe(true);
  });
});
