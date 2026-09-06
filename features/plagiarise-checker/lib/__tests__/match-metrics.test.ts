import { describe, it, expect } from "vitest";
import {
  getPrimaryScore,
  isNoEvidenceMatch,
  getEvidenceSummary,
  isLowContent,
  getDominantTransformLabel,
} from "@/features/plagiarise-checker/lib/match-metrics";
import type { MatchMetrics, SearchMatch, OtherSearchMatch } from "@/features/plagiarise-checker/types";

/** Match entry from the real post-`6f114bb` smoke test (see response_1788585533000.json). */
const v2CleanNegative: MatchMetrics = {
  raw_similarity: 0,
  raw_similarity_legacy: 70.56,
  calibrated_confidence: 0,
  transform_consistency: 0,
  transform_agreements: 0,
  block_agreements: 0,
  content_blocks_used: 5,
  low_content_warning: false,
};

const v2Positive: MatchMetrics = {
  raw_similarity: 22.4,
  raw_similarity_legacy: 64.1,
  calibrated_confidence: 99.2,
  transform_consistency: 1.0,
  transform_agreements: 4,
  block_agreements: 3,
  content_blocks_used: 5,
  low_content_warning: false,
};

/** Pre-v2 payload: none of the new fields exist. */
const legacyMatch: MatchMetrics = {};

describe("getPrimaryScore", () => {
  it("prefers calibrated_confidence when present", () => {
    expect(getPrimaryScore({ ...v2Positive, similarity: 22.4 })).toBe(99.2);
  });

  it("falls back to similarity for legacy responses", () => {
    expect(getPrimaryScore({ similarity: 61.45 })).toBe(61.45);
  });

  it("returns 0 for null/undefined/empty matches", () => {
    expect(getPrimaryScore(null)).toBe(0);
    expect(getPrimaryScore(undefined)).toBe(0);
    expect(getPrimaryScore(legacyMatch)).toBe(0);
  });
});

describe("isNoEvidenceMatch", () => {
  it("is true for the v2 true-negative tuple (all four metrics zero)", () => {
    expect(isNoEvidenceMatch(v2CleanNegative)).toBe(true);
  });

  it("is false when any evidence metric is nonzero", () => {
    expect(isNoEvidenceMatch({ ...v2CleanNegative, raw_similarity: 0.1 })).toBe(false);
    expect(isNoEvidenceMatch({ ...v2CleanNegative, transform_consistency: 1.0 })).toBe(false);
    expect(isNoEvidenceMatch({ ...v2CleanNegative, block_agreements: 1 })).toBe(false);
    expect(isNoEvidenceMatch({ ...v2CleanNegative, transform_agreements: 1 })).toBe(false);
  });

  it("is false for legacy responses missing the v2 fields (graceful fallback)", () => {
    expect(isNoEvidenceMatch(legacyMatch)).toBe(false);
    expect(isNoEvidenceMatch({ raw_similarity: 0 })).toBe(false);
  });

  it("is false for null/undefined", () => {
    expect(isNoEvidenceMatch(null)).toBe(false);
    expect(isNoEvidenceMatch(undefined)).toBe(false);
  });
});

describe("getEvidenceSummary", () => {
  it("describes a positive match with block and transform agreements", () => {
    expect(getEvidenceSummary(v2Positive)).toBe(
      "3 of 5 regions matched across 4 of 6 transform variants"
    );
  });

  it("backs up the clean-negative state", () => {
    expect(getEvidenceSummary(v2CleanNegative)).toBe("0 of 5 regions matched");
  });

  it("returns null for legacy responses without block_agreements", () => {
    expect(getEvidenceSummary(legacyMatch)).toBe(null);
    expect(getEvidenceSummary(null)).toBe(null);
  });
});

describe("isLowContent", () => {
  it("is true only when low_content_warning is explicitly true", () => {
    expect(isLowContent({ ...v2CleanNegative, low_content_warning: true })).toBe(true);
    expect(isLowContent(v2CleanNegative)).toBe(false);
    expect(isLowContent(legacyMatch)).toBe(false);
    expect(isLowContent(null)).toBe(false);
  });
});

describe("getDominantTransformLabel", () => {
  it("maps API transform keys to readable labels", () => {
    expect(getDominantTransformLabel("180")).toBe("180° rotation");
    expect(getDominantTransformLabel("mirror")).toBe("horizontal mirror");
  });

  it("returns null for null, undefined, or unknown values", () => {
    expect(getDominantTransformLabel(null)).toBe(null);
    expect(getDominantTransformLabel(undefined)).toBe(null);
    expect(getDominantTransformLabel("bogus")).toBe(null);
  });
});

/** The shared mapping must work identically on all four match-object shapes. */
describe("shared mapping across response shapes", () => {
  const dbMatch: SearchMatch = {
    type: "database",
    source: "Registered Artwork",
    url: "3213a9dc-ff10-40f2-8a1e-17017d1b40cb",
    similarity: 0,
    ...v2CleanNegative,
  };

  const otherMatch: OtherSearchMatch = {
    source: "Database",
    link: "https://example.com/art.jpg",
    url: "https://example.com/art.jpg",
    artwork_id: "3213a9dc-ff10-40f2-8a1e-17017d1b40cb",
    similarity: 0,
    ...v2CleanNegative,
  };

  it("treats db, web, best_match and other_matches entries the same", () => {
    for (const m of [dbMatch, otherMatch]) {
      expect(isNoEvidenceMatch(m)).toBe(true);
      expect(getPrimaryScore(m)).toBe(0);
      expect(getEvidenceSummary(m)).toBe("0 of 5 regions matched");
    }
  });
});
