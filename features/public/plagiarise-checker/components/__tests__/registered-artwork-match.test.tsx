import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RegisteredArtworkMatch } from "@/features/public/plagiarise-checker/components/registered-artwork-match";
import type { SearchMatch } from "@/features/public/plagiarise-checker/types";

function makeMatch(overrides: Partial<SearchMatch> = {}): SearchMatch {
  return {
    type: "database",
    source: "Registered Artwork",
    url: "3213a9dc-ff10-40f2-8a1e-17017d1b40cb",
    similarity: 74.8,
    raw_similarity: 74.8,
    transform_consistency: 1.0,
    transform_agreements: 6,
    block_agreements: 4,
    title: "PowerPuff Girls",
    authorName: "Ruzzel Mendoza",
    registeredAt: "2026-09-14T00:00:00.000Z",
    status: "active",
    licenseName: "Creative Commons Attribution 4.0 International",
    imageUrl: "https://res.cloudinary.com/example/powerpuff.jpg",
    communityUrl: "/community/post-1",
    ...overrides,
  };
}

describe("RegisteredArtworkMatch — blocked-registration", () => {
  it("shows the block reason, matched artwork metadata, and view action", () => {
    render(
      <RegisteredArtworkMatch
        match={makeMatch()}
        variant="blocked-registration"
      />,
    );

    expect(screen.getByText("Registration Blocked")).toBeDefined();
    expect(screen.getByText(/significant visual similarity/i)).toBeDefined();
    expect(screen.getAllByText("74.8%").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("PowerPuff Girls").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("by Ruzzel Mendoza")).toBeDefined();
    expect(
      screen.getByText("Creative Commons Attribution 4.0 International"),
    ).toBeDefined();
    expect(
      screen.getAllByText("Registered Artwork Database").length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("4 of 5")).toBeDefined();
    expect(screen.getByText("6 of 6")).toBeDefined();
    expect(screen.getByText("View Registered Artwork")).toBeDefined();
    expect(screen.getByText(/perceptual hash similarity/i)).toBeDefined();
  });

  it("shows 'Not available' for missing metadata fields", () => {
    render(
      <RegisteredArtworkMatch
        match={makeMatch({
          title: null,
          authorName: null,
          registeredAt: null,
          status: null,
          licenseName: null,
          imageUrl: null,
          communityUrl: null,
        })}
        variant="blocked-registration"
      />,
    );
    expect(screen.getAllByText("Not available").length).toBeGreaterThanOrEqual(4);
  });
});

describe("RegisteredArtworkMatch — summary", () => {
  it("renders a compact summary with title and similarity", () => {
    render(<RegisteredArtworkMatch match={makeMatch()} variant="summary" />);
    expect(screen.getByText("PowerPuff Girls")).toBeDefined();
    expect(screen.getByText("74.8%")).toBeDefined();
    expect(screen.getByText("by Ruzzel Mendoza")).toBeDefined();
  });
});
