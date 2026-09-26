import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// The detailed report now renders a MatchActionButton, which depends on auth
// and the Next.js router. Mock them so the report can render without env.
vi.mock("@/features/(user)/auth/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: true, user: { id: "user-1" }, loading: false }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

import { SimilarityReportDetailed } from "@/features/(user)/upload-artwork/components/similarity-report-detailed";
import type { SimilarityReport } from "@/features/(user)/upload-artwork/server/art-similarity-scan";

function makeReport(overrides: Partial<SimilarityReport> = {}): SimilarityReport {
  return {
    similarityPercentage: 74.8,
    source: "Registered Artwork",
    link: null,
    url: "3213a9dc-ff10-40f2-8a1e-17017d1b40cb",
    type: "database",
    previewImageUrl: "https://res.cloudinary.com/example/powerpuff.jpg",
    originalArtworkUrl: "https://res.cloudinary.com/example/my-upload.png",
    matchedArtworkId: "3213a9dc-ff10-40f2-8a1e-17017d1b40cb",
    matchedArtworkTitle: "PowerPuff Girls",
    matchedArtworkImageUrl: "https://res.cloudinary.com/example/powerpuff.jpg",
    matchedArtworkAuthorName: "Ruzzel Mendoza",
    matchedArtworkRegisteredAt: "2026-09-14T00:00:00.000Z",
    matchedArtworkStatus: "active",
    matchedArtworkLicenseName: "Creative Commons Attribution 4.0 International",
    matchedArtworkCommunityUrl: "/community/post-1",
    matchedRegions: 4,
    transformVariants: 6,
    minCombinedDistance: null,
    averageCombinedDistance: null,
    maxCombinedDistance: null,
    bestMatchPair: null,
    ...overrides,
  };
}

describe("SimilarityReportDetailed", () => {
  it("renders a full blocked registered-artwork match", () => {
    render(
      <SimilarityReportDetailed
        similarityReport={makeReport()}
        databaseMatches={[]}
        webMatches={[]}
        hasOtherMatches={false}
      />,
    );
    expect(screen.getByText("Registration Blocked")).toBeDefined();
    expect(
      screen.getAllByText("PowerPuff Girls").length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("by Ruzzel Mendoza")).toBeDefined();
  });

  it("renders a web source match for internet-blocked results", () => {
    render(
      <SimilarityReportDetailed
        similarityReport={makeReport({
          type: "internet",
          source: "example.com",
          link: "https://example.com/page",
          url: "https://example.com/img.jpg",
          matchedArtworkId: null,
          matchedArtworkTitle: null,
          matchedArtworkImageUrl: null,
          matchedArtworkAuthorName: null,
        })}
        databaseMatches={[]}
        webMatches={[]}
        hasOtherMatches={false}
      />,
    );
    expect(screen.getByText("Web Source Match")).toBeDefined();
  });

  it("shows a degraded state when metadata cannot be resolved", () => {
    render(
      <SimilarityReportDetailed
        similarityReport={makeReport({
          matchedArtworkTitle: null,
          matchedArtworkImageUrl: null,
          matchedArtworkAuthorName: null,
        })}
        databaseMatches={[]}
        webMatches={[]}
        hasOtherMatches={false}
      />,
    );
    expect(screen.getByText(/temporarily unavailable/i)).toBeDefined();
  });
});
