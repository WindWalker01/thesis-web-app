import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductStackSection } from "@/features/public/home/components/ProductStackSection";
import { stackEdgeFade, stackRailLeft } from "@/features/public/home/stack";

describe("ProductStackSection", () => {
  it("clips sideways overflow without a scroll container that would unpin the stage", () => {
    const { container } = render(<ProductStackSection />);
    const section = container.querySelector("#product-stack");

    expect(section?.className).toContain("overflow-x-clip");
    expect(section?.className).not.toContain("overflow-x-hidden");
    expect(container.querySelector("[data-stack-stage]")?.getAttribute("style")).toBeNull();
    expect(container.querySelector("[data-stack-fade]")).toHaveStyle({
      background: stackEdgeFade(0),
    });
  });

  it("starts on upload and steps through the workflow", () => {
    render(<ProductStackSection />);

    expect(
      screen.getByRole("heading", {
        name: "The whole path, or just the step you need.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("01/04")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Upload" })).toBeInTheDocument();
    const copyText = document.querySelector("[data-stack-copy-text]");
    expect(copyText?.className).toContain("transition-opacity");
    expect(copyText?.querySelector("a")).toBeNull();
    const learnMore = screen.getByRole("link", { name: /learn more/i });
    expect(learnMore).toHaveAttribute("href", "/upload-artwork");
    expect(learnMore).toHaveStyle({
      clipPath:
        "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)",
    });
    expect(screen.getByRole("img", { name: "Artwork upload form" })).toHaveAttribute(
      "src",
      "/landing-page-elements/upload-artwork.png",
    );
    expect(document.querySelectorAll("[data-rail-role='fork']")).toHaveLength(1);
    expect(document.querySelectorAll("[data-rail-role='line']")).toHaveLength(2);
    expect(document.querySelector("[data-rail-role='line']")).toHaveStyle({
      left: stackRailLeft(1, 4),
    });
    expect(document.querySelectorAll("[data-stack-rail]")).toHaveLength(3);
    expect(document.querySelector("[data-rail-anchor='output']")?.className).toContain(
      "bg-blue-500",
    );
    expect(document.querySelectorAll("[data-rail-anchor='output']")).toHaveLength(5);
    expect(document.querySelectorAll("[data-rail-anchor='input']")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Prev" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(document.querySelector("[data-stack-fade]")).toHaveStyle({
      background: stackEdgeFade(1),
    });
    expect(screen.getByText("02/04")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Fingerprints" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /learn more/i })).toHaveAttribute(
      "href",
      "/plagiarism-checker",
    );
    expect(
      screen.getByRole("img", { name: "Similarity check results" }),
    ).toHaveAttribute(
      "src",
      "/landing-page-elements/similiarity-checking.png",
    );

    fireEvent.click(screen.getByRole("button", { name: "Go to step 4" }));
    expect(screen.getByText("04/04")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Monitor" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /learn more/i })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Prev" }));
    expect(screen.getByText("03/04")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "On-chain record" }),
    ).toBeInTheDocument();
  });
});
