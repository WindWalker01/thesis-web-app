import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MatchCard } from "@/features/plagiarise-checker/components/MatchCard";
import type { SearchMatch } from "@/features/plagiarise-checker/types";

function makeMatch(overrides: Partial<SearchMatch> = {}): SearchMatch {
  return {
    type: "database",
    source: "Registered Artwork",
    url: "3213a9dc-ff10-40f2-8a1e-17017d1b40cb",
    similarity: 0,
    raw_similarity: 0,
    raw_similarity_legacy: 70.56,
    calibrated_confidence: 0,
    transform_consistency: 0,
    transform_agreements: 0,
    block_agreements: 0,
    content_blocks_used: 5,
    low_content_warning: false,
    ...overrides,
  };
}

describe("MatchCard", () => {
  it("renders the explicit 'No plagiarism match found' state for a clean negative", () => {
    render(<MatchCard match={makeMatch()} />);
    expect(screen.getByText("No plagiarism match found")).toBeDefined();
    expect(screen.getByText("0 of 5 regions matched")).toBeDefined();
  });

  it("shows the calibrated confidence as the headline score for a real match", () => {
    render(
      <MatchCard
        match={makeMatch({
          similarity: 22.4,
          raw_similarity: 22.4,
          calibrated_confidence: 99.2,
          transform_consistency: 1.0,
          transform_agreements: 4,
          block_agreements: 3,
        })}
      />
    );
    // 99.2 (calibrated_confidence), not 22.4 (similarity) and never 70.56 (legacy)
    expect(screen.getByText("99.2%")).toBeDefined();
    expect(screen.queryByText(/70\.56/)).toBeNull();
    expect(screen.getByText("3 of 5 regions matched across 4 of 6 transform variants")).toBeDefined();
  });

  it("falls back to similarity and skips evidence copy on legacy responses", () => {
    render(
      <MatchCard
        match={makeMatch({
          similarity: 61.45,
          raw_similarity: undefined,
          raw_similarity_legacy: undefined,
          calibrated_confidence: undefined,
          transform_consistency: undefined,
          transform_agreements: undefined,
          block_agreements: undefined,
        })}
      />
    );
    expect(screen.getByText("61.5%")).toBeDefined();
    expect(screen.queryByText("No plagiarism match found")).toBeNull();
    expect(screen.queryByText(/regions matched/)).toBeNull();
  });

  it("surfaces the low-content caveat when flagged", () => {
    render(<MatchCard match={makeMatch({ low_content_warning: true })} />);
    expect(screen.getByText(/Low image detail/)).toBeDefined();
  });
});
