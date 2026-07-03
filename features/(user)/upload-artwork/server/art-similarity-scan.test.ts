import { describe, expect, it } from "vitest";

import {
  buildSimilarityScanInsert,
  getPrimarySimilarityMatch,
  getSimilarityMatches,
  getSimilarityReportMatch,
} from "@/features/(user)/upload-artwork/server/art-similarity-scan";
import type {
  CheckPlagiarismWebResult,
  SearchMatch,
} from "@/features/plagiarise-checker/types";

function match(overrides: Partial<SearchMatch>): SearchMatch {
  return {
    type: "internet",
    source: "example.com",
    url: "https://example.com/a.png",
    similarity: 50,
    ...overrides,
  };
}

function result(
  overrides: Partial<CheckPlagiarismWebResult>,
): CheckPlagiarismWebResult {
  return {
    success: true,
    db: null,
    web: null,
    best_match: null,
    other_matches: null,
    ...overrides,
  };
}

describe("getSimilarityMatches", () => {
  it("normalizes, dedupes, and sorts matches by similarity descending", () => {
    const dup = match({ type: "internet", source: "s", url: "u", similarity: 40 });

    const matches = getSimilarityMatches(
      result({
        db: match({ type: "database", url: "db-1", similarity: 80 }),
        web: match({ type: "internet", url: "web-1", similarity: 90 }),
        // best_match duplicates db exactly → collapsed by the dedupe map
        best_match: match({ type: "database", url: "db-1", similarity: 80 }),
      }),
    );

    expect(matches).toHaveLength(2);
    expect(matches[0]?.similarity).toBe(90);
    expect(matches[1]?.similarity).toBe(80);

    void dup;
  });

  it("breaks similarity ties by weighting database matches first", () => {
    const matches = getSimilarityMatches(
      result({
        web: match({ type: "internet", url: "web-1", similarity: 75 }),
        db: match({ type: "database", url: "db-1", similarity: 75 }),
      }),
    );

    expect(matches).toHaveLength(2);
    expect(matches[0]?.type).toBe("database");
    expect(matches[1]?.type).toBe("internet");
  });

  it("drops fully-empty matches", () => {
    const matches = getSimilarityMatches(
      result({
        db: {
          type: "",
          source: "",
          url: "",
          similarity: null as unknown as number,
        },
      }),
    );

    expect(matches).toHaveLength(0);
  });
});

describe("getPrimarySimilarityMatch", () => {
  it("returns the top-ranked match", () => {
    const primary = getPrimarySimilarityMatch(
      result({
        db: match({ type: "database", url: "db-1", similarity: 60 }),
        web: match({ type: "internet", url: "web-1", similarity: 95 }),
      }),
    );

    expect(primary?.similarity).toBe(95);
    expect(primary?.type).toBe("internet");
  });

  it("returns null when there are no matches", () => {
    expect(getPrimarySimilarityMatch(result({}))).toBeNull();
  });
});

describe("getSimilarityReportMatch", () => {
  it("swaps a sub-70 database primary for an internet fallback that meets the threshold", () => {
    const report = getSimilarityReportMatch(
      result({
        db: match({ type: "database", url: "db-1", similarity: 65 }),
        web: match({ type: "internet", url: "web-1", similarity: 72 }),
      }),
    );

    expect(report?.type).toBe("internet");
    expect(report?.url).toBe("web-1");
  });

  it("returns the primary database match when it is >= 70", () => {
    const report = getSimilarityReportMatch(
      result({
        db: match({ type: "database", url: "db-1", similarity: 80 }),
        web: match({ type: "internet", url: "web-1", similarity: 40 }),
      }),
    );

    expect(report?.type).toBe("database");
    expect(report?.url).toBe("db-1");
  });

  it("returns null when a sub-70 database primary has no internet fallback", () => {
    const report = getSimilarityReportMatch(
      result({
        db: match({ type: "database", url: "db-1", similarity: 65 }),
      }),
    );

    expect(report).toBeNull();
  });

  it("returns null when the internet fallback is also below 70", () => {
    const report = getSimilarityReportMatch(
      result({
        db: match({ type: "database", url: "db-1", similarity: 65 }),
        web: match({ type: "internet", url: "web-1", similarity: 40 }),
      }),
    );

    expect(report).toBeNull();
  });

  it("returns null when the strongest match is a sub-70 internet match", () => {
    const report = getSimilarityReportMatch(
      result({
        web: match({ type: "internet", url: "web-1", similarity: 55 }),
      }),
    );

    expect(report).toBeNull();
  });

  it("shows an internet match that meets the threshold", () => {
    const report = getSimilarityReportMatch(
      result({
        web: match({ type: "internet", url: "web-1", similarity: 88 }),
      }),
    );

    expect(report?.type).toBe("internet");
    expect(report?.url).toBe("web-1");
  });

  it("returns null when there are no matches at all", () => {
    expect(getSimilarityReportMatch(result({}))).toBeNull();
  });
});

describe("buildSimilarityScanInsert", () => {
  it("builds a row with best-match summary and ranked matches", () => {
    const row = buildSimilarityScanInsert({
      artId: "art-1",
      ownerId: "owner-1",
      result: result({
        filename: "art.png",
        original_hash: "abc123",
        db: match({ type: "database", url: "db-1", similarity: 90, source: "db" }),
        web: match({ type: "internet", url: "web-1", similarity: 50, source: "web" }),
      }),
    });

    expect(row.art_id).toBe("art-1");
    expect(row.owner_id).toBe("owner-1");
    expect(row.status).toBe("completed");
    expect(row.filename).toBe("art.png");
    expect(row.original_hash).toBe("abc123");
    expect(row.total_matches).toBe(2);
    expect(row.best_similarity_percentage).toBe(90);
    expect(row.best_source).toBe("db");
    expect(row.matches[0]?.is_best).toBe(true);
    expect(row.matches[0]?.rank).toBe(1);
    expect(row.matches[1]?.is_best).toBe(false);
    expect(typeof row.completed_at).toBe("string");
  });
});
