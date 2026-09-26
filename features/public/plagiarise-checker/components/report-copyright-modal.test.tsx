import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportCopyrightModal } from "./report-copyright-modal";
import type { PlagiarismMatchContext } from "../lib/match-source";

const context: PlagiarismMatchContext = {
  origin: "internal",
  matchedArtworkId: "11111111-1111-4111-8111-111111111111",
  matchedArtworkTitle: "Sunset Over Water",
  matchedArtworkUrl: "/community/post-1",
  matchedArtworkImageUrl: "https://cdn.test/artwork.png",
  matchedArtworkCommunityUrl: "/community/post-1",
  matchedArtworkAuthor: "Ada",
  externalUrl: null,
  externalSource: null,
  similarity: 92.5,
  originalHash: "0xabc",
  scanId: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ReportCopyrightModal", () => {
  it("renders the matched artwork as a visual card, not a raw URL", () => {
    render(
      <ReportCopyrightModal
        open
        onOpenChange={() => {}}
        context={context}
        onSubmit={() => {}}
      />,
    );

    expect(screen.getByText("Sunset Over Water")).toBeInTheDocument();
    expect(screen.getByText("by Ada")).toBeInTheDocument();
    expect(screen.getByText("92.5%")).toBeInTheDocument();

    const preview = screen.getByAltText("Sunset Over Water");
    expect(preview).toHaveAttribute("src", "https://cdn.test/artwork.png");

    // The URL is a link on the artwork, never shown as standalone text.
    expect(screen.getByRole("link", { name: /view registered artwork/i })).toHaveAttribute(
      "href",
      "/community/post-1",
    );
    expect(screen.queryByText("https://cdn.test/artwork.png")).not.toBeInTheDocument();
  });

  it("blocks submission until proof is provided", async () => {
    const onSubmit = vi.fn();
    render(
      <ReportCopyrightModal
        open
        onOpenChange={() => {}}
        context={context}
        onSubmit={onSubmit}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /submit report/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText(/please provide the original source/i),
    ).toBeInTheDocument();
  });

  it("submits the trimmed proof and details", async () => {
    const onSubmit = vi.fn();
    render(
      <ReportCopyrightModal
        open
        onOpenChange={() => {}}
        context={context}
        onSubmit={onSubmit}
      />,
    );

    await userEvent.type(
      screen.getByLabelText(/original source \/ proof/i),
      "  https://instagram.com/p/original  ",
    );
    await userEvent.type(
      screen.getByLabelText(/additional details/i),
      "Published 2023",
    );
    await userEvent.click(screen.getByRole("button", { name: /submit report/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      proof: "https://instagram.com/p/original",
      details: "Published 2023",
    });
  });

  it("prefills the reporter text restored after signing in", () => {
    render(
      <ReportCopyrightModal
        open
        onOpenChange={() => {}}
        context={context}
        initialProof="My original source"
        initialDetails="Drafted in 2022"
        onSubmit={() => {}}
      />,
    );

    expect(screen.getByLabelText(/original source \/ proof/i)).toHaveValue(
      "My original source",
    );
    expect(screen.getByLabelText(/additional details/i)).toHaveValue(
      "Drafted in 2022",
    );
  });

  it("shows the reporter's own upload beside the matched artwork", () => {
    render(
      <ReportCopyrightModal
        open
        onOpenChange={() => {}}
        context={context}
        originalPreviewUrl="blob:local-upload"
        onSubmit={() => {}}
      />,
    );

    expect(screen.getByText(/your upload/i)).toBeInTheDocument();
    expect(screen.getByText(/matched artwork/i)).toBeInTheDocument();
    expect(screen.getByAltText("Artwork you uploaded")).toHaveAttribute(
      "src",
      "blob:local-upload",
    );
  });

  it("falls back to a placeholder when no upload preview is available", () => {
    render(
      <ReportCopyrightModal
        open
        onOpenChange={() => {}}
        context={context}
        onSubmit={() => {}}
      />,
    );

    // The reporter's upload has no preview, but the matched artwork still does.
    expect(screen.getAllByText(/no preview available/i)).toHaveLength(1);
    expect(screen.getByAltText("Sunset Over Water")).toBeInTheDocument();
  });

  it("surfaces a server error", () => {
    render(
      <ReportCopyrightModal
        open
        onOpenChange={() => {}}
        context={context}
        error="You have already submitted this match for review."
        onSubmit={() => {}}
      />,
    );

    expect(
      screen.getByText("You have already submitted this match for review."),
    ).toBeInTheDocument();
  });
});