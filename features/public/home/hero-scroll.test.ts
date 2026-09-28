import { describe, expect, it } from "vitest";
import { heroScrollMotion } from "@/features/public/home/hero-scroll";

describe("heroScrollMotion", () => {
  it("starts fully visible and uncompressed", () => {
    expect(heroScrollMotion(0)).toEqual({
      y: 0,
      scale: 1,
      opacity: 1,
      maskImage: "linear-gradient(to top, #000 0%, #000 100%)",
    });
  });

  it("lifts, compresses, and clears from the bottom while scrolling", () => {
    const mid = heroScrollMotion(0.5);

    expect(mid.y).toBe(-16);
    expect(mid.scale).toBeCloseTo(0.96);
    expect(mid.opacity).toBeCloseTo(1 - 0.05 / 0.55);
    expect(mid.maskImage).toBe(
      "linear-gradient(to top, transparent 0%, transparent 50%, #000 65%)",
    );
  });

  it("finishes lifted, slightly smaller, and fully faded", () => {
    expect(heroScrollMotion(1)).toEqual({
      y: -32,
      scale: 0.92,
      opacity: 0,
      maskImage:
        "linear-gradient(to top, transparent 0%, transparent 100%, #000 100%)",
    });
  });

  it("clamps progress outside 0 to 1", () => {
    expect(heroScrollMotion(-0.4)).toEqual(heroScrollMotion(0));
    expect(heroScrollMotion(1.8)).toEqual(heroScrollMotion(1));
  });
});
