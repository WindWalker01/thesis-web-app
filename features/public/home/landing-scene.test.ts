import { describe, expect, it } from "vitest";
import { heroScrollMotion } from "@/features/public/home/hero-scroll";
import {
  IMAGE_PEEK_FRACTION,
  IMAGE_REVEAL_FRACTION,
  imageClipCss,
  imageClipPixels,
  imageLiftPixels,
  landingSceneMotion,
  SCENE_ANIMATION_VH,
  SCENE_HOLD_PX,
  sceneAnimationProgress,
  sceneSectionHeight,
} from "@/features/public/home/landing-scene";

describe("landingSceneMotion", () => {
  it("starts with the hero at rest and only a peek of the image", () => {
    const scene = landingSceneMotion(0);

    expect(scene.hero).toEqual(heroScrollMotion(0));
    expect(scene.heading).toEqual({ opacity: 0, y: 36 });
    expect(scene.imageFraction).toBe(IMAGE_PEEK_FRACTION);
    expect(scene.imageFade).toBe(0);
  });

  it("fades the hero while the dashboard heading is arriving", () => {
    const mid = landingSceneMotion(0.31);

    expect(mid.hero).toEqual(heroScrollMotion(0.5));
    expect(mid.heading.opacity).toBeGreaterThan(0);
    expect(mid.heading.opacity).toBeLessThan(1);
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

describe("scene hold", () => {
  it("gives the pinned scene one screen, the animation, then the wheel-notch hold", () => {
    expect(sceneSectionHeight()).toBe(
      `calc(100vh + ${SCENE_ANIMATION_VH}vh + ${SCENE_HOLD_PX}px)`,
    );
    expect(SCENE_HOLD_PX).toBe(2400);
  });

  it("finishes the animation before the hold and then stays on the last frame", () => {
    const viewport = 1000;
    const animationPx = (SCENE_ANIMATION_VH / 100) * viewport;
    const end = animationPx / (animationPx + SCENE_HOLD_PX);

    expect(sceneAnimationProgress(0, viewport)).toBe(0);
    expect(sceneAnimationProgress(end / 2, viewport)).toBeCloseTo(0.5);
    expect(sceneAnimationProgress(end, viewport)).toBe(1);
    expect(sceneAnimationProgress(end + 0.2, viewport)).toBe(1);
    expect(sceneAnimationProgress(1, viewport)).toBe(1);
  });

  it("uses the raw progress until the viewport height is known", () => {
    expect(sceneAnimationProgress(0.4, 0)).toBe(0.4);
  });
});

describe("imageClipCss", () => {
  it("caps the screenshot at its reveal height", () => {
    expect(imageClipCss(1)).toBe(
      "min(calc(100cqw * 900 / 1280 * 0.75), calc(100svh - 18rem))",
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
      472.5,
    );
  });

  it("keeps the peek on the bottom, then lifts the opened image under the heading", () => {
    expect(imageLiftPixels(896, IMAGE_PEEK_FRACTION, 1080, 360)).toBe(0);
    expect(imageLiftPixels(896, IMAGE_REVEAL_FRACTION, 1080, 0)).toBe(0);
    expect(imageLiftPixels(896, IMAGE_REVEAL_FRACTION, 1080, 360)).toBeCloseTo(
      360 - (1080 - 472.5),
    );
  });
});
