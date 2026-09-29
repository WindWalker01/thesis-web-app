import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FaqSection } from "@/features/public/home/components/FaqSection";

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
                ].includes(key),
            ),
          );
          return React.createElement(tag, domProps, children);
        },
    },
  );

  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useReducedMotion: () => false,
  };
});

describe("FaqSection", () => {
  it("opens the first answer and switches to another question", () => {
    const { container } = render(<FaqSection />);
    const section = container.querySelector("#faq-section");

    expect(
      screen.getByRole("heading", { name: "Frequently asked questions" }),
    ).toBeInTheDocument();
    expect(section?.className).toContain("mt-16");
    expect(section?.className).toContain("md:mt-24");
    expect(section?.innerHTML).not.toMatch(/orange|amber/);
    expect(section?.innerHTML).toContain("border-blue-400/70");

    const registration = screen.getByRole("button", {
      name: "How does artwork registration work?",
    });
    expect(registration).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByText(/two types of digital fingerprints/i),
    ).toBeInTheDocument();

    const hashing = screen.getByRole("button", {
      name: "What is perceptual hashing and how does it detect similar artworks?",
    });
    expect(hashing).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(hashing);
    expect(hashing).toHaveAttribute("aria-expanded", "true");
    expect(registration).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText(/compact visual fingerprint/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/two types of digital fingerprints/i),
    ).not.toBeInTheDocument();

    fireEvent.click(hashing);
    expect(hashing).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByText(/compact visual fingerprint/i),
    ).not.toBeInTheDocument();
  });
});
