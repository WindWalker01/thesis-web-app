import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PerceptualHashingSection } from "@/features/public/home/components/PerceptualHashingSection";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) =>
    React.createElement("img", props),
}));

vi.mock("framer-motion", () => {
  const motion = new Proxy(
    {},
    {
      get: (_target, tag: string) =>
        function MotionStub({
          children,
          ...props
        }: React.HTMLAttributes<HTMLElement> & Record<string, unknown>) {
          const domProps = Object.fromEntries(
            Object.entries(props).filter(
              ([key]) =>
                ![
                  "initial",
                  "animate",
                  "exit",
                  "transition",
                  "whileInView",
                  "viewport",
                  "whileHover",
                ].includes(key),
            ),
          );
          return React.createElement(tag, domProps, children);
        },
    },
  );

  return {
    motion,
  };
});

describe("PerceptualHashingSection", () => {
  it("renders section title and description", () => {
    render(<PerceptualHashingSection />);

    expect(
      screen.getByRole("heading", {
        name: /the visual fingerprint that\s*survives any modification/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders all three cards with titles", () => {
    render(<PerceptualHashingSection />);

    expect(
      screen.getByRole("heading", { name: "Cross-transform invariance" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Weighted Hamming distance" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Zero-retention web audit" }),
    ).toBeInTheDocument();
  });

  it("renders WitchCat and Google images", () => {
    render(<PerceptualHashingSection />);

    const originalImg = screen.getByRole("img", { name: "Original WitchCat" });
    const transformedImg = screen.getByRole("img", {
      name: "Mirrored and Grayscale WitchCat",
    });
    const googleImg = screen.getByRole("img", { name: "Google Serper" });

    expect(originalImg).toHaveAttribute(
      "src",
      "/landing-page-elements/WitchCat.png",
    );
    expect(transformedImg).toHaveAttribute(
      "src",
      "/landing-page-elements/WitchCat.png",
    );
    expect(googleImg).toHaveAttribute(
      "src",
      "/landing-page-elements/google.png",
    );
  });

  it("renders terminal algorithm details and match percentage", () => {
    render(<PerceptualHashingSection />);

    expect(screen.getByText("compare_hashes.py")).toBeInTheDocument();
    expect(screen.getAllByText(/96\.25% Match/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Auto-purged from Cloudinary/i),
    ).toBeInTheDocument();
  });
});
