import { heroScrollMotion } from "@/features/public/home/hero-scroll";

/** Share of the pinned scroll used to finish the hero fade. */
const HERO_PORTION = 0.62;
/** Dashboard copy fades in across the same stretch the hero is leaving. */
const HEADING_START = 0.15;
const HEADING_END = HERO_PORTION;
/** The screenshot starts moving as soon as the page scrolls. */
const IMAGE_START = 0;
const HEADING_LIFT = 36;
/** Scroll, in viewport heights, that plays the hero-to-dashboard animation. */
export const SCENE_ANIMATION_VH = 35;
/** One typical mouse-wheel notch. Four of these hold the finished frame. */
const WHEEL_NOTCH_PX = 200;
export const SCENE_HOLD_NOTCHES = 8;
export const SCENE_HOLD_PX = SCENE_HOLD_NOTCHES * WHEEL_NOTCH_PX;

export const IMAGE_PEEK_FRACTION = 0.16;
export const IMAGE_REVEAL_FRACTION = 0.75;

/** Height of the pinned scene: one screen, the animation, then the hold. */
export function sceneSectionHeight(): string {
  return `calc(100vh + ${SCENE_ANIMATION_VH}vh + ${SCENE_HOLD_PX}px)`;
}

/**
 * Maps pinned-scroll progress so the animation finishes first, then the
 * remaining distance keeps the last frame in place.
 */
export function sceneAnimationProgress(
  progress: number,
  viewportHeight: number,
): number {
  const amount = clamp01(progress);
  if (viewportHeight <= 0) return amount;
  const animationPx = (SCENE_ANIMATION_VH / 100) * viewportHeight;
  const span = animationPx / (animationPx + SCENE_HOLD_PX);
  return clamp01(amount / span);
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * One pinned scroll drives the hero exit, then the dashboard heading
 * and the transactions image.
 * Image fraction is a portion of the screenshot height: a short top peek
 * that travels into place and opens to the reveal crop with the bottom fade.
 */
export function landingSceneMotion(progress: number) {
  const amount = clamp01(progress);
  const imageOpen = clamp01((amount - IMAGE_START) / (1 - IMAGE_START));
  const headingOpen = clamp01(
    (amount - HEADING_START) / (HEADING_END - HEADING_START),
  );
  const imageFraction =
    IMAGE_PEEK_FRACTION +
    (IMAGE_REVEAL_FRACTION - IMAGE_PEEK_FRACTION) * imageOpen;
  const fadeStart = 0.35;

  return {
    hero: heroScrollMotion(clamp01(amount / HERO_PORTION)),
    heading: {
      opacity: headingOpen,
      y: (1 - headingOpen) * HEADING_LIFT,
    },
    imageFraction,
    imageFade: clamp01((imageOpen - fadeStart) / (1 - fadeStart)),
    marqueeOpacity: clamp01((amount - fadeStart) / (1 - fadeStart)),
  };
}

/** Clip height for the screenshot, capped so the heading can stay at the top. */
export function imageClipCss(fraction: number): string {
  const visible = Math.min(IMAGE_REVEAL_FRACTION, Math.max(0, fraction));
  const shown = Math.round(visible * 10000) / 10000;
  return `min(calc(100cqw * 900 / 1280 * ${shown}), calc(100svh - 18rem))`;
}

const VIEWPORT_CAP = 288;

export function imageClipPixels(
  width: number,
  fraction: number,
  viewportHeight = 0,
): number {
  if (width <= 0) return 0;
  const visible = Math.min(IMAGE_REVEAL_FRACTION, Math.max(0, fraction));
  const height = width * (900 / 1280) * visible;
  if (viewportHeight <= 0) return height;
  return Math.min(height, Math.max(0, viewportHeight - VIEWPORT_CAP));
}

/**
 * Moves the screenshot up from the bottom tease so the opened image
 * sits just below the dashboard heading.
 */
export function imageLiftPixels(
  width: number,
  fraction: number,
  viewportHeight: number,
  desiredTop: number,
): number {
  if (width <= 0 || viewportHeight <= 0 || desiredTop <= 0) return 0;
  const open = clamp01(
    (Math.min(IMAGE_REVEAL_FRACTION, Math.max(IMAGE_PEEK_FRACTION, fraction)) -
      IMAGE_PEEK_FRACTION) /
      (IMAGE_REVEAL_FRACTION - IMAGE_PEEK_FRACTION),
  );
  const endHeight = imageClipPixels(
    width,
    IMAGE_REVEAL_FRACTION,
    viewportHeight,
  );
  if (open === 0) return 0;
  const restingTop = viewportHeight - endHeight;
  return Math.min(0, desiredTop - restingTop) * open;
}
