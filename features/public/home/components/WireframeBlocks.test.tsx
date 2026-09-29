import * as React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { WireframeBlocks } from "@/features/public/home/components/WireframeBlocks";

function contextStub() {
  const shadowBlurs: number[] = [];
  const ctx = {
    clearRect: vi.fn(),
    setTransform: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    setLineDash: vi.fn(),
    lineDashOffset: 0,
    shadowBlurs,
    set shadowBlur(value: number) {
      shadowBlurs.push(value);
    },
    get shadowBlur() {
      return shadowBlurs.at(-1) ?? 0;
    },
  };
  return ctx;
}

describe("WireframeBlocks", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((cb) => setTimeout(cb, 16)),
    );
    vi.stubGlobal(
      "cancelAnimationFrame",
      vi.fn((id) => clearTimeout(id)),
    );

    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => contextStub(),
    ) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  it("renders a canvas with aria-hidden", () => {
    const { container } = render(<WireframeBlocks />);
    const canvas = container.querySelector("canvas");

    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute("aria-hidden", "true");
  });

  it("accepts custom cube counts and brand colors without throwing", () => {
    const { container } = render(
      <WireframeBlocks
        cubeCount={8}
        primaryColor="rgba(59, 130, 246, 0.45)"
        accentColor="rgba(249, 115, 22, 0.4)"
      />,
    );
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("pauses the frame loop and resumes it", () => {
    const raf = vi.fn(() => 1);
    vi.stubGlobal("requestAnimationFrame", raf);
    const { rerender } = render(<WireframeBlocks paused />);

    expect(raf).not.toHaveBeenCalled();
    expect(document.querySelector("canvas")).toHaveAttribute(
      "data-paused",
      "true",
    );

    rerender(<WireframeBlocks paused={false} />);
    expect(raf).toHaveBeenCalledTimes(1);
  });

  it("draws without glow and caps resolution on a narrow screen", () => {
    const previous = window.matchMedia;
    const previousDpr = window.devicePixelRatio;
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      media: "",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      value: 3,
    });
    const frame: { current: FrameRequestCallback | null } = { current: null };
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      frame.current = cb;
      return 1;
    });
    const ctx = contextStub();
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => ctx,
    ) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    try {
      const { container } = render(
        <WireframeBlocks cubeCount={14} glow maxDpr={2} />,
      );
      const canvas = container.querySelector("canvas");
      expect(canvas).toHaveAttribute("data-resolved-count", "6");
      expect(canvas).toHaveAttribute("data-resolved-glow", "false");
      expect(canvas).toHaveAttribute("data-resolved-dpr", "1");
      expect(canvas?.width).toBe(window.innerWidth);

      frame.current?.(0);
      expect(ctx.shadowBlurs.length).toBeGreaterThan(0);
      expect(ctx.shadowBlurs.every((value) => value === 0)).toBe(true);
    } finally {
      if (previous) window.matchMedia = previous;
      else Reflect.deleteProperty(window, "matchMedia");
      Object.defineProperty(window, "devicePixelRatio", {
        configurable: true,
        value: previousDpr,
      });
    }
  });
});
