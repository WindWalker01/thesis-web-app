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
    expect(section?.innerHTML).toContain("from-blue-100");
    expect(section?.innerHTML).toContain("to-blue-50");
    expect(section?.innerHTML).toContain("dark:from-blue-950");
    expect(section?.innerHTML).toContain("dark:to-blue-900");
    expect(section?.innerHTML).toContain("text-blue-600");
    expect(section?.innerHTML).toContain("dark:text-blue-400");
    expect(section?.innerHTML).toContain("bg-blue-700");
    expect(section?.innerHTML).toContain("bg-slate-300");
    expect(section?.innerHTML).toContain("dark:bg-white/25");
    expect(section?.innerHTML).not.toMatch(/orange|amber|font-black/);

    const grid = section?.querySelector("[data-cta-grid]") as HTMLElement;
    expect(grid).toBeTruthy();
    expect(grid.style.backgroundSize).toBe("48px 48px");
    expect(grid.style.maskImage).toContain("linear-gradient(to top");
  });

  it("sends signed-in artists to upload", () => {
    render(<CtaSection signedIn />);

    expect(
      screen.getByRole("link", { name: "UPLOAD ARTWORK" }),
    ).toHaveAttribute("href", "/upload-artwork");
    expect(screen.queryByRole("link", { name: "GET STARTED" })).toBeNull();
  });
});
