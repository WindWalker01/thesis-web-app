import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { ArtworkLicenseSelector } from "./ArtworkLicenseSelector";
import { LICENSE_DISCLAIMER } from "@/features/artwork-licensing/lib/licenses";

describe("ArtworkLicenseSelector (dropdown variant)", () => {
  it("renders a compact combobox instead of radio cards", () => {
    render(
      <ArtworkLicenseSelector
        value="all-rights-reserved"
        onChange={vi.fn()}
        variant="dropdown"
      />,
    );

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });

  it("still renders the selected license summary and disclaimer", () => {
    render(
      <ArtworkLicenseSelector
        value="all-rights-reserved"
        onChange={vi.fn()}
        variant="dropdown"
      />,
    );

    // The name appears in both the combobox trigger and the summary card.
    expect(screen.getAllByText("All Rights Reserved").length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText(LICENSE_DISCLAIMER)).toBeInTheDocument();
  });

  it("shows the official terms link when a CC license is selected", () => {
    render(
      <ArtworkLicenseSelector
        value="cc-by"
        onChange={vi.fn()}
        variant="dropdown"
      />,
    );

    const link = screen.getByText("View Full License Terms");
    expect(link.closest("a")?.getAttribute("href")).toMatch(
      /creativecommons\.org/,
    );
  });

  it("reflects a new selection when the value prop changes", () => {
    const { rerender } = render(
      <ArtworkLicenseSelector
        value="all-rights-reserved"
        onChange={vi.fn()}
        variant="dropdown"
      />,
    );

    // ARR shows the permission-required note; a CC license shows terms link.
    expect(
      screen.getByText(/Permission required for other uses/),
    ).toBeInTheDocument();

    rerender(
      <ArtworkLicenseSelector
        value="cc-by-nd"
        onChange={vi.fn()}
        variant="dropdown"
      />,
    );

    expect(screen.getByText("View Full License Terms")).toBeInTheDocument();
    expect(
      screen.queryByText(/Permission required for other uses/),
    ).not.toBeInTheDocument();
  });
});