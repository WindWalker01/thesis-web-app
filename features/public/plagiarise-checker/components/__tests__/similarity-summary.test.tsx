import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Summary now renders a MatchActionButton (auth + router).
vi.mock("@/features/(user)/auth/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: false, user: null, loading: false }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

import { SimilaritySummary } from "@/features/plagiarise-checker/components/similarity-summary";
import type { SearchResponse } from "@/features/plagiarise-checker/types";

function makeResult(overrides: Partial<SearchResponse> = {}): SearchResponse {
  return {
    filename: "test.jpg",
    success: true,
    original_hash: "abc123",
    db: null,
    web: null,
    best_match: null,
    hashes: { transforms: {}, blocks: {} },
    other_matches: [],
    ...overrides,
  };
}

const PREVIEW = "blob:preview";

describe("SimilaritySummary", () => {
  it("forwards the checked artwork preview to the report modal", async () => {
    const user = userEvent.setup();
    render(
      <SimilaritySummary
        preview={PREVIEW}
        filename="mine.png"
        result={makeResult({
          best_match: {
            type: "database",
            source: "Registered Artwork",
            url: "3213a9dc-ff10-40f2-8a1e-17017d1b40cb",
            similarity: 74.8,
            title: "PowerPuff Girls",
            imageUrl: "https://res.cloudinary.com/example/powerpuff.jpg",
          },
        })}
        onViewAnalysis={() => {}}
        onReset={() => {}}
      />,
    );

    await user.click(screen.getByRole("button", { name: /report artwork/i }));

    // The summary view is the default screen after analysis, so it must pass
    // its own preview through — otherwise the modal shows a placeholder while
    // the report still uploads the real file.
    expect(await screen.findByAltText("Artwork you uploaded")).toHaveAttribute(
      "src",
      PREVIEW,
    );
    expect(screen.queryByText(/no preview available/i)).toBeNull();
  });

  it("shows the best match identity and opens the detailed analysis", () => {
    const onViewAnalysis = vi.fn();
    render(
      <SimilaritySummary
        preview={PREVIEW}
        filename="mine.png"
        result={makeResult({
          best_match: {
            type: "database",
            source: "Registered Artwork",
            url: "3213a9dc-ff10-40f2-8a1e-17017d1b40cb",
            similarity: 74.8,
            title: "PowerPuff Girls",
            authorName: "Ruzzel Mendoza",
            imageUrl: "https://res.cloudinary.com/example/powerpuff.jpg",
          },
        })}
        onViewAnalysis={onViewAnalysis}
        onReset={() => {}}
      />,
    );

    expect(screen.getByText("Plagiarism Analysis")).toBeDefined();
    expect(screen.getByText("PowerPuff Girls")).toBeDefined();
    expect(screen.getByText("by Ruzzel Mendoza")).toBeDefined();
    expect(
      screen.getAllByText("Registered Artwork Database").length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("74.8%")).toBeDefined();

    screen.getByText("View Analysis").click();
    expect(onViewAnalysis).toHaveBeenCalledOnce();
  });

  it("shows a clean negative when no significant similarity is found", () => {
    render(
      <SimilaritySummary
        preview={PREVIEW}
        filename="mine.png"
        result={makeResult()}
        onViewAnalysis={() => {}}
        onReset={() => {}}
      />,
    );
    expect(
      screen.getAllByText("No significant similarity found").length,
    ).toBeGreaterThanOrEqual(1);
  });
});
