import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OtherMatches } from "@/features/public/plagiarise-checker/components/other-matches";
import type { OtherSearchMatch } from "@/features/public/plagiarise-checker/types";

function makeMatch(overrides: Partial<OtherSearchMatch> = {}): OtherSearchMatch {
  return {
    source: "Example",
    link: "https://example.com/page",
    url: "https://example.com/img.jpg",
    similarity: 0,
    raw_similarity: 0,
    transform_consistency: 0,
    transform_agreements: 0,
    block_agreements: 0,
    content_blocks_used: 5,
    low_content_warning: false,
    ...overrides,
  };
}

describe("OtherMatches", () => {
  it("is collapsed by default and expands to show matches", () => {
    render(
      <OtherMatches matches={[makeMatch({ source: "Example", similarity: 22 })]} />,
    );
    expect(screen.getByText("Other Matches")).toBeDefined();
    expect(screen.queryByText("Example")).toBeNull();
    fireEvent.click(screen.getByText("Other Matches"));
    expect(screen.getByText("Example")).toBeDefined();
  });

  it("uses neutral language for no-evidence entries", () => {
    render(<OtherMatches matches={[makeMatch()]} />);
    fireEvent.click(screen.getByText("Other Matches"));
    expect(screen.getByText("No significant similarity found")).toBeDefined();
  });
});
