import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PerceptualHashDetails } from "@/features/public/plagiarise-checker/components/perceptual-hash-details";

describe("PerceptualHashDetails", () => {
  it("renders transform and block hash tables", () => {
    render(
      <PerceptualHashDetails
        transforms={{ "0": { phash: "abc", dhash: "def", whash: "ghi" } }}
        blocks={{
          "0.625:top_left": { phash: "jkl", dhash: "mno", whash: "pqr", entropy: 1.23 },
        }}
      />,
    );
    expect(screen.getByText("Perceptual Hash Details")).toBeDefined();
    expect(
      screen.getByText("Transform Variants (0°, 90°, 180°, 270°, Mirror, Flip)"),
    ).toBeDefined();
    expect(
      screen.getByText("Block Regions (Multi-Scale: 0.625, 0.75, 1.0)"),
    ).toBeDefined();
  });
});
