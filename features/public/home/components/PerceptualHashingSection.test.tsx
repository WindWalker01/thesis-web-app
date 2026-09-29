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
        name: /the visual fingerprint that\s*still matches after edits/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders all three cards with titles", () => {
    render(<PerceptualHashingSection />);

    expect(
      screen.getByRole("heading", { name: "Still matches after flips" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "One score from three checks" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Search the web, then delete the file",
      }),
    ).toBeInTheDocument();
  });

  it("renders WitchCat and Google images", () => {
    render(<PerceptualHashingSection />);

    const originalImg = screen.getByRole("img", { name: "Original WitchCat" });
    const transformedImg = screen.getByRole("img", {
      name: "Mirrored and Grayscale WitchCat",
    });
    const googleImg = screen.getByRole("img", { name: "Google" });

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

    expect(screen.getByText("similarity check")).toBeInTheDocument();
    expect(screen.getAllByText(/96\.25% Match/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Temporary file deleted/i)).toBeInTheDocument();
  });
});
