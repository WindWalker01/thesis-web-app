import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { MatchThumbnail } from "@/features/(user)/upload-artwork/components/match-thumbnail";

describe("MatchThumbnail", () => {
  it("renders the 'Very Similar' tier at >= 90", () => {
    render(
      <MatchThumbnail
        imageUrl="https://x/a.png"
        similarity={92}
        label="Art A"
        icon="db"
      />,
    );

    expect(screen.getByText("Very Similar")).toBeInTheDocument();
  });

  it("renders the 'Similar' tier between 75 and 89.99", () => {
    render(
      <MatchThumbnail
        imageUrl="https://x/b.png"
        similarity={80}
        label="Art B"
        icon="db"
      />,
    );

    expect(screen.getByText("Similar")).toBeInTheDocument();
  });

  it("renders the 'Potential Match' tier below 75", () => {
    render(
      <MatchThumbnail
        imageUrl="https://x/c.png"
        similarity={40}
        label="Art C"
        icon="web"
      />,
    );

    expect(screen.getByText("Potential Match")).toBeInTheDocument();
  });

  it("wraps the tile in an external link when href is provided", () => {
    render(
      <MatchThumbnail
        imageUrl="https://x/d.png"
        similarity={95}
        label="Source D"
        href="https://source.example/d"
        icon="web"
      />,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://source.example/d");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("does not render a link when href is absent", () => {
    render(
      <MatchThumbnail
        imageUrl="https://x/e.png"
        similarity={95}
        label="Art E"
        icon="db"
      />,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders the match image with its label as alt text", () => {
    render(
      <MatchThumbnail
        imageUrl="https://x/f.png"
        similarity={95}
        label="Art F"
        icon="db"
      />,
    );

    expect(screen.getByAltText("Art F")).toHaveAttribute(
      "src",
      "https://x/f.png",
    );
  });
});
