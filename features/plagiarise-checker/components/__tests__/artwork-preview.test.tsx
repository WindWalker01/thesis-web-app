import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArtworkPreview } from "@/features/plagiarise-checker/components/artwork-preview";
import type { ArtworkFileMeta } from "@/features/plagiarise-checker/lib/file-metadata";

const META: ArtworkFileMeta = {
  size: 1536 * 1024,
  type: "image/png",
  width: 1920,
  height: 1080,
};

describe("ArtworkPreview", () => {
  it("shows review metadata and the similarity explanation", () => {
    render(
      <ArtworkPreview
        preview="blob:preview"
        filename="artwork.png"
        meta={META}
        onReplace={() => {}}
        onAnalyze={() => {}}
      />,
    );
    expect(screen.getByText("Review Artwork")).toBeDefined();
    expect(screen.getByText("artwork.png")).toBeDefined();
    expect(screen.getByText("image/png")).toBeDefined();
    expect(screen.getByText("1.5 MB")).toBeDefined();
    expect(screen.getByText("1920 × 1080 px")).toBeDefined();
    expect(
      screen.getByText(/compared against registered artworks/i),
    ).toBeDefined();
  });

  it("invokes analyze and replace handlers", () => {
    const onAnalyze = vi.fn();
    const onReplace = vi.fn();
    render(
      <ArtworkPreview
        preview="blob:preview"
        filename="a.png"
        meta={META}
        onReplace={onReplace}
        onAnalyze={onAnalyze}
      />,
    );
    screen.getByText("Analyze Artwork").click();
    expect(onAnalyze).toHaveBeenCalledOnce();
    screen.getByText("Replace Artwork").click();
    expect(onReplace).toHaveBeenCalledOnce();
  });
});
