import { describe, expect, it } from "vitest";
import { heroScrollMotion } from "@/features/public/home/hero-scroll";
import {
  IMAGE_PEEK_FRACTION,
  IMAGE_REVEAL_FRACTION,
  imageClipCss,
  imageClipPixels,
  imageLiftPixels,
  landingSceneMotion,
} from "@/features/public/home/landing-scene";

describe("landingSceneMotion", () => {
  it("starts with the hero at rest and only a peek of the image", () => {
    const scene = landingSceneMotion(0);

    expect(scene.hero).toEqual(heroScrollMotion(0));
    expect(scene.heading).toEqual({ opacity: 0, y: 36 });
    expect(scene.imageFraction).toBe(IMAGE_PEEK_FRACTION);
    expect(scene.imageFade).toBe(0);
  });

  it("fades the hero while the image is already moving into place", () => {
    const mid = landingSceneMotion(0.31);

    expect(mid.hero).toEqual(heroScrollMotion(0.5));
    expect(mid.heading.opacity).toBe(0);
    expect(mid.imageFraction).toBeGreaterThan(IMAGE_PEEK_FRACTION);
    expect(mid.imageFraction).toBeLessThan(IMAGE_REVEAL_FRACTION);
    expect(mid.imageFade).toBe(0);
  });

  it("ends with the hero gone, the heading in place, and the image cropped", () => {
    const end = landingSceneMotion(1);

    expect(end.hero).toEqual(heroScrollMotion(1));
    expect(end.heading).toEqual({ opacity: 1, y: 0 });
    expect(end.imageFraction).toBe(IMAGE_REVEAL_FRACTION);
    expect(end.imageFade).toBe(1);
  });

  it("clamps progress outside 0 to 1", () => {
    expect(landingSceneMotion(-0.2)).toEqual(landingSceneMotion(0));
    expect(landingSceneMotion(1.4)).toEqual(landingSceneMotion(1));
  });
});

describe("imageClipCss", () => {
  it("caps the screenshot at its reveal height", () => {
    expect(imageClipCss(1)).toBe(
      "min(calc(100cqw * 900 / 1280 * 0.85), calc(100svh - 18rem))",
    );
    expect(imageClipCss(0.16)).toBe(
      "min(calc(100cqw * 900 / 1280 * 0.16), calc(100svh - 18rem))",
    );
  });
});

describe("image placement", () => {
  it("peeks a short strip, then opens to the reveal crop", () => {
    expect(imageClipPixels(0, 0.5, 1080)).toBe(0);
    expect(imageClipPixels(896, IMAGE_PEEK_FRACTION, 1080)).toBeCloseTo(100.8);
    expect(imageClipPixels(896, IMAGE_REVEAL_FRACTION, 1080)).toBeCloseTo(
      535.5,
    );
  });

  it("keeps the peek on the bottom, then lifts the opened image under the heading", () => {
    expect(imageLiftPixels(896, IMAGE_PEEK_FRACTION, 1080, 360)).toBe(0);
    expect(imageLiftPixels(896, IMAGE_REVEAL_FRACTION, 1080, 0)).toBe(0);
    expect(imageLiftPixels(896, IMAGE_REVEAL_FRACTION, 1080, 360)).toBeCloseTo(
      360 - (1080 - 535.5),
    );
  });
});
