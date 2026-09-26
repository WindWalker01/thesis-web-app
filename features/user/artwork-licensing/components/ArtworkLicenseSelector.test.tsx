import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { ArtworkLicenseSelector } from "./ArtworkLicenseSelector";
import { LICENSE_DISCLAIMER } from "@/features/artwork-licensing/lib/licenses";

describe("ArtworkLicenseSelector", () => {
  it("preselects the current license and renders its description", () => {
    render(
      <ArtworkLicenseSelector value="all-rights-reserved" onChange={vi.fn()} />,
    );

    expect(screen.getAllByText("All Rights Reserved").length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Permission from the artist is required/i),
    ).toBeInTheDocument();
  });

  it("renders the disclaimer", () => {
    render(
      <ArtworkLicenseSelector value="all-rights-reserved" onChange={vi.fn()} />,
    );

    expect(screen.getByText(LICENSE_DISCLAIMER)).toBeInTheDocument();
  });

  it("shows a link to full license terms for a Creative Commons license", () => {
    render(
      <ArtworkLicenseSelector value="cc-by" onChange={vi.fn()} />,
    );

    const link = screen.getByText("View Full License Terms");
    expect(link.closest("a")?.getAttribute("href")).toMatch(
      /creativecommons\.org/,
    );
  });

  it("notifies the parent when a new license is selected", () => {
    const onChange = vi.fn();
    render(
      <ArtworkLicenseSelector value="all-rights-reserved" onChange={onChange} />,
    );

    fireEvent.click(screen.getByLabelText(/CC BY-NC-SA 4.0/i));

    expect(onChange).toHaveBeenCalledWith("cc-by-nc-sa");
  });
});