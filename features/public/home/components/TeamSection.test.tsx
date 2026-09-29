import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TeamSection } from "@/features/public/home/components/TeamSection";

describe("TeamSection", () => {
  it("reveals each role on hover and only links members with a portfolio", () => {
    const { container } = render(<TeamSection />);
    const section = container.querySelector("#team");

    expect(
      screen.getByRole("heading", {
        name: "The researchers behind the project",
      }),
    ).toBeInTheDocument();
    expect(section?.innerHTML).not.toMatch(/bg-white|border-slate-200|shadow-sm/);
    expect(section?.innerHTML).toContain("border-blue-500");
    expect(section?.innerHTML).toContain("opacity-0");
    expect(section?.innerHTML).toContain("group-hover:opacity-100");
    expect(section?.innerHTML).toContain("group-hover:-translate-y-12");
    expect(section?.innerHTML).toContain("group-hover:scale-105");

    const ruzzel = screen.getByRole("link", { name: "Ruzzel, Lead Developer" });
    expect(ruzzel).toHaveAttribute("href", "https://ruzzel.vercel.app");
    expect(ruzzel).toHaveAttribute("target", "_blank");

    const tenshin = screen.getByRole("link", {
      name: "Tenshin, Front/Backend Engineer",
    });
    expect(tenshin).toHaveAttribute("href", "https://tenshinponteres.dev");

    expect(screen.getByRole("heading", { name: "Nathaniel" })).toBeInTheDocument();
    expect(screen.getByText("UI/UX Designer")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Nathaniel/ })).toBeNull();
  });
});
