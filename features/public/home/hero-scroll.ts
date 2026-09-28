const LIFT_PX = -120;
const SCALE_END = 0.92;
/** Keep the hero solid until this point, then fade the remainder out. */
const OPACITY_FADE_START = 0.45;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Scroll-linked hero motion.
 * Progress 0 is the hero at rest. Progress 1 is the hero scrolled out.
 * The mask clears from the bottom upward so the fade travels bottom to top.
 */
export function heroScrollMotion(progress: number) {
  const amount = clamp01(progress);
  const cleared = Math.round(amount * 100);
  const solidStart = Math.round(
    Math.min(100, cleared + 30 * (1 - amount)),
  );
  const opacity =
    amount <= OPACITY_FADE_START
      ? 1
      : 1 - (amount - OPACITY_FADE_START) / (1 - OPACITY_FADE_START);

  return {
    y: amount === 0 ? 0 : LIFT_PX * amount,
    scale: 1 - (1 - SCALE_END) * amount,
    opacity,
    maskImage:
      amount === 0
        ? "linear-gradient(to top, #000 0%, #000 100%)"
        : `linear-gradient(to top, transparent 0%, transparent ${cleared}%, #000 ${solidStart}%)`,
  };
}
