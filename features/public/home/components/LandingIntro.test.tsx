import * as React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingIntro } from "@/features/public/home/components/LandingIntro";

const reducedMotion = vi.hoisted(() => ({ current: false }));

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
                ].includes(key),
            ),
          );
          return React.createElement(tag, domProps, children);
        },
    },
  );

  return {
    motion,
    useReducedMotion: () => reducedMotion.current,
    useScroll: () => ({ scrollYProgress: 0 }),
    useTransform: (value: unknown, transform: (input: unknown) => unknown) =>
      transform(value),
  };
});

beforeAll(() => {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  vi.stubGlobal(
    "ResizeObserver",
    ResizeObserverStub as unknown as typeof ResizeObserver,
  );
});

describe("LandingIntro", () => {
  it("renders the hero and the dashboard heading together", () => {
    reducedMotion.current = false;
    render(<LandingIntro />);

    expect(
      screen.getByRole("heading", { name: /document your digital artwork/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /artwork evidence, sealed on the blockchain/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Polygonscan contract transactions" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Next.js").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Polygon").length).toBeGreaterThan(0);
    const marquee = screen.getByRole("region", { name: "Technologies used" });
    expect(marquee.closest(".sticky")).not.toBeNull();
    expect(marquee.parentElement).toHaveStyle({ opacity: "0" });
    expect(
      screen.getByRole("heading", {
        name: /artwork evidence, sealed on the blockchain/i,
      }).parentElement,
    ).toHaveClass("flex-col", "lg:flex-row");
  });

  it("uses a lighter wireframe on small screens and the full one on wide screens", () => {
    reducedMotion.current = false;
    const previous = window.matchMedia;

    const media = (matches: boolean) => () => ({
      matches,
      media: "",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    try {
      vi.stubGlobal("matchMedia", media(true));
      const narrow = render(<LandingIntro />);
      const narrowCanvas = narrow.container.querySelector("canvas");
      expect(narrowCanvas).toHaveAttribute("data-cube-count", "6");
      expect(narrowCanvas).toHaveAttribute("data-glow", "false");
      expect(narrowCanvas).toHaveAttribute("data-max-dpr", "1");
      narrow.unmount();

      vi.stubGlobal("matchMedia", media(false));
      const wide = render(<LandingIntro />);
      const wideCanvas = wide.container.querySelector("canvas");
      expect(wideCanvas).toHaveAttribute("data-cube-count", "14");
      expect(wideCanvas).toHaveAttribute("data-glow", "true");
      expect(wideCanvas).toHaveAttribute("data-max-dpr", "2");
      wide.unmount();
    } finally {
      if (previous) {
        window.matchMedia = previous;
      } else {
        Reflect.deleteProperty(window, "matchMedia");
      }
    }
  });

  it("shows the cropped dashboard image when motion is reduced", () => {
    reducedMotion.current = true;
    render(<LandingIntro />);

    const uploadLink = screen.getByRole("link", {
      name: "TRY UPLOADING ARTWORK",
    });
    expect(uploadLink).toHaveAttribute("href", "upload-artwork");
    expect(uploadLink).toHaveClass("text-white");
    expect(uploadLink).toHaveStyle({
      clipPath:
        "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)",
    });
    expect(
      screen.getByRole("img", { name: "Polygonscan contract transactions" }),
    ).toBeInTheDocument();
  });
});
