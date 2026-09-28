import * as React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { WireframeBlocks } from "@/features/public/home/components/WireframeBlocks";

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
      () =>
        ({
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
        }) as unknown,
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
});
