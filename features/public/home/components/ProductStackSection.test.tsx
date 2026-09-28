import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductStackSection } from "@/features/public/home/components/ProductStackSection";

describe("ProductStackSection", () => {
  it("starts on upload and steps through the workflow", () => {
    render(<ProductStackSection />);

    expect(
      screen.getByRole("heading", {
        name: "The whole path, or just the step you need.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("01/04")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Upload" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /learn more/i })).toHaveAttribute(
      "href",
      "/upload-artwork",
    );
    expect(screen.getByRole("button", { name: "Prev" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("02/04")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Fingerprints" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /learn more/i })).toHaveAttribute(
      "href",
      "/plagiarism-checker",
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
