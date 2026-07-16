import { describe, expect, it } from "vitest";

import { getArtworkStatusFromSimilarity } from "@/features/(user)/upload-artwork/lib/moderation-policy";

describe("getArtworkStatusFromSimilarity", () => {
  it("holds an exact (100%) internet match under review and classifies it", () => {
    const result = getArtworkStatusFromSimilarity(100, "internet");

    expect(result.artworkStatus).toBe("under_review");
    expect(result.shouldClassify).toBe(true);
    expect(result.moderationMessage).toMatch(/internet match/i);
  });

  it("flags high similarity (>= 87.5%) from any source and skips classification", () => {
    for (const source of ["database", "internet", null] as const) {
      const result = getArtworkStatusFromSimilarity(87.5, source);

      expect(result.artworkStatus).toBe("flagged");
      expect(result.shouldClassify).toBe(false);
    }

    expect(getArtworkStatusFromSimilarity(95, "database").artworkStatus).toBe(
      "flagged",
    );
  });

  it("places moderate similarity (70 – 87.49%) under review with classification", () => {
    const low = getArtworkStatusFromSimilarity(70, "database");
    const high = getArtworkStatusFromSimilarity(87.49, "internet");

    expect(low.artworkStatus).toBe("under_review");
    expect(low.shouldClassify).toBe(true);
    expect(high.artworkStatus).toBe("under_review");
    expect(high.shouldClassify).toBe(true);
  });

  it("clears low similarity (< 70%) to pending_blockchain with classification", () => {
    const result = getArtworkStatusFromSimilarity(69.99, "database");

    expect(result.artworkStatus).toBe("pending_blockchain");
    expect(result.shouldClassify).toBe(true);
  });

  it("treats a low-similarity internet match the same as clean (pending_blockchain)", () => {
    // Current behavior: only the 100% internet rule is source-specific; below
    // 70% all sources fall through to pending_blockchain.
    const result = getArtworkStatusFromSimilarity(10, "internet");

    expect(result.artworkStatus).toBe("pending_blockchain");
    expect(result.shouldClassify).toBe(true);
  });
});
