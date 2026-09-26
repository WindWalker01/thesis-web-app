import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// The match card now renders a MatchActionButton, which depends on auth and
// the Next.js router. Mock them so the card can render without providers/env.
vi.mock("@/features/user/auth/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: false, user: null, loading: false }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

import { ArtworkMatchCard } from "@/features/public/plagiarise-checker/components/artwork-match-card";
import type { SearchMatch } from "@/features/public/plagiarise-checker/types";

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

describe("ArtworkMatchCard", () => {
  it("renders the clean-negative state without legal-conclusion language", () => {
    render(
      <ArtworkMatchCard match={makeMatch()} sourceType="registered_artwork" />,
    );
    expect(screen.getByText("No significant similarity found")).toBeDefined();
    expect(screen.queryByText(/plagiarism/i)).toBeNull();
  });

  it("shows the raw similarity as the headline score for a real match", () => {
    render(
      <ArtworkMatchCard
        match={makeMatch({
          similarity: 22.4,
          raw_similarity: 22.4,
          calibrated_confidence: 99.2,
          transform_consistency: 1.0,
          transform_agreements: 4,
          block_agreements: 3,
        })}
        sourceType="web"
      />,
    );
    expect(screen.getByText("22.4%")).toBeDefined();
    expect(screen.queryByText(/99\.2/)).toBeNull();
    expect(screen.queryByText(/70\.56/)).toBeNull();
  });

  it("renders registered artwork identity instead of the database UUID as primary info", () => {
    render(
      <ArtworkMatchCard
        match={makeMatch({
          similarity: 74.8,
          raw_similarity: 74.8,
          transform_consistency: 1.0,
          transform_agreements: 6,
          block_agreements: 4,
          title: "PowerPuff Girls",
          authorName: "Ruzzel Mendoza",
          registeredAt: "2026-09-14T00:00:00.000Z",
          status: "active",
          imageUrl: "https://res.cloudinary.com/example/powerpuff.jpg",
        })}
        sourceType="registered_artwork"
        isBest
      />,
    );

    expect(screen.getByText("Registered Artwork")).toBeDefined();
    expect(screen.getByText("Best Match")).toBeDefined();
    expect(screen.getByText("PowerPuff Girls")).toBeDefined();
    expect(screen.getByText("by Ruzzel Mendoza")).toBeDefined();
    expect(screen.getByText("Active")).toBeDefined();
    expect(screen.getByText("Match Information")).toBeDefined();
    expect(screen.getByText("Registered Artwork Database")).toBeDefined();
    expect(screen.getByText("4 of 5")).toBeDefined();
    expect(screen.getByText("6 of 6")).toBeDefined();
    expect(screen.queryByText("DATABASE URL")).toBeNull();
  });

  it("moves the artwork UUID into expandable Technical Details", () => {
    const uuid = "3213a9dc-ff10-40f2-8a1e-17017d1b40cb";
    render(
      <ArtworkMatchCard
        match={makeMatch({ similarity: 74.8, raw_similarity: 74.8, url: uuid })}
        sourceType="registered_artwork"
      />,
    );

    expect(screen.queryByText(uuid)).toBeNull();
    fireEvent.click(screen.getByText("Technical Details"));
    expect(screen.getByText("Artwork ID")).toBeDefined();
    expect(screen.getByText(uuid)).toBeDefined();
  });

  it("renders web sources with a source link instead of artwork identity", () => {
    render(
      <ArtworkMatchCard
        match={makeMatch({
          type: "internet",
          source: "Buhitter",
          url: "https://example.com/img.jpg",
          link: "https://example.com/page",
          similarity: 34.25,
          raw_similarity: 34.25,
          transform_consistency: 0,
          transform_agreements: 0,
          block_agreements: 2,
        })}
        sourceType="web"
      />,
    );
    expect(screen.getByText("Web Source")).toBeDefined();
    expect(screen.getByText("SOURCE LINK")).toBeDefined();
  });
});
