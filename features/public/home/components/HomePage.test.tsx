import * as React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { HomePage } from "@/features/public/home/components/HomePage";

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
  };
});

beforeAll(() => {
  class IntersectionObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }

  vi.stubGlobal(
    "IntersectionObserver",
    IntersectionObserverStub as unknown as typeof IntersectionObserver,
  );
});

const authState = vi.hoisted(() => ({ isAuthenticated: false }));

vi.mock("@/features/user/auth/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: authState.isAuthenticated }),
}));

vi.mock("@/features/admin/settings/lib/use-site-settings", () => ({
  useSiteSettings: () => ({
    settings: { platform_name: "ArtForgeLab" },
  }),
}));

vi.mock("react-intersection-observer", () => ({
  useInView: () => [() => undefined, true],
}));

describe("HomePage", () => {
  it("renders the home sections and guest calls to action", () => {
    authState.isAuthenticated = false;
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /document your digital artwork/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign Up" })).toHaveAttribute(
      "href",
      "/register",
    );
    expect(screen.getByRole("link", { name: "Get Started" })).toHaveAttribute(
      "href",
      "/register",
    );
    expect(screen.getByText("How It Works")).toBeInTheDocument();
    expect(screen.getByText("Tools for Digital Artists")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Establish Proof of Authorship" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Why Choose ArtForgeLab?")).toBeInTheDocument();
    expect(screen.getByText("Ruzzel")).toBeInTheDocument();
    expect(
      screen.getByText(/everything you need to know about ArtForgeLab/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/perceptual hash for visual similarity detection/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Upload artwork")).toHaveAttribute(
      "href",
      "/upload-artwork",
    );
  });

  it("points signed-in artists at artwork upload", () => {
    authState.isAuthenticated = true;
    render(<HomePage />);

    const uploadLinks = screen
      .getAllByRole("link")
      .filter((link) => link.textContent === "Upload Artwork");
    expect(uploadLinks).toHaveLength(2);
    for (const link of uploadLinks) {
      expect(link).toHaveAttribute("href", "/upload-artwork");
    }
  });

  it("toggles FAQ answers", () => {
    authState.isAuthenticated = false;
    render(<HomePage />);

    const perceptualQuestion = screen.getByRole("button", {
      name: /what is perceptual hashing/i,
    });
    expect(
      screen.queryByText(/compact visual fingerprint/i),
    ).not.toBeInTheDocument();

    fireEvent.click(perceptualQuestion);
    expect(screen.getByText(/compact visual fingerprint/i)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /what is perceptual hashing/i }),
    );
    expect(
      screen.queryByText(/compact visual fingerprint/i),
    ).not.toBeInTheDocument();
  });
});
