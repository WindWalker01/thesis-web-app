import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CtaSection } from "@/features/public/home/components/CtaSection";

describe("CtaSection", () => {
  it("sends guests to register and keeps the about link", () => {
    const { container } = render(<CtaSection signedIn={false} />);
    const section = container.querySelector("#get-started");

    expect(
      screen.getByRole("heading", { name: /start documenting your artwork today/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "GET STARTED" })).toHaveAttribute(
      "href",
      "/register",
    );
    expect(screen.getByRole("link", { name: "ABOUT US" })).toHaveAttribute(
      "href",
      "/about",
    );
    expect(section?.innerHTML).toContain("bg-blue-700");
    expect(section?.innerHTML).toContain("text-blue-500");
    expect(section?.innerHTML).not.toMatch(/orange|amber|font-black/);
  });

  it("sends signed-in artists to upload", () => {
    render(<CtaSection signedIn />);

    expect(
      screen.getByRole("link", { name: "UPLOAD ARTWORK" }),
    ).toHaveAttribute("href", "/upload-artwork");
    expect(screen.queryByRole("link", { name: "GET STARTED" })).toBeNull();
  });
});
